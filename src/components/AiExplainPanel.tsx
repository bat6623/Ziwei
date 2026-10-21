import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, KeyRound, Square, RotateCw, Trash2 } from 'lucide-react';
import type { ChartTabMode, EarthlyBranch, ZiweiChartData } from '../types/ziwei';
import {
  AiExplainError,
  aiReady,
  buildChartContext,
  buildQuestion,
  explainChart,
  listGeminiModels,
  loadAiSettings,
  saveAiSettings,
  type AiSettings,
  type ExplainHandle,
  type GeminiModel,
} from '../utils/aiExplain';

interface AiExplainPanelProps {
  chart: ZiweiChartData;
  mode: ChartTabMode;
  selectedBranch: EarthlyBranch | null;
}

type Phase = 'idle' | 'thinking' | 'streaming' | 'done' | 'error';

const MODE_NAME: Record<ChartTabMode, string> = { feixing: '飛星盤', sanhe: '三合盤', sihua: '四化盤' };

// 只認「## 標題」「- 條列」「**粗體**」，其他照原文顯示 (不用 innerHTML，AI 回的字不會被當成網頁程式碼)
function renderInline(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') && part.length > 4
      ? <strong key={i} className="font-semibold text-label">{part.slice(2, -2)}</strong>
      : part,
  );
}

function renderAnswer(text: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let bullets: string[] = [];
  const flush = () => {
    if (!bullets.length) return;
    out.push(
      <ul key={`ul-${out.length}`} className="space-y-1.5 pl-1">
        {bullets.map((b, i) => (
          <li key={i} className="flex gap-2">
            <span aria-hidden className="mt-[0.6em] shrink-0 w-1.5 h-1.5 rounded-full bg-label3" />
            <span>{renderInline(b)}</span>
          </li>
        ))}
      </ul>,
    );
    bullets = [];
  };
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (/^[-*•]\s+/.test(line)) {
      bullets.push(line.replace(/^[-*•]\s+/, ''));
      continue;
    }
    flush();
    if (!line) continue;
    const h = line.match(/^#{1,4}\s+(.*)$/);
    if (h) out.push(<h4 key={`h-${out.length}`} className="pt-2 text-[17px] font-medium text-label">{renderInline(h[1])}</h4>);
    else out.push(<p key={`p-${out.length}`}>{renderInline(line)}</p>);
  }
  flush();
  return out;
}

