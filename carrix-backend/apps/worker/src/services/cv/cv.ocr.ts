import { Injectable, Logger } from "@nestjs/common";
import JSZip from "jszip";
import OpenAI from "openai";
import { cleanText } from "../../utils/text-cleaner";

type TextSource = "PDF_TEXT" | "DOCX_TEXT" | "TEXT" | "OCR";

@Injectable()
export class CvOcr {
  private readonly logger = new Logger(CvOcr.name);
  private readonly openai: OpenAI | null;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    this.openai = apiKey ? new OpenAI({ apiKey }) : null;
  }

  async extract(
    content: Buffer | string,
    meta?: { mimeType?: string | null; fileName?: string | null },
  ): Promise<{ text: string; source: TextSource }> {
    const buffer = typeof content === "string" ? Buffer.from(content) : content;
    const mimeType = (meta?.mimeType || "").toLowerCase();
    const fileName = meta?.fileName || "resume";

    let extracted: { text: string; source: TextSource } | null = null;

    try {
      if (mimeType.includes("pdf")) {
        extracted = await this.extractPdf(buffer);
      } else if (mimeType.includes("word") || fileName.toLowerCase().endsWith(".docx")) {
        extracted = await this.extractDocx(buffer);
      } else {
        extracted = { text: buffer.toString("utf8"), source: "TEXT" };
      }
    } catch (error) {
      this.logger.warn(`Primary text extraction failed for ${fileName}: ${(error as Error).message}`);
      extracted = { text: buffer.toString("utf8"), source: "TEXT" };
    }

    if (!extracted.text.trim().length || this.isGarbage(extracted.text)) {
      const ocrText = await this.ocrFallback(buffer, fileName);
      if (ocrText.trim().length) {
        extracted = { text: ocrText, source: "OCR" };
      }
    }

    return { text: cleanText(extracted.text), source: extracted.source };
  }

  private async extractPdf(buffer: Buffer): Promise<{ text: string; source: TextSource }> {
    this.ensurePdfPolyfills();
    const pdfParseModule = await import("pdf-parse");
    const PdfParseClass = (pdfParseModule as { PDFParse?: new (options: { data: Buffer }) => { getText: () => Promise<{ text?: string }>; destroy?: () => Promise<void> } }).PDFParse;

    if (typeof PdfParseClass !== "function") {
      throw new Error("pdf-parse PDFParse class not found");
    }

    const parser = new PdfParseClass({ data: buffer });
    try {
      const result = await parser.getText();
      return { text: result?.text || "", source: "PDF_TEXT" };
    } finally {
      await parser.destroy?.();
    }
  }

  private async extractDocx(buffer: Buffer): Promise<{ text: string; source: TextSource }> {
    const zip = await JSZip.loadAsync(buffer);
    const docXml = await zip.file("word/document.xml")?.async("string");
    if (!docXml) {
      return { text: buffer.toString("utf8"), source: "DOCX_TEXT" };
    }

    const plain = docXml
      .replace(/<w:p[^>]*>/g, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return { text: plain, source: "DOCX_TEXT" };
  }

  private isGarbage(text: string) {
    const compact = text.replace(/\s+/g, "");
    if (compact.length < 200) return true;
    const nonAlnum = compact.replace(/[a-z0-9]/gi, "").length;
    return nonAlnum / compact.length > 0.35;
  }

  private async ocrFallback(buffer: Buffer, fileName: string) {
    // OCR not enabled for now; return empty to keep pipeline flowing without noisy errors.
    this.logger.debug?.(`OCR fallback skipped for ${fileName} (not configured)`);
    return "";
  }

  // pdfjs (used by pdf-parse) expects DOMMatrix, Path2D, and ImageData. In the worker
  // environment we don't render pages, so lightweight stubs are enough to unblock parsing.
  private ensurePdfPolyfills() {
    type GlobalPolyfills = typeof globalThis & {
      DOMMatrix?: typeof DOMMatrix;
      Path2D?: typeof Path2D;
      ImageData?: typeof ImageData;
    };
    const g = globalThis as GlobalPolyfills;

    if (typeof g.DOMMatrix === "undefined") {
      g.DOMMatrix = class {
        a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
        constructor(init?: number[] | string) {
          void init;
        }
        multiplySelf() { return this; }
        translate() { return this; }
        scale() { return this; }
        rotate() { return this; }
        invertSelf() { return this; }
        toFloat32Array() { return new Float32Array([this.a, this.b, this.c, this.d, this.e, this.f]); }
      } as unknown as typeof DOMMatrix;
    }

    if (typeof g.Path2D === "undefined") {
      g.Path2D = class {
        constructor(_path?: string) {
          void _path;
        }
      } as unknown as typeof Path2D;
    }

    if (typeof g.ImageData === "undefined") {
      g.ImageData = class {
        data: Uint8ClampedArray;
        width: number;
        height: number;
        constructor(width: number, height: number) {
          this.width = width;
          this.height = height;
          this.data = new Uint8ClampedArray(width * height * 4);
        }
      } as unknown as typeof ImageData;
    }
  }
}
