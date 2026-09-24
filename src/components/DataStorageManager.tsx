import React, { useRef, useState } from 'react';
import type { ZiweiChartData } from '../types/ziwei';
import { Image as ImageIcon, Trash2, X, Download, History, Upload, FolderDown, RefreshCw } from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import { loadRecords, saveRecords, toRecord, type SavedRecord } from '../utils/records';
import { exportRecords, mergeRecords, parseBackupFile } from '../utils/backup';

interface DataStorageManagerProps {
  currentChart: ZiweiChartData;
  onLoadRecord: (record: SavedRecord) => void;
}

type Status = { kind: 'idle' | 'busy' | 'ok' | 'error'; text: string };

// 「3 天前」這類相對時間
function timeAgo(iso: string): string {
  const t = Date.parse(iso);
  if (!t) return '';
  const days = Math.floor((Date.now() - t) / 86400000);
  if (days <= 0) return '今天';
  if (days < 30) return `${days} 天前`;
  if (days < 365) return `${Math.floor(days / 30)} 個月前`;
  return `${Math.floor(days / 365)} 年前`;
}

const circleIcon = 'shrink-0 w-11 h-11 rounded-full border border-separator flex items-center justify-center text-label2';
const pillPrimary = 'h-11 px-5 rounded-full bg-accent text-on-accent text-[15px] font-medium hover:brightness-95 active:brightness-90 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer';
const pillOutline = 'h-11 px-5 rounded-full border border-separator text-[15px] text-label hover:bg-fill active:bg-fill2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer';

