import React, { useState, useRef, useEffect } from 'react';
import type { ZiweiChartData, PalaceData, EarthlyBranch, ChartTabMode, HeavenlyStem, Mutagen } from '../types/ziwei';
import { PalaceCard } from './PalaceCard';
import { CentralPanel } from './CentralPanel';

interface ZiweiGridProps {
  data: ZiweiChartData;
  mode: ChartTabMode; // 頁面切換模式: 飛星 | 三合 | 四化
  onPalaceSelect?: (palace: PalaceData | null) => void;
}

interface FlyingLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  type: Mutagen | 'sanhe' | 'sihua';
  label: string;
  color: string;
}

// 十天干飛星四化對照表
const STEM_FLYING_MUTAGENS: Record<HeavenlyStem, Record<Mutagen, string>> = {
  '甲': { '祿': '廉貞', '權': '破軍', '科': '武曲', '忌': '太陽' },
  '乙': { '祿': '天機', '權': '天梁', '科': '紫微', '忌': '太陰' },
  '丙': { '祿': '天同', '權': '天機', '科': '文昌', '忌': '廉貞' },
  '丁': { '祿': '太陰', '權': '天同', '科': '天機', '忌': '巨門' },
  '戊': { '祿': '貪狼', '權': '太陰', '科': '右弼', '忌': '天機' },
  '己': { '祿': '武曲', '權': '貪狼', '科': '天梁', '忌': '文曲' },
  '庚': { '祿': '太陽', '權': '武曲', '科': '太陰', '忌': '天同' },
  '辛': { '祿': '巨門', '權': '太陽', '科': '文曲', '忌': '文昌' },
  '壬': { '祿': '天梁', '權': '紫微', '科': '左輔', '忌': '武曲' },
  '癸': { '祿': '破軍', '權': '巨門', '科': '太陰', '忌': '貪狼' }
};

