import { LINE_H, SCREEN_H, SCREEN_W } from '../core/text'

/** 全画面テキストコンテナの余白 */
export const TEXT_PAD = 8
/** 全画面テキストの内側の幅・行数 */
export const TEXT_INNER_W = SCREEN_W - TEXT_PAD * 2
export const TEXT_MAX_LINES = Math.floor((SCREEN_H - TEXT_PAD * 2) / LINE_H)
/** 文法ページ: ヘッダー2行 + 本文 + 操作ヒント1行 */
export const GRAMMAR_BODY_LINES = TEXT_MAX_LINES - 3