export const DataStorageManager: React.FC<DataStorageManagerProps> = ({ currentChart, onLoadRecord }) => {
  const [records, setRecords] = useState<SavedRecord[]>(loadRecords);
  const [status, setStatus] = useState<Status>({ kind: 'idle', text: '' });
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const applyRecords = (list: SavedRecord[]) => {
    setRecords(list);
    if (!saveRecords(list)) setStatus({ kind: 'error', text: '瀏覽器不允許存資料（可能是無痕模式），重新整理後紀錄會消失' });
  };

  const handleSave = () => {
    const record = toRecord(currentChart);
    applyRecords([record, ...records.filter((r) => r.id !== record.id)]);
    setStatus({ kind: 'ok', text: `已儲存「${record.name}」` });
  };

  const handleDelete = (record: SavedRecord) => {
    applyRecords(records.filter((r) => r.id !== record.id));
    setStatus({ kind: 'ok', text: `已刪除「${record.name}」` });
  };

  const handleClearAll = () => {
    if (!window.confirm('確定要刪除這台裝置上所有已儲存的命盤嗎？沒有匯出備份的話無法復原。')) return;
    applyRecords([]);
    setStatus({ kind: 'ok', text: '已刪除全部紀錄' });
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
      const result = mergeRecords(records, incoming);
      applyRecords(result.merged);
      const parts = [`新增 ${result.added} 筆`, result.updated ? `更新 ${result.updated} 筆` : '', skipped ? `略過 ${skipped} 筆格式不對的資料` : '']
        .filter(Boolean).join('、');
      setStatus({ kind: 'ok', text: `匯入完成：${parts}` });
    } catch (err) {
      setStatus({ kind: 'error', text: `匯入失敗：${(err as Error).message}` });
    }
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
      const bg = getComputedStyle(document.body).getPropertyValue('--c-card').trim() || '#ffffff';
      const canvas = await html2canvas(gridEl, { backgroundColor: bg, scale: 2, useCORS: true, logging: false });
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

  const statusColor = status.kind === 'error' ? 'text-danger' : status.kind === 'ok' ? 'text-ok' : 'text-label3';

  return (
    <div className="w-full max-w-5xl my-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px] items-start font-apple">
      {/* 命盤紀錄 */}
      <section className="bg-card rounded-[28px] p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className={circleIcon}><History className="w-[18px] h-[18px]" /></span>
          <h3 className="flex-1 text-[22px] font-light tracking-tight text-label">命盤紀錄 ({records.length})</h3>
          <div className="w-full sm:w-auto flex gap-2">
            <button type="button" onClick={handleSave} className={`flex-1 sm:flex-none ${pillPrimary}`}>儲存目前命盤</button>
            <button id="export-image-btn" type="button" onClick={handleExportImage} disabled={isExportingImage} className={`flex-1 sm:flex-none ${pillOutline}`}>
              {isExportingImage ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
              {isExportingImage ? '產生中…' : '匯出圖片'}
            </button>
          </div>
        </div>

        {status.text && (
          <p role="status" className={`mt-3 text-[13px] ${statusColor}`}>{status.text}</p>
        )}

        {records.length > 0 ? (
          <ul className="mt-3">
            {records.map((r) => (
              <li key={r.id} className="flex items-center gap-3 py-2">
                <button
                  type="button"
                  onClick={() => onLoadRecord(r)}
                  className="flex-1 min-w-0 flex items-center gap-3 text-left rounded-full hover:bg-fill/60 active:bg-fill -ml-1 pl-1 pr-3 py-1 cursor-pointer"
                >
                  <span className={`${circleIcon} font-serif text-[17px]`}>{r.name.charAt(0)}</span>
                  <span className="min-w-0">
                    <span className="block text-[17px] text-label truncate">{r.name}</span>
                    <span className="block text-[13px] text-label3 truncate">{r.solarBirth} · {r.fiveElementElement}</span>
                  </span>
                  <span className="hidden sm:block flex-1 h-px bg-separator mx-2" />
                  <span className="ml-auto shrink-0 text-[13px] text-label3">{timeAgo(r.createdAt)}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(r)}
                  aria-label={`刪除 ${r.name}`}
                  className="shrink-0 w-10 h-10 rounded-full border border-separator flex items-center justify-center text-label3 hover:text-danger hover:border-danger/40 active:bg-fill transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 mb-3 text-center text-[15px] text-label3">還沒有儲存的命盤</p>
        )}

        {records.length > 0 && (
          <div className="mt-3 flex justify-end">
            <button type="button" onClick={handleClearAll} className="h-9 px-4 rounded-full text-[13px] text-danger hover:bg-danger/10 cursor-pointer">
              刪除全部紀錄
            </button>
          </div>
        )}
      </section>

      {/* 備份到 iCloud (深色面板) */}
      <section className="dark island bg-card text-label rounded-[28px] p-4 sm:p-5">
        <h3 className="text-[22px] font-light tracking-tight">備份到 iCloud</h3>
        <p className="mt-1 text-[13px] text-label3">紀錄只存在這台裝置。換手機或清除瀏覽器資料前，先匯出一份。</p>

        <div className="mt-4 space-y-1">
          <button
            type="button"
            onClick={handleExportFile}
            disabled={records.length === 0}
            className="w-full flex items-center gap-3 rounded-full pr-4 py-1 text-left hover:bg-fill active:bg-fill2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <span className="shrink-0 w-11 h-11 rounded-full bg-accent text-on-accent flex items-center justify-center"><FolderDown className="w-[18px] h-[18px]" /></span>
            <span className="min-w-0">
              <span className="block text-[17px]">匯出紀錄檔</span>
              <span className="block text-[13px] text-label3">{records.length === 0 ? '還沒有紀錄可以匯出' : `共 ${records.length} 筆`}</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center gap-3 rounded-full pr-4 py-1 text-left hover:bg-fill active:bg-fill2 cursor-pointer"
          >
            <span className="shrink-0 w-11 h-11 rounded-full border border-separator flex items-center justify-center text-label"><Upload className="w-[18px] h-[18px]" /></span>
            <span className="min-w-0">
              <span className="block text-[17px]">從檔案匯入</span>
              <span className="block text-[13px] text-label3">與目前的紀錄合併，不會刪掉原有的</span>
            </span>
          </button>
          <input ref={fileInputRef} type="file" accept=".json,application/json" className="hidden" onChange={handleImportFile} />
        </div>

        <div className="mt-4 rounded-[20px] bg-card2 p-4 text-[13px] text-label2 leading-relaxed space-y-1.5">
          <p><span className="text-accent">iPhone／iPad</span>　匯出時選「儲存到檔案」→ iCloud 雲碟；匯入時在「檔案」裡挑選。</p>
          <p><span className="text-accent">Mac</span>　Chrome 可直接選 iCloud 雲碟資料夾；Safari 會存到「下載項目」，再拖進 iCloud 雲碟。</p>
        </div>
      </section>

      {/* 圖片預覽 */}
      {previewImage && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-4" onClick={() => setPreviewImage(null)}>
          <div className="bg-card w-full sm:max-w-2xl rounded-[28px] overflow-hidden flex flex-col max-h-[92vh]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 px-4 sm:px-5 h-16">
              <span className="flex-1 text-[22px] font-light text-label">命盤圖片</span>
              <button type="button" onClick={() => setPreviewImage(null)} aria-label="關閉" className="w-10 h-10 rounded-full border border-separator text-label flex items-center justify-center hover:bg-fill cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="px-5 pb-2 text-[13px] text-label3">手機上長按圖片即可存到照片</p>
            <div className="px-4 overflow-y-auto flex-1 flex justify-center">
              <img src={previewImage} alt={`紫微命盤_${currentChart.userInfo.name}`} className="max-w-full h-auto rounded-2xl" />
            </div>
            <div className="p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <button type="button" onClick={handleDownloadDirect} className={`w-full ${pillPrimary} flex items-center justify-center gap-2`}>
                <Download className="w-5 h-5" /> 下載 PNG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
