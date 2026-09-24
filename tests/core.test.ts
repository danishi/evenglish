import { describe, expect, it } from 'vitest'
import { ProgressStore, parseProgress, type KeyValueStorage } from '../src/core/progress'
import {
  QUIZ_MODES,
  accentDistractors,
  blankExample,
  buildMixedQuiz,
  buildQuiz,
  grammarQuestion,
  grammarTopicQuiz,
  shuffle,
} from '../src/core/quiz'
import { addDays, diffDays, isDue, isLearned, pickSession, review } from '../src/core/srs'
import { paginate, lineCount, progressBar } from '../src/core/text'
import { GRAMMAR } from '../src/data/grammar'
import { PHRASES } from '../src/data/phrases'
import { WORDS } from '../src/data/words'

function seeded(seed = 1) {
  return () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
}

describe('srs', () => {
  it('覚えたらボックスが上がり、次回が先になる', () => {
    let s = review(undefined, true, '2026-01-01')
    // 初見で覚えていたらボックス2から
    expect(s).toMatchObject({ box: 2, due: '2026-01-03', ok: 1, seen: 1 })
    expect(isLearned(s)).toBe(true)
    s = review(s, true, '2026-01-03')
    expect(s).toMatchObject({ box: 3, due: '2026-01-07' })
    s = review({ box: 1, due: '2026-01-01', ok: 0, seen: 1 }, true, '2026-01-01')
    expect(s).toMatchObject({ box: 2, due: '2026-01-03' })
  })

  it('まだならボックス1に戻り、今日もう一度出る', () => {
    const s = review({ box: 4, due: '2026-01-01', ok: 3, seen: 3 }, false, '2026-01-10')
    expect(s).toMatchObject({ box: 1, due: '2026-01-10', ok: 3, seen: 4 })
    expect(isDue(s, '2026-01-10')).toBe(true)
    expect(isLearned(s)).toBe(false)
  })

  it('日付計算は月をまたいでも正しい', () => {
    expect(addDays('2026-01-30', 3)).toBe('2026-02-02')
    expect(diffDays('2026-02-27', '2026-03-01')).toBe(2)
  })

  it('期日の来た復習を優先し、残りを新規で埋める', () => {
    const cards = {
      a: { box: 2, due: '2026-01-05', ok: 1, seen: 1 },
      b: { box: 1, due: '2026-01-01', ok: 0, seen: 1 },
      c: { box: 3, due: '2026-02-01', ok: 2, seen: 2 },
    }
    const picked = pickSession(['a', 'b', 'c', 'd', 'e'], cards, '2026-01-10', 3, seeded(5))
    expect(picked).toHaveLength(3)
    expect(picked).toEqual(expect.arrayContaining(['a', 'b']))
    expect(picked).not.toContain('c')
  })

  it('新規カードはランダムに選ぶ', () => {
    const ids = Array.from({ length: 50 }, (_, i) => `n${i}`)
    const a = pickSession(ids, {}, '2026-01-10', 10, seeded(1))
    const b = pickSession(ids, {}, '2026-01-10', 10, seeded(2))
    expect(a).not.toEqual(ids.slice(0, 10))
    expect(a).not.toEqual(b)
  })
})

describe('progress', () => {
  function memory(): KeyValueStorage & { value: string } {
    const m = {
      value: '',
      async getItem() {
        return m.value
      },
      async setItem(_k: string, v: string) {
        m.value = v
      },
    }
    return m
  }

  it('連続学習日数を数え、空いたらリセットする', async () => {
    let now = new Date(2026, 0, 1)
    const storage = memory()
    const store = new ProgressStore(storage, { now: () => now, saveDelayMs: 0 })
    await store.load()
    store.grade('wb001', true)
    expect(store.data.streak).toBe(1)
    now = new Date(2026, 0, 2)
    store.grade('wb002', true)
    expect(store.data.streak).toBe(2)
    expect(store.todayCount()).toBe(1)
    await store.flush()

    now = new Date(2026, 0, 5)
    const reloaded = new ProgressStore(storage, { now: () => now })
    await reloaded.load()
    expect(reloaded.data.streak).toBe(0)
    expect(reloaded.data.cards.wb001.box).toBe(2)
  })

  it('壊れたデータや古い形式でも読み込める', () => {
    expect(parseProgress('{broken').cards).toEqual({})
    const p = parseProgress(JSON.stringify({ settings: { sessionSize: 5 } }))
    expect(p.settings.sessionSize).toBe(5)
    expect(p.settings.quizSize).toBe(10)
  })
})

describe('quiz', () => {
  it('シャッフルしても正解の位置を追跡できる', () => {
    const rng = seeded(7)
    for (const q of GRAMMAR.flatMap((g) => g.quiz)) {
      const item = grammarQuestion(q, rng)
      expect(item.choices[item.answer]).toBe(q.choices[q.answer])
    }
  })

  it('ミックスクイズは指定数の4択を作る', () => {
    const items = buildMixedQuiz({ words: WORDS, phrases: PHRASES, grammar: GRAMMAR, cards: {}, size: 10, rng: seeded(3) })
    expect(items).toHaveLength(10)
    for (const it of items) {
      expect(it.choices).toHaveLength(4)
      expect(new Set(it.choices).size).toBe(4)
      expect(it.answer).toBeGreaterThanOrEqual(0)
    }
  })

  it('どの種類のクイズも指定数の4択を作る', () => {
    for (const { mode } of QUIZ_MODES) {
      for (const seed of [1, 2, 3]) {
        const items = buildQuiz(mode, { words: WORDS, phrases: PHRASES, grammar: GRAMMAR, cards: {}, size: 10, rng: seeded(seed) })
        expect(items, mode).toHaveLength(10)
        for (const it of items) {
          expect(it.choices, `${mode} ${it.q}`).toHaveLength(4)
          expect(new Set(it.choices).size, `${mode} ${it.q}`).toBe(4)
          expect(it.answer).toBeGreaterThanOrEqual(0)
        }
      }
    }
  })

  it('例文の穴埋めは見出し語を ___ にする', () => {
    const w = WORDS.find((x) => x.en === 'borrow')!
    expect(blankExample(w)).toBe('Can I ___ your pen?')
    expect(blankExample({ ...w, ex: 'I borrowed it.' })).toBeNull()
  })

  it('アクセント問題のダミーは正解と別の位置を強く読む', () => {
    expect(accentDistractors('【ネ】セサリー')).toEqual(['ネ【セ】サリー', 'ネセ【サ】リー', 'ネセサ【リー】'])
    // フレーズは強く読む語以外から選ぶ
    expect(accentDistractors('イッツ アップ トゥ 【ユー】')).toEqual(['【イッ】ツ アップ トゥ ユー', 'イッツ 【アッ】プ トゥ ユー', 'イッツ アップ 【トゥ】 ユー'])
  })

  it('文法トピックの確認クイズは全問を出す', () => {
    const items = grammarTopicQuiz(GRAMMAR[0], seeded(4))
    expect(items.map((i) => i.choices[i.answer]).sort()).toEqual(GRAMMAR[0].quiz.map((q) => q.choices[q.answer]).sort())
  })

  it('shuffle は要素を失わない', () => {
    expect(shuffle([1, 2, 3, 4, 5], seeded(2)).sort()).toEqual([1, 2, 3, 4, 5])
  })
})

describe('text', () => {
  it('長い文章を行数内のページに分ける', () => {
    const text = Array.from({ length: 30 }, (_, i) => `${i + 1}行目のテキストです`).join('\n')
    const pages = paginate(text, 560, 7)
    expect(pages.length).toBeGreaterThan(1)
    for (const p of pages) expect(lineCount(p, 560)).toBeLessThanOrEqual(7)
    expect(pages.join('\n')).toBe(text)
  })

  it('進捗バー', () => {
    expect(progressBar(5, 10, 4)).toBe('━━──')
    expect(progressBar(20, 10, 4)).toBe('━━━━')
  })
})
