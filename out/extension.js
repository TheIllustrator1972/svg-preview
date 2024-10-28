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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const constants_1 = require("./constants");
const helperFunctions_1 = require("./helperFunctions");
let lastSVGContent = "";
let lastSVGBase64 = "";
function activate(context) {
    const selector = [
        { language: "javascript", scheme: "file" },
        { language: "javascriptreact", scheme: "file" },
        { language: "typescript", scheme: "file" },
        { language: "typescriptreact", scheme: "file" },
        { language: "svg", scheme: "file" },
    ];
    const hoverProvider = vscode.languages.registerHoverProvider(selector, {
        provideHover(document, position, token) {
            const fileContent = document.getText();
            const hoverOffset = document.offsetAt(position);
            const beforeOffset = fileContent.lastIndexOf(constants_1.svgOpeningTag, hoverOffset);
            const afterOffset = fileContent.indexOf(constants_1.svgClosingTag, hoverOffset);
            let codeBetweenOffsets = "";
            if (beforeOffset !== -1 &&
                afterOffset !== -1 &&
                beforeOffset < afterOffset) {
                const startPos = document.positionAt(beforeOffset);
                const endPos = document.positionAt(afterOffset + constants_1.svgClosingTag.length);
                codeBetweenOffsets = document.getText(new vscode.Range(startPos, endPos));
                const hasWidth = /<svg[^>]*width\s*=\s*['"][^'"]+['"]/i.test(codeBetweenOffsets);
                if (!hasWidth) {
                    const svgWithDefaultWidth = codeBetweenOffsets.replace(/<svg([^>]*)>/, `<svg$1 width="50px">`);
                    codeBetweenOffsets = svgWithDefaultWidth;
                }
                const purified = (0, helperFunctions_1.purifySVG)(codeBetweenOffsets.toString());
                if (purified === "") {
                    return undefined;
                }
                let base64Data = "";
                if (codeBetweenOffsets === lastSVGContent) {
                    base64Data = lastSVGBase64;
                }
                else {
                    base64Data = (0, helperFunctions_1.svgToBase64)(purified);
                    lastSVGContent = codeBetweenOffsets;
                    lastSVGBase64 = base64Data;
                }
                let hoverMessageText = `<img src="${base64Data}"/> ${!hasWidth ? constants_1.noWidthFoundMessage : ""}`;
                const hoverMessage = new vscode.MarkdownString(hoverMessageText);
                hoverMessage.isTrusted = true;
                hoverMessage.supportHtml = true;
                return new vscode.Hover(hoverMessage);
            }
            return new vscode.Hover("Hover over a valid SVG to see the preview.");
        },
    });
    context.subscriptions.push(hoverProvider);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map