import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { execSync } from 'node:child_process';
import pkg from './package.json' with { type: 'json' };

// 版號與建置資訊，顯示在「關於」與頁面底部，用來確認手機上是不是最新版
const gitSha = (() => {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return '';
  }
})();

const buildTime = new Intl.DateTimeFormat('zh-TW', {
  timeZone: 'Asia/Taipei',
  year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
}).format(new Date());

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // 產出 version.json：網頁上的「強制更新」會拿它跟目前版號比對
    {
      name: 'emit-version-json',
      generateBundle() {
        this.emitFile({
          type: 'asset',
          fileName: 'version.json',
          source: JSON.stringify({ version: pkg.version, buildTime }) + '\n',
        });
      },
    },
  ],
  base: '/Ziwei/', // 發布至 GitHub Pages 的基礎路徑
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_TIME__: JSON.stringify(buildTime),
    __GIT_SHA__: JSON.stringify(gitSha),
  },
});
