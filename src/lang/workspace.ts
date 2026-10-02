import { Lexer } from './lexer';
import { Parser } from './parser';
import { TypeChecker, TypeEnv, createInitialEnv } from './checker';
import { Diagnostic } from './types';

/**
 * Interface representing the host system (Node.js, VS Code extension, or Browser).
 * You can implement this to plug the TypeLang compiler into any environment.
 */
export interface SystemHost {
    /** Read file contents as string */
    readFile(path: string): string | null;
    /** Check if a file exists */
    fileExists(path: string): boolean;
    /** Resolve a relative path from a base directory */
    resolvePath(basePath: string, relativePath: string): string;
    /** Get the directory name of a path */
    dirname(path: string): string;
}

/**
 * ProjectWorkspace handles multi-file compilation, module resolution, and caching.
 * It's designed to be instantiated once per project (e.g. by a Language Server or CLI).
 */
export class ProjectWorkspace {
    private host: SystemHost;
    private moduleCache = new Map<string, TypeEnv>();
    private fileAstCache = new Map<string, any>();
    public diagnostics: Diagnostic[] = [];
    private currentlyCompiling = new Set<string>();

    constructor(host: SystemHost) {
        this.host = host;
    }

    /**
     * Resolves a module name to a physical file path using standard conventions.
     * e.g., "ScratchMath" -> "./ScratchMath.tl" or "./scratch_math.tl"
     */
    public resolveModuleNameToFile(moduleName: string, currentDirPath: string): string | null {
        // Convert PascalCase/CamelCase to snake_case
        const snakeCase = moduleName.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
        
        // Search conventions
        const candidates = [
            `${moduleName}.tl`,
            `${snakeCase}.tl`,
            `src/${moduleName}.tl`,
            `src/${snakeCase}.tl`
        ];

        for (const candidate of candidates) {
            const fullPath = this.host.resolvePath(currentDirPath, candidate);
            if (this.host.fileExists(fullPath)) {
                return fullPath;
            }
        }

        return null;
    }

    /**
     * Compiles and type-checks a specific file and returns its resulting TypeEnv.
     * Caches the result to prevent redundant parsing and handles circular dependencies.
     */
    public checkFile(filePath: string): TypeEnv | null {
        // Return cached module if already compiled
        if (this.moduleCache.has(filePath)) {
            return this.moduleCache.get(filePath)!;
        }

        // Prevent infinite loops on circular dependencies
        if (this.currentlyCompiling.has(filePath)) {
            return null; 
        }

        const source = this.host.readFile(filePath);
        if (source === null) {
            return null;
        }

        this.currentlyCompiling.add(filePath);

        // Create a checker that hooks back into the workspace to resolve imports dynamically
        const checker = new TypeChecker({
            resolveModule: (moduleName: string) => {
                const dir = this.host.dirname(filePath);
                const resolvedPath = this.resolveModuleNameToFile(moduleName, dir);
                if (resolvedPath) {
                    return this.checkFile(resolvedPath);
                }
                return null;
            }
        });

        try {
            const lexer = new Lexer(source);
            const parser = new Parser(lexer.tokenize());
            const ast = parser.parseProgram();

            this.fileAstCache.set(filePath, ast);

            const env = checker.checkProgram(ast);
            
            // Collect diagnostics, tagging them with the originating file path
            this.diagnostics.push(...checker.diagnostics.map(d => ({ ...d, file: filePath })));

            // Extract the final module environment based on explicit or implicit exports
            const finalEnv = this.extractModuleEnv(env);
            
            this.moduleCache.set(filePath, finalEnv);
            this.currentlyCompiling.delete(filePath);
            return finalEnv;

        } catch (err: any) {
            this.currentlyCompiling.delete(filePath);
            return null;
        }
    }

    /**
     * If a file explicitly defines a `module X {}`, we want to return just that module.
     * Otherwise, if a file uses loose `export function`, the file itself acts as the module.
     */
    private extractModuleEnv(env: TypeEnv): TypeEnv {
        // If the file exports exactly one explicit module, use that as the root export
        if (env.exports.size === 1) {
            const exportName = Array.from(env.exports)[0];
            if (env.modules.has(exportName)) {
                return env.modules.get(exportName)!;
            }
        }

        // Implicit file module: The file itself IS the module.
        // Return a fresh environment containing only the exported symbols.
        const modEnv = { ...createInitialEnv(), exports: new Set(Array.from(env.exports)) };
        for (const exp of Array.from(env.exports)) {
            if (env.vars.has(exp)) modEnv.vars.set(exp, env.vars.get(exp)!);
            if (env.typeAliases.has(exp)) modEnv.typeAliases.set(exp, env.typeAliases.get(exp)!);
            if (env.gadts.has(exp)) modEnv.gadts.set(exp, env.gadts.get(exp)!);
            if (env.modules.has(exp)) modEnv.modules.set(exp, env.modules.get(exp)!);
        }
        return modEnv;
    }
}
