import { PDFPageProxy, RenderTask } from "pdfjs-dist";
import { PdfDisplayCommonParams, EventFailedCallback, PageEventSuccess } from "./types";

export function isFunction(value: any): value is Function {
  return typeof value === 'function';
}

type DrawPdfParams = PdfDisplayCommonParams & {
  page: PDFPageProxy;
  renderTask: React.MutableRefObject<RenderTask | null>;
  onPageRenderSuccessRef: React.MutableRefObject<PageEventSuccess | undefined>;
  onPageRenderFailRef: React.MutableRefObject<EventFailedCallback | undefined>;
}

export const drawPDF = async ({
  page,
  canvasRef,
  rotate = 0,
  scale = 1,
  renderTask,
  onPageRenderSuccessRef,
  onPageRenderFailRef,
}: DrawPdfParams) => {
  // Because this page's rotation option overwrites pdf default rotation value,
  // calculating page rotation option value from pdf default and this component prop rotate.
  const rotation = rotate === 0 ? page.rotate : page.rotate + rotate;
  const dpRatio = window.devicePixelRatio;
  const adjustedScale = scale * dpRatio;
  const viewport = page.getViewport({ scale: adjustedScale, rotation });
  const canvasEl = canvasRef.current;
  if (!canvasEl) {
    return;
  }

  const canvasContext = canvasEl.getContext('2d');
  if (!canvasContext) {
    return;
  }

  canvasEl.style.width = `${viewport.width / dpRatio}px`;
  canvasEl.style.height = `${viewport.height / dpRatio}px`;
  canvasEl.height = viewport.height;
  canvasEl.width = viewport.width;

  // if previous render isn't done yet, we cancel it
  if (renderTask.current) {
    renderTask.current.cancel();
    return;
  }

  renderTask.current = page.render({
    canvasContext,
    viewport,
  });

  try {
    await renderTask.current.promise;

    renderTask.current = null;

    if (isFunction(onPageRenderSuccessRef.current)) {
      onPageRenderSuccessRef.current(page);
    }

  } catch (err) {
    const error = err as Error;
    renderTask.current = null;
    if (error && error.name === 'RenderingCancelledException') {
      drawPDF({ page, canvasRef, rotate, scale, renderTask, onPageRenderSuccessRef, onPageRenderFailRef });
    } else if (isFunction(onPageRenderFailRef.current)) {
      onPageRenderFailRef.current();
    }
  }
};