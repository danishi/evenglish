import { type EvenAppBridge, waitForEvenAppBridge } from '@evenrealities/even_hub_sdk'
import { type KeyValueStorage, ProgressStore } from './core/progress'
import { DEFAULT_CONTENT, GlassesApp } from './glasses/app'
import type { Display } from './glasses/display'
import { EvenDisplay } from './glasses/even-display'
import { PreviewDisplay } from './glasses/preview-display'
import { mountPhoneUI } from './phone/ui'
import './style.css'

/**
 * Even App（またはシミュレーター）の WebView 内なら実機ブリッジを使い、
 * 普通のブラウザで開いた場合はグラス画面のプレビューで動かす。
 * `?preview` を付けると強制的にプレビューモードになる。
 */
async function detectBridge(): Promise<EvenAppBridge | null> {
  if (new URLSearchParams(location.search).has('preview')) return null
  if (!('flutter_inappwebview' in window)) return null
  return waitForEvenAppBridge()
}

function bridgeStorage(bridge: EvenAppBridge): KeyValueStorage {
  return {
    getItem: (key) => bridge.getLocalStorage(key),
    setItem: async (key, value) => {
      await bridge.setLocalStorage(key, value)
    },
  }
}

const browserStorage: KeyValueStorage = {
  async getItem(key) {
    try {
      return window.localStorage.getItem(key) ?? ''
    } catch {
      return ''
    }
  },
  async setItem(key, value) {
    try {
      window.localStorage.setItem(key, value)
    } catch {
      /* プライベートモードなどでは保存できない */
    }
  },
}

async function main() {
  const bridge = await detectBridge()
  const store = new ProgressStore(bridge ? bridgeStorage(bridge) : browserStorage)
  await store.load()

  const root = document.querySelector<HTMLElement>('#app')!
  let app: GlassesApp | null = null
  mountPhoneUI(root, store, DEFAULT_CONTENT, {
    mode: bridge ? 'glasses' : 'preview',
    onSettingsChanged: () => void app?.refresh(),
  })

  const display: Display = bridge ? new EvenDisplay(bridge) : new PreviewDisplay(document.querySelector('#preview-root')!)
  app = new GlassesApp(display, store)
  await app.start()

  // グラス側の学習で数字が変わったらメニューの件数も更新する
  store.subscribe(() => {
    if (app?.screen.kind === 'home') void app.refresh()
  })
  // WebView が閉じられる前に保存
  window.addEventListener('pagehide', () => void store.flush())
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') void store.flush()
  })

  console.log('[evenglish] ready', bridge ? '(glasses)' : '(preview)')
}

main().catch((e) => console.error('[evenglish] failed to start', e))
