import { getAdvW, getTextWidth, measureTextWrap, pxTruncate } from '@evenrealities/pretext'

/** G2 の表示領域と、ファームウェアのフォントの固定値 */
export const SCREEN_W = 576
export const SCREEN_H = 288
export const LINE_H = 27
export const LIST_ITEM_H = 40
export const LIST_ITEM_PAD_X = 12

export function lineCount(text: string, width: number): number {
  return measureTextWrap(text, width).lineCount
}

export function fitsLines(text: string, width: number, maxLines: number): boolean {
  return lineCount(text, width) <= maxLines
}

export function truncatePx(text: string, width: number): string {
  return pxTruncate(text, width)
}

/** ファームウェアのフォントに無い文字（表示時に黙って消える文字）を返す */
export function missingGlyphs(text: string): string[] {
  const missing = new Set<string>()
  for (const ch of text) {
    if (ch === '\n' || ch === ' ') continue
    const cp = ch.codePointAt(0)!
    if (getAdvW(cp) <= 0) missing.add(ch)
  }
  return [...missing]
}

/**
 * テキストを指定行数に収まるページに分割する。
 * 段落（改行）単位で詰め、1段落が長すぎる場合は文字単位で折り返す。
 */
export function paginate(text: string, width: number, maxLines: number): string[] {
  const pages: string[] = []
  let current: string[] = []

  const fits = (lines: string[]) => fitsLines(lines.join('\n'), width, maxLines)

  for (const para of text.split('\n')) {
    if (fits([...current, para])) {
      current.push(para)
      continue
    }
    if (current.length > 0) {
      pages.push(current.join('\n'))
      current = []
    }
    if (fits([para])) {
      current.push(para)
      continue
    }
    // 1段落だけで溢れる場合は文字単位で切る
    let chunk = ''
    for (const ch of para) {
      if (fitsLines(chunk + ch, width, maxLines)) {
        chunk += ch
      } else {
        pages.push(chunk)
        chunk = ch
      }
    }
    current.push(chunk)
  }
  if (current.length > 0) pages.push(current.join('\n'))
  // 先頭・末尾の空行だけのページを除く
  return pages.map((p) => p.replace(/^\n+|\n+$/g, '')).filter((p) => p.length > 0)
}

/** 進捗バー（━ と ─ で描画） */
export function progressBar(value: number, max: number, cells = 10): string {
  const ratio = max <= 0 ? 0 : Math.min(1, Math.max(0, value / max))
  const filled = Math.round(ratio * cells)
  return '━'.repeat(filled) + '─'.repeat(cells - filled)
}

/** 左右に文字列を置いた1行を作る（右側はスペースで寄せる） */
export function spread(left: string, right: string, width: number): string {
  const space = getTextWidth(' ') || 5
  const gap = width - getTextWidth(left + right) - space
  const n = Math.max(1, Math.floor(gap / space))
  return left + ' '.repeat(n) + right
}
