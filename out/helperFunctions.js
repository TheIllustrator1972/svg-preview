"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.purifySVG = void 0;
exports.svgToBase64 = svgToBase64;
const dompurify_1 = __importDefault(require("dompurify"));
const jsdom_1 = require("jsdom");
function svgToBase64(svg) {
    const base64 = Buffer.from(svg).toString("base64");
    return `data:image/svg+xml;base64,${base64}`;
}
const purifySVG = (svgString) => {
    const window = new jsdom_1.JSDOM("").window;
    const purify = (0, dompurify_1.default)(window);
    function getSafeSVG(svgContent) {
        return purify.sanitize(svgContent, { USE_PROFILES: { svg: true } });
    }
    return getSafeSVG?.(svgString) || "";
};
exports.purifySVG = purifySVG;
//# sourceMappingURL=helperFunctions.js.map