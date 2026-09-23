import { defineConfig } from 'vite'
import app from './app.json'

export default defineConfig({
  // .ehpk にパッケージしたときもアセットを読めるよう相対パスで出力する
  base: './',
  define: {
    // CI はビルド前に app.json の version を書き換える（0.1.0 → 0.1.42）ので、
    // ビルド時点の app.json から読んで画面に出す
    __APP_VERSION__: JSON.stringify(app.version),
  },
  server: {
    // 実機（スマホの Even App）から同じ Wi-Fi 経由でアクセスできるようにする
    host: true,
    port: 5173,
  },
})
