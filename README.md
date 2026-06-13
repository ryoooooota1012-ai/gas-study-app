# ガス主任技術者 学習アプリ

ガス主任技術者試験（甲種）の過去問演習Webアプリ。ビルド不要の Vanilla JS シングルページアプリで、GitHub Pages で公開しています。

🔗 公開URL: https://ryoooooota1012-ai.github.io/gas-study-app/

> **AIエージェントで作業する場合は、まず [`CLAUDE.md`](CLAUDE.md) を読んでください。**
> アーキテクチャ・データモデル・デプロイ手順・ハマりどころを網羅しています。

---

## 主な機能

- **学習モード**: 各選択肢に ○✗ を付けて答え合わせ。選択肢ごとの直近3回の正誤を記録。
- **壁打ちモード**: 1選択肢ずつ即時判定。カテゴリ・年度・分野・出題数（5〜50問）を選んで出題。
- **模試モード**: 時間計測あり・解説なしの本番形式。
- **苦手集中 / 計算問題練習 / キーワード検索出題**。
- **問題編集**: 本文・選択肢・解説のリッチテキスト編集（`[r]..[/r]` で赤字、Ctrl+Vで画像貼付、画像は角ドラッグでリサイズ）。
- **進捗の可視化**: 年度別・分野別フィルターに達成度（3連続/2連続/1回正解）の積み上げバーを表示。
- **マーカー**: 選択肢・解説をマーキング。答え合わせ時に自動表示、次の問題で非表示。
- **ブックマーク / ノート / 学習カレンダー / 弱点分析**。
- **Google Drive バックアップ**（任意）。

## 技術構成

- Vanilla JS（ビルドステップなし） / HTML / CSS
- 永続化: localStorage（テキスト系）+ IndexedDB（画像）
- 既定問題データ: `data/questions.js`（`window.DEFAULT_QUESTIONS`）に埋め込み済みでサーバー不要

```
study-app/
├── index.html          # エントリ。CSS/JSは ?v= でキャッシュバスティング
├── js/app.js           # アプリ全体のロジック（約9,300行）
├── css/style.css       # スタイル
├── data/questions.js   # 既定の問題データ
└── CLAUDE.md           # AI/開発者向け詳細ドキュメント
```

## ローカルでの動かし方

ビルド不要。いずれかで起動:

- `index.html` をブラウザで直接開く（最も簡単。既定問題で動作）
- 静的サーバーを立てる:
  ```bash
  npx serve -p 3737 .
  ```
- Claude Code のプレビュー（`.claude/launch.json` の `study-app` 設定）

## デプロイ

このフォルダは独立したGitリポジトリ（`gas-study-app.git`）です。

1. コードを編集
2. `index.html` の `css/style.css?v=` / `js/app.js?v=` を更新（キャッシュ対策・必須）
3. `git add -A && git commit && git push origin master`
4. 数分でGitHub Pagesに反映

詳細は [`CLAUDE.md`](CLAUDE.md) のデプロイ手順を参照。
