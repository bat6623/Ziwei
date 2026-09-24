import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { ZiweiChartData } from '../types/ziwei';
import { Image as ImageIcon, Trash2, X, Download, ChevronRight, RefreshCw, Cloud, Check, Upload, FolderDown } from 'lucide-react';
import { exportRecords, mergeRecords, parseBackupFile } from '../utils/backup';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // 匯出紀錄檔 (存到 iCloud 雲碟等位置)
  const handleExportFile = async () => {
    try {
      const result = await exportRecords(records);
      if (result === 'cancelled') return;
      setStatus({
        kind: 'ok',
        text: result === 'downloaded'
          ? `已下載 ${records.length} 筆紀錄，可以把檔案移到 iCloud 雲碟保存`
          : `已匯出 ${records.length} 筆紀錄`,
      });
    } catch (e) {
      setStatus({ kind: 'error', text: `匯出失敗：${(e as Error).message}` });
    }
  };

  // 從紀錄檔匯入，與現有清單合併
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // 同一個檔案可以再選一次
    if (!file) return;
    try {
      const { records: incoming, skipped } = await parseBackupFile(file);
      if (incoming.length === 0) {
        setStatus({ kind: 'error', text: '檔案裡沒有可以匯入的命盤' });
        return;
      }
      let result = mergeRecords(records, incoming);
      if (config) {
        setStatus({ kind: 'busy', text: '正在匯入並同步到 GitHub…' });
        const next = await updateRecords(config, (list) => {
          result = mergeRecords(list, incoming);
          return result.merged;
        }, `匯入 ${incoming.length} 筆命盤`);
        applyRecords(next);
      } else {
        applyRecords(result.merged);
      }
      const parts = [`新增 ${result.added} 筆`, result.updated ? `更新 ${result.updated} 筆` : '', skipped ? `略過 ${skipped} 筆格式不對的資料` : '']
        .filter(Boolean).join('、');
      setStatus({ kind: 'ok', text: `匯入完成：${parts}` });
    } catch (err) {
      setStatus({ kind: 'error', text: `匯入失敗：${(err as Error).message}` });
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
      const canvas = await html2canvas(gridEl, { backgroundColor: getComputedStyle(document.body).getPropertyValue('--c-card').trim() || '#ffffff', scale: 2, useCORS: true, logging: false });
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
  const statusColor = status.kind === 'error' ? 'text-danger' : status.kind === 'ok' ? 'text-ok' : 'text-label3';

  return (
    <div className="w-full max-w-5xl my-6 space-y-6 font-apple">
      {/* 命盤紀錄 */}
      <section>
        <div className="flex items-end justify-between px-4 mb-1.5">
          <h3 className="text-[13px] uppercase tracking-wide text-label3">命盤紀錄</h3>
          <span className="text-[13px] text-label3">
            {config ? `GitHub · ${config.owner}/${config.repo}` : '只存在這台裝置'}
          </span>
        </div>

        <div className="bg-card rounded-2xl overflow-hidden">
          <div className="flex gap-2 p-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={busy}
              className="flex-1 h-11 rounded-xl bg-tint text-white text-[15px] font-semibold active:bg-tint-pressed disabled:opacity-40 transition-colors cursor-pointer"
            >
              儲存目前命盤
            </button>
            <button
              id="export-image-btn"
              type="button"
              onClick={handleExportImage}
              disabled={isExportingImage}
              className="flex-1 h-11 rounded-xl bg-tint/10 text-tint text-[15px] font-semibold active:bg-tint/20 disabled:opacity-40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
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
            <ul className="border-t border-separator/60">
              {records.map((r) => (
                <li key={r.id} className="flex items-center pl-4 group">
                  <button
                    type="button"
                    onClick={() => onLoadRecord(r)}
                    className="flex-1 min-w-0 flex items-center justify-between py-2.5 pr-2 border-b border-separator/60 group-last:border-b-0 text-left active:bg-fill cursor-pointer"
                  >
                    <span className="min-w-0">
                      <span className="block text-[17px] text-label truncate">{r.name}</span>
                      <span className="block text-[13px] text-label3">{r.solarBirth} · {r.fiveElementElement}</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-label4 shrink-0" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(r)}
                    disabled={busy}
                    aria-label={`刪除 ${r.name}`}
                    className="self-stretch px-4 border-b border-separator/60 group-last:border-b-0 text-danger active:bg-danger/10 disabled:opacity-40 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="border-t border-separator/60 px-4 py-6 text-center text-[15px] text-label3">還沒有儲存的命盤</p>
          )}
        </div>

        {records.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            disabled={busy}
            className="mt-2 w-full h-11 rounded-2xl bg-card text-danger text-[15px] active:bg-fill disabled:opacity-40 cursor-pointer"
          >
            刪除全部紀錄
          </button>
        )}
      </section>

      {/* 備份到 iCloud：手動匯出／匯入紀錄檔 */}
      <section>
        <h3 className="px-4 mb-1.5 text-[13px] uppercase tracking-wide text-label3">備份到 iCloud</h3>
        <div className="bg-card rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={handleExportFile}
            disabled={records.length === 0 || busy}
            className="w-full flex items-center gap-3 px-4 py-3 text-left border-b border-separator/60 active:bg-fill disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <span className="w-7 h-7 rounded-lg bg-tint text-white flex items-center justify-center"><FolderDown className="w-4 h-4" /></span>
            <span className="flex-1">
              <span className="block text-[17px] text-label">匯出紀錄檔</span>
              <span className="block text-[13px] text-label3">
                {records.length === 0 ? '還沒有紀錄可以匯出' : `共 ${records.length} 筆`}
              </span>
            </span>
            <ChevronRight className="w-4 h-4 text-label4" />
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={busy}
            className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-fill disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <span className="w-7 h-7 rounded-lg bg-ok text-white flex items-center justify-center"><Upload className="w-4 h-4" /></span>
            <span className="flex-1">
              <span className="block text-[17px] text-label">從檔案匯入</span>
              <span className="block text-[13px] text-label3">與目前的紀錄合併，不會刪掉原有的</span>
            </span>
            <ChevronRight className="w-4 h-4 text-label4" />
          </button>
          <input ref={fileInputRef} type="file" accept=".json,application/json" className="hidden" onChange={handleImportFile} />
        </div>
        <p className="px-4 mt-1.5 text-[13px] text-label3 leading-snug">
          iPhone／iPad：匯出時選「儲存到檔案」→ iCloud 雲碟；匯入時在「檔案」裡挑選。<br />
          Mac：Chrome 會讓你直接選 iCloud 雲碟資料夾；Safari 會存到「下載項目」，再拖進 iCloud 雲碟即可。
        </p>
      </section>

      {/* GitHub 同步設定 */}
      <section>
        <h3 className="px-4 mb-1.5 text-[13px] uppercase tracking-wide text-label3">GitHub 同步</h3>
        <div className="bg-card rounded-2xl overflow-hidden">
          {config ? (
            <>
              <div className="flex items-center gap-3 px-4 py-3 border-b border-separator/60">
                <span className="w-7 h-7 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center"><Cloud className="w-4 h-4" /></span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[17px] text-label">已連線</span>
                  <span className="block text-[13px] text-label3 truncate">{config.owner}/{config.repo} · {config.path}</span>
                </span>
                <Check className="w-5 h-5 text-ok" />
              </div>
              <button type="button" onClick={() => { setStatus({ kind: 'busy', text: '正在從 GitHub 同步…' }); void sync(config); }} disabled={busy} className="w-full text-left px-4 py-3 text-[17px] text-tint border-b border-separator/60 active:bg-fill disabled:opacity-40 cursor-pointer">
                立即重新同步
              </button>
              <button type="button" onClick={handleDisconnect} className="w-full text-left px-4 py-3 text-[17px] text-danger active:bg-fill cursor-pointer">
                中斷連線並刪除這台裝置的金鑰
              </button>
            </>
          ) : showSetup ? (
            <div className="p-4 space-y-3">
              <ol className="text-[13px] text-label2 space-y-1 list-decimal pl-5">
                <li>
                  到 GitHub{' '}
                  <a href={TOKEN_URL} target="_blank" rel="noreferrer" className="text-tint underline">建立金鑰</a>
                  （Fine-grained token）
                </li>
                <li>「Repository access」選 Only select repositories，只勾 <b>{DEFAULT_CONFIG.repo}</b></li>
                <li>「Permissions」把 <b>Contents</b> 設成 Read and write</li>
                <li>產生後複製，貼到下面</li>
              </ol>
              <label className="block">
                <span className="text-[13px] text-label3">倉庫</span>
                <input
                  value={repoInput}
                  onChange={(e) => setRepoInput(e.target.value)}
                  className="mt-1 w-full h-11 px-3 rounded-xl bg-grouped text-[17px] outline-none focus:ring-2 focus:ring-tint/40"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
              </label>
              <label className="block">
                <span className="text-[13px] text-label3">金鑰</span>
                <input
                  type="password"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="github_pat_…"
                  className="mt-1 w-full h-11 px-3 rounded-xl bg-grouped text-[17px] outline-none focus:ring-2 focus:ring-tint/40"
                  autoComplete="off"
                  spellCheck={false}
                />
              </label>
              <p className="text-[12px] text-label3">
                金鑰只存在這台裝置的瀏覽器，不會放進網站程式。請勿在共用電腦上連線。
              </p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowSetup(false)} className="flex-1 h-11 rounded-xl bg-grouped text-tint text-[15px] font-semibold active:bg-fill cursor-pointer">
                  取消
                </button>
                <button type="button" onClick={handleConnect} disabled={busy} className="flex-1 h-11 rounded-xl bg-tint text-white text-[15px] font-semibold active:bg-tint-pressed disabled:opacity-40 cursor-pointer">
                  連線
                </button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setShowSetup(true)} className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-fill cursor-pointer">
              <span className="w-7 h-7 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center"><Cloud className="w-4 h-4" /></span>
              <span className="flex-1">
                <span className="block text-[17px] text-label">連線 GitHub</span>
                <span className="block text-[13px] text-label3">紀錄存到私人倉庫，換裝置、重新整理都拉得到</span>
              </span>
              <ChevronRight className="w-4 h-4 text-label4" />
            </button>
          )}
        </div>
      </section>

      {/* 圖片預覽 */}
      {previewImage && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-grouped w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="relative flex items-center justify-center h-14 px-4">
              <span className="text-[17px] font-semibold text-label">命盤圖片</span>
              <button type="button" onClick={() => setPreviewImage(null)} aria-label="關閉" className="absolute right-3 w-8 h-8 rounded-full bg-fill text-label3 flex items-center justify-center cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="px-4 pb-2 text-center text-[13px] text-label3">手機上長按圖片即可存到照片</p>
            <div className="px-4 overflow-y-auto flex-1 flex justify-center">
              <img src={previewImage} alt={`紫微命盤_${currentChart.userInfo.name}`} className="max-w-full h-auto rounded-xl" />
            </div>
            <div className="p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <button type="button" onClick={handleDownloadDirect} className="w-full h-12 rounded-xl bg-tint text-white text-[17px] font-semibold active:bg-tint-pressed flex items-center justify-center gap-2 cursor-pointer">
                <Download className="w-5 h-5" /> 下載 PNG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
