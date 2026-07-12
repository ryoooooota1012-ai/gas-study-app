# CLAUDE.md — ガス主任技術者 学習アプリ

このファイルは Claude Code（および他のAIエージェント）が **記憶ゼロの状態から** このアプリを安全に編集・デプロイできるようにするための引き継ぎ資料です。作業を始める前に必ず最初に読んでください。

## 🔄 このファイルの更新ルール

**実装・修正を完了するたびに、確認なしでこのファイルを更新すること。**

更新すべきタイミング：
- 新機能を実装したとき → 主要関数マップ・規約に追記
- データ構造を変えたとき → データモデルに追記
- 落とし穴・ハマりどころを発見したとき → 規約・注意点に追記
- 既存の記述が実態と乖離していたとき → 修正

---

## ⚠️ 最重要：二重リポジトリ構成

このフォルダ（`study-app/`）は **外側の学習資料リポジトリの中にネストした、独立したGitリポジトリ** です。

| 場所 | リポジトリ | 用途 |
|------|-----------|------|
| `ガス主任技術者/`（親）| `gas-master-notes.git` | 過去問・教材（PDF/テキスト等） |
| `ガス主任技術者/study-app/`（ここ）| `gas-study-app.git` | **実際のWebアプリ。GitHub Pagesで公開** |

**アプリのコード変更は必ず `study-app/` 内で `git` 操作し、`gas-study-app.git` の `master` ブランチへ push してください。** 親リポジトリにコミットしても公開アプリには反映されません。

公開URL: https://ryoooooota1012-ai.github.io/gas-study-app/

---

## デプロイ手順（毎回必須）

1. `study-app/js/app.js`・`study-app/css/style.css`・`study-app/index.html` を編集
2. **キャッシュバスティングのバージョンを上げる**（これを忘れるとユーザーに旧コードが配信される）
   `index.html` 内の以下2か所を更新（書式は `YYYYMMDD` + 連番アルファベット、例 `20260612g`）:
   ```html
   <link rel="stylesheet" href="css/style.css?v=YYYYMMDDx">
   <script src="js/app.js?v=YYYYMMDDx"></script>
   ```
   CSSを変えたら style.css の v を、JSを変えたら app.js の v を上げる。
3. コミット & プッシュ:
   ```bash
   cd study-app
   git add -A
   git commit -m "..."
   git push origin master
   ```
4. 数分でGitHub Pagesに反映。ユーザーには Ctrl+F5（ハードリロード）を案内。

---

## 動作確認（プレビュー）

ビルド不要の静的サイト。`.claude/launch.json` にプレビュー設定あり。
Claude Code の `preview_start`（name: `study-app`）で起動できる。`index.html` をそのままブラウザで開いても動く（`data/questions.js` に既定問題が埋め込まれているためサーバー不要）。

検証時の注意:
- `state` とトップレベル関数（`startSession`・`checkAnswers`・`renderDrillChoice` 等）は **すべてグローバル**。`preview_eval` から直接呼べる。
- 問題データは初回起動時 `window.DEFAULT_QUESTIONS`（`data/questions.js`）から localStorage `gas_questions_v1` へ取り込まれる。

---

## アーキテクチャ概要

- **Vanilla JS の単一ページアプリ。ビルドステップなし。** ロジックはほぼ全て `js/app.js`（約9,300行）。
- 永続化は **localStorage + IndexedDB**。画像だけ IDB、それ以外は localStorage。
- 画面は `showScreen()` で切り替え（`screen-home` / `screen-study` / `screen-drill` / `screen-stats` 等）。
- Google Drive（`appDataFolder`）への任意バックアップ機能あり（`GDRIVE_*`）。

### 出題の2系統（重要な落とし穴）

選択肢を表示する画面が **2つあり、別々のコードパス** を使う:

| 画面 | 説明 | 主なレンダリング関数 |
|------|------|----------------------|
| 学習（`screen-study`）| 各選択肢に ○✗ を付けて「答え合わせ」 | `renderQuestion` → `createChoiceItem`（計算/1択は `createChoiceItemCalc`）、判定は `checkAnswers` |
| 壁打ち（`screen-drill`）| 1選択肢ずつ即時○✗判定 | `renderDrillChoice`（固定HTML要素 `drill-choice-*` を書き換え） |

**選択肢に関わる新機能（画像・マーカー等）は `createChoiceItem` と `renderDrillChoice` の両方に実装しないと、片方の画面で表示されません。** 過去に何度もここでバグが出ています。

---

