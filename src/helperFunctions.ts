import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

export function svgToBase64(svg: string): string {
  const base64 = Buffer.from(svg).toString("base64");
  return `data:image/svg+xml;base64,${base64}`;
}

export const purifySVG = (svgString: string) => {
  const window = new JSDOM("").window;
  const purify = DOMPurify(window);

  function getSafeSVG(svgContent: string): string {
    return purify.sanitize(svgContent, { USE_PROFILES: { svg: true } });
  }

  return getSafeSVG?.(svgString) || "";
};
