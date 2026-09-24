import type { ProgressStore, Settings } from '../core/progress'
import { isMastered } from '../core/srs'
import { LEVEL_LABELS, SCENE_LABELS, type PhraseScene, type WordLevel } from '../data/types'
import type { Content } from '../glasses/app'

/**
 * スマホ側（Even App の WebView）の画面。
 * 学習状況の確認・設定・単語帳の閲覧を行う。グラス側の学習データと共有している。
 */

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
/** カタカナ読みの【】（アクセント）を太字にする */
const kanaHtml = (kana: string) => esc(kana).replace(/【(.+?)】/g, '<b>$1</b>')

type Tab = 'words' | 'phrases' | 'grammar'

export function mountPhoneUI(
  root: HTMLElement,
  store: ProgressStore,
  content: Content,
  options: { mode: 'glasses' | 'preview'; onSettingsChanged: () => void },
): void {
  let tab: Tab = 'words'
  let query = ''

  root.innerHTML = `
    <header class="top">
      <h1>Glance English <span class="version">v${esc(__APP_VERSION__)}</span></h1>
      <span class="badge ${options.mode}">${options.mode === 'glasses' ? 'G2 接続中' : 'ブラウザプレビュー'}</span>
    </header>
    <section class="card today" data-slot="today"></section>
    ${options.mode === 'preview' ? '<section class="card"><h2>グラス画面プレビュー</h2><div id="preview-root"></div></section>' : ''}
    <section class="card">
      <h2>グラスでの操作</h2>
      <ul class="gestures">
        <li><b>タップ</b>決定 / 答えを見る / 覚えた</li>
        <li><b>↓ スワイプ</b>次へ / まだ覚えていない</li>
        <li><b>↑ スワイプ</b>前へ / カードを表に戻す</li>
        <li><b>2回タップ</b>前の画面へ（メニューでは終了）</li>
      </ul>
    </section>
    <section class="card" data-slot="stats"></section>
    <section class="card">
      <h2>設定</h2>
      <form class="settings" data-slot="settings"></form>
    </section>
    <section class="card">
      <h2>教材を見る</h2>
      <div class="tabs" role="tablist">
        <button data-tab="words" role="tab">単語</button>
        <button data-tab="phrases" role="tab">フレーズ</button>
        <button data-tab="grammar" role="tab">文法</button>
      </div>
      <input class="search" type="search" placeholder="検索（英語・日本語）" />
      <div class="library" data-slot="library"></div>
    </section>
    <section class="card danger">
      <button class="reset">学習記録をリセット</button>
    </section>`

  const slot = (name: string) => root.querySelector<HTMLElement>(`[data-slot="${name}"]`)!

  function renderToday() {
    const d = store.data
    const today = store.todayCount()
    const pct = Math.min(100, Math.round((today / d.settings.dailyGoal) * 100))
    slot('today').innerHTML = `
      <div class="today-row">
        <div><div class="big">${today}<small> / ${d.settings.dailyGoal}</small></div><div class="dim">今日の学習</div></div>
        <div><div class="big">${d.streak}<small> 日</small></div><div class="dim">連続学習</div></div>
      </div>
      <div class="bar"><span style="width:${pct}%"></span></div>`
  }

  function renderStats() {
    const cards = store.data.cards
    const row = (label: string, ids: string[]) => {
      const seen = ids.filter((id) => (cards[id]?.seen ?? 0) > 0).length
      const mastered = ids.filter((id) => isMastered(cards[id])).length
      return `<tr><th>${esc(label)}</th><td>${seen}</td><td>${mastered}</td><td>${ids.length}</td></tr>`
    }
    const levels = Object.keys(LEVEL_LABELS) as WordLevel[]
    const scenes = Object.keys(SCENE_LABELS) as PhraseScene[]
    const g = content.grammar.filter((t) => store.data.grammarDone[t.id]).length
    const q = store.data.quiz
    slot('stats').innerHTML = `
      <h2>学習状況</h2>
      <table class="stats">
        <thead><tr><th></th><th>学習</th><th>定着</th><th>全体</th></tr></thead>
        <tbody>
          ${levels.map((l) => row(`単語・${LEVEL_LABELS[l]}`, content.words.filter((w) => w.level === l).map((w) => w.id))).join('')}
          ${scenes.map((s) => row(`フレーズ・${SCENE_LABELS[s]}`, content.phrases.filter((p) => p.scene === s).map((p) => p.id))).join('')}
        </tbody>
      </table>
      <p class="dim">文法 ${g}/${content.grammar.length} トピック ・ クイズ正答率 ${q.answered ? Math.round((q.correct / q.answered) * 100) : 0}%（${q.answered}問）</p>`
  }

  function renderSettings() {
    const s = store.data.settings
    const select = (name: keyof Settings, values: number[], unit: string) =>
      `<select name="${name}">${values
        .map((v) => `<option value="${v}" ${s[name] === v ? 'selected' : ''}>${v}${unit}</option>`)
        .join('')}</select>`
    const checks = <K extends string>(name: string, labels: Record<K, string>, selected: K[]) =>
      (Object.keys(labels) as K[])
        .map(
          (k) =>
            `<label class="chip"><input type="checkbox" name="${name}" value="${k}" ${selected.includes(k) ? 'checked' : ''}/>${esc(labels[k])}</label>`,
        )
        .join('')
    slot('settings').innerHTML = `
      <label class="row">1回のカード枚数 ${select('sessionSize', [5, 10, 15, 20], '枚')}</label>
      <label class="row">クイズの問題数 ${select('quizSize', [5, 10, 15, 20], '問')}</label>
      <label class="row">1日の目標 ${select('dailyGoal', [10, 20, 30, 50, 100], '回')}</label>
      <label class="row">出題方向
        <select name="direction">
          <option value="en-ja" ${s.direction === 'en-ja' ? 'selected' : ''}>英語 → 日本語</option>
          <option value="ja-en" ${s.direction === 'ja-en' ? 'selected' : ''}>日本語 → 英語</option>
        </select>
      </label>
      <div class="row col"><span>単語のレベル</span><div class="chips">${checks('levels', LEVEL_LABELS, s.levels)}</div></div>
      <div class="row col"><span>フレーズの場面</span><div class="chips">${checks('scenes', SCENE_LABELS, s.scenes)}</div></div>`
  }

  function renderLibrary() {
    const cards = store.data.cards
    const q = query.trim().toLowerCase()
    const hit = (...xs: string[]) => !q || xs.some((x) => x.toLowerCase().includes(q))
    const mark = (id: string) => {
      const c = cards[id]
      if (isMastered(c)) return '<span class="mark m">定着</span>'
      if (c && c.seen > 0) return '<span class="mark l">学習中</span>'
      return '<span class="mark n">未学習</span>'
    }
    root.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === tab)))
    let html = ''
    if (tab === 'words') {
      html = content.words
        .filter((w) => hit(w.en, w.ja))
        .map(
          (w) => `<details class="item"><summary>${mark(w.id)}<b>${esc(w.en)}</b><span class="dim">（${esc(w.pos)}）${esc(w.ja)}</span></summary>
            <p>${kanaHtml(w.kana)}</p><p>${esc(w.ex)}<br><span class="dim">${esc(w.exJa)}</span></p><p class="dim">${LEVEL_LABELS[w.level]}</p></details>`,
        )
        .join('')
    } else if (tab === 'phrases') {
      html = content.phrases
        .filter((p) => hit(p.en, p.ja, p.note ?? ''))
        .map(
          (p) => `<details class="item"><summary>${mark(p.id)}<b>${esc(p.en)}</b></summary>
            <p>${kanaHtml(p.kana)}</p><p>${esc(p.ja)}</p>${p.note ? `<p class="dim">${esc(p.note)}</p>` : ''}<p class="dim">${SCENE_LABELS[p.scene]}</p></details>`,
        )
        .join('')
    } else {
      html = content.grammar
        .filter((g) => hit(g.title, ...g.pages))
        .map(
          (g) => `<details class="item"><summary>${store.data.grammarDone[g.id] ? '<span class="mark m">完了</span>' : '<span class="mark n">未読</span>'}<b>${esc(g.title)}</b></summary>
            ${g.pages.map((p) => `<pre>${esc(p)}</pre>`).join('')}</details>`,
        )
        .join('')
    }
    slot('library').innerHTML = html || '<p class="dim">見つかりませんでした</p>'
  }

  function renderAll() {
    renderToday()
    renderStats()
  }

  slot('settings').addEventListener('change', (e) => {
    const form = e.currentTarget as HTMLFormElement
    const fd = new FormData(form)
    const levels = fd.getAll('levels') as WordLevel[]
    const scenes = fd.getAll('scenes') as PhraseScene[]
    store.updateSettings({
      sessionSize: Number(fd.get('sessionSize')),
      quizSize: Number(fd.get('quizSize')),
      dailyGoal: Number(fd.get('dailyGoal')),
      direction: fd.get('direction') as Settings['direction'],
      // 全部外すと出題できないので、空なら全選択として扱う
      levels: levels.length ? levels : (Object.keys(LEVEL_LABELS) as WordLevel[]),
      scenes: scenes.length ? scenes : (Object.keys(SCENE_LABELS) as PhraseScene[]),
    })
    if (!levels.length || !scenes.length) renderSettings()
    options.onSettingsChanged()
  })

  root.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach((b) =>
    b.addEventListener('click', () => {
      tab = b.dataset.tab as Tab
      renderLibrary()
    }),
  )
  root.querySelector<HTMLInputElement>('.search')!.addEventListener('input', (e) => {
    query = (e.target as HTMLInputElement).value
    renderLibrary()
  })
  root.querySelector('.reset')!.addEventListener('click', () => {
    if (!window.confirm('学習記録をすべてリセットします。よろしいですか？（設定は残ります）')) return
    store.reset()
    renderLibrary()
    options.onSettingsChanged()
  })

  // 学習記録は頻繁に変わるので、軽い部分だけ再描画する
  let pending = false
  store.subscribe(() => {
    if (pending) return
    pending = true
    requestAnimationFrame(() => {
      pending = false
      renderAll()
    })
  })

  renderAll()
  renderSettings()
  renderLibrary()
}
