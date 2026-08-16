import React, { useEffect, useState, useRef } from 'react';
import { getSettings, setSettings } from './shared/storage';
import type { SubLingoSettings, CaptionStyle } from './shared/storage';
import { FONT_FAMILIES, DEFAULT_CAPTION_STYLE, DEFAULT_OVERLAY_LAYOUT } from './shared/storage';
import { BUILT_IN_PRESETS } from './shared/presets';
import { LANGUAGES } from './shared/languages';
import type { Language } from './shared/languages';
import { PAYPAL_DONATE_URL } from './shared/donation';
import { GITHUB_REPO_URL, DEVELOPER_HANDLE } from './shared/links';
import './App.css';
import { GOOGLE_FONTS_URL } from './shared/storage';

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
  const [addingPreset, setAddingPreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const styleDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getSettings().then(setLocalSettings);
  }, []);
  
  useEffect(() => {
  if (document.getElementById('sublingo-google-fonts')) return;
  const link = document.createElement('link');
  link.id = 'sublingo-google-fonts';
  link.rel = 'stylesheet';
  link.href = GOOGLE_FONTS_URL;
  document.head.appendChild(link);
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

  const applyPreset = (style: CaptionStyle) => {
    update({ captionStyle: style });
  };

  const saveCurrentAsPreset = () => {
    if (!settings || !newPresetName.trim()) return;
    const preset = {
      id: `custom-${Date.now()}`,
      name: newPresetName.trim(),
      style: settings.captionStyle,
    };
    update({ customPresets: [...settings.customPresets, preset] });
    setNewPresetName('');
    setAddingPreset(false);
  };

  const deleteCustomPreset = (id: string) => {
    if (!settings) return;
    update({ customPresets: settings.customPresets.filter(p => p.id !== id) });
  };

  const resetPosition = () => {
    update({ overlayLayout: DEFAULT_OVERLAY_LAYOUT });
  };

  const resetAppearance = () => {
    update({ captionStyle: DEFAULT_CAPTION_STYLE, overlayLayout: DEFAULT_OVERLAY_LAYOUT });
  };

  if (!settings) return <div className="app-root loading">Loading…</div>;

  return (
    <div className="app-root">
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

          <div className="about-section">
            <h3 className="about-title">About SubLingo</h3>
            <p className="about-text">
              SubLingo works by requesting YouTube's own captions. It doesn't generate
              translations itself. If a video has no captions at all, subtitles won't
              appear here either. When your chosen language isn't available natively,
              we ask YouTube to auto-translate from whichever caption track the video
              does have, so quality depends on both that original track (manual captions
              are more accurate than auto-generated ones) and YouTube's own translation
              engine.
            </p>
          </div>
        </>
      )}

      {tab === 'appearance' && (
        <>
          <div className="field">
            <label className="picker-label">Presets</label>
            <div className="preset-row">
              {BUILT_IN_PRESETS.map(p => (
                <button key={p.id} className="preset-chip" onClick={() => applyPreset(p.style)}>
                  {p.name}
                </button>
              ))}
              {settings.customPresets.map(p => (
                <span key={p.id} className="preset-chip-wrap">
                  <button className="preset-chip" onClick={() => applyPreset(p.style)}>{p.name}</button>
                  <button className="preset-chip-remove" onClick={() => deleteCustomPreset(p.id)} title="Delete preset">×</button>
                </span>
              ))}
            </div>

            {!addingPreset ? (
              <button className="preset-add-btn" onClick={() => setAddingPreset(true)}>+ Save current as preset</button>
            ) : (
              <div className="preset-add-form">
                <input
                  type="text"
                  className="preset-name-input"
                  placeholder="Preset name"
                  value={newPresetName}
                  onChange={e => setNewPresetName(e.target.value)}
                  autoFocus
                />
                <button className="preset-confirm-btn" onClick={saveCurrentAsPreset} disabled={!newPresetName.trim()}>Save</button>
                <button className="preset-cancel-btn" onClick={() => { setAddingPreset(false); setNewPresetName(''); }}>Cancel</button>
              </div>
            )}
          </div>

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
            SubLingo is free to use. If it's helped you learn a language, a donation goes a long way.
          </p>
          <button
            className="donate-btn"
            onClick={() => window.open(PAYPAL_DONATE_URL, '_blank')}
          >
            Donate via PayPal
          </button>
        </div>
      )}

      <footer className="app-link-footer">
        Developed by{' '}
        <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer">
          {DEVELOPER_HANDLE}
        </a>
      </footer>
    </div>
  );
};

export default App;