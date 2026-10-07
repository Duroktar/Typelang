import React, { useState, useEffect } from 'react';
import { taskManager, TaskItem } from '../lang/taskManager';
import { X, Play, Square, CheckCircle2, AlertCircle, StopCircle, Trash2, Cpu, RefreshCw, Activity, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TaskManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TaskManagerModal: React.FC<TaskManagerModalProps> = ({ isOpen, onClose }) => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);

  useEffect(() => {
    const unsubscribe = taskManager.subscribe((updatedTasks) => {
      setTasks(updatedTasks);
    });
    return unsubscribe;
  }, []);

  if (!isOpen) return null;

  const runningTasks = tasks.filter(t => t.status === 'running');
  const finishedTasks = tasks.filter(t => t.status !== 'running');

  const getTypeColor = (type: TaskItem['type']) => {
    switch (type) {
      case 'eval': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'typecheck': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'codegen': return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'example': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'format': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const formatDuration = (task: TaskItem) => {
    if (task.durationMs !== undefined) {
      return `${task.durationMs}ms`;
    }
    if (task.status === 'running') {
      const elapsed = Math.max(0, Math.round((Date.now() - task.startTime) / 100) / 10);
      return `${elapsed}s`;
    }
    return '--';
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden text-slate-200"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/90">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-md">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base font-bold text-white tracking-wide">TypeLang Task Manager</h2>
                  {runningTasks.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                      <span>{runningTasks.length} Active</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Web Worker async thread monitor & task killer
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800/50 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-4 text-slate-400">
              <span className="flex items-center space-x-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                <span>Worker Threads: <strong className="text-slate-200">Active</strong></span>
              </span>
              <span className="flex items-center space-x-1.5 hidden sm:flex">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Main Thread: <strong className="text-emerald-400">Non-blocking</strong></span>
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {runningTasks.length > 0 && (
                <button
                  onClick={() => taskManager.killAllTasks()}
                  className="flex items-center space-x-1.5 px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                  title="Kill all active background workers immediately"
                >
                  <Square className="w-3 h-3 fill-current text-rose-400" />
                  <span>Kill All ({runningTasks.length})</span>
                </button>
              )}
              {finishedTasks.length > 0 && (
                <button
                  onClick={() => taskManager.clearHistory()}
                  className="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-lg text-[11px] transition-colors cursor-pointer"
                  title="Clear finished task history"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear History</span>
                </button>
              )}
            </div>
          </div>

          {/* Content List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[60vh]">
            {/* Running Tasks */}
            {runningTasks.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2 flex items-center space-x-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Running Tasks ({runningTasks.length})</span>
                </h3>
                <div className="space-y-2">
                  {runningTasks.map(task => (
                    <div
                      key={task.id}
                      className="p-3 bg-indigo-950/20 border border-indigo-500/30 rounded-xl flex items-center justify-between gap-3 shadow-md"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                          <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-white text-xs truncate">{task.name}</span>
                            <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded border uppercase ${getTypeColor(task.type)}`}>
                              {task.type}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center space-x-2">
                            <span>Started: {new Date(task.startTime).toLocaleTimeString()}</span>
                            <span>•</span>
                            <span className="text-indigo-300 font-mono font-bold">{formatDuration(task)}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => taskManager.killTask(task.id)}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold text-xs shadow hover:shadow-rose-600/30 flex items-center space-x-1.5 shrink-0 cursor-pointer transition-colors"
                        title="Kill this running worker task"
                      >
                        <Square className="w-3 h-3 fill-current" />
                        <span>Kill Task</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Finished Tasks */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Task History ({finishedTasks.length})
              </h3>
              {finishedTasks.length === 0 && runningTasks.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                  No tasks recorded yet. Run code or load an example to view worker tasks.
                </div>
              ) : (
                <div className="space-y-2">
                  {finishedTasks.map(task => (
                    <div
                      key={task.id}
                      className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        {task.status === 'completed' && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                        {task.status === 'failed' && (
                          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                        {task.status === 'cancelled' && (
                          <StopCircle className="w-4 h-4 text-amber-400 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-slate-200 truncate">{task.name}</span>
                            <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded border uppercase ${getTypeColor(task.type)}`}>
                              {task.type}
                            </span>
                          </div>
                          {task.error ? (
                            <p className="text-[11px] text-rose-400 mt-0.5 truncate">{task.error}</p>
                          ) : (
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Duration: <span className="font-mono text-slate-300 font-bold">{formatDuration(task)}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
                          task.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          task.status === 'failed' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                          'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400">
            <span>Press <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-300 font-mono">Escape</kbd> to stop all execution</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
