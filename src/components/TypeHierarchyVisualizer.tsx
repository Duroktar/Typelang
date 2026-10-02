import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import {
  Network,
  GitBranch,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  Download,
  Filter,
  Layers,
  Box,
  Braces,
  Code2,
  Sparkles,
  ArrowRight,
  Info,
  Check,
  Copy,
  ChevronRight,
  Share2,
  Cpu,
  Target,
  FileCode,
  Radio,
  Eye
} from 'lucide-react';
import { TypeEnv } from '../lang/checker';
import { Program } from '../lang/ast';
import {
  buildTypeHierarchy,
  TypeGraphNode,
  TypeGraphLink,
  TypeHierarchyData,
  TypeNodeCategory
} from '../lang/typeHierarchy';

interface TypeHierarchyVisualizerProps {
  typeEnv: TypeEnv | null;
  programAST: Program | null;
  code: string;
  onSelectSymbol?: (symbolName: string) => void;
}

type ViewMode = 'tree' | 'force' | 'radial';

// Category aesthetic definition
const CATEGORY_STYLES: Record<TypeNodeCategory, {
  color: string;
  glow: string;
  bg: string;
  border: string;
  iconLabel: string;
}> = {
  root: {
    color: '#818cf8',
    glow: 'rgba(129, 140, 248, 0.4)',
    bg: 'rgba(99, 102, 241, 0.15)',
    border: '#6366f1',
    iconLabel: 'Ω'
  },
  category: {
    color: '#94a3b8',
    glow: 'rgba(148, 163, 184, 0.3)',
    bg: 'rgba(30, 41, 59, 0.8)',
    border: '#475569',
    iconLabel: '☰'
  },
  gadt: {
    color: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.5)',
    bg: 'rgba(14, 165, 233, 0.15)',
    border: '#0284c7',
    iconLabel: '∑'
  },
  constructor: {
    color: '#c084fc',
    glow: 'rgba(192, 132, 252, 0.45)',
    bg: 'rgba(168, 85, 247, 0.15)',
    border: '#9333ea',
    iconLabel: '✦'
  },
  record: {
    color: '#34d399',
    glow: 'rgba(52, 211, 153, 0.45)',
    bg: 'rgba(16, 185, 129, 0.15)',
    border: '#059669',
    iconLabel: '{ }'
  },
  field: {
    color: '#6ee7b7',
    glow: 'rgba(110, 231, 183, 0.35)',
    bg: 'rgba(5, 150, 105, 0.1)',
    border: '#047857',
    iconLabel: '▪'
  },
  function: {
    color: '#fbbf24',
    glow: 'rgba(251, 191, 36, 0.45)',
    bg: 'rgba(245, 158, 11, 0.15)',
    border: '#d97706',
    iconLabel: 'λ'
  },
  param: {
    color: '#cbd5e1',
    glow: 'rgba(203, 213, 225, 0.25)',
    bg: 'rgba(51, 65, 85, 0.3)',
    border: '#64748b',
    iconLabel: '→'
  },
  variable: {
    color: '#a78bfa',
    glow: 'rgba(167, 139, 250, 0.45)',
    bg: 'rgba(139, 92, 246, 0.15)',
    border: '#7c3aed',
    iconLabel: 'var'
  },
  module: {
    color: '#fb7185',
    glow: 'rgba(251, 113, 133, 0.45)',
    bg: 'rgba(244, 63, 94, 0.15)',
    border: '#e11d48',
    iconLabel: 'mod'
  },
  primitive: {
    color: '#60a5fa',
    glow: 'rgba(96, 165, 250, 0.4)',
    bg: 'rgba(37, 99, 235, 0.15)',
    border: '#2563eb',
    iconLabel: 'prim'
  },
  type_param: {
    color: '#f472b6',
    glow: 'rgba(244, 114, 182, 0.4)',
    bg: 'rgba(236, 72, 153, 0.15)',
    border: '#db2777',
    iconLabel: 'α'
  }
};

