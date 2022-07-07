import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { usePdfDisplay, UsePdfDisplayParams } from "../hooks/usePdfDisplay";
import { isFunction } from "../utils";

type ComponentRenderProps = Omit<UsePdfDisplayParams, 'canvasRef'> & {
  canvas: React.ReactElement;
};

type ComponentProps = Omit<UsePdfDisplayParams, 'canvasRef'> &
  React.CanvasHTMLAttributes<HTMLCanvasElement> & {
    children?: (renderProps: ComponentRenderProps) => React.ReactElement;
  };

export const PdfDisplay = forwardRef<HTMLCanvasElement | null, ComponentProps>(
  (
    {
      file,
      onDocumentLoadSuccess,
      onDocumentLoadFail,
      onPageLoadSuccess,
      onPageLoadFail,
      onPageRenderSuccess,
      onPageRenderFail,
      page,
      scale,
      rotate,
      cMapUrl,
      cMapPacked,
      workerSrc,
      withCredentials,
      children,
      ...canvasProps
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useImperativeHandle(ref, () => canvasRef.current!);

    const pdfData = usePdfDisplay({
      canvasRef,
      file,
      onDocumentLoadSuccess,
      onDocumentLoadFail,
      onPageLoadSuccess,
      onPageLoadFail,
      onPageRenderSuccess,
      onPageRenderFail,
      page,
      scale,
      rotate,
      cMapUrl,
      cMapPacked,
      workerSrc,
      withCredentials,
    });

    const canvas = <canvas {...canvasProps} ref={canvasRef} />;

    if (isFunction(children)) {
      return children({ canvas, ...pdfData });
    }

    return canvas;
  }
);