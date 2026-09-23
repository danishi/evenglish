import {
  CreateStartUpPageContainer,
  type EvenAppBridge,
  type EvenHubEvent,
  ListContainerProperty,
  ListItemContainerProperty,
  OsEventTypeList,
  RebuildPageContainer,
  StartUpPageCreateResult,
  TextContainerProperty,
  TextContainerUpgrade,
} from '@evenrealities/even_hub_sdk'
import { type Display, type InputEvent, type PageSpec, sameLayout } from './display'

/** BLE 越しの呼び出しは稀に固まるので上限を設ける */
const CALL_TIMEOUT_MS = 5000

function withTimeout<T>(p: Promise<T>, label: string): Promise<T | undefined> {
  return Promise.race([
    p,
    new Promise<undefined>((resolve) =>
      setTimeout(() => {
        console.warn(`[glasses] ${label} timed out`)
        resolve(undefined)
      }, CALL_TIMEOUT_MS),
    ),
  ])
}

function eventType(raw: unknown): number {
  // protobuf ではゼロ値 (CLICK_EVENT=0) が省略されて undefined で届く
  return OsEventTypeList.fromJson(raw) ?? 0
}

/**
 * SDK のイベントをアプリ用の入力に変換する。
 * - テキストコンテナ: スワイプは textEvent、タップは sysEvent で届く
 * - リストコンテナ: タップは listEvent（選択インデックス付き）、スワイプは本体側で処理される
 */
export function normalizeEvent(e: EvenHubEvent, listItems: string[] = []): InputEvent | null {
  if (e.listEvent) {
    const t = eventType(e.listEvent.eventType)
    if (t === OsEventTypeList.DOUBLE_CLICK_EVENT) return { type: 'double' }
    if (t !== OsEventTypeList.CLICK_EVENT) return null
    let index = e.listEvent.currentSelectItemIndex
    if (index === undefined && e.listEvent.currentSelectItemName) {
      const byName = listItems.indexOf(e.listEvent.currentSelectItemName)
      index = byName >= 0 ? byName : 0
    }
    return { type: 'click', index: index ?? 0 }
  }
  const ev = e.textEvent ?? e.sysEvent
  if (!ev) return null
  switch (eventType(ev.eventType)) {
    case OsEventTypeList.CLICK_EVENT:
      return { type: 'click' }
    case OsEventTypeList.DOUBLE_CLICK_EVENT:
      return { type: 'double' }
    case OsEventTypeList.SCROLL_TOP_EVENT:
      return { type: 'up' }
    case OsEventTypeList.SCROLL_BOTTOM_EVENT:
      return { type: 'down' }
    case OsEventTypeList.FOREGROUND_ENTER_EVENT:
      return { type: 'foreground' }
    case OsEventTypeList.FOREGROUND_EXIT_EVENT:
      return { type: 'background' }
    case OsEventTypeList.ABNORMAL_EXIT_EVENT:
    case OsEventTypeList.SYSTEM_EXIT_EVENT:
      return { type: 'exit' }
    default:
      return null
  }
}

function toContainers(page: PageSpec) {
  const textObject: TextContainerProperty[] = []
  const listObject: ListContainerProperty[] = []
  for (const box of page.boxes) {
    const common = {
      xPosition: box.x,
      yPosition: box.y,
      width: box.w,
      height: box.h,
      borderWidth: box.border ?? 0,
      borderColor: 15,
      borderRadius: box.border ? 6 : 0,
      paddingLength: box.padding ?? 0,
      containerID: box.id,
      containerName: box.name,
      isEventCapture: box.capture ? 1 : 0,
    }
    if (box.kind === 'text') {
      // 空文字は受け付けられないので最低1文字入れる
      textObject.push(new TextContainerProperty({ ...common, content: box.content || ' ' }))
    } else {
      listObject.push(
        new ListContainerProperty({
          ...common,
          itemContainer: new ListItemContainerProperty({
            itemCount: box.items.length,
            itemWidth: 0,
            isItemSelectBorderEn: 1,
            itemName: box.items,
          }),
        }),
      )
    }
  }
  return {
    containerTotalNum: page.boxes.length,
    ...(textObject.length ? { textObject } : {}),
    ...(listObject.length ? { listObject } : {}),
  }
}

/** 実機（Even App の WebView）用のディスプレイ */
export class EvenDisplay implements Display {
  private bridge: EvenAppBridge
  private current: PageSpec | null = null
  private created = false
  private wanted: PageSpec | null = null
  private running: Promise<void> | null = null

  constructor(bridge: EvenAppBridge) {
    this.bridge = bridge
  }

  /**
   * 描画要求は直列化し、処理中に来た要求は最新の1つだけ残す。
   * （ブリッジ呼び出しを並列に投げると接続が不安定になるため）
   */
  render(page: PageSpec): Promise<void> {
    this.wanted = page
    if (!this.running) {
      this.running = this.drain().finally(() => {
        this.running = null
      })
    }
    return this.running
  }

  private async drain(): Promise<void> {
    while (this.wanted) {
      const page = this.wanted
      this.wanted = null
      await this.apply(page)
    }
  }

  private async apply(page: PageSpec): Promise<void> {
    if (!this.created) {
      const res = await withTimeout(
        this.bridge.createStartUpPageContainer(new CreateStartUpPageContainer(toContainers(page))),
        'createStartUpPageContainer',
      )
      if (res !== StartUpPageCreateResult.success) console.warn('[glasses] create failed', res)
      this.created = true
      this.current = page
      return
    }

    if (sameLayout(this.current, page)) {
      // テキストだけ変わった → ちらつきのない差し替え
      const prev = this.current!
      for (let i = 0; i < page.boxes.length; i++) {
        const box = page.boxes[i]
        const old = prev.boxes[i]
        if (box.kind !== 'text' || old.kind !== 'text' || box.content === old.content) continue
        await withTimeout(
          this.bridge.textContainerUpgrade(
            new TextContainerUpgrade({
              containerID: box.id,
              containerName: box.name,
              contentOffset: 0,
              contentLength: 0,
              content: box.content || ' ',
            }),
          ),
          'textContainerUpgrade',
        )
      }
    } else {
      const ok = await withTimeout(
        this.bridge.rebuildPageContainer(new RebuildPageContainer(toContainers(page))),
        'rebuildPageContainer',
      )
      if (!ok) console.warn('[glasses] rebuild failed')
    }
    this.current = page
  }

  onInput(handler: (e: InputEvent) => void): void {
    this.bridge.onEvenHubEvent((event) => {
      const listBox = this.current?.boxes.find((b) => b.kind === 'list')
      const input = normalizeEvent(event, listBox?.kind === 'list' ? listBox.items : [])
      if (input) handler(input)
    })
  }

  async requestExit(): Promise<void> {
    // 1 = システムの終了確認ダイアログ。キャンセルされることもあるので、
    // 後片付けは SYSTEM_EXIT_EVENT を受け取ってから行う
    await withTimeout(this.bridge.shutDownPageContainer(1), 'shutDownPageContainer')
  }
}