## データモデル

```js
window.DEFAULT_QUESTIONS = {
  meta: { title, version, created },
  questions: [{
    id, category, subcategory, year, source,
    questionText,            // 後方互換の本文（先頭テキスト）
    questionBlocks,          // リッチ本文 [{type:'text',content} | {type:'image',src}]
    explanationImage,        // 問題全体の解説画像
    questionType,            // 'calculation' | 'single_select' | undefined(=各選択肢○✗)
    tags: [],
    choices: [{
      id, text, isCorrect, explanation,
      image,                 // data:URL（メモリ上）/ idb:参照（localStorage上）
      imageWidth             // 選択肢画像の表示幅(px)。角ドラッグでリサイズ・保存
    }]
  }]
}
```

### localStorage キー（すべて `gas_*_v1`）

| キー | 内容 |
|------|------|
| `gas_questions_v1` | ユーザー編集後の問題（画像は `idb:` 参照に置換して保存） |
| `gas_study_progress_v1` | `{ [choiceId]: {attempts, correct, history:[bool×最大3], lastDate}, [qId+':q']: {...} }` |
| `gas_highlights_v1` | マーカー `{ [qId]: [{id, choiceId, area:'choice'\|'explanation', start, end}] }` |
| `gas_notes_v1` / `gas_bookmarks_v1` / `gas_choice_bookmarks_v1` | ノート・ブックマーク |
| `gas_study_log_v1` / `gas_session_records_v1` | 学習ログ・セッション記録 |
| `gas_settings_v1` / `gas_interrupted_session_v1` / `gas_drill_presets_v1` / `gas_calc_problems_v1` | 設定・中断復帰・壁打ちプリセット・計算問題 |
| `gas_recent_wrong_v1` | 直近の各セッションで間違えた問題セット（最大5件、`[{ts,mode,label,total,correct,ids[]}]` 新しい順）。ホームの「最近間違えた問題」でセット選択→復習。選んだセットは削除 |
| `gas_last_filter_v1` | 直前セッションで使ったフィルター `{ cat, years:[], sections:[] }`。ホーム画面のオレンジドット表示に使用。PC/モバイル共有 |
| `gas_drive_remind_at` / `gas_backup_remind_at` | Drive 関連の通知制御（端末ローカル、同期対象外） |

### IndexedDB（画像）

- DB `gas_study_db` / ストア `images`。ヘルパー: `idbGet` / `idbSet` / `idbResolveImage`、参照プレフィックス `IDB_REF = 'idb:'`。
- 画像キー: `q_{id}_exp`（解説）, `q_{id}_b{i}`（本文ブロック）, `q_{id}_c{ci}`（選択肢）。
- `saveQuestions()` が data:URL を `idb:` 参照へ退避して localStorage に保存し、画像本体を IDB へ非同期書き込み。`loadStoredQuestions()` が読み込み時に `idb:` 参照を data:URL へ復元。
- `saveQuestions(true)` は **画像のIDB再書き込みをスキップ**（`imageWidth` など画像以外の軽微な変更用）。

---

## 主要関数マップ

