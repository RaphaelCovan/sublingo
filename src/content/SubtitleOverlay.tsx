import React, { useState, useRef, useEffect } from 'react';
import type { CaptionStyle, OverlayLayout } from '../shared/storage';

interface Props {
  primaryText: string;
  secondaryText: string;
  captionStyle: CaptionStyle;
  layout: OverlayLayout;
  onLayoutChange: (layout: OverlayLayout) => void;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const makeOutline = (color: string, width: number) => {
  if (width <= 0) return 'none';
  const offsets = [
    [-width, -width], [0, -width], [width, -width],
    [-width, 0], [width, 0],
    [-width, width], [0, width], [width, width],
  ];
  return offsets.map(([x, y]) => `${x}px ${y}px 0 ${color}`).join(', ');
};

const SubtitleOverlay: React.FC<Props> = ({ primaryText, secondaryText, captionStyle, layout, onLayoutChange }) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState({ width: 0, height: 0 });
  const [pixelPos, setPixelPos] = useState<{ x: number; y: number } | null>(null);
  const dragState = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  // #sublingo-root is kept sized to exactly match the <video> element's own
  // box in every mode (see index.tsx) — so watching it directly gives us
  // "stay within the video" for free in normal, theater, and fullscreen.
  useEffect(() => {
    const container = document.getElementById('sublingo-root');
    if (!container) return;
    const update = () => {
      const rect = container.getBoundingClientRect();
      setBounds({ width: rect.width, height: rect.height });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (dragState.current) return; // don't fight an in-progress drag
    if (bounds.width === 0 || bounds.height === 0) return;
    const fx = layout.fx ?? 0.5;
    const fy = layout.fy ?? 0.88;
    setPixelPos({ x: fx * bounds.width, y: fy * bounds.height });
  }, [layout.fx, layout.fy, bounds.width, bounds.height]);

  const clampToBounds = (x: number, y: number) => {
    const boxW = boxRef.current?.offsetWidth ?? 0;
    const boxH = boxRef.current?.offsetHeight ?? 0;
    const halfW = boxW / 2;
    return {
      x: clamp(x, halfW, Math.max(halfW, bounds.width - halfW)),
      y: clamp(y, boxH, Math.max(boxH, bounds.height)),
    };
  };

  const handleDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = document.getElementById('sublingo-root');
    const box = boxRef.current;
    if (!container || !box) return;

    // Measure the box's REAL current on-screen position rather than trusting
    // stored/derived state — this is what fixed the "teleport on click" bug,
    // since state could momentarily lag the actual layout right after a
    // fullscreen transition.
    const containerRect = container.getBoundingClientRect();
    const boxRect = box.getBoundingClientRect();
    const realX = (boxRect.left + boxRect.width / 2) - containerRect.left;
    const realY = boxRect.bottom - containerRect.top;

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragState.current = { startX: e.clientX, startY: e.clientY, origX: realX, origY: realY };
    setPixelPos({ x: realX, y: realY });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    setPixelPos(clampToBounds(dragState.current.origX + dx, dragState.current.origY + dy));
  };

  const handlePointerUp = () => {
    if (!dragState.current || !pixelPos || bounds.width === 0 || bounds.height === 0) {
      dragState.current = null;
      return;
    }
    dragState.current = null;
    onLayoutChange({ fx: pixelPos.x / bounds.width, fy: pixelPos.y / bounds.height });
  };

  if (!primaryText && !secondaryText) return null;
  if (!pixelPos) return null;

  return (
    <div
      ref={boxRef}
      onPointerDown={handleDragStart}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        // Positioning done entirely via transform rather than left/top — a
        // browser computes an absolutely-positioned element's shrink-to-fit
        // width using its raw `left` value BEFORE any transform is applied.
        // With left pinned at 0, width is always calculated against the full
        // container, and transform alone moves the finished box into place —
        // this is what stops it from squeezing into a narrow column near edges.
        transform: `translate(${pixelPos.x}px, ${pixelPos.y}px) translate(-50%, -100%)`,
        pointerEvents: 'auto',
        cursor: dragState.current ? 'grabbing' : 'grab',
        maxWidth: '90%',
        padding: '0.3em 0.6em',
        background: `rgba(0, 0, 0, ${captionStyle.backgroundOpacity})`,
        borderRadius: '6px',
        textAlign: 'center',
        userSelect: 'none',
        touchAction: 'none',
        fontFamily: captionStyle.fontFamily,
        fontSize: `${captionStyle.fontSize}px`,
    }}
    >
      {primaryText && (
        <div style={{
          color: captionStyle.primaryColor,
          fontSize: '1em',
          fontWeight: 700,
          lineHeight: 1.3,
          textShadow: makeOutline(captionStyle.primaryBorderColor, captionStyle.borderWidth),
        }}>
          {primaryText}
        </div>
      )}
      {secondaryText && (
        <div style={{
          color: captionStyle.secondaryColor,
          fontSize: '0.7em',
          fontWeight: 600,
          lineHeight: 1.3,
          marginTop: '0.1em',
          textShadow: makeOutline(captionStyle.secondaryBorderColor, captionStyle.borderWidth),
        }}>
          {secondaryText}
        </div>
      )}
    </div>
  );
};

export default SubtitleOverlay;