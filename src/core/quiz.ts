import { getTextWidth } from '@evenrealities/pretext'
import type { GrammarTopic, Phrase, QuizQuestion, Word } from '../data/types'
import { type Rng, sample, shuffle } from './random'
import type { CardState } from './srs'

export { type Rng, shuffle } from './random'

export interface QuizItem {
  q: string
  choices: string[]
  answer: number
  explain: string
  /** 正誤を記録するカードID（単語・フレーズ問題のみ） */
  cardId?: string
}

/** リスト項目1行に収まる幅（px） */
export const CHOICE_MAX_PX = 540
/** 問題文1行の幅（px） */
const QUESTION_MAX_PX = 540

const fits = (s: string) => getTextWidth(s) <= CHOICE_MAX_PX

/** 正解と3つのダミーから4択を作る */
function makeChoices(correct: string, distractors: string[], rng: Rng): { choices: string[]; answer: number } {
  const uniq = [...new Set(distractors.filter((d) => d !== correct))].slice(0, 3)
  const choices = shuffle([correct, ...uniq], rng)
  return { choices, answer: choices.indexOf(correct) }
}

/** 同じ品詞を優先してダミーを選ぶ */
function wordDistractors(word: Word, pool: Word[], pick: (w: Word) => string, rng: Rng): string[] {
  const others = pool.filter((w) => w.id !== word.id && pick(w) !== pick(word) && fits(pick(w)))
  const samePos = shuffle(
    others.filter((w) => w.pos === word.pos),
    rng,
  )
  const rest = shuffle(
    others.filter((w) => w.pos !== word.pos),
    rng,
  )
  return [...samePos, ...rest].map(pick).slice(0, 6)
}

/** 同じ場面を優先してダミーを選ぶ */
function phraseDistractors(phrase: Phrase, pool: Phrase[], pick: (p: Phrase) => string, rng: Rng): string[] {
  const others = pool.filter((p) => p.id !== phrase.id && pick(p) !== pick(phrase) && fits(pick(p)))
  const sameScene = shuffle(
    others.filter((p) => p.scene === phrase.scene),
    rng,
  )
  const rest = shuffle(
    others.filter((p) => p.scene !== phrase.scene),
    rng,
  )
  return [...sameScene, ...rest].map(pick).slice(0, 6)
}

const wordExplain = (w: Word) => `${w.en}（${w.pos}）= ${w.ja}\n${w.ex}`

// ───────────────────────── 単語 ─────────────────────────

export function wordMeaningQuestion(word: Word, pool: Word[], rng: Rng = Math.random): QuizItem {
  const { choices, answer } = makeChoices(word.ja, wordDistractors(word, pool, (w) => w.ja, rng), rng)
  return { q: `「${word.en}」の意味は？`, choices, answer, explain: wordExplain(word), cardId: word.id }
}

export function wordEnglishQuestion(word: Word, pool: Word[], rng: Rng = Math.random): QuizItem {
  const { choices, answer } = makeChoices(word.en, wordDistractors(word, pool, (w) => w.en, rng), rng)
  return { q: `「${word.ja}」を英語で言うと？`, choices, answer, explain: wordExplain(word), cardId: word.id }
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** 例文の中の見出し語を ___ にする。見出し語がそのままの形で入っていなければ null */
export function blankExample(word: Word): string | null {
  const re = new RegExp(`\\b${escapeRe(word.en)}\\b`, 'i')
  if (!re.test(word.ex)) return null
  return word.ex.replace(re, '___')
}

/** 穴埋めにできる単語か（和訳と穴あき例文がそれぞれ1行に収まる） */
export function canBlank(word: Word): boolean {
  const blanked = blankExample(word)
  return !!blanked && getTextWidth(blanked) <= QUESTION_MAX_PX && getTextWidth(word.exJa) <= QUESTION_MAX_PX
}

export function wordBlankQuestion(word: Word, pool: Word[], rng: Rng = Math.random): QuizItem {
  const { choices, answer } = makeChoices(word.en, wordDistractors(word, pool, (w) => w.en, rng), rng)
  return {
    q: `${word.exJa}\n${blankExample(word) ?? word.ex}`,
    choices,
    answer,
    explain: `${word.ex}\n${word.en}（${word.pos}）= ${word.ja}`,
    cardId: word.id,
  }
}

/** 例文の和訳を選べるか（例文が1行、和訳が選択肢の幅に収まる） */
export function canTranslate(word: Word): boolean {
  return getTextWidth(word.ex) <= QUESTION_MAX_PX && fits(word.exJa)
}

export function exampleMeaningQuestion(word: Word, pool: Word[], rng: Rng = Math.random): QuizItem {
  const others = shuffle(
    pool.filter((w) => w.id !== word.id && fits(w.exJa)),
    rng,
  )
  const { choices, answer } = makeChoices(
    word.exJa,
    others.map((w) => w.exJa),
    rng,
  )
  return { q: `この文の意味は？\n${word.ex}`, choices, answer, explain: `${word.ex}\n${word.exJa}\n${word.en} = ${word.ja}`, cardId: word.id }
}

// ───────────────────────── フレーズ ─────────────────────────

export function phraseQuestion(phrase: Phrase, pool: Phrase[], rng: Rng = Math.random): QuizItem {
  const { choices, answer } = makeChoices(phrase.en, phraseDistractors(phrase, pool, (p) => p.en, rng), rng)
  return {
    q: `「${phrase.ja}」を英語で言うと？`,
    choices,
    answer,
    explain: phrase.note ? `${phrase.en}\n${phrase.note}` : phrase.en,
    cardId: phrase.id,
  }
}

export function phraseMeaningQuestion(phrase: Phrase, pool: Phrase[], rng: Rng = Math.random): QuizItem {
  const { choices, answer } = makeChoices(phrase.ja, phraseDistractors(phrase, pool, (p) => p.ja, rng), rng)
  return {
    q: `「${phrase.en}」の意味は？`,
    choices,
    answer,
    explain: phrase.note ? `${phrase.en} = ${phrase.ja}\n${phrase.note}` : `${phrase.en} = ${phrase.ja}`,
    cardId: phrase.id,
  }
}

// ───────────────────────── アクセント ─────────────────────────

/** 前の音にくっつけて読む文字（小さい文字・ッ・ン・ー・二重母音の後半） */
const ATTACH = new Set([...'ァィゥェォャュョヮッンーイウ'])
/** 母音を伴わない子音だけの音（強く読む位置にならない） */
const WEAK = new Set([...'クグスズトドプブツムルフヴジ'])

/**
 * 【】を外したカタカナ読みを、強く読む位置の候補（音のまとまり）に分ける。
 * 例: 'リメンバー' → リ / メン / バー
 */
export function kanaUnits(plain: string): Array<{ start: number; end: number }> {
  const units: Array<{ start: number; end: number }> = []
  for (let i = 0; i < plain.length; i++) {
    const ch = plain[i]
    if (ch === ' ') continue
    const prev = units[units.length - 1]
    if (prev && prev.end === i && ATTACH.has(ch)) prev.end = i + 1
    else units.push({ start: i, end: i + 1 })
  }
  return units
}

/** アクセントの位置だけを変えた、間違いの読みを作る */
export function accentDistractors(kana: string): string[] {
  const open = kana.indexOf('【')
  const close = kana.indexOf('】')
  if (open < 0 || close < open || kana.indexOf('【', close) >= 0) return []
  const plain = kana.replace(/[【】]/g, '')
  const start = open
  const end = close - 1
  // フレーズは「どの語を強く言うか」を問うので、アクセントのある語の中は候補にしない
  const wordStart = plain.lastIndexOf(' ', start) + 1
  const wordEnd = plain.includes(' ', end) ? plain.indexOf(' ', end) : plain.length
  const [lo, hi] = plain.includes(' ') ? [wordStart, wordEnd] : [start, end]
  return kanaUnits(plain)
    .filter((u) => u.end <= lo || u.start >= hi)
    .filter((u) => !(u.end - u.start === 1 && WEAK.has(plain[u.start])))
    .map((u) => `${plain.slice(0, u.start)}【${plain.slice(u.start, u.end)}】${plain.slice(u.end)}`)
}

export function canAccent(item: { kana: string }): boolean {
  return fits(item.kana) && accentDistractors(item.kana).length >= 3
}

export function accentQuestion(item: Word | Phrase, rng: Rng = Math.random): QuizItem {
  const { choices, answer } = makeChoices(item.kana, shuffle(accentDistractors(item.kana), rng), rng)
  return {
    q: `「${item.en}」はどこを強く読む？（【】）`,
    choices,
    answer,
    explain: `${item.en}\n${item.kana}\n= ${item.ja}`,
    cardId: item.id,
  }
}

// ───────────────────────── 文法 ─────────────────────────

export function grammarQuestion(q: QuizQuestion, rng: Rng = Math.random): QuizItem {
  const correct = q.choices[q.answer]
  const choices = shuffle(q.choices, rng)
  return { q: q.q, choices, answer: choices.indexOf(correct), explain: q.explain }
}

/** 文法トピックの確認クイズ（問題の順番もランダム） */
export function grammarTopicQuiz(topic: GrammarTopic, rng: Rng = Math.random): QuizItem[] {
  return shuffle(topic.quiz, rng).map((q) => grammarQuestion(q, rng))
}

// ───────────────────────── クイズの組み立て ─────────────────────────

export type QuizMode = 'mix' | 'word' | 'example' | 'phrase' | 'grammar' | 'accent'

export const QUIZ_MODES: Array<{ mode: QuizMode; label: string }> = [
  { mode: 'mix', label: 'ミックス（全部から）' },
  { mode: 'word', label: '単語の意味・つづり' },
  { mode: 'example', label: '例文の穴埋め・和訳' },
  { mode: 'phrase', label: 'フレーズの意味・言い方' },
  { mode: 'grammar', label: '文法' },
  { mode: 'accent', label: 'アクセント（強く読む所）' },
]

export interface QuizInput {
  words: Word[]
  phrases: Phrase[]
  grammar: GrammarTopic[]
  cards: Record<string, CardState>
  size: number
  rng?: Rng
}

type Maker = (rng: Rng) => QuizItem

/**
 * 学習済み（出題されたことがある）ものを優先して n 個選ぶ。
 * 足りなければ未学習のものから補う。
 */
function prefer<T extends { id: string }>(items: T[], n: number, cards: Record<string, CardState>, rng: Rng): T[] {
  const studied = items.filter((it) => (cards[it.id]?.seen ?? 0) > 0)
  const s = sample(studied, n, rng)
  if (s.length >= n) return s
  const ids = new Set(s.map((x) => x.id))
  return [...s, ...sample(items.filter((x) => !ids.has(x.id)), n - s.length, rng)]
}

function wordMakers(input: QuizInput, n: number, rng: Rng): Maker[] {
  const { words, cards } = input
  return prefer(words, n, cards, rng).map((w, i) =>
    i % 2 === 0 ? (r: Rng) => wordMeaningQuestion(w, words, r) : (r: Rng) => wordEnglishQuestion(w, words, r),
  )
}

function exampleMakers(input: QuizInput, n: number, rng: Rng): Maker[] {
  const { words, cards } = input
  const blankable = words.filter(canBlank)
  const translatable = words.filter(canTranslate)
  const nBlank = Math.ceil(n * 0.6)
  const blanked = prefer(blankable, nBlank, cards, rng)
  const used = new Set(blanked.map((w) => w.id))
  const translated = prefer(
    translatable.filter((w) => !used.has(w.id)),
    n - blanked.length,
    cards,
    rng,
  )
  return [
    ...blanked.map((w) => (r: Rng) => wordBlankQuestion(w, words, r)),
    ...translated.map((w) => (r: Rng) => exampleMeaningQuestion(w, words, r)),
  ]
}

function phraseMakers(input: QuizInput, n: number, rng: Rng): Maker[] {
  const { phrases, cards } = input
  const quizPhrases = phrases.filter((p) => fits(p.en) && fits(p.ja))
  return prefer(quizPhrases, n, cards, rng).map((p, i) =>
    i % 2 === 0 ? (r: Rng) => phraseQuestion(p, phrases, r) : (r: Rng) => phraseMeaningQuestion(p, phrases, r),
  )
}

function grammarMakers(input: QuizInput, n: number, rng: Rng): Maker[] {
  return sample(
    input.grammar.flatMap((g) => g.quiz),
    n,
    rng,
  ).map((q) => (r: Rng) => grammarQuestion(q, r))
}

function accentMakers(input: QuizInput, n: number, rng: Rng): Maker[] {
  const pool = [...input.words, ...input.phrases].filter(canAccent)
  return prefer(pool, n, input.cards, rng).map((x) => (r: Rng) => accentQuestion(x, r))
}

/** ミックスの配分 */
const MIX: Array<[(input: QuizInput, n: number, rng: Rng) => Maker[], number]> = [
  [wordMakers, 0.3],
  [exampleMakers, 0.15],
  [phraseMakers, 0.2],
  [grammarMakers, 0.25],
  [accentMakers, 0.1],
]

/** 種類を指定して4択クイズを作る。出題順はランダム */
export function buildQuiz(mode: QuizMode, input: QuizInput): QuizItem[] {
  const rng = input.rng ?? Math.random
  const { size } = input
  let makers: Maker[]
  switch (mode) {
    case 'word':
      makers = wordMakers(input, size, rng)
      break
    case 'example':
      makers = exampleMakers(input, size, rng)
      break
    case 'phrase':
      makers = phraseMakers(input, size, rng)
      break
    case 'grammar':
      makers = grammarMakers(input, size, rng)
      break
    case 'accent':
      makers = accentMakers(input, size, rng)
      break
    case 'mix': {
      makers = []
      let left = size
      MIX.forEach(([make, ratio], i) => {
        const n = i === MIX.length - 1 ? left : Math.min(left, Math.round(size * ratio))
        left -= n
        makers.push(...make(input, n, rng))
      })
      break
    }
  }
  return shuffle(makers, rng)
    .slice(0, size)
    .map((make) => make(rng))
}

/** 単語・フレーズ・文法などを混ぜた4択クイズ */
export function buildMixedQuiz(input: QuizInput): QuizItem[] {
  return buildQuiz('mix', input)
}