export const TypeHierarchyVisualizer: React.FC<TypeHierarchyVisualizerProps> = ({
  typeEnv,
  programAST,
  code,
  onSelectSymbol
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>('tree');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedNode, setSelectedNode] = useState<TypeGraphNode | null>(null);
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [copied, setCopied] = useState<boolean>(false);
  const [showEdgeLabels, setShowEdgeLabels] = useState<boolean>(true);

  // Extract hierarchy data
  const hierarchyData: TypeHierarchyData = useMemo(() => {
    return buildTypeHierarchy(typeEnv, programAST, code);
  }, [typeEnv, programAST, code]);

  // Handle Zoom In, Out, Reset
  const handleZoomIn = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(zoomBehaviorRef.current.scaleBy, 1.3);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(zoomBehaviorRef.current.scaleBy, 0.75);
    }
  };

  const handleResetZoom = useCallback(() => {
    if (svgRef.current && zoomBehaviorRef.current && containerRef.current) {
      const width = containerRef.current.clientWidth || 800;
      const height = containerRef.current.clientHeight || 600;

      d3.select(svgRef.current)
        .transition()
        .duration(450)
        .call(
          zoomBehaviorRef.current.transform,
          d3.zoomIdentity.translate(viewMode === 'radial' ? width / 2 : 100, height / 2).scale(viewMode === 'radial' ? 0.75 : 0.9)
        );
    }
  }, [viewMode]);

  // Toggle Collapse / Expand node in Tree View
  const toggleNodeCollapse = (nodeId: string) => {
    setCollapsedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  // Export diagram to SVG
  const handleExportSVG = () => {
    if (!svgRef.current) return;
    const svgClone = svgRef.current.cloneNode(true) as SVGSVGElement;
    svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const svgData = new XMLSerializer().serializeToString(svgClone);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `typelang_type_hierarchy_${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Main D3 Rendering Engine
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 900;
    const height = containerRef.current.clientHeight || 650;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clean slate

    // SVG Defs: Gradients, Filters, Glows, Arrow Markers
    const defs = svg.append('defs');

    // Background Dot Pattern
    const pattern = defs.append('pattern')
      .attr('id', 'type-grid-pattern')
      .attr('width', 24)
      .attr('height', 24)
      .attr('patternUnits', 'userSpaceOnUse');

    pattern.append('circle')
      .attr('cx', 12)
      .attr('cy', 12)
      .attr('r', 1)
      .attr('fill', '#334155')
      .attr('opacity', 0.4);

    // Glow Filter
    const filter = defs.append('filter')
      .attr('id', 'node-glow')
      .attr('x', '-30%')
      .attr('y', '-30%')
      .attr('width', '160%')
      .attr('height', '160%');

    filter.append('feGaussianBlur')
      .attr('stdDeviation', 4)
      .attr('result', 'blur');

    filter.append('feComposite')
      .attr('in', 'SourceGraphic')
      .attr('in2', 'blur')
      .attr('operator', 'over');

    // Arrow markers for links
    defs.append('marker')
      .attr('id', 'arrow-head')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 22)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-4L8,0L0,4')
      .attr('fill', '#6366f1')
      .attr('opacity', 0.7);

    defs.append('marker')
      .attr('id', 'arrow-head-amber')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 22)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-4L8,0L0,4')
      .attr('fill', '#f59e0b')
      .attr('opacity', 0.8);

    // Canvas Background
    svg.append('rect')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', 'url(#type-grid-pattern)');

    // Zoom container
    const g = svg.append('g').attr('class', 'main-zoom-group');
    gRef.current = g.node();

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.15, 3.5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
    zoomBehaviorRef.current = zoom;

    // Search query helper
    const isMatched = (node: TypeGraphNode) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        node.name.toLowerCase().includes(q) ||
        node.label.toLowerCase().includes(q) ||
        node.typeString.toLowerCase().includes(q) ||
        node.category.toLowerCase().includes(q)
      );
    };

    // Category filter helper
    const matchesCategory = (category: TypeNodeCategory) => {
      if (activeCategoryFilter === 'all') return true;
      if (activeCategoryFilter === 'gadt') return category === 'gadt' || category === 'constructor';
      if (activeCategoryFilter === 'record') return category === 'record' || category === 'field';
      if (activeCategoryFilter === 'function') return category === 'function' || category === 'param';
      if (activeCategoryFilter === 'variable') return category === 'variable';
      if (activeCategoryFilter === 'primitive') return category === 'primitive';
      return true;
    };

    // =========================================================================
    // VIEW MODE 1: TIDY HIERARCHY TREE
    // =========================================================================
    if (viewMode === 'tree') {
      // Build D3 Hierarchy with collapsed node filtering
      const cloneTree = (node: TypeGraphNode): TypeGraphNode => {
        const isCollapsed = collapsedNodes.has(node.id);
        const copy: TypeGraphNode = { ...node };
        if (node.children && !isCollapsed) {
          copy.children = node.children
            .filter(child => matchesCategory(child.category))
            .map(cloneTree);
        } else {
          copy.children = undefined;
        }
        return copy;
      };

      const treeData = cloneTree(hierarchyData.root);
      const root = d3.hierarchy<TypeGraphNode>(treeData);

      // Node count calculation for adaptive tree height
      const nodeCount = root.descendants().length;
      const dx = 42; // Vertical separation
      const dy = 230; // Horizontal separation
      const treeLayout = d3.tree<TypeGraphNode>().nodeSize([dx, dy]);
      treeLayout(root);

      // Links with glowing horizontal Bezier curves
      const linkGenerator = d3.linkHorizontal<any, any>()
        .x(d => d.y)
        .y(d => d.x);

      const linksG = g.append('g').attr('class', 'tree-links');

      linksG.selectAll('path')
        .data(root.links())
        .enter()
        .append('path')
        .attr('d', linkGenerator)
        .attr('fill', 'none')
        .attr('stroke', (d: any) => {
          const cat = d.target.data.category as TypeNodeCategory;
          return CATEGORY_STYLES[cat]?.color || '#475569';
        })
        .attr('stroke-width', 1.8)
        .attr('stroke-opacity', (d: any) => {
          const matchTarget = isMatched(d.target.data);
          const matchSource = isMatched(d.source.data);
          return matchTarget && matchSource ? 0.65 : 0.12;
        });

      // Nodes Group
      const nodesG = g.append('g').attr('class', 'tree-nodes');

      const nodeGroup = nodesG.selectAll('g')
        .data(root.descendants())
        .enter()
        .append('g')
        .attr('transform', (d: any) => `translate(${d.y},${d.x})`)
        .attr('class', 'cursor-pointer')
        .on('click', (event, d: any) => {
          event.stopPropagation();
          setSelectedNode(d.data);
          if (d.data.children || d.data._children || hierarchyData.nodes.find(n => n.id === d.data.id)?.children?.length) {
            toggleNodeCollapse(d.data.id);
          }
          if (onSelectSymbol && d.data.name) {
            onSelectSymbol(d.data.name);
          }
        });

      // Node background pill
      nodeGroup.each(function (d: any) {
        const nodeEl = d3.select(this);
        const data = d.data as TypeGraphNode;
        const style = CATEGORY_STYLES[data.category] || CATEGORY_STYLES.variable;
        const matched = isMatched(data);
        const isSelected = selectedNode?.id === data.id;
        const hasChildren = (data.children && data.children.length > 0) || collapsedNodes.has(data.id);
        const isCollapsed = collapsedNodes.has(data.id);

        // Approximate label width
        const labelText = data.label;
        const textWidth = Math.min(220, Math.max(70, labelText.length * 7.2 + 28));

        // Glow halo when selected or matched
        if (isSelected || (searchQuery.trim() && matched)) {
          nodeEl.append('rect')
            .attr('x', -10)
            .attr('y', -16)
            .attr('width', textWidth + 24)
            .attr('height', 32)
            .attr('rx', 16)
            .attr('fill', 'none')
            .attr('stroke', isSelected ? '#38bdf8' : '#fbbf24')
            .attr('stroke-width', 2.5)
            .attr('filter', 'url(#node-glow)');
        }

        // Pill base
        nodeEl.append('rect')
          .attr('x', -6)
          .attr('y', -13)
          .attr('width', textWidth + 16)
          .attr('height', 26)
          .attr('rx', 13)
          .attr('fill', isSelected ? '#1e293b' : style.bg)
          .attr('stroke', isSelected ? '#38bdf8' : style.border)
          .attr('stroke-width', isSelected ? 1.8 : 1)
          .attr('opacity', matched ? 1 : 0.3)
          .attr('class', 'transition-all duration-200');

        // Category Icon Circle
        nodeEl.append('circle')
          .attr('cx', 6)
          .attr('cy', 0)
          .attr('r', 8)
          .attr('fill', style.color)
          .attr('opacity', 0.9);

        // Category Icon Glyphs
        nodeEl.append('text')
          .attr('x', 6)
          .attr('y', 3)
          .attr('text-anchor', 'middle')
          .attr('font-size', '8px')
          .attr('font-weight', 'bold')
          .attr('fill', '#090d16')
          .attr('pointer-events', 'none')
          .text(style.iconLabel.substring(0, 2));

        // Node Label
        nodeEl.append('text')
          .attr('x', 20)
          .attr('y', 4)
          .attr('fill', isSelected ? '#ffffff' : matched ? '#f1f5f9' : '#64748b')
          .attr('font-size', '11px')
          .attr('font-family', 'monospace')
          .attr('font-weight', isSelected ? '600' : 'normal')
          .text(labelText.length > 28 ? labelText.substring(0, 26) + '…' : labelText);

        // Collapse / Expand Badge
        if (hasChildren) {
          const badgeX = textWidth + 14;
          nodeEl.append('circle')
            .attr('cx', badgeX)
            .attr('cy', 0)
            .attr('r', 6)
            .attr('fill', isCollapsed ? '#f59e0b' : '#334155')
            .attr('stroke', '#475569')
            .attr('stroke-width', 1);

          nodeEl.append('text')
            .attr('x', badgeX)
            .attr('y', 3)
            .attr('text-anchor', 'middle')
            .attr('font-size', '8px')
            .attr('fill', isCollapsed ? '#0f172a' : '#94a3b8')
            .attr('font-weight', 'bold')
            .text(isCollapsed ? '+' : '−');
        }
      });

      // Initial center
      svg.call(
        zoom.transform,
        d3.zoomIdentity.translate(80, height / 2).scale(0.85)
      );
    }

    // =========================================================================
    // VIEW MODE 2: FORCE-DIRECTED RELATIONAL NETWORK
    // =========================================================================
    else if (viewMode === 'force') {
      // Filter active nodes according to category & query
      const activeNodes = hierarchyData.nodes.filter(n => {
        if (n.category === 'root' || n.category === 'category') return false;
        return matchesCategory(n.category);
      });

      const activeNodeIds = new Set(activeNodes.map(n => n.id));
      const activeLinks = hierarchyData.links.filter(l => 
        activeNodeIds.has(typeof l.source === 'string' ? l.source : (l.source as any).id) &&
        activeNodeIds.has(typeof l.target === 'string' ? l.target : (l.target as any).id)
      );

      // Force Simulation
      const simulation = d3.forceSimulation<any>(activeNodes)
        .force('link', d3.forceLink<any, any>(activeLinks).id(d => d.id).distance(120).strength(0.7))
        .force('charge', d3.forceManyBody().strength(-280))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(40));

      // Edges Group
      const linkG = g.append('g').attr('class', 'force-links');
      const edge = linkG.selectAll('line')
        .data(activeLinks)
        .enter()
        .append('line')
        .attr('stroke', (d: any) => {
          if (d.kind === 'constructs') return '#a855f7';
          if (d.kind === 'returns') return '#f59e0b';
          if (d.kind === 'field_of') return '#10b981';
          return '#6366f1';
        })
        .attr('stroke-opacity', 0.5)
        .attr('stroke-width', 1.6)
        .attr('marker-end', (d: any) => d.kind === 'returns' ? 'url(#arrow-head-amber)' : 'url(#arrow-head)');

      // Optional Edge Labels
      let edgeLabels: any = null;
      if (showEdgeLabels) {
        edgeLabels = linkG.selectAll('text')
          .data(activeLinks)
          .enter()
          .append('text')
          .attr('fill', '#94a3b8')
          .attr('font-size', '9px')
          .attr('font-family', 'monospace')
          .attr('text-anchor', 'middle')
          .attr('opacity', 0.75)
          .text((d: any) => d.label);
      }

      // Nodes Group
      const nodeG = g.append('g').attr('class', 'force-nodes');
      const node = nodeG.selectAll('g')
        .data(activeNodes)
        .enter()
        .append('g')
        .attr('class', 'cursor-grab active:cursor-grabbing')
        .call(
          d3.drag<any, any>()
            .on('start', (event, d) => {
              if (!event.active) simulation.alphaTarget(0.3).restart();
              d.fx = d.x;
              d.fy = d.y;
            })
            .on('drag', (event, d) => {
              d.fx = event.x;
              d.fy = event.y;
            })
            .on('end', (event, d) => {
              if (!event.active) simulation.alphaTarget(0);
              d.fx = null;
              d.fy = null;
            })
        )
        .on('click', (event, d) => {
          event.stopPropagation();
          setSelectedNode(d);
          if (onSelectSymbol && d.name) {
            onSelectSymbol(d.name);
          }
        });

      // Render custom node bubbles
      node.each(function (d: any) {
        const nodeEl = d3.select(this);
        const style = CATEGORY_STYLES[d.category as TypeNodeCategory] || CATEGORY_STYLES.variable;
        const matched = isMatched(d);
        const isSelected = selectedNode?.id === d.id;

        // Halo
        if (isSelected || (searchQuery.trim() && matched)) {
          nodeEl.append('circle')
            .attr('r', 22)
            .attr('fill', 'none')
            .attr('stroke', isSelected ? '#38bdf8' : '#fbbf24')
            .attr('stroke-width', 2.5)
            .attr('filter', 'url(#node-glow)');
        }

        // Node Circle
        nodeEl.append('circle')
          .attr('r', 16)
          .attr('fill', isSelected ? '#1e293b' : style.bg)
          .attr('stroke', isSelected ? '#38bdf8' : style.border)
          .attr('stroke-width', isSelected ? 2.5 : 1.5)
          .attr('opacity', matched ? 1 : 0.35);

        // Glyphs
        nodeEl.append('text')
          .attr('y', 4)
          .attr('text-anchor', 'middle')
          .attr('font-size', '10px')
          .attr('font-weight', 'bold')
          .attr('fill', style.color)
          .attr('pointer-events', 'none')
          .text(style.iconLabel.substring(0, 3));

        // Text label underneath
        nodeEl.append('text')
          .attr('y', 27)
          .attr('text-anchor', 'middle')
          .attr('fill', isSelected ? '#38bdf8' : matched ? '#f1f5f9' : '#64748b')
          .attr('font-size', '10px')
          .attr('font-family', 'monospace')
          .attr('font-weight', isSelected ? 'bold' : 'normal')
          .attr('pointer-events', 'none')
          .text(d.name.length > 18 ? d.name.substring(0, 16) + '…' : d.name);
      });

      simulation.on('tick', () => {
        edge
          .attr('x1', (d: any) => d.source.x)
          .attr('y1', (d: any) => d.source.y)
          .attr('x2', (d: any) => d.target.x)
          .attr('y2', (d: any) => d.target.y);

        if (edgeLabels) {
          edgeLabels
            .attr('x', (d: any) => (d.source.x + d.target.x) / 2)
            .attr('y', (d: any) => (d.source.y + d.target.y) / 2 - 4);
        }

        node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
      });

      svg.call(
        zoom.transform,
        d3.zoomIdentity.translate(0, 0).scale(1)
      );
    }

    // =========================================================================
    // VIEW MODE 3: RADIAL DENDROGRAM
    // =========================================================================
    else if (viewMode === 'radial') {
      const root = d3.hierarchy<TypeGraphNode>(hierarchyData.root);
      const radius = Math.min(width, height) * 0.42;

      const cluster = d3.cluster<TypeGraphNode>()
        .size([360, radius])
        .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);

      cluster(root);

      // Radial Projection helpers
      const project = (x: number, y: number): [number, number] => {
        const angle = (x - 90) / 180 * Math.PI;
        const r = y;
        return [r * Math.cos(angle), r * Math.sin(angle)];
      };

      // Curved radial links
      const radialLink = (d: any) => {
        const [sourceX, sourceY] = project(d.source.x, d.source.y);
        const [targetX, targetY] = project(d.target.x, d.target.y);
        return `M${sourceX},${sourceY}Q0,0 ${targetX},${targetY}`;
      };

      const linksG = g.append('g').attr('class', 'radial-links');
      linksG.selectAll('path')
        .data(root.links())
        .enter()
        .append('path')
        .attr('d', radialLink)
        .attr('fill', 'none')
        .attr('stroke', (d: any) => {
          const cat = d.target.data.category as TypeNodeCategory;
          return CATEGORY_STYLES[cat]?.color || '#475569';
        })
        .attr('stroke-width', 1.5)
        .attr('stroke-opacity', 0.45);

      const nodesG = g.append('g').attr('class', 'radial-nodes');
      const node = nodesG.selectAll('g')
        .data(root.descendants())
        .enter()
        .append('g')
        .attr('transform', (d: any) => {
          const [px, py] = project(d.x, d.y);
          return `translate(${px},${py})`;
        })
        .attr('class', 'cursor-pointer')
        .on('click', (event, d: any) => {
          event.stopPropagation();
          setSelectedNode(d.data);
          if (onSelectSymbol && d.data.name) {
            onSelectSymbol(d.data.name);
          }
        });

      node.each(function (d: any) {
        const nodeEl = d3.select(this);
        const style = CATEGORY_STYLES[d.data.category as TypeNodeCategory] || CATEGORY_STYLES.variable;
        const matched = isMatched(d.data);
        const isSelected = selectedNode?.id === d.data.id;

        if (isSelected) {
          nodeEl.append('circle')
            .attr('r', 12)
            .attr('fill', 'none')
            .attr('stroke', '#38bdf8')
            .attr('stroke-width', 2)
            .attr('filter', 'url(#node-glow)');
        }

        nodeEl.append('circle')
          .attr('r', d.depth === 0 ? 9 : 5)
          .attr('fill', style.color)
          .attr('stroke', '#090d16')
          .attr('stroke-width', 1.5)
          .attr('opacity', matched ? 1 : 0.3);

        const isRightSide = d.x < 180;
        nodeEl.append('text')
          .attr('transform', `rotate(${d.x < 180 ? d.x - 90 : d.x + 90}) translate(${isRightSide ? 8 : -8}, 3)`)
          .attr('text-anchor', isRightSide ? 'start' : 'end')
          .attr('fill', isSelected ? '#38bdf8' : matched ? '#e2e8f0' : '#64748b')
          .attr('font-size', d.depth <= 1 ? '11px' : '9px')
          .attr('font-family', 'monospace')
          .attr('font-weight', d.depth <= 1 ? 'bold' : 'normal')
          .text(d.data.name.length > 20 ? d.data.name.substring(0, 18) + '…' : d.data.name);
      });

      svg.call(
        zoom.transform,
        d3.zoomIdentity.translate(width / 2, height / 2).scale(0.85)
      );
    }
  }, [hierarchyData, viewMode, searchQuery, collapsedNodes, activeCategoryFilter, selectedNode, showEdgeLabels]);

  // Copy signature helper
  const handleCopySignature = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 overflow-hidden select-none font-sans relative">
      {/* Top Toolbar Header */}
      <div className="bg-slate-900/90 backdrop-blur-md px-3 py-2 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5 z-20">
        {/* Left: View Mode Switcher & Stats */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 text-indigo-400 font-semibold text-xs pr-2 border-r border-slate-800">
            <GitBranch className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Type Hierarchy</span>
          </div>

          {/* Mode Tabs */}
          <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
            <button
              onClick={() => setViewMode('tree')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded cursor-pointer transition ${
                viewMode === 'tree'
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GitBranch className="w-3 h-3" />
              <span>Dendrogram</span>
            </button>

            <button
              onClick={() => setViewMode('force')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded cursor-pointer transition ${
                viewMode === 'force'
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Network className="w-3 h-3" />
              <span>Relational Graph</span>
            </button>

            <button
              onClick={() => setViewMode('radial')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded cursor-pointer transition ${
                viewMode === 'radial'
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Radio className="w-3 h-3" />
              <span>Radial</span>
            </button>
          </div>
        </div>

        {/* Middle: Search Box */}
        <div className="flex-1 max-w-xs relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search types, constructors, functions..."
            className="w-full pl-8 pr-7 py-1 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1.5 text-slate-500 hover:text-slate-300 text-xs"
            >
              ×
            </button>
          )}
        </div>

        {/* Right: Zoom & Export Controls */}
        <div className="flex items-center space-x-1 text-xs">
          {viewMode === 'force' && (
            <button
              onClick={() => setShowEdgeLabels(!showEdgeLabels)}
              title="Toggle edge relation labels"
              className={`px-2 py-1 rounded border text-[11px] transition cursor-pointer ${
                showEdgeLabels
                  ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Labels
            </button>
          )}

          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleResetZoom}
            title="Center & Reset View"
            className="p-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleExportSVG}
            title="Export High-Res SVG"
            className="flex items-center space-x-1 px-2 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-indigo-300 hover:text-indigo-200 transition cursor-pointer text-[11px]"
          >
            <Download className="w-3 h-3" />
            <span className="hidden sm:inline">SVG</span>
          </button>
        </div>
      </div>

      {/* Secondary Filter & Legend Strip */}
      <div className="bg-slate-900/50 px-3 py-1.5 border-b border-slate-800/60 flex items-center justify-between overflow-x-auto text-[11px] gap-2">
        <div className="flex items-center space-x-1.5">
          <span className="text-slate-500 font-medium text-[10px] uppercase tracking-wider">Filter:</span>
          {(['all', 'gadt', 'record', 'function', 'variable', 'primitive'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategoryFilter(cat)}
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono transition cursor-pointer ${
                activeCategoryFilter === cat
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {cat === 'all' ? 'All' : cat.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Legend Pills */}
        <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono hidden md:flex">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>GADT</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            <span>Ctor</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Record</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Function</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-violet-400"></span>
            <span>Variable</span>
          </span>
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div ref={containerRef} className="flex-1 min-h-0 relative w-full h-full overflow-hidden">
        <svg ref={svgRef} className="w-full h-full block" />

        {/* Empty / Error state notice if no types inferred */}
        {hierarchyData.stats.totalTypes === 0 && hierarchyData.stats.functionCount === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm pointer-events-none">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl max-w-md text-center space-y-2">
              <Sparkles className="w-6 h-6 text-indigo-400 mx-auto" />
              <h4 className="text-slate-200 font-semibold text-sm">Waiting for Compiled Program</h4>
              <p className="text-slate-400 text-xs">
                Write or select a TypeLang program with functions, GADTs, or record types to visualize its type universe in real-time.
              </p>
            </div>
          </div>
        )}

        {/* Selected Node Inspector Floating Drawer */}
        {selectedNode && (
          <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl p-3.5 shadow-2xl z-30 text-xs space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: CATEGORY_STYLES[selectedNode.category]?.bg || 'rgba(99, 102, 241, 0.2)',
                    color: CATEGORY_STYLES[selectedNode.category]?.color || '#818cf8',
                    border: `1px solid ${CATEGORY_STYLES[selectedNode.category]?.border || '#6366f1'}`
                  }}
                >
                  {selectedNode.category}
                </span>
                <span className="font-semibold text-slate-100 truncate max-w-[180px]">
                  {selectedNode.name}
                </span>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-500 hover:text-slate-300 p-1 text-xs"
              >
                ✕
              </button>
            </div>

            {/* Signature Code Box */}
            <div className="relative group">
              <pre className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 font-mono text-[11px] text-amber-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {selectedNode.signature}
              </pre>
              <button
                onClick={() => handleCopySignature(selectedNode.signature)}
                className="absolute right-2 top-2 p-1 rounded bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-slate-200 text-[10px] flex items-center space-x-1"
                title="Copy Signature"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>

            {/* Details and Documentation */}
            {selectedNode.doc && (
              <p className="text-slate-400 text-[11px] leading-relaxed">
                {selectedNode.doc}
              </p>
            )}

            {/* Inferred Kind / Category Metadata */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1 text-slate-400 border-t border-slate-800/60">
              <div>
                <span className="text-slate-500 block">KIND</span>
                <span className="text-indigo-300">{selectedNode.kind || '*'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">CATEGORY</span>
                <span className="text-slate-300 capitalize">{selectedNode.category}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
      <div className="bg-slate-900/90 px-3 py-1.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono z-20">
        <div className="flex items-center space-x-3">
          <span>Total Types: <strong className="text-slate-200">{hierarchyData.stats.totalTypes}</strong></span>
          <span>•</span>
          <span>GADTs: <strong className="text-cyan-400">{hierarchyData.stats.gadtCount}</strong></span>
          <span>•</span>
          <span>Records: <strong className="text-emerald-400">{hierarchyData.stats.recordCount}</strong></span>
          <span>•</span>
          <span>Functions: <strong className="text-amber-400">{hierarchyData.stats.functionCount}</strong></span>
          <span>•</span>
          <span>State: <strong className="text-violet-400">{hierarchyData.stats.variableCount}</strong></span>
        </div>

        <div className="text-[10px] text-slate-500 flex items-center space-x-1.5">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>D3.js Inferred Type Space Engine</span>
        </div>
      </div>
    </div>
  );
};
