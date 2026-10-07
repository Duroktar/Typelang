import React, { useState, useEffect, useRef } from 'react';
import { Terminal, ChevronUp, ChevronDown, X, Clock, AlertCircle, CheckCircle2, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MiniConsoleProps {
  stdout: string[];
  executionTimeMs?: number;
  error?: string | null;
  onClear: () => void;
  onStop?: () => void;
  isRunning?: boolean;
}

export const MiniConsole: React.FC<MiniConsoleProps> = ({ stdout, executionTimeMs, error, onClear, onStop, isRunning }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && isExpanded) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [stdout, error, isExpanded]);

  if (stdout.length === 0 && !error) return null;

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="absolute bottom-0 left-0 right-0 z-50 flex flex-col bg-slate-950 border-t border-slate-800 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]"
    >
      {/* Console Header */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Execution Console</span>
          {executionTimeMs !== undefined && (
            <span className="flex items-center space-x-1 text-[9px] text-slate-500 font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
              <Clock className="w-2.5 h-2.5" />
              <span>{executionTimeMs.toFixed(1)}ms</span>
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1.5">
          {onStop && (
            <button
              onClick={onStop}
              className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60 flex items-center space-x-1 transition-colors cursor-pointer"
              title="Stop Execution & Halt Loops/Audio (Escape)"
            >
              <Square className="w-2.5 h-2.5 fill-current text-rose-400" />
              <span>Stop</span>
            </button>
          )}
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-slate-800 rounded text-slate-500 transition-colors"
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
          <button 
            onClick={onClear}
            className="p-1 hover:bg-slate-800 rounded text-slate-500 transition-colors"
            title="Clear Console"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Console Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: 140 }}
            exit={{ height: 0 }}
            ref={scrollRef}
            className="overflow-y-auto font-mono text-[11px] p-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent"
          >
            {stdout.length > 0 ? (
              stdout.map((line, idx) => (
                <div key={idx} className="flex items-start space-x-2">
                  <span className="text-slate-600 select-none shrink-0 w-3">{idx + 1}</span>
                  <span className="text-emerald-400 break-all leading-relaxed">{line}</span>
                </div>
              ))
            ) : !error && (
              <div className="flex items-center space-x-2 text-slate-500 italic">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Program executed successfully with no output.</span>
              </div>
            )}

            {error && (
              <div className="flex items-start space-x-2 p-2 mt-2 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <span className="text-rose-300 leading-relaxed font-bold">{error}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
