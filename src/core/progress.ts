import type { PhraseScene, WordLevel } from '../data/types'
import { type CardState, diffDays, review, todayKey } from './srs'

export interface Settings {
  /** 1セッションのカード枚数 */
  sessionSize: number
  /** 出題する単語レベル */
  levels: WordLevel[]
  /** 出題するフレーズの場面 */
  scenes: PhraseScene[]
  /** 1日の目標（学習カード数） */
  dailyGoal: number
  /** カードの出題方向: 英→日 / 日→英 */
  direction: 'en-ja' | 'ja-en'
  /** 4択クイズの問題数 */
  quizSize: number
}

export interface ProgressData {
  version: 1
  cards: Record<string, CardState>
  settings: Settings
  /** 日付ごとの学習数 */
  days: Record<string, number>
  streak: number
  lastStudyDay: string | null
  grammarDone: Record<string, boolean>
  quiz: { answered: number; correct: number }
}

export const DEFAULT_SETTINGS: Settings = {
  sessionSize: 10,
  levels: ['basic', 'daily', 'business'],
  scenes: ['daily', 'travel', 'work', 'social'],
  dailyGoal: 20,
  direction: 'en-ja',
  quizSize: 10,
}

export function emptyProgress(): ProgressData {
  return {
    version: 1,
    cards: {},
    settings: { ...DEFAULT_SETTINGS },
    days: {},
    streak: 0,
    lastStudyDay: null,
    grammarDone: {},
    quiz: { answered: 0, correct: 0 },
  }
}

/** 保存先。Even App では bridge の localStorage、ブラウザでは window.localStorage */
export interface KeyValueStorage {
  getItem(key: string): Promise<string>
  setItem(key: string, value: string): Promise<void>
}

const STORAGE_KEY = 'evenglish.progress.v1'

export function parseProgress(raw: string | null | undefined): ProgressData {
  if (!raw) return emptyProgress()
  try {
    const parsed = JSON.parse(raw) as Partial<ProgressData>
    const base = emptyProgress()
    return {
      ...base,
      ...parsed,
      version: 1,
      settings: { ...base.settings, ...parsed.settings },
      quiz: { ...base.quiz, ...parsed.quiz },
    }
  } catch {
    return emptyProgress()
  }
}

type Listener = (data: ProgressData) => void

/**
 * 学習データのストア。
 * 変更はメモリに即反映し、保存はデバウンスしてまとめて行う
 * （グラスとの BLE 通信と帯域を共有するため頻繁に書かない）。
 */
export class ProgressStore {
  data: ProgressData = emptyProgress()
  private listeners = new Set<Listener>()
  private saveTimer: ReturnType<typeof setTimeout> | null = null
  private storage: KeyValueStorage
  private saveDelayMs: number
  private now: () => Date

  constructor(storage: KeyValueStorage, options: { saveDelayMs?: number; now?: () => Date } = {}) {
    this.storage = storage
    this.saveDelayMs = options.saveDelayMs ?? 1500
    this.now = options.now ?? (() => new Date())
  }

  async load(): Promise<void> {
    let raw = ''
    try {
      raw = await this.storage.getItem(STORAGE_KEY)
    } catch (e) {
      console.warn('[progress] load failed', e)
    }
    this.data = parseProgress(raw)
    this.refreshStreak()
    this.emit()
  }

  today(): string {
    return todayKey(this.now())
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  /** カードの自己評価を記録する */
  grade(id: string, remembered: boolean): void {
    const today = this.today()
    this.data.cards[id] = review(this.data.cards[id], remembered, today)
    this.countStudy(today)
    this.changed()
  }

  answerQuiz(correct: boolean): void {
    this.data.quiz.answered += 1
    if (correct) this.data.quiz.correct += 1
    this.countStudy(this.today())
    this.changed()
  }

  markGrammarDone(id: string): void {
    if (this.data.grammarDone[id]) return
    this.data.grammarDone[id] = true
    this.changed()
  }

  updateSettings(patch: Partial<Settings>): void {
    this.data.settings = { ...this.data.settings, ...patch }
    this.changed()
  }

  reset(): void {
    const settings = this.data.settings
    this.data = { ...emptyProgress(), settings }
    this.changed()
  }

  todayCount(): number {
    return this.data.days[this.today()] ?? 0
  }

  /** 保留中の保存をすぐ実行する（バックグラウンド移行・終了時） */
  async flush(): Promise<void> {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer)
      this.saveTimer = null
    }
    try {
      await this.storage.setItem(STORAGE_KEY, JSON.stringify(this.data))
    } catch (e) {
      console.warn('[progress] save failed', e)
    }
  }

  private countStudy(today: string): void {
    this.data.days[today] = (this.data.days[today] ?? 0) + 1
    const last = this.data.lastStudyDay
    if (last !== today) {
      this.data.streak = last && diffDays(last, today) === 1 ? this.data.streak + 1 : 1
      this.data.lastStudyDay = today
    }
  }

  /** 最終学習日から2日以上空いていたら連続記録を0に戻す */
  private refreshStreak(): void {
    const last = this.data.lastStudyDay
    if (last && diffDays(last, this.today()) > 1) this.data.streak = 0
  }

  private changed(): void {
    this.emit()
    if (this.saveTimer) clearTimeout(this.saveTimer)
    this.saveTimer = setTimeout(() => void this.flush(), this.saveDelayMs)
  }

  private emit(): void {
    for (const fn of this.listeners) fn(this.data)
  }
}
