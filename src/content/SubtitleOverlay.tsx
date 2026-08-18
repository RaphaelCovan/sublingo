import React, { useState, useRef, useEffect } from 'react';
import type { CaptionStyle, OverlayLayout } from '../shared/storage';

interface Props {
  primaryText: string;
  secondaryText: string;
  captionStyle: CaptionStyle;
  fontSize: number;
  layout: OverlayLayout;
  onLayoutChange: (layout: OverlayLayout) => void;
  primaryLanguage: string;
  secondaryLanguage: string;
  onWordClick: (word: string, sourceLang: string, targetLang: string) => Promise<string | null>;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const CLICK_THRESHOLD_PX = 6;
const POPOVER_DISMISS_MS = 4500;

const makeOutline = (color: string, width: number) => {
  if (width <= 0) return 'none';
  const offsets = [
    [-width, -width], [0, -width], [width, -width],
    [-width, 0], [width, 0],
    [-width, width], [0, width], [width, width],
  ];
  return offsets.map(([x, y]) => `${x}px ${y}px 0 ${color}`).join(', ');
};

// Strips leading/trailing punctuation while keeping letters/numbers from
// any script (unicode-aware), so a word is clickable regardless of language.
const cleanWord = (raw: string) => raw.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');

interface Popover {
  word: string;
  translation: string | null;
  loading: boolean;
  x: number;
  y: number;
}

interface ClickCandidate {
  word: string;
  sourceLang: string;
  targetLang: string;
}

const SubtitleOverlay: React.FC<Props> = ({
  primaryText, secondaryText, captionStyle, fontSize, layout, onLayoutChange,
  primaryLanguage, secondaryLanguage, onWordClick,
}) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState({ width: 0, height: 0 });
  const [pixelPos, setPixelPos] = useState<{ x: number; y: number } | null>(null);
  const [popover, setPopover] = useState<Popover | null>(null);
  const dragState = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const clickCandidate = useRef<ClickCandidate | null>(null);

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
    if (dragState.current) return;
    if (bounds.width === 0 || bounds.height === 0) return;
    const fx = layout.fx ?? 0.5;
    const fy = layout.fy ?? 0.88;
    setPixelPos({ x: fx * bounds.width, y: fy * bounds.height });
  }, [layout.fx, layout.fy, bounds.width, bounds.height]);

  // A new subtitle line means any open lookup refers to text that's no
  // longer on screen — dismiss rather than leave it stranded.
  useEffect(() => {
    setPopover(null);
  }, [primaryText, secondaryText]);

  useEffect(() => {
    if (!popover) return;
    const t = setTimeout(() => setPopover(null), POPOVER_DISMISS_MS);
    return () => clearTimeout(t);
  }, [popover?.word, popover?.loading]);

  const clampToBounds = (x: number, y: number) => {
    const boxW = boxRef.current?.offsetWidth ?? 0;
    const boxH = boxRef.current?.offsetHeight ?? 0;
    const halfW = boxW / 2;
    return {
      x: clamp(x, halfW, Math.max(halfW, bounds.width - halfW)),
      y: clamp(y, boxH, Math.max(boxH, bounds.height)),
    };
  };

  const handleWordActivate = (candidate: ClickCandidate, clientX: number, clientY: number) => {
    console.log('[SubLingo] handleWordActivate called for word:', candidate.word, 'target lang:', candidate.targetLang);
    const container = document.getElementById('sublingo-root');
    if (!container) {
      console.warn('[SubLingo] #sublingo-root not found — cannot position popover');
      return;
    }
    const containerRect = container.getBoundingClientRect();
    const px = clientX - containerRect.left;
    const py = clientY - containerRect.top;

    setPopover({ word: candidate.word, translation: null, loading: true, x: px, y: py });

    onWordClick(candidate.word, candidate.sourceLang, candidate.targetLang).then((translation) => {
      console.log('[SubLingo] Translation resolved:', candidate.word, '->', translation);
      setPopover(prev => {
        if (!prev || prev.word !== candidate.word) {
          console.warn('[SubLingo] Popover was cleared before translation arrived (likely a subtitle line change mid-request)');
          return prev;
        }
        return { ...prev, translation, loading: false };
      });
    });
  };

  const handleDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = document.getElementById('sublingo-root');
    const box = boxRef.current;
    if (!container || !box) return;

    const containerRect = container.getBoundingClientRect();
    const boxRect = box.getBoundingClientRect();
    const realX = (boxRect.left + boxRect.width / 2) - containerRect.left;
    const realY = boxRect.bottom - containerRect.top;

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragState.current = { startX: e.clientX, startY: e.clientY, origX: realX, origY: realY };
    setPixelPos({ x: realX, y: realY });

    const wordEl = (e.target as HTMLElement).closest('[data-word]') as HTMLElement | null;
    console.log('[SubLingo] pointerdown target:', (e.target as HTMLElement).tagName, 'matched word element:', wordEl?.dataset.word ?? 'NONE');
    clickCandidate.current = wordEl
      ? {
          word: wordEl.dataset.word!,
          sourceLang: wordEl.dataset.sourceLang!,
          targetLang: wordEl.dataset.targetLang!,
        }
      : null;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    setPixelPos(clampToBounds(dragState.current.origX + dx, dragState.current.origY + dy));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const moved = dragState.current
      ? Math.hypot(e.clientX - dragState.current.startX, e.clientY - dragState.current.startY)
      : Infinity;

    console.log('[SubLingo] pointerup — moved:', moved.toFixed(1), 'px, candidate:', clickCandidate.current?.word ?? 'none');

    if (dragState.current && pixelPos && bounds.width > 0 && bounds.height > 0) {
      onLayoutChange({ fx: pixelPos.x / bounds.width, fy: pixelPos.y / bounds.height });
    }
    dragState.current = null;

    if (moved < CLICK_THRESHOLD_PX && clickCandidate.current) {
      console.log('[SubLingo] Treated as CLICK — activating word lookup');
      handleWordActivate(clickCandidate.current, e.clientX, e.clientY);
    } else if (clickCandidate.current) {
      console.log('[SubLingo] Treated as DRAG — word lookup skipped (moved past threshold)');
    }
    clickCandidate.current = null;
  };

  const renderClickableText = (text: string, lineLang: string, targetLang: string) => {
    const tokens = text.split(/(\s+)/);
    return tokens.map((token, i) => {
      if (token.trim() === '') return token;
      const word = cleanWord(token);
      if (!word) return token;
      return (
        <span
          key={i}
          className="sublingo-word"
          data-word={word}
          data-source-lang={lineLang}
          data-target-lang={targetLang}
        >
          {token}
        </span>
      );
    });
  };

  if (!primaryText && !secondaryText) return null;
  if (!pixelPos) return null;

  return (
    <>
      <style>{`
        .sublingo-word { cursor: pointer; }
        .sublingo-word:hover { text-decoration: underline; text-underline-offset: 3px; }
      `}</style>
      <div
        ref={boxRef}
        onPointerDown={handleDragStart}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
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
          fontSize: `${fontSize}px`,
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
            {renderClickableText(primaryText, primaryLanguage, secondaryLanguage)}
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
            {renderClickableText(secondaryText, secondaryLanguage, primaryLanguage)}
          </div>
        )}
      </div>

      {popover && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            transform: `translate(${popover.x}px, ${popover.y}px) translate(-50%, calc(-100% - 10px))`,
            background: 'rgba(20,20,20,0.95)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '8px',
            padding: '10px 16px',
            fontSize: '18px',
            fontWeight: 600,
            fontFamily: captionStyle.fontFamily,
            color: '#fff',
            maxWidth: '320px',
            pointerEvents: 'none',
            zIndex: 10,
            boxShadow: '0 6px 16px rgba(0,0,0,0.45)',
          }}
        >
          {popover.loading ? '…' : (popover.translation ?? 'No translation found')}
        </div>
      )}
    </>
  );
};

export default SubtitleOverlay;