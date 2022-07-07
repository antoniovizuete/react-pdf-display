import { getDocument, GlobalWorkerOptions, PDFDocumentProxy, PDFPageProxy, RenderTask, version } from 'pdfjs-dist';
import { useEffect, useRef, useState } from 'react';
import { EventFailedCallback, PageEventSuccess, PdfDisplayCommonParams, PdfDisplayConfig } from '../types';
import { drawPDF, isFunction } from '../utils';

export type UsePdfDisplayParams = PdfDisplayCommonParams & {
  file?: string | Uint8Array;
  onDocumentLoadSuccess?: (document: PDFDocumentProxy) => void;
  onDocumentLoadFail?: EventFailedCallback;
  onPageLoadSuccess?: (page: PDFPageProxy) => void;
  onPageLoadFail?: EventFailedCallback;
  onPageRenderSuccess?: PageEventSuccess;
  onPageRenderFail?: EventFailedCallback;
  page?: number;
  cMapUrl?: string;
  cMapPacked?: boolean;
  workerSrc?: string;
  withCredentials?: boolean;
};

type UsePdfDisplayReturn = {
  pdfDocument?: PDFDocumentProxy;
  pdfPage?: PDFPageProxy;
};

export const usePdfDisplay = ({
  canvasRef,
  file,
  onDocumentLoadSuccess,
  onDocumentLoadFail,
  onPageLoadSuccess,
  onPageLoadFail,
  onPageRenderSuccess,
  onPageRenderFail,
  scale = 1,
  rotate = 0,
  page = 1,
  cMapUrl,
  cMapPacked,
  workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.js`,
  withCredentials = false,
}: UsePdfDisplayParams): UsePdfDisplayReturn => {
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy>();
  const [pdfPage, setPdfPage] = useState<PDFPageProxy>();
  const renderTask = useRef<RenderTask | null>(null);
  const onDocumentLoadSuccessRef = useRef(onDocumentLoadSuccess);
  const onDocumentLoadFailRef = useRef(onDocumentLoadFail);
  const onPageLoadSuccessRef = useRef(onPageLoadSuccess);
  const onPageLoadFailRef = useRef(onPageLoadFail);
  const onPageRenderSuccessRef = useRef(onPageRenderSuccess);
  const onPageRenderFailRef = useRef(onPageRenderFail);

  useEffect(() => {
    onDocumentLoadSuccessRef.current = onDocumentLoadSuccess;
  }, [onDocumentLoadSuccess]);

  useEffect(() => {
    onDocumentLoadFailRef.current = onDocumentLoadFail;
  }, [onDocumentLoadFail]);

  useEffect(() => {
    onPageLoadSuccessRef.current = onPageLoadSuccess;
  }, [onPageLoadSuccess]);

  useEffect(() => {
    onPageLoadFailRef.current = onPageLoadFail;
  }, [onPageLoadFail]);

  useEffect(() => {
    onPageRenderSuccessRef.current = onPageRenderSuccess;
  }, [onPageRenderSuccess]);

  useEffect(() => {
    onPageRenderFailRef.current = onPageRenderFail;
  }, [onPageRenderFail]);

  useEffect(() => {
    GlobalWorkerOptions.workerSrc = workerSrc;
  }, [workerSrc]);

  useEffect(() => {
    if (file) {
      const isArrayBuffer = ArrayBuffer.isView(file);
      const config: PdfDisplayConfig = { 
        withCredentials,
        data: isArrayBuffer ? file : undefined,
        url: !isArrayBuffer ? file : undefined,
        cMapUrl: cMapUrl ? cMapUrl : undefined,
        cMapPacked: cMapUrl ? cMapPacked : undefined,
      };
      getDocument(config).promise.then(
        loadedPdfDocument => {
          setPdfDocument(loadedPdfDocument);

          if (isFunction(onDocumentLoadSuccessRef.current)) {
            onDocumentLoadSuccessRef.current(loadedPdfDocument);
          }
        },
        () => {
          if (isFunction(onDocumentLoadFailRef.current)) {
            onDocumentLoadFailRef.current();
          }
        }
      );
    }
  }, [file, withCredentials, cMapUrl, cMapPacked]);

  useEffect(() => {
    if (pdfDocument) {
      pdfDocument.getPage(page).then(
        loadedPdfPage => {
          setPdfPage(loadedPdfPage);

          if (isFunction(onPageLoadSuccessRef.current)) {
            onPageLoadSuccessRef.current(loadedPdfPage);
          }

          drawPDF({ page: loadedPdfPage, canvasRef, rotate, scale, renderTask, onPageRenderSuccessRef, onPageRenderFailRef });
        },
        () => {
          if (isFunction(onPageLoadFailRef.current)) {
            onPageLoadFailRef.current();
          }
        }
      );
    }
  }, [canvasRef, page, pdfDocument, rotate, scale]);

  return { pdfDocument, pdfPage };
};