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
  onModeChange?: (mode: ChartTabMode) => void;
}

const MODES: { key: ChartTabMode; label: string }[] = [
  { key: 'feixing', label: '飛星' },
  { key: 'sanhe', label: '三合' },
  { key: 'sihua', label: '四化' },
];

const ZHI: EarthlyBranch[] = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 地支在 4x4 盤面上的位置 [列, 欄]
const CELL: Record<EarthlyBranch, [number, number]> = {
  '巳': [0, 0], '午': [0, 1], '未': [0, 2], '申': [0, 3],
  '辰': [1, 0], '酉': [1, 3],
  '卯': [2, 0], '戌': [2, 3],
  '寅': [3, 0], '丑': [3, 1], '子': [3, 2], '亥': [3, 3],
};

// 盤外方位 (照文墨天機)：角落宮標在左右兩側，其餘標在朝外那一邊
const DIRECTION: Record<EarthlyBranch, { text: string; side: 'top' | 'bottom' | 'left' | 'right' }> = {
  '巳': { text: '南偏東', side: 'left' }, '午': { text: '正南方', side: 'top' }, '未': { text: '南偏西', side: 'top' }, '申': { text: '西偏南', side: 'right' },
  '辰': { text: '東偏南', side: 'left' }, '酉': { text: '正西方', side: 'right' },
  '卯': { text: '正東方', side: 'left' }, '戌': { text: '西偏北', side: 'right' },
  '寅': { text: '東偏北', side: 'left' }, '丑': { text: '北偏東', side: 'bottom' }, '子': { text: '正北方', side: 'bottom' }, '亥': { text: '北偏西', side: 'right' },
};

const isCorner = (b: EarthlyBranch) => ['巳', '申', '寅', '亥'].includes(b);

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

export const ZiweiGrid: React.FC<ZiweiGridProps> = ({ data, mode, onShift, onModeChange }) => {
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
  // 自化箭頭：out = 宮干化到本宮的星 (箭頭朝外)；in = 化到對宮的星 (箭頭從內側指向對宮)
  const selfArrows: { branch: EarthlyBranch; color: string; label: string; inward?: boolean }[] = [];
  const flyingMarks: Record<string, Mutagen[]> = {};

  // 三種盤都照文墨天機：每一宮的宮干化到本宮 (箭頭朝外) 或對宮 (飛星、三合畫短箭頭；四化畫整條連線到對宮)
  data.palaces.forEach((p) => {
    (Object.entries(FOUR_MUTAGENS_MAP[p.stem]) as [Mutagen, string][]).forEach(([m, starName]) => {
      const target = findStar(starName);
      if (!target) return;
      const opp = shiftZhi(p.branch, 6);
      if (target.branch === p.branch) selfArrows.push({ branch: p.branch, color: MUTAGEN_COLOR[m], label: m });
      else if (target.branch === opp) {
        if (mode === 'sihua') lines.push({ from: p.branch, to: opp, color: MUTAGEN_COLOR[m], label: m, arrow: true, solid: true });
        else selfArrows.push({ branch: p.branch, color: MUTAGEN_COLOR[m], label: m, inward: true });
      }
    });
  });

  if (mode !== 'sihua' && selected) {
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
        // 自化已經由上面每一宮的箭頭標出來，這裡只畫飛到別宮的線
        if (target.branch !== b) lines.push({ from: b, to: target.branch, color: MUTAGEN_COLOR[m], label: m, arrow: true, solid: true });
      });
    }
  }

  // 三合模式：選取宮位的本宮、對宮、三方
  const sanFang = new Set<EarthlyBranch>(
    mode === 'sanhe' && selected ? [0, 4, 6, 8].map((n) => shiftZhi(selected.branch, n)) : [],
  );

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
      inSanFang={sanFang.has(b)}
      onSelect={handleSelect}
    />
  );

  // 同一對宮位有好幾條彩色線時，左右錯開，箭頭才不會疊在一起
  // 對宮互化 (A→B 與 B→A) 算同一組，一起錯開
  const pairKey = (l: Line) => [l.from, l.to].sort().join('');
  const pairCount: Record<string, number> = {};
  const pairIndex = lines.map((l) => {
    if (!l.arrow) return 0;
    const k = pairKey(l);
    pairCount[k] = (pairCount[k] || 0) + 1;
    return pairCount[k] - 1;
  });

  const ready = Object.keys(rects).length === 12;

  return (
    <div className="w-full flex flex-col items-center">
      <div
        data-export="ziwei-grid"
        className="relative w-full max-w-5xl mx-auto bg-card sm:p-2 rounded-[20px] sm:rounded-[28px]"
      >
        {/* 模式切換 (桌機放在命盤右上角；手機在底部列)，匯出圖片時不拍進去 */}
        {onModeChange && (
          <div data-html2canvas-ignore className="hidden sm:flex justify-end">
            <div role="tablist" aria-label="盤面模式" className="flex p-1 rounded-full bg-grouped">
              {MODES.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  role="tab"
                  aria-selected={mode === m.key}
                  onClick={() => onModeChange(m.key)}
                  className={`h-9 px-5 rounded-full text-[15px] transition-colors cursor-pointer ${
                    mode === m.key ? 'bg-accent text-on-accent' : 'text-label2 hover:text-label hover:bg-card2'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={wrapRef} className="relative m-3.5 sm:m-5">
          {/* 細線表格：用 1px 間距露出底色當格線 */}
          <div className="grid grid-cols-4 gap-px bg-separator w-full rounded-[10px] sm:rounded-[14px] overflow-hidden">
            {(['巳', '午', '未', '申', '辰'] as EarthlyBranch[]).map(renderCell)}
            <div className="col-span-2 row-span-2 bg-card2 text-label">
              <CentralPanel data={data} mode={mode} onShift={onShift} />
            </div>
            {(['酉', '卯', '戌', '寅', '丑', '子', '亥'] as EarthlyBranch[]).map(renderCell)}
          </div>

          {/* 盤外方位 */}
          {ready && ZHI.map((b) => {
            const r = rects[b]!;
            const { text, side } = DIRECTION[b];
            const vertical = side === 'left' || side === 'right';
            const style: React.CSSProperties = vertical
              ? { top: (r.top + r.bottom) / 2, left: side === 'left' ? r.left : r.right, transform: `translate(${side === 'left' ? '-100%' : '0'}, -50%)` }
              : { left: (r.left + r.right) / 2, top: side === 'top' ? r.top : r.bottom, transform: `translate(-50%, ${side === 'top' ? '-100%' : '0'})` };
            return (
              <span
                key={`dir-${b}`}
                style={style}
                className={`absolute text-[9px] sm:text-[11px] leading-none text-label3 font-serif whitespace-nowrap pointer-events-none ${
                  vertical ? '[writing-mode:vertical-rl] px-0.5 sm:px-1' : 'py-0.5 sm:py-1'
                }`}
              >
                {text}
              </span>
            );
          })}

          {ready && (lines.length > 0 || selfArrows.length > 0) && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-30 overflow-visible">
              {lines.map((l, i) => {
                let [x1, y1] = innerPoint(l.from, rects[l.from]!);
                let [x2, y2] = innerPoint(l.to, rects[l.to]!);
                const len = Math.hypot(x2 - x1, y2 - y1) || 1;
                const ux = (x2 - x1) / len;
                const uy = (y2 - y1) / len;
                const n = pairCount[pairKey(l)] || 1;
                // 反方向的線，垂直方向也跟著反過來，要乘回去才會錯開到正確的一邊
                const flip = l.from === pairKey(l).charAt(0) ? 1 : -1;
                const off = l.arrow ? (pairIndex[i] - (n - 1) / 2) * 6 * flip : 0;
                x1 += -uy * off; y1 += ux * off; x2 += -uy * off; y2 += ux * off;
                const tipX = x2 - ux * 2;
                const tipY = y2 - uy * 2;
                const head = 9;
                // 四化盤的線都穿過中宮，標字放靠近箭頭那端才不會擠在正中間
                const at = mode === 'sihua' ? 0.8 : 0.62;
                const lx = x1 + (x2 - x1) * at;
                const ly = y1 + (y2 - y1) * at;
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

              {/* 自化：宮干化到本宮 (朝外) 或對宮 (朝內)，在宮位外緣畫往外的箭頭 */}
              {selfArrows.map((a, i) => {
                const r = rects[a.branch]!;
                const out = outerPoint(a.branch, r);
                const dir: Pt = a.inward ? [-out.dir[0], -out.dir[1]] : out.dir;
                const p: Pt = a.inward ? innerPoint(a.branch, r) : out.p;
                const px = -dir[1];
                const py = dir[0];
                // 同一宮同一方向的箭頭並排；朝外的箭頭避開方位字
                const group = selfArrows.filter((x) => x.branch === a.branch && !!x.inward === !!a.inward);
                const k = group.indexOf(a);
                const base = !a.inward && !isCorner(a.branch) ? 26 : 0;
                const o = base + (k - (group.length - 1) / 2) * 10;
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

      </div>
    </div>
  );
};
