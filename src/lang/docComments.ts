export interface DocTag {
  tag: string;
  name?: string;
  description: string;
}

export interface ParsedDocComment {
  description: string;
  tags: DocTag[];
}

function normalizeDocComment(raw: string): string[] {
  let text = raw.trim();
  if (text.startsWith('/**')) text = text.slice(3, text.endsWith('*/') ? -2 : undefined);

  return text
    .split(/\r?\n/)
    .map(line => line
      .replace(/^\s*\/\/\//, '')
      .replace(/^\s*\*/, '')
      .replace(/^\s+/, '')
      .trimEnd())
    .join('\n')
    .trim()
    .split('\n');
}

export function parseDocComment(raw?: string): ParsedDocComment {
  if (!raw) return { description: '', tags: [] };

  const description: string[] = [];
  const tags: DocTag[] = [];
  let activeTag: DocTag | undefined;

  for (const line of normalizeDocComment(raw)) {
    const tagMatch = line.match(/^@([\w-]+)\b(?:\s+(.*))?$/);
    if (tagMatch) {
      const tag = tagMatch[1].toLowerCase();
      let value = (tagMatch[2] || '').trim();
      let name: string | undefined;
      if (tag === 'param' || tag === 'arg' || tag === 'argument' || tag === 'typeparam' || tag === 'template') {
        value = value.replace(/^\{[^}]*\}\s*/, '');
        const nameMatch = value.match(/^(?:<([^>]+)>|\[([^\]=]+)(?:=[^\]]+)?\]|([^\s-]+))(?:\s+-?\s*)?(.*)$/);
        if (nameMatch) {
          name = nameMatch[1] || nameMatch[2] || nameMatch[3];
          value = nameMatch[4] || '';
        }
      }
      activeTag = { tag, name, description: value };
      tags.push(activeTag);
      continue;
    }

    if (activeTag) {
      activeTag.description = [activeTag.description, line.trim()].filter(Boolean).join('\n');
    } else {
      description.push(line);
    }
  }

  return { description: description.join('\n').trim(), tags };
}

export function getParameterDoc(raw: string | undefined, name: string): string | undefined {
  const aliases = new Set(['param', 'arg', 'argument']);
  return parseDocComment(raw).tags.find(tag => aliases.has(tag.tag) && tag.name === name)?.description || undefined;
}

export function renderDocComment(raw: string | undefined, parameterNames: string[] = []): string | undefined {
  if (!raw) return undefined;
  const parsed = parseDocComment(raw);
  const sections: string[] = [];
  if (parsed.description) sections.push(parsed.description);

  const params = new Map(parsed.tags
    .filter(tag => ['param', 'arg', 'argument'].includes(tag.tag) && tag.name)
    .map(tag => [tag.name!, tag.description]));
  const documentedParams = parameterNames.filter(name => params.has(name));
  if (documentedParams.length) {
    sections.push(`**Parameters**\n${documentedParams.map(name => `- \`${name}\`: ${params.get(name)}`).join('\n')}`);
  }

  const renderTag = (tag: DocTag): string => {
    switch (tag.tag) {
      case 'return':
      case 'returns': return tag.description ? `**Returns**\n${tag.description}` : '';
      case 'throws':
      case 'exception': return `**Throws**${tag.name ? ` \`${tag.name}\`` : ''}${tag.description ? `\n${tag.description}` : ''}`;
      case 'example': return `**Example**\n\n\`\`\`typelang\n${tag.description}\n\`\`\``;
      case 'deprecated': return `> **Deprecated.** ${tag.description}`;
      case 'since': return `*Since ${tag.description}*`;
      case 'see': return `**See also:** ${tag.description}`;
      case 'typeparam':
      case 'template': return tag.name ? `- Type parameter \`${tag.name}\`: ${tag.description}` : '';
      default: return `**@${tag.tag}${tag.name ? ` ${tag.name}` : ''}**${tag.description ? `\n${tag.description}` : ''}`;
    }
  };

  for (const tag of parsed.tags) {
    if (['param', 'arg', 'argument'].includes(tag.tag)) continue;
    const rendered = renderTag(tag);
    if (rendered) sections.push(rendered);
  }

  return sections.join('\n\n') || undefined;
}

export function formatDocComment(raw: string): string {
  return normalizeDocComment(raw).map(line => `///${line ? ` ${line}` : ''}`).join('\n');
}