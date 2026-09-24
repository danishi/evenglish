import { OsEventTypeList } from '@evenrealities/even_hub_sdk'
import { beforeEach, describe, expect, it } from 'vitest'
import { ProgressStore } from '../src/core/progress'
import { lineCount } from '../src/core/text'
import { GlassesApp } from '../src/glasses/app'
import type { Display, InputEvent, PageSpec } from '../src/glasses/display'
import { sameLayout } from '../src/glasses/display'
import { normalizeEvent } from '../src/glasses/even-display'
import { TEXT_INNER_W, TEXT_MAX_LINES } from '../src/glasses/layout'

class FakeDisplay implements Display {
  pages: PageSpec[] = []
  exitRequested = false
  handler: (e: InputEvent) => void = () => {}
  async render(page: PageSpec) {
    this.pages.push(page)
  }
  onInput(h: (e: InputEvent) => void) {
    this.handler = h
  }
  async requestExit() {
    this.exitRequested = true
  }
  get last() {
    return this.pages[this.pages.length - 1]
  }
  text(i = 0) {
    const box = this.last.boxes[i]
    return box.kind === 'text' ? box.content : box.items.join('\n')
  }
}

const memory = () => {
  let v = ''
  return {
    getItem: async () => v,
    setItem: async (_k: string, value: string) => {
      v = value
    },
  }
}

function checkPage(page: PageSpec) {
  expect(page.boxes.filter((b) => b.capture)).toHaveLength(1)
  expect(new Set(page.boxes.map((b) => b.id)).size).toBe(page.boxes.length)
  for (const b of page.boxes) {
    expect(b.name.length).toBeLessThanOrEqual(16)
    expect(b.x + b.w).toBeLessThanOrEqual(576)
    expect(b.y + b.h).toBeLessThanOrEqual(288)
    if (b.kind === 'text') {
      expect(b.content.length).toBeLessThanOrEqual(1000)
      if (b.h === 288) expect(lineCount(b.content, TEXT_INNER_W)).toBeLessThanOrEqual(TEXT_MAX_LINES)
    } else {
      expect(b.items.length).toBeGreaterThan(0)
      expect(b.items.length).toBeLessThanOrEqual(20)
      for (const it of b.items) expect(it.length).toBeLessThanOrEqual(64)
    }
  }
}

describe('GlassesApp', () => {
  let display: FakeDisplay
  let store: ProgressStore
  let app: GlassesApp
  let t = 0

  beforeEach(async () => {
    display = new FakeDisplay()
    store = new ProgressStore(memory(), { saveDelayMs: 10_000 })
    await store.load()
    t = 0
    app = new GlassesApp(display, store, undefined, () => (t += 1000))
    await app.start()
  })

  const send = (e: InputEvent) => app.handle(e)

  it('メニューを表示する', () => {
    checkPage(display.last)
    expect(display.text(1)).toContain('単語カード')
  })

  it('単語カード: 答えを見て「覚えた」「まだ」で進む', async () => {
    await send({ type: 'click', index: 0 })
    expect(app.screen.kind).toBe('cards')
    const s = app.screen as Extract<typeof app.screen, { kind: 'cards' }>
    const firstId = s.ids[0]
    expect(display.text()).toContain('答えを見る')
    const kana = app.wordPool().find((w) => w.id === firstId)!.kana
    expect(display.text()).not.toContain(kana)

    await send({ type: 'click' })
    expect(display.text()).toContain('覚えた')
    expect(display.text()).toContain(kana)
    await send({ type: 'click' })
    expect(store.data.cards[firstId].box).toBe(2)
    expect(display.text()).toContain('○1 ×0')

    await send({ type: 'click' })
    await send({ type: 'down' })
    expect(store.data.cards[s.ids[1]]).toMatchObject({ box: 1, ok: 0 })
    expect(store.todayCount()).toBe(2)
  })

  it('セッションを最後まで進めると結果画面になる', async () => {
    store.updateSettings({ sessionSize: 3 })
    await send({ type: 'click', index: 1 })
    for (let i = 0; i < 3; i++) {
      await send({ type: 'click' })
      checkPage(display.last)
      await send({ type: 'click' })
    }
    expect(app.screen.kind).toBe('sessionDone')
    expect(display.text()).toContain('覚えた 3')
    expect(display.text()).toContain('フレーズの覚えた数  3/')
    await send({ type: 'double' })
    expect(app.screen.kind).toBe('home')
    // 覚えた数がメニューにも出る
    expect(display.text(1)).toMatch(/フレーズ.*覚えた 3/)
  })

  it('全カードの表・裏が1画面に収まる', async () => {
    store.updateSettings({ levels: ['basic', 'daily', 'business', 'advanced'] })
    for (const deck of ['word', 'phrase'] as const) {
      for (const direction of ['en-ja', 'ja-en'] as const) {
        store.updateSettings({ direction })
        const ids = (deck === 'word' ? app.wordPool() : app.phrasePool()).map((x) => x.id)
        for (const id of ids) {
          for (const revealed of [false, true]) {
            const text = app.cardText({ kind: 'cards', deck, ids: [id], index: 0, revealed, ok: 0, ng: 0, review: false })
            expect(lineCount(text, TEXT_INNER_W), id).toBeLessThanOrEqual(TEXT_MAX_LINES)
            if (revealed) {
              // 本文が切り詰められていない
              const item = [...app.wordPool(), ...app.phrasePool()].find((x) => x.id === id)!
              const tail = 'exJa' in item ? item.exJa : (item.note ?? item.ja)
              expect(text, id).toContain(tail)
            }
          }
        }
      }
    }
  })

  it('文法: 一覧→解説→確認クイズ→一覧', async () => {
    await send({ type: 'click', index: 2 })
    expect(app.screen.kind).toBe('grammarList')
    checkPage(display.last)
    await send({ type: 'click', index: 0 })
    expect(app.screen.kind).toBe('grammar')
    const pages = app.grammarPages(app['content'].grammar[0]).length
    for (let i = 0; i < pages - 1; i++) await send({ type: 'down' })
    // 最後のページで下スワイプしてもクイズには進まない（誤操作防止）
    await send({ type: 'down' })
    expect(app.screen.kind).toBe('grammar')
    await send({ type: 'click' })
    expect(app.screen.kind).toBe('quiz')
    expect(store.data.grammarDone.g01).toBe(true)

    const quiz = app.screen as Extract<typeof app.screen, { kind: 'quiz' }>
    for (const item of quiz.items) {
      checkPage(display.last)
      await send({ type: 'click', index: item.answer })
      checkPage(display.last)
      await send({ type: 'click' })
    }
    expect(app.screen).toMatchObject({ kind: 'quizDone', correct: quiz.items.length })
    await send({ type: 'click' })
    expect(app.screen.kind).toBe('grammarList')
  })

  it('文法一覧はページ送りできる（リストは20項目まで）', async () => {
    await send({ type: 'click', index: 2 })
    const items = (display.last.boxes[1] as { items: string[] }).items
    const next = items.findIndex((i) => i.includes('次のページ'))
    if (next < 0) return
    await send({ type: 'click', index: next })
    expect(app.screen).toMatchObject({ kind: 'grammarList', page: 1 })
    checkPage(display.last)
  })

  it('全文法ページが1画面に収まる', async () => {
    const grammar = app['content'].grammar
    for (let topic = 0; topic < grammar.length; topic++) {
      const pages = app.grammarPages(grammar[topic])
      for (let page = 0; page < pages.length; page++) {
        app.screen = { kind: 'grammar', topic, page }
        checkPage(app.view())
      }
    }
  })

  it('4択クイズ: 種類を選んで出題し、2回タップで種類選択に戻る', async () => {
    await send({ type: 'click', index: 3 })
    expect(app.screen.kind).toBe('quizMenu')
    checkPage(display.last)
    const menu = (display.last.boxes[1] as { items: string[] }).items
    for (let i = 0; i < menu.length; i++) {
      await send({ type: 'click', index: i })
      const quiz = app.screen as Extract<typeof app.screen, { kind: 'quiz' }>
      expect(quiz.kind).toBe('quiz')
      for (const item of quiz.items) {
        app.screen = { ...quiz, items: [item], picked: null }
        checkPage(app.view())
        app.screen = { ...quiz, items: [item], picked: (item.answer + 1) % 4 }
        checkPage(app.view())
      }
      app.screen = quiz
      await send({ type: 'double' })
      expect(app.screen.kind).toBe('quizMenu')
    }
  })

  it('4択クイズ: 不正解でも解説が出て次に進める', async () => {
    await send({ type: 'click', index: 3 })
    await send({ type: 'click', index: 0 })
    const quiz = app.screen as Extract<typeof app.screen, { kind: 'quiz' }>
    expect(quiz.items).toHaveLength(10)
    const wrong = (quiz.items[0].answer + 1) % 4
    await send({ type: 'click', index: wrong })
    expect(display.text()).toContain('答え:')
    expect(store.data.quiz).toEqual({ answered: 1, correct: 0 })
    await send({ type: 'click' })
    expect((app.screen as typeof quiz).index).toBe(1)
  })

  it('記録・使い方の画面', async () => {
    await send({ type: 'click', index: 4 })
    checkPage(display.last)
    expect(display.text()).toContain('連続学習')
    await send({ type: 'click' })
    await send({ type: 'click', index: 5 })
    checkPage(display.last)
    expect(display.text()).toContain(`v${__APP_VERSION__}`)
    await send({ type: 'double' })
    expect(app.screen.kind).toBe('home')
  })

  it('メニューで2回タップすると終了確認を出す', async () => {
    await send({ type: 'double' })
    expect(display.exitRequested).toBe(true)
  })

  it('スワイプの連打は間引く', async () => {
    await send({ type: 'click', index: 0 })
    await send({ type: 'click' })
    t -= 900 // 次のイベントを前回から100ms後にする
    await send({ type: 'up' })
    expect((app.screen as { revealed: boolean }).revealed).toBe(true)
    await send({ type: 'up' })
    expect((app.screen as { revealed: boolean }).revealed).toBe(false)
  })
})

describe('normalizeEvent', () => {
  it('テキストのタップは sysEvent で eventType が省略されて届く', () => {
    expect(normalizeEvent({ sysEvent: {} as never })).toEqual({ type: 'click' })
    expect(normalizeEvent({ sysEvent: { eventType: OsEventTypeList.DOUBLE_CLICK_EVENT } as never })).toEqual({ type: 'double' })
  })

  it('スワイプは textEvent', () => {
    expect(normalizeEvent({ textEvent: { eventType: OsEventTypeList.SCROLL_TOP_EVENT } as never })).toEqual({ type: 'up' })
    expect(normalizeEvent({ textEvent: { eventType: OsEventTypeList.SCROLL_BOTTOM_EVENT } as never })).toEqual({ type: 'down' })
  })

  it('リストの先頭項目はインデックスが省略される', () => {
    expect(normalizeEvent({ listEvent: {} as never })).toEqual({ type: 'click', index: 0 })
    expect(normalizeEvent({ listEvent: { currentSelectItemIndex: 2 } as never })).toEqual({ type: 'click', index: 2 })
    expect(normalizeEvent({ listEvent: { currentSelectItemName: 'b' } as never }, ['a', 'b'])).toEqual({ type: 'click', index: 1 })
  })

  it('ライフサイクル', () => {
    expect(normalizeEvent({ sysEvent: { eventType: OsEventTypeList.FOREGROUND_EXIT_EVENT } as never })).toEqual({ type: 'background' })
    expect(normalizeEvent({ sysEvent: { eventType: OsEventTypeList.SYSTEM_EXIT_EVENT } as never })).toEqual({ type: 'exit' })
    expect(normalizeEvent({ sysEvent: { eventType: OsEventTypeList.IMU_DATA_REPORT } as never })).toBeNull()
  })
})

describe('sameLayout', () => {
  it('テキストだけ違うなら同じレイアウト、リスト項目が違えば別', () => {
    const a: PageSpec = { boxes: [{ kind: 'text', id: 1, name: 'm', x: 0, y: 0, w: 10, h: 10, content: 'a', capture: true }] }
    const b: PageSpec = { boxes: [{ ...a.boxes[0], content: 'b' } as PageSpec['boxes'][0]] }
    expect(sameLayout(a, b)).toBe(true)
    const l1: PageSpec = { boxes: [{ kind: 'list', id: 1, name: 'l', x: 0, y: 0, w: 10, h: 10, items: ['x'] }] }
    const l2: PageSpec = { boxes: [{ kind: 'list', id: 1, name: 'l', x: 0, y: 0, w: 10, h: 10, items: ['y'] }] }
    expect(sameLayout(l1, l2)).toBe(false)
  })
})