| 機能 | 関数 |
|------|------|
| 通常学習の開始 | `startSession(mode, opts)`（`opts.excludeMastered` で3連続正解済み問題を除外）/ `_startSession(mode, filtered, opts)`（`opts.queue` で事前構築キュー、`opts.quickMode` でとりあえず50） |
| とりあえず50 | `startRandomFifty`（全問から計算/1択・記述・壁打ち除外を除き、壁打ち=1選択肢1答形式で完全ランダム50択。`startDrillWithQueue(queue,'quick50')` で起動） |
| 出題ジェネレータ | `openExamGenerator`（`#modal-exam-generator`）。分野選択+シャッフル単位(問題/選択肢)+習熟度割合(多め/普通/少なめ/除外)→模試形式で出題。`generateExamSet`(問題単位=問番号ごとに年度を重み付き抽選し1問)/`generateExamSetByChoice`(選択肢単位=各選択肢位置イロハ…を別年度の同番号問題から合成。合成問題id=`gen-<cat>-q<N>`、選択肢は実idを保持し進捗連動)。`questionBucket`/`choiceBucket`(未挑戦/直近不正解/1〜3連続正解)/`egWeightedPick`。構成は保存しない |
| マスター判定 | `isQuestionMastered`（全選択肢が直近3連続正解）/ `isFilterMastered`（問題群が全てマスター） |
| 模試モード | `startExamMode` |
| 壁打ち（カスタム設定） | `buildDrillQueueCustom` / `startDrillFromSetup` / `renderDrillChoice` |
| 答え合わせ（学習画面） | `checkAnswers` |
| 出題キュー構築 | `buildQueue` / `buildDrillQueue` |
| 永続化 | `saveQuestions(skipImageWrite)` / `loadStoredQuestions` / `saveProgress` |
| 問題編集モーダル | `openEditModal` / `saveEditModal` |
| リッチテキスト描画 | `renderText`（HTMLエスケープ + `[r]..[/r]`→赤字 + `\n`→`<br>`） |
| マーカー | `_applyHighlights` / `_applyDrillHighlights` / `_autoRevealMarkersOnCheck`（答え合わせ時に自動表示）/ `_clearMarkElements`（永続mark除去）/ `_clearTempMarks`（一時mark除去） |
| フィルター進捗バー | `computeFilterProgress`（**問題単位**で集計。問題の連続正解数=全採点単位の最小値。5択問題なら全5選択肢がN連続して初めてその問題がN連続とみなす）/ `filterProgressHTML` |
| 直前フィルター目印 | `lastUsedFilterYears` / `lastUsedFilterSections` / `lastUsedFilterCat`（グローバルSet）。`startSession()` 開始時にスナップショット保存。ホーム帰還時に `activeYears/Sections` をクリア。`renderTopFilterCard()` で `.last-used` クラスを付与し右上のオレンジドット（`::after`）で表示 |
| 選択肢画像リサイズ | `_addResizeHandle` / `_saveChoiceImageWidth` |
| タグ並び替え・行グループ | `sortTagsJa`（**数字→英字→50音**・先頭#無視）。`foldKanaChar(ch)`＝かなを清音ひらがなに畳む(ガ→か)・かな以外はnull。`tagGroupKey(tag)`＝頭文字グループ（数字→'0-9'／英字→'A-Z'／かな→畳んだ頭文字／漢字→読みキャッシュ`tagReadings`があればその頭文字・無ければ暫定でその文字）。`tagGyo(tag)`＝`_GYO_MAP`で「あ行/か行…/その他」に。`renderTagStudyArea`は`TAG_GYO_ORDER`順に**行見出し+チップの縦グループ**（`.tag-study-group`/`.tag-study-group-label`/`.tag-study-group-chips`）で描画。検索絞り込み中は表示チップ0の行を隠す |
| 漢字タグの読み（ふりがな） | `tagReadings`（`gas_tag_readings_v1`・{タグ本体:畳んだ頭文字ひらがな or 未解決なら元字}）。**⚠️自動ロード禁止**：`renderTagStudyArea`はホーム描画のたびに走るため、以前ここで`ensureTagReadings`を自動起動していたら起動時に辞書DL（数MB）が走りアプリが固まる不具合が出た。→**オプトイン方式**：未取得の漢字タグがある時は「🈶 漢字も五十音順に並べる」ボタンを表示し、押下時のみ`ensureTagReadings`→`_getKuromojiTokenizer`（kuromoji@0.1.2をCDN(jsdelivr)から遅延ロード・dicPathも同CDN）で解析→キャッシュ→再描画。`_withTimeout`でscript20秒/辞書30秒のタイムアウト（ハング防止）。`_tagReadingLoading`で多重防止・キャッシュ済みは即return（辞書再DLなし・以後は漢字も自動で正しい行に並ぶ）。失敗/timeoutは`console.warn`しその他に留めボタン再表示（再試行可）。バックアップ対象キーにも追加済み |
| 連続学習日数（ストリーク） | `computeStreak`（ヘッダー `#hd-streak` とカレンダーの両方で使用） |
| 直近の間違い復習 | `saveRecentWrong(meta)`（結果画面で最大5セット保存）/ `loadRecentWrong`（旧フラット配列形式も自動移行）/ `openRecentWrongModal`（`#modal-recent-wrong` でセット一覧表示）/ `startRecentWrongSet(ts)`（選択セットを削除して復習開始）/ `deleteRecentWrongSet` |
| 直近間違い出題形式 | `recentWrongFormat`（グローバル変数 `'normal'\|'drill'`）/ `_startRecentWrongQuestions(qs)`（形式に応じて通常 or 壁打ちで開始） |
| ブックマーク選択肢 | `bookmarkedChoiceItems()`（ブックマーク済み選択肢を `{question,choice,choiceIndex}` 配列で返す） |
| 保存済み問題の検索 | `matchesSearch(q, query)`＝**スペース/全角スペース区切りでOR検索**（`searchWords`で分割・各語先頭#除去、`questionMatchesWord(q,w)`が本文/section/subcategory/year/source/選択肢text/tagsを部分一致）。qlist管理画面のフィルターは `renderQuestionList`（独自 `qlistFilterCats/Bookmark/Tags`＋`matchesSearch`）。※`renderFilteredQuestionList`は別画面で`getFilteredQuestions`基準 |
| 検索ワードの一括タグ登録 | 管理画面の検索ボックス下 `#qlist-bulk-tag-area`。`renderBulkTagArea()`（`renderQuestionList`末尾で呼ぶ・検索語がある時のみ表示）→「🏷 検索ワードをタグとして一括登録」。1語=confirmのみ／複数語(OR)=`openBulkTagPanel`でワード選択チェックボックス（既定全ON・各語の該当数表示）。`applyBulkTag(words, displayed)`は**各問題に`questionMatchesWord`で実際にヒットした語のタグだけ付与**（無関係な語は付けない）・重複スキップ・`saveQuestions`＋`buildFilters`＋`renderTagStudyArea`＋再描画。`currentQlistDisplayed()`は管理画面の絞り込みと同一条件 |
| ブックマークのデータ構造 | **問題☆**=`state.bookmarks`（`gas_bookmarks_v1`・**質問id**のSet）／**選択肢☆**=`state.choiceBookmarks`（`gas_choice_bookmarks_v1`・**選択肢id**のSet）。完全に別ストア。`questionBookmarkKinds(q)`→`{isQ, choiceCount}`／`questionHasAnyBookmark(q)`／`appendBookmarkBadges(srcEl,q)`（管理一覧に「★問題」「☆選択肢N」ラベル）。**壁打ち画面の☆（`btn-drill-bookmark`）は選択肢単位**＝`toggleChoiceBookmark(di.choice.id)`（旧実装は`toggleBookmark(di.question.id)`で問題単位だったため、ブックマーク壁打ちに非ブクマ選択肢まで出る不具合があった。通常学習画面の右上☆は問題単位のまま） |
| ブックマーク出題 | `#btn-start-bookmark` のポップアップ（`#bookmark-start-popup`）。**①☆問題＝通常出題のみ／②☆選択肢＝壁打ちのみ、と明確に分離**（種別と出題形式が1対1）。📄通常出題=`_startSession('sequential', bqs)`（ブクマ問題のみ・全選択肢○×）／🥊壁打ち=ブクマした選択肢`cItems`**のみ**をドリル（同問題の非ブクマ選択肢は出さない）。**☆問題を壁打ちで出す経路は廃止**（非ブクマの他選択肢まで出てしまう不具合のため）。**分野(section)フィルター**：ポップアップ内で `renderMain`／`renderSection(sec)` の多階層ナビ。全分野まとめボタン（従来どおり）の下に、ブックマークが**2分野以上**にまたがるとき「📂 分野で絞り込む」と分野別ボタンを表示。分野は **`q.category` を5分野（法令／ガス技術：製造／ガス技術：供給／ガス技術：消費機器／基礎）に正規化**して分類（ローカル`catOf`：`displayCategoryName`＋`.includes('製造'/'供給'/'消費')`で表記ゆれ「ガス技術（製造）」等を吸収）・`sortCategories`（`CATEGORY_ORDER`）で並べ・未設定は「（分野なし）」で末尾。分野を選ぶと`renderSection`でその分野に絞った📄通常/🥊壁打ちを表示（「◀ 分野一覧に戻る」で `renderMain` に復帰）。**ポップアップ`.top-filter-start-popup`は`max-height:60vh; overflow-y:auto`で画面外はみ出しを防止** |
| キーワード出題 | `keywordMatchedChoices(kw)`（**スペース/全角スペース区切りでOR検索**・**年度別問題のみ**=`q.year` かつ非「分野別」・穴埋め/計算除外）→ `{question,choice,choiceIndex}[]`。`openKeywordModePopup(kw)`（`#keyword-mode-popup`）で🥊壁打ち=`startKeywordDrill`（従来どおり）/ 📄通常出題=`startKeywordNormal`（ヒット選択肢を5つずつrandom分割した合成問題 id=`kwset-*`・questionText空・実choice id保持で進捗連動・最終セットは端数のまま）を選択 |
| 一時マーカー（薄黄緑） | `tempMarkers`（グローバルオブジェクト `{[qId]: [{id,area,choiceId,start,end}]}`）/ `applyTempMarkers(q)`（renderQuestion後に呼ぶ）/ `clearAllTempMarkers()`（ホーム遷移・新規セッション開始時）。保存しない・リザルト画面まで保持 |
| 採点モード | `state.examScoring`（カテゴリフィルター出題時true）/ `computeExamScore()`（1問5点・全選択肢正解で5点・単一選択/計算は1択正解で5点）/ `examScoreTier(pct)`（満点=diamond/80%=platinum/70%=gold/60%=silver/50%=bronze）/ リザルト画面は `result-score` に点数・`result-sub` に選択肢正解数・`bigEl.classList.add('tier-'+tier)` でティア演出 |
| 単一選択極性判定 | `detectPolarityFromText(text)`（問題文から自動判定 `'correct'\|'incorrect'`）/ `getQuestionPolarity(q)`（`q.answerPolarity` 優先→自動判定）/ `singleSelectStatementTrue(q,c)`（選択肢の文章が正しいか返す）/ `q.answerPolarity`で手動上書き可 |
| 編集後の進捗修正 | `_recorrectStudyProgressAfterEdit(q, savedAnswers)`（通常学習中に問題編集→最後の進捗エントリを修正）/ `_fixLastProgressEntry(key, newRight)`（進捗キーの最新履歴を書き換え）。壁打ち中の編集も同様に修正あり |
| Drive保存中メッセージ | `showSyncStatus(msg, persistent=false)`（`persistent=true` で完了/失敗メッセージが出るまで表示し続ける）/ 「保存中」は `persistent:true`・「保存完了/失敗」は `persistent:false`（タイマー自動消去） |
| Drive自動再認証 | `_gdriveRequestTokenSilent()` → `prompt:''` でユーザー操作なし再認証（Googleセッションが有効なら成功。切れていれば reject）。`gdriveUpload(silent, _isRetry)` がトークンなし時・401時に自動呼び出し→成功すればそのまま続行/リトライ。1回のみリトライ（`_isRetry` フラグで無限ループ防止）|
| 計算問題管理 | `calcProblems`（グローバル配列・stateとは独立）/ `saveCalcProblems()`（`gas_calc_problems_v1` に保存・`mark`フィールドも必ず含める）/ `calcMarkFilter`（Set・◎/〇フィルター・空=全件）/ `calcSortMode`（`'registered-asc'`がデフォルト） |
| 計算問題の正誤記録 | `recordCalcAnswer(isRight)`（詳細画面の〇正解/✖不正解ボタン）→ `recordAnswer(p.id)` で進捗履歴 + `recordStudyActivity(1, isRight?1:0, 1, '計算問題')` で**今日の学習に加算** + `updateHeaderStats()` でヘッダー即時更新。studyLogのcatsには `'計算問題'` バケットで集計 |
| 計算問題一覧のドット | `renderCalcPracticeScreen()` の各 `.calc-practice-item` に `makeHistoryDots(state.progress[p.id])`（class `calc-practice-item-dots`・8px）を append。出題画面(`calc-detail-dots`)と同じ直近5回正誤を一覧でも表示 |
| Drive 自動バックアップ・案内 | `gdriveCheckRemote`（Drive無し→初回UP／ローカルが3日以上未保存→自動UP）・`checkLocalBackupReminder`（未接続ユーザーへ7日毎に案内） |

