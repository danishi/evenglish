import { describe, expect, it } from 'vitest'
import { PHRASE_KANA, WORD_KANA } from '../src/data/kana'
import { GRAMMAR } from '../src/data/grammar'
import { PHRASES } from '../src/data/phrases'
import { WORDS } from '../src/data/words'
import { lineCount, missingGlyphs } from '../src/core/text'
import { GRAMMAR_BODY_LINES, TEXT_INNER_W } from '../src/glasses/layout'

function allText(): string {
  return [
    ...WORDS.flatMap((w) => [w.en, w.pos, w.kana, w.ja, w.ex, w.exJa]),
    ...PHRASES.flatMap((p) => [p.en, p.kana, p.ja, p.note ?? '']),
    ...GRAMMAR.flatMap((g) => [g.title, ...g.pages, ...g.quiz.flatMap((q) => [q.q, ...q.choices, q.explain])]),
  ].join('\n')
}

describe('コンテンツ', () => {
  it('グラスのフォントに無い文字を使っていない', () => {
    expect(missingGlyphs(allText())).toEqual([])
  })

  it('すべての単語・フレーズにアクセントつきのカタカナ読みがあり、1行に収まる', () => {
    for (const x of [...WORDS, ...PHRASES]) {
      // 【】はアクセント。入れ子にせず、中身は空にしない
      expect(x.kana, x.en).toMatch(/^[ァ-ヴー ]*(【[ァ-ヴー]+】[ァ-ヴー ]*)+$/)
      expect(lineCount(x.kana, TEXT_INNER_W), x.en).toBe(1)
    }
  })

  it('カタカナ読みの表に教材に無い見出しが残っていない', () => {
    const en = new Set([...WORDS, ...PHRASES].map((x) => x.en))
    expect([...Object.keys(WORD_KANA), ...Object.keys(PHRASE_KANA)].filter((k) => !en.has(k))).toEqual([])
  })

  it('ID が重複していない', () => {
    const ids = [...WORDS.map((w) => w.id), ...PHRASES.map((p) => p.id), ...GRAMMAR.map((g) => g.id)]
    expect(ids.length).toBe(new Set(ids).size)
  })

  it('同じ英単語・フレーズが重複していない', () => {
    const en = WORDS.map((w) => w.en.toLowerCase())
    expect(en.filter((e, i) => en.indexOf(e) !== i)).toEqual([])
    const ph = PHRASES.map((p) => p.en.toLowerCase())
    expect(ph.filter((e, i) => ph.indexOf(e) !== i)).toEqual([])
  })

  it('単語カードの例文が長すぎない', () => {
    for (const w of WORDS) {
      expect(lineCount(w.ex, TEXT_INNER_W), w.en).toBeLessThanOrEqual(2)
      expect(lineCount(w.exJa, TEXT_INNER_W), w.en).toBeLessThanOrEqual(2)
    }
  })

  it('フレーズと補足が長すぎない', () => {
    for (const p of PHRASES) {
      expect(lineCount(p.en, TEXT_INNER_W), p.en).toBeLessThanOrEqual(2)
      expect(lineCount(p.note ?? '', TEXT_INNER_W), p.en).toBeLessThanOrEqual(2)
    }
  })

  it('文法の各ページが1画面に収まる', () => {
    const over = GRAMMAR.flatMap((g) =>
      g.pages
        .map((page, i) => ({ id: `${g.id} p${i + 1}`, lines: lineCount(page, TEXT_INNER_W) }))
        .filter((p) => p.lines > GRAMMAR_BODY_LINES),
    )
    expect(over).toEqual([])
  })

  it('文法クイズは選択肢が4つで重複がなく、1行に収まる', () => {
    for (const g of GRAMMAR) {
      expect(g.quiz.length, g.title).toBeGreaterThanOrEqual(2)
      for (const q of g.quiz) {
        expect(new Set(q.choices).size, q.q).toBe(4)
        expect(q.answer).toBeGreaterThanOrEqual(0)
        expect(q.answer).toBeLessThan(4)
        for (const c of q.choices) expect(lineCount(c, TEXT_INNER_W - 24), c).toBe(1)
        expect(lineCount(q.q, TEXT_INNER_W), q.q).toBeLessThanOrEqual(2)
      }
    }
  })
})
