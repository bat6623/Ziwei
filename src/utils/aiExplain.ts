// Claude SDK 只有選 Claude 時才下載，平常不拖慢網頁
type AnthropicModule = typeof import('@anthropic-ai/sdk');
import type { ChartTabMode, EarthlyBranch, Mutagen, PalaceData, Star, ZiweiChartData } from '../types/ziwei';
import { FOUR_MUTAGENS_MAP } from './ziweiEngine';

// AI 設定：使用者自己的金鑰，只存在這台裝置；網站程式碼裡沒有任何金鑰
export type AiProvider = 'claude' | 'gemini';

export interface AiSettings {
  provider: AiProvider;
  claudeKey: string;
  geminiKey: string;
  /** Gemini 的模型名稱，從使用者金鑰查到的清單裡選 */
  geminiModel: string;
}

const SETTINGS_KEY = 'ziwei_ai_settings';
const EMPTY: AiSettings = { provider: 'gemini', claudeKey: '', geminiKey: '', geminiModel: '' };

export function loadAiSettings(): AiSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return EMPTY;
    const s = JSON.parse(raw) as Partial<AiSettings>;
    return {
      provider: s.provider === 'claude' ? 'claude' : 'gemini',
      claudeKey: typeof s.claudeKey === 'string' ? s.claudeKey : '',
      geminiKey: typeof s.geminiKey === 'string' ? s.geminiKey : '',
      geminiModel: typeof s.geminiModel === 'string' ? s.geminiModel : '',
    };
  } catch {
    return EMPTY;
  }
}

export function saveAiSettings(s: AiSettings): boolean {
  try {
    if (!s.claudeKey && !s.geminiKey) localStorage.removeItem(SETTINGS_KEY);
    else localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    return true;
  } catch {
    return false;
  }
}

/** 目前選的服務能不能用 (有金鑰；Gemini 還要選好模型) */
export const aiReady = (s: AiSettings) =>
  s.provider === 'claude' ? !!s.claudeKey : !!s.geminiKey && !!s.geminiModel;

const MODE_NAME: Record<ChartTabMode, string> = { feixing: '飛星盤', sanhe: '三合盤', sihua: '四化盤' };
const ZHI: EarthlyBranch[] = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const shift = (b: EarthlyBranch, n: number) => ZHI[(ZHI.indexOf(b) + n + 12) % 12];

const starText = (s: Star) => {
  const tags = [s.brightness, s.mutagen && `生年化${s.mutagen}`].filter(Boolean);
  return tags.length ? `${s.name}(${tags.join('，')})` : s.name;
};

const list = (stars: Star[]) => (stars.length ? stars.map(starText).join('、') : '無');

/**
 * 把目前畫面整理成給 AI 讀的文字。
 * 不放姓名、生日、備註：解說用不到，也不需要把個資送出去。
 */
