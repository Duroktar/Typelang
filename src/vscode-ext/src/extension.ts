import * as vscode from 'vscode';
import * as path from 'path';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from 'vscode-languageclient/node.js';

let client: LanguageClient;

export function activate(context: vscode.ExtensionContext) {
  // The server is implemented in Node.js
  const serverModule = context.asAbsolutePath(path.join('dist', 'server.cjs'));

  // If the extension is launched in debug mode, then the debug server options are used
  // Otherwise the run options are used
  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: { execArgv: ['--nolazy', '--inspect=6009'] },
    },
  };

  // Options to control the language client
  const clientOptions: LanguageClientOptions = {
    // Register the client for TypeLang documents
    documentSelector: [{ scheme: 'file', language: 'typelang' }],
    synchronize: {
      // Notify the server about file changes to '.clientrc files contained in the workspace
      fileEvents: vscode.workspace.createFileSystemWatcher('**/.clientrc'),
    },
  };

  // Create the language client and start the client.
  client = new LanguageClient(
    'typelang',
    'TypeLang Language Server',
    serverOptions,
    clientOptions
  );

  // Start the client. This will also launch the server process.
  client.start();

  vscode.window.showInformationMessage('TypeLang extension activated!');
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