---

## Google Drive 認証フロー

### トークンのライフサイクル

| タイミング | 動作 |
|-----------|------|
| ページロード時 | `_gisLoaded()` → 過去接続済み（`gas_drive_connected` フラグ）なら `prompt:''` でサイレント取得 |
| トークン取得成功 | `_onTokenResponse()` → `_gdriveToken` にセット・UIを「同期中」に更新 |
| アクセストークン有効期限 | **1時間**。期限切れは次回APIアクセス時に401として発覚 |
| 手動再接続ボタン押下 | `_gdriveRequestToken()` → `prompt:'select_account'` でポップアップ表示 |

### 自動再認証フロー（`_gdriveRequestTokenSilent`）

`gdriveUpload()` は以下の2ケースで自動的にサイレント再接続を試みる:

```
① トークンなし + 過去接続済み（silent=true 時）
   → _gdriveRequestTokenSilent() を呼ぶ
       成功 → そのままアップロード続行
       失敗 → 「再接続してください」通知のみ

② アップロード中に 401
   → _gdriveRequestTokenSilent() を呼ぶ
       成功 → gdriveUpload(silent, _isRetry=true) でリトライ（1回限り）
       失敗 → 「再接続が必要です」通知のみ
```

`_isRetry` フラグにより **リトライは最大1回**。401が続く場合は無限ループしない。

### 「サイレント再接続が成功する」条件

- ブラウザがGoogleアカウントにログインしたまま（Googleのセッションが有効）
- アプリへのOAuth権限が取り消されていない

### 「サイレント再接続が失敗する」条件（手動操作が必要）

- Googleアカウントからサインアウトした
- パスワード変更・2段階認証の再設定
- アプリへの権限をGoogleアカウント設定で削除した
- 非常に長期間（数週間〜）アクセスしなかった

### 関連定数・変数

| 名前 | 内容 |
|------|------|
| `GDRIVE_CLIENT_ID` | OAuth2クライアントID |
| `GDRIVE_SCOPE` | `drive.appdata`（アプリ専用フォルダのみ。ユーザーのDriveは見えない） |
| `GDRIVE_FILE` | `gas_study_backup.json` |
| `GDRIVE_CONNECTED_KEY` | `gas_drive_connected`（一度でも接続したフラグ） |
| `GDRIVE_SYNCED_KEY` | `gas_drive_synced_at`（最終同期タイムスタンプ） |
| `_gdriveToken` | 現在のアクセストークン（nullなら未接続/期限切れ） |
| `_gisTokenClient` | Google Identity Services のトークンクライアント |

---

## 規約・注意点（ハマりどころ）

- **キャッシュバスティングのバージョン更新を絶対に忘れない**（デプロイ手順参照）。
- **選択肢の機能は学習・壁打ちの両画面に実装する**（上記2系統を参照）。
- `checkAnswers` は編集後の再描画・前の問題への移動時に `_checkNoRecord = true` で呼ばれ、その間は統計記録をスキップする（表示だけ更新）。新たに記録処理を足すときは必ず `if (!_checkNoRecord)` ガード内に置く。
- マーカーは **描画後のDOMの文字オフセット** で保持。`renderText` の出力（`<br>` 等）を作成時・適用時の両方が見るため整合する。`renderText` の出力規則を変えると過去マーカーがずれ得る点に留意。
- **`_applyHighlights(q)` を呼ぶ際は必ず直後に `applyTempMarkers(q)` も呼ぶこと**。`_applyHighlights` 内部で一時マーカー（`temp-hl`）を除去してから永続マーカーを適用するため、呼び出し後に一時マーカーが消えた状態になる。`applyTempMarkers` で再描画しないと一時マーカーが失われる。（`renderQuestion` 内は元から `applyTempMarkers` を後続で呼んでいるので問題なし）
- `state` と関数はグローバル。デバッグ時はコンソール/`preview_eval` から直接叩ける。
- 文字コードは UTF-8。日本語UIなのでユーザー向け文言・コミットメッセージは日本語可。
- **`〇` は U+3007（〇）を使うこと。`○`（U+25CB）は見た目が似ているが別文字でフィルター・バッジが効かない。**
- **`calcProblems` は `state.questions` とは完全に別管理**。`saveCalcProblems()` の metadata オブジェクトに `mark: p.mark || ''` を必ず含めること（省略するとリロード後にmarkが消える）。
- **スクリーンショットはシマー/ティアアニメーション中にタイムアウトする**。視覚確認は `preview_inspect`・`preview_eval` を使うこと。
- **単一選択問題の進捗キーは `q.id + ':q'`**（選択肢単位ではなく問題単位で記録）。`questionProgressHistories(q)` でまとめて取得可能。
- **マーカー作成は `markerDisplayOn` フラグとは独立**（表示ON/OFFと作成を分離済み）。マーカー表示を切っていても新規作成は可能。
- **モバイルの選択肢タップで○×トグル**：学習画面（`screen-study`）で **答え合わせ前** に選択肢カード本体をタップすると `○⇔×` が切り替わる（PCの数字キーと同じ挙動＝`selectChoiceAnswer(cid, current==='maru'?'batsu':'maru')`）。`_studyScreen` の `touchend` ハンドラで実装（`_studyTouchScrolled` でスクロールと区別）。答え合わせ後タップ＝次の問題へ、のハンドラと `state.checked` で排他。○×ボタン・ブックマーク等（`button, a, ...`）と `.choice-img-resize-handle` は除外。1択・計算問題（`isOnePickQuestion`）はタップ＝そのまま選択なので対象外。マーカー作成は答え合わせ後のみ（`state.checked`）なのでトグルと競合しない。
