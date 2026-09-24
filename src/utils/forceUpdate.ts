import { APP_VERSION } from './appVersion';

const PARAM = '_v';
const NOTICE_KEY = 'ziwei_update_notice';

/** 查線上最新版號；查不到 (例如本機開發) 就回 null */
async function fetchLatestVersion(): Promise<string | null> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}version.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.version === 'string' ? data.version : null;
  } catch {
    return null;
  }
}

/**
 * 強制更新：跳過瀏覽器暫存重新載入首頁。
 * 只處理本網站自己的東西——bat6623.github.io 底下的其他網站共用同一個網域，不能動它們的暫存。
 * 命盤紀錄、深淺色設定都不會被清掉。
 */
export async function forceUpdate(): Promise<void> {
  const latest = await fetchLatestVersion();

  // 只解除掛在本網站路徑底下的 Service Worker (目前沒有使用，保險起見)
  try {
    const regs = (await navigator.serviceWorker?.getRegistrations()) ?? [];
    await Promise.all(regs.filter((r) => new URL(r.scope).pathname.startsWith(import.meta.env.BASE_URL)).map((r) => r.unregister()));
  } catch {
    // 瀏覽器不支援就略過
  }

  try {
    sessionStorage.setItem(NOTICE_KEY, JSON.stringify({ from: APP_VERSION, latest }));
  } catch {
    // 無痕模式可能不能存；只是少了更新後的提示
  }

  const url = new URL(window.location.href);
  url.searchParams.set(PARAM, String(Date.now())); // 讓首頁的暫存失效
  window.location.replace(url.toString());
}

/**
 * 重新載入後呼叫：清掉網址上的參數，回傳要顯示的更新結果 (沒有按過更新就回 null)
 */
export function takeUpdateNotice(): string | null {
  const url = new URL(window.location.href);
  if (url.searchParams.has(PARAM)) {
    url.searchParams.delete(PARAM);
    window.history.replaceState(null, '', url.toString());
  }
  let raw: string | null = null;
  try {
    raw = sessionStorage.getItem(NOTICE_KEY);
    sessionStorage.removeItem(NOTICE_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;
  const { from, latest } = JSON.parse(raw) as { from: string; latest: string | null };
  if (latest && latest !== APP_VERSION) {
    // 線上已是新版，但瀏覽器還是拿到舊檔 (多半是網路或 CDN 還沒更新完)
    return `線上最新是 ${latest}，這裡仍是 ${APP_VERSION}，請過一兩分鐘再試一次`;
  }
  if (from !== APP_VERSION) return `已更新到版本 ${APP_VERSION}（原本是 ${from}）`;
  return `已是最新版本 ${APP_VERSION}`;
}
