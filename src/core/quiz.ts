import { getTextWidth } from '@evenrealities/pretext'
import type { GrammarTopic, Phrase, QuizQuestion, Word } from '../data/types'
import type { CardState } from './srs'

export interface QuizItem {
  q: string
  choices: string[]
  answer: number
  explain: string
  /** 正誤を記録するカードID（単語・フレーズ問題のみ） */
  cardId?: string
}

export type Rng = () => number

/** リスト項目1行に収まる幅（px） */
export const CHOICE_MAX_PX = 540

export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function sample<T>(items: readonly T[], n: number, rng: Rng): T[] {
  return shuffle(items, rng).slice(0, n)
}

/** 正解と3つのダミーから4択を作る */
function makeChoices(correct: string, distractors: string[], rng: Rng): { choices: string[]; answer: number } {
  const uniq = [...new Set(distractors.filter((d) => d !== correct))].slice(0, 3)
  const choices = shuffle([correct, ...uniq], rng)
  return { choices, answer: choices.indexOf(correct) }
}

/** 同じ品詞を優先してダミーを選ぶ */
function wordDistractors(word: Word, pool: Word[], pick: (w: Word) => string, rng: Rng): string[] {
  const others = pool.filter((w) => w.id !== word.id && pick(w) !== pick(word))
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

export function wordMeaningQuestion(word: Word, pool: Word[], rng: Rng = Math.random): QuizItem {
  const { choices, answer } = makeChoices(word.ja, wordDistractors(word, pool, (w) => w.ja, rng), rng)
  return {
    q: `「${word.en}」の意味は？`,
    choices,
    answer,
    explain: `${word.en}（${word.pos}）= ${word.ja}\n${word.ex}`,
    cardId: word.id,
  }
}

export function wordEnglishQuestion(word: Word, pool: Word[], rng: Rng = Math.random): QuizItem {
  const { choices, answer } = makeChoices(word.en, wordDistractors(word, pool, (w) => w.en, rng), rng)
  return {
    q: `「${word.ja}」を英語で言うと？`,
    choices,
    answer,
    explain: `${word.en}（${word.pos}）= ${word.ja}\n${word.ex}`,
    cardId: word.id,
  }
}

export function phraseQuestion(phrase: Phrase, pool: Phrase[], rng: Rng = Math.random): QuizItem {
  const fits = (p: Phrase) => getTextWidth(p.en) <= CHOICE_MAX_PX
  const sameScene = shuffle(
    pool.filter((p) => p.id !== phrase.id && p.scene === phrase.scene && fits(p)),
    rng,
  )
  const other = shuffle(
    pool.filter((p) => p.id !== phrase.id && p.scene !== phrase.scene && fits(p)),
    rng,
  )
  const { choices, answer } = makeChoices(
    phrase.en,
    [...sameScene, ...other].map((p) => p.en),
    rng,
  )
  return {
    q: `「${phrase.ja}」を英語で言うと？`,
    choices,
    answer,
    explain: phrase.note ? `${phrase.en}\n${phrase.note}` : phrase.en,
    cardId: phrase.id,
  }
}

export function grammarQuestion(q: QuizQuestion, rng: Rng = Math.random): QuizItem {
  const correct = q.choices[q.answer]
  const choices = shuffle(q.choices, rng)
  return { q: q.q, choices, answer: choices.indexOf(correct), explain: q.explain }
}

export function grammarTopicQuiz(topic: GrammarTopic, rng: Rng = Math.random): QuizItem[] {
  return topic.quiz.map((q) => grammarQuestion(q, rng))
}

export interface MixedQuizInput {
  words: Word[]
  phrases: Phrase[]
  grammar: GrammarTopic[]
  cards: Record<string, CardState>
  size: number
  rng?: Rng
}

/**
 * 単語・フレーズ・文法を混ぜた4択クイズを作る。
 * 学習済み（出題されたことがある）カードを優先して出題する。
 */
export function buildMixedQuiz({ words, phrases, grammar, cards, size, rng = Math.random }: MixedQuizInput): QuizItem[] {
  const studied = <T extends { id: string }>(items: T[]) => items.filter((it) => (cards[it.id]?.seen ?? 0) > 0)
  const prefer = <T extends { id: string }>(items: T[], n: number) => {
    const s = sample(studied(items), n, rng)
    if (s.length >= n) return s
    const ids = new Set(s.map((x) => x.id))
    return [...s, ...sample(items.filter((x) => !ids.has(x.id)), n - s.length, rng)]
  }

  const nGrammar = Math.round(size * 0.3)
  const nPhrase = Math.round(size * 0.2)
  const nWord = size - nGrammar - nPhrase

  const items: QuizItem[] = []
  prefer(words, nWord).forEach((w, i) => {
    items.push(i % 2 === 0 ? wordMeaningQuestion(w, words, rng) : wordEnglishQuestion(w, words, rng))
  })
  const quizPhrases = phrases.filter((p) => getTextWidth(p.en) <= CHOICE_MAX_PX)
  prefer(quizPhrases, nPhrase).forEach((p) => items.push(phraseQuestion(p, phrases, rng)))
  const grammarQs = grammar.flatMap((g) => g.quiz)
  sample(grammarQs, nGrammar, rng).forEach((q) => items.push(grammarQuestion(q, rng)))

  return shuffle(items, rng).slice(0, size)
}
