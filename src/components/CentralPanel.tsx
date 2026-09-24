import React from 'react';
import type { ZiweiChartData, ChartTabMode } from '../types/ziwei';
import { MUTAGEN_COLOR, FLOW_LEVEL_COLOR } from './chartColors';

interface CentralPanelProps {
  data: ZiweiChartData;
  mode: ChartTabMode;
  onShift?: (unit: 'day' | 'hour', delta: number) => void;
}

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex flex-wrap items-baseline gap-x-1">
    <span className="text-label3 shrink-0">{label}：</span>
    <span className="text-label font-medium">{children}</span>
  </div>
);

// 圖例用的小方塊
const Chip: React.FC<{ color: string; outline?: boolean; text: string }> = ({ color, outline, text }) => (
  <span className="inline-flex items-center gap-0.5 whitespace-nowrap">
    <span
      className="inline-block w-2.5 h-2.5 rounded-[2px]"
      style={outline ? { border: `1px solid ${color}` } : { backgroundColor: color }}
    />
    {text}
  </span>
);

const MODE_LABEL: Record<ChartTabMode, string> = { feixing: '飛星盤', sanhe: '三合盤', sihua: '四化盤' };

export const CentralPanel: React.FC<CentralPanelProps> = ({ data, mode, onShift }) => {
  const { userInfo } = data;
  const isFeixing = mode === 'feixing';

  const shiftBtn = 'h-7 sm:h-9 px-2 sm:px-3.5 whitespace-nowrap rounded-full border border-separator text-label hover:bg-fill active:bg-fill2 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <div className="w-full h-full p-1.5 sm:p-3 flex flex-col gap-1 sm:gap-1.5 text-[10px] sm:text-[13px] leading-snug text-label">
      {/* 標出盤面種類，匯出圖片時才看得出是哪一種盤 */}
      <h2 className="flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-2xl font-light tracking-tight">
        紫微命盤
        <span className="rounded-full bg-accent text-on-accent px-1.5 sm:px-2.5 py-px text-[10px] sm:text-sm font-medium tracking-normal">
          {MODE_LABEL[mode]}
        </span>
      </h2>

      <div className="flex flex-wrap justify-between gap-x-2">
        <span><span className="text-label3">姓名：</span>{userInfo.name}</span>
        <span className="font-medium">{userInfo.yinyangGender} {userInfo.fiveElementElement}</span>
      </div>
      <Row label="真太陽時">{userInfo.trueSolarBirth}</Row>
      <Row label="鐘錶時間">{userInfo.solarBirth}</Row>
      <Row label="農曆">{userInfo.lunarBirth}</Row>

      {!isFeixing && (
        <>
          <div className="flex flex-wrap gap-x-2">
            <span><span className="text-label3">命主：</span>{userInfo.masterStar}</span>
            <span><span className="text-label3">身主：</span>{userInfo.bodyMasterStar}</span>
            <span><span className="text-label3">子斗：</span>{userInfo.ziDou}</span>
          </div>

          {/* 節氣與非節氣四柱 */}
          <div className="grid grid-cols-2 gap-2">
            {([['節氣四柱', userInfo.fourPillars], ['非節氣四柱', userInfo.nonTermFourPillars]] as const).map(([label, pillars]) => (
              <div key={label}>
                <div className="text-[9px] sm:text-[11px] text-label3">{label}</div>
                <div className="grid grid-cols-4 text-center font-serif font-bold text-[12px] sm:text-lg leading-tight text-label">
                  {[pillars.year, pillars.month, pillars.day, pillars.time].map((gz, i) => (
                    <div key={i} className="flex flex-col">
                      <span>{gz.charAt(0)}</span>
                      <span>{gz.charAt(1)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">{userInfo.startAgeDetail || userInfo.startAgeNotice}</div>

          {/* 八字大運 */}
          {userInfo.luckCycles.length > 0 && (
            <div className="grid grid-cols-8 text-center leading-tight">
              {userInfo.luckCycles.map((c) => (
                <div key={c.stemBranch + c.age} className="flex flex-col items-center">
                  <span className="text-[7px] sm:text-[9px] text-label3">{c.tenGod}</span>
                  <span className="[writing-mode:vertical-rl] font-serif font-bold text-[11px] sm:text-sm text-label">{c.stemBranch}</span>
                  <span className="text-[7px] sm:text-[10px] text-label3">{c.age}歲</span>
                  <span className="text-[7px] sm:text-[10px] text-label3">{c.year}</span>
                </div>
              ))}
            </div>
          )}

          {/* 生辰微調：往前後推一日／一時辰重新排盤 */}
          <div className="flex justify-center gap-1 text-[10px] sm:text-sm">
            <button type="button" className={shiftBtn} disabled={!onShift} onClick={() => onShift?.('day', 1)} title="生日往後一天">日↑</button>
            <button type="button" className={shiftBtn} disabled={!onShift} onClick={() => onShift?.('day', -1)} title="生日往前一天">日↓</button>
            <button type="button" className={`hidden sm:inline-block ${shiftBtn}`} disabled title="天盤／地盤／人盤切換尚未開放">天盤▽</button>
            <button type="button" className={shiftBtn} disabled={!onShift} onClick={() => onShift?.('hour', 1)} title="出生時間往後一個時辰">時↑</button>
            <button type="button" className={shiftBtn} disabled={!onShift} onClick={() => onShift?.('hour', -1)} title="出生時間往前一個時辰">時↓</button>
          </div>
        </>
      )}

      <div className="flex-1" />

      {/* 圖例 */}
      <div className="flex flex-wrap justify-center gap-x-2 gap-y-0.5 text-[9px] sm:text-[11px] text-label2">
        {mode === 'sanhe' && (
          <>
            <Chip color={MUTAGEN_COLOR['忌']} text="生年四化" />
            <Chip color={FLOW_LEVEL_COLOR['大']} text="大限" />
            <Chip color={FLOW_LEVEL_COLOR['年']} text="流年" />
            <Chip color={FLOW_LEVEL_COLOR['月']} text="流月" />
            <Chip color={FLOW_LEVEL_COLOR['日']} text="流日" />
            <Chip color={FLOW_LEVEL_COLOR['時']} text="流時" />
            <Chip color={MUTAGEN_COLOR['權']} outline text="自化" />
          </>
        )}
        {mode === 'feixing' && (
          <>
            <Chip color={MUTAGEN_COLOR['祿']} text="生年四化" />
            <Chip color={MUTAGEN_COLOR['權']} text="點宮位：宮干飛化上色＋連線" />
            <span>
              自化圖示：
              {(['祿', '權', '科', '忌'] as const).map((m) => (
                <span key={m} style={{ color: MUTAGEN_COLOR[m] }}>→{m}</span>
              ))}
            </span>
          </>
        )}
        {mode === 'sihua' && (
          <>
            <Chip color={MUTAGEN_COLOR['忌']} text="生年四化" />
            <span>連線：化入對宮</span>
            <span>外箭頭：自化</span>
          </>
        )}
      </div>
      {(
        <div className="flex justify-center gap-1.5 text-[9px] sm:text-[11px] font-bold">
          {(['祿', '權', '科', '忌'] as const).map((m) => (
            <span key={m} style={{ color: MUTAGEN_COLOR[m] }}>{m}</span>
          ))}
        </div>
      )}

      {userInfo.activeFlowCycleInfo && (
        <div className="text-center rounded-[14px] bg-accent text-on-accent px-2 py-1 text-[9px] sm:text-xs">
          {userInfo.activeFlowCycleInfo}
        </div>
      )}
    </div>
  );
};