export function buildChartContext(chart: ZiweiChartData, mode: ChartTabMode, selected: EarthlyBranch | null): string {
  const u = chart.userInfo;
  const byBranch = (b: EarthlyBranch) => chart.palaces.find((p) => p.branch === b)!;
  const findStar = (name: string) => chart.palaces.find((p) => [...p.mainStars, ...p.luckyStars].some((s) => s.name === name));
  const label = (p: PalaceData) => `${p.name}(${p.stem}${p.branch})`;
  const age = new Date().getFullYear() - (u.lunarBirthYear ?? new Date().getFullYear()) + 1;
  const ming = chart.palaces.find((p) => p.name === '命宮')!;

  const lines: string[] = [];
  lines.push(`盤面：${MODE_NAME[mode]}`);
  lines.push(`命主：${u.yinyangGender}，${u.fiveElementElement}，命主星${u.masterStar}，身主星${u.bodyMasterStar}，子年斗君${u.ziDou}，今年虛歲約${age}`);
  lines.push(`八字：${u.fourPillars.year} ${u.fourPillars.month} ${u.fourPillars.day} ${u.fourPillars.time}`);
  lines.push('');
  lines.push('十二宮（從命宮起，逆時針）：');
  for (let i = 0; i < 12; i++) {
    const p = byBranch(shift(ming.branch, -i));
    const extra = [p.isBodyPalace && '身宮', p.isLaiYinPalace && '來因宮', p.mainStars.length === 0 && '空宮(借對宮主星)']
      .filter(Boolean).join('、');
    lines.push(
      `- ${label(p)}${extra ? `［${extra}］` : ''} 大限${p.decadalRange[0]}~${p.decadalRange[1]}歲｜主星：${list(p.mainStars)}｜吉星：${list(p.luckyStars)}｜煞星：${list(p.badStars)}｜雜曜：${p.minorStars.map((s) => s.name).join('、') || '無'}｜長生十二神：${p.changsheng}`,
    );
  }

  // 每一宮宮干的自化 (化回本宮) 與化入對宮
  const selfLines: string[] = [];
  for (const p of chart.palaces) {
    for (const [m, starName] of Object.entries(FOUR_MUTAGENS_MAP[p.stem]) as [Mutagen, string][]) {
      const t = findStar(starName);
      if (!t) continue;
      if (t.branch === p.branch) selfLines.push(`${label(p)} 自化${m}（${starName}）`);
      else if (t.branch === shift(p.branch, 6)) selfLines.push(`${label(p)} 化${m}入對宮${label(t)}（${starName}）`);
    }
  }
  lines.push('');
  lines.push(`宮干自化：${selfLines.length ? selfLines.join('；') : '無'}`);

  if (selected) {
    const s = byBranch(selected);
    const sanfang = [6, 4, 8].map((n) => label(byBranch(shift(selected, n))));
    lines.push('');
    lines.push(`使用者目前點選的宮位：${label(s)}；三方四正：對宮 ${sanfang[0]}、三合 ${sanfang[1]}、${sanfang[2]}`);
    const fly = (Object.entries(FOUR_MUTAGENS_MAP[s.stem]) as [Mutagen, string][]).map(([m, starName]) => {
      const t = findStar(starName);
      return `化${m}→${starName}${t ? `在${label(t)}` : '(盤中無此星)'}`;
    });
    lines.push(`此宮宮干「${s.stem}」飛化：${fly.join('、')}`);
  }

  if (u.activeFlowCycleInfo) {
    lines.push('');
    lines.push(`使用者選的流運：${u.activeFlowCycleInfo}`);
    const flowPalaces = chart.palaces
      .filter((p) => p.dynamicDecadalName || p.flowLevelName)
      .map((p) => `${label(p)}=${[p.dynamicDecadalName, p.flowLevelName].filter(Boolean).join('、')}`);
    if (flowPalaces.length) lines.push(`流運宮位對照：${flowPalaces.join('；')}`);
    const flowMut = chart.palaces.flatMap((p) => (p.flowMutagens ?? []).map((fm) => `${fm.level === '大' ? '大限' : `流${fm.level}`}化${fm.mutagen}：${fm.starName}在${label(p)}`));
    if (flowMut.length) lines.push(`流運四化：${flowMut.join('；')}`);
    const decadal = chart.palaces.filter((p) => p.decadalStars?.length).map((p) => `${label(p)}：${p.decadalStars!.join('、')}`);
    if (decadal.length) lines.push(`大限流曜：${decadal.join('；')}`);
  } else {
    lines.push('');
    lines.push('使用者沒有選流運，看的是本命盤。');
  }
  return lines.join('\n');
}

/** 依目前畫面決定要 AI 回答什麼 */
export function buildQuestion(chart: ZiweiChartData, mode: ChartTabMode, selected: EarthlyBranch | null): string {
  const s = selected ? chart.palaces.find((p) => p.branch === selected) : null;
  const focus = [
    s ? `重點放在使用者點選的「${s.name}」和它的三方四正` : '先看命宮和整體格局',
    chart.userInfo.activeFlowCycleInfo ? `再說明所選流運（${chart.userInfo.activeFlowCycleInfo}）帶來的變化` : '',
    mode === 'feixing' && s ? `也解釋「${s.name}」宮干飛化到各宮的意思` : '',
    mode === 'sihua' ? '也解釋生年四化與各宮自化代表的意思' : '',
  ].filter(Boolean).join('，');
  return `請解說這張紫微斗數命盤目前畫面。${focus}。`;
}

