import React, { useCallback, useEffect, useState } from 'react';
import type { ZiweiChartData } from '../types/ziwei';
import { Image as ImageIcon, Trash2, X, Download, ChevronRight, RefreshCw, Cloud, Check } from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import {
  DEFAULT_CONFIG,
  loadCache,
  loadConfig,
  pullRecords,
  saveCache,
  saveConfig,
  toRecord,
  updateRecords,
  type GithubConfig,
  type SavedRecord,
} from '../utils/githubSync';

interface DataStorageManagerProps {
  currentChart: ZiweiChartData;
  onLoadRecord: (record: SavedRecord) => void;
}

type Status = { kind: 'idle' | 'busy' | 'ok' | 'error'; text: string };

const TOKEN_URL = 'https://github.com/settings/personal-access-tokens/new';

export const DataStorageManager: React.FC<DataStorageManagerProps> = ({ currentChart, onLoadRecord }) => {
  const [records, setRecords] = useState<SavedRecord[]>(loadCache);
  const [config, setConfig] = useState<GithubConfig | null>(loadConfig);
  // 已連線時，一打開網頁就是「同步中」
  const [status, setStatus] = useState<Status>(() =>
    loadConfig() ? { kind: 'busy', text: '正在從 GitHub 同步…' } : { kind: 'idle', text: '' });
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState('');
  const [repoInput, setRepoInput] = useState(`${DEFAULT_CONFIG.owner}/${DEFAULT_CONFIG.repo}`);
  const [showSetup, setShowSetup] = useState(false);

  const applyRecords = (list: SavedRecord[]) => {
    setRecords(list);
    saveCache(list);
  };

  // 從 GitHub 拉最新清單
  const sync = useCallback(async (cfg: GithubConfig) => {
    try {
      const { records: list } = await pullRecords(cfg);
      setRecords(list);
      saveCache(list);
      setStatus({ kind: 'ok', text: `已同步 · ${list.length} 筆` });
    } catch (e) {
      setStatus({ kind: 'error', text: `同步失敗：${(e as Error).message}。目前顯示的是這台裝置上次存下的清單。` });
    }
  }, []);

  // 每次打開網頁都拉一次最新資料
  useEffect(() => {
    if (config) void sync(config);
  }, [config, sync]);

  const handleSave = async () => {
    const record = toRecord(currentChart);
    const merge = (list: SavedRecord[]) => [record, ...list.filter((r) => r.id !== record.id)];
    if (!config) {
      applyRecords(merge(records));
      setStatus({ kind: 'ok', text: `已存「${record.name}」到這台裝置` });
      return;
    }
    setStatus({ kind: 'busy', text: '正在存到 GitHub…' });
    try {
      applyRecords(await updateRecords(config, merge, `儲存命盤：${record.name}`));
      setStatus({ kind: 'ok', text: `已存「${record.name}」到 GitHub` });
    } catch (e) {
      setStatus({ kind: 'error', text: `沒有存成功：${(e as Error).message}` });
    }
  };

  const handleDelete = async (record: SavedRecord) => {
    const drop = (list: SavedRecord[]) => list.filter((r) => r.id !== record.id);
    if (!config) {
      applyRecords(drop(records));
      return;
    }
    setStatus({ kind: 'busy', text: '正在刪除…' });
    try {
      applyRecords(await updateRecords(config, drop, `刪除命盤：${record.name}`));
      setStatus({ kind: 'ok', text: `已刪除「${record.name}」` });
    } catch (e) {
      setStatus({ kind: 'error', text: `沒有刪除成功：${(e as Error).message}` });
    }
  };

  const handleClearAll = async () => {
    const where = config ? 'GitHub 與這台裝置上' : '這台裝置上';
    if (!window.confirm(`確定要刪除${where}所有已儲存的命盤嗎？`)) return;
    if (!config) {
      applyRecords([]);
      return;
    }
    setStatus({ kind: 'busy', text: '正在刪除全部紀錄…' });
    try {
      applyRecords(await updateRecords(config, () => [], '清除全部命盤'));
      setStatus({ kind: 'ok', text: '已刪除全部紀錄（GitHub 的版本紀錄裡仍可找回）' });
    } catch (e) {
      setStatus({ kind: 'error', text: `沒有刪除成功：${(e as Error).message}` });
    }
  };

  const handleConnect = async () => {
    const [owner, repo] = repoInput.trim().split('/');
    const token = tokenInput.trim();
    if (!owner || !repo || !token) {
      setStatus({ kind: 'error', text: '請填寫倉庫（帳號/倉庫名）和金鑰' });
      return;
    }
    const cfg: GithubConfig = { owner, repo, path: DEFAULT_CONFIG.path, token };
    setStatus({ kind: 'busy', text: '正在連線…' });
    try {
      const { records: remote } = await pullRecords(cfg);
      // 第一次連線時，把只存在這台裝置的紀錄一併上傳
      const localOnly = records.filter((r) => !remote.some((x) => x.id === r.id));
      const list = localOnly.length
        ? await updateRecords(cfg, (l) => [...l, ...localOnly.filter((r) => !l.some((x) => x.id === r.id))], `匯入 ${localOnly.length} 筆本機紀錄`)
        : remote;
      saveConfig(cfg);
      setConfig(cfg);
      applyRecords(list);
      setTokenInput('');
      setShowSetup(false);
      setStatus({ kind: 'ok', text: `已連線 · ${list.length} 筆${localOnly.length ? `（含上傳 ${localOnly.length} 筆本機紀錄）` : ''}` });
    } catch (e) {
      setStatus({ kind: 'error', text: `連線失敗：${(e as Error).message}` });
    }
  };

  const handleDisconnect = () => {
    if (!window.confirm('中斷後這台裝置會刪除金鑰，GitHub 上的資料不受影響。確定嗎？')) return;
    saveConfig(null);
    setConfig(null);
    setStatus({ kind: 'idle', text: '' });
  };

  // 匯出命盤圖片
  const handleExportImage = async () => {
    setIsExportingImage(true);
    try {
      const gridEl = document.querySelector('[data-export="ziwei-grid"]') as HTMLElement | null;
      if (!gridEl) {
        setStatus({ kind: 'error', text: '找不到命盤區塊，請重新整理後再試' });
        return;
      }
      const canvas = await html2canvas(gridEl, { backgroundColor: '#ffffff', scale: 2, useCORS: true, logging: false });
      setPreviewImage(canvas.toDataURL('image/png'));

      // 手機支援系統分享選單時直接叫出來
      if (navigator.share && navigator.canShare) {
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          const file = new File([blob], `紫微命盤_${currentChart.userInfo.name}.png`, { type: 'image/png' });
          if (navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({ title: `紫微命盤_${currentChart.userInfo.name}`, files: [file] });
            } catch {
              // 使用者關掉分享選單
            }
          }
        }, 'image/png');
      }
    } catch (e) {
      console.error('Image export failed', e);
      setStatus({ kind: 'error', text: '圖片產生失敗，請重新整理後再試' });
    } finally {
      setIsExportingImage(false);
    }
  };

  const handleDownloadDirect = () => {
    if (!previewImage) return;
    const link = document.createElement('a');
    link.href = previewImage;
    link.download = `紫微命盤_${currentChart.userInfo.name}.png`;
    link.click();
  };

  const busy = status.kind === 'busy';
  const statusColor = status.kind === 'error' ? 'text-[#ff3b30]' : status.kind === 'ok' ? 'text-[#34c759]' : 'text-[#8e8e93]';

  return (
    <div className="w-full max-w-5xl my-6 space-y-6 font-apple">
      {/* 命盤紀錄 */}
      <section>
        <div className="flex items-end justify-between px-4 mb-1.5">
          <h3 className="text-[13px] uppercase tracking-wide text-[#6d6d72]">命盤紀錄</h3>
          <span className="text-[13px] text-[#8e8e93]">
            {config ? `GitHub · ${config.owner}/${config.repo}` : '只存在這台裝置'}
          </span>
        </div>

        <div className="bg-white rounded-2xl overflow-hidden">
          <div className="flex gap-2 p-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={busy}
              className="flex-1 h-11 rounded-xl bg-[#007aff] text-white text-[15px] font-semibold active:bg-[#0062cc] disabled:opacity-40 transition-colors cursor-pointer"
            >
              儲存目前命盤
            </button>
            <button
              id="export-image-btn"
              type="button"
              onClick={handleExportImage}
              disabled={isExportingImage}
              className="flex-1 h-11 rounded-xl bg-[#007aff]/10 text-[#007aff] text-[15px] font-semibold active:bg-[#007aff]/20 disabled:opacity-40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ImageIcon className="w-4 h-4" />
              {isExportingImage ? '產生中…' : '匯出圖片'}
            </button>
          </div>

          {status.text && (
            <p role="status" className={`px-4 pb-3 -mt-1 text-[13px] flex items-center gap-1.5 ${statusColor}`}>
              {busy && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              {status.text}
            </p>
          )}

          {records.length > 0 ? (
            <ul className="border-t border-[#c6c6c8]/60">
              {records.map((r) => (
                <li key={r.id} className="flex items-center pl-4 group">
                  <button
                    type="button"
                    onClick={() => onLoadRecord(r)}
                    className="flex-1 min-w-0 flex items-center justify-between py-2.5 pr-2 border-b border-[#c6c6c8]/60 group-last:border-b-0 text-left active:bg-[#e5e5ea] cursor-pointer"
                  >
                    <span className="min-w-0">
                      <span className="block text-[17px] text-black truncate">{r.name}</span>
                      <span className="block text-[13px] text-[#8e8e93]">{r.solarBirth} · {r.fiveElementElement}</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#c7c7cc] shrink-0" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(r)}
                    disabled={busy}
                    aria-label={`刪除 ${r.name}`}
                    className="self-stretch px-4 border-b border-[#c6c6c8]/60 group-last:border-b-0 text-[#ff3b30] active:bg-[#ffe5e3] disabled:opacity-40 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="border-t border-[#c6c6c8]/60 px-4 py-6 text-center text-[15px] text-[#8e8e93]">還沒有儲存的命盤</p>
          )}
        </div>

        {records.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            disabled={busy}
            className="mt-2 w-full h-11 rounded-2xl bg-white text-[#ff3b30] text-[15px] active:bg-[#e5e5ea] disabled:opacity-40 cursor-pointer"
          >
            刪除全部紀錄
          </button>
        )}
      </section>

      {/* GitHub 同步設定 */}
      <section>
        <h3 className="px-4 mb-1.5 text-[13px] uppercase tracking-wide text-[#6d6d72]">GitHub 同步</h3>
        <div className="bg-white rounded-2xl overflow-hidden">
          {config ? (
            <>
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[#c6c6c8]/60">
                <span className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center"><Cloud className="w-4 h-4" /></span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[17px] text-black">已連線</span>
                  <span className="block text-[13px] text-[#8e8e93] truncate">{config.owner}/{config.repo} · {config.path}</span>
                </span>
                <Check className="w-5 h-5 text-[#34c759]" />
              </div>
              <button type="button" onClick={() => { setStatus({ kind: 'busy', text: '正在從 GitHub 同步…' }); void sync(config); }} disabled={busy} className="w-full text-left px-4 py-3 text-[17px] text-[#007aff] border-b border-[#c6c6c8]/60 active:bg-[#e5e5ea] disabled:opacity-40 cursor-pointer">
                立即重新同步
              </button>
              <button type="button" onClick={handleDisconnect} className="w-full text-left px-4 py-3 text-[17px] text-[#ff3b30] active:bg-[#e5e5ea] cursor-pointer">
                中斷連線並刪除這台裝置的金鑰
              </button>
            </>
          ) : showSetup ? (
            <div className="p-4 space-y-3">
              <ol className="text-[13px] text-[#3c3c43] space-y-1 list-decimal pl-5">
                <li>
                  到 GitHub{' '}
                  <a href={TOKEN_URL} target="_blank" rel="noreferrer" className="text-[#007aff] underline">建立金鑰</a>
                  （Fine-grained token）
                </li>
                <li>「Repository access」選 Only select repositories，只勾 <b>{DEFAULT_CONFIG.repo}</b></li>
                <li>「Permissions」把 <b>Contents</b> 設成 Read and write</li>
                <li>產生後複製，貼到下面</li>
              </ol>
              <label className="block">
                <span className="text-[13px] text-[#6d6d72]">倉庫</span>
                <input
                  value={repoInput}
                  onChange={(e) => setRepoInput(e.target.value)}
                  className="mt-1 w-full h-11 px-3 rounded-xl bg-[#f2f2f7] text-[17px] outline-none focus:ring-2 focus:ring-[#007aff]/40"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
              </label>
              <label className="block">
                <span className="text-[13px] text-[#6d6d72]">金鑰</span>
                <input
                  type="password"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="github_pat_…"
                  className="mt-1 w-full h-11 px-3 rounded-xl bg-[#f2f2f7] text-[17px] outline-none focus:ring-2 focus:ring-[#007aff]/40"
                  autoComplete="off"
                  spellCheck={false}
                />
              </label>
              <p className="text-[12px] text-[#8e8e93]">
                金鑰只存在這台裝置的瀏覽器，不會放進網站程式。請勿在共用電腦上連線。
              </p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowSetup(false)} className="flex-1 h-11 rounded-xl bg-[#f2f2f7] text-[#007aff] text-[15px] font-semibold active:bg-[#e5e5ea] cursor-pointer">
                  取消
                </button>
                <button type="button" onClick={handleConnect} disabled={busy} className="flex-1 h-11 rounded-xl bg-[#007aff] text-white text-[15px] font-semibold active:bg-[#0062cc] disabled:opacity-40 cursor-pointer">
                  連線
                </button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setShowSetup(true)} className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-[#e5e5ea] cursor-pointer">
              <span className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center"><Cloud className="w-4 h-4" /></span>
              <span className="flex-1">
                <span className="block text-[17px] text-black">連線 GitHub</span>
                <span className="block text-[13px] text-[#8e8e93]">紀錄存到私人倉庫，換裝置、重新整理都拉得到</span>
              </span>
              <ChevronRight className="w-4 h-4 text-[#c7c7cc]" />
            </button>
          )}
        </div>
      </section>

      {/* 圖片預覽 */}
      {previewImage && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-[#f2f2f7] w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="relative flex items-center justify-center h-14 px-4">
              <span className="text-[17px] font-semibold text-black">命盤圖片</span>
              <button type="button" onClick={() => setPreviewImage(null)} aria-label="關閉" className="absolute right-3 w-8 h-8 rounded-full bg-[#e5e5ea] text-[#8e8e93] flex items-center justify-center cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="px-4 pb-2 text-center text-[13px] text-[#8e8e93]">手機上長按圖片即可存到照片</p>
            <div className="px-4 overflow-y-auto flex-1 flex justify-center">
              <img src={previewImage} alt={`紫微命盤_${currentChart.userInfo.name}`} className="max-w-full h-auto rounded-xl" />
            </div>
            <div className="p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <button type="button" onClick={handleDownloadDirect} className="w-full h-12 rounded-xl bg-[#007aff] text-white text-[17px] font-semibold active:bg-[#0062cc] flex items-center justify-center gap-2 cursor-pointer">
                <Download className="w-5 h-5" /> 下載 PNG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
