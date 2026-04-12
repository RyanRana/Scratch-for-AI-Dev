"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
const vscode = __importStar(require("vscode"));
const VIEW_TYPE = "ai-blocks.editor";
function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand("ai-blocks.open", () => {
        openPanel(context);
    }));
}
function deactivate() { }
function openPanel(context) {
    const column = vscode.window.activeTextEditor
        ? vscode.window.activeTextEditor.viewColumn
        : undefined;
    const panel = vscode.window.createWebviewPanel(VIEW_TYPE, "AI Blocks", column ?? vscode.ViewColumn.One, {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, "media")],
    });
    panel.webview.html = buildWebviewHtml(panel.webview, context.extensionUri);
}
function buildWebviewHtml(webview, extensionUri) {
    const mediaRoot = vscode.Uri.joinPath(extensionUri, "media");
    const indexPath = path.join(mediaRoot.fsPath, "index.html");
    if (!fs.existsSync(indexPath)) {
        return missingMediaHtml(extensionUri.fsPath);
    }
    let html = fs.readFileSync(indexPath, "utf8");
    html = html.replace(/(href|src)=(["'])(\.\/[^"']+)\2/g, (_m, attr, quote, rel) => {
        const relPath = rel.replace(/^\.\//, "");
        const fileUri = vscode.Uri.joinPath(mediaRoot, relPath);
        const webUri = webview.asWebviewUri(fileUri);
        return `${attr}=${quote}${webUri.toString()}${quote}`;
    });
    const csp = [
        `default-src 'none'`,
        `style-src ${webview.cspSource} https://fonts.googleapis.com 'unsafe-inline'`,
        `font-src ${webview.cspSource} https://fonts.gstatic.com`,
        `img-src ${webview.cspSource} https: data:`,
        `script-src ${webview.cspSource}`,
        `connect-src https://api.anthropic.com`,
    ].join("; ");
    if (/<head[^>]*>/i.test(html)) {
        html = html.replace(/<head[^>]*>/i, (m) => `${m}\n    <meta http-equiv="Content-Security-Policy" content="${csp}" />`);
    }
    else {
        html = `<!DOCTYPE html><html><head><meta http-equiv="Content-Security-Policy" content="${csp}" /></head><body>${html}</body></html>`;
    }
    return html;
}
function missingMediaHtml(extensionPath) {
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
//# sourceMappingURL=extension.js.map