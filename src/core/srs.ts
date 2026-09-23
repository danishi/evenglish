/**
 * ライトナー方式の簡易SRS（間隔反復）。
 * 「覚えた」でボックスが1つ上がり、「まだ」でボックス1に戻る。
 * ボックスごとに次の出題までの日数が伸びていく。
 */

/** box 0 は未学習。1〜5 が学習中。 */
export const BOX_INTERVAL_DAYS = [0, 1, 2, 4, 7, 15] as const
export const MAX_BOX = BOX_INTERVAL_DAYS.length - 1

export interface CardState {
  box: number
  /** 次に出題する日 (YYYY-MM-DD) */
  due: string
  /** 正解数 / 出題数 */
  ok: number
  seen: number
}

export function todayKey(date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function addDays(dayKey: string, days: number): string {
  const [y, m, d] = dayKey.split('-').map(Number)
  return todayKey(new Date(y, m - 1, d + days))
}

export function diffDays(from: string, to: string): number {
  const [y1, m1, d1] = from.split('-').map(Number)
  const [y2, m2, d2] = to.split('-').map(Number)
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86_400_000)
}

export function review(state: CardState | undefined, remembered: boolean, today: string): CardState {
  const prev = state ?? { box: 0, due: today, ok: 0, seen: 0 }
  const box = remembered ? Math.min(prev.box + 1, MAX_BOX) : 1
  return {
    box,
    due: addDays(today, remembered ? BOX_INTERVAL_DAYS[box] : 0),
    ok: prev.ok + (remembered ? 1 : 0),
    seen: prev.seen + 1,
  }
}

export function isDue(state: CardState | undefined, today: string): boolean {
  return !!state && state.box > 0 && state.due <= today
}

/** 最上位ボックスに到達した＝定着したとみなす */
export function isMastered(state: CardState | undefined): boolean {
  return !!state && state.box >= MAX_BOX - 1
}

/**
 * 出題カードを選ぶ。期日の来た復習カードを優先し、残り枠を新規カードで埋める。
 * 復習は期日が古い順、新規は元の並び順。
 */
export function pickSession(
  ids: string[],
  cards: Record<string, CardState>,
  today: string,
  size: number,
): string[] {
  const due = ids
    .filter((id) => isDue(cards[id], today))
    .sort((a, b) => cards[a].due.localeCompare(cards[b].due) || cards[a].box - cards[b].box)
  const fresh = ids.filter((id) => !cards[id] || cards[id].box === 0)
  return [...due, ...fresh].slice(0, size)
}
