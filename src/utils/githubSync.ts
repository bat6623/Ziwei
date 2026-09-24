import type { BirthInput, ZiweiChartData } from '../types/ziwei';

// 存到 GitHub 的一筆命盤紀錄：只存重新排盤需要的生辰，不存算好的整張盤
export interface SavedRecord {
  id: string;
  createdAt: string;
  name: string;
  birthInput: BirthInput;
  solarBirth: string;
  fiveElementElement: string;
}

export interface GithubConfig {
  owner: string;
  repo: string;
  path: string;
  token: string;
}

const CONFIG_KEY = 'ziwei_github_sync';
const CACHE_KEY = 'ziwei_saved_charts';

export const DEFAULT_CONFIG: Omit<GithubConfig, 'token'> = {
  owner: 'bat6623',
  repo: 'ziwei-data',
  path: 'charts.json',
};

// 取得命盤的原始生辰；舊版存檔沒有 birthInput，就從國曆字串還原
export function getBirthInput(chart: ZiweiChartData): BirthInput {
  if (chart.birthInput) return chart.birthInput;
  const [date, time = '00:00'] = chart.userInfo.solarBirth.split(' ');
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  return { name: chart.userInfo.name, gender: chart.userInfo.gender, isLunar: false, year, month, day, hour, minute };
}

export function toRecord(chart: ZiweiChartData): SavedRecord {
  return {
    id: chart.id,
    createdAt: chart.createdAt,
    name: chart.userInfo.name,
    birthInput: getBirthInput(chart),
    solarBirth: chart.userInfo.solarBirth,
    fiveElementElement: chart.userInfo.fiveElementElement,
  };
}

// ---- 本機暫存 (離線時也看得到上次同步的清單) ----

export function loadCache(): SavedRecord[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as (SavedRecord | ZiweiChartData)[];
    // 舊版存的是整張命盤，這裡轉成新格式
    return list.map((item) => ('userInfo' in item ? toRecord(item) : item));
  } catch {
    return [];
  }
}

export function saveCache(records: SavedRecord[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(records));
  } catch {
    // 瀏覽器不給存就算了，GitHub 上仍有完整資料
  }
}

export function loadConfig(): GithubConfig | null {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    const cfg = raw ? (JSON.parse(raw) as GithubConfig) : null;
    return cfg?.token ? cfg : null;
  } catch {
    return null;
  }
}

export function saveConfig(cfg: GithubConfig | null) {
  try {
    if (cfg) localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
    else localStorage.removeItem(CONFIG_KEY);
  } catch {
    // 忽略
  }
}

// ---- GitHub Contents API ----

const toBase64 = (text: string) => {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin);
};

const fromBase64 = (b64: string) =>
  new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\s/g, '')), (c) => c.charCodeAt(0)));

const apiUrl = (cfg: GithubConfig) =>
  `https://api.github.com/repos/${encodeURIComponent(cfg.owner)}/${encodeURIComponent(cfg.repo)}/contents/${cfg.path.split('/').map(encodeURIComponent).join('/')}`;

const headers = (cfg: GithubConfig) => ({
  Authorization: `Bearer ${cfg.token}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
});

function explain(status: number): string {
  if (status === 401) return '金鑰無效或已過期';
  if (status === 403) return '金鑰沒有這個倉庫的讀寫權限';
  if (status === 404) return '找不到倉庫或檔案，請確認名稱，並確認金鑰有權限存取這個倉庫';
  if (status === 409) return '資料剛被其他裝置更新，請再試一次';
  return `GitHub 回應錯誤 (${status})`;
}

export async function pullRecords(cfg: GithubConfig): Promise<{ records: SavedRecord[]; sha: string | null }> {
  const res = await fetch(`${apiUrl(cfg)}?t=${Date.now()}`, { headers: headers(cfg), cache: 'no-store' });
  if (res.status === 404) {
    // 檔案還不存在：當作空清單，第一次儲存時會自動建立
    const repoRes = await fetch(`https://api.github.com/repos/${encodeURIComponent(cfg.owner)}/${encodeURIComponent(cfg.repo)}`, { headers: headers(cfg) });
    if (repoRes.ok) return { records: [], sha: null };
    throw new Error(explain(repoRes.status));
  }
  if (!res.ok) throw new Error(explain(res.status));
  const body = await res.json();
  const parsed = JSON.parse(fromBase64(body.content || '') || '[]');
  if (!Array.isArray(parsed)) throw new Error('GitHub 上的檔案格式不對，應該是一個清單');
  return { records: parsed as SavedRecord[], sha: body.sha };
}

async function pushRecords(cfg: GithubConfig, records: SavedRecord[], sha: string | null, message: string) {
  const res = await fetch(apiUrl(cfg), {
    method: 'PUT',
    headers: { ...headers(cfg), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      content: toBase64(JSON.stringify(records, null, 2) + '\n'),
      ...(sha ? { sha } : {}),
    }),
  });
  if (!res.ok) throw Object.assign(new Error(explain(res.status)), { status: res.status });
}

// 先拉最新的清單再修改、寫回；如果剛好撞到別的裝置同時寫入 (409)，重拉一次再試
export async function updateRecords(
  cfg: GithubConfig,
  change: (records: SavedRecord[]) => SavedRecord[],
  message: string,
): Promise<SavedRecord[]> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const { records, sha } = await pullRecords(cfg);
    const next = change(records);
    try {
      await pushRecords(cfg, next, sha, message);
      return next;
    } catch (e) {
      if ((e as { status?: number }).status !== 409 || attempt === 1) throw e;
    }
  }
  throw new Error(explain(409));
}
