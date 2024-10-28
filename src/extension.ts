import * as vscode from "vscode";
import { noWidthFoundMessage, svgClosingTag, svgOpeningTag } from "./constants";
import { purifySVG, svgToBase64 } from "./helperFunctions";

let lastSVGContent = "";
let lastSVGBase64 = "";

export function activate(context: vscode.ExtensionContext) {
  const selector: vscode.DocumentSelector = [
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

      const beforeOffset = fileContent.lastIndexOf(svgOpeningTag, hoverOffset);
      const afterOffset = fileContent.indexOf(svgClosingTag, hoverOffset);

      let codeBetweenOffsets = "";

      if (
        beforeOffset !== -1 &&
        afterOffset !== -1 &&
        beforeOffset < afterOffset
      ) {
        const startPos = document.positionAt(beforeOffset);
        const endPos = document.positionAt(afterOffset + svgClosingTag.length);

        codeBetweenOffsets = document.getText(
          new vscode.Range(startPos, endPos)
        );

        const hasWidth = /<svg[^>]*width\s*=\s*['"][^'"]+['"]/i.test(
          codeBetweenOffsets
        );
        if (!hasWidth) {
          const svgWithDefaultWidth = codeBetweenOffsets.replace(
            /<svg([^>]*)>/,
            `<svg$1 width="50px">`
          );
          codeBetweenOffsets = svgWithDefaultWidth;
        }

        const purified = purifySVG(codeBetweenOffsets.toString());
        if (purified === "") {
          return undefined;
        }

        let base64Data = "";

        if (codeBetweenOffsets === lastSVGContent) {
          base64Data = lastSVGBase64;
        } else {
          base64Data = svgToBase64(purified);
          lastSVGContent = codeBetweenOffsets;
          lastSVGBase64 = base64Data;
        }

        let hoverMessageText = `<img src="${base64Data}"/> ${
          !hasWidth ? noWidthFoundMessage : ""
        }`;

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

export function deactivate() {}
