import React, { useState, useRef, useEffect } from 'react';
import type { ZiweiChartData, PalaceData, EarthlyBranch } from '../types/ziwei';
import { PalaceCard } from './PalaceCard';
import { CentralPanel } from './CentralPanel';

interface ZiweiGridProps {
  data: ZiweiChartData;
  onPalaceSelect?: (palace: PalaceData | null) => void;
}

export const ZiweiGrid: React.FC<ZiweiGridProps> = ({ data, onPalaceSelect }) => {
  const [selectedPalace, setSelectedPalace] = useState<PalaceData | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [lineCoords, setLineCoords] = useState<{ x1: number; y1: number; x2: number; y2: number }[]>([]);

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

  const sanFangIndices = getSanFangIndexList(selectedPalace);

  useEffect(() => {
    if (!selectedPalace || !containerRef.current) {
      setLineCoords([]);
      return;
    }

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const indices = getSanFangIndexList(selectedPalace);

    const coords: { x: number; y: number }[] = [];
    indices.forEach((idx) => {
      const el = container.querySelector(`[data-palace-index="${idx}"]`);
      if (el) {
        const rect = el.getBoundingClientRect();
        coords.push({
          x: rect.left + rect.width / 2 - containerRect.left,
          y: rect.top + rect.height / 2 - containerRect.top,
        });
      }
    });

    if (coords.length === 4) {
      const lines = [
        { x1: coords[0].x, y1: coords[0].y, x2: coords[1].x, y2: coords[1].y },
        { x1: coords[0].x, y1: coords[0].y, x2: coords[2].x, y2: coords[2].y },
        { x1: coords[0].x, y1: coords[0].y, x2: coords[3].x, y2: coords[3].y },
        { x1: coords[2].x, y1: coords[2].y, x2: coords[3].x, y2: coords[3].y },
      ];
      setLineCoords(lines);
    }
  }, [selectedPalace]);

  const getPalaceByBranch = (branch: EarthlyBranch): PalaceData => {
    return data.palaces.find((p) => p.branch === branch) || data.palaces[0];
  };

  // 再次點擊相同宮位時取消選中與連線
  const handleSelect = (palace: PalaceData) => {
    if (selectedPalace?.branch === palace.branch) {
      setSelectedPalace(null);
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
        {/* 三方四正連線 */}
        {lineCoords.length > 0 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-30">
            {lineCoords.map((line, i) => (
              <g key={i}>
                <line
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  stroke="#0284c7"
                  strokeWidth="2.5"
                  strokeDasharray="5 5"
                  className="animate-pulse"
                />
                <line
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  stroke="#d97706"
                  strokeWidth="1.5"
                  strokeOpacity="0.8"
                />
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
