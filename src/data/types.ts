/** 単語のレベル区分 */
export type WordLevel = 'basic' | 'daily' | 'business' | 'advanced'

export const LEVEL_LABELS: Record<WordLevel, string> = {
  basic: '基礎',
  daily: '日常',
  business: 'ビジネス',
  advanced: '上級',
}

export interface Word {
  id: string
  en: string
  /** 品詞（名・動・形・副・前・接・句） */
  pos: string
  /** カタカナ読み */
  kana: string
  ja: string
  ex: string
  exJa: string
  level: WordLevel
}

export type PhraseScene = 'daily' | 'travel' | 'work' | 'social'

export const SCENE_LABELS: Record<PhraseScene, string> = {
  daily: '日常',
  travel: '旅行',
  work: '仕事',
  social: '雑談・気持ち',
}

export interface Phrase {
  id: string
  en: string
  /** カタカナ読み */
  kana: string
  ja: string
  scene: PhraseScene
  /** 使い方のポイント（任意） */
  note?: string
}

export interface QuizQuestion {
  q: string
  choices: [string, string, string, string]
  /** choices の正解インデックス */
  answer: number
  explain: string
}

export interface GrammarTopic {
  id: string
  title: string
  /** グラス1画面に収まる程度に区切った解説ページ */
  pages: string[]
  quiz: QuizQuestion[]
}