export const AiExplainPanel: React.FC<AiExplainPanelProps> = ({ chart, mode, selectedBranch }) => {
  const [settings, setSettings] = useState<AiSettings>(loadAiSettings);
  const [editingKey, setEditingKey] = useState(false);
  // 設定表單的暫存值
  const [keyDraft, setKeyDraft] = useState('');
  const [models, setModels] = useState<GeminiModel[]>([]);
  const [modelDraft, setModelDraft] = useState(settings.geminiModel);
  const [checking, setChecking] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [answeredFor, setAnsweredFor] = useState('');
  const handleRef = useRef<ExplainHandle | null>(null);

  // 離開頁面時停掉還在跑的請求
  useEffect(() => () => handleRef.current?.abort(), []);

  const selected = selectedBranch ? chart.palaces.find((p) => p.branch === selectedBranch) : null;
  const context = buildChartContext(chart, mode, selectedBranch);
  const busy = phase === 'thinking' || phase === 'streaming';
  const stale = !!answer && answeredFor !== context && !busy;

  const ready = aiReady(settings);

  const run = () => {
    if (!ready || busy) return;
    handleRef.current?.abort();
    setPhase('thinking');
    setAnswer('');
    setError('');
    setAnsweredFor(context);
    const handle = explainChart(settings, context, buildQuestion(chart, mode, selectedBranch), (full) => {
      setPhase('streaming');
      setAnswer(full);
    });
    handleRef.current = handle;
    handle.done.then(
      () => { if (handleRef.current === handle) setPhase('done'); },
      (e: unknown) => {
        if (handleRef.current !== handle) return;
        setPhase('error');
        setError(e instanceof AiExplainError ? e.message : '發生未知錯誤');
        if (e instanceof AiExplainError && e.kind === 'auth') setEditingKey(true);
      },
    );
  };

  const stop = () => {
    handleRef.current?.abort();
    handleRef.current = null;
    setPhase(answer ? 'done' : 'idle');
  };

  const commit = (next: AiSettings) => {
    setError(saveAiSettings(next) ? '' : '瀏覽器不允許存資料（可能是無痕模式），金鑰只會保留到關閉頁面');
    setSettings(next);
    if (phase === 'error') setPhase('idle');
  };

  const openSettings = () => {
    setKeyDraft('');
    setModelDraft(settings.geminiModel);
    setEditingKey(true);
  };

  // 已存的金鑰 (表單沒填新的就沿用)
  const effectiveKey = keyDraft.trim() || settings.geminiKey;

  // 用金鑰查模型清單，預設選第一個名稱有 flash 的 (通常較快較便宜)
  const checkGemini = async () => {
    if (!effectiveKey) return;
    setChecking(true);
    setError('');
    try {
      const list = await listGeminiModels(effectiveKey);
      setModels(list);
      if (!list.some((m) => m.id === modelDraft)) setModelDraft((list.find((m) => /flash/i.test(m.id)) ?? list[0])?.id ?? '');
      if (!list.length) setError('這把金鑰查不到可用的 Gemini 模型');
    } catch (e) {
      setModels([]);
      setError(e instanceof AiExplainError ? e.message : '查詢模型失敗');
    } finally {
      setChecking(false);
    }
  };

  const canSave = !!effectiveKey && !!modelDraft;

  const saveKey = () => {
    if (!canSave) return;
    commit({ geminiKey: effectiveKey, geminiModel: modelDraft });
    setKeyDraft('');
    setEditingKey(false);
  };

  const removeKey = () => {
    commit({ geminiKey: '', geminiModel: '' });
    setModels([]);
    setModelDraft('');
    setKeyDraft('');
    setEditingKey(true);
  };

  const pill = 'h-11 px-5 rounded-full text-[15px] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';
  const primary = `${pill} bg-accent text-on-accent font-medium enabled:hover:brightness-95 enabled:active:brightness-90`;
  const outline = `${pill} border border-separator text-label enabled:hover:bg-fill enabled:active:bg-fill2`;

  const showKeyForm = !ready || editingKey;
  const providerName = `Gemini（${settings.geminiModel}）`;

  return (
    <section id="ai-explain" aria-label="AI 解說" className="w-full max-w-5xl rounded-[28px] bg-card p-4 sm:p-5 font-apple">
      <div className="flex flex-wrap items-center gap-3">
        <span className="shrink-0 w-11 h-11 rounded-full bg-panel text-white dark:bg-accent dark:text-on-accent flex items-center justify-center">
          <Sparkles className="w-[18px] h-[18px]" />
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="text-[22px] font-light tracking-tight text-label">AI 解說</h3>
          <p className="text-[13px] text-label3 line-clamp-2">
            {ready && !showKeyForm ? `${providerName}・` : ''}{MODE_NAME[mode]}・{selected ? `${selected.name}（${selected.stem}${selected.branch}）` : '未選宮位'}・
            {chart.userInfo.activeFlowCycleInfo ?? '本命盤'}
          </p>
        </div>
        {!showKeyForm && (
          <div className="w-full sm:w-auto flex gap-2">
            {busy ? (
              <button type="button" onClick={stop} className={`flex-1 sm:flex-none ${outline}`}>
                <Square className="w-4 h-4" /> 停止
              </button>
            ) : (
              <button type="button" onClick={run} className={`flex-1 sm:flex-none ${primary}`}>
                {answer ? <RotateCw className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                {answer ? '重新解說' : '解說目前畫面'}
              </button>
            )}
            <button
              type="button"
              onClick={openSettings}
              disabled={busy}
              aria-label="AI 設定"
              title={`AI 設定（目前用 ${providerName}）`}
              className="shrink-0 w-11 h-11 rounded-full border border-separator flex items-center justify-center text-label2 enabled:hover:bg-fill enabled:active:bg-fill2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {showKeyForm && (
        <div className="mt-4 rounded-[20px] bg-grouped p-4 space-y-3">
          <div>
            <label htmlFor="ai-key" className="block text-[15px] text-label">
              貼上你的 Gemini API 金鑰
            </label>
            <p className="mt-1 text-[13px] text-label3 leading-relaxed">
              到 Google AI Studio（aistudio.google.com）建立金鑰。金鑰只存在這台裝置，直接送到 Google，不會經過其他伺服器，費用由你的帳號支付。共用電腦請不要存。
            </p>
            <input
              id="ai-key"
              type="password"
              autoComplete="off"
              spellCheck={false}
              value={keyDraft}
              onChange={(e) => { setKeyDraft(e.target.value); setModels([]); }}
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return;
                if (!models.length) void checkGemini();
                else saveKey();
              }}
              placeholder={settings.geminiKey ? '已存金鑰（要換再貼新的）' : 'AIza…'}
              className="mt-2 w-full h-11 rounded-full bg-card px-5 text-[15px] text-label placeholder:text-label3 outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
              <div className="flex items-center gap-2">
                <label htmlFor="ai-model" className="flex-1 text-[15px] text-label">模型</label>
                <button
                  type="button"
                  onClick={checkGemini}
                  disabled={!effectiveKey || checking}
                  className="h-9 px-4 rounded-full border border-separator text-[13px] text-label enabled:hover:bg-fill enabled:active:bg-fill2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {checking ? '查詢中…' : models.length ? '重新查詢' : '用金鑰查詢可用模型'}
                </button>
              </div>
              <select
                id="ai-model"
                value={modelDraft}
                onChange={(e) => setModelDraft(e.target.value)}
                disabled={!models.length && !modelDraft}
                className="mt-2 w-full h-11 rounded-full bg-card px-5 text-[15px] text-label outline-none focus:ring-2 focus:ring-accent appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {!models.length && <option value={modelDraft}>{modelDraft || '先查詢可用模型'}</option>}
                {models.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
              <p className="mt-1 text-[12px] text-label3">名稱有 Flash 的較快、較便宜；Pro 較仔細。各模型的價格請看 Google 的說明。</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={saveKey} disabled={!canSave} className={`flex-1 sm:flex-none ${primary}`}>存在這台裝置</button>
            {ready && (
              <button type="button" onClick={() => { setEditingKey(false); setKeyDraft(''); setError(''); }} className={`flex-1 sm:flex-none ${outline}`}>取消</button>
            )}
          </div>
          {settings.geminiKey && (
            <button type="button" onClick={removeKey} className="h-9 px-4 rounded-full text-[13px] text-danger hover:bg-danger/10 active:bg-danger/20 flex items-center gap-1.5 cursor-pointer">
              <Trash2 className="w-3.5 h-3.5" /> 刪除已存的 Gemini 金鑰
            </button>
          )}
        </div>
      )}

      {!showKeyForm && phase === 'idle' && !answer && (
        <p className="mt-4 text-[14px] text-label3 leading-relaxed">
          先點一個宮位、選好流運，再按「解說目前畫面」。AI 只會收到命盤的星曜與宮位，不會收到姓名、生日和備註。
        </p>
      )}

      {error && <p role="alert" className="mt-4 text-[14px] text-danger">{error}</p>}

      {phase === 'thinking' && (
        <p role="status" className="mt-4 flex items-center gap-2 text-[14px] text-label3">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" /> AI 正在看盤，通常要十幾秒…
        </p>
      )}

      {answer && (
        <div aria-live="polite" className="mt-4 space-y-2.5 text-[15px] leading-relaxed text-label2">
          {stale && (
            <p className="rounded-[14px] bg-grouped px-3 py-2 text-[13px] text-label3">
              畫面已經換了（宮位、盤面或流運不同），這份解說是之前的畫面。按「重新解說」看新的。
            </p>
          )}
          {renderAnswer(answer)}
          {phase === 'streaming' && <span aria-hidden className="inline-block w-2 h-4 align-middle bg-label3 animate-pulse" />}
        </div>
      )}
    </section>
  );
};
