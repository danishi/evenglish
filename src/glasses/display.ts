/**
 * グラス画面の抽象化。
 * アプリのロジックは「どんな画面を出したいか (PageSpec)」だけを組み立て、
 * 実機 (EvenDisplay) とブラウザ用プレビュー (PreviewDisplay) がそれぞれ描画する。
 */

export interface BoxBase {
  id: number
  /** コンテナ名（ページ内で一意・16文字以内） */
  name: string
  x: number
  y: number
  w: number
  h: number
  /** 入力イベントを受け取るコンテナ（ページに1つだけ） */
  capture?: boolean
  border?: number
  padding?: number
}

export interface TextBox extends BoxBase {
  kind: 'text'
  content: string
}

export interface ListBox extends BoxBase {
  kind: 'list'
  items: string[]
}

export type Box = TextBox | ListBox

export interface PageSpec {
  boxes: Box[]
}

export type InputEvent =
  | { type: 'click'; index?: number }
  | { type: 'double' }
  | { type: 'up' }
  | { type: 'down' }
  | { type: 'foreground' }
  | { type: 'background' }
  | { type: 'exit' }

export interface Display {
  /** ページを表示する。レイアウトが同じならテキストだけ差し替える */
  render(page: PageSpec): Promise<void>
  onInput(handler: (e: InputEvent) => void): void
  /** システムの終了確認ダイアログを出す */
  requestExit(): Promise<void>
}

/** テキスト以外（位置・種類・リスト項目）が同じか。同じなら textContainerUpgrade で済む */
export function sameLayout(a: PageSpec | null, b: PageSpec): boolean {
  if (!a || a.boxes.length !== b.boxes.length) return false
  return a.boxes.every((box, i) => {
    const other = b.boxes[i]
    if (
      box.kind !== other.kind ||
      box.id !== other.id ||
      box.name !== other.name ||
      box.x !== other.x ||
      box.y !== other.y ||
      box.w !== other.w ||
      box.h !== other.h ||
      !!box.capture !== !!other.capture ||
      (box.border ?? 0) !== (other.border ?? 0) ||
      (box.padding ?? 0) !== (other.padding ?? 0)
    ) {
      return false
    }
    if (box.kind === 'list' && other.kind === 'list') {
      return box.items.length === other.items.length && box.items.every((it, j) => it === other.items[j])
    }
    return true
  })
}
