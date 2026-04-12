import * as fs from "node:fs";
import * as path from "node:path";
import * as vscode from "vscode";

const VIEW_TYPE = "ai-blocks.editor";

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand("ai-blocks.open", () => {
      openPanel(context);
    }),
  );
}

export function deactivate(): void {}

function openPanel(context: vscode.ExtensionContext): void {
  const column = vscode.window.activeTextEditor
    ? vscode.window.activeTextEditor.viewColumn
    : undefined;

  const panel = vscode.window.createWebviewPanel(
    VIEW_TYPE,
    "AI Blocks",
    column ?? vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, "media")],
    },
  );

  panel.webview.html = buildWebviewHtml(panel.webview, context.extensionUri);
}

function buildWebviewHtml(
  webview: vscode.Webview,
  extensionUri: vscode.Uri,
): string {
  const mediaRoot = vscode.Uri.joinPath(extensionUri, "media");
  const indexPath = path.join(mediaRoot.fsPath, "index.html");

  if (!fs.existsSync(indexPath)) {
    return missingMediaHtml(extensionUri.fsPath);
  }

  let html = fs.readFileSync(indexPath, "utf8");

  html = html.replace(
    /(href|src)=(["'])(\.\/[^"']+)\2/g,
    (_m, attr: string, quote: string, rel: string) => {
      const relPath = rel.replace(/^\.\//, "");
      const fileUri = vscode.Uri.joinPath(mediaRoot, relPath);
      const webUri = webview.asWebviewUri(fileUri);
      return `${attr}=${quote}${webUri.toString()}${quote}`;
    },
  );

  const csp = [
    `default-src 'none'`,
    `style-src ${webview.cspSource} https://fonts.googleapis.com 'unsafe-inline'`,
    `font-src ${webview.cspSource} https://fonts.gstatic.com`,
    `img-src ${webview.cspSource} https: data:`,
    `script-src ${webview.cspSource}`,
    `connect-src https://api.anthropic.com`,
  ].join("; ");

  if (/<head[^>]*>/i.test(html)) {
    html = html.replace(
      /<head[^>]*>/i,
      (m) => `${m}\n    <meta http-equiv="Content-Security-Policy" content="${csp}" />`,
    );
  } else {
    html = `<!DOCTYPE html><html><head><meta http-equiv="Content-Security-Policy" content="${csp}" /></head><body>${html}</body></html>`;
  }

  return html;
}

function missingMediaHtml(extensionPath: string): string {
  const escaped = extensionPath.replace(/</g, "&lt;");
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8" /></head>
<body style="font-family:system-ui;padding:16px;">
  <h2>AI Blocks media not built</h2>
  <p>Run from the repo root:</p>
  <pre style="background:#f0f0f0;padding:8px;">pnpm run build:extension</pre>
  <p>Expected: <code>${escaped}/media/index.html</code></p>
</body></html>`;
}
