import React, { useLayoutEffect, useRef, useState } from 'react';
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

const shiftZhi = (b: EarthlyBranch, n: number) => ZHI[(ZHI.indexOf(b) + n + 12) % 12];

type Rect = { left: number; top: number; right: number; bottom: number };
type Pt = [number, number];

// 宮位朝向中宮的那一點：角落宮取內角，其餘取內側邊的中點
function innerPoint(b: EarthlyBranch, r: Rect): Pt {
  const [row, col] = CELL[b];
  const x = col === 0 ? r.right : col === 3 ? r.left : (r.left + r.right) / 2;
  const y = row === 0 ? r.bottom : row === 3 ? r.top : (r.top + r.bottom) / 2;
  return [x, y];
}

// 宮位朝外的那一點與朝外的方向 (自化箭頭用)
function outerPoint(b: EarthlyBranch, r: Rect): { p: Pt; dir: Pt } {
  const [row, col] = CELL[b];
  const dx = col === 0 ? -1 : col === 3 ? 1 : 0;
  const dy = row === 0 ? -1 : row === 3 ? 1 : 0;
  const x = dx < 0 ? r.left : dx > 0 ? r.right : (r.left + r.right) / 2;
  const y = dy < 0 ? r.top : dy > 0 ? r.bottom : (r.top + r.bottom) / 2;
  const len = Math.hypot(dx, dy) || 1;
  return { p: [x, y], dir: [dx / len, dy / len] };
}

// 量出每個宮位在盤面上的實際位置 (每列高度不一定相同，不能用平均格子算)
function usePalaceRects(ref: React.RefObject<HTMLDivElement | null>) {
  const [rects, setRects] = useState<Partial<Record<EarthlyBranch, Rect>>>({});
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const base = el.getBoundingClientRect();
      const next: Partial<Record<EarthlyBranch, Rect>> = {};
      el.querySelectorAll<HTMLElement>('[data-branch]').forEach((cell) => {
        const r = cell.getBoundingClientRect();
        next[cell.dataset.branch as EarthlyBranch] = {
          left: r.left - base.left, top: r.top - base.top, right: r.right - base.left, bottom: r.bottom - base.top,
        };
      });
      setRects(next);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return rects;
}

interface Line { from: EarthlyBranch; to: EarthlyBranch; color: string; label?: string; arrow?: boolean; solid?: boolean }

export const ZiweiGrid: React.FC<ZiweiGridProps> = ({ data, mode, onShift }) => {
  const mingBranch = (data.palaces.find((p) => p.name === '命宮') || data.palaces[0]).branch;
  const [selectedBranch, setSelectedBranch] = useState<EarthlyBranch | null>(mingBranch);
  const [prevChartId, setPrevChartId] = useState<string>(data.id);
  // 換了一張新命盤時，預設改選新命盤的命宮
  if (prevChartId !== data.id) {
    setPrevChartId(data.id);
    setSelectedBranch(mingBranch);
  }
  const wrapRef = useRef<HTMLDivElement>(null);
  const rects = usePalaceRects(wrapRef);

  const palaceOf = (b: EarthlyBranch): PalaceData => data.palaces.find((p) => p.branch === b) || data.palaces[0];
  const selected = selectedBranch ? palaceOf(selectedBranch) : null;
  const findStar = (name: string) =>
    data.palaces.find((p) => [...p.mainStars, ...p.luckyStars].some((s) => s.name === name));

  const lines: Line[] = [];
  const selfArrows: { branch: EarthlyBranch; color: string; label: string }[] = [];
  const flyingMarks: Record<string, Mutagen[]> = {};

  if (mode === 'sihua') {
    // 生年四化所在宮 → 對宮
    data.palaces.forEach((p) => {
      [...p.mainStars, ...p.luckyStars].forEach((s) => {
        if (s.mutagen) lines.push({ from: p.branch, to: shiftZhi(p.branch, 6), color: MUTAGEN_COLOR[s.mutagen], label: s.mutagen, arrow: true, solid: true });
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

    // 飛星模式：選取宮位的宮干把祿權科忌飛到哪顆星 → 星曜上色，並畫帶箭頭的連線
    if (mode === 'feixing') {
      (Object.entries(FOUR_MUTAGENS_MAP[selected.stem]) as [Mutagen, string][]).forEach(([m, starName]) => {
        (flyingMarks[starName] ||= []).push(m);
        const target = findStar(starName);
        if (!target) return;
        if (target.branch === b) selfArrows.push({ branch: b, color: MUTAGEN_COLOR[m], label: m });
        else lines.push({ from: b, to: target.branch, color: MUTAGEN_COLOR[m], label: m, arrow: true, solid: true });
      });
    }
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

  // 同一對宮位有好幾條彩色線時，左右錯開，箭頭才不會疊在一起
  const pairCount: Record<string, number> = {};
  const pairIndex = lines.map((l) => {
    if (!l.arrow) return 0;
    const k = `${l.from}${l.to}`;
    pairCount[k] = (pairCount[k] || 0) + 1;
    return pairCount[k] - 1;
  });

  const ready = Object.keys(rects).length === 12;

  return (
    <div className="w-full flex flex-col items-center">
      <div
        data-export="ziwei-grid"
        className="relative w-full max-w-5xl mx-auto bg-card p-2 sm:p-3 rounded-[20px] sm:rounded-[28px]"
      >
        <div className="hidden sm:grid grid-cols-4 text-center text-[11px] text-label3 font-serif mb-1">
          <span>南偏東</span>
          <span>正南方</span>
          <span>南偏西</span>
          <span>西偏南</span>
        </div>

        <div ref={wrapRef} className="relative">
          {/* 細線表格：用 1px 間距露出底色當格線 */}
          <div className="grid grid-cols-4 gap-px bg-separator w-full rounded-[10px] sm:rounded-[14px] overflow-hidden">
            {(['巳', '午', '未', '申', '辰'] as EarthlyBranch[]).map(renderCell)}
            <div className="col-span-2 row-span-2 bg-card2 text-label">
              <CentralPanel data={data} mode={mode} onShift={onShift} />
            </div>
            {(['酉', '卯', '戌', '寅', '丑', '子', '亥'] as EarthlyBranch[]).map(renderCell)}
          </div>

          {ready && (lines.length > 0 || selfArrows.length > 0) && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-30 overflow-visible">
              {lines.map((l, i) => {
                let [x1, y1] = innerPoint(l.from, rects[l.from]!);
                let [x2, y2] = innerPoint(l.to, rects[l.to]!);
                const len = Math.hypot(x2 - x1, y2 - y1) || 1;
                const ux = (x2 - x1) / len;
                const uy = (y2 - y1) / len;
                const n = pairCount[`${l.from}${l.to}`] || 1;
                const off = l.arrow ? (pairIndex[i] - (n - 1) / 2) * 6 : 0;
                x1 += -uy * off; y1 += ux * off; x2 += -uy * off; y2 += ux * off;
                const tipX = x2 - ux * 2;
                const tipY = y2 - uy * 2;
                const head = 9;
                const lx = x1 + (x2 - x1) * 0.62;
                const ly = y1 + (y2 - y1) * 0.62;
                return (
                  <g key={i}>
                    <line
                      x1={x1} y1={y1}
                      x2={l.arrow ? tipX - ux * head * 0.8 : x2}
                      y2={l.arrow ? tipY - uy * head * 0.8 : y2}
                      stroke={l.color}
                      strokeWidth={l.solid ? 1.6 : 1.2}
                      strokeDasharray={l.solid ? undefined : '4 3'}
                      strokeOpacity={l.solid ? 0.9 : 1}
                    />
                    {l.arrow && (
                      <polygon
                        points={`${tipX},${tipY} ${tipX - ux * head - uy * head * 0.45},${tipY - uy * head + ux * head * 0.45} ${tipX - ux * head + uy * head * 0.45},${tipY - uy * head - ux * head * 0.45}`}
                        fill={l.color}
                      />
                    )}
                    {/* 太短的線 (相鄰宮位) 不放標字，免得蓋住星名 */}
                    {l.label && len > 80 && (
                      <g>
                        <circle cx={lx} cy={ly} r={8} fill="var(--c-card)" stroke={l.color} strokeWidth={1.2} />
                        <text x={lx} y={ly + 3.5} textAnchor="middle" fontSize={10} fontWeight={700} fill={l.color}>{l.label}</text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* 自化：宮干飛回本宮，在宮位外緣畫往外的箭頭 */}
              {selfArrows.map((a, i) => {
                const { p, dir } = outerPoint(a.branch, rects[a.branch]!);
                const px = -dir[1];
                const py = dir[0];
                const o = (i - (selfArrows.length - 1) / 2) * 10;
                const sx = p[0] + px * o;
                const sy = p[1] + py * o;
                const ex = sx + dir[0] * 12;
                const ey = sy + dir[1] * 12;
                const head = 7;
                return (
                  <g key={`self-${i}`}>
                    <line x1={sx - dir[0] * 4} y1={sy - dir[1] * 4} x2={ex - dir[0] * head * 0.8} y2={ey - dir[1] * head * 0.8} stroke={a.color} strokeWidth={2} />
                    <polygon
                      points={`${ex},${ey} ${ex - dir[0] * head - px * head * 0.5},${ey - dir[1] * head - py * head * 0.5} ${ex - dir[0] * head + px * head * 0.5},${ey - dir[1] * head + py * head * 0.5}`}
                      fill={a.color}
                    />
                  </g>
                );
              })}
            </svg>
          )}
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