export const ZiweiGrid: React.FC<ZiweiGridProps> = ({ data, mode, onPalaceSelect }) => {
  const [selectedPalace, setSelectedPalace] = useState<PalaceData | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [lineCoords, setLineCoords] = useState<FlyingLine[]>([]);

  // 取得三方四正宮位索引清單 (三合模式用)
  const getSanFangIndexList = (palace: PalaceData | null): number[] => {
    if (!palace) return [];
    const idx = palace.index;
    return [
      idx,
      (idx + 6) % 12,
      (idx + 4) % 12,
      (idx + 8) % 12,
    ];
  };

  const sanFangIndices = mode === 'sanhe'
    ? getSanFangIndexList(selectedPalace || data.palaces.find((p) => p.name === '命宮') || data.palaces[0])
    : [];

  // 當切換 mode 時，若當前未選中宮位，自動預設選中命宮
  useEffect(() => {
    if (!selectedPalace && (mode === 'feixing' || mode === 'sanhe')) {
      const mingPalace = data.palaces.find((p) => p.name === '命宮') || data.palaces[0];
      setSelectedPalace(mingPalace);
      if (onPalaceSelect) onPalaceSelect(mingPalace);
    }
  }, [mode, data]);

  // 根據 mode (飛星/三合/四化) 與 selectedPalace 動態計算引線
  useEffect(() => {
    const updateLines = () => {
      if (!containerRef.current) {
        setLineCoords([]);
        return;
      }

      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();

      // 取得指定宮位索引 DOM 中點
      const getPalaceCenterCoord = (idx: number) => {
        const el = container.querySelector(`[data-palace-index="${idx}"]`);
        if (el) {
          const rect = el.getBoundingClientRect();
          return {
            x: rect.left + rect.width / 2 - containerRect.left,
            y: rect.top + rect.height / 2 - containerRect.top,
          };
        }
        return null;
      };

      // 模式一：飛星模式 (Flying Star Mode)
      if (mode === 'feixing') {
        const activePalace = selectedPalace || data.palaces.find((p) => p.name === '命宮') || data.palaces[0];
        const stem = activePalace.stem; // 宮幹 (如 辛)
        const mutagens = STEM_FLYING_MUTAGENS[stem];
        const startCoord = getPalaceCenterCoord(activePalace.index);
        if (!startCoord) return;

        const lines: FlyingLine[] = [];
        const mutColors: Record<Mutagen, { color: string; label: string }> = {
          '祿': { color: '#059669', label: '飛祿' },
          '權': { color: '#e11d48', label: '飛權' },
          '科': { color: '#9333ea', label: '飛科' },
          '忌': { color: '#0284c7', label: '飛忌' },
        };

        (Object.keys(mutagens) as Mutagen[]).forEach((m) => {
          const targetStarName = mutagens[m];
          // 尋找全盤中帶有該星曜的宮位
          const targetPalace = data.palaces.find((p) =>
            [...p.mainStars, ...p.luckyStars].some((s) => s.name === targetStarName)
          );
          if (targetPalace && targetPalace.index !== activePalace.index) {
            const endCoord = getPalaceCenterCoord(targetPalace.index);
            if (endCoord) {
              lines.push({
                x1: startCoord.x,
                y1: startCoord.y,
                x2: endCoord.x,
                y2: endCoord.y,
                type: m,
                label: `${mutColors[m].label}(${targetStarName})`,
                color: mutColors[m].color,
              });
            }
          }
        });
        setLineCoords(lines);
      }
      // 模式二：三合模式 (Sanhe Mode)
      else if (mode === 'sanhe') {
        const activePalace = selectedPalace || data.palaces.find((p) => p.name === '命宮') || data.palaces[0];
        const indices = getSanFangIndexList(activePalace);
        const coords = indices.map((idx) => getPalaceCenterCoord(idx)).filter(Boolean) as { x: number; y: number }[];

        if (coords.length === 4) {
          const lines: FlyingLine[] = [
            { x1: coords[0].x, y1: coords[0].y, x2: coords[1].x, y2: coords[1].y, type: 'sanhe', label: '對宮衝照', color: '#0284c7' },
            { x1: coords[0].x, y1: coords[0].y, x2: coords[2].x, y2: coords[2].y, type: 'sanhe', label: '三方會照', color: '#d97706' },
            { x1: coords[0].x, y1: coords[0].y, x2: coords[3].x, y2: coords[3].y, type: 'sanhe', label: '三方會照', color: '#d97706' },
            { x1: coords[2].x, y1: coords[2].y, x2: coords[3].x, y2: coords[3].y, type: 'sanhe', label: '財官連線', color: '#059669' },
          ];
          setLineCoords(lines);
        }
      }
      // 模式三：四化模式 (Sihua Mode)
      else if (mode === 'sihua') {
        // 在四化模式下，連線全盤生年四化所在宮位與對宮
        const lines: FlyingLine[] = [];
        data.palaces.forEach((p) => {
          p.mainStars.concat(p.luckyStars).forEach((star) => {
            if (star.mutagen) {
              const startCoord = getPalaceCenterCoord(p.index);
              const oppositeIdx = (p.index + 6) % 12;
              const endCoord = getPalaceCenterCoord(oppositeIdx);
              if (startCoord && endCoord) {
                const mColors: Record<Mutagen, string> = { '祿': '#059669', '權': '#e11d48', '科': '#9333ea', '忌': '#0284c7' };
                lines.push({
                  x1: startCoord.x,
                  y1: startCoord.y,
                  x2: endCoord.x,
                  y2: endCoord.y,
                  type: star.mutagen,
                  label: `生年${star.mutagen}(${star.name})`,
                  color: mColors[star.mutagen] || '#d97706',
                });
              }
            }
          });
        });
        setLineCoords(lines);
      }
    };

    const timer = setTimeout(updateLines, 50);
    window.addEventListener('resize', updateLines);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateLines);
    };
  }, [selectedPalace, mode, data]);

  const getPalaceByBranch = (branch: EarthlyBranch): PalaceData => {
    return data.palaces.find((p) => p.branch === branch) || data.palaces[0];
  };

  // 再次點擊相同宮位時取消選中與連線
  const handleSelect = (palace: PalaceData) => {
    if (selectedPalace && selectedPalace.branch === palace.branch) {
      setSelectedPalace(null);
      setLineCoords([]);
      if (onPalaceSelect) onPalaceSelect(null);
    } else {
      setSelectedPalace(palace);
      if (onPalaceSelect) onPalaceSelect(palace);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div
        ref={containerRef}
        className="relative w-full max-w-5xl bg-slate-100 p-2 sm:p-3 rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
      >
        {/* 動態引線圖層 (飛星/三合/四化模式專屬連線) */}
        {lineCoords.length > 0 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-30">
            {lineCoords.map((line, i) => (
              <g key={i}>
                <line
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  stroke={line.color}
                  strokeWidth="2.5"
                  strokeDasharray="5 5"
                  className="animate-pulse"
                />
                <circle cx={(line.x1 + line.x2) / 2} cy={(line.y1 + line.y2) / 2} r="10" fill="#ffffff" stroke={line.color} strokeWidth="1.5" />
                <text
                  x={(line.x1 + line.x2) / 2}
                  y={(line.y1 + line.y2) / 2 + 3.5}
                  textAnchor="middle"
                  fill={line.color}
                  fontSize="10"
                  fontWeight="900"
                >
                  {line.type === '祿' ? 'A' : line.type === '權' ? 'B' : line.type === '科' ? 'C' : line.type === '忌' ? 'D' : '線'}
                </text>
              </g>
            ))}
          </svg>
        )}

        <div className="hidden sm:flex justify-between items-center text-[11px] text-amber-800 font-serif px-4 mb-1.5 font-bold">
          <span>↖ 南偏東</span>
          <span>正南方</span>
          <span>南偏西 ↗</span>
        </div>

        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 w-full">
          {/* Row 0: 巳, 午, 未, 申 */}
          <PalaceCard
            palace={getPalaceByBranch('巳')}
            isSelected={selectedPalace?.branch === '巳'}
            isSanFang={sanFangIndices.includes(getPalaceByBranch('巳').index)}
            onSelect={handleSelect}
          />
          <PalaceCard
            palace={getPalaceByBranch('午')}
            isSelected={selectedPalace?.branch === '午'}
            isSanFang={sanFangIndices.includes(getPalaceByBranch('午').index)}
            onSelect={handleSelect}
          />
          <PalaceCard
            palace={getPalaceByBranch('未')}
            isSelected={selectedPalace?.branch === '未'}
            isSanFang={sanFangIndices.includes(getPalaceByBranch('未').index)}
            onSelect={handleSelect}
          />
          <PalaceCard
            palace={getPalaceByBranch('申')}
            isSelected={selectedPalace?.branch === '申'}
            isSanFang={sanFangIndices.includes(getPalaceByBranch('申').index)}
            onSelect={handleSelect}
          />

          {/* Row 1: 辰, [中宮 2x2], 酉 */}
          <PalaceCard
            palace={getPalaceByBranch('辰')}
            isSelected={selectedPalace?.branch === '辰'}
            isSanFang={sanFangIndices.includes(getPalaceByBranch('辰').index)}
            onSelect={handleSelect}
          />
          <div className="col-span-2 row-span-2 z-20">
            <CentralPanel data={data} selectedPalaceName={selectedPalace?.name} />
          </div>
          <PalaceCard
            palace={getPalaceByBranch('酉')}
            isSelected={selectedPalace?.branch === '酉'}
            isSanFang={sanFangIndices.includes(getPalaceByBranch('酉').index)}
            onSelect={handleSelect}
          />

          {/* Row 2: 卯, [中宮 2x2], 戌 */}
          <PalaceCard
            palace={getPalaceByBranch('卯')}
            isSelected={selectedPalace?.branch === '卯'}
            isSanFang={sanFangIndices.includes(getPalaceByBranch('卯').index)}
            onSelect={handleSelect}
          />
          <PalaceCard
            palace={getPalaceByBranch('戌')}
            isSelected={selectedPalace?.branch === '戌'}
            isSanFang={sanFangIndices.includes(getPalaceByBranch('戌').index)}
            onSelect={handleSelect}
          />

          {/* Row 3: 寅, 丑, 子, 亥 */}
          <PalaceCard
            palace={getPalaceByBranch('寅')}
            isSelected={selectedPalace?.branch === '寅'}
            isSanFang={sanFangIndices.includes(getPalaceByBranch('寅').index)}
            onSelect={handleSelect}
          />
          <PalaceCard
            palace={getPalaceByBranch('丑')}
            isSelected={selectedPalace?.branch === '丑'}
            isSanFang={sanFangIndices.includes(getPalaceByBranch('丑').index)}
            onSelect={handleSelect}
          />
          <PalaceCard
            palace={getPalaceByBranch('子')}
            isSelected={selectedPalace?.branch === '子'}
            isSanFang={sanFangIndices.includes(getPalaceByBranch('子').index)}
            onSelect={handleSelect}
          />
          <PalaceCard
            palace={getPalaceByBranch('亥')}
            isSelected={selectedPalace?.branch === '亥'}
            isSanFang={sanFangIndices.includes(getPalaceByBranch('亥').index)}
            onSelect={handleSelect}
          />
        </div>

        <div className="hidden sm:flex justify-between items-center text-[11px] text-amber-800 font-serif px-4 mt-1.5 font-bold">
          <span>↙ 東偏北</span>
          <span>正北方</span>
          <span>北偏西 ↘</span>
        </div>
      </div>
    </div>
  );
};
