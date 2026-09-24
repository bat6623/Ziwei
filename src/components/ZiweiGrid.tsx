import React, { useState } from 'react';
import type { ZiweiChartData, PalaceData, EarthlyBranch, ChartTabMode, Mutagen } from '../types/ziwei';
import { FOUR_MUTAGENS_MAP } from '../utils/ziweiEngine';
import { PalaceCard } from './PalaceCard';
import { MUTAGEN_COLOR } from './chartColors';
import { CentralPanel } from './CentralPanel';

interface ZiweiGridProps {
  data: ZiweiChartData;
  mode: ChartTabMode; // 頁面切換模式: 飛星 | 三合 | 四化
  onShift?: (unit: 'day' | 'hour', delta: number) => void;
}

const ZHI: EarthlyBranch[] = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 地支在 4x4 盤面上的位置 [列, 欄]
const CELL: Record<EarthlyBranch, [number, number]> = {
  '巳': [0, 0], '午': [0, 1], '未': [0, 2], '申': [0, 3],
  '辰': [1, 0], '酉': [1, 3],
  '卯': [2, 0], '戌': [2, 3],
  '寅': [3, 0], '丑': [3, 1], '子': [3, 2], '亥': [3, 3],
};

// 宮位朝向中宮的那一點 (格子單位 0~4)：角落宮取內角，其餘取內側邊的中點
function innerPoint(branch: EarthlyBranch): [number, number] {
  const [r, c] = CELL[branch];
  const x = c === 0 ? 1 : c === 3 ? 3 : c + 0.5;
  const y = r === 0 ? 1 : r === 3 ? 3 : r + 0.5;
  return [x, y];
}

const shiftZhi = (b: EarthlyBranch, n: number) => ZHI[(ZHI.indexOf(b) + n + 12) % 12];

interface Line { from: EarthlyBranch; to: EarthlyBranch; color: string; label?: string }

export const ZiweiGrid: React.FC<ZiweiGridProps> = ({ data, mode, onShift }) => {
  const mingBranch = (data.palaces.find((p) => p.name === '命宮') || data.palaces[0]).branch;
  const [selectedBranch, setSelectedBranch] = useState<EarthlyBranch | null>(mingBranch);
  const [prevChartId, setPrevChartId] = useState<string>(data.id);
  // 換了一張新命盤時，預設改選新命盤的命宮
  if (prevChartId !== data.id) {
    setPrevChartId(data.id);
    setSelectedBranch(mingBranch);
  }

  const palaceOf = (b: EarthlyBranch): PalaceData => data.palaces.find((p) => p.branch === b) || data.palaces[0];
  const selected = selectedBranch ? palaceOf(selectedBranch) : null;

  // 連線
  const lines: Line[] = [];
  if (mode === 'sihua') {
    data.palaces.forEach((p) => {
      [...p.mainStars, ...p.luckyStars].forEach((s) => {
        if (s.mutagen) lines.push({ from: p.branch, to: shiftZhi(p.branch, 6), color: MUTAGEN_COLOR[s.mutagen], label: s.mutagen });
      });
    });
  } else if (selected) {
    // 三方四正：本宮 → 對宮、財帛位、官祿位，再連財官
    const b = selected.branch;
    const gray = '#9ca3af';
    lines.push(
      { from: b, to: shiftZhi(b, 6), color: gray },
      { from: b, to: shiftZhi(b, 4), color: gray },
      { from: b, to: shiftZhi(b, 8), color: gray },
      { from: shiftZhi(b, 4), to: shiftZhi(b, 8), color: gray },
    );
  }

  // 飛星模式：選取宮位的宮干，把祿權科忌飛到哪顆星
  const flyingMarks: Record<string, Mutagen[]> = {};
  if (mode === 'feixing' && selected) {
    Object.entries(FOUR_MUTAGENS_MAP[selected.stem]).forEach(([m, starName]) => {
      (flyingMarks[starName] ||= []).push(m as Mutagen);
    });
  }

  const handleSelect = (palace: PalaceData) => {
    setSelectedBranch((cur) => (cur === palace.branch ? null : palace.branch));
  };

  const renderCell = (b: EarthlyBranch) => (
    <PalaceCard
      key={b}
      palace={palaceOf(b)}
      mode={mode}
      isSelected={selectedBranch === b}
      flyingMarks={flyingMarks}
      onSelect={handleSelect}
    />
  );

  // 標字放在連線靠近起點 1/4 處
  const labelPos = (l: Line) => {
    const [x1, y1] = innerPoint(l.from);
    const [x2, y2] = innerPoint(l.to);
    return { left: `${((x1 * 3 + x2) / 16) * 100}%`, top: `${((y1 * 3 + y2) / 16) * 100}%` };
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div
        data-export="ziwei-grid"
        className="relative w-full max-w-5xl mx-auto bg-card p-1.5 sm:p-3 rounded-[28px]"
      >
        <div className="hidden sm:grid grid-cols-4 text-center text-[11px] text-label3 font-serif mb-1">
          <span>南偏東</span>
          <span>正南方</span>
          <span>南偏西</span>
          <span>西偏南</span>
        </div>

        <div className="relative">
          {/* 細線表格：用 1px 間距露出底色當格線 */}
          <div className="grid grid-cols-4 gap-px bg-separator w-full rounded-[20px] overflow-hidden">
            {(['巳', '午', '未', '申', '辰'] as EarthlyBranch[]).map(renderCell)}
            <div className="dark island col-span-2 row-span-2 bg-card text-label">
              <CentralPanel data={data} mode={mode} onShift={onShift} />
            </div>
            {(['酉', '卯', '戌', '寅', '丑', '子', '亥'] as EarthlyBranch[]).map(renderCell)}
          </div>

          {/* 連線：以格子單位繪製，線寬不隨縮放變形 */}
          {lines.length > 0 && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-30"
              viewBox="0 0 4 4"
              preserveAspectRatio="none"
            >
              {lines.map((l, i) => {
                const [x1, y1] = innerPoint(l.from);
                const [x2, y2] = innerPoint(l.to);
                return (
                  <line
                    key={i}
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke={l.color}
                    strokeWidth={mode === 'sihua' ? 1.5 : 1.2}
                    strokeDasharray="4 3"
                    vectorEffect="non-scaling-stroke"
                  />
                );
              })}
            </svg>
          )}
          {/* 四化連線的標字 (用 HTML 疊上，避免跟著 SVG 拉伸變形) */}
          {lines.filter((l) => l.label).map((l, i) => (
            <span
              key={`lb-${i}`}
              className="absolute z-30 pointer-events-none -translate-x-1/2 -translate-y-1/2 inline-flex items-center justify-center w-4 h-4 rounded-full bg-card text-[10px] font-bold border"
              style={{ ...labelPos(l), color: l.color, borderColor: l.color }}
            >
              {l.label}
            </span>
          ))}
        </div>

        <div className="hidden sm:grid grid-cols-4 text-center text-[11px] text-label3 font-serif mt-1">
          <span>東偏北</span>
          <span>北偏東</span>
          <span>正北方</span>
          <span>北偏西</span>
        </div>
      </div>
    </div>
  );
};
