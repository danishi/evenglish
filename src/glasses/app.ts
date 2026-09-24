import { getTextWidth } from '@evenrealities/pretext'
import { GRAMMAR } from '../data/grammar'
import { PHRASES } from '../data/phrases'
import { LEVEL_LABELS, SCENE_LABELS, type GrammarTopic, type Phrase, type Word } from '../data/types'
import { WORDS } from '../data/words'
import type { ProgressStore } from '../core/progress'
import { buildMixedQuiz, grammarTopicQuiz, shuffle, type QuizItem } from '../core/quiz'
import { isDue, isMastered, pickSession } from '../core/srs'
import { LINE_H, SCREEN_W, lineCount, paginate, progressBar, spread, truncatePx } from '../core/text'
import type { Box, Display, InputEvent, PageSpec } from './display'
import { GRAMMAR_BODY_LINES, TEXT_INNER_W, TEXT_MAX_LINES, TEXT_PAD } from './layout'

export interface Content {
  words: Word[]
  phrases: Phrase[]
  grammar: GrammarTopic[]
}

export const DEFAULT_CONTENT: Content = { words: WORDS, phrases: PHRASES, grammar: GRAMMAR }

type Deck = 'word' | 'phrase'

export type Screen =
  | { kind: 'home' }
  | { kind: 'cards'; deck: Deck; ids: string[]; index: number; revealed: boolean; ok: number; ng: number; review: boolean }
  | { kind: 'sessionDone'; deck: Deck; ok: number; ng: number }
  | { kind: 'grammarList'; page: number }
  | { kind: 'grammar'; topic: number; page: number }
  | { kind: 'quiz'; items: QuizItem[]; index: number; correct: number; from: 'home' | 'grammar'; picked: number | null }
  | { kind: 'quizDone'; correct: number; total: number; from: 'home' | 'grammar' }
  | { kind: 'stats' }
  | { kind: 'help' }

/** 文法一覧の1ページあたりのトピック数（リストは最大20項目） */
export const GRAMMAR_PER_PAGE = 12
const SCROLL_COOLDOWN_MS = 300

const HEADER_H = 44
const RULE = '━'.repeat(Math.floor(TEXT_INNER_W / (getTextWidth('━') || 20)))

function fullText(content: string): Box {
  return {
    kind: 'text',
    id: 1,
    name: 'main',
    x: 0,
    y: 0,
    w: SCREEN_W,
    h: 288,
    padding: TEXT_PAD,
    capture: true,
    content,
  }
}

function headerWithList(header: string, items: string[]): PageSpec {
  return {
    boxes: [
      { kind: 'text', id: 1, name: 'header', x: 0, y: 0, w: SCREEN_W, h: HEADER_H, padding: TEXT_PAD, content: header },
      {
        kind: 'list',
        id: 2,
        name: 'menu',
        x: 0,
        y: HEADER_H,
        w: SCREEN_W,
        h: 288 - HEADER_H,
        capture: true,
        items: items.map((it) => truncatePx(it, SCREEN_W - 40)),
      },
    ],
  }
}

/**
 * ヘッダー + 本文 + 最下行の操作ヒント、という全画面テキストを組み立てる。
 * 本文が長い場合は行数に収まるように切り詰める。
 */
export function composeScreen(title: string, right: string, body: string, footer: string): string {
  const head = `${spread(title, right, TEXT_INNER_W)}\n${RULE}`
  const bodyMax = TEXT_MAX_LINES - 3
  let text = body
  if (lineCount(text, TEXT_INNER_W) > bodyMax) text = paginate(text, TEXT_INNER_W, bodyMax)[0] ?? ''
  const used = text ? lineCount(text, TEXT_INNER_W) : 0
  const pad = '\n'.repeat(Math.max(1, bodyMax - used + 1))
  return `${head}\n${text}${pad}${footer}`
}

export class GlassesApp {
  screen: Screen = { kind: 'home' }
  private lastScroll = 0
  private display: Display
  private store: ProgressStore
  private content: Content
  private now: () => number

  constructor(display: Display, store: ProgressStore, content: Content = DEFAULT_CONTENT, now: () => number = Date.now) {
    this.display = display
    this.store = store
    this.content = content
    this.now = now
  }

  async start(): Promise<void> {
    this.display.onInput((e) => void this.handle(e))
    await this.refresh()
  }

  /** 現在の画面を描き直す（設定変更時など） */
  refresh(): Promise<void> {
    return this.display.render(this.view())
  }

  private go(screen: Screen): Promise<void> {
    this.screen = screen
    return this.refresh()
  }

  // ───────────────────────── データの絞り込み ─────────────────────────

  wordPool(): Word[] {
    const levels = this.store.data.settings.levels
    const pool = this.content.words.filter((w) => levels.includes(w.level))
    return pool.length ? pool : this.content.words
  }

  phrasePool(): Phrase[] {
    const scenes = this.store.data.settings.scenes
    const pool = this.content.phrases.filter((p) => scenes.includes(p.scene))
    return pool.length ? pool : this.content.phrases
  }

  private deckCounts(deck: Deck): { due: number; fresh: number } {
    const ids = (deck === 'word' ? this.wordPool() : this.phrasePool()).map((x) => x.id)
    const cards = this.store.data.cards
    const today = this.store.today()
    return {
      due: ids.filter((id) => isDue(cards[id], today)).length,
      fresh: ids.filter((id) => !cards[id] || cards[id].box === 0).length,
    }
  }

  // ───────────────────────── 入力 ─────────────────────────

  async handle(e: InputEvent): Promise<void> {
    if (e.type === 'background' || e.type === 'exit') {
      await this.store.flush()
      return
    }
    if (e.type === 'foreground') {
      await this.refresh()
      return
    }
    if (e.type === 'up' || e.type === 'down') {
      // スワイプは連続で届くことがあるので間引く
      const t = this.now()
      if (t - this.lastScroll < SCROLL_COOLDOWN_MS) return
      this.lastScroll = t
    }

    const s = this.screen
    switch (s.kind) {
      case 'home':
        return this.onHome(e)
      case 'cards':
        return this.onCards(s, e)
      case 'sessionDone':
        if (e.type === 'click') return this.startCards(s.deck)
        if (e.type === 'double') return this.go({ kind: 'home' })
        return
      case 'grammarList':
        return this.onGrammarList(s, e)
      case 'grammar':
        return this.onGrammar(s, e)
      case 'quiz':
        return this.onQuiz(s, e)
      case 'quizDone':
        if (e.type === 'click') return s.from === 'grammar' ? this.go({ kind: 'grammarList', page: 0 }) : this.startQuiz()
        if (e.type === 'double') return this.go(s.from === 'grammar' ? { kind: 'grammarList', page: 0 } : { kind: 'home' })
        return
      case 'stats':
      case 'help':
        if (e.type === 'click' || e.type === 'double') return this.go({ kind: 'home' })
        return
    }
  }

  private async onHome(e: InputEvent): Promise<void> {
    if (e.type === 'double') {
      await this.store.flush()
      await this.display.requestExit()
      return
    }
    if (e.type !== 'click') return
    switch (e.index ?? 0) {
      case 0:
        return this.startCards('word')
      case 1:
        return this.startCards('phrase')
      case 2:
        return this.go({ kind: 'grammarList', page: 0 })
      case 3:
        return this.startQuiz()
      case 4:
        return this.go({ kind: 'stats' })
      case 5:
        return this.go({ kind: 'help' })
    }
  }

  startCards(deck: Deck): Promise<void> {
    const pool = (deck === 'word' ? this.wordPool() : this.phrasePool()).map((x) => x.id)
    const size = this.store.data.settings.sessionSize
    let ids = pickSession(pool, this.store.data.cards, this.store.today(), size)
    let review = false
    if (ids.length === 0) {
      // 期日の来たカードも新規カードも無い → 全体からランダムにおさらい
      ids = shuffle(pool).slice(0, size)
      review = true
    }
    return this.go({ kind: 'cards', deck, ids, index: 0, revealed: false, ok: 0, ng: 0, review })
  }

  private async onCards(s: Extract<Screen, { kind: 'cards' }>, e: InputEvent): Promise<void> {
    if (e.type === 'double') return this.go({ kind: 'home' })
    if (!s.revealed) {
      // 表面: タップ or 下スワイプで答えを見る
      if (e.type === 'click' || e.type === 'down') return this.go({ ...s, revealed: true })
      return
    }
    // 裏面: タップ=覚えた / 下スワイプ=まだ / 上スワイプ=表に戻す
    if (e.type === 'up') return this.go({ ...s, revealed: false })
    const remembered = e.type === 'click'
    if (e.type !== 'click' && e.type !== 'down') return
    this.store.grade(s.ids[s.index], remembered)
    const next = { ...s, ok: s.ok + (remembered ? 1 : 0), ng: s.ng + (remembered ? 0 : 1) }
    if (s.index + 1 >= s.ids.length) return this.go({ kind: 'sessionDone', deck: s.deck, ok: next.ok, ng: next.ng })
    return this.go({ ...next, index: s.index + 1, revealed: false })
  }

  private grammarListItems(page: number): { items: string[]; targets: Array<number | 'prev' | 'next'> } {
    const topics = this.content.grammar
    const pages = Math.ceil(topics.length / GRAMMAR_PER_PAGE)
    const items: string[] = []
    const targets: Array<number | 'prev' | 'next'> = []
    if (page > 0) {
      items.push('◀ 前のページ')
      targets.push('prev')
    }
    const start = page * GRAMMAR_PER_PAGE
    topics.slice(start, start + GRAMMAR_PER_PAGE).forEach((t, i) => {
      items.push(`${this.store.data.grammarDone[t.id] ? '●' : '○'} ${t.title}`)
      targets.push(start + i)
    })
    if (page < pages - 1) {
      items.push('次のページ ▶')
      targets.push('next')
    }
    return { items, targets }
  }

  private async onGrammarList(s: Extract<Screen, { kind: 'grammarList' }>, e: InputEvent): Promise<void> {
    if (e.type === 'double') return this.go({ kind: 'home' })
    if (e.type !== 'click') return
    const target = this.grammarListItems(s.page).targets[e.index ?? 0]
    if (target === 'prev') return this.go({ kind: 'grammarList', page: s.page - 1 })
    if (target === 'next') return this.go({ kind: 'grammarList', page: s.page + 1 })
    if (typeof target === 'number') return this.go({ kind: 'grammar', topic: target, page: 0 })
  }

  grammarPages(topic: GrammarTopic): string[] {
    return topic.pages.flatMap((p) => paginate(p, TEXT_INNER_W, GRAMMAR_BODY_LINES))
  }

  private async onGrammar(s: Extract<Screen, { kind: 'grammar' }>, e: InputEvent): Promise<void> {
    const topic = this.content.grammar[s.topic]
    const pages = this.grammarPages(topic)
    if (e.type === 'double') return this.go({ kind: 'grammarList', page: Math.floor(s.topic / GRAMMAR_PER_PAGE) })
    if (e.type === 'up') {
      if (s.page > 0) return this.go({ ...s, page: s.page - 1 })
      return
    }
    if (e.type === 'click' || e.type === 'down') {
      if (s.page + 1 < pages.length) return this.go({ ...s, page: s.page + 1 })
      if (e.type === 'click') {
        this.store.markGrammarDone(topic.id)
        return this.go({ kind: 'quiz', items: grammarTopicQuiz(topic), index: 0, correct: 0, from: 'grammar', picked: null })
      }
    }
  }

  startQuiz(): Promise<void> {
    const items = buildMixedQuiz({
      words: this.wordPool(),
      phrases: this.phrasePool(),
      grammar: this.content.grammar,
      cards: this.store.data.cards,
      size: this.store.data.settings.quizSize,
    })
    return this.go({ kind: 'quiz', items, index: 0, correct: 0, from: 'home', picked: null })
  }

  private async onQuiz(s: Extract<Screen, { kind: 'quiz' }>, e: InputEvent): Promise<void> {
    if (e.type === 'double') return this.go(s.from === 'grammar' ? { kind: 'grammarList', page: 0 } : { kind: 'home' })
    if (e.type !== 'click') return
    const item = s.items[s.index]
    if (s.picked === null) {
      const picked = e.index ?? 0
      const ok = picked === item.answer
      this.store.answerQuiz(ok)
      return this.go({ ...s, picked, correct: s.correct + (ok ? 1 : 0) })
    }
    if (s.index + 1 >= s.items.length) {
      return this.go({ kind: 'quizDone', correct: s.correct, total: s.items.length, from: s.from })
    }
    return this.go({ ...s, index: s.index + 1, picked: null })
  }

  // ───────────────────────── 表示 ─────────────────────────

  view(): PageSpec {
    const s = this.screen
    switch (s.kind) {
      case 'home':
        return this.viewHome()
      case 'cards':
        return { boxes: [fullText(this.cardText(s))] }
      case 'sessionDone':
        return { boxes: [fullText(this.sessionDoneText(s))] }
      case 'grammarList': {
        const done = this.content.grammar.filter((g) => this.store.data.grammarDone[g.id]).length
        const pages = Math.ceil(this.content.grammar.length / GRAMMAR_PER_PAGE)
        const right = pages > 1 ? `${s.page + 1}/${pages}` : ''
        return headerWithList(spread(`文法ミニ講座  完了 ${done}/${this.content.grammar.length}`, right, TEXT_INNER_W), this.grammarListItems(s.page).items)
      }
      case 'grammar':
        return { boxes: [fullText(this.grammarText(s))] }
      case 'quiz':
        return this.viewQuiz(s)
      case 'quizDone':
        return { boxes: [fullText(this.quizDoneText(s))] }
      case 'stats':
        return { boxes: [fullText(this.statsText())] }
      case 'help':
        return { boxes: [fullText(HELP_TEXT)] }
    }
  }

  private viewHome(): PageSpec {
    const d = this.store.data
    const w = this.deckCounts('word')
    const p = this.deckCounts('phrase')
    const done = this.content.grammar.filter((g) => d.grammarDone[g.id]).length
    const header = spread('Glance English', `今日 ${this.store.todayCount()}/${d.settings.dailyGoal}  連続${d.streak}日`, TEXT_INNER_W)
    return headerWithList(header, [
      `単語カード   復習 ${w.due} ・ 新規 ${w.fresh}`,
      `フレーズ     復習 ${p.due} ・ 新規 ${p.fresh}`,
      `文法ミニ講座   ${done}/${this.content.grammar.length}`,
      `4択クイズ（${d.settings.quizSize}問）`,
      '学習記録',
      '使い方',
    ])
  }

  cardText(s: Extract<Screen, { kind: 'cards' }>): string {
    const id = s.ids[s.index]
    const jaFirst = this.store.data.settings.direction === 'ja-en'
    const pos = `${s.index + 1}/${s.ids.length}`
    const frontFooter = 'タップ: 答えを見る　2回タップ: メニュー'
    const backFooter = 'タップ: 覚えた　↓: まだ　↑: 表に戻す'

    if (s.deck === 'word') {
      const w = this.content.words.find((x) => x.id === id)!
      const title = `${s.review ? 'おさらい' : '単語'}  ${pos}`
      const tag = LEVEL_LABELS[w.level]
      if (!s.revealed) {
        const front = jaFirst ? `\n${w.ja}\n（${w.pos}）` : `\n${w.en}\n（${w.pos}）`
        return composeScreen(title, tag, front, frontFooter)
      }
      return composeScreen(title, tag, `${w.en}（${w.pos}）\n${w.kana}\n= ${w.ja}\n\n${w.ex}\n${w.exJa}`, backFooter)
    }

    const p = this.content.phrases.find((x) => x.id === id)!
    const title = `${s.review ? 'おさらい' : 'フレーズ'}  ${pos}`
    const tag = SCENE_LABELS[p.scene]
    if (!s.revealed) return composeScreen(title, tag, `\n${jaFirst ? p.ja : p.en}`, frontFooter)
    return composeScreen(title, tag, `${p.en}\n${p.kana}\n= ${p.ja}${p.note ? `\n\n${p.note}` : ''}`, backFooter)
  }

  private sessionDoneText(s: Extract<Screen, { kind: 'sessionDone' }>): string {
    const d = this.store.data
    const today = this.store.todayCount()
    const body = [
      `覚えた ${s.ok}  /  まだ ${s.ng}`,
      '',
      `今日の学習  ${today}/${d.settings.dailyGoal}`,
      progressBar(today, d.settings.dailyGoal, 14),
      `連続 ${d.streak}日`,
    ].join('\n')
    return composeScreen('おつかれさま！', s.deck === 'word' ? '単語' : 'フレーズ', body, 'タップ: もう1セット　2回タップ: メニュー')
  }

  private grammarText(s: Extract<Screen, { kind: 'grammar' }>): string {
    const topic = this.content.grammar[s.topic]
    const pages = this.grammarPages(topic)
    const last = s.page + 1 >= pages.length
    const footer = last ? 'タップ: 確認クイズへ　↑: 前へ' : 'タップ/↓: 次へ　↑: 前へ　2回: 一覧'
    return composeScreen(topic.title, `${s.page + 1}/${pages.length}`, pages[s.page], footer)
  }

  private viewQuiz(s: Extract<Screen, { kind: 'quiz' }>): PageSpec {
    const item = s.items[s.index]
    const head = spread(`クイズ ${s.index + 1}/${s.items.length}`, `正解 ${s.correct}`, TEXT_INNER_W)
    if (s.picked !== null) {
      const ok = s.picked === item.answer
      const body = [
        ok ? '○ 正解！' : `× 残念…  （あなたの答え: ${item.choices[s.picked]}）`,
        `答え: ${item.choices[item.answer]}`,
        '',
        item.explain,
      ].join('\n')
      const footer = s.index + 1 >= s.items.length ? 'タップ: 結果を見る' : 'タップ: 次の問題'
      return { boxes: [fullText(composeScreen(`クイズ ${s.index + 1}/${s.items.length}`, `正解 ${s.correct}`, `${item.q}\n${body}`, footer))] }
    }
    // 問題文(上) + 4択リスト(下)
    const qLines = Math.min(3, 1 + lineCount(item.q, TEXT_INNER_W))
    const qHeight = qLines * LINE_H + TEXT_PAD * 2
    return {
      boxes: [
        { kind: 'text', id: 1, name: 'question', x: 0, y: 0, w: SCREEN_W, h: qHeight, padding: TEXT_PAD, content: `${head}\n${item.q}` },
        {
          kind: 'list',
          id: 2,
          name: 'choices',
          x: 0,
          y: qHeight,
          w: SCREEN_W,
          h: 288 - qHeight,
          capture: true,
          items: item.choices.map((c) => truncatePx(c, SCREEN_W - 40)),
        },
      ],
    }
  }

  private quizDoneText(s: Extract<Screen, { kind: 'quizDone' }>): string {
    const pct = s.total ? Math.round((s.correct / s.total) * 100) : 0
    const msg = pct === 100 ? 'パーフェクト！' : pct >= 70 ? 'いい調子！' : 'もう一度挑戦してみよう'
    const body = `${s.correct} / ${s.total} 問正解（${pct}%）\n${progressBar(s.correct, s.total, 14)}\n\n${msg}`
    const footer = s.from === 'grammar' ? 'タップ: 文法一覧へ' : 'タップ: もう一度　2回タップ: メニュー'
    return composeScreen('クイズ結果', '', body, footer)
  }

  statsText(): string {
    const d = this.store.data
    const cards = d.cards
    const count = (items: { id: string }[]) => ({
      seen: items.filter((x) => (cards[x.id]?.seen ?? 0) > 0).length,
      mastered: items.filter((x) => isMastered(cards[x.id])).length,
      total: items.length,
    })
    const w = count(this.content.words)
    const p = count(this.content.phrases)
    const g = this.content.grammar.filter((t) => d.grammarDone[t.id]).length
    const acc = d.quiz.answered ? Math.round((d.quiz.correct / d.quiz.answered) * 100) : 0
    const today = this.store.todayCount()
    const body = [
      `今日　${today}/${d.settings.dailyGoal}  ${progressBar(today, d.settings.dailyGoal, 10)}`,
      `連続学習  ${d.streak}日`,
      `単語　学習 ${w.seen}/${w.total}　定着 ${w.mastered}`,
      `フレーズ  学習 ${p.seen}/${p.total}　定着 ${p.mastered}`,
      `文法　${g}/${this.content.grammar.length} トピック`,
      `クイズ　正答率 ${acc}%（${d.quiz.answered}問）`,
    ].join('\n')
    return composeScreen('学習記録', '', body, 'タップ: メニューへ')
  }
}

const HELP_TEXT = composeScreen(
  '使い方',
  '',
  [
    'タップ: 決定 / 答えを見る / 覚えた',
    '↓スワイプ: 次へ / まだ覚えていない',
    '↑スワイプ: 前へ / カードを表に戻す',
    '2回タップ: 1つ前の画面へ',
    'メニューで2回タップ: アプリ終了',
    '設定はスマホの画面から変更できます',
  ].join('\n'),
  'タップ: メニューへ',
)
