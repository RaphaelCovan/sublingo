import React, { useEffect, useState, useRef } from 'react';
import { getSettings, setSettings } from './shared/storage';
import type { SubLingoSettings, CaptionStyle } from './shared/storage';
import { FONT_FAMILIES, DEFAULT_CAPTION_STYLE, DEFAULT_OVERLAY_LAYOUT } from './shared/storage';
import { LANGUAGES } from './shared/languages';
import type { Language } from './shared/languages';
import { PAYPAL_DONATE_URL } from './shared/donation';
import './App.css';

const LanguagePicker = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (code: string) => void;
}) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selected = LANGUAGES.find((l: Language) => l.code === value);
  const filtered = query
    ? LANGUAGES.filter((l: Language) => l.name.toLowerCase().includes(query.toLowerCase()))
    : LANGUAGES;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="picker" ref={wrapperRef}>
      <label className="picker-label">{label}</label>
      <div className="picker-control" onClick={() => setOpen(true)}>
        <input
          type="text"
          className="picker-input"
          value={open ? query : (selected?.name ?? '')}
          placeholder={selected?.name ?? 'Select language'}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
        />
        <span className={`picker-chevron ${open ? 'open' : ''}`}>▾</span>
      </div>
      {open && (
        <div className="picker-dropdown">
          {filtered.length === 0 && <div className="picker-empty">No matches</div>}
          {filtered.map((lang: Language) => (
            <div
              key={lang.code}
              className={`picker-option ${lang.code === value ? 'selected' : ''}`}
              onClick={() => {
                onChange(lang.code);
                setOpen(false);
                setQuery('');
              }}
            >
              {lang.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const App = () => {
  const [settings, setLocalSettings] = useState<SubLingoSettings | null>(null);
  const [tab, setTab] = useState<'settings' | 'appearance' | 'support'>('settings');
  const styleDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getSettings().then(setLocalSettings);
  }, []);

  // Chrome extension popups size themselves once at open time and don't
  // auto-shrink when content later gets shorter (e.g. switching to a
  // shorter tab) — this was leaving blank space and a vestigial scrollbar.
  // Explicitly measuring and setting body height on every content change
  // forces the popup to resize correctly.
  useEffect(() => {
    if (!rootRef.current) return;
    const resize = () => {
      document.body.style.height = `${rootRef.current!.offsetHeight}px`;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(rootRef.current);
    return () => ro.disconnect();
  }, []);

  const update = (patch: Partial<SubLingoSettings>) => {
    if (!settings) return;
    const next = { ...settings, ...patch };
    setLocalSettings(next);
    setSettings(patch);
  };

  const updateStyle = (patch: Partial<CaptionStyle>) => {
    if (!settings) return;
    const nextStyle = { ...settings.captionStyle, ...patch };
    setLocalSettings({ ...settings, captionStyle: nextStyle });

    if (styleDebounce.current) clearTimeout(styleDebounce.current);
    styleDebounce.current = setTimeout(() => {
      setSettings({ captionStyle: nextStyle });
    }, 150);
  };

  const resetPosition = () => {
    update({ overlayLayout: DEFAULT_OVERLAY_LAYOUT });
  };

  const resetAppearance = () => {
    update({ captionStyle: DEFAULT_CAPTION_STYLE, overlayLayout: DEFAULT_OVERLAY_LAYOUT });
  };

  if (!settings) return <div className="app-root loading">Loading…</div>;

  return (
    <div className="app-root" ref={rootRef}>
      <div className="app-header">
        <span className="app-title">SubLingo</span>
        <div className="header-actions">
          {tab === 'appearance' && (
            <button className="reset-all-btn" onClick={resetAppearance} title="Reset appearance to defaults">↺</button>
          )}
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={e => update({ enabled: e.target.checked })}
            />
            <span className="toggle-track"><span className="toggle-thumb" /></span>
          </label>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'settings' ? 'active' : ''}`} onClick={() => setTab('settings')}>
          Languages
        </button>
        <button className={`tab ${tab === 'appearance' ? 'active' : ''}`} onClick={() => setTab('appearance')}>
          Appearance
        </button>
        <button className={`tab ${tab === 'support' ? 'active' : ''}`} onClick={() => setTab('support')}>
          Support Us
        </button>
      </div>

      {tab === 'settings' && (
        <>
          <LanguagePicker
            label="Primary Subtitle (Top)"
            value={settings.primaryLanguage}
            onChange={code => update({ primaryLanguage: code })}
          />
          <LanguagePicker
            label="Learning Subtitle (Bottom)"
            value={settings.secondaryLanguage}
            onChange={code => update({ secondaryLanguage: code })}
          />
          <div className="app-footer">Changes apply on your next video load.</div>
        </>
      )}

      {tab === 'appearance' && (
        <>
          <div className="field">
            <label className="picker-label">Font</label>
            <select
              className="select-control"
              value={settings.captionStyle.fontFamily}
              onChange={e => updateStyle({ fontFamily: e.target.value })}
            >
              {FONT_FAMILIES.map(f => (
                <option key={f} value={f} style={{ fontFamily: f }}>
                  {f.split(',')[0].replace(/"/g, '')}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="picker-label">Subtitle size — {settings.captionStyle.fontSize}px</label>
            <input
              type="range" min={16} max={48}
              value={settings.captionStyle.fontSize}
              onChange={e => updateStyle({ fontSize: Number(e.target.value) })}
              className="slider"
            />
          </div>

          <div className="field-grid">
            <div className="field">
              <label className="picker-label">Primary color</label>
              <input
                type="color"
                value={settings.captionStyle.primaryColor}
                onChange={e => updateStyle({ primaryColor: e.target.value })}
                className="color-control"
              />
            </div>
            <div className="field">
              <label className="picker-label">Primary outline</label>
              <input
                type="color"
                value={settings.captionStyle.primaryBorderColor}
                onChange={e => updateStyle({ primaryBorderColor: e.target.value })}
                className="color-control"
              />
            </div>
            <div className="field">
              <label className="picker-label">Learning color</label>
              <input
                type="color"
                value={settings.captionStyle.secondaryColor}
                onChange={e => updateStyle({ secondaryColor: e.target.value })}
                className="color-control"
              />
            </div>
            <div className="field">
              <label className="picker-label">Learning outline</label>
              <input
                type="color"
                value={settings.captionStyle.secondaryBorderColor}
                onChange={e => updateStyle({ secondaryBorderColor: e.target.value })}
                className="color-control"
              />
            </div>
          </div>

          <div className="field">
            <label className="picker-label">
              Outline thickness — {settings.captionStyle.borderWidth === 0 ? 'None' : `${settings.captionStyle.borderWidth}px`}
            </label>
            <input
              type="range" min={0} max={4} step={1}
              value={settings.captionStyle.borderWidth}
              onChange={e => updateStyle({ borderWidth: Number(e.target.value) })}
              className="slider"
            />
          </div>

          <div className="field">
            <label className="picker-label">
              Background — {Math.round(settings.captionStyle.backgroundOpacity * 100)}%
            </label>
            <input
              type="range" min={0} max={100}
              value={Math.round(settings.captionStyle.backgroundOpacity * 100)}
              onChange={e => updateStyle({ backgroundOpacity: Number(e.target.value) / 100 })}
              className="slider"
            />
          </div>

          <button className="reset-btn" onClick={resetPosition}>Reset position</button>
          <div className="app-footer">Drag the captions on the video to reposition them.</div>
        </>
      )}

      {tab === 'support' && (
        <div className="support-tab">
          <p className="support-text">
            SubLingo is completely free to use. If it's been helping you learn a language, any donation will motivate me even more to continue this project.
          </p>
          <button
            className="donate-btn"
            onClick={() => window.open(PAYPAL_DONATE_URL, '_blank')}
          >
            Donate via PayPal
          </button>

          <div className="about-section">
            <h3 className="about-title">About SubLingo</h3>
            <p className="about-text">
              SubLingo only works 
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;