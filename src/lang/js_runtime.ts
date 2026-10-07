// JavaScript Sandbox Runtime for TypeLang
export interface JSRuntimeResult {
  stdout: string[];
  result: any;
  executionTimeMs: number;
  error: string | null;
}

export class JSSandbox {
  private static activeIntervals: number[] = [];
  private static activeTimeouts: number[] = [];
  private static activeAnimationFrames: number[] = [];
  private static activeListeners: { target: any; type: string; listener: any; options?: any }[] = [];

  public static isStopped = false;

  public static cleanup(): void {
    JSSandbox.isStopped = true;
    if (typeof window !== 'undefined') {
      const win = window as any;
      win._tl_stopped = true;

      for (const id of JSSandbox.activeIntervals) {
        window.clearInterval(id);
      }
      JSSandbox.activeIntervals = [];

      for (const id of JSSandbox.activeTimeouts) {
        window.clearTimeout(id);
      }
      JSSandbox.activeTimeouts = [];

      for (const id of JSSandbox.activeAnimationFrames) {
        window.cancelAnimationFrame(id);
      }
      JSSandbox.activeAnimationFrames = [];

      for (const item of JSSandbox.activeListeners) {
        try {
          item.target.removeEventListener(item.type, item.listener, item.options);
        } catch (_) {}
      }
      JSSandbox.activeListeners = [];

      // Clean up any well-known global game loops, music loops, or listeners
      if (win._tl_pac_timer) {
        window.clearInterval(win._tl_pac_timer);
        win._tl_pac_timer = null;
      }
      if (win._tl_pac_keydown) {
        window.removeEventListener('keydown', win._tl_pac_keydown);
        win._tl_pac_keydown = null;
      }
      if (win._tl_gta_timer) {
        window.clearInterval(win._tl_gta_timer);
        win._tl_gta_timer = null;
      }
      if (win._tl_tetris_timer) {
        window.clearInterval(win._tl_tetris_timer);
        win._tl_tetris_timer = null;
      }
      if (win._tl_outrun_timer) {
        window.clearInterval(win._tl_outrun_timer);
        win._tl_outrun_timer = null;
      }
      if (win._tl_music_loops) {
        for (const k in win._tl_music_loops) {
          try { window.clearInterval(win._tl_music_loops[k]); } catch (_) {}
        }
        win._tl_music_loops = {};
      }
      if (win._tl_actx) {
        try {
          if (win._tl_actx.state === 'running') {
            win._tl_actx.suspend();
          }
        } catch (_) {}
      }

      // Safety sweep: clear any remaining timer IDs
      try {
        const highestId = window.setTimeout(() => {}, 0);
        for (let i = highestId; i > Math.max(0, highestId - 250); i--) {
          window.clearTimeout(i);
          window.clearInterval(i);
        }
      } catch (_) {}
    }
  }

  public static execute(jsCode: string, mountTargetElement?: HTMLElement | null): JSRuntimeResult {
    // Cancel any previous sandbox loops/listeners before new execution
    JSSandbox.cleanup();
    JSSandbox.isStopped = false;
    if (typeof window !== 'undefined') {
      (window as any)._tl_stopped = false;
    }

    const stdout: string[] = [];
    let result: any = null;
    let error: string | null = null;
    const startTime = performance.now();

    try {
      // Create a scoped console interceptor
      const customConsole = {
        log: (...args: any[]) => {
          const formatted = args
            .map(a => (typeof a === 'object' && a !== null ? JSON.stringify(a) : String(a)))
            .join(' ');
          stdout.push(formatted + '\n');
        },
        error: (...args: any[]) => {
          const formatted = args
            .map(a => (typeof a === 'object' && a !== null ? JSON.stringify(a) : String(a)))
            .join(' ');
          stdout.push(`[Error] ${formatted}\n`);
        },
        warn: (...args: any[]) => {
          const formatted = args
            .map(a => (typeof a === 'object' && a !== null ? JSON.stringify(a) : String(a)))
            .join(' ');
          stdout.push(`[Warn] ${formatted}\n`);
        }
      };

      // Safe Node.js standard library mock for browser sandbox
      const mockRequire = (modName: string) => {
        if (modName === 'fs') {
          return {
            readFileSync: (_p: string) => '{"status":"ok"}',
            writeFileSync: (_p: string, _c: string) => null,
            existsSync: (_p: string) => true
          };
        }
        if (modName === 'path') {
          return {
            join: (...parts: string[]) => parts.join('/'),
            resolve: (...parts: string[]) => parts.join('/'),
            basename: (p: string) => p.split('/').pop() || '',
            dirname: (p: string) => p.split('/').slice(0, -1).join('/') || '.'
          };
        }
        if (modName === 'http') {
          return {
            createServer: () => ({
              listen: (port: number, cb?: () => void) => {
                customConsole.log(`[HTTP Server] Listening on port ${port}`);
                if (cb) cb();
                return { close: () => {} };
              }
            })
          };
        }
        if (modName === 'express') {
          return () => {
            const routes: any[] = [];
            const middlewares: any[] = [];
            const app = {
              use: (fn: any) => { middlewares.push(fn); return app; },
              get: (p: string, fn: any) => { routes.push({ method: 'GET', path: p, fn }); return app; },
              post: (p: string, fn: any) => { routes.push({ method: 'POST', path: p, fn }); return app; },
              listen: (port: number, cb?: () => void) => {
                customConsole.log(`[Express Engine] Server listening on port ${port}`);
                if (cb) cb();
                return { close: () => {} };
              }
            };
            return app;
          };
        }
        if (modName === 'lodash' || modName === 'lodash-es') {
          if (typeof window !== 'undefined' && (window as any).lodash) return (window as any).lodash;
          return null;
        }
        if (modName === 'zod') {
          if (typeof window !== 'undefined' && (window as any).zod) return (window as any).zod;
          return null;
        }
        if (modName === 'canvas-confetti' || modName === 'confetti') {
          if (typeof window !== 'undefined' && (window as any).confetti) return (window as any).confetti;
          return null;
        }
        return null;
      };

      const mockProcess = {
        env: {
          NODE_ENV: 'test',
          PORT: '3000'
        }
      };

      const sandboxedSetInterval = (handler: any, timeout?: number, ...args: any[]) => {
        if (typeof window !== 'undefined') {
          const id = window.setInterval(handler, timeout, ...args);
          JSSandbox.activeIntervals.push(id as any);
          return id;
        }
        return 0;
      };

      const sandboxedClearInterval = (id?: any) => {
        if (typeof window !== 'undefined' && id !== undefined) {
          window.clearInterval(id);
          JSSandbox.activeIntervals = JSSandbox.activeIntervals.filter(x => x !== id);
        }
      };

      const sandboxedSetTimeout = (handler: any, timeout?: number, ...args: any[]) => {
        if (typeof window !== 'undefined') {
          const id = window.setTimeout(handler, timeout, ...args);
          JSSandbox.activeTimeouts.push(id as any);
          return id;
        }
        return 0;
      };

      const sandboxedClearTimeout = (id?: any) => {
        if (typeof window !== 'undefined' && id !== undefined) {
          window.clearTimeout(id);
          JSSandbox.activeTimeouts = JSSandbox.activeTimeouts.filter(x => x !== id);
        }
      };

      const sandboxedRequestAnimationFrame = (callback: any) => {
        if (typeof window !== 'undefined') {
          const id = window.requestAnimationFrame(callback);
          JSSandbox.activeAnimationFrames.push(id);
          return id;
        }
        return 0;
      };

      const sandboxedCancelAnimationFrame = (id: any) => {
        if (typeof window !== 'undefined') {
          window.cancelAnimationFrame(id);
          JSSandbox.activeAnimationFrames = JSSandbox.activeAnimationFrames.filter(x => x !== id);
        }
      };

      // Wrap in sandbox function
      const runner = new Function(
        'console',
        'mountContainer',
        'require',
        'process',
        'setInterval',
        'clearInterval',
        'setTimeout',
        'clearTimeout',
        'requestAnimationFrame',
        'cancelAnimationFrame',
        `
        const $mountTarget = mountContainer;
        ${jsCode}
        `
      );

      result = runner(
        customConsole,
        mountTargetElement || null,
        mockRequire,
        mockProcess,
        sandboxedSetInterval,
        sandboxedClearInterval,
        sandboxedSetTimeout,
        sandboxedClearTimeout,
        sandboxedRequestAnimationFrame,
        sandboxedCancelAnimationFrame
      );
    } catch (err: any) {
      error = err.message || String(err);
      const stack = err.stack ? `\nStack: ${err.stack}` : '';
      stdout.push(`Runtime Exception: ${error}${stack}\n`);
    }

    const endTime = performance.now();
    return {
      stdout,
      result,
      executionTimeMs: Math.round((endTime - startTime) * 100) / 100,
      error
    };
  }
}

