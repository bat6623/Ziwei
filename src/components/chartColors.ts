import type { Mutagen, FlowLevel } from '../types/ziwei';

// 文墨天機的四化配色：祿綠、權紫、科藍、忌紅
export const MUTAGEN_COLOR: Record<Mutagen, string> = {
  '祿': '#16a34a',
  '權': '#7c3aed',
  '科': '#2563eb',
  '忌': '#dc2626',
};

// 流運四化配色 (依層級)
export const FLOW_LEVEL_COLOR: Record<FlowLevel, string> = {
  '大': '#15803d',
  '年': '#1d4ed8',
  '月': '#c2410c',
  '日': '#be185d',
  '時': '#0f766e',
};