const SYSTEM_PROMPT = `你是紫微斗數老師，替一般人看懂命盤。

寫作方式：
- 一律用繁體中文。用字簡單，像跟朋友聊天；用到術語（例如化忌、三方四正、空宮）時，用一句白話順便解釋。
- 只根據使用者提供的命盤資料解說，不要自己補星曜或改宮位。資料沒有的就不要說；不確定的說法就直接講不確定。
- 不同門派說法不一樣的地方，用「一般說法是…」帶過，不要講成定論。
- 不要嚇人，也不要打包票。健康、法律、投資方面只給方向，提醒找專業人士。
- 結尾加一行：命盤是參考，不是定數。

格式（會直接顯示在手機上）：
- 用「## 」當小標題，最多 4 個。
- 重點用「- 」條列，每點 1～2 句。可以用 **粗體** 標出關鍵字。
- 不要用表格、程式碼、連結、表情符號。
- 全文大約 600～900 字。

建議的段落：一句話總結 → 個性與優勢 → 要留意的地方 → （有選流運時）這段時間的重點。`;

const CLAUDE_MODEL = 'claude-opus-5-5';

export type AiErrorKind = 'auth' | 'permission' | 'rate' | 'network' | 'overloaded' | 'refusal' | 'other';

export class AiExplainError extends Error {
  kind: AiErrorKind;
  constructor(kind: AiErrorKind, message: string) {
    super(message);
    this.kind = kind;
  }
}

function toAiError(Anthropic: AnthropicModule['default'], e: unknown): AiExplainError {
  if (e instanceof AiExplainError) return e;
  if (e instanceof Anthropic.AuthenticationError) return new AiExplainError('auth', '金鑰不正確或已失效，請重新貼上');
  if (e instanceof Anthropic.PermissionDeniedError) return new AiExplainError('permission', '這把金鑰沒有使用權限，請到 Claude Console 確認');
  if (e instanceof Anthropic.RateLimitError) return new AiExplainError('rate', '使用太頻繁或額度用完，稍等一下再試，或到 Claude Console 查看額度');
  if (e instanceof Anthropic.APIConnectionError) return new AiExplainError('network', '連不上 AI 服務，請檢查網路');
  if (e instanceof Anthropic.InternalServerError) return new AiExplainError('overloaded', 'AI 服務暫時忙碌，請過一會兒再試');
  if (e instanceof Anthropic.APIError) return new AiExplainError('other', `AI 服務回傳錯誤（${e.status ?? '未知'}）`);
  return new AiExplainError('other', e instanceof Error ? e.message : '發生未知錯誤');
}

export interface ExplainHandle {
  /** 解說完成 (或失敗) 時結束 */
  done: Promise<void>;
  abort: () => void;
}

/**
 * 串流解說：每收到一段文字就呼叫 onText(目前全文)
 * 金鑰只在瀏覽器直接送到 Anthropic，不經過任何其他伺服器
 */
function explainWithClaude(
  apiKey: string,
  context: string,
  question: string,
  onText: (fullText: string) => void,
): ExplainHandle {
  let aborted = false;
  let abortStream: (() => void) | null = null;

  const done = (async () => {
    let Anthropic: AnthropicModule['default'];
    try {
      Anthropic = (await import('@anthropic-ai/sdk')).default;
    } catch {
      throw new AiExplainError('network', '載入失敗，請檢查網路後再試');
    }
    if (aborted) return;
    const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
    const stream = client.beta.messages.stream({
      model: CLAUDE_MODEL,
      max_tokens: 8000,
      output_config: { effort: 'medium' },
      // 安全審查誤擋時，伺服器自動改用建議的備援模型重跑
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `${question}\n\n<命盤資料>\n${context}\n</命盤資料>` }],
    });
    abortStream = () => stream.abort();

    let text = '';
    stream.on('text', (delta) => {
      text += delta;
      onText(text);
    });

    try {
      const msg = await stream.finalMessage();
      if (msg.stop_reason === 'refusal') throw new AiExplainError('refusal', 'AI 這次沒有回答，請換個宮位或流運再試一次');
    } catch (e) {
      if (e instanceof Anthropic.APIUserAbortError) return; // 使用者按了停止
      throw toAiError(Anthropic, e);
    }
  })();

  return {
    done,
    abort: () => {
      aborted = true;
      abortStream?.();
    },
  };
}

// ---------- Gemini (REST，直接從瀏覽器呼叫 Google 的 Generative Language API) ----------

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';

export interface GeminiModel {
  id: string; // 例如 "gemini-xxx"，不含 "models/" 前綴
  label: string;
}

async function geminiError(res: Response): Promise<AiExplainError> {
  let msg = '';
  try {
    const body = await res.json();
    msg = body?.error?.message ?? '';
  } catch {
    // 沒有內容就只看狀態碼
  }
  if (res.status === 400 && /api key/i.test(msg)) return new AiExplainError('auth', '金鑰不正確，請重新貼上');
  if (res.status === 401 || res.status === 403) return new AiExplainError('permission', '這把金鑰沒有使用權限，請到 Google AI Studio 確認');
  if (res.status === 404) return new AiExplainError('other', '找不到這個模型，請重新選擇模型');
  if (res.status === 429) return new AiExplainError('rate', '使用太頻繁或免費額度用完，稍等一下再試');
  if (res.status >= 500) return new AiExplainError('overloaded', 'AI 服務暫時忙碌，請過一會兒再試');
  return new AiExplainError('other', `AI 服務回傳錯誤（${res.status}）${msg ? `：${msg}` : ''}`);
}

/** 用使用者的金鑰查可以用的 Gemini 模型 (不寫死模型名稱，Google 改版也不會壞) */
export async function listGeminiModels(apiKey: string): Promise<GeminiModel[]> {
  let res: Response;
  try {
    res = await fetch(`${GEMINI_BASE}/models?pageSize=1000`, { headers: { 'x-goog-api-key': apiKey } });
  } catch {
    throw new AiExplainError('network', '連不上 Google，請檢查網路');
  }
  if (!res.ok) throw await geminiError(res);
  const body = (await res.json()) as {
    models?: { name: string; displayName?: string; supportedGenerationMethods?: string[] }[];
  };
  return (body.models ?? [])
    .filter((m) => m.supportedGenerationMethods?.includes('streamGenerateContent') && m.name.includes('gemini'))
    .map((m) => ({ id: m.name.replace(/^models\//, ''), label: m.displayName || m.name.replace(/^models\//, '') }));
}

function explainWithGemini(
  apiKey: string,
  model: string,
  context: string,
  question: string,
  onText: (fullText: string) => void,
): ExplainHandle {
  const controller = new AbortController();
  const done = (async () => {
    let res: Response;
    try {
      res = await fetch(`${GEMINI_BASE}/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`, {
        method: 'POST',
        signal: controller.signal,
        headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: 'user', parts: [{ text: `${question}\n\n<命盤資料>\n${context}\n</命盤資料>` }] }],
          generationConfig: { maxOutputTokens: 8000 },
        }),
      });
    } catch (e) {
      if (controller.signal.aborted) return;
      throw e instanceof AiExplainError ? e : new AiExplainError('network', '連不上 Google，請檢查網路');
    }
    if (!res.ok || !res.body) throw await geminiError(res);

    // 伺服器送來一行一行的 "data: {...}"
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let text = '';
    let blocked = false;
    try {
      for (;;) {
        const { value, done: finished } = await reader.read();
        if (finished) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const chunk = JSON.parse(line.slice(5)) as {
            candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] }; finishReason?: string }[];
            promptFeedback?: { blockReason?: string };
          };
          if (chunk.promptFeedback?.blockReason) blocked = true;
          const cand = chunk.candidates?.[0];
          if (cand?.finishReason && ['SAFETY', 'PROHIBITED_CONTENT', 'BLOCKLIST', 'RECITATION'].includes(cand.finishReason)) blocked = true;
          // thought=true 是模型的思考過程，不顯示
          const delta = (cand?.content?.parts ?? []).filter((p) => !p.thought).map((p) => p.text ?? '').join('');
          if (delta) {
            text += delta;
            onText(text);
          }
        }
      }
    } catch (e) {
      if (controller.signal.aborted) return;
      throw e instanceof AiExplainError ? e : new AiExplainError('network', '連線中斷，請再試一次');
    }
    if (blocked && !text) throw new AiExplainError('refusal', 'AI 這次沒有回答，請換個宮位或流運再試一次');
  })();
  return { done, abort: () => controller.abort() };
}

/** 依設定選用 Claude 或 Gemini 解說 */
export function explainChart(
  settings: AiSettings,
  context: string,
  question: string,
  onText: (fullText: string) => void,
): ExplainHandle {
  return settings.provider === 'claude'
    ? explainWithClaude(settings.claudeKey, context, question, onText)
    : explainWithGemini(settings.geminiKey, settings.geminiModel, context, question, onText);
}
