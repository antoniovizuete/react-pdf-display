import { getDocument, PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'

type FirstParamOf<T> = Parameters<T extends ((...args: any) => any) ? T : never>[0];

export type PdfDisplayConfig = FirstParamOf<typeof getDocument>

export type DocumentEventSuccess = (page: PDFDocumentProxy) => void
export type PageEventSuccess = (page: PDFPageProxy) => void
export type EventFailedCallback = () => void

export type PdfDisplayCommonParams = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  scale?: number;
  rotate?: number;
}