import type { Display, InputEvent, PageSpec } from './display'
import { SCREEN_H, SCREEN_W } from '../core/text'

/**
 * ブラウザだけで動作確認するためのグラス画面プレビュー。
 * Even App の外で開いたときに使う（実機・シミュレーターでは EvenDisplay）。
 *
 * 操作: ↑/↓ = スワイプ, Enter/Space = タップ, Esc/Backspace = ダブルタップ
 */
export class PreviewDisplay implements Display {
  private screen: HTMLElement
  private page: PageSpec | null = null
  private listIndex = 0
  private handler: (e: InputEvent) => void = () => {}

  constructor(root: HTMLElement) {
    root.innerHTML = `
      <div class="preview">
        <div class="preview-frame"><div class="preview-screen" style="width:${SCREEN_W}px;height:${SCREEN_H}px"></div></div>
        <div class="preview-controls">
          <button data-act="up">↑ 上スワイプ</button>
          <button data-act="down">↓ 下スワイプ</button>
          <button data-act="click">タップ</button>
          <button data-act="double">ダブルタップ</button>
        </div>
        <p class="preview-hint">キーボード: ↑ ↓ / Enter=タップ / Esc=ダブルタップ</p>
      </div>`
    this.screen = root.querySelector('.preview-screen')!
    root.querySelectorAll<HTMLButtonElement>('button[data-act]').forEach((btn) => {
      btn.addEventListener('click', () => this.press(btn.dataset.act as 'up' | 'down' | 'click' | 'double'))
    })
    window.addEventListener('keydown', (e) => {
      const target = e.target as HTMLElement | null
      if (target && ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) return
      const map: Record<string, 'up' | 'down' | 'click' | 'double'> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        Enter: 'click',
        ' ': 'click',
        Escape: 'double',
        Backspace: 'double',
      }
      const act = map[e.key]
      if (!act) return
      e.preventDefault()
      this.press(act)
    })
    this.fitToWidth(root)
  }

  /** スマホ幅でも収まるように縮小表示する */
  private fitToWidth(root: HTMLElement): void {
    const frame = root.querySelector<HTMLElement>('.preview-frame')!
    const apply = () => {
      const scale = Math.min(1, frame.clientWidth / SCREEN_W)
      this.screen.style.transform = `scale(${scale})`
      frame.style.height = `${SCREEN_H * scale}px`
    }
    new ResizeObserver(apply).observe(frame)
    apply()
  }

  private captureBox() {
    return this.page?.boxes.find((b) => b.capture)
  }

  press(act: 'up' | 'down' | 'click' | 'double'): void {
    const box = this.captureBox()
    if (!box) return
    if (act === 'double') return this.handler({ type: 'double' })
    if (box.kind === 'list') {
      // 実機と同じく、リストのスクロールは本体側で処理されイベントは来ない
      if (act === 'up') this.listIndex = Math.max(0, this.listIndex - 1)
      else if (act === 'down') this.listIndex = Math.min(box.items.length - 1, this.listIndex + 1)
      else return this.handler({ type: 'click', index: this.listIndex })
      this.draw()
      return
    }
    this.handler({ type: act })
  }

  async render(page: PageSpec): Promise<void> {
    const prevList = this.page?.boxes.find((b) => b.kind === 'list')
    const nextList = page.boxes.find((b) => b.kind === 'list')
    if (!prevList || !nextList || prevList.id !== nextList.id || prevList.kind !== 'list' || nextList.kind !== 'list' || prevList.items.join() !== nextList.items.join()) {
      this.listIndex = 0
    }
    this.page = page
    this.draw()
  }

  private draw(): void {
    if (!this.page) return
    this.screen.innerHTML = ''
    for (const box of this.page.boxes) {
      const el = document.createElement('div')
      el.className = `pv-box pv-${box.kind}`
      Object.assign(el.style, {
        left: `${box.x}px`,
        top: `${box.y}px`,
        width: `${box.w}px`,
        height: `${box.h}px`,
        padding: `${box.padding ?? 0}px`,
        borderWidth: `${box.border ?? 0}px`,
      })
      if (box.kind === 'text') {
        // 実機フォントのスペース幅で左右寄せした行は、ブラウザではフォント幅が違うので flex で再現する
        for (const line of box.content.split('\n')) {
          const row = document.createElement('div')
          const m = line.match(/^(.*\S) {4,}(\S.*)$/)
          if (m) {
            row.className = 'pv-spread'
            row.append(Object.assign(document.createElement('span'), { textContent: m[1] }))
            row.append(Object.assign(document.createElement('span'), { textContent: m[2] }))
          } else {
            row.textContent = line || '\u00a0'
          }
          el.appendChild(row)
        }
      } else {
        box.items.forEach((item, i) => {
          const row = document.createElement('div')
          row.className = 'pv-item' + (box.capture && i === this.listIndex ? ' is-selected' : '')
          row.textContent = item
          el.appendChild(row)
        })
        // 選択行が見えるようにスクロール
        const selected = el.children[this.listIndex] as HTMLElement | undefined
        requestAnimationFrame(() => selected?.scrollIntoView({ block: 'nearest' }))
      }
      this.screen.appendChild(el)
    }
  }

  onInput(handler: (e: InputEvent) => void): void {
    this.handler = handler
  }

  async requestExit(): Promise<void> {
    if (window.confirm('アプリを終了しますか？（プレビュー）')) {
      this.handler({ type: 'exit' })
      this.screen.innerHTML = '<div class="pv-box pv-text" style="left:0;top:0;padding:8px">終了しました</div>'
      this.page = null
    }
  }
}
