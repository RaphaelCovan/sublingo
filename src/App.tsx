import React, { useEffect, useState } from 'react';
import { getSettings, setSettings } from './shared/storage';

const App = () => {
  const [settings, setSettingsState] = useState({ enabled: true, primary: 'en', secondary: 'pl' });

  useEffect(() => {
    getSettings().then(s => setSettingsState({ 
      enabled: s.enabled, primary: s.primaryLanguage, secondary: s.secondaryLanguage 
    }));
  }, []);

  const updatePrimary = (lang: string) => {
    setSettingsState(prev => ({ ...prev, primary: lang }));
    setSettings({ primaryLanguage: lang });
  };

  const updateSecondary = (lang: string) => {
    setSettingsState(prev => ({ ...prev, secondary: lang }));
    setSettings({ secondaryLanguage: lang });
  };

  const toggleEnabled = (val: boolean) => {
    setSettingsState(prev => ({ ...prev, enabled: val }));
    setSettings({ enabled: val });
  };

  return (
    <div style={{ width: '220px', padding: '20px', fontFamily: 'sans-serif' }}>
      <h3 style={{ margin: '0 0 15px 0' }}>SubLingo</h3>
      <div style={{ marginBottom: '10px' }}>
        <label>Extension Active: </label>
        <input type="checkbox" checked={settings.enabled} onChange={e => toggleEnabled(e.target.checked)} />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label style={{ fontSize: '11px', display: 'block' }}>Primary Subtitle (Top)</label>
        <select value={settings.primary} onChange={e => updatePrimary(e.target.value)} style={{ width: '100%' }}>
          <option value="en">English</option>
          <option value="pt-BR">Portuguese (BR)</option>
          <option value="pt-PT">Portuguese (PT)</option>
          <option value="es">Spanish</option>
          <option value="pl">Polish</option>
        </select>
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label style={{ fontSize: '11px', display: 'block' }}>Learning Subtitle (Bottom)</label>
        <select value={settings.secondary} onChange={e => updateSecondary(e.target.value)} style={{ width: '100%' }}>
          <option value="pl">Polish</option>
          <option value="en">English</option>
          <option value="pt-BR">Portuguese (BR)</option>
          <option value="es">Spanish</option>
        </select>
      </div>
    </div>
  );
};
export default App;