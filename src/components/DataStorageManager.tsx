import React, { useState, useEffect } from 'react';
import type { ZiweiChartData } from '../types/ziwei';
import { Save, Database, Image as ImageIcon, Trash2, RefreshCw, X, Download, Share2 } from 'lucide-react';
import html2canvas from 'html2canvas';

interface DataStorageManagerProps {
  currentChart: ZiweiChartData;
  onLoadChart: (chart: ZiweiChartData) => void;
  onClearCache?: () => void;
}

export const DataStorageManager: React.FC<DataStorageManagerProps> = ({ currentChart, onLoadChart, onClearCache }) => {
  const [savedCharts, setSavedCharts] = useState<ZiweiChartData[]>([]);
  const [isExportingImage, setIsExportingImage] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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

  // 儲存至本機歷史紀錄
  const handleSaveToLocalStorage = () => {
    const updated = [currentChart, ...savedCharts.filter((c) => c.id !== currentChart.id)];
    setSavedCharts(updated);
    localStorage.setItem('ziwei_saved_charts', JSON.stringify(updated));
    alert(`成功儲存命盤「${currentChart.userInfo.name}」至本機紀錄！`);
  };

  const handleDeleteRecord = (id: string) => {
    const updated = savedCharts.filter((c) => c.id !== id);
    setSavedCharts(updated);
    localStorage.setItem('ziwei_saved_charts', JSON.stringify(updated));
  };

  // 清除快取與暫存
  const handleClearAllCache = async () => {
    if (window.confirm('確定要清除所有本機快取與歷史儲存紀錄嗎？')) {
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

  // 匯出圖片並支援直接存入手機照片庫
  const handleExportImage = async () => {
    setIsExportingImage(true);
    try {
      const gridEl = document.querySelector('.max-w-5xl') as HTMLElement;
      if (gridEl) {
        const canvas = await html2canvas(gridEl, {
          backgroundColor: '#f8fafc',
          scale: 2, // 2倍高清畫質
        });
        const imageDataUrl = canvas.toDataURL('image/png');
        setPreviewImage(imageDataUrl);

        // 如果手機支援 Web Share API，嘗試叫出系統原生分享/存圖選單
        canvas.toBlob(async (blob) => {
          if (blob && navigator.share && navigator.canShare) {
            const file = new File([blob], `紫微命盤_${currentChart.userInfo.name}.png`, { type: 'image/png' });
            if (navigator.canShare({ files: [file] })) {
              try {
                await navigator.share({
                  title: `紫微命盤_${currentChart.userInfo.name}`,
                  files: [file],
                });
              } catch (shareError) {
                console.log('Share dismissed or failed', shareError);
              }
            }
          }
        }, 'image/png');
      }
    } catch (e) {
      console.error('Image export failed', e);
      alert('圖片繪製失敗，請重試');
    } finally {
      setIsExportingImage(false);
    }
  };

  // 傳統下載觸發 (桌面電腦用)
  const handleDownloadDirect = () => {
    if (!previewImage) return;
    const link = document.createElement('a');
    link.href = previewImage;
    link.download = `紫微命盤_${currentChart.userInfo.name}.png`;
    link.click();
  };

  return (
    <div className="w-full max-w-5xl bg-white border border-slate-200 rounded-xl p-4 my-6 shadow-xs text-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-amber-600" />
          <h3 className="text-base font-bold text-amber-900 font-serif">命盤儲存與圖片匯出管理</h3>
        </div>

        {/* 簡化後的操作按鈕組 */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 儲存命盤圖片 */}
          <button
            onClick={handleExportImage}
            disabled={isExportingImage}
            className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition shadow-2xs disabled:opacity-50 cursor-pointer"
          >
            <ImageIcon className="w-4 h-4" /> {isExportingImage ? '正在繪製圖片...' : '匯出/儲存命盤圖片'}
          </button>

          {/* 儲存至本機紀錄 */}
          <button
            onClick={handleSaveToLocalStorage}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
          >
            <Save className="w-4 h-4" /> 儲存目前命盤紀錄
          </button>

          {/* 清除快取 */}
          <button
            onClick={handleClearAllCache}
            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            title="清除所有本機快取與歷史紀錄"
          >
            <RefreshCw className="w-4 h-4 text-rose-600" /> 清除快取
          </button>
        </div>
      </div>

      {/* 本機歷史紀錄清單 */}
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

      {/* 手機相冊儲存與圖片預覽 Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-3 sm:p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex justify-between items-center">
              <div className="flex items-center gap-2 font-bold font-serif text-sm sm:text-base">
                <ImageIcon className="w-5 h-5 text-purple-200" />
                命盤圖片 - 可存入手機照片相簿
              </div>
              <button
                onClick={() => setPreviewImage(null)}
                className="text-purple-100 hover:text-white p-1 rounded-lg hover:bg-purple-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 提示 Banner */}
            <div className="bg-amber-50 border-b border-amber-200 p-2.5 text-center text-xs font-bold text-amber-900 flex items-center justify-center gap-1.5">
              <Share2 className="w-4 h-4 text-amber-600" />
              <span>手機用戶提示：<strong>長按下方圖片即可直接「儲存影像」存入手機照片庫！</strong></span>
            </div>

            {/* 圖片預覽區 */}
            <div className="p-3 overflow-y-auto flex-1 flex justify-center bg-slate-900/5">
              <img
                src={previewImage}
                alt={`紫微命盤_${currentChart.userInfo.name}`}
                className="max-w-full h-auto rounded-lg shadow-md border border-slate-200"
              />
            </div>

            {/* 下方按鈕組 */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap justify-end gap-2">
              <button
                onClick={handleDownloadDirect}
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Download className="w-4 h-4" /> 電腦版直接下載 PNG
              </button>
              <button
                onClick={() => setPreviewImage(null)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
