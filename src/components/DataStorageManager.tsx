import React, { useState, useEffect } from 'react';
import type { ZiweiChartData } from '../types/ziwei';
import { Download, Upload, Save, Database, Code, Image as ImageIcon, Trash2, Check, FileJson, RefreshCw } from 'lucide-react';
import html2canvas from 'html2canvas';

interface DataStorageManagerProps {
  currentChart: ZiweiChartData;
  onLoadChart: (chart: ZiweiChartData) => void;
  onClearCache?: () => void;
}

export const DataStorageManager: React.FC<DataStorageManagerProps> = ({ currentChart, onLoadChart, onClearCache }) => {
  const [savedCharts, setSavedCharts] = useState<ZiweiChartData[]>([]);
  const [showCodeModal, setShowCodeModal] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isExportingImage, setIsExportingImage] = useState<boolean>(false);

  useEffect(() => {
    try {
      const records = localStorage.getItem('ziwei_saved_charts');
      if (records) {
        setSavedCharts(JSON.parse(records));
      }
    } catch (e) {
      console.error('Failed to load saved charts', e);
    }
  }, []);

  const handleSaveToLocalStorage = () => {
    const updated = [currentChart, ...savedCharts.filter((c) => c.id !== currentChart.id)];
    setSavedCharts(updated);
    localStorage.setItem('ziwei_saved_charts', JSON.stringify(updated));
    alert(`成功儲存命盤「${currentChart.userInfo.name}」至本機庫！`);
  };

  const handleDeleteRecord = (id: string) => {
    const updated = savedCharts.filter((c) => c.id !== id);
    setSavedCharts(updated);
    localStorage.setItem('ziwei_saved_charts', JSON.stringify(updated));
  };

  // 清除快取與暫存 (Clear All Caches & LocalStorage)
  const handleClearAllCache = async () => {
    if (window.confirm('確定要清除所有本機快取、歷史儲存紀錄與瀏覽器快取嗎？')) {
      try {
        localStorage.clear();
        sessionStorage.clear();
        if ('caches' in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((key) => caches.delete(key)));
        }
        setSavedCharts([]);
        if (onClearCache) onClearCache();
        alert('已成功清除所有本機快取與歷史紀錄！');
      } catch (e) {
        console.error('Clear cache failed', e);
        alert('快取清除完畢！');
      }
    }
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentChart, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ziwei_${currentChart.userInfo.name}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.userInfo && parsed.palaces) {
            onLoadChart(parsed);
            alert('成功載入命盤 JSON！');
          } else {
            alert('無效的紫微命盤 JSON 格式！');
          }
        } catch (err) {
          alert('JSON 解析失敗，請檢查檔案內容');
        }
      };
    }
  };

  const handleExportImage = async () => {
    setIsExportingImage(true);
    try {
      const gridEl = document.querySelector('.max-w-5xl') as HTMLElement;
      if (gridEl) {
        const canvas = await html2canvas(gridEl, {
          backgroundColor: '#f8fafc',
          scale: 2,
        });
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = `紫微命盤_${currentChart.userInfo.name}.png`;
        link.click();
      }
    } catch (e) {
      console.error('Image export failed', e);
    } finally {
      setIsExportingImage(false);
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(currentChart, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl bg-white border border-slate-200 rounded-xl p-4 my-6 shadow-xs text-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-amber-600" />
          <h3 className="text-base font-bold text-amber-900 font-serif">命盤資料結構與儲存管理</h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSaveToLocalStorage}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" /> 儲存目前命盤
          </button>

          <button
            onClick={handleExportJson}
            className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> 匯出 JSON
          </button>

          <label className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-2xs">
            <Upload className="w-3.5 h-3.5" /> 匯入 JSON
            <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
          </label>

          <button
            onClick={handleExportImage}
            disabled={isExportingImage}
            className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition shadow-2xs disabled:opacity-50 cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5" /> {isExportingImage ? '繪製中...' : '匯出圖片 PNG'}
          </button>

          <button
            onClick={handleClearAllCache}
            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
            title="清除所有本機快取與歷史紀錄"
          >
            <RefreshCw className="w-3.5 h-3.5 text-rose-600" /> 清除快取
          </button>

          <button
            onClick={() => setShowCodeModal(true)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
          >
            <Code className="w-3.5 h-3.5" /> 檢視 JSON
          </button>
        </div>
      </div>

      {savedCharts.length > 0 && (
        <div className="mt-4">
          <h4 className="text-xs font-semibold text-slate-500 mb-2">本機已存命盤歷史紀錄 ({savedCharts.length})：</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {savedCharts.map((chart) => (
              <div
                key={chart.id}
                className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-200 hover:border-amber-400 transition"
              >
                <div onClick={() => onLoadChart(chart)} className="cursor-pointer">
                  <div className="text-sm font-bold text-slate-900">{chart.userInfo.name}</div>
                  <div className="text-[10px] text-slate-500">
                    {chart.userInfo.solarBirth} ({chart.userInfo.fiveElementElement})
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteRecord(chart.id)}
                  className="text-slate-400 hover:text-rose-600 p-1 transition cursor-pointer"
                  title="刪除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {showCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-2 text-slate-900 font-bold font-serif">
                <FileJson className="w-5 h-5 text-amber-600" />
                紫微斗數全盤 JSON 資料結構
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyJson}
                  className="bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-amber-600 transition shadow-2xs cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Code className="w-3.5 h-3.5" />}
                  {copied ? '已複製 JSON' : '複製全盤 JSON'}
                </button>
                <button
                  onClick={() => setShowCodeModal(false)}
                  className="text-slate-500 hover:text-slate-900 px-2 py-1 font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-4 overflow-y-auto font-mono text-xs text-emerald-400 bg-slate-950 flex-1">
              <pre>{JSON.stringify(currentChart, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
