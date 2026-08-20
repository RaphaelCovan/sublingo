// src/shared/scriptFonts.ts

export interface ScriptFontInfo {
  fontFamily: string; // fallback stack, appended AFTER the user's chosen font
  fontWeight: number; // most non-Latin scripts render better without forced bold
}

// Fallback stacks use fonts already bundled with major OSes (Windows, macOS,
// Android/ChromeOS) so there's no extra download for the common case. Lower
// font-weight avoids browser-synthesized "faux bold," which is blurry/chunky
// on scripts without a true bold face — the text outline already carries
// the visual contrast a heavier weight would otherwise provide.
const SCRIPT_RULES: { test: (code: string) => boolean; info: ScriptFontInfo }[] = [
  { test: c => c === 'zh-Hans' || c === 'zh', info: { fontFamily: '"Noto Sans SC", "Microsoft YaHei", "PingFang SC", "Heiti SC", sans-serif', fontWeight: 500 } },
  { test: c => c === 'zh-Hant', info: { fontFamily: '"Noto Sans TC", "Microsoft JhengHei", "PingFang TC", "Heiti TC", sans-serif', fontWeight: 500 } },
  { test: c => c === 'ja', info: { fontFamily: '"Noto Sans JP", "Yu Gothic", "Hiragino Kaku Gothic Pro", "MS Gothic", sans-serif', fontWeight: 500 } },
  { test: c => c === 'ko', info: { fontFamily: '"Noto Sans KR", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif', fontWeight: 500 } },
  { test: c => ['ar', 'ur', 'fa', 'ps', 'sd', 'ug'].includes(c), info: { fontFamily: '"Noto Sans Arabic", Tahoma, "Geeza Pro", "Segoe UI", sans-serif', fontWeight: 500 } },
  { test: c => c === 'he' || c === 'yi', info: { fontFamily: '"Noto Sans Hebrew", "Arial Hebrew", Tahoma, sans-serif', fontWeight: 500 } },
  { test: c => c === 'th', info: { fontFamily: '"Noto Sans Thai", "Leelawadee UI", Tahoma, sans-serif', fontWeight: 500 } },
  { test: c => ['hi', 'mr', 'ne'].includes(c), info: { fontFamily: '"Noto Sans Devanagari", "Nirmala UI", Mangal, sans-serif', fontWeight: 500 } },
];

export function getScriptFontInfo(langCode: string): ScriptFontInfo | null {
  const rule = SCRIPT_RULES.find(r => r.test(langCode));
  return rule ? rule.info : null;
}