import { defineConfig } from 'vite'

export default defineConfig({
  // .ehpk にパッケージしたときもアセットを読めるよう相対パスで出力する
  base: './',
  server: {
    // 実機（スマホの Even App）から同じ Wi-Fi 経由でアクセスできるようにする
    host: true,
    port: 5173,
  },
})
