# 紫微斗數神算命盤系統 (Ziwei Star Chart System)

一個基於 React + TypeScript + Tailwind CSS 打造的高品質、響應式 (RWD) 紫微斗數線上排盤系統，採用經典文墨天機風格地支盤佈局，並提供全盤 JSON 資料結構匯出/匯入與儲存管理功能。

![Ziwei Chart System](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![Vite](https://img.shields.io/badge/Vite-6.0-purple)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🌟 核心特色 (Features)

- ☯️ **專業級安星演算法**：精確計算陰陽五行局（水二局、木三局、金四局、土五局、火六局）、安紫微系與天府系十四主星、廟旺平陷狀態、年干四化（祿、權、科、忌）、六吉星、六凶星、雜曜與長生/博士神煞。
- 🏛️ **經典地支 4x4 環形網格**：遵循中國傳統地支固定方位（巳午未申在頂、申酉戌亥在右、亥子丑寅在底、寅卯辰巳在左），中間圍繞 2x2 中宮資訊面板。
- 📐 **動態三方四正連線**：點擊任意宮位（如命宮、官祿宮），自動繪製高亮度 SVG 動態虛線，標示該宮位之本宮、對宮與三方關係。
- 📜 **中宮綜合面板**：精準顯示鐘錶時間（西元）、農曆時間、節氣與非節氣八字四柱（年柱、月柱、日柱、時柱）、命主、身主、子鬥、起運歲數及自化圖示。
- 🎨 **白色清爽典雅介面 (Light Zen UI)**：專為長時間閱讀與開盤設計的高對比清新質感，具備極佳的可讀性與適應 RWD 響應式佈局。
- 💾 **資料結構 JSON 串行化與本機存檔**：
  - **本機歷史紀錄庫**：儲存多張命盤於 LocalStorage。
  - **匯出 JSON**：一鍵導出全盤 `.json` 資料結構檔案。
  - **匯入 JSON**：隨時復原過去導出的命盤資料。
  - **圖片導出**：支援將命盤 Canvas 繪製成 PNG 圖片下載。

---

## 🛠️ 開發與建置 (Development)

### 前置需求
- Node.js >= 18.0.0
- npm / yarn / pnpm

### 本機開發
```bash
# 複製專案
git clone https://github.com/bat6623/Ziwei.git
cd Ziwei

# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
```
開啟瀏覽器訪問 `http://localhost:5173/`。

### 生產打包
```bash
npm run build
```

---

## 📄 命盤資料結構規範 (JSON Data Schema)

詳細的 TypeScript 型別定義位於 [`src/types/ziwei.ts`](src/types/ziwei.ts)。全盤導出之 JSON 格式如下：

```json
{
  "id": "ziwei-1774404987000",
  "createdAt": "2026-09-24T10:16:37.000Z",
  "userInfo": {
    "name": "命主",
    "gender": "male",
    "yinyangGender": "陽男",
    "fiveElementElement": "水二局",
    "solarBirth": "2026-09-24 10:50",
    "lunarBirth": "丙午年八月十四日 巳時",
    "fourPillars": {
      "year": "丙午",
      "month": "丁酉",
      "day": "丙申",
      "time": "癸巳"
    }
  },
  "palaces": [ ...12 個地支宮位資料... ]
}
```

---

## 📝 授權條款 (License)
MIT License.
