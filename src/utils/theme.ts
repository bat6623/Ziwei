import { useEffect, useState } from 'react';

export type ThemePref = 'system' | 'light' | 'dark';

const KEY = 'ziwei_theme';
const media = () => window.matchMedia('(prefers-color-scheme: dark)');

function loadPref(): ThemePref {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : 'system';
  } catch {
    return 'system';
  }
}

function apply(pref: ThemePref) {
  const dark = pref === 'dark' || (pref === 'system' && media().matches);
  document.documentElement.classList.toggle('dark', dark);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#000000' : '#f2f2f7');
}

/** 深淺色偏好：自動 (跟系統)／淺色／深色，記在這台裝置 */
export function useTheme() {
  const [pref, setPref] = useState<ThemePref>(loadPref);

  useEffect(() => {
    apply(pref);
    try {
      localStorage.setItem(KEY, pref);
    } catch {
      // 瀏覽器不給存也沒關係，這次瀏覽仍然有效
    }
    if (pref !== 'system') return;
    // 跟隨系統時，系統切換深淺色要馬上跟著變
    const m = media();
    const onChange = () => apply('system');
    m.addEventListener('change', onChange);
    return () => m.removeEventListener('change', onChange);
  }, [pref]);

  const isDark = () => document.documentElement.classList.contains('dark');
  return { pref, setPref, isDark };
}
