# EvEnglish

Even Realities G2 のグラスで使う、日本人向けの英語学習アプリです。Even Hub アプリとして動きます。
電車の待ち時間のようなスキマ時間に、単語・フレーズ・文法を少しずつ進められます。

| 教材 | 数 | 内容 |
|---|---|---|
| 単語 | 392 語 | 基礎 / 日常 / ビジネス / 上級 の4レベル。カタカナ読み・品詞・意味・例文・和訳つき |
| フレーズ | 207 個 | 日常 / 旅行 / 仕事 / 雑談・気持ち の4場面。カタカナ読み・使い方のポイントつき |
| 文法 | 24 トピック | 冠詞、現在完了、前置詞、仮定法など、日本人がつまずきやすい項目。各トピックに確認クイズ3問 |

## 機能

- **単語カード・フレーズカード**：表を見て思い出し、タップで答えを確認。裏には意味と一緒にカタカナ読みが出ます。「覚えた / まだ」で自己評価します。
- **間隔反復（SRS）**：「覚えた」カードは 1→2→4→7→15 日後に、「まだ」のカードはその日のうちにもう一度出ます。期日が来た復習カードを優先し、残りの枠に新しいカードが入ります。
- **文法ミニ講座**：1画面ずつ読める短い解説と、読み終わったあとの確認クイズ。
- **4択クイズ**：単語・フレーズ・文法を混ぜて出題します。学習したことのあるカードが優先されます。
- **学習記録**：今日の学習数、連続学習日数、定着した数、クイズの正答率。
- **スマホ側の画面**：学習状況の確認、設定（枚数、出題方向、レベル、場面）、教材の一覧と検索。

## グラスでの操作

| 操作 | 動き |
|---|---|
| タップ | 決定 / 答えを見る / 覚えた |
| ↓ スワイプ | 次へ / まだ覚えていない |
| ↑ スワイプ | 前へ / カードを表に戻す |
| 2回タップ | 1つ前の画面へ（メニュー画面では終了確認） |

テンプル（つる）のタッチパッドと、R1 リングのどちらでも操作できます。

```
メニュー ─┬─ 単語カード ── 表 →(タップ)→ 裏 →(タップ:覚えた / ↓:まだ)→ 次のカード … → 結果
          ├─ フレーズ   ── 同上
          ├─ 文法ミニ講座 ── トピック一覧 → 解説ページ → 確認クイズ
          ├─ 4択クイズ  ── 問題 → 解説 → … → 結果
          ├─ 学習記録
          └─ 使い方
```

---

## いちばん手軽な試し方（パソコンでサーバーを動かさない）

GitHub Actions がビルド済みのパッケージ（`evenglish.ehpk`）を自動で作ります。
それを Even Hub の開発者サイトに「Private build（自分専用のビルド）」としてアップロードすれば、Node.js もパソコンのサーバーも無しでグラスで動かせます。審査はありません。

1. **パッケージをダウンロードする**
   [Releases](https://github.com/danishi/evenglish/releases) の「最新ビルド (main)」（タグ `latest`）から `evenglish.ehpk` をダウンロードします。
   `v0.1.0` のようなバージョン付きのリリースがあれば、そちらでもかまいません。
2. **Even Hub にアップロードする**
   https://hub.evenrealities.com/login に Even App と同じアカウントでログインし、プロジェクトの **Private builds** タブで `evenglish.ehpk` をアップロードします。
3. **スマホに入れる**
   Even App の開発者モードを有効にして、**Even Hub** タブ → **Me → Apps → Private builds** の `EvEnglish` で **Install** をタップします。
   しばらくするとグラスのホーム画面に EvEnglish が出ます。

- Private build は自分のアカウントでしか使えません。ほかの人にも使ってもらうときは Even Hub の Beta Testing か、審査を通して公開します（[App Submission](https://hub.evenrealities.com/docs/ship/app-submission)）。
- 同じバージョンのアップロードを受け付けてもらえないときは、`app.json` と `package.json` の `version` を上げてから main にプッシュしてください。
- 詳しくは公式の [Private Testing](https://hub.evenrealities.com/docs/test/private-testing) を参照してください。

### パッケージが作られるタイミング

`.github/workflows/build.yml` で次のように動きます。どの場合も先に型チェックとテストを通します。

| きっかけ | できるもの |
|---|---|
| main へのプッシュ | リリース「最新ビルド (main)」（タグ `latest`）の `evenglish.ehpk` を差し替え |
| `v0.1.0` のようなタグのプッシュ | そのバージョンのリリースを作成（タグと `app.json` の `version` が違うと失敗します） |
| プルリクエスト | Actions の実行結果ページの Artifacts に `evenglish-ehpk`（zip。中に `.ehpk`） |
| Actions タブから手動実行（Run workflow） | main へのプッシュと同じ |

バージョン付きのリリースを作る例です。

```bash
# app.json と package.json の version を 0.2.0 にしてコミットしたあと
git tag v0.2.0
git push origin v0.2.0
```

---

## 導入手順（はじめて G2 アプリを動かす人向け）

ここからは、パソコンで開発サーバーを動かして開発・確認する手順です。試すだけなら上の「いちばん手軽な試し方」で足ります。

G2 のアプリ（Even Hub アプリ）は、中身は普通の Web ページです。
パソコンで開発サーバーを動かし、スマホの Even App がそのページを読み込んで、グラスに画面を送ります。

```
パソコン (npm run dev) ──Wi-Fi──> スマホの Even App ──Bluetooth──> G2 グラス
```

そのため、まずパソコンのブラウザで動かし、次にシミュレーター、最後に実機、の順で試すのが簡単です。

### 0. 用意するもの

- パソコン（macOS / Windows / Linux）
- [Node.js](https://nodejs.org/ja) 20 以上（22 LTS 推奨）
- Git
- 実機で試す場合：
  - Even G2 グラス
  - Even App 2.2.10 以上を入れたスマホ（グラスとペアリング済み）
  - パソコンとスマホが**同じ Wi-Fi** につながっていること

### 1. Node.js を入れる

[Node.js の公式サイト](https://nodejs.org/ja)から LTS 版をインストールします。
ターミナル（Windows は PowerShell）で次のように表示されれば準備できています。

```bash
node -v   # v20 以上
npm -v
```

### 2. コードを取得して依存パッケージを入れる

```bash
git clone https://github.com/danishi/evenglish.git
cd evenglish
npm install
```

`npm install` で次のものが入ります。

| パッケージ | 役割 |
|---|---|
| `@evenrealities/even_hub_sdk` | グラスに画面を出したり、タップを受け取ったりする SDK |
| `@evenrealities/pretext` | グラスのフォントで文字の幅を測るライブラリ（1画面に収まるように使う） |
| `@evenrealities/evenhub-simulator` | パソコン上で G2 の画面を再現するシミュレーター |
| `@evenrealities/evenhub-cli` | 実機接続用の QR コード作成やパッケージ化をする CLI（`evenhub` コマンド） |

### 3. ブラウザで動かす（いちばん手軽）

```bash
npm run dev
```

ブラウザで http://localhost:5173 を開きます。
Even App の外で開いたときは「ブラウザプレビュー」モードになり、グラスの画面を真似したプレビューが表示されます。
ボタンか、キーボード（↑ ↓ / Enter = タップ / Esc = 2回タップ）で操作できます。

> プレビューはブラウザのフォントで描いているので、改行の位置などは実機と少し違います。見た目の確認はシミュレーターか実機で行ってください。

### 4. シミュレーターで動かす

公式シミュレーターは、実機と同じフォントとレイアウトでグラスの画面を表示します。
ターミナルを2つ開いて、それぞれで実行します。

```bash
# ターミナル1
npm run dev

# ターミナル2
npm run sim
```

ウィンドウが開いたら、矢印キー（↑ ↓）とクリックで操作できます。

> Linux では WebKitGTK が必要です。起動しない場合は `sudo apt install libwebkit2gtk-4.1-0` を試してください。

### 5. 実機（G2）で動かす

1. **Even App の開発者モードを有効にする**
   Even App に「Scan QR」ボタンが出るようにします。手順は公式ドキュメントを参照してください：
   https://hub.evenrealities.com/docs/get-started/overview
2. **パソコンとスマホを同じ Wi-Fi につなぐ**
3. **開発サーバーを起動する**
   ```bash
   npm run dev
   ```
   同じネットワークのスマホからアクセスできるよう、`vite.config.ts` で `host: true` にしてあります。
   起動時に表示される `Network: http://192.168.x.x:5173/` の URL を控えておきます。
4. **QR コードを表示する**（別のターミナルで）
   ```bash
   npm run qr
   # IP の自動検出がうまくいかないときは直接指定する
   npx evenhub qr --url http://192.168.x.x:5173
   ```
5. **スマホの Even App で「Scan QR」をタップして、QR コードを読み取る**
   グラスにメニューが表示されれば成功です。コードを保存すると自動で再読み込みされます。

うまくいかないときは、下の「トラブルシューティング」を見てください。

### 6. パッケージにして配布する

```bash
npm run pack
```

`dist/` にビルドし、`evenglish.ehpk` を作ります。
`.ehpk` はそのままでは実行できません。Even Hub の開発者向けサイトにアップロードすると、Even App から開けるようになります（手順は「いちばん手軽な試し方」を参照）。
GitHub Actions でも同じものが自動で作られるので、手元で作る必要はありません。
公開の手順は公式ドキュメントの Packaging / App Submission のページを参照してください。

`app.json` の `package_id`（`com.danishi.evenglish`）は Even Hub 全体で一意である必要があります。自分で公開する場合は変更してください。

---

## トラブルシューティング

| 症状 | 確認すること |
|---|---|
| 「Scan QR」ボタンが無い | Even App の開発者モードが有効か。Even App のバージョンが 2.2.10 以上か |
| QR を読んでも表示されない | パソコンとスマホが同じ Wi-Fi か。スマホのブラウザで `http://<IP>:5173` が開けるか。パソコンのファイアウォールが 5173 番ポートを止めていないか |
| 会社や学校の Wi-Fi でつながらない | 端末同士の通信が禁止されているネットワークがあります。テザリングや自宅の Wi-Fi で試してください |
| グラスに何も出ない | グラスが Even App とつながっているか。スマホの画面に「G2 接続中」と出ているか（「ブラウザプレビュー」と出ている場合は Even App の外で開いています） |
| 一部の文字が表示されない | グラスのフォントに無い文字は表示されずに消えます。`npm test` で教材に使えない文字が無いか確認できます |
| 学習記録を消したい | スマホ側の画面の一番下「学習記録をリセット」 |

---

## 開発者向けメモ

### コマンド

| コマンド | 内容 |
|---|---|
| `npm run dev` | 開発サーバー（http://localhost:5173） |
| `npm run sim` | シミュレーターを起動（開発サーバーと一緒に使う） |
| `npm run qr` | 実機接続用の QR コードを表示 |
| `npm test` | テスト（教材のチェック、学習ロジック、画面遷移） |
| `npm run typecheck` | 型チェック |
| `npm run build` | 本番ビルド（`dist/`） |
| `npm run pack` | ビルドして `.ehpk` を作成（GitHub Actions でも自動で作られます） |
| `npm run icon` | アプリアイコン `assets/icon.png` を作り直す |

### ディレクトリ構成

```
src/
  main.ts                 起動処理。Even App 内なら実機、ブラウザならプレビューで動かす
  data/                   教材データ（単語・フレーズ・文法）
  core/
    srs.ts                間隔反復（ライトナー方式）
    progress.ts           学習記録の保存・読み込み
    quiz.ts               4択クイズの生成
    text.ts               グラスのフォントでの文字幅計測・ページ分割
  glasses/
    app.ts                グラス側の画面遷移と表示内容
    display.ts            画面の抽象（PageSpec）と入力イベントの型
    even-display.ts       実機用：PageSpec を SDK の呼び出しに変換
    preview-display.ts    ブラウザ用：グラス画面の簡易プレビュー
    layout.ts             画面サイズまわりの定数
  phone/ui.ts             スマホ側の画面（設定・学習状況・教材一覧）
tests/                    Vitest のテスト
app.json                  Even Hub のマニフェスト
assets/icon.png           Even Hub に登録するアプリアイコン（24x24 白黒）
scripts/make-icon.mjs     アイコンの生成スクリプト（ドット絵はこの中に文字で書いてある）
.github/workflows/build.yml  .ehpk を作ってリリースに置く GitHub Actions
```

### 教材を追加する

`src/data/words.ts`、`phrases.ts`、`grammar.ts` の配列の**末尾に**行を足してください。
単語とフレーズは、`src/data/kana.ts` にカタカナ読みも足します（キーは英語そのまま）。
学習記録はカードの ID（`wb001` など）で保存していて、ID は配列の並び順から作っています。途中に挿入したり並べ替えたりすると、記録が別のカードに付いてしまいます。

追加したら `npm test` を実行します。次のことをチェックします。

- グラスのフォントに無い文字を使っていないか（✓ や絵文字、カーリークォートは表示されません）
- 例文が長すぎないか（2行まで）
- 文法の各ページが1画面（本文7行）に収まるか
- カタカナ読みが抜けていないか（カタカナとスペースだけで1行に収まるか）
- ID や英語の重複が無いか

### G2 / SDK の仕様で気をつけたこと

- **画面**：576×288 px、緑の単色。フォントは1種類で、大きさや太さは変えられません。1行は日本語で約27文字、1画面は約10行です。
- **文字幅**：`@evenrealities/pretext` で実機と同じ計算をして、ページ分割や左右寄せをしています。
- **イベント**：テキストコンテナのタップは `sysEvent`、スワイプは `textEvent` で届きます。リストのタップは `listEvent` で届き、スワイプは本体側でカーソルが動くだけでイベントは来ません。
- **ゼロ値の省略**：protobuf の仕様で `eventType` の 0（タップ）やリストの先頭のインデックス 0 は `undefined` で届くので、`?? 0` で補っています（`even-display.ts` の `normalizeEvent`）。
- **描画**：最初だけ `createStartUpPageContainer`、以降はレイアウトが同じなら `textContainerUpgrade`（ちらつかない）、違えば `rebuildPageContainer` を使います。呼び出しは直列にして、処理中に来た描画要求は最新の1つだけ残します。
- **保存**：`bridge.setLocalStorage` を使います。Bluetooth の通信と帯域を分け合うので、1.5 秒まとめてから書き込み、バックグラウンドに回ったときと終了時にもすぐ書き込みます。
- **終了**：メニューで2回タップすると `shutDownPageContainer(1)`（システムの終了確認）を呼びます。

## 参考資料

- [Even Hub ドキュメント](https://hub.evenrealities.com/docs/get-started/overview)
- [Your First App（公式クイックスタート）](https://hub.evenrealities.com/docs/get-started/quickstart/first-app)
- [@evenrealities/even_hub_sdk（npm）](https://www.npmjs.com/package/@evenrealities/even_hub_sdk)
- [even-realities/everything-evenhub](https://github.com/even-realities/everything-evenhub)：公式の開発ガイド集（入力イベント、UI、シミュレーター自動操作など）
- [nickustinov/even-g2-notes](https://github.com/nickustinov/even-g2-notes)：表示・フォント・イベントの仕様メモと実装例
- [pangoleen/awesome-even-realities-g2](https://github.com/pangoleen/awesome-even-realities-g2)：G2 開発のリソース集
