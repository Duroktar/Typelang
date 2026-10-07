// Task Manager Service for TypeLang
// Handles offloading tasks to background Web Workers, killing tasks, and tracking task metrics
import { WorkerRequest, WorkerResponse } from './compiler.worker';

export interface TaskItem {
  id: string;
  name: string;
  type: 'typecheck' | 'eval' | 'codegen' | 'example' | 'format' | 'preview';
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: number;
  durationMs?: number;
  error?: string;
  cancelFn?: () => void;
}

type TaskListener = (tasks: TaskItem[]) => void;

class TaskManagerService {
  private tasks: TaskItem[] = [];
  private listeners: Set<TaskListener> = new Set();
  private maxHistory = 30;

  public subscribe(listener: TaskListener): () => void {
    this.listeners.add(listener);
    listener([...this.tasks]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const list = [...this.tasks];
    for (const listener of this.listeners) {
      listener(list);
    }
  }

  public getTasks(): TaskItem[] {
    return [...this.tasks];
  }

  public getActiveTaskCount(): number {
    return this.tasks.filter(t => t.status === 'running').length;
  }

  public addTask(
    name: string,
    type: TaskItem['type'],
    cancelFn?: () => void
  ): string {
    const id = Math.random().toString(36).substring(2, 10);
    const newTask: TaskItem = {
      id,
      name,
      type,
      status: 'running',
      startTime: Date.now(),
      cancelFn
    };

    this.tasks = [newTask, ...this.tasks].slice(0, this.maxHistory);
    this.notify();
    return id;
  }

  public updateTask(
    id: string,
    updates: Partial<Omit<TaskItem, 'id'>>
  ) {
    let updated = false;
    this.tasks = this.tasks.map(task => {
      if (task.id === id) {
        updated = true;
        const endTime = updates.status && updates.status !== 'running' ? Date.now() : undefined;
        const durationMs = endTime ? endTime - task.startTime : task.durationMs;
        return {
          ...task,
          ...updates,
          durationMs
        };
      }
      return task;
    });

    if (updated) {
      this.notify();
    }
  }

  public killTask(id: string) {
    const task = this.tasks.find(t => t.id === id);
    if (!task) return;

    if (task.status === 'running') {
      if (task.cancelFn) {
        try {
          task.cancelFn();
        } catch (e) {
          console.error('Error invoking cancelFn for task:', id, e);
        }
      }
      this.updateTask(id, {
        status: 'cancelled',
        error: 'Task killed by user'
      });
    }
  }

  public killAllTasks() {
    for (const task of this.tasks) {
      if (task.status === 'running') {
        this.killTask(task.id);
      }
    }
  }

  public killTasksByType(type: TaskItem['type']) {
    for (const task of this.tasks) {
      if (task.status === 'running' && task.type === type) {
        this.killTask(task.id);
      }
    }
  }

  public clearHistory() {
    this.tasks = this.tasks.filter(t => t.status === 'running');
    this.notify();
  }

  // Helper method to run a task on a background Web Worker with automatic lifecycle & cancellation
  public runWorkerTask<T = WorkerResponse>(
    name: string,
    type: TaskItem['type'],
    requestData: Omit<WorkerRequest, 'id'>,
    onSuccess: (res: WorkerResponse) => void,
    onError?: (err: any) => void
  ): { taskId: string; kill: () => void } {
    // Kill any existing task of the same type if it's debounced live typecheck or format
    if (type === 'typecheck' || type === 'format') {
      this.killTasksByType(type);
    }

    let worker: Worker | null = null;
    let taskId = '';

    const cancelFn = () => {
      if (worker) {
        worker.terminate();
        worker = null;
      }
    };

    taskId = this.addTask(name, type, cancelFn);

    try {
      worker = new Worker(new URL('./compiler.worker.ts', import.meta.url), { type: 'module' });

      worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
        const res = e.data;
        if (res.id === taskId) {
          if (res.success) {
            this.updateTask(taskId, { status: 'completed' });
            onSuccess(res);
          } else {
            this.updateTask(taskId, {
              status: 'failed',
              error: res.error || 'Execution encountered an error'
            });
            if (onError) onError(res);
            else onSuccess(res);
          }
          if (worker) {
            worker.terminate();
            worker = null;
          }
        }
      };

      worker.onerror = (err) => {
        this.updateTask(taskId, {
          status: 'failed',
          error: err.message || 'Worker thread error'
        });
        if (onError) onError(err);
        if (worker) {
          worker.terminate();
          worker = null;
        }
      };

      const fullRequest: WorkerRequest = {
        id: taskId,
        ...requestData
      };

      worker.postMessage(fullRequest);
    } catch (err: any) {
      this.updateTask(taskId, {
        status: 'failed',
        error: err.message || 'Failed to initialize worker'
      });
      if (onError) onError(err);
    }

    return {
      taskId,
      kill: () => this.killTask(taskId)
    };
  }
}

export const taskManager = new TaskManagerService();
