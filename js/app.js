// ========== Sort / Edit / Interrupt state ==========
let qlistSortMode       = 'year-desc'; // 'year-desc' | 'year-asc' | 'section'
let qlistSearchQuery    = '';
let qlistFilterCats     = new Set();   // 保存済み問題画面の独立カテゴリフィルター
let qlistFilterBookmark = false;       // ブックマークフィルター
let qlistFilterTags     = new Set();   // タグフィルター
let qlistTagPanelOpen   = false;       // タグパネルの開閉状態
let statsSortMode    = 'year-desc';
let editingQId          = null;
let editingChoiceIndex  = null; // null=全選択肢モード, number=単一選択肢モード
let editingTags         = [];   // 編集中のタグ配列
let editingBlocks            = [];   // 編集中のブロック [{type:'text',content:''} | {type:'image',src:''}]
let editingExplanationImage  = null; // 編集中の解説画像（base64 or null）
let editingChoiceImages      = {};   // 編集中の選択肢画像 { [choiceId]: base64 }
let editingChoiceWidths      = {};   // 編集中の選択肢画像幅 { [choiceId]: number|null }
let editingChoiceExpImages   = {};   // 編集中の「選択肢の解説」画像 { [choiceId]: base64 }
let editingChoiceExpWidths   = {};   // 編集中の解説画像幅 { [choiceId]: number|null }
let _editChoiceImgFocus      = null; // 画像ペースト先 { cid, kind:'choice'|'exp' } or null
// ── 答え合わせ画面のインライン編集（モーダルを出さず、表示中の要素をその場で上書き）──
let inlineEditMode      = false;  // インライン編集モードON/OFF（ON中はマーカー作成を停止）
let qlistSelectMode     = false;
let selectedQIds        = new Set();
let createChoicesList   = []; // [{text, isCorrect}]
let topFilterOpenCat    = null;  // 開いているカテゴリパネル（null=閉じ）
let topFilterSubMode    = 'year'; // 'year' | 'sec'
let topFilterStartOpen  = false;  // 出題開始ポップアップ表示フラグ
// 直前セッションで使ったフィルター（ホーム帰還後に目印表示するため）
let lastUsedFilterYears    = new Set();
let lastUsedFilterSections = new Set();
let lastUsedFilterCat      = null;
let excludeMasteredStreak = 0;  // 出題開始時の連続正解除外しきい値（0=除外なし / 3 / 4 / 5）
// 論述問題練習（ホームの「🔢 計算問題」ボタン直下）
// 論述が出題されるのは「法令」と「消費機器」の2科目のみ
const ESSAY_CATEGORIES  = ['法令', '消費機器'];
const ESSAY_CAT_LABELS  = { '法令': '⚖️ 法令', '消費機器': '🏠 消費機器' };
let essayPickerOpen     = false;  // 科目選択ポップアップ表示フラグ
// 壁打ち設定モーダル用
let drillSetupCats      = new Set();
let drillSetupYears     = new Set();
let drillSetupSections  = new Set();
let drillSetupLimit          = null;
let drillSetupMode           = 'all'; // 'all' | 'weak'
let drillSetupExcludeStreak  = 0; // 壁打ちの連続正解除外しきい値（0=除外なし / 3 / 4 / 5）
let drillSetupPrioritizeNew  = false; // 未出題の問題を優先
let drillPresets             = [null, null, null]; // フィルタープリセット（アセット）
let drillPresetActiveSlot    = null; // 現在適用中のスロット番号 (0-2 or null)
let calcProblems             = []; // 計算問題練習データ
let calcDetailIndex          = 0;  // 計算問題練習詳細画面の現在インデックス
let calcAddPasteTarget       = 'problem'; // 'problem' | 'explanation'
let editingCalcIndex         = null;     // null=追加モード, number=編集対象インデックス
let collapsedCalcTitles      = new Set(); // 折りたたんでいるタイトルグループ
let collapsedCalcSubcats     = new Set(); // 折りたたんでいるサブカテゴリグループ（キー: "title::subcat"）
let calcSortMode             = 'registered-asc';  // 'title' | 'registered-asc' | 'registered-desc'（既定=登録順）
let calcMarkFilter           = new Set();          // 計算問題一覧の◎/〇フィルター（空=全件）
let recentWrongFormat        = 'normal';           // 最近間違えた問題の出題形式 'normal'|'drill'
let resultFocusIndex         = -1; // リザルト画面キーボードフォーカス位置
let pendingStartMode        = null;
let _checkNoRecord          = false;  // true のとき checkAnswers() が記録処理をスキップ
let _checkNoProgressRecord  = false;  // true のとき recordAnswer() のみスキップ（編集後の再チェック用）
let tagStudySelectedTags    = new Set(); // タグ出題エリアで選択中のタグ
let tagStudyFilter          = '';        // タグ出題エリアの検索キーワード
let tagReadingPanelOpen     = false;     // タグ出題エリアの「読みを編集」パネル開閉
let statsTabMode            = 'progress'; // 'progress' | 'history'
let histFilterCats          = new Set();  // 成績履歴フィルター（カテゴリ）
let qlistNavQueue        = []; // 問題リストの現在の表示順（問題ID配列）
// セッション計測
let sessionStartTime    = null; // Date.now() at session start
let sessionCatAnswers   = {};   // { category: answerCount }
let calTimerInterval    = null; // live timer in calendar popup
let calendarViewYear    = new Date().getFullYear();
let calendarViewMonth   = new Date().getMonth();
let modalNavIndex        = 0;  // ナビ位置
let _savedQlistOpenState = null; // 保存/削除時のトグル状態退避

const INTERRUPTED_KEY    = 'gas_interrupted_session_v1';
const PENDING_VERIFY_KEY = 'gas_pending_verify_v1';
const BOOKMARKS_KEY        = 'gas_bookmarks_v1';
const CHOICE_BOOKMARKS_KEY  = 'gas_choice_bookmarks_v1';
const STUDY_LOG_KEY         = 'gas_study_log_v1';
const SESSION_RECORDS_KEY   = 'gas_session_records_v1';
const NOTES_KEY          = 'gas_notes_v1';
const HIGHLIGHTS_KEY     = 'gas_highlights_v1';
const ESSAY_NOTES_KEY    = 'gas_essay_notes_v1';

let highlightsData   = {};   // { [qId]: [{id, blockIdx, start, end}] }
let markerDisplayOn  = false;

// カテゴリフィルターの固定レイアウト（3列グリッド、null=空白セル）
const CATEGORY_LAYOUT = [
  ['法令',   'ガス技術：製造', '基礎'],
  [null,     'ガス技術：供給', null  ],
  [null,     'ガス技術：消費機器', null  ],
];

// トグルリストのカテゴリ並び順（未定義のカテゴリは末尾に50音順）
const CATEGORY_ORDER = ['法令', 'ガス技術：製造', 'ガス技術：供給', 'ガス技術：消費', 'ガス技術：消費機器', '基礎'];

// ========== 模試モード 科目グループ設定 ==========
const EXAM_SUBJECT_GROUPS = {
  '法令': {
    label: '法令', cats: ['法令'],
    required: null,  // null = 全問必須
    maxScore: 80
  },
  '基礎': {
    label: '基礎', cats: ['基礎'],
    required: 10,
    maxScore: 50
  },
  'ガス技術': {
    label: 'ガス技術',
    cats: ['ガス技術：製造', 'ガス技術：供給', 'ガス技術：消費機器',
           'ガス技術（製造）', 'ガス技術（供給）', 'ガス技術（消費）', 'ガス技術：消費'],
    required: 20,
    maxScore: 100
  }
};

function getExamGroup(q) {
  for (const [key, cfg] of Object.entries(EXAM_SUBJECT_GROUPS)) {
    if (cfg.cats.includes(q.category)) return key;
  }
  return null;
}

// 問題の解答が有効か（スキップでも未回答でもない）
function isExamAnswered(saved) {
  if (!saved || saved.__skipped__) return false;
  if (saved.__count__ !== undefined) return true;
  return Object.keys(saved).some(k => !k.startsWith('__'));
}

function sortCategories(cats) {
  return [...cats].sort((a, b) => {
    const ia = CATEGORY_ORDER.indexOf(a);
    const ib = CATEGORY_ORDER.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;   // 両方定義済み → 順序通り
    if (ia !== -1) return -1;                       // a だけ定義済み → a を前へ
    if (ib !== -1) return 1;                        // b だけ定義済み → b を前へ
    return a.localeCompare(b, 'ja');               // 両方未定義 → 50音順
  });
}

/** 分野(section)を節番号順に並べる（「第1節」「1節」等の先頭数値で比較、数値なしは末尾） */
function sortSections(sections) {
  return [...sections].sort((a, b) => {
    const na = parseInt((String(a).match(/^第?\s*(\d+)/) || ['', '99'])[1]);
    const nb = parseInt((String(b).match(/^第?\s*(\d+)/) || ['', '99'])[1]);
    return na !== nb ? na - nb : String(a).localeCompare(String(b), 'ja');
  });
}

// カテゴリ名の表示用変換（データ上は「ガス技術：消費」だが画面上は「消費機器」と表示）
function displayCategoryName(cat) {
  return cat === 'ガス技術：消費' ? 'ガス技術：消費機器' : cat;
}

// ========== State ==========
const state = {
  questions: [],
  queue: [],        // array of question objects
  queueIndex: 0,
  progress: {},
  mode: 'random',   // 'random' | 'sequential' | 'weak'
  activeCategories: new Set(),
  activeYears: new Set(),
  activeSections: new Set(),
  activeTags: new Set(),
  calcFilter: false,   // 計算問題フィルターモード
  quickMode: false,    // 「とりあえず50」モード（計算/1択登録で問題スキップ）
  sessionStats: { total: 0, correct: 0 },
  sessionWrongQuestions: [], // 1択以上間違えた問題
  sessionWrongChoices:   [], // 間違えた選択肢 [{question, choice, choiceIndex}]
  sessionHistory:        [], // 出題履歴 [{question, choiceResults:[{choice,choiceIndex,isRight,userAnswer}]}]
  answers: {},      // { choiceId: 'maru' | 'batsu' }
  checked: false,
  // Bookmarks
  bookmarks: new Set(),
  choiceBookmarks: new Set(), // 選択肢単位のブックマーク（choiceId のセット）
  // Exam mode
  examMode:           false,
  examTimeLimitMin:   0,
  examElapsedSec:     0,
  examTimerInterval:  null,
  examAnswers:        {},   // { queueIndex: { choiceId: 'maru'|'batsu' } }
  examSubjectGroups:  {},   // { groupKey: { queueIndices, required, label, maxScore } }
  examSubmitSet:      null, // Set<queueIndex> 提出対象, null=全非スキップ
  // Drill mode
  drillQueue: [],
  drillIndex: 0,
  drillMode: 'all',
  drillStats: { total: 0, correct: 0 },
  drillAnswered: false,
  drillAnswers: {},   // { [index]: { userSaysCorrect, isRight, actuallyCorrect } }
  // Question limits
  randomLimit: null,  // null = unlimited
  drillLimit:  null,
  // 「もう一度」用：直前セッションの情報
  lastAgainType:     null,  // 'study' | 'drill'
  lastAgainMode:     null,  // モード文字列
  lastAgainFiltered: null,  // study: 問題配列 / drill: 選択肢キュー（制限前）
  lastAgainLimit:    null,  // drill のみ: 問題数制限
};

// ========== Rich Text Helpers ==========

/**
 * テキストをHTMLとしてレンダリングするためのヘルパー。
 * [r]...[/r] を <span class="q-red">...</span> に変換する。
 * XSS対策として & < > " は事前エスケープする。
 */
function renderText(text) {
  if (!text) return '';
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  return escaped
    .replace(/\[r\]([\s\S]*?)\[\/r\]/g, '<span class="q-red">$1</span>')
    .replace(/\n/g, '<br>');
}

/**
 * テキストエリアの選択範囲をマークアップで囲む。
 * 選択なしの場合はカーソル位置に open+close を挿入してカーソルを中間に移動。
 */
function insertMarkup(ta, open, close) {
  const start = ta.selectionStart;
  const end   = ta.selectionEnd;
  const val   = ta.value;
  const selected = val.slice(start, end);
  const replacement = open + selected + close;
  ta.value = val.slice(0, start) + replacement + val.slice(end);
  if (selected.length === 0) {
    ta.selectionStart = ta.selectionEnd = start + open.length;
  } else {
    ta.selectionStart = start;
    ta.selectionEnd   = start + replacement.length;
  }
  ta.dispatchEvent(new Event('input'));
  ta.focus();
}

// ========== Highlights (Marker Feature) ==========

function loadHighlights() {
  try {
    const raw = localStorage.getItem(HIGHLIGHTS_KEY);
    highlightsData = raw ? JSON.parse(raw) : {};
  } catch { highlightsData = {}; }
}

function saveHighlights() {
  localStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify(highlightsData));
}

/**
 * マーカーの保存キーは「表示中の問題id」ではなく **その選択肢を実際に持つ問題のid**。
 * キーワード出題(`kwset-*`)・出題ジェネレータの選択肢単位(`gen-*`)は
 * 実問題とは別idの合成問題を作るため、表示中の問題idで保存すると
 * 通常出題と壁打ちで同じ選択肢のマーカーが共有されない。
 */
let _choiceOwnerIdx = null;   // Map(選択肢id -> 実問題id)

/** state.questions を書き換えたら呼ぶ（次回参照時に作り直す） */
function invalidateChoiceOwnerIndex() { _choiceOwnerIdx = null; }

function _choiceOwnerId(choiceId) {
  if (!_choiceOwnerIdx) {
    _choiceOwnerIdx = new Map();
    (state.questions || []).forEach(q =>
      (q.choices || []).forEach(c => { if (c && c.id) _choiceOwnerIdx.set(c.id, q.id); })
    );
  }
  return _choiceOwnerIdx.get(choiceId);
}

/** マーカーの保存キー。実問題が見つからなければ表示中の問題idにフォールバック */
function hlKey(choiceId, fallbackQid) {
  return _choiceOwnerId(choiceId) || fallbackQid;
}

/** その選択肢のマーカー一覧 */
function hlFor(choiceId, fallbackQid) {
  return (highlightsData[hlKey(choiceId, fallbackQid)] || []).filter(h => h.choiceId === choiceId);
}

/** 表示中の問題（合成問題含む）に出るマーカーを [{key, h}] で全部集める */
function hlEntriesForQuestion(q) {
  const out = [];
  ((q && q.choices) || []).forEach(c => {
    if (!c || !c.id) return;
    const key = hlKey(c.id, q.id);
    (highlightsData[key] || []).forEach(h => { if (h.choiceId === c.id) out.push({ key, h }); });
  });
  return out;
}

/** [{key, h}] のマーカーをまとめて削除（空になったバケットも掃除）。保存は呼び出し側で */
function _hlRemoveEntries(entries) {
  entries.forEach(({ key, h }) => {
    if (!highlightsData[key]) return;
    highlightsData[key] = highlightsData[key].filter(x => x !== h);
    if (highlightsData[key].length === 0) delete highlightsData[key];
  });
}

/**
 * 旧データの再配置：合成問題id（`kwset-*` / `gen-*`）の下に保存されていたマーカーを
 * 実問題idのバケットへ移す。実問題が見つからないものはそのまま残す。
 * **state.questions のロード後に呼ぶこと**（実問題idを引けないと移動できない）。
 */
function migrateHighlightsToOwnerQuestion() {
  invalidateChoiceOwnerIndex();
  let changed = false;
  Object.keys(highlightsData).forEach(qid => {
    const list = highlightsData[qid] || [];
    const stay = [];
    list.forEach(h => {
      const owner = _choiceOwnerId(h.choiceId);
      if (!owner || owner === qid) { stay.push(h); return; }
      const dst = (highlightsData[owner] = highlightsData[owner] || []);
      if (!dst.some(x => x.id === h.id)) dst.push(h);
      changed = true;
    });
    if (stay.length !== list.length) {
      if (stay.length === 0) delete highlightsData[qid];
      else highlightsData[qid] = stay;
    }
  });
  if (changed) saveHighlights();
}

/** container 内の全マーカー mark（黄色・赤）を展開してテキストノードに戻す */
function _clearMarkElements(container) {
  container.querySelectorAll('mark.q-highlight, mark.q-highlight-red').forEach(mark => {
    const parent = mark.parentNode;
    while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
    parent.removeChild(mark);
    parent.normalize();
  });
}

/**
 * root 配下で (targetNode, targetOffset) が全体の何文字目かを返す。
 * targetNode はテキストノードだけでなく、要素ノードのこともある
 * （改行 <br> や [r]赤字[/r] のスパン境界で選択を終えた場合など）。
 * 適用側 _applyHighlightRange と同じ「テキストノードのみを数える」基準に揃える。
 */
function _getTextOffset(root, targetNode, targetOffset) {
  // テキストノード境界：従来どおり前方のテキスト長を積算
  if (targetNode.nodeType === Node.TEXT_NODE) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let count = 0, node;
    while ((node = walker.nextNode()) !== null) {
      if (node === targetNode) return count + targetOffset;
      count += node.textContent.length;
    }
    return count;
  }

  // 要素ノード境界：root先頭〜境界点の range を作り、そこに含まれるテキスト長を数える
  const r = document.createRange();
  r.setStart(root, 0);
  try { r.setEnd(targetNode, targetOffset); }
  catch { return 0; }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let count = 0, node;
  while ((node = walker.nextNode()) !== null) {
    const len = node.textContent.length;
    // node末尾が境界以前 → 全長を加算
    if (r.comparePoint(node, len) <= 0) { count += len; continue; }
    // node末尾は境界より後。node先頭が境界以前なら、境界はこのnode内
    if (r.comparePoint(node, 0) <= 0) {
      count += (r.endContainer === node) ? r.endOffset : 0;
    }
    break;
  }
  return count;
}

/**
 * el 配下の「可視テキスト」（テキストノードだけを連結した文字列）を返す。
 * <br>（改行）や画像は0文字。_getTextOffset / _applyHighlightRange と同じ
 * 「テキストノードのみを数える」基準なので、この文字列の [start,end) がマーカー範囲に一致する。
 */
function _visibleText(root) {
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let s = '', n;
  while ((n = w.nextNode()) !== null) s += n.textContent;
  return s;
}

/**
 * 保存済みマーカー h を現在のテキストに合わせて再アンカーし、描画に使う {start,end,changed} を返す。
 *   - h.text（作成時にマークした実文字列）があれば、それを現在の可視テキストから探して位置を補正。
 *     これにより、マーク位置より前の文字が編集で増減してもマーカーがずれない（テキストに追従する）。
 *   - h.text が無い旧データは、現在のオフセット位置の文字列を text としてバックフィルし、以後安定化させる。
 *   - 同じ文字列が複数ある場合は、保存オフセットに最も近い出現を採用する。
 * changed=true のとき、呼び出し側が saveHighlights() すれば補正結果が永続化され自己修復する。
 */
function _anchorHighlight(el, h) {
  const full = _visibleText(el);
  // 旧データ: text 未保存 → 現在位置の文字列をバックフィル（未編集なら正しい語を捕捉できる）
  if (!h.text) {
    if (h.start < h.end && h.end <= full.length) {
      const cur = full.slice(h.start, h.end);
      if (cur) { h.text = cur; return { start: h.start, end: h.end, changed: true, valid: true }; }
    }
    // 範囲外＝テキストが短くなった等で復元不能。描画もできず消せない「幽霊」になるので無効扱い。
    return { start: h.start, end: h.end, changed: false, valid: false };
  }
  // 保存オフセットのままで一致すれば補正不要
  if (full.slice(h.start, h.end) === h.text) return { start: h.start, end: h.end, changed: false, valid: true };
  // 現在のテキストから h.text の全出現を走査し、保存 start に最も近いものを採用
  let from = 0, i, best = -1;
  while ((i = full.indexOf(h.text, from)) !== -1) {
    if (best === -1 || Math.abs(i - h.start) < Math.abs(best - h.start)) best = i;
    from = i + 1;
  }
  // マーク文字列自体が消えた（編集で書き換えられた）→ 復元先が無いので無効扱い
  if (best === -1) return { start: h.start, end: h.end, changed: false, valid: false };
  if (best !== h.start) {
    h.start = best;
    h.end   = best + h.text.length;
    return { start: h.start, end: h.end, changed: true, valid: true };
  }
  return { start: h.start, end: h.end, changed: false, valid: true };
}

/**
 * el 内の [start, end) を <mark class=markClass> で包む
 * markClass: 'q-highlight'（黄色）| 'q-highlight-red'（赤文字）
 */
function _applyHighlightRange(el, start, end, hid, markClass = 'q-highlight') {
  if (start >= end) return;
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let count = 0, node;
  let startNode = null, startOff = 0, endNode = null, endOff = 0;

  while ((node = walker.nextNode()) !== null) {
    const len = node.textContent.length;
    const nodeEnd = count + len;

    if (!startNode && nodeEnd > start) {
      startNode = node;
      startOff  = start - count;
    }
    if (nodeEnd >= end) {
      endNode = node;
      endOff  = end - count;
      break;
    }
    count += len;
  }
  if (!startNode || !endNode) return;

  const range = document.createRange();
  range.setStart(startNode, Math.max(0, startOff));
  range.setEnd(endNode,   Math.min(endNode.textContent.length, endOff));
  if (range.collapsed) return;

  const mark = document.createElement('mark');
  mark.className = markClass;
  mark.dataset.hid = hid;

  try {
    range.surroundContents(mark);
  } catch {
    const frag = range.extractContents();
    mark.appendChild(frag);
    range.insertNode(mark);
  }
}

/**
 * 現在の問題のマーカーを選択肢テキスト・解説に適用
 * h.area === 'choice'      → .choice-item-text  に黄色マーカー（markerDisplayOn 時のみ）
 * h.area === 'explanation' → .choice-explanation に赤文字マーカー（常時表示）
 */
function _applyHighlights(q) {
  const choicesList = document.getElementById('choices-list');
  if (choicesList) {
    _clearMarkElements(choicesList);
    // 一時マーカー（temp-hl）も除去しておく。
    // そのままにすると永続マーカー適用時に surroundContents が失敗して
    // 黄色マーカーが temp-hl の内側にネストされ視覚的に隠れるバグを防ぐ。
    // 一時マーカーは呼び出し元が applyTempMarkers(q) で再描画する。
    choicesList.querySelectorAll('.choice-item-text').forEach(_clearTempMarks);
  }
  if (!q) return;

  let dirty = false;
  const ghosts = [];   // 現在のテキストに復元できないマーカー（描画できず削除もできない幽霊）
  // 選択肢ごとに実問題のバケットから引く（合成問題でも実問題のマーカーが出る）
  hlEntriesForQuestion(q).forEach(({ key, h }) => {
    const area      = h.area || 'choice';
    // 解説の赤マーカーは常時表示。選択肢の黄色マーカーは markerDisplayOn 時のみ。
    if (area !== 'explanation' && !markerDisplayOn) return;
    const selector  = area === 'explanation' ? '.choice-explanation' : '.choice-item-text';
    const markClass = area === 'explanation' ? 'q-highlight-red'     : 'q-highlight';
    const el = document.querySelector(`#choices-list [data-cid="${h.choiceId}"] ${selector}`);
    // el が無い＝その選択肢が未描画（解説非表示など）。判定できないので手を付けない。
    if (el) {
      const a = _anchorHighlight(el, h);   // 編集で前方がずれても実文字列で位置補正
      if (!a.valid) { ghosts.push({ key, h }); return; }   // 幽霊は描画せず破棄対象へ
      dirty = dirty || a.changed;
      _applyHighlightRange(el, a.start, a.end, h.id, markClass);
    }
  });
  if (ghosts.length) {   // 幽霊を除去（残すとドラッグ時に融合して新規マーカーまで不可視化する）
    _hlRemoveEntries(ghosts);
    dirty = true;
  }
  if (dirty) saveHighlights();   // 補正結果を永続化して自己修復
}

/** マーカーボタンの表示を現在の状態に合わせて更新 */
function _updateMarkerBtn() {
  const btn = document.getElementById('btn-marker-toggle');
  if (!btn) return;
  const q = (state.queueIndex < state.queue.length) ? state.queue[state.queueIndex] : null;
  const hasMarks = !!(q && hlEntriesForQuestion(q).length);
  btn.classList.toggle('marker-on',  markerDisplayOn);
  btn.classList.toggle('marker-has', hasMarks);
  btn.title = markerDisplayOn ? 'マーカーを隠す' : `マーカーを表示${hasMarks ? '（あり）' : ''}`;
  // 「マーカーを全消去」ボタンはマーカーがある問題でのみ表示
  document.getElementById('btn-clear-marks-study')?.classList.toggle('hidden', !hasMarks);
}

/**
 * 現在の問題（学習画面）のマーカーをまとめて消す。
 * ずれた位置に残ったマーカーを個別に消すのが大変なとき用。確認ダイアログを挟む。
 */
function clearMarksForCurrentQuestion() {
  const q = (state.queueIndex < state.queue.length) ? state.queue[state.queueIndex] : null;
  if (!q) return;
  const entries = hlEntriesForQuestion(q);
  const n = entries.length;
  if (n === 0) return;
  if (!confirm(`この問題のマーカー${n}件（赤太文字・黄色）をすべて消去します。\nこの操作は元に戻せません。よろしいですか？\n\n※問題文に [r]…[/r] で登録した赤字は消えません。`)) return;
  _hlRemoveEntries(entries);
  saveHighlights();
  delete tempMarkers[q.id];
  _applyHighlights(q);
  applyTempMarkers(q);
  _updateMarkerBtn();
}

/** 現在の選択肢（壁打ち画面）のマーカーをまとめて消す */
function clearMarksForCurrentDrillChoice() {
  const di = state.drillQueue?.[state.drillIndex];
  if (!di) return;
  const q = di.question, c = di.choice;
  const key  = hlKey(c.id, q.id);
  const mine = hlFor(c.id, q.id);
  if (mine.length === 0) return;
  if (!confirm(`この選択肢のマーカー${mine.length}件（赤太文字・黄色）をすべて消去します。\nこの操作は元に戻せません。よろしいですか？\n\n※問題文に [r]…[/r] で登録した赤字は消えません。`)) return;
  _hlRemoveEntries(mine.map(h => ({ key, h })));
  saveHighlights();
  _applyDrillHighlights(q, c);
  _updateDrillMarkerBtn(q, c);
}

/** 答え合わせ時：マーキングがある問題なら自動でマーカーを表示する */
function _autoRevealMarkersOnCheck(q) {
  if (!q) return;
  const hasMarks = hlEntriesForQuestion(q).length > 0;
  if (hasMarks) markerDisplayOn = true;
  _applyHighlights(q);   // 解説の赤マーカーは常時、選択肢の黄色マーカーは markerDisplayOn 時に反映
  applyTempMarkers(q);   // 永続マーカー適用後に一時マーカーを再描画（重ね順: 永続→一時）
  _updateMarkerBtn();
}

/** 壁打ちモード用マーカー適用（選択肢テキスト＋解説） */
function _applyDrillHighlights(q, c) {
  const textEl = document.getElementById('drill-choice-text');
  const expEl  = document.getElementById('drill-explanation');
  if (textEl) _clearMarkElements(textEl);
  if (expEl)  _clearMarkElements(expEl);
  if (!q || !c) return;
  let dirty = false;
  const ghosts = [];   // 復元できないマーカー（描画も削除もできない）は破棄する
  const key = hlKey(c.id, q.id);   // 実問題のバケット（合成問題でも通常出題と共有される）
  hlFor(c.id, q.id).forEach(h => {
    const area = h.area || 'choice';
    if (area !== 'explanation' && !markerDisplayOn) return;
    if (area === 'explanation') {
      if (expEl && !expEl.classList.contains('hidden')) {
        const a = _anchorHighlight(expEl, h);
        if (!a.valid) { ghosts.push({ key, h }); return; }
        dirty = dirty || a.changed;
        _applyHighlightRange(expEl, a.start, a.end, h.id, 'q-highlight-red');
      }
    } else {
      if (textEl) {
        const a = _anchorHighlight(textEl, h);
        if (!a.valid) { ghosts.push({ key, h }); return; }
        dirty = dirty || a.changed;
        _applyHighlightRange(textEl, a.start, a.end, h.id, 'q-highlight');
      }
    }
  });
  if (ghosts.length) {
    _hlRemoveEntries(ghosts);
    dirty = true;
  }
  if (dirty) saveHighlights();
}

/** 壁打ちモード用マーカーボタン状態更新 */
function _updateDrillMarkerBtn(q, c) {
  const btn = document.getElementById('btn-drill-marker-toggle');
  if (!btn) return;
  const hasMarks = !!(q && c && hlFor(c.id, q.id).length);
  btn.classList.toggle('marker-on',  markerDisplayOn);
  btn.classList.toggle('marker-has', hasMarks);
  btn.title = markerDisplayOn ? 'マーカーを隠す' : `マーカーを表示${hasMarks ? '（あり）' : ''}`;
  // 「マーカーを全消去」ボタンはマーカーがある選択肢でのみ表示（答え合わせ後のみ意味を持つ）
  document.getElementById('btn-clear-marks-drill')?.classList.toggle('hidden', !hasMarks);
}

// ===== 一時マーカー（薄黄緑）— 回答検討用。保存しない／セッション中のみ保持 =====
// 構造: { [qId]: [ {id, area:'q'|'c', choiceId|null, start, end} ] }
let tempMarkers = {};

function _tempMarkerRoot(area, choiceId) {
  if (area === 'q') return document.getElementById('question-blocks');
  return document.querySelector(`#choices-list [data-cid="${choiceId}"] .choice-item-text`);
}

function _clearTempMarks(container) {
  if (!container) return;
  container.querySelectorAll('mark.temp-hl').forEach(m => {
    const p = m.parentNode;
    while (m.firstChild) p.insertBefore(m.firstChild, m);
    p.removeChild(m); p.normalize();
  });
}

// 現在の問題の一時マーカーを描画（問題文＋各選択肢テキスト）
function applyTempMarkers(q) {
  _clearTempMarks(document.getElementById('question-blocks'));
  document.querySelectorAll('#choices-list .choice-item-text').forEach(_clearTempMarks);
  if (!q) return;
  (tempMarkers[q.id] || []).forEach(h => {
    const root = _tempMarkerRoot(h.area, h.choiceId);
    if (root) {
      const a = _anchorHighlight(root, h);   // 一時マーカーは保存しないので changed は無視
      _applyHighlightRange(root, a.start, a.end, h.id, 'temp-hl');
    }
  });
}

// 一時マーカーを全消去（ホーム遷移・新規セッション開始時）
function clearAllTempMarkers() { tempMarkers = {}; }

// ========== Storage ==========
const PROGRESS_KEY     = 'gas_study_progress_v1';
const QUESTIONS_KEY    = 'gas_questions_v1';
const SETTINGS_KEY     = 'gas_settings_v1';
const LAST_FILTER_KEY  = 'gas_last_filter_v1';

// ========== IndexedDB (画像専用ストレージ) ==========
const IDB_NAME  = 'gas_study_db';
const IDB_VER   = 1;
const IDB_STORE = 'images';
const IDB_REF   = 'idb:'; // LocalStorageに書く参照プレフィックス

let _idb = null;

function _openIDB() {
  if (_idb) return Promise.resolve(_idb);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, IDB_VER);
    req.onupgradeneeded = e => e.target.result.createObjectStore(IDB_STORE);
    req.onsuccess = e => { _idb = e.target.result; resolve(_idb); };
    req.onerror   = e => reject(e.target.error);
  });
}

async function idbGet(key) {
  try {
    const db = await _openIDB();
    return await new Promise(res => {
      const req = db.transaction(IDB_STORE, 'readonly').objectStore(IDB_STORE).get(key);
      req.onsuccess = () => res(req.result || null);
      req.onerror   = () => res(null);
    });
  } catch { return null; }
}

async function idbSet(key, value) {
  try {
    const db = await _openIDB();
    await new Promise(res => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put(value, key);
      tx.oncomplete = res;
      tx.onerror    = res;
    });
  } catch {}
}

// 保存値を解決: 'idb:key' → IDBから取得, 'data:...' → そのまま返す
async function idbResolveImage(val) {
  if (!val) return null;
  if (val.startsWith(IDB_REF)) return await idbGet(val.slice(IDB_REF.length));
  return val; // 旧形式（data:URL直埋め）はそのまま
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    state.progress = raw ? JSON.parse(raw) : {};
  } catch { state.progress = {}; }
}

/**
 * 選択肢ごとの history から問題レベル（q.id + ':q'）の history を生成する。
 * 問題レベルのキーがまだ存在しない場合のみ実行（マイグレーション用）。
 * 通常問題: 全選択肢が同一スロットで正解 → 問題正解
 */
function migrateQuestionHistory() {
  let changed = false;
  (state.questions || []).forEach(q => {
    const qKey = q.id + ':q';
    if (state.progress[qKey]) return;       // 既にデータあり
    const choices = q.choices || [];
    if (choices.length === 0) return;

    // 各選択肢の history を取得（なければ空配列）
    const histories = choices.map(c => {
      const p = state.progress[c.id];
      return (p && Array.isArray(p.history)) ? p.history : [];
    });
    const minLen = Math.min(...histories.map(h => h.length));
    if (minLen === 0) return;

    // 同一スロットで全選択肢が正解なら問題正解と見なす
    const qHistory = [];
    for (let i = 0; i < minLen; i++) {
      qHistory.push(histories.every(h => h[i] === true));
    }

    const lastDate = (state.progress[choices[0].id] || {}).lastDate || '';
    state.progress[qKey] = {
      attempts: minLen,
      correct:  qHistory.filter(Boolean).length,
      history:  qHistory,
      lastDate,
    };
    changed = true;
  });
  if (changed) saveProgress();
}

function saveProgress() {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(state.progress));
}

function saveLastUsedFilter() {
  localStorage.setItem(LAST_FILTER_KEY, JSON.stringify({
    cat:      lastUsedFilterCat,
    years:    [...lastUsedFilterYears],
    sections: [...lastUsedFilterSections],
  }));
}

function loadLastUsedFilter() {
  try {
    const data = JSON.parse(localStorage.getItem(LAST_FILTER_KEY) || 'null');
    if (!data) return;
    lastUsedFilterCat      = data.cat      ?? null;
    lastUsedFilterYears    = new Set(data.years    || []);
    lastUsedFilterSections = new Set(data.sections || []);
  } catch {}
}

// ========== App Settings ==========
let appSettings = { fontSize: 15, fontWeight: 400 };

function loadAppSettings() {
  try { Object.assign(appSettings, JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}')); } catch {}
  applyAppSettings();
}

function applyAppSettings() {
  document.documentElement.style.setProperty('--font-size-base', appSettings.fontSize + 'px');
  document.documentElement.style.setProperty('--font-weight-base', appSettings.fontWeight);
}

function saveAppSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(appSettings));
}

async function loadStoredQuestions() {
  try {
    const raw = localStorage.getItem(QUESTIONS_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    // IDB参照(idb:...)を実際のdata:URLに解決
    state.questions = await Promise.all(data.map(async q => {
      const r = { ...q };
      if (q.explanationImage) r.explanationImage = await idbResolveImage(q.explanationImage);
      if (Array.isArray(q.blocks)) {
        r.blocks = await Promise.all(q.blocks.map(async b => {
          if (b.type === 'image') return { ...b, src: await idbResolveImage(b.src) };
          return b;
        }));
      }
      if (Array.isArray(q.choices)) {
        r.choices = await Promise.all(q.choices.map(async c => {
          if (!c.image && !c.explanationImage) return c;
          const nc = { ...c };
          if (c.image)            nc.image            = await idbResolveImage(c.image);
          if (c.explanationImage) nc.explanationImage = await idbResolveImage(c.explanationImage);
          return nc;
        }));
      }
      return r;
    }));
    // 旧形式（data:直埋め）を検出したら自動でIDBへ移行
    const hasLegacy = data.some(q =>
      q.explanationImage?.startsWith('data:') ||
      (Array.isArray(q.blocks) && q.blocks.some(b => b.type === 'image' && b.src?.startsWith('data:'))) ||
      (Array.isArray(q.choices) && q.choices.some(c =>
        c.image?.startsWith('data:') || c.explanationImage?.startsWith('data:')))
    );
    invalidateChoiceOwnerIndex();   // 選択肢id→実問題id の対応を作り直す（マーカー用）
    if (hasLegacy) saveQuestions();
    return true;
  } catch { return false; }
}

// skipImageWrite=true: 画像はIDBへ書き戻さない（画像以外の軽微な変更＝表示幅など用）
function saveQuestions(skipImageWrite = false) {
  invalidateChoiceOwnerIndex();   // 選択肢の追加・削除に追従（マーカーの保存キー解決に使う）
  // 画像をIDB参照に置き換えてLocalStorageに保存（容量節約）
  const stripped = state.questions.map(q => {
    const s = { ...q };
    if (q.explanationImage?.startsWith('data:')) {
      s.explanationImage = IDB_REF + 'q_' + q.id + '_exp';
    }
    if (Array.isArray(q.blocks)) {
      s.blocks = q.blocks.map((b, i) =>
        (b.type === 'image' && b.src?.startsWith('data:'))
          ? { ...b, src: IDB_REF + 'q_' + q.id + '_b' + i }
          : b
      );
    }
    if (Array.isArray(q.choices)) {
      s.choices = q.choices.map((c, ci) => {
        if (!c.image?.startsWith('data:') && !c.explanationImage?.startsWith('data:')) return c;
        const sc = { ...c };
        if (c.image?.startsWith('data:'))            sc.image            = IDB_REF + 'q_' + q.id + '_c'  + ci;
        if (c.explanationImage?.startsWith('data:')) sc.explanationImage = IDB_REF + 'q_' + q.id + '_ce' + ci;
        return sc;
      });
    }
    return s;
  });
  try {
    localStorage.setItem(QUESTIONS_KEY, JSON.stringify(stripped));
    console.log('[saveQuestions] 保存完了 questions:', state.questions.length);
  } catch(e) {
    console.error('[saveQuestions] 保存失敗:', e);
    if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      alert('⚠️ ストレージ容量が不足しています。\n\n不要な問題を削除してください。');
    } else {
      alert('⚠️ 保存に失敗しました: ' + e.message);
    }
    throw e;
  }
  // 画像をIDBに非同期で保存（fire-and-forget）
  if (skipImageWrite) return;
  (async () => {
    for (const q of state.questions) {
      if (q.explanationImage?.startsWith('data:'))
        await idbSet('q_' + q.id + '_exp', q.explanationImage);
      if (Array.isArray(q.blocks)) {
        for (let i = 0; i < q.blocks.length; i++) {
          const b = q.blocks[i];
          if (b.type === 'image' && b.src?.startsWith('data:'))
            await idbSet('q_' + q.id + '_b' + i, b.src);
        }
      }
      if (Array.isArray(q.choices)) {
        for (let ci = 0; ci < q.choices.length; ci++) {
          if (q.choices[ci].image?.startsWith('data:'))
            await idbSet('q_' + q.id + '_c' + ci, q.choices[ci].image);
          if (q.choices[ci].explanationImage?.startsWith('data:'))
            await idbSet('q_' + q.id + '_ce' + ci, q.choices[ci].explanationImage);
        }
      }
    }
  })().catch(e => console.error('[saveQuestions IDB]', e));
}

// ========== Bookmarks ==========
function loadBookmarks() {
  try { return new Set(JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || '[]')); }
  catch { return new Set(); }
}
function saveBookmarks() {
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify([...state.bookmarks]));
}
function toggleBookmark(qId) {
  if (state.bookmarks.has(qId)) state.bookmarks.delete(qId);
  else state.bookmarks.add(qId);
  saveBookmarks();
}

// ── 選択肢ブックマーク ──
function loadChoiceBookmarks() {
  try { return new Set(JSON.parse(localStorage.getItem(CHOICE_BOOKMARKS_KEY) || '[]')); }
  catch { return new Set(); }
}
function saveChoiceBookmarks() {
  localStorage.setItem(CHOICE_BOOKMARKS_KEY, JSON.stringify([...state.choiceBookmarks]));
}
function toggleChoiceBookmark(choiceId) {
  if (state.choiceBookmarks.has(choiceId)) state.choiceBookmarks.delete(choiceId);
  else state.choiceBookmarks.add(choiceId);
  saveChoiceBookmarks();
  // ボタンの表示を即時更新
  const isBm = state.choiceBookmarks.has(choiceId);
  const btn = document.querySelector(`.choice-bm-btn[data-cid="${choiceId}"]`);
  if (btn) {
    btn.textContent = isBm ? '★' : '☆';
    btn.classList.toggle('bookmarked', isBm);
  }
}

// createChoiceItem / createChoiceItemCalc 呼び出し後にブックマーク状態を反映するヘルパー
function applyChoiceBmState(choiceId) {
  const isBm = state.choiceBookmarks.has(choiceId);
  const btn = document.querySelector(`.choice-bm-btn[data-cid="${choiceId}"]`);
  if (btn) {
    btn.textContent = isBm ? '★' : '☆';
    btn.classList.toggle('bookmarked', isBm);
  }
}

// ========== Study Log ==========
function loadStudyLog() {
  try { return JSON.parse(localStorage.getItem(STUDY_LOG_KEY) || '{}'); }
  catch { return {}; }
}
function saveStudyLog(log) {
  localStorage.setItem(STUDY_LOG_KEY, JSON.stringify(log));
}
function getLocalDateStr(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function recordStudyActivity(answeredCount, correctCount, questionsCount = 0, category = null) {
  const today = getLocalDateStr();
  const log = loadStudyLog();
  if (!log[today]) log[today] = { answered: 0, correct: 0, secs: 0, cats: {}, questions: 0 };
  log[today].answered  += answeredCount;
  log[today].correct   += correctCount;
  log[today].questions  = (log[today].questions || 0) + questionsCount;
  if (category) {
    if (!log[today].cats) log[today].cats = {};
    if (!log[today].cats[category]) log[today].cats[category] = { answered: 0, secs: 0 };
    log[today].cats[category].answered = (log[today].cats[category].answered || 0) + answeredCount;
  }
  saveStudyLog(log);
}

// ========== Session Timing ==========
function toJpEraYear(date) {
  const y = date.getFullYear();
  if (y >= 2019) return `令和${y - 2018}年`;
  if (y >= 1989) return `平成${y - 1988}年`;
  return `${y}年`;
}

function fmtTime(secs) {
  if (!secs || secs <= 0) return '—';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}時間${m > 0 ? m + '分' : ''}`;
  if (m > 0) return `${m}分${s > 0 ? s + '秒' : ''}`;
  return `${s}秒`;
}

function saveSessionTime(secs, catAnswers) {
  if (!secs || secs < 3) return;
  const today = getLocalDateStr();
  const log = loadStudyLog();
  if (!log[today]) log[today] = { answered: 0, correct: 0, secs: 0, cats: {} };
  if (!log[today].cats) log[today].cats = {};
  log[today].secs = (log[today].secs || 0) + secs;
  const totalAns = Object.values(catAnswers).reduce((s, n) => s + n, 0);
  for (const [cat, cnt] of Object.entries(catAnswers)) {
    if (!log[today].cats[cat]) log[today].cats[cat] = { answered: 0, secs: 0 };
    // answered は recordStudyActivity で即時保存するためここでは更新しない
    if (totalAns > 0) log[today].cats[cat].secs = (log[today].cats[cat].secs || 0) + Math.round(secs * cnt / totalAns);
  }
  saveStudyLog(log);
}

// ========== Session Records（成績履歴） ==========
function loadSessionRecords() {
  try { return JSON.parse(localStorage.getItem(SESSION_RECORDS_KEY) || '[]'); }
  catch { return []; }
}
function saveSessionRecords(records) {
  localStorage.setItem(SESSION_RECORDS_KEY, JSON.stringify(records));
}

function saveSessionRecord() {
  const hist = state.sessionHistory;
  if (!hist || hist.length === 0) return;

  const record = {
    ts:            Date.now(),
    mode:          state.mode,
    total:         state.sessionStats.total,
    correct:       state.sessionStats.correct,
    questionCount: hist.length,
    byCategory:    {},
    byYear:        {},
  };

  const addTo = (obj, key, qTotal, qCorrect, isQCorrect) => {
    if (!key) return;
    if (!obj[key]) obj[key] = { total: 0, correct: 0, questions: 0, correctQ: 0 };
    obj[key].total    += qTotal;
    obj[key].correct  += qCorrect;
    obj[key].questions++;
    if (isQCorrect) obj[key].correctQ++;
  };

  hist.forEach(entry => {
    const q          = entry.question;
    const qTotal     = entry.isCalcMode ? 1 : (entry.choiceResults?.length || 0);
    const qCorrect   = entry.isCalcMode
      ? (entry.choiceResults[0]?.isRight ? 1 : 0)
      : (entry.choiceResults || []).filter(r => r.isRight).length;
    const isQCorrect = entry.isCalcMode
      ? (entry.choiceResults[0]?.isRight ?? false)
      : (entry.choiceResults || []).every(r => r.isRight);

    addTo(record.byCategory, q.category || '不明', qTotal, qCorrect, isQCorrect);
    addTo(record.byYear,     q.year     || null,   qTotal, qCorrect, isQCorrect);
  });

  const records = loadSessionRecords();
  records.unshift(record);
  if (records.length > 300) records.splice(300);
  saveSessionRecords(records);
}

function flushSessionTime() {
  if (!sessionStartTime) return;
  const secs = Math.round((Date.now() - sessionStartTime) / 1000);
  saveSessionTime(secs, sessionCatAnswers);
  sessionStartTime = null;
  sessionCatAnswers = {};
}

function startSessionTimer() {
  sessionStartTime = Date.now();
  sessionCatAnswers = {};
}

function scheduleMidnightReset() {
  const now = new Date();
  const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
  const msUntil = nextMidnight - now;
  setTimeout(() => {
    updateHeaderStats();
    renderCalendar();
    scheduleMidnightReset();
  }, msUntil);
}

// 連続学習日数。今日がまだ未学習でも、昨日までの連続を維持して返す（朝に0表示で萎えないように）
function computeStreak() {
  const log = loadStudyLog();
  const cur = new Date();
  const todayStr = getLocalDateStr(cur);
  if (!(log[todayStr] && log[todayStr].answered > 0)) {
    cur.setDate(cur.getDate() - 1); // 今日まだなら昨日から数える
  }
  let streak = 0;
  while (true) {
    const ds = getLocalDateStr(cur);
    if (log[ds] && log[ds].answered > 0) { streak++; cur.setDate(cur.getDate() - 1); }
    else break;
  }
  return streak;
}

function updateHeaderStats() {
  const log          = loadStudyLog();
  const todayStr     = getLocalDateStr();
  const entry        = log[todayStr] || {};
  // 外部学習（他アプリ等）の当日分を加算。※「今日の学習」表示のみ（週間/月間/タグ集計には含めない）。
  const extQ         = externalTodayQuestions();                                     // 外部学習（問）
  const todayChoices = (entry.answered || 0) + extQ * 5;                             // 外部は1問=5選択肢換算
  const todayQs      = (entry.questions || Math.floor((entry.answered || 0) / 5)) + extQ;

  const tierCls = todayChoices >= 250 ? 'hd-tier-diamond'
                : todayChoices >= 200 ? 'hd-tier-platinum'
                : todayChoices >= 150 ? 'hd-tier-gold'
                : todayChoices >= 100 ? 'hd-tier-silver'
                : todayChoices >=  50 ? 'hd-tier-copper'
                : '';

  const TIER_CLASSES = ['hd-tier-copper','hd-tier-silver','hd-tier-gold','hd-tier-platinum','hd-tier-diamond'];
  const statsEl  = document.getElementById('hd-today-stats');
  const headerEl = document.querySelector('.app-header');
  [statsEl, headerEl].forEach(el => {
    if (!el) return;
    el.classList.remove(...TIER_CLASSES);
    if (tierCls) el.classList.add(tierCls);
  });

  const iconEl = document.getElementById('hd-logo-icon');
  if (iconEl) iconEl.textContent = tierCls ? '🏆' : '🔥';

  const choicesEl = document.getElementById('hd-today-choices');
  const qsEl      = document.getElementById('hd-today-qs');
  if (choicesEl) choicesEl.textContent = todayChoices;
  if (qsEl)      qsEl.textContent      = todayQs;

  const nextMsg = document.getElementById('hd-next-tier-msg');
  if (nextMsg) {
    const remaining = todayChoices >= 250 ? 0
                    : todayChoices >= 200 ? 250 - todayChoices
                    : todayChoices >= 150 ? 200 - todayChoices
                    : todayChoices >= 100 ? 150 - todayChoices
                    : todayChoices >=  50 ? 100 - todayChoices
                    :                       50  - todayChoices;
    nextMsg.textContent = remaining > 0 ? `次のステータスまで後${remaining}問` : '';
  }

  // ストリーク（連続学習日数）をヘッダーに常時表示
  const streak   = computeStreak();
  const streakEl = document.getElementById('hd-streak');
  if (streakEl) {
    if (streak >= 2) { streakEl.textContent = `🔥${streak}日連続`; streakEl.classList.remove('hidden'); }
    else streakEl.classList.add('hidden');
  }

  updateStudyCardTier();
}

// ========== 外部学習の実績（他アプリ等・問単位のみ） ==========
// 「今日の学習」表示にのみ加算する。studyLog（週間/月間/タグ集計）には一切書き込まない。
const EXTERNAL_STUDY_KEY = 'gas_external_study_v1';
function loadExternalStudy() {
  try { const a = JSON.parse(localStorage.getItem(EXTERNAL_STUDY_KEY) || '[]'); return Array.isArray(a) ? a : []; }
  catch { return []; }
}
function saveExternalStudy(list) {
  try { localStorage.setItem(EXTERNAL_STUDY_KEY, JSON.stringify(list)); } catch {}
}
// 当日分の外部学習「問」の合計
function externalTodayQuestions() {
  const today = getLocalDateStr();
  return loadExternalStudy().filter(e => e.date === today).reduce((s, e) => s + (e.questions || 0), 0);
}
function addExternalStudy(n) {
  const list = loadExternalStudy();
  list.push({ id: 'ext_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6), date: getLocalDateStr(), questions: n, ts: Date.now() });
  saveExternalStudy(list);
}
function editExternalStudy(id, n) {
  const list = loadExternalStudy();
  const e = list.find(x => x.id === id);
  if (e) { e.questions = n; saveExternalStudy(list); }
}
function deleteExternalStudy(id) {
  saveExternalStudy(loadExternalStudy().filter(x => x.id !== id));
}

function _extStudyError(msg) {
  const el = document.getElementById('external-study-error');
  if (!el) return;
  if (msg) { el.textContent = msg; el.classList.remove('hidden'); }
  else { el.textContent = ''; el.classList.add('hidden'); }
}
// 入力値を検証して正の整数を返す（不正なら null）
function _parseExtStudyValue(raw) {
  const s = (raw || '').trim();
  if (!/^\d+$/.test(s)) return null;
  const n = parseInt(s, 10);
  return n > 0 ? n : null;
}
function renderExternalStudyModal() {
  const today  = getLocalDateStr();
  const todays = loadExternalStudy().filter(e => e.date === today).sort((a, b) => a.ts - b.ts);
  const total  = todays.reduce((s, e) => s + (e.questions || 0), 0);
  const totalEl = document.getElementById('external-study-total');
  if (totalEl) totalEl.textContent = total;
  const listEl = document.getElementById('external-study-list');
  if (!listEl) return;
  listEl.innerHTML = '';
  if (todays.length === 0) {
    listEl.innerHTML = '<div style="font-size:.78rem;color:var(--text-3);">本日の入力はまだありません。</div>';
    return;
  }
  todays.forEach(e => {
    const t   = new Date(e.ts);
    const tstr = `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;
    const row = document.createElement('div');
    row.className = 'ext-study-row';
    const label = document.createElement('span');
    label.className = 'ext-study-label';
    label.textContent = `${tstr}　${e.questions}問`;
    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-ghost btn-sm';
    editBtn.textContent = '✏️';
    editBtn.title = '修正';
    editBtn.addEventListener('click', () => {
      const input = prompt('問題数を修正（0より大きい整数）', String(e.questions));
      if (input === null) return;
      const n = _parseExtStudyValue(input);
      if (n === null) { alert('0より大きい整数を入力してください。'); return; }
      editExternalStudy(e.id, n);
      updateHeaderStats();
      renderExternalStudyModal();
    });
    const delBtn = document.createElement('button');
    delBtn.className = 'btn btn-danger btn-sm';
    delBtn.textContent = '🗑';
    delBtn.title = '削除';
    delBtn.addEventListener('click', () => {
      if (!confirm(`この入力（${e.questions}問）を削除しますか？`)) return;
      deleteExternalStudy(e.id);
      updateHeaderStats();
      renderExternalStudyModal();
    });
    row.append(label, editBtn, delBtn);
    listEl.appendChild(row);
  });
}
function openExternalStudyModal() {
  // データポップアップを閉じる
  document.getElementById('hd-popup-data')?.classList.add('hidden');
  document.getElementById('hd-popup-backdrop')?.classList.add('hidden');
  document.getElementById('btn-hd-data')?.classList.remove('active');
  const input = document.getElementById('external-study-input');
  if (input) input.value = '';
  _extStudyError('');
  renderExternalStudyModal();
  document.getElementById('modal-external-study')?.classList.remove('hidden');
}

// ========== Notes ==========
function loadNotes() {
  try { return JSON.parse(localStorage.getItem(NOTES_KEY) || '{}'); }
  catch { return {}; }
}
function saveNote(qId, text) {
  const notes = loadNotes();
  if (text.trim()) notes[qId] = text;
  else delete notes[qId];
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}
function getNote(qId) {
  return loadNotes()[qId] || '';
}

let _memoDebounceTimer = null;
function onMemoInput(qId, text) {
  clearTimeout(_memoDebounceTimer);
  _memoDebounceTimer = setTimeout(() => {
    saveNote(qId, text);
    // 📝バッジ更新
    const badge = document.getElementById('memo-has-badge');
    if (badge) badge.classList.toggle('hidden', !text.trim());
  }, 500);
}

function recordAnswer(choiceId, isCorrect) {
  if (_checkNoProgressRecord) return; // 編集後再チェック時は state.progress を更新しない
  const p = state.progress[choiceId] || { attempts: 0, correct: 0, history: [] };
  if (!Array.isArray(p.history)) p.history = [];
  // 今回の回答を積む前に、既に5連続到達済みならロックを確定させる。
  // （locked 未設定の既存データが、この回答で不正解になっても5連続扱いを維持できるようにする）
  lockIfMastered(p);
  // 正答率まわり（attempts/correct/history）はロック後も毎回そのまま加算・減算する
  p.attempts++;
  if (isCorrect) p.correct++;
  p.history.push(isCorrect);
  if (p.history.length > 5) p.history.shift();
  // 今回の回答で5連続に到達したらロック
  lockIfMastered(p);
  p.lastDate = new Date().toISOString().slice(0, 10);
  state.progress[choiceId] = p;
  saveProgress();
}

// ========== Data Loading ==========
async function loadQuestionsFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try { resolve(JSON.parse(e.target.result)); }
      catch { reject(new Error('JSONの解析に失敗しました')); }
    };
    reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'));
    reader.readAsText(file, 'UTF-8');
  });
}

function mergeQuestions(data, setName) {
  const existingIndex = {};
  state.questions.forEach((q, i) => { existingIndex[q.id] = i; });
  let added = 0, updated = 0;
  (data.questions || []).forEach(q => {
    const idx = existingIndex[q.id];
    if (idx === undefined) {
      state.questions.push({ ...q, _setName: setName });
      existingIndex[q.id] = state.questions.length - 1;
      added++;
    } else {
      // 既存エントリを上書き（_setName は既存を優先、なければ新setName）
      const prevSetName = state.questions[idx]._setName || setName;
      state.questions[idx] = { ...q, _setName: prevSetName };
      updated++;
    }
  });
  saveQuestions();
  buildFilters();
  updateHomeStats();
  return { added, updated };
}

function deleteQuestion(id) {
  state.questions = state.questions.filter(q => q.id !== id);
  saveQuestions();
  updateHomeStats();
}

function deleteAllQuestions() {
  state.questions = [];
  saveQuestions();
  buildFilters();
  updateHomeStats();
}

function deleteQuestionsBySet(setName) {
  state.questions = state.questions.filter(q => (q._setName || 'その他') !== setName);
  saveQuestions();
  buildFilters();
  updateHomeStats();
}

// ========== Filters ==========

/**
 * 和暦年度文字列を西暦数値に変換（年度ソート用）
 * 令和7年度→2025, 令和元年度→2019, 平成30年度→2018, 分野別:…→0
 */
function yearToNumber(yearStr) {
  if (!yearStr) return 0;
  if (yearStr.startsWith('分野別')) return 0;
  const m = yearStr.match(/(令和|平成|昭和|大正|明治)(元|\d+)年/);
  if (!m) return 0;
  const ERA = { '令和': 2018, '平成': 1988, '昭和': 1925, '大正': 1911, '明治': 1867 };
  const n = m[2] === '元' ? 1 : parseInt(m[2]);
  return (ERA[m[1]] || 0) + n;
}

/** 年度配列を新しい順（降順）にソートして返す */
function sortYearsDesc(years) {
  return [...years].sort((a, b) => yearToNumber(b) - yearToNumber(a));
}

function buildFilters() {
  const categories = [...new Set(state.questions.map(q => q.category))]
    .sort((a, b) => a.localeCompare(b, 'ja'));

  // 有効なカテゴリのみ残す。何もなければ全選択
  const validCats = new Set(categories);
  const stillValid = new Set([...state.activeCategories].filter(c => validCats.has(c)));
  state.activeCategories = stillValid; // 空 = 全カテゴリ対象（getFilteredQuestions で処理）

  renderCategoryFilter(categories);
  refreshSubFilters();
  renderTopFilterCard();
}

// カテゴリチップのみ描画（縦1列レイアウト）
function renderCategoryFilter(categories) {
  const catEl = document.getElementById('filter-categories');
  catEl.innerHTML = '';

  if (categories.length === 0) {
    catEl.style.cssText = '';
    catEl.innerHTML = '<span style="color:var(--text-3);font-size:.85rem;">問題データがありません</span>';
    return;
  }

  catEl.style.cssText =
    'display:flex;flex-direction:column;align-items:stretch;gap:6px;margin-bottom:4px;';

  const makeBtn = (cat) => {
    const btn = makeChip(displayCategoryName(cat), () => {
      if (state.activeCategories.has(cat)) state.activeCategories.delete(cat);
      else state.activeCategories.add(cat);
      btn.classList.toggle('active', state.activeCategories.has(cat));
      refreshSubFilters();
      updateHomeStats();
    });
    btn.classList.toggle('active', state.activeCategories.has(cat));
    return btn;
  };

  // CATEGORY_ORDER 定義順で並べ、未定義のカテゴリは末尾に50音順
  const sorted = sortCategories(categories);
  sorted.forEach(cat => catEl.appendChild(makeBtn(cat)));
}

// 選択中カテゴリに応じて年度・分野チップを再構築
function refreshSubFilters() {
  const years    = new Set();
  const sections = new Set();

  state.questions
    .filter(q => state.activeCategories.has(q.category))
    .forEach(q => {
      if (q.year)    years.add(q.year);
      if (q.section) sections.add(q.section);
    });

  // 年度: 全選択、分野: 全解除
  state.activeYears    = new Set(years);
  state.activeSections = new Set();

  const sortedYears = sortYearsDesc([...years]);
  const sortedSections = sortSections([...sections]);

  renderSubFilterPanel(sortedYears, sortedSections);
  updateSubPanelVisibility();
  renderHashtagFilter();
}

// 年度・分野チップを描画
function renderSubFilterPanel(years, sections) {
  const yearEl = document.getElementById('filter-years');
  if (yearEl) {
    yearEl.innerHTML = '';
    if (years.length === 0) {
      yearEl.innerHTML = '<span style="color:var(--text-3);font-size:.85rem;">年度情報がありません</span>';
    } else {
      years.forEach(year => {
        const btn = makeChip(year, () => {
          if (state.activeYears.has(year)) state.activeYears.delete(year);
          else state.activeYears.add(year);
          btn.classList.toggle('active', state.activeYears.has(year));
        });
        btn.classList.add('active');
        yearEl.appendChild(btn);
      });
    }
  }

  const secEl = document.getElementById('filter-sections');
  if (secEl) {
    secEl.innerHTML = '';
    if (sections.length === 0) {
      secEl.innerHTML = '<span style="color:var(--text-3);font-size:.85rem;">分野情報がありません</span>';
    } else {
      sections.forEach(sec => {
        const btn = makeChip(sec, () => {
          if (state.activeSections.has(sec)) state.activeSections.delete(sec);
          else state.activeSections.add(sec);
          btn.classList.toggle('active', state.activeSections.has(sec));
        });
        btn.classList.toggle('active', state.activeSections.has(sec));
        secEl.appendChild(btn);
      });
    }
  }
}

// ハッシュタグフィルターを描画
function renderHashtagFilter() {
  const allTags = getAllTags();
  const panel   = document.getElementById('filter-tag-panel');
  if (!panel) return;

  if (allTags.length === 0) {
    panel.classList.add('hidden');
    return;
  }
  panel.classList.remove('hidden');

  const tagsEl = document.getElementById('filter-tags');
  if (!tagsEl) return;
  tagsEl.innerHTML = '';

  allTags.forEach(tag => {
    const btn = makeChip('#' + tag, () => {
      if (state.activeTags.has(tag)) state.activeTags.delete(tag);
      else state.activeTags.add(tag);
      btn.classList.toggle('active', state.activeTags.has(tag));
      updateHomeStats();
    });
    btn.classList.toggle('active', state.activeTags.has(tag));
    tagsEl.appendChild(btn);
  });
}

// カテゴリが1つ以上選択されていればサブパネルを表示
function updateSubPanelVisibility() {
  const panel = document.getElementById('filter-sub-panel');
  if (!panel) return;
  panel.classList.toggle('hidden', state.activeCategories.size === 0);
}


// タグを 数字 → 英字 → 50音 の順にソート（先頭の # は無視してタグ本体で比較）
function sortTagsJa(tags) {
  const key = t => String(t).replace(/^#+/, '');
  const bucket = s => /^[0-9]/.test(s) ? 0 : /^[A-Za-z]/.test(s) ? 1 : 2; // 数字/英字/かな・漢字
  return [...tags].sort((a, b) => {
    const sa = key(a), sb = key(b);
    const ba = bucket(sa), bb = bucket(sb);
    if (ba !== bb) return ba - bb;
    if (ba === 0) { const d = parseFloat(sa) - parseFloat(sb); if (d) return d; }
    return sa.localeCompare(sb, 'ja');
  });
}

// かな1文字を清音ひらがなに畳む（カタカナ→ひらがな・濁点/半濁点除去・小書き→大書き）。
// かなでなければ null を返す。
function foldKanaChar(ch) {
  if (!ch) return null;
  let code = ch.charCodeAt(0);
  let h = ch;
  if (code >= 0x30A1 && code <= 0x30F6) { h = String.fromCharCode(code - 0x60); code = h.charCodeAt(0); } // カタカナ→ひらがな
  if (!(code >= 0x3041 && code <= 0x3096)) return null; // ひらがな範囲外＝かなでない
  h = h.normalize('NFD').replace(/[゙゚]/g, '').normalize('NFC'); // 濁点・半濁点除去
  const small = { 'ぁ':'あ','ぃ':'い','ぅ':'う','ぇ':'え','ぉ':'お','っ':'つ','ゃ':'や','ゅ':'ゆ','ょ':'よ','ゎ':'わ','ゕ':'か','ゖ':'け' };
  return small[h] || h;
}

// タグ本体（先頭#除去）を得る
function tagKey(tag) { return String(tag).replace(/^#+/, ''); }

// タグの「頭文字グループ」キー。
//  数字→'0-9' / 英字→'A-Z' / かな→清音ひらがな頭文字（ガ→か 等）
//  漢字等→読みキャッシュ(tagReadings)があればその頭文字、無ければその文字（＝暫定「その他」）。
function tagGroupKey(tag) {
  const s = tagKey(tag);
  if (!s) return '';
  const ch = s[0];
  if (/[0-9]/.test(ch)) return '0-9';
  if (/[A-Za-z]/.test(ch)) return 'A-Z';
  const folded = foldKanaChar(ch);
  if (folded) return folded;
  const r = tagReadings[s];           // 漢字等：登録された読み（ふりがな）の頭文字で分類
  if (r) { const rf = foldKanaChar(r[0]); if (rf) return rf; }
  return ch;                          // 読み未登録 → その文字（＝「その他」）
}

// タグを行（ぎょう）グループへ分類。数字/英字/あ〜わ行/その他(漢字等)。
const TAG_GYO_ORDER = ['0-9','A-Z','あ行','か行','さ行','た行','な行','は行','ま行','や行','ら行','わ行','その他'];
const _GYO_MAP = {
  'あ':'あ行','い':'あ行','う':'あ行','え':'あ行','お':'あ行',
  'か':'か行','き':'か行','く':'か行','け':'か行','こ':'か行',
  'さ':'さ行','し':'さ行','す':'さ行','せ':'さ行','そ':'さ行',
  'た':'た行','ち':'た行','つ':'た行','て':'た行','と':'た行',
  'な':'な行','に':'な行','ぬ':'な行','ね':'な行','の':'な行',
  'は':'は行','ひ':'は行','ふ':'は行','へ':'は行','ほ':'は行',
  'ま':'ま行','み':'ま行','む':'ま行','め':'ま行','も':'ま行',
  'や':'や行','ゆ':'や行','よ':'や行',
  'ら':'ら行','り':'ら行','る':'ら行','れ':'ら行','ろ':'ら行',
  'わ':'わ行','を':'わ行','ん':'わ行',
};
function tagGyo(tag) {
  const k = tagGroupKey(tag);
  if (k === '0-9' || k === 'A-Z') return k;
  return _GYO_MAP[k] || 'その他';
}

// ===== 漢字タグの読み（ふりがな）：ユーザーが手動登録し、五十音の行分類に使う =====
// （kuromojiでの自動解析は実機で不安定だったため廃止。読みは手入力で登録する）
const TAG_READINGS_KEY = 'gas_tag_readings_v1';
let tagReadings = {};            // { タグ本体: 読み（ふりがな。ひらがな/カタカナ） }
function loadTagReadings() {
  try { tagReadings = JSON.parse(localStorage.getItem(TAG_READINGS_KEY) || '{}') || {}; }
  catch { tagReadings = {}; }
}
function saveTagReadings() {
  try { localStorage.setItem(TAG_READINGS_KEY, JSON.stringify(tagReadings)); } catch {}
}
// タグの読みを登録/更新（空なら削除）。並び順に反映されるので保存後は再描画側で更新。
function setTagReading(tag, reading) {
  const s = tagKey(tag);
  const r = (reading || '').trim();
  if (r) tagReadings[s] = r;
  else delete tagReadings[s];
  saveTagReadings();
}
// タグが「読み登録が有効なもの（漢字始まり等）」か。数字/英字/かな始まりは読み不要。
function tagNeedsReading(tag) {
  const ch = tagKey(tag)[0] || '';
  return !(/[0-9A-Za-z]/.test(ch) || foldKanaChar(ch));
}

function getAllTags() {
  const tags = new Set();
  state.questions.forEach(q => (q.tags || []).forEach(t => tags.add(t)));
  return sortTagsJa(tags);
}

// 検索クエリを単語に分割（半角/全角スペース区切り）。各語の先頭 # は除去。
// 大文字小文字の元表記を保持（タグ登録に使うため）。
function searchWords(query) {
  return (query || '').trim().split(/[\s　]+/).map(w => w.replace(/^#+/, '')).filter(Boolean);
}
// 1語が問題にマッチするか（本文・分野・年度・出典・選択肢・タグを対象・大文字小文字無視）
function questionMatchesWord(q, word) {
  const w = (word || '').toLowerCase();
  if (!w) return false;
  const fields = [q.body, q.section, q.subcategory, q.year, q.source,
    ...(q.choices || []).map(c => c.text || ''),
    ...(q.tags || [])];
  return fields.some(f => f && f.toLowerCase().includes(w));
}
function matchesSearch(q, query) {
  const words = searchWords(query);
  if (words.length === 0) return true;
  return words.some(w => questionMatchesWord(q, w));   // スペース区切り = OR 検索
}

function getFilteredQuestions() {
  return state.questions.filter(q => {
    const calcOk = !state.calcFilter || q.questionType === 'calculation';
    // 計算問題モードでもカテゴリ（基礎／ガス技術：供給 等）で絞り込めるようにする。
    // 以前は calcFilter 時に catOk を常に true にしていたため、計算問題は科目で分けられなかった。
    const catOk  = state.activeCategories.size === 0 || state.activeCategories.has(q.category);
    const yearOk = state.activeYears.size === 0    || (q.year    && state.activeYears.has(q.year));
    const secOk  = state.activeSections.size === 0 || (q.section && state.activeSections.has(q.section));
    const tagOk  = state.activeTags.size === 0 || (q.tags || []).some(t => state.activeTags.has(t));
    return calcOk && catOk && yearOk && secOk && tagOk;
  });
}

// ========== 検索ワードの一括タグ付与（保存済み問題管理画面） ==========
// 「保存済み問題を管理」画面で現在表示中（検索＋フィルター適用後）の問題集合を返す。
// renderQuestionList（6063行）の絞り込みと同一条件にすること。
function currentQlistDisplayed() {
  return state.questions.filter(q => {
    if (!matchesSearch(q, qlistSearchQuery)) return false;
    if (qlistFilterCats.size > 0 && !qlistFilterCats.has(q.category)) return false;
    if (qlistFilterBookmark && !questionHasAnyBookmark(q)) return false;
    if (qlistFilterTags.size > 0 && !q.tags?.some(t => qlistFilterTags.has(t))) return false;
    return true;
  });
}

// 検索ボックス下の「一括タグ登録」ボタン/パネルを描画（検索語がある時のみ表示）
function renderBulkTagArea() {
  const area = document.getElementById('qlist-bulk-tag-area');
  if (!area) return;
  const words = searchWords(qlistSearchQuery);
  const displayed = words.length > 0 ? currentQlistDisplayed() : [];
  if (words.length === 0 || displayed.length === 0) {
    area.classList.add('hidden');
    area.innerHTML = '';
    return;
  }
  area.classList.remove('hidden');
  area.innerHTML = '';
  const btn = document.createElement('button');
  btn.className = 'btn btn-outline btn-sm';
  btn.textContent = '🏷 検索ワードをタグとして一括登録';
  btn.addEventListener('click', () => onBulkTagClick(words, displayed));
  area.appendChild(btn);
}

function onBulkTagClick(words, displayed) {
  if (words.length === 1) {
    const w = words[0];
    const cnt = displayed.filter(q => questionMatchesWord(q, w)).length;
    if (confirm(`${cnt}件の問題に「${w}」タグを付与します。\n（すでに付いている問題はスキップします）\n\nよろしいですか？`)) {
      applyBulkTag([w], displayed);
    }
    return;
  }
  // OR検索：どのワードをタグ登録するかを選ぶパネルを開く
  openBulkTagPanel(words, displayed);
}

function openBulkTagPanel(words, displayed) {
  const area = document.getElementById('qlist-bulk-tag-area');
  if (!area) return;
  area.innerHTML = '';
  const panel = document.createElement('div');
  panel.className = 'bulk-tag-panel';

  const title = document.createElement('div');
  title.className = 'bulk-tag-panel-title';
  title.textContent = '🏷 タグとして登録するワードを選択（各問題にはヒットしたワードのみ付与）';
  panel.appendChild(title);

  const checks = [];
  words.forEach(w => {
    const cnt = displayed.filter(q => questionMatchesWord(q, w)).length;
    const label = document.createElement('label');
    label.className = 'bulk-tag-word';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = true;
    cb.value = w;
    checks.push(cb);
    const span = document.createElement('span');
    span.textContent = ` 「${w}」（${cnt}問）`;
    label.append(cb, span);
    panel.appendChild(label);
  });

  const btnRow = document.createElement('div');
  btnRow.className = 'bulk-tag-panel-btns';
  const applyBtn = document.createElement('button');
  applyBtn.className = 'btn btn-primary btn-sm';
  applyBtn.textContent = '一括登録';
  applyBtn.addEventListener('click', () => {
    const selected = checks.filter(c => c.checked).map(c => c.value);
    if (selected.length === 0) { alert('登録するワードを1つ以上選んでください。'); return; }
    const summary = selected
      .map(w => `・「${w}」→ ${displayed.filter(q => questionMatchesWord(q, w)).length}問`)
      .join('\n');
    if (confirm(`以下のタグを、実際にヒットした問題にのみ付与します。\n${summary}\n（すでに付いている問題はスキップ）\n\nよろしいですか？`)) {
      applyBulkTag(selected, displayed);
    }
  });
  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'btn btn-ghost btn-sm';
  cancelBtn.textContent = 'キャンセル';
  cancelBtn.addEventListener('click', renderBulkTagArea);
  btnRow.append(applyBtn, cancelBtn);
  panel.appendChild(btnRow);
  area.appendChild(panel);
}

// 選択ワードを、実際にヒットした問題にのみタグ付与（重複はスキップ）
function applyBulkTag(words, displayed) {
  let taggedQ = 0, added = 0;
  displayed.forEach(q => {
    if (!Array.isArray(q.tags)) q.tags = [];
    let changed = false;
    words.forEach(w => {
      if (questionMatchesWord(q, w) && !q.tags.includes(w)) {
        q.tags.push(w);
        added++;
        changed = true;
      }
    });
    if (changed) taggedQ++;
  });
  if (added > 0) {
    saveQuestions();
    if (typeof buildFilters === 'function') buildFilters();
    if (typeof renderTagStudyArea === 'function') renderTagStudyArea();
    renderQuestionList(getToggleOpenState('questions-container'));
  } else {
    renderBulkTagArea();
  }
  alert(added > 0
    ? `タグを付与しました（対象 ${taggedQ}問・新規タグ ${added}件）`
    : 'すべて既にタグ付与済みでした（新規なし）。');
}

// ========== Diamond Calendar Medal ==========
// カレンダー用ダイヤモンドティアメダル（SVG文字列を生成）
// 起動時に一度だけ静的パスを計算しキャッシュする
const _DMC = (() => {
  const CX=50, CY=50, N=16;
  const R_OUT=44, R_GRD=32, R_TAB=22, R_STAR_OUT=17, R_STAR_IN=10, R_GEM=5;
  const R_FLAT = R_OUT * 0.92;
  const f = (v) => v.toFixed(2);
  const _pt = (cx,cy,r,deg) => { const a=deg*Math.PI/180; return [cx+r*Math.cos(a), cy+r*Math.sin(a)]; };

  // 星型ポリゴン（コーナー突出・辺中点凹み）
  const _starPts = (cx,cy,rT,rF,n) => Array.from({length:n},(_,i)=>{
    const [xt,yt]=_pt(cx,cy,rT,-90+i*360/n);
    const [xf,yf]=_pt(cx,cy,rF,-90+(i+.5)*360/n);
    return `${f(xt)},${f(yt)} ${f(xf)},${f(yf)}`;
  }).join(' ');

  const FIDS = ['f0','f1','f2','f3','f4','f5','f6','f7','f8','f9','f10','f11','f12','f13','f14','f15'];
  let outer='', inner='';
  for(let i=0;i<N;i++){
    const a1=-90+i*360/N, a2=-90+(i+1)*360/N, am=(a1+a2)/2;
    const [x1,y1]=_pt(CX,CY,R_OUT,a1),[x2,y2]=_pt(CX,CY,R_OUT,a2),[x3,y3]=_pt(CX,CY,R_GRD,am);
    outer+=`<polygon points="${f(x1)},${f(y1)} ${f(x2)},${f(y2)} ${f(x3)},${f(y3)}" fill="url(#dmc-${FIDS[i%16]})" stroke="rgba(255,255,255,.5)" stroke-width=".7"/>`;
    const [xi1,yi1]=_pt(CX,CY,R_GRD,a1),[xi2,yi2]=_pt(CX,CY,R_GRD,a2),[xi3,yi3]=_pt(CX,CY,R_TAB,am);
    inner+=`<polygon points="${f(xi1)},${f(yi1)} ${f(xi2)},${f(yi2)} ${f(xi3)},${f(yi3)}" fill="url(#dmc-${FIDS[(i+8)%16]})" stroke="rgba(255,255,255,.4)" stroke-width=".5" opacity=".8"/>`;
  }
  let starPts='';
  for(let i=0;i<16;i++){ const r=i%2===0?R_STAR_OUT:R_STAR_IN; const [x,y]=_pt(CX,CY,r,i*360/16-90); starPts+=`${f(x)},${f(y)} `; }

  return {
    outer, inner,
    starPts: starPts.trim(),
    rim:  _starPts(CX,CY,R_OUT+1.2,R_FLAT+1.2,N),
    body: _starPts(CX,CY,R_OUT,R_FLAT,N),
    edge: _starPts(CX,CY,R_OUT,R_FLAT,N),
    CX, CY, R_GRD, R_TAB, R_GEM,
  };
})();

function _makeDiamondCalCell(d) {
  const { outer, inner, starPts, rim, body, edge, CX, CY, R_GRD, R_GEM } = _DMC;
  const fs = d >= 10 ? 36 : 44;
  const delay = -((d % 5)); // 5パターン: 0s, -1s, -2s, -3s, -4s
  return `<svg viewBox="0 0 100 100" width="34" height="34" style="display:block;overflow:visible;animation-delay:${delay}s" aria-label="${d}">` +
    `<g filter="url(#dmc-glow)">` +
    `<polygon points="${rim}" fill="#b8d0ee"/>` +
    `<polygon points="${body}" fill="url(#dmc-body)"/>` +
    outer + inner +
    `<circle cx="${CX}" cy="${CY}" r="${_DMC.R_TAB}" fill="url(#dmc-body)" opacity=".55"/>` +
    `<polygon points="${starPts}" fill="url(#dmc-star)" filter="url(#dmc-star-glow)" stroke="rgba(255,255,255,.7)" stroke-width=".6"/>` +
    `<circle cx="${CX}" cy="${CY}" r="${R_GEM}" fill="url(#dmc-gem)" stroke="rgba(255,255,255,.9)" stroke-width=".8"/>` +
    `<circle cx="${CX-1.5}" cy="${CY-1.5}" r="1.8" fill="white" opacity=".55"/>` +
    `<polygon points="${edge}" fill="none" stroke="url(#dmc-rim)" stroke-width="2"/>` +
    `<circle cx="${CX}" cy="${CY}" r="${R_GRD}" fill="none" stroke="rgba(255,255,255,.25)" stroke-width=".5"/>` +
    `</g>` +
    `<text x="${CX}" y="${CY+2}" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" font-weight="900" font-family="sans-serif" fill="url(#dmc-num-grad)" letter-spacing="-.5" filter="url(#dmc-num-glow)">${d}</text>` +
    `</svg>`;
}

// ========== Silver Calendar Medal ==========
const _SVC = (() => {
  const CX=50, CY=50;
  const f = v => v.toFixed(2);
  const _pt = (cx,cy,r,deg) => { const a=deg*Math.PI/180; return [cx+r*Math.cos(a), cy+r*Math.sin(a)]; };

  // 外縁ノッチ（コインエッジ）
  const N_NOTCH = 60;
  let notchPts = '';
  for(let i=0; i<N_NOTCH; i++){
    const r = i%2===0 ? 44 : 42.2;
    const [x,y] = _pt(CX, CY, r, i*360/N_NOTCH - 90);
    notchPts += `${f(x)},${f(y)} `;
  }

  // 月桂樹の葉（U字型アーク：銅と同じ構成）
  const N_LEAF = 22;
  const ARC_START = 115, ARC_END = 425;
  const R_WREATH = 30;
  let leaves = '';
  for(let i=0; i<N_LEAF; i++){
    const angle = ARC_START + i * (ARC_END - ARC_START) / (N_LEAF - 1);
    const [lx, ly] = _pt(CX, CY, R_WREATH, angle);
    const rot = angle + 90 + (i%2===0 ? -15 : 15);
    leaves += `<ellipse cx="${f(lx)}" cy="${f(ly)}" rx="2" ry="3.6" fill="url(#slv-leaf)" transform="rotate(${f(rot)},${f(lx)},${f(ly)})" opacity=".86"/>`;
  }

  const torchPath =
    'M 48,65 L 47.5,51 C 46,47 45,44 46.5,42 L 53.5,42 C 55,44 54,47 52.5,51 L 52,65 Z';
  const flameOuter =
    'M 50,42 C 46.5,38 43,31 47,25 C 48.5,30 50,33 50,37 C 50,33 51.5,30 53,25 C 57,31 53.5,38 50,42 Z';
  const flameInner =
    'M 50,42 C 48.5,37 48,33 49.5,28 C 50,31 50.5,36 50,42 Z';

  return { CX, CY, notchPts: notchPts.trim(), leaves, torchPath, flameOuter, flameInner };
})();

function _makeSilverCalCell(d) {
  const { CX, CY } = _SVC;
  const fs = d >= 10 ? 36 : 44;
  return `<svg viewBox="0 0 100 100" width="34" height="34" style="display:block;overflow:visible" aria-label="${d}">` +
    `<g filter="url(#slv-glow)">` +
    `<circle cx="${CX}" cy="${CY}" r="44" fill="url(#slv-rim)"/>` +
    `<circle cx="${CX}" cy="${CY}" r="40" fill="url(#slv-body)"/>` +
    // 外側段落ち
    `<circle cx="${CX}" cy="${CY}" r="39.5" fill="none" stroke="rgba(40,50,65,.70)" stroke-width="1.8"/>` +
    `<circle cx="${CX}" cy="${CY}" r="37.8" fill="none" stroke="rgba(200,215,235,.50)" stroke-width="1.0"/>` +
    // 数字エリアを囲む段落ちリング
    `<circle cx="${CX}" cy="${CY}" r="26" fill="none" stroke="rgba(35,45,60,.35)" stroke-width="1.5"/>` +
    `<circle cx="${CX}" cy="${CY}" r="24.4" fill="none" stroke="rgba(195,210,230,.30)" stroke-width=".8"/>` +
    // 光沢ハイライト
    `<ellipse cx="44" cy="41" rx="9" ry="5" fill="white" opacity=".07" transform="rotate(-20,44,41)"/>` +
    `</g>` +
    `<text x="${CX}" y="${CY+2}" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" font-weight="900" font-family="sans-serif" fill="url(#slv-num-grad)" letter-spacing="-.5" filter="url(#slv-num-glow)">${d}</text>` +
    `</svg>`;
}

// ========== Bronze Calendar Medal ==========
const _BZC = (() => {
  const CX=50, CY=50;
  const f = v => v.toFixed(2);
  const _pt = (cx,cy,r,deg) => { const a=deg*Math.PI/180; return [cx+r*Math.cos(a), cy+r*Math.sin(a)]; };

  // 外縁ノッチ（コインエッジ：60角形）
  const N_NOTCH = 60;
  let notchPts = '';
  for(let i=0; i<N_NOTCH; i++){
    const r = i%2===0 ? 44 : 42.2;
    const [x,y] = _pt(CX, CY, r, i*360/N_NOTCH - 90);
    notchPts += `${f(x)},${f(y)} `;
  }

  // 月桂樹の葉（U字型アーク：115°〜425°、上部が開く）
  const N_LEAF = 22;
  const ARC_START = 115, ARC_END = 425;
  const R_WREATH = 30;
  let leaves = '';
  for(let i=0; i<N_LEAF; i++){
    const angle = ARC_START + i * (ARC_END - ARC_START) / (N_LEAF - 1);
    const [lx, ly] = _pt(CX, CY, R_WREATH, angle);
    const rot = angle + 90 + (i%2===0 ? -15 : 15);
    leaves += `<ellipse cx="${f(lx)}" cy="${f(ly)}" rx="2" ry="3.6" fill="url(#bze-leaf)" transform="rotate(${f(rot)},${f(lx)},${f(ly)})" opacity=".86"/>`;
  }

  // トーチ本体（柄+カップ）
  const torchPath =
    'M 48,65 L 47.5,51 C 46,47 45,44 46.5,42 L 53.5,42 C 55,44 54,47 52.5,51 L 52,65 Z';

  // 炎（外側）
  const flameOuter =
    'M 50,42 C 46.5,38 43,31 47,25 C 48.5,30 50,33 50,37 C 50,33 51.5,30 53,25 C 57,31 53.5,38 50,42 Z';

  // 炎（内側ハイライト）
  const flameInner =
    'M 50,42 C 48.5,37 48,33 49.5,28 C 50,31 50.5,36 50,42 Z';

  return { CX, CY, notchPts: notchPts.trim(), leaves, torchPath, flameOuter, flameInner };
})();

function _makeBronzeCalCell(d) {
  const { CX, CY } = _BZC;
  const fs = d >= 10 ? 36 : 44;
  return `<svg viewBox="0 0 100 100" width="34" height="34" style="display:block;overflow:visible" aria-label="${d}">` +
    `<g filter="url(#bze-glow)">` +
    // 外縁リム（丸）
    `<circle cx="${CX}" cy="${CY}" r="44" fill="url(#bze-rim)"/>` +
    // メダル本体
    `<circle cx="${CX}" cy="${CY}" r="40" fill="url(#bze-body)"/>` +
    // 外側段落ち
    `<circle cx="${CX}" cy="${CY}" r="39.5" fill="none" stroke="rgba(40,18,5,.72)" stroke-width="1.8"/>` +
    `<circle cx="${CX}" cy="${CY}" r="37.8" fill="none" stroke="rgba(220,130,45,.50)" stroke-width="1.0"/>` +
    // 数字エリアを囲む段落ちリング
    `<circle cx="${CX}" cy="${CY}" r="26" fill="none" stroke="rgba(35,15,5,.38)" stroke-width="1.5"/>` +
    `<circle cx="${CX}" cy="${CY}" r="24.4" fill="none" stroke="rgba(215,125,40,.30)" stroke-width=".8"/>` +
    // 光沢ハイライト
    `<ellipse cx="44" cy="41" rx="9" ry="5" fill="white" opacity=".10" transform="rotate(-20,44,41)"/>` +
    `</g>` +
    `<text x="${CX}" y="${CY+2}" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" font-weight="900" font-family="sans-serif" fill="url(#bze-num-grad)" letter-spacing="-.5" filter="url(#bze-num-glow)">${d}</text>` +
    `</svg>`;
}

// ========== Gold Calendar Medal ==========
const _GMC = (() => {
  const CX=50, CY=50;
  const f = v => v.toFixed(2);
  const _pt = (cx,cy,r,deg) => { const a=deg*Math.PI/180; return [cx+r*Math.cos(a), cy+r*Math.sin(a)]; };

  // 外縁ノッチ（コインエッジ：60角形）
  const N_NOTCH = 60;
  let notchPts = '';
  for(let i=0; i<N_NOTCH; i++){
    const r = i%2===0 ? 44 : 42.2;
    const [x,y] = _pt(CX, CY, r, i*360/N_NOTCH - 90);
    notchPts += `${f(x)},${f(y)} `;
  }

  // 月桂樹の葉（金色）
  const N_LEAF = 24;
  const R_WREATH = 34.5;
  let leaves = '';
  for(let i=0; i<N_LEAF; i++){
    const angle = i * 360/N_LEAF - 90;
    const [lx, ly] = _pt(CX, CY, R_WREATH, angle);
    const rot = angle + 90 + (i%2===0 ? -15 : 15);
    leaves += `<ellipse cx="${f(lx)}" cy="${f(ly)}" rx="2.1" ry="3.9" fill="url(#gld-leaf)" transform="rotate(${f(rot)},${f(lx)},${f(ly)})" opacity=".88"/>`;
  }

  // フェニックス（鳳凰）: 翼を広げて上昇するシルエット
  // 翼端 x=22〜78 / 頭 y=33 / 尾 y=66
  const phoenixPath =
    'M 50,34 L 53,37 ' +
    'C 60,33 70,27 75,28 ' +   // 右翼先端へ
    'C 70,36 63,41 57,45 ' +   // 右翼戻り
    'L 54,48 ' +
    'C 53,52 53,57 55,63 ' +   // 右尾羽
    'L 50,66 ' +               // 尾中央
    'L 45,63 ' +               // 左尾羽
    'C 47,57 47,52 46,48 ' +
    'L 43,45 ' +
    'C 37,41 30,36 25,28 ' +   // 左翼戻り
    'C 30,27 40,33 47,37 Z';   // 左翼先端から頭へ

  // 炎（尾の下）
  const flamePath = 'M 50,63 C 47,67 44,72 50,75 C 56,72 53,67 50,63 Z';

  return { CX, CY, leaves, notchPts: notchPts.trim(), phoenixPath, flamePath };
})();

function _makeGoldCalCell(d) {
  const { CX, CY, phoenixPath, flamePath } = _GMC;
  const fs = d >= 10 ? 36 : 44;
  return `<svg viewBox="0 0 100 100" width="34" height="34" style="display:block;overflow:visible" aria-label="${d}">` +
    `<g filter="url(#gld-glow)">` +
    // 外縁リム（丸）
    `<circle cx="${CX}" cy="${CY}" r="44" fill="url(#gld-rim)"/>` +
    // メダル本体（ゴールド）
    `<circle cx="${CX}" cy="${CY}" r="40" fill="url(#gld-body)"/>` +
    // 段落ちライン（暗い溝＋明るいエッジで立体的な彫刻感）
    `<circle cx="${CX}" cy="${CY}" r="39.5" fill="none" stroke="rgba(60,40,0,.75)" stroke-width="1.8"/>` +
    `<circle cx="${CX}" cy="${CY}" r="37.8" fill="none" stroke="rgba(255,215,60,.55)" stroke-width="1.0"/>` +
    // 内側リング（フレーム）
    `<circle cx="${CX}" cy="${CY}" r="27" fill="rgba(255,210,0,.07)" stroke="rgba(190,148,0,.60)" stroke-width="1.3"/>` +
    // フェニックス本体
    `<path d="${phoenixPath}" fill="url(#gld-phx)" filter="url(#gld-phx-glow)" stroke="rgba(255,240,120,.5)" stroke-width=".4"/>` +
    // 頭（小円）
    `<circle cx="${CX}" cy="36" r="3.5" fill="url(#gld-phx)" filter="url(#gld-phx-glow)"/>` +
    // 炎
    `<path d="${flamePath}" fill="url(#gld-flame)" opacity=".95"/>` +
    // 光沢ハイライト
    `<ellipse cx="44" cy="41" rx="9" ry="5" fill="white" opacity=".11" transform="rotate(-20,44,41)"/>` +
    `</g>` +
    // 数字（前面）
    `<text x="${CX}" y="${CY+2}" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" font-weight="900" font-family="sans-serif" fill="url(#gld-num-grad)" letter-spacing="-.5" filter="url(#gld-num-glow)">${d}</text>` +
    `</svg>`;
}

// ========== Platinum Calendar Medal ==========
const _PMC = (() => {
  const CX=50, CY=50;
  const f = v => v.toFixed(2);
  const _pt = (cx,cy,r,deg) => { const a=deg*Math.PI/180; return [cx+r*Math.cos(a), cy+r*Math.sin(a)]; };

  // 外縁ノッチ（コインのミリング：60角形で交互に半径変化）
  const N_NOTCH = 60;
  let notchPts = '';
  for(let i=0; i<N_NOTCH; i++){
    const r = i%2===0 ? 44 : 42.2;
    const [x,y] = _pt(CX, CY, r, i*360/N_NOTCH - 90);
    notchPts += `${f(x)},${f(y)} `;
  }

  // 月桂樹の葉（楕円を輪状に配置、左右交互に傾ける）
  const N_LEAF = 24;
  const R_WREATH = 34.5;
  let leaves = '';
  for(let i=0; i<N_LEAF; i++){
    const angle = i * 360/N_LEAF - 90;
    const [lx, ly] = _pt(CX, CY, R_WREATH, angle);
    const rot = angle + 90 + (i%2===0 ? -15 : 15);
    leaves += `<ellipse cx="${f(lx)}" cy="${f(ly)}" rx="2.1" ry="3.9" fill="url(#ptm-leaf)" transform="rotate(${f(rot)},${f(lx)},${f(ly)})" opacity=".86"/>`;
  }

  // 16点星（8長+8短、コンパスローズ型）
  let starPts = '';
  for(let i=0; i<16; i++){
    const r = i%2===0 ? 20 : 9;
    const [x,y] = _pt(CX, CY, r, i*360/16 - 90);
    starPts += `${f(x)},${f(y)} `;
  }

  return { CX, CY, leaves, starPts: starPts.trim(), notchPts: notchPts.trim() };
})();

function _makePlatinumCalCell(d) {
  const { CX, CY, leaves, starPts, notchPts } = _PMC;
  const fs = d >= 10 ? 36 : 44;
  return `<svg viewBox="0 0 100 100" width="34" height="34" style="display:block;overflow:visible" aria-label="${d}">` +
    `<g filter="url(#ptm-glow)">` +
    // 外縁ノッチ（コインエッジ）
    `<polygon points="${notchPts}" fill="url(#ptm-rim-grad)"/>` +
    // メダル本体
    `<circle cx="${CX}" cy="${CY}" r="40" fill="url(#ptm-body)"/>` +
    // 内縁ライン（彫刻感）
    `<circle cx="${CX}" cy="${CY}" r="38.5" fill="none" stroke="rgba(180,205,230,.45)" stroke-width=".8"/>` +
    // 月桂樹の葉
    leaves +
    // 月桂樹内側のリング
    `<circle cx="${CX}" cy="${CY}" r="27" fill="rgba(240,248,255,.10)" stroke="rgba(165,195,225,.68)" stroke-width="1.3"/>` +
    // 16点星（コンパスローズ）
    `<polygon points="${starPts}" fill="url(#ptm-star)" filter="url(#ptm-star-glow)" stroke="rgba(255,255,255,.55)" stroke-width=".5"/>` +
    // 星の中心ハイライト
    `<circle cx="${CX}" cy="${CY}" r="4" fill="white" opacity=".68"/>` +
    // 左上光沢ハイライト（CX=50,CY=50 → 44, 41）
    `<ellipse cx="44" cy="41" rx="9" ry="5" fill="white" opacity=".14" transform="rotate(-20,44,41)"/>` +
    `</g>` +
    // 数字（前面）
    `<text x="${CX}" y="${CY+2}" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" font-weight="900" font-family="sans-serif" fill="url(#ptm-num-grad)" letter-spacing="-.5" filter="url(#ptm-num-glow)">${d}</text>` +
    `</svg>`;
}

// ========== Queue Building ==========
function avgAccuracy(q) {
  const accs = q.choices
    .map(c => state.progress[c.id])
    .filter(p => p && p.attempts > 0)
    .map(p => p.correct / p.attempts);
  if (accs.length === 0) return -1;
  return accs.reduce((a, b) => a + b, 0) / accs.length;
}

/**
 * 苦手優先スコア（小さいほど優先して出題）
 *
 * 直近3回の問題レベル history (q.id + ':q') を基に判定:
 *   0.00〜0.66  直近に不正解あり（不正解が多いほど低い = 優先）
 *   0.50        未回答（直近不正解問題の後、全正解問題の前）
 *   1.00〜1.50  直近すべて正解（全体正答率で微調整）
 */
function weakScore(q) {
  const p = state.progress[q.id + ':q'];
  const history = (p && Array.isArray(p.history)) ? p.history : [];

  if (history.length === 0) return 0.5; // 未回答

  const incorrectCount = history.filter(h => !h).length;
  if (incorrectCount === 0) {
    // 直近すべて正解 → 後回し。全体正答率が低い順に並べる
    const overall = avgAccuracy(q);
    return 1.0 + (overall >= 0 ? (1 - overall) * 0.5 : 0.5);
  }

  // 直近の不正解率（0=全不正解が最優先、0.33, 0.67の順）
  return (history.length - incorrectCount) / history.length;
}

function buildQueue(questions, mode) {
  let qs = [...questions];
  if (mode === 'random') {
    for (let i = qs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [qs[i], qs[j]] = [qs[j], qs[i]];
    }
  } else if (mode === 'weak') {
    // 直近に不正解がある問題のみ（未回答・直近全正解は除外）
    qs = qs.filter(q => weakScore(q) < 0.5);
    qs.sort((a, b) => weakScore(a) - weakScore(b));
  } else if (mode === 'strong') {
    // 直近2回以上正解している問題のみ
    qs = qs.filter(q => {
      const history = state.progress[q.id + ':q']?.history || [];
      return history.filter(h => h).length >= 2;
    });
    // 正解数多い順 → 同数なら全体正答率高い順
    qs.sort((a, b) => {
      const cA = (state.progress[a.id + ':q']?.history || []).filter(h => h).length;
      const cB = (state.progress[b.id + ':q']?.history || []).filter(h => h).length;
      if (cB !== cA) return cB - cA;
      return avgAccuracy(b) - avgAccuracy(a);
    });
  } else {
    // sequential: 年度↓新しい順 → 問番号順
    qs.sort((a, b) => {
      const yearCmp = yearToNumber(b.year) - yearToNumber(a.year);
      if (yearCmp !== 0) return yearCmp;
      return getQNum(a) - getQNum(b);
    });
  }
  return qs;
}

// ========== Screens ==========
function showScreen(name) {
  _resetInlineEditState();   // 画面を離れるときはインライン編集を畳む（保存はしない）
  // ヘッダーポップアップをすべて閉じる
  document.querySelectorAll('.hd-popup').forEach(p => p.classList.add('hidden'));
  document.querySelectorAll('[id^="btn-hd-"]').forEach(b => b.classList.remove('active'));
  const backdrop = document.getElementById('hd-popup-backdrop');
  if (backdrop) backdrop.classList.add('hidden');

  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById('screen-' + name).classList.remove('hidden');
}

// ========== Result Screen Keyboard Navigation ==========
/** リザルト画面で表示中のボタン一覧を返す */
function getResultBtns() {
  return ['btn-retry-wrong-q','btn-retry-wrong-c','btn-again','btn-to-home-from-result']
    .map(id => document.getElementById(id))
    .filter(el => el && !el.classList.contains('hidden'));
}

/** リザルト画面のキーボードフォーカスを初期化（最初のボタンを選択） */
function initResultFocus() {
  resultFocusIndex = 0;
  applyResultFocus();
}

/** resultFocusIndex に合わせてクラスを付け替える */
function applyResultFocus() {
  const btns = getResultBtns();
  btns.forEach((btn, i) => btn.classList.toggle('result-kb-focus', i === resultFocusIndex));
}

// ========== Home Screen ==========
function updateHomeStats() {
  const total        = state.questions.length;
  const totalChoices = state.questions.reduce((s, q) => s + (q.choices ? q.choices.length : 0), 0);
  const attempted    = Object.keys(state.progress).length;
  const filtered     = getFilteredQuestions();
  const el = document.getElementById('home-stats');
  if (!el) return;
  const isFiltered = filtered.length < total;
  el.innerHTML = isFiltered
    ? `フィルター中: <strong style="color:var(--primary-light)">${filtered.length}</strong> 問 ／ 全 ${total} 問 ／ 学習済み: <strong>${attempted}</strong> 件`
    : `問題数: <strong>${total}</strong> 問 ／ 選択肢数: <strong>${totalChoices}</strong> 件 ／ 学習済み: <strong>${attempted}</strong> 件`;
}

// ========== Create Question ==========
function openCreateModal() {
  const modal = document.getElementById('modal-create-q');

  // カテゴリ選択肢を更新
  const catSelect = document.getElementById('create-category');
  const cats = sortCategories([...new Set(state.questions.map(q => q.category).filter(Boolean))]);
  catSelect.innerHTML = '<option value="">選択してください</option>'
    + cats.map(c => `<option value="${c}">${c}</option>`).join('')
    + '<option value="__new__">── 新規入力 ──</option>';

  // 年度サジェスト
  const yearList = document.getElementById('create-year-list');
  const years = sortYearsDesc([...new Set(state.questions.map(q => q.year).filter(Boolean))]);
  yearList.innerHTML = years.map(y => `<option value="${y}">`).join('');

  // 入力クリア
  document.getElementById('create-year').value    = '';
  document.getElementById('create-source').value  = '';
  document.getElementById('create-section').value = '';
  document.getElementById('create-question-text').value = '';
  document.getElementById('create-q-error').classList.add('hidden');

  // デフォルト選択肢 5つ
  createChoicesList = Array.from({length: 5}, () => ({ text: '', isCorrect: false }));
  renderCreateChoicesList();

  modal.classList.remove('hidden');
  setTimeout(() => catSelect.focus(), 50);
}

function renderCreateChoicesList() {
  const LABELS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
  const container = document.getElementById('create-choices-list');
  container.innerHTML = '';

  createChoicesList.forEach((choice, i) => {
    const row = document.createElement('div');
    row.className = 'create-choice-row';

    const label = document.createElement('span');
    label.className = 'create-choice-label';
    label.textContent = LABELS[i] || String(i + 1);

    const ta = document.createElement('textarea');
    ta.className = 'create-choice-text';
    ta.rows = 2;
    ta.placeholder = `選択肢 ${LABELS[i] || i + 1} の文章`;
    ta.value = choice.text;
    ta.addEventListener('input', e => { createChoicesList[i].text = e.target.value; });

    const marubtn = document.createElement('button');
    marubtn.className = 'create-judge-btn' + (choice.isCorrect ? ' correct' : '');
    marubtn.textContent = '○';
    marubtn.title = '正しい';
    marubtn.addEventListener('click', () => {
      createChoicesList[i].isCorrect = true;
      renderCreateChoicesList();
    });

    const batsubtn = document.createElement('button');
    batsubtn.className = 'create-judge-btn' + (!choice.isCorrect ? ' incorrect' : '');
    batsubtn.textContent = '×';
    batsubtn.title = '誤り';
    batsubtn.addEventListener('click', () => {
      createChoicesList[i].isCorrect = false;
      renderCreateChoicesList();
    });

    const removeBtn = document.createElement('button');
    removeBtn.className = 'create-remove-btn';
    removeBtn.textContent = '🗑';
    removeBtn.title = 'この選択肢を削除';
    removeBtn.addEventListener('click', () => {
      createChoicesList.splice(i, 1);
      renderCreateChoicesList();
    });

    row.append(label, ta, marubtn, batsubtn, removeBtn);
    container.appendChild(row);
  });
}

function saveCreateQuestion() {
  const errorEl = document.getElementById('create-q-error');
  errorEl.classList.add('hidden');

  let category = document.getElementById('create-category').value;
  if (category === '__new__') {
    category = prompt('新しいカテゴリ名を入力してください:') || '';
  }
  if (!category.trim()) {
    errorEl.textContent = 'カテゴリを選択または入力してください';
    errorEl.classList.remove('hidden'); return;
  }
  if (createChoicesList.length < 2) {
    errorEl.textContent = '選択肢は2つ以上必要です';
    errorEl.classList.remove('hidden'); return;
  }
  const emptyChoice = createChoicesList.findIndex(c => !c.text.trim());
  if (emptyChoice >= 0) {
    errorEl.textContent = `選択肢 ${['a','b','c','d','e','f'][emptyChoice]} の文章が空です`;
    errorEl.classList.remove('hidden'); return;
  }

  const year    = document.getElementById('create-year').value.trim();
  const source  = document.getElementById('create-source').value.trim();
  const section = document.getElementById('create-section').value.trim();
  const qText   = document.getElementById('create-question-text').value.trim();

  // IDを生成（カテゴリ略称 + タイムスタンプ）
  const catSlug = category.replace(/[^\w぀-ゟ゠-ヿ一-龯]/g, '').slice(0, 6);
  const qId = `custom_${catSlug}_${Date.now()}`;

  const CHOICE_IDS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
  const choices = createChoicesList.map((c, i) => ({
    id: `${qId}-${CHOICE_IDS[i] || i}`,
    text: c.text.trim(),
    isCorrect: c.isCorrect,
  }));

  const newQ = {
    id: qId,
    category: category.trim(),
    ...(year    && { year }),
    ...(source  && { source }),
    ...(section && { section }),
    ...(qText   && { questionText: qText }),
    choices,
    _setName: 'カスタム問題',
  };

  state.questions.push(newQ);
  saveQuestions();
  buildFilters();
  updateHomeStats();

  document.getElementById('modal-create-q').classList.add('hidden');

  // 問題リストを更新して作成した問題が見えるようにする
  qlistSearchQuery = '';
  const searchEl = document.getElementById('qlist-search');
  if (searchEl) searchEl.value = '';
  renderQuestionList();

  // 軽く通知
  const btn = document.getElementById('btn-create-q');
  const orig = btn?.textContent;
  if (btn) { btn.textContent = '✅ 作成しました'; setTimeout(() => { btn.textContent = orig; }, 2000); }
}

// ========== Bulk Select ==========
function toggleSelectMode(on) {
  qlistSelectMode = on ?? !qlistSelectMode;
  selectedQIds.clear();
  const bar = document.getElementById('qlist-select-bar');
  const btn = document.getElementById('btn-select-mode');
  if (bar) bar.classList.toggle('hidden', !qlistSelectMode);
  if (btn) btn.classList.toggle('active', qlistSelectMode);
  updateSelectBar();
  renderQuestionList(getToggleOpenState('questions-container'));
}

function updateSelectBar() {
  const count      = selectedQIds.size;
  const countEl    = document.getElementById('qlist-select-count');
  const delBtn     = document.getElementById('btn-delete-selected');
  const bulkBtn    = document.getElementById('btn-bulk-edit');
  const allCb      = document.getElementById('qlist-select-all');
  if (countEl) countEl.textContent = `${count}問 選択中`;
  if (delBtn)  delBtn.disabled = count === 0;
  if (bulkBtn) bulkBtn.disabled = count === 0;
  // グループチェックボックスの状態を同期
  document.querySelectorAll('.qlist-group-cb').forEach(cb => {
    const ids = (cb.dataset.groupIds || '').split(',').filter(Boolean);
    const allSel = ids.every(id => selectedQIds.has(id));
    const anySel = ids.some(id => selectedQIds.has(id));
    cb.checked = allSel;
    cb.indeterminate = !allSel && anySel;
  });
  // 全選択チェックボックスの状態
  const visibleIds = qlistNavQueue;
  if (allCb && visibleIds.length > 0) {
    allCb.checked       = visibleIds.every(id => selectedQIds.has(id));
    allCb.indeterminate = !allCb.checked && visibleIds.some(id => selectedQIds.has(id));
  }
}

function deleteSelectedQuestions() {
  if (selectedQIds.size === 0) return;
  if (!confirm(`選択した ${selectedQIds.size} 問を削除しますか？`)) return;
  state.questions = state.questions.filter(q => !selectedQIds.has(q.id));
  selectedQIds.clear();
  saveQuestions();
  buildFilters();
  updateHomeStats();
  toggleSelectMode(false);
  renderQuestionList();
}

// ========== Bulk Edit ==========
function openBulkEditModal() {
  if (selectedQIds.size === 0) return;
  const modal = document.getElementById('modal-bulk-edit');

  document.getElementById('bulk-edit-desc').textContent = `${selectedQIds.size}問を一括編集します`;

  // 全チェックをリセット
  ['year','category','section','subcategory'].forEach(f => {
    document.getElementById(`bulk-chk-${f}`).checked = false;
    const inputs = document.getElementById(`bulk-inputs-${f}`);
    if (inputs) inputs.classList.remove('bulk-inputs-active');
  });
  ['year','section','subcategory'].forEach(f => {
    const clrCb = document.getElementById(`bulk-clear-${f}`);
    const inp   = document.getElementById(`bulk-${f}`);
    if (clrCb) clrCb.checked = false;
    if (inp)   { inp.value = ''; inp.disabled = false; }
  });
  document.getElementById('bulk-category').value = '';

  // 年度サジェスト
  const years = sortYearsDesc([...new Set(state.questions.map(q => q.year).filter(Boolean))]);
  document.getElementById('bulk-year-list').innerHTML = years.map(y => `<option value="${y}">`).join('');

  // カテゴリ選択肢
  const catSel = document.getElementById('bulk-category');
  const cats = sortCategories([...new Set(state.questions.map(q => q.category).filter(Boolean))]);
  catSel.innerHTML = '<option value="">選択してください</option>'
    + cats.map(c => `<option value="${c}">${c}</option>`).join('');

  // 分野サジェスト
  const sections = [...new Set(state.questions.map(q => q.section).filter(Boolean))].sort();
  document.getElementById('bulk-section-list').innerHTML = sections.map(s => `<option value="${s}">`).join('');

  document.getElementById('bulk-edit-error').classList.add('hidden');

  // チェックボックスで入力欄のenabled/disabledを制御
  ['year','category','section','subcategory'].forEach(f => {
    const chk    = document.getElementById(`bulk-chk-${f}`);
    const inputs = document.getElementById(`bulk-inputs-${f}`);
    if (!chk || !inputs) return;
    const setActive = () => {
      const on = chk.checked;
      inputs.classList.toggle('bulk-inputs-active', on);
      inputs.querySelectorAll('input,select').forEach(el => el.disabled = !on);
    };
    setActive();
    chk.onchange = setActive;
  });

  // 「空欄にする」チェックで入力テキストをdisable
  ['year','section','subcategory'].forEach(f => {
    const clrCb = document.getElementById(`bulk-clear-${f}`);
    const inp   = document.getElementById(`bulk-${f}`);
    if (!clrCb || !inp) return;
    clrCb.onchange = () => { inp.disabled = clrCb.checked; };
  });

  modal.classList.remove('hidden');
}

function applyBulkEdit() {
  const errEl = document.getElementById('bulk-edit-error');
  errEl.classList.add('hidden');

  const fields = {
    year:        { chk: document.getElementById('bulk-chk-year').checked,        clr: document.getElementById('bulk-clear-year')?.checked,        val: document.getElementById('bulk-year').value.trim() },
    category:    { chk: document.getElementById('bulk-chk-category').checked,    clr: false,                                                       val: document.getElementById('bulk-category').value },
    section:     { chk: document.getElementById('bulk-chk-section').checked,     clr: document.getElementById('bulk-clear-section')?.checked,     val: document.getElementById('bulk-section').value.trim() },
    subcategory: { chk: document.getElementById('bulk-chk-subcategory').checked, clr: document.getElementById('bulk-clear-subcategory')?.checked, val: document.getElementById('bulk-subcategory').value.trim() },
  };

  // 1つ以上チェックされているか
  if (!Object.values(fields).some(f => f.chk)) {
    errEl.textContent = '変更する項目を1つ以上チェックしてください。';
    errEl.classList.remove('hidden');
    return;
  }

  // カテゴリが有効か
  if (fields.category.chk && !fields.category.val) {
    errEl.textContent = 'カテゴリを選択してください。';
    errEl.classList.remove('hidden');
    return;
  }

  state.questions.forEach(q => {
    if (!selectedQIds.has(q.id)) return;
    if (fields.year.chk) {
      if (fields.year.clr || !fields.year.val) delete q.year;
      else q.year = fields.year.val;
    }
    if (fields.category.chk && fields.category.val) {
      q.category = fields.category.val;
    }
    if (fields.section.chk) {
      if (fields.section.clr || !fields.section.val) delete q.section;
      else q.section = fields.section.val;
    }
    if (fields.subcategory.chk) {
      if (fields.subcategory.clr || !fields.subcategory.val) delete q.subcategory;
      else q.subcategory = fields.subcategory.val;
    }
  });

  saveQuestions();
  buildFilters();
  updateHomeStats();
  document.getElementById('modal-bulk-edit').classList.add('hidden');
  toggleSelectMode(false);
  renderQuestionList();
}

// ========== JSON Editor ==========
let _jsonEditorDebounce = null;

function openJsonEditor() {
  const modal  = document.getElementById('modal-json-editor');
  const select = document.getElementById('json-edit-set-select');
  if (!modal || !select) return;

  // セット一覧を構築
  const sets = [...new Set(state.questions.map(q => q._setName || 'デフォルト問題'))].sort();
  select.innerHTML = sets.map(s =>
    `<option value="${s.replace(/"/g, '&quot;')}">${s}</option>`
  ).join('');

  // 最初のセットを表示
  if (sets.length > 0) loadJsonForSet(sets[0]);

  document.getElementById('json-editor-status').classList.add('hidden');
  modal.classList.remove('hidden');
}

function loadJsonForSet(setName) {
  const questions = state.questions
    .filter(q => (q._setName || 'デフォルト問題') === setName)
    .map(({ _setName, ...rest }) => rest); // _setName を除いてクリーンなJSON

  const json = JSON.stringify({ title: setName, questions }, null, 2);
  const ta   = document.getElementById('json-editor-area');
  ta.value   = json;
  updateJsonEditorStatus(json);
  document.getElementById('json-editor-charcount').textContent =
    `${json.length.toLocaleString()} 文字 / ${questions.length} 問`;
}

function updateJsonEditorStatus(jsonText) {
  const statusEl = document.getElementById('json-editor-status');
  const applyBtn = document.getElementById('json-editor-apply');
  try {
    const parsed = JSON.parse(jsonText);
    const qs = parsed.questions || (Array.isArray(parsed) ? parsed : null);
    if (!qs) throw new Error('"questions" 配列が見つかりません');
    const noId = qs.findIndex(q => !q.id);
    if (noId >= 0) throw new Error(`questions[${noId}] に "id" がありません`);
    // OK
    statusEl.textContent = `✅ 有効なJSON — ${qs.length} 問`;
    statusEl.className   = 'json-editor-status json-editor-ok';
    statusEl.classList.remove('hidden');
    applyBtn.disabled    = false;
  } catch (e) {
    statusEl.textContent = `❌ ${e.message}`;
    statusEl.className   = 'json-editor-status json-editor-err';
    statusEl.classList.remove('hidden');
    applyBtn.disabled    = true;
  }
}

function applyJsonEdit() {
  const select  = document.getElementById('json-edit-set-select');
  const setName = select.value;
  const ta      = document.getElementById('json-editor-area');
  let parsed;
  try { parsed = JSON.parse(ta.value); }
  catch (e) { alert('JSONの解析に失敗しました: ' + e.message); return; }

  const newQs = (parsed.questions || (Array.isArray(parsed) ? parsed : null));
  if (!newQs) { alert('"questions" 配列が見つかりません'); return; }

  // 対象セットを置き換え
  const other    = state.questions.filter(q => (q._setName || 'デフォルト問題') !== setName);
  const replaced = newQs.map(q => ({ ...q, _setName: setName }));
  state.questions = [...other, ...replaced];
  saveQuestions();
  buildFilters();
  updateHomeStats();

  document.getElementById('modal-json-editor').classList.add('hidden');
  alert(`「${setName}」を更新しました（${replaced.length} 問）`);
}

// ========== Top Filter Card ==========
// カテゴリ名（両形式対応）→ グリッド位置・CSS クラスのマッピング
const TOP_CAT_MAP = [
  { test: c => c === '法令',             col: 1, row: 1, span: 3, cls: 'law'  },
  { test: c => c.includes('製造'),        col: 2, row: 1, span: 1, cls: 'gas'  },
  { test: c => c.includes('供給'),        col: 2, row: 2, span: 1, cls: 'gas'  },
  { test: c => c.includes('消費'),        col: 2, row: 3, span: 1, cls: 'gas'  },
  { test: c => c === '基礎',             col: 3, row: 1, span: 3, cls: 'kiso' },
];

function getTopCatLayout() {
  const existing = new Set(state.questions.map(q => q.category));
  const result = [];
  TOP_CAT_MAP.forEach(def => {
    const cat = [...existing].find(c => def.test(c));
    if (cat) result.push({ ...def, cat });
  });
  return result;
}

// 履歴配列の末尾からの連続正解数（履歴は最大5）
function histStreak(h) {
  const a = Array.isArray(h) ? h : [];
  let s = 0;
  for (let i = a.length - 1; i >= 0; i--) { if (a[i] === true) s++; else break; }
  return s;
}

// ===== 連続正解のロック =====
// 5連続正解に到達した採点単位は progress エントリに locked を立て、以後 **連続正解数を5で固定** する。
// 一度ダイヤティア（=全採点単位が5連続）に到達した年度・分野は、その後に不正解しても表示が下がらない。
// ロックするのは「連続正解（=ティア・マスター・習熟度バケット）」だけで、
// attempts / correct / history（正答率・直近5回ドット）は通常どおり毎回加算・減算される。
const STREAK_LOCK_AT = 5;

/**
 * progress エントリの「ロック考慮」連続正解数を返す。
 * locked が立っていれば以後の不正解に関係なく 5 を返す。
 * locked 未設定の既存データでも、現在の履歴が5連続なら5扱い（移行なしで整合）。
 */
function entryStreak(p) {
  if (!p) return 0;
  const s = histStreak(p.history);
  if (p.locked || s >= STREAK_LOCK_AT) return STREAK_LOCK_AT;
  return s;
}

/** 5連続に到達していればロックを立てる（既に locked なら維持）。立てたら true */
function lockIfMastered(p) {
  if (p && !p.locked && histStreak(p.history) >= STREAK_LOCK_AT) { p.locked = true; return true; }
  return false;
}

// 選択肢の直近連続正解数（ロック考慮）
function choiceStreak(c) {
  return entryStreak(state.progress[c?.id]);
}
/**
 * フィルター集計・マスター判定で使う「採点単位」ごとの履歴配列を返す。
 * 1択問題・計算問題 → 問題単位（記録キー q.id+':q'）で1単位。
 * 通常の○✕問題 → 各選択肢（記録キー c.id）で複数単位。
 * （1択問題は選択肢単位ではなく問題単位で正誤が記録されるため、
 *   選択肢idを見ると常に未学習に見えてしまうのを防ぐ）
 */
// ⚠️ 生の history を返すためロック（5連続固定）を反映しない。
//    連続正解・ティア・マスター判定には questionProgressStreaks / entryStreak を使うこと。
function questionProgressHistories(q) {
  if (isOnePickQuestion(q)) {
    return [state.progress[q.id + ':q']?.history];
  }
  return (q.choices || []).filter(c => c.id).map(c => state.progress[c.id]?.history);
}
/** questionProgressHistories と同じ採点単位で progress エントリ（ロック情報込み）を返す */
function questionProgressEntries(q) {
  if (isOnePickQuestion(q)) {
    return [state.progress[q.id + ':q']];
  }
  return (q.choices || []).filter(c => c.id).map(c => state.progress[c.id]);
}
/** 採点単位ごとの「ロック考慮」連続正解数の配列 */
function questionProgressStreaks(q) {
  return questionProgressEntries(q).map(entryStreak);
}
// 1問が直近 n 連続正解済みか（採点単位すべてが n 連続以上・ロック考慮）
function isQuestionMasteredAt(q, n) {
  const ss = questionProgressStreaks(q);
  return ss.length > 0 && ss.every(s => s >= n);
}
// 連続正解数 → ティア（5連続=diamond / 4=platinum / 3=gold / 未満=null）
function tierFromStreak(s) {
  if (s >= 5) return 'diamond';
  if (s === 4) return 'platinum';
  if (s >= 3) return 'gold';
  return null;
}
// progress エントリ → ティア（ロック考慮。5連続到達済みなら以後も diamond を維持）
function streakTierFromEntry(p) {
  return tierFromStreak(entryStreak(p));
}

// フィルター(年度/分野)の達成ティアを判定：全選択肢の直近連続正解数の最小値で決定。
// 5連続=diamond / 4連続=platinum / 3連続=gold / それ未満=null（連続正解ティアのみ）
function filterTier(questions) {
  let any = false, minStreak = Infinity;
  for (const q of (questions || [])) {
    for (const streak of questionProgressStreaks(q)) {   // ロック考慮
      any = true;
      if (streak < minStreak) minStreak = streak;
      if (minStreak < 3) return null;
    }
  }
  if (!any) return null;
  if (minStreak >= 5) return 'diamond';
  if (minStreak >= 4) return 'platinum';
  return 'gold';
}

function isFilterMastered(questions) {
  if (!questions || questions.length === 0) return false;
  let hasAny = false;
  for (const q of questions) {
    for (const streak of questionProgressStreaks(q)) {   // ロック考慮
      hasAny = true;
      if (streak < 3) return false;
    }
  }
  return hasAny;
}

// 1問が直近3連続正解済みか（= その問題はマスター済み・ロック考慮）
function isQuestionMastered(q) {
  const ss = questionProgressStreaks(q);
  if (ss.length === 0) return false;
  return ss.every(s => s >= 3);
}

/**
 * 指定問題群の問題ベース進捗統計を集計する。
 * 問題の連続正解数 = 全採点単位（選択肢 or 問題単位）の最小連続正解数で判定。
 * 5択問題なら全5選択肢がN連続正解して初めてその問題がN連続正解とみなす。
 */
function computeFilterProgress(questions) {
  let total = 0, attempted = 0;
  let e1 = 0, e2 = 0, e3 = 0, e4 = 0, e5 = 0; // ちょうど1/2/3/4/5連続(以上)
  for (const q of (questions || [])) {
    const entries = questionProgressEntries(q);
    if (entries.length === 0) continue;
    total++;
    // 回答済み判定：履歴があるか、ロック済み（5連続到達済み）なら回答済み
    if (entries.some(p => p && (p.locked || (Array.isArray(p.history) && p.history.length > 0)))) attempted++;
    // 問題全体の連続正解数 = 全採点単位の最小値（ロック考慮）
    const minStreak = entries.reduce((min, p) => Math.min(min, entryStreak(p)), Infinity);
    if (minStreak >= 5)       e5++;
    else if (minStreak === 4) e4++;
    else if (minStreak === 3) e3++;
    else if (minStreak === 2) e2++;
    else if (minStreak === 1) e1++;
  }
  const pct = n => total > 0 ? Math.round((n / total) * 100) : 0;
  return {
    total, attempted,
    e1, e2, e3, e4, e5,
    e1p: pct(e1), e2p: pct(e2), e3p: pct(e3), e4p: pct(e4), e5p: pct(e5),
    pAttempted: pct(attempted),
  };
}

/** フィルターアイテム中央の進捗表示HTMLを生成 */
function filterProgressHTML(questions) {
  const s = computeFilterProgress(questions);
  if (s.total === 0) return '';
  if (s.attempted === 0) {
    return `<span class="tfi-progress tfi-progress-empty">未学習</span>`;
  }
  const lg = (cls, label, cnt) =>
    `<span class="tfi-lg ${cls}"><i class="${cls}-fill"></i>${label} ${cnt}問</span>`;
  return `<span class="tfi-progress">
    <span class="tfi-bar">
      <span class="tfi-seg tfi-l5-fill" style="width:${s.e5p}%"></span>
      <span class="tfi-seg tfi-l4-fill" style="width:${s.e4p}%"></span>
      <span class="tfi-seg tfi-l3-fill" style="width:${s.e3p}%"></span>
      <span class="tfi-seg tfi-l2-fill" style="width:${s.e2p}%"></span>
      <span class="tfi-seg tfi-l1-fill" style="width:${s.e1p}%"></span>
    </span>
    <span class="tfi-legend">
      ${lg('tfi-l5', '5連続', s.e5)}
      ${lg('tfi-l4', '4連続', s.e4)}
      ${lg('tfi-l3', '3連続', s.e3)}
      ${lg('tfi-l2', '2連続', s.e2)}
      ${lg('tfi-l1', '1回',   s.e1)}
    </span>
  </span>`;
}

function renderTopFilterCard() {
  const card = document.getElementById('top-filter-card');
  if (!card) return;
  card.innerHTML = '';

  const layout = getTopCatLayout();
  if (layout.length === 0) {
    card.innerHTML = '<p style="color:var(--text-3);font-size:.82rem;text-align:center;padding:8px 0;">問題データを読み込んでください</p>';
    return;
  }

  // ── ラベル ──
  const labelEl = document.createElement('div');
  labelEl.className = 'top-filter-section-label';
  labelEl.textContent = '出題問題フィルター';
  card.appendChild(labelEl);

  // ── カテゴリグリッド ──
  const grid = document.createElement('div');
  grid.className = 'top-cat-grid';

  layout.forEach(({ cat, col, row, span, cls }) => {
    const btn = document.createElement('button');
    btn.className = `top-cat-btn top-cat-${cls}`;
    btn.style.cssText = `grid-column:${col};grid-row:${row}/span ${span};`;
    btn.dataset.cat = cat;
    if (topFilterOpenCat === cat) btn.classList.add('active');

    const nameEl = document.createElement('div');
    nameEl.className = 'top-cat-name';

    if (cls === 'gas') {
      // ガス技術ボタン: 「ガス技術：サブカテゴリ」表記
      const short = cat.replace(/ガス技術[（：（]?/, '').replace(/[）)）]$/, '').trim();
      // 「消費」はデータ上の表記だが、画面上は「消費機器」と表示
      const displayShort = short === '消費' ? '消費機器' : short;
      nameEl.textContent = `ガス技術：${displayShort}`;
      btn.append(nameEl);
    } else {
      nameEl.textContent = cat;
      btn.append(nameEl);
    }
    btn.addEventListener('click', () => onTopFilterCatClick(cat));
    grid.appendChild(btn);
  });

  card.appendChild(grid);

  // ── 計算問題ボタン（登録があれば追加） ──
  const calcQs = state.questions.filter(q => q.questionType === 'calculation');
  if (calcQs.length > 0) {
    const calcBtn = document.createElement('button');
    calcBtn.className = 'top-cat-btn top-cat-calc' + (state.calcFilter ? ' active' : '');
    calcBtn.style.cssText = 'width:100%;margin-top:6px;';
    const nameEl = document.createElement('div');
    nameEl.className = 'top-cat-name';
    nameEl.textContent = `🔢 計算問題（${calcQs.length}問）`;
    calcBtn.appendChild(nameEl);
    calcBtn.addEventListener('click', onCalcFilterClick);
    card.appendChild(calcBtn);
  }

  // ── 論述問題練習ボタン（計算問題ボタンの直下・同じ見た目） ──
  // 科目は「法令」「消費機器」の2つのみ。押すと直下に科目選択ポップアップが開く。
  const essayWrap = document.createElement('div');
  essayWrap.style.cssText = 'position:relative;';

  const essayBtn = document.createElement('button');
  essayBtn.className = 'top-cat-btn top-cat-essay' + (essayPickerOpen ? ' active' : '');
  essayBtn.style.cssText = 'width:100%;margin-top:6px;';
  const essayNameEl = document.createElement('div');
  essayNameEl.className = 'top-cat-name';
  essayNameEl.textContent = '📝 論述問題練習';
  essayBtn.appendChild(essayNameEl);
  essayBtn.addEventListener('click', e => {
    e.stopPropagation();   // 直後の「外側クリックで閉じる」に拾われないように
    essayPickerOpen = !essayPickerOpen;
    renderTopFilterCard();
  });
  essayWrap.appendChild(essayBtn);

  if (essayPickerOpen) {
    const essayPopup = document.createElement('div');
    essayPopup.className = 'top-filter-start-popup is-block';
    essayPopup.addEventListener('click', e => e.stopPropagation());
    ESSAY_CATEGORIES.forEach(cat => {
      const b = document.createElement('button');
      b.className = 'top-filter-start-mode-btn';
      b.textContent = ESSAY_CAT_LABELS[cat] || cat;
      b.addEventListener('click', () => {
        essayPickerOpen = false;
        onEssayCategorySelect(cat);
      });
      essayPopup.appendChild(b);
    });
    essayWrap.appendChild(essayPopup);

    // クリック外で閉じる（出題開始ポップアップと同じ作法）
    setTimeout(() => {
      document.addEventListener('click', function closeEssayPopup() {
        essayPickerOpen = false;
        renderTopFilterCard();
        document.removeEventListener('click', closeEssayPopup);
      }, { once: true });
    }, 0);
  }
  card.appendChild(essayWrap);

  // ── サブパネル（開いているカテゴリがある場合） ──
  if (!topFilterOpenCat) return;

  const sub = document.createElement('div');
  sub.className = 'top-filter-sub';

  // タブ行
  const tabRow = document.createElement('div');
  tabRow.className = 'top-filter-tab-row';

  ['year', 'sec'].forEach(mode => {
    const tab = document.createElement('button');
    tab.className = 'top-filter-tab' + (topFilterSubMode === mode ? ' active' : '');
    if (state.calcFilter) {
      tab.textContent = mode === 'year' ? '📅 年度で絞り込む' : '📂 分野で絞り込む';
    } else {
      tab.textContent = mode === 'year' ? '📅 年度別過去問' : '📂 分野別過去問';
    }
    tab.addEventListener('click', () => { topFilterSubMode = mode; renderTopFilterCard(); });
    tabRow.appendChild(tab);
  });

  // クリア＆出題開始ボタン（計算問題モードでは科目チップだけの選択でも表示する）
  const hasFilter = state.activeYears.size > 0 || state.activeSections.size > 0
    || (state.calcFilter && state.activeCategories.size > 0);
  if (hasFilter) {
    const rightGroup = document.createElement('div');
    rightGroup.style.cssText = 'margin-left:auto;display:flex;gap:6px;align-items:center;position:relative;';

    const clearBtn = document.createElement('button');
    clearBtn.className = 'btn btn-ghost btn-sm';
    clearBtn.textContent = '絞り込みクリア';
    clearBtn.addEventListener('click', () => {
      state.activeYears.clear();
      state.activeSections.clear();
      if (state.calcFilter) state.activeCategories.clear();   // 科目チップも一緒に解除
      topFilterStartOpen = false;
      updateHomeStats();
      renderTopFilterCard();
    });

    const startBtn = document.createElement('button');
    startBtn.className = 'btn btn-primary btn-sm';
    startBtn.textContent = '▶ 出題開始';
    startBtn.addEventListener('click', e => {
      e.stopPropagation();
      topFilterStartOpen = !topFilterStartOpen;
      renderTopFilterCard();
    });

    rightGroup.append(clearBtn, startBtn);

    if (topFilterStartOpen) {
      const popup = document.createElement('div');
      popup.className = 'top-filter-start-popup';
      // ポップアップ内クリックで閉じないように（チェックボックス操作のため）
      popup.addEventListener('click', e => e.stopPropagation());

      // 連続正解を除外（3/4/5連続。同じものを再クリックで解除）
      const exRow = document.createElement('div');
      exRow.className = 'top-filter-exclude-row';
      const exLbl = document.createElement('span');
      exLbl.textContent = '🔥 連続正解を除外';
      const exBtns = document.createElement('div');
      exBtns.className = 'tfx-btns';
      [3, 4, 5].forEach(n => {
        const b = document.createElement('button');
        b.className = 'tfx-btn' + (excludeMasteredStreak === n ? ' active' : '');
        b.textContent = n + '連続';
        b.addEventListener('click', () => {
          excludeMasteredStreak = (excludeMasteredStreak === n) ? 0 : n;
          exBtns.querySelectorAll('.tfx-btn').forEach((bb, i) => bb.classList.toggle('active', [3, 4, 5][i] === excludeMasteredStreak));
        });
        exBtns.appendChild(b);
      });
      exRow.append(exLbl, exBtns);
      popup.appendChild(exRow);

      [
        { mode: 'sequential', label: '📋 出題順'  },
        { mode: 'weak',       label: '⚡ 苦手優先' },
        { mode: 'strong',     label: '⭐ 得意優先' },
        { mode: 'random',     label: '🔀 ランダム' },
      ].forEach(({ mode, label }) => {
        const modeBtn = document.createElement('button');
        modeBtn.className = 'top-filter-start-mode-btn';
        modeBtn.textContent = label;
        modeBtn.addEventListener('click', () => {
          topFilterStartOpen = false;
          startSession(mode, { excludeStreak: excludeMasteredStreak });
        });
        popup.appendChild(modeBtn);
      });

      rightGroup.appendChild(popup);

      // クリック外で閉じる
      setTimeout(() => {
        document.addEventListener('click', function closePopup() {
          topFilterStartOpen = false;
          renderTopFilterCard();
          document.removeEventListener('click', closePopup);
        }, { once: true });
      }, 0);
    }

    tabRow.appendChild(rightGroup);
  }
  sub.appendChild(tabRow);

  // ── 計算問題モード：科目（カテゴリ）で絞り込むチップ行 ──
  // 計算問題は「基礎」「ガス技術：供給」等にまたがるため、年度／分野とは別に科目でも絞れるようにする。
  // タブではなく常時表示のチップにして、科目と年度を同時に見ながら選べるようにしている。
  if (state.calcFilter) {
    const calcCats = [...new Set(
      state.questions.filter(q => q.questionType === 'calculation').map(q => q.category).filter(Boolean)
    )].sort((a, b) => a.localeCompare(b, 'ja'));
    if (calcCats.length > 1) {   // 1科目しかないなら出す意味がない
      const catRow = document.createElement('div');
      catRow.className = 'top-filter-catrow';
      const lbl = document.createElement('span');
      lbl.className = 'top-filter-catrow-label';
      lbl.textContent = '📚 科目';
      catRow.appendChild(lbl);
      calcCats.forEach(cat => {
        const n = state.questions.filter(q => q.questionType === 'calculation' && q.category === cat).length;
        const chip = document.createElement('button');
        chip.className = 'top-filter-catchip' + (state.activeCategories.has(cat) ? ' active' : '');
        chip.textContent = `${displayCategoryName(cat)}（${n}）`;
        chip.addEventListener('click', () => {
          if (state.activeCategories.has(cat)) state.activeCategories.delete(cat);
          else state.activeCategories.add(cat);
          updateHomeStats();
          renderTopFilterCard();
        });
        catRow.appendChild(chip);
      });
      sub.appendChild(catRow);
    }
  }

  // アイテムリスト
  const items = document.createElement('div');
  items.className = 'top-filter-items';

  // 対象問題：計算問題モードなら計算問題のみ、通常は選択カテゴリ（計算問題は集計・出題から除外）
  // 計算問題モードでカテゴリを選んでいる場合は、年度・分野の件数もそのカテゴリに絞って集計する。
  const srcQs = state.calcFilter
    ? state.questions.filter(q =>
        q.questionType === 'calculation' &&
        (state.activeCategories.size === 0 || state.activeCategories.has(q.category)))
    : state.questions.filter(q => q.category === topFilterOpenCat && !isCalcQuestion(q));

  // 名前列の幅を「全カテゴリの年度名・分野名」の中で最も長いものに固定する。
  // カテゴリ・年度別/分野別タブのいずれでもバーの開始位置・長さを統一し、描画前に確定させてちらつきを防ぐ。
  {
    const w = computeGlobalFilterNameWidth();
    if (w > 0) items.style.setProperty('--tfi-name-w', (Math.ceil(w) + 2) + 'px');
  }

  if (topFilterSubMode === 'year') {
    const years = sortYearsDesc([...new Set(srcQs.filter(q => q.year).map(q => q.year))]);

    if (years.length === 0) {
      items.innerHTML = '<span style="color:var(--text-3);font-size:.82rem;padding:6px 0;display:block;">年度データがありません</span>';
    } else {
      years.forEach(year => {
        const yearQs = srcQs.filter(q => q.year === year);
        const qcnt = yearQs.length;
        const tier = filterTier(yearQs);
        const btn = document.createElement('button');
        const yearLastUsed = lastUsedFilterCat === topFilterOpenCat && lastUsedFilterYears.has(year);
        btn.className = 'top-filter-item' + (state.activeYears.has(year) ? ' active' : '') + (tier ? ' tier-' + tier : '') + (yearLastUsed ? ' last-used' : '');
        btn.innerHTML = `<span class="tfi-name">${year}</span>${filterProgressHTML(yearQs)}<span class="top-filter-item-cnt">${qcnt}問</span>`;
        btn.addEventListener('click', () => {
          if (state.activeYears.has(year)) state.activeYears.delete(year);
          else state.activeYears.add(year);
          updateHomeStats();
          renderTopFilterCard();
        });
        items.appendChild(btn);
      });
    }
  } else {
    const secs = [...new Set(srcQs.filter(q => q.section).map(q => q.section))]
      .sort((a, b) => {
        const na = parseInt((a.match(/(\d+)/) || [0, 99])[1]);
        const nb = parseInt((b.match(/(\d+)/) || [0, 99])[1]);
        return na - nb;
      });

    if (secs.length === 0) {
      items.innerHTML = '<span style="color:var(--text-3);font-size:.82rem;padding:6px 0;display:block;">分野データがありません</span>';
    } else {
      secs.forEach(sec => {
        const secQs = srcQs.filter(q => q.section === sec);
        const qcnt = secQs.length;
        const tier = filterTier(secQs);
        const btn = document.createElement('button');
        const secLastUsed = lastUsedFilterCat === topFilterOpenCat && lastUsedFilterSections.has(sec);
        btn.className = 'top-filter-item' + (state.activeSections.has(sec) ? ' active' : '') + (tier ? ' tier-' + tier : '') + (secLastUsed ? ' last-used' : '');
        btn.innerHTML = `<span class="tfi-name">${sec}</span>${filterProgressHTML(secQs)}<span class="top-filter-item-cnt">${qcnt}問</span>`;
        btn.addEventListener('click', () => {
          if (state.activeSections.has(sec)) state.activeSections.delete(sec);
          else state.activeSections.add(sec);
          updateHomeStats();
          renderTopFilterCard();
        });
        items.appendChild(btn);
      });
    }
  }

  sub.appendChild(items);
  card.appendChild(sub);
}

// 全カテゴリの年度名・分野名（💎込み）から最長の表示幅(px)を求める（カテゴリ間でバー位置を統一するため）
function computeGlobalFilterNameWidth() {
  const names = [];
  [...new Set(state.questions.map(q => q.category))].forEach(cat => {
    const cq = state.questions.filter(q => q.category === cat);
    [...new Set(cq.filter(q => q.year).map(q => q.year))].forEach(y => names.push(y));
    [...new Set(cq.filter(q => q.section).map(q => q.section))].forEach(s => names.push(s));
  });
  return measureMaxFilterNameWidth(names);
}

// 与えられた名前群の中で最大の表示幅(px)を、.tfi-name と同じフォントで実測する（非表示で測定）
// ⚠️ 測定要素は **document.body 直下** に置くこと。
//    renderHome() は showScreen('home') より先に renderTopFilterCard() を呼ぶため、
//    測定時点で #screen-home はまだ .hidden（display:none）。display:none の子孫では
//    getBoundingClientRect() が 0 を返し、--tfi-name-w が未設定のまま
//    grid-template-columns のフォールバック max-content が効いて
//    「セッション終了→ホーム復帰でバーが全幅に伸びる」不具合になる。
//    font-family は body 継承・font-size は rem 基準なので body 直下でも実測値は同じ。
function measureMaxFilterNameWidth(names) {
  if (!names || names.length === 0) return 0;
  const meas = document.createElement('span');
  meas.style.cssText = 'position:absolute;left:-9999px;top:0;visibility:hidden;white-space:nowrap;font-size:.88rem;font-weight:600;';
  document.body.appendChild(meas);
  let max = 0;
  names.forEach(n => {
    meas.textContent = n;
    const w = meas.getBoundingClientRect().width;
    if (w > max) max = w;
  });
  document.body.removeChild(meas);
  return max;
}

function onTopFilterCatClick(cat) {
  state.calcFilter = false; // 計算問題フィルターを解除
  if (topFilterOpenCat === cat) {
    // 同じカテゴリ再クリック → 閉じて全解除
    topFilterOpenCat = null;
    state.activeCategories.clear();
    state.activeYears.clear();
    state.activeSections.clear();
  } else {
    // 別カテゴリ → そのカテゴリを選択
    topFilterOpenCat = cat;
    state.activeCategories = new Set([cat]);
    state.activeYears.clear();
    state.activeSections.clear();
  }
  topFilterSubMode = 'year';
  updateHomeStats();
  renderTopFilterCard();
}

function onCalcFilterClick() {
  if (state.calcFilter) {
    // 再クリック → オフ
    state.calcFilter    = false;
    topFilterOpenCat    = null;
    state.activeCategories.clear();
    state.activeYears.clear();
    state.activeSections.clear();
  } else {
    // 計算問題フィルターをオン（通常カテゴリを解除）
    state.calcFilter    = true;
    topFilterOpenCat    = '__calc__';
    state.activeCategories.clear();
    state.activeYears.clear();
    state.activeSections.clear();
  }
  topFilterSubMode = 'year';
  updateHomeStats();
  renderTopFilterCard();
}

/** 論述問題練習：科目（法令／消費機器）を選んだら、その科目の模範解答一覧へ */
function onEssayCategorySelect(cat) {
  renderTopFilterCard();
  openEssayList(cat);
}

// ========== Weakness Report ==========
// 集計単位の生成・加算ヘルパー
function _wkAgg() { return { total: 0, tried: 0, attempts: 0, correct: 0 }; }
function _wkAdd(s, choiceId) {
  s.total++;
  const p = state.progress[choiceId];
  if (p && p.attempts > 0) {
    s.tried++;
    s.attempts += p.attempts;
    s.correct  += p.correct || 0;
  }
}
function _wkAcc(s)  { return s.attempts > 0 ? Math.round((s.correct / s.attempts) * 100) : null; }
function _wkCov(s)  { return s.total > 0 ? Math.round((s.tried / s.total) * 100) : 0; }
function _wkColor(s) {
  const a = _wkAcc(s);
  if (a === null) return 'var(--text-3)';
  return a < 50 ? '#ef4444' : a < 75 ? '#f59e0b' : '#10b981';
}
// 弱い順ソート（未着手は末尾）。entries: [key, stats][]
function _wkWeakSort(entries) {
  return entries.sort((a, b) => {
    const ra = a[1].attempts > 0 ? a[1].correct / a[1].attempts : 1.1;
    const rb = b[1].attempts > 0 ? b[1].correct / b[1].attempts : 1.1;
    if (ra !== rb) return ra - rb;
    return b[1].tried - a[1].tried;
  });
}
// 正答率バー＋挑戦度バーの行HTML
function _wkRowHTML(name, s) {
  const acc = _wkAcc(s);
  const cov = _wkCov(s);
  const col = _wkColor(s);
  return `
    <div class="wk-row">
      <div class="wk-row-head">
        <span class="wk-name">${name}</span>
        <span class="wk-acc" style="color:${col}">${acc !== null ? acc + '%' : '未着手'}</span>
      </div>
      <div class="wk-metric">
        <span class="wk-mlabel">正答率</span>
        <span class="wk-bar"><span class="wk-bar-fill" style="width:${acc ?? 0}%;background:${col};"></span></span>
      </div>
      <div class="wk-metric">
        <span class="wk-mlabel">挑戦度</span>
        <span class="wk-bar"><span class="wk-bar-fill wk-cov" style="width:${cov}%;"></span></span>
        <span class="wk-mnum">${s.tried}/${s.total}</span>
      </div>
      ${s.attempts > 0 ? `<div class="wk-sub">延べ ${s.correct}/${s.attempts} 正解（挑戦度 ${cov}%）</div>` : ''}
    </div>`;
}

function renderWeaknessReport() {
  const container = document.getElementById('weakness-report');
  if (!container) return;

  const overall = _wkAgg();
  const byCat   = {};   // 科目別
  const byYear  = {};   // 年度別
  const byCell  = {};   // 年度×科目 { 'yearcat': stats }

  state.questions.forEach(q => {
    const cat  = q.category || 'その他';
    const year = q.year || '年度不明';
    if (!byCat[cat])   byCat[cat]   = _wkAgg();
    if (!byYear[year]) byYear[year] = _wkAgg();
    const ck = year + '' + cat;
    if (!byCell[ck]) byCell[ck] = _wkAgg();
    (q.choices || []).forEach(c => {
      if (!c.id) return;
      _wkAdd(overall, c.id);
      _wkAdd(byCat[cat], c.id);
      _wkAdd(byYear[year], c.id);
      _wkAdd(byCell[ck], c.id);
    });
  });

  if (overall.total === 0) {
    container.innerHTML = '<p style="color:var(--text-3);font-size:.85rem;text-align:center;padding:16px 0;">問題データがありません</p>';
    return;
  }

  const oAcc = _wkAcc(overall);
  const oCov = _wkCov(overall);
  const oCol = _wkColor(overall);

  let html = '';

  // ── 全体サマリー ──
  html += `
    <div class="wk-summary">
      <div class="wk-sum-item">
        <span class="wk-sum-val" style="color:${oCol}">${oAcc !== null ? oAcc + '%' : '—'}</span>
        <span class="wk-sum-cap">累計正答率</span>
        <span class="wk-sum-sub">${overall.attempts > 0 ? `延べ ${overall.correct}/${overall.attempts}` : '未挑戦'}</span>
      </div>
      <div class="wk-sum-item">
        <span class="wk-sum-val" style="color:#5a9bf0">${oCov}%</span>
        <span class="wk-sum-cap">学習済み</span>
        <span class="wk-sum-sub">${overall.tried}/${overall.total} 選択肢</span>
      </div>
    </div>
    <div class="wk-legend">
      <span><i style="background:#ef4444"></i>〜49%</span>
      <span><i style="background:#f59e0b"></i>50〜74%</span>
      <span><i style="background:#10b981"></i>75%〜</span>
      <span><i style="background:var(--text-3)"></i>未着手</span>
    </div>`;

  // ── 年度×科目 ヒートマップ ──
  const years = sortYearsDesc(Object.keys(byYear).filter(y => y !== '年度不明'));
  if (byYear['年度不明']) years.push('年度不明');
  const catList = _wkWeakSort(Object.entries(byCat)).map(e => e[0]); // 弱い科目を左に
  if (years.length > 0 && catList.length > 0) {
    html += `<div class="wk-section-title">📊 年度 × 科目 ヒートマップ<span class="wk-hint">数字＝正答率／薄い枠＝未着手</span></div>`;
    html += `<div class="wk-heat-scroll"><table class="wk-heat"><thead><tr><th class="wk-heat-corner"></th>`;
    catList.forEach(cat => { html += `<th class="wk-heat-cath">${_wkShortCat(cat)}</th>`; });
    html += `</tr></thead><tbody>`;
    years.forEach(year => {
      html += `<tr><th class="wk-heat-yearh">${year}</th>`;
      catList.forEach(cat => {
        const s = byCell[year + '' + cat];
        if (!s || s.total === 0) { html += `<td class="wk-cell wk-cell-empty"></td>`; return; }
        const acc = _wkAcc(s);
        const cov = _wkCov(s);
        if (acc === null) {
          html += `<td class="wk-cell wk-cell-untried" data-year="${year}" data-cat="${cat}" title="${year} ${cat}｜未着手 0/${s.total}／タップで出題">–</td>`;
        } else {
          const col = _wkColor(s);
          // 挑戦度が低いセルは半透明にして「数字の信頼度が低い」ことを示す
          const op = 0.4 + 0.6 * (cov / 100);
          html += `<td class="wk-cell" data-year="${year}" data-cat="${cat}" style="background:${col};opacity:${op.toFixed(2)};" title="${year} ${cat}｜正答率${acc}% 挑戦度${cov}% (${s.tried}/${s.total})／タップで出題">${acc}<small>${cov}%</small></td>`;
        }
      });
      html += `</tr>`;
    });
    html += `</tbody></table></div>`;
  }

  // ── 苦手スポット ランキング（年度×科目、挑戦済みのみ・弱い順） ──
  const cells = Object.entries(byCell)
    .filter(([, s]) => s.attempts > 0)
    .map(([k, s]) => { const [y, c] = k.split(''); return { y, c, s }; });
  cells.sort((a, b) => {
    const ra = a.s.correct / a.s.attempts, rb = b.s.correct / b.s.attempts;
    if (ra !== rb) return ra - rb;
    return b.s.tried - a.s.tried;
  });
  if (cells.length > 0) {
    html += `<div class="wk-section-title">🎯 苦手スポット（弱い順）</div>`;
    html += `<div class="wk-rank">`;
    cells.slice(0, 8).forEach(({ y, c, s }) => {
      const acc = _wkAcc(s);
      const col = _wkColor(s);
      html += `
        <div class="wk-rank-row" data-year="${y}" data-cat="${c}" title="${y} ${c}／タップで出題">
          <span class="wk-rank-name">${y}<span class="wk-rank-sep">・</span>${_wkShortCat(c)}</span>
          <span class="wk-rank-bar"><span class="wk-rank-fill" style="width:${acc}%;background:${col};"></span></span>
          <span class="wk-rank-acc" style="color:${col}">${acc}%</span>
          <span class="wk-rank-cnt">挑戦 ${s.tried}/${s.total}</span>
        </div>`;
    });
    html += `</div>`;
  }

  // ── 科目別 ──
  html += `<div class="wk-section-title">📚 科目別（弱い順）</div>`;
  _wkWeakSort(Object.entries(byCat)).forEach(([cat, s]) => { html += _wkRowHTML(cat, s); });

  // ── 年度別 ──
  html += `<div class="wk-section-title">📅 年度別（弱い順）</div>`;
  _wkWeakSort(Object.entries(byYear)).forEach(([year, s]) => { html += _wkRowHTML(year, s); });

  container.innerHTML = html;

  // ヒートマップのセルをタップ→その年度×科目で出題開始
  container.onclick = (e) => {
    const target = e.target.closest('[data-year][data-cat]');
    if (!target) return;
    _startSessionForCell(target.dataset.year, target.dataset.cat);
  };
}

// 指定の年度×科目で学習セッションを開始
function _startSessionForCell(year, cat) {
  const filtered = state.questions.filter(q =>
    (q.category || 'その他') === cat &&
    (q.year || '年度不明') === year &&
    q.choices && q.choices.length
  );
  if (filtered.length === 0) { alert('この年度・科目には出題できる問題がありません。'); return; }
  // フィルター状態も合わせておく（結果画面の「もう一度」等の一貫性のため）
  state.activeCategories = new Set([cat]);
  state.activeYears      = new Set([year]);
  state.activeSections   = new Set();
  _startSession('sequential', filtered);
}

// 科目名を短く（ヒートマップ・ランキング用）
function _wkShortCat(cat) {
  return cat
    .replace('ガス技術（', '')
    .replace('）', '')
    .replace('ガス技術', 'ガス技術');
}

function renderCalendar() {
  if (calTimerInterval) { clearInterval(calTimerInterval); calTimerInterval = null; }
  const log  = loadStudyLog();
  const cal  = document.getElementById('study-calendar');
  if (!cal) return;

  const today    = new Date();
  const todayStr = getLocalDateStr(today);
  const DOW_JP   = ['日','月','火','水','木','金','土'];
  const MONTHS   = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];

  // ── 今日の日付テキスト ──
  const todayJP = `${toJpEraYear(today)}${today.getMonth()+1}月${today.getDate()}日（${DOW_JP[today.getDay()]}）`;

  // ── ストリーク ──
  const streak = computeStreak();
  const streakBadge = document.getElementById('streak-badge');
  if (streakBadge) {
    if (streak >= 2) { streakBadge.textContent = `🔥 ${streak}日連続`; streakBadge.classList.remove('hidden'); }
    else streakBadge.classList.add('hidden');
  }

  // ── カレンダービュー（月単位） ──
  const yr = calendarViewYear;
  const mo = calendarViewMonth;
  const daysInMonth = new Date(yr, mo + 1, 0).getDate();
  const firstDow    = new Date(yr, mo, 1).getDay();
  const eraLabel    = `${toJpEraYear(new Date(yr, mo, 1))}${MONTHS[mo]}`;

  // ── 日単位グリッド構築 ──
  let daysHtml = '';
  for (let i = 0; i < firstDow; i++) daysHtml += `<span class="jcal-day jcal-empty"></span>`;
  for (let d = 1; d <= daysInMonth; d++) {
    const ds   = `${yr}-${String(mo+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const ent  = log[ds];
    const secs = ent ? (ent.secs || 0) : 0;
    const ans  = ent ? (ent.answered || 0) : 0;
    const tierCls = ans >= 250 ? 'tier-diamond'
                  : ans >= 200 ? 'tier-platinum'
                  : ans >= 150 ? 'tier-gold'
                  : ans >= 100 ? 'tier-silver'
                  : ans >=  50 ? 'tier-copper'
                  : 'tier-none';
    const dow    = (firstDow + d - 1) % 7;
    const dowCls = dow === 0 ? 'dow-sun' : dow === 6 ? 'dow-sat' : '';
    const isTd   = ds === todayStr;
    const tipAttr = `data-tip="${ds}" data-ans="${ans}" data-tier="${tierCls}"`;
    if (tierCls === 'tier-diamond') {
      daysHtml += `<span class="jcal-day tier-diamond ${dowCls}${isTd ? ' jcal-today' : ''}" ${tipAttr} style="height:36px;padding:0;">${_makeDiamondCalCell(d)}</span>`;
    } else if (tierCls === 'tier-silver') {
      daysHtml += `<span class="jcal-day tier-silver ${dowCls}${isTd ? ' jcal-today' : ''}" ${tipAttr} style="height:36px;padding:0;">${_makeSilverCalCell(d)}</span>`;
    } else if (tierCls === 'tier-copper') {
      daysHtml += `<span class="jcal-day tier-copper ${dowCls}${isTd ? ' jcal-today' : ''}" ${tipAttr} style="height:36px;padding:0;">${_makeBronzeCalCell(d)}</span>`;
    } else if (tierCls === 'tier-gold') {
      daysHtml += `<span class="jcal-day tier-gold ${dowCls}${isTd ? ' jcal-today' : ''}" ${tipAttr} style="height:36px;padding:0;">${_makeGoldCalCell(d)}</span>`;
    } else if (tierCls === 'tier-platinum') {
      daysHtml += `<span class="jcal-day tier-platinum ${dowCls}${isTd ? ' jcal-today' : ''}" ${tipAttr} style="height:36px;padding:0;">${_makePlatinumCalCell(d)}</span>`;
    } else {
      daysHtml += `<span class="jcal-day ${tierCls} ${dowCls}${isTd ? ' jcal-today' : ''}" ${tipAttr}>${d}</span>`;
    }
  }

  // ── 累計集計 ──
  let totalSecs = 0, totalAnswered = 0;
  const cumCats = {};
  for (const entry of Object.values(log)) {
    totalSecs    += entry.secs || 0;
    totalAnswered += entry.answered || 0;
    for (const [cat, data] of Object.entries(entry.cats || {})) {
      if (!cumCats[cat]) cumCats[cat] = { answered: 0, secs: 0 };
      cumCats[cat].answered += data.answered || 0;
      cumCats[cat].secs     += data.secs     || 0;
    }
  }
  const todayEntry   = log[todayStr] || {};
  const todaySecs    = todayEntry.secs    || 0;
  const todayAnswered = todayEntry.answered || 0;
  const todayCats    = todayEntry.cats    || {};

  // ── セッション中表示 ──
  const sessionHtml = sessionStartTime
    ? `<div class="cal-session-live">🟢 学習中: <span id="cal-session-timer">${fmtTime(Math.round((Date.now()-sessionStartTime)/1000))}</span></div>`
    : '';

  // ── 分野別行ヘルパー ──
  const catRows = (cats) => sortCategories(Object.keys(cats)).map(cat =>
    `<div class="cal-stat-row cal-stat-cat">
       <span>${cat}</span>
       <span>${cats[cat].answered}選択肢</span>
     </div>`).join('');

  cal.innerHTML = `
    <div class="jcal-today-row">
      <span class="jcal-today-str">${todayJP}</span>
    </div>
    <div class="jcal-nav">
      <button class="jcal-nav-btn" id="jcal-prev">◀</button>
      <span class="jcal-month-title">${eraLabel}</span>
      <button class="jcal-nav-btn" id="jcal-next">▶</button>
    </div>
    <div class="jcal-weekdays">
      <span class="dow-sun">日</span><span>月</span><span>火</span>
      <span>水</span><span>木</span><span>金</span><span class="dow-sat">土</span>
    </div>
    <div class="jcal-days">${daysHtml}</div>
    <div class="cal-stats-section">
      ${sessionHtml}
      <div class="cal-stats-block">
        <div class="cal-stats-title">📅 今日</div>
        <div class="cal-stat-row"><span>📝 回答選択肢数</span><span>${todayAnswered}選択肢</span></div>
        ${catRows(todayCats)}
      </div>
      <div class="cal-stats-block">
        <div class="cal-stats-title">📊 累計</div>
        <div class="cal-stat-row"><span>📝 総回答選択肢数</span><span>${totalAnswered}選択肢</span></div>
        ${catRows(cumCats)}
      </div>
    </div>`;

  document.getElementById('jcal-prev').addEventListener('click', () => {
    calendarViewMonth--;
    if (calendarViewMonth < 0) { calendarViewMonth = 11; calendarViewYear--; }
    renderCalendar();
  });
  document.getElementById('jcal-next').addEventListener('click', () => {
    calendarViewMonth++;
    if (calendarViewMonth > 11) { calendarViewMonth = 0; calendarViewYear++; }
    renderCalendar();
  });

  // ライブタイマー（学習中の場合）
  if (sessionStartTime) {
    calTimerInterval = setInterval(() => {
      const el = document.getElementById('cal-session-timer');
      if (!el) { clearInterval(calTimerInterval); calTimerInterval = null; return; }
      el.textContent = fmtTime(Math.round((Date.now() - sessionStartTime) / 1000));
    }, 1000);
  }
}

// ========== タグ出題エリア ==========
function renderTagStudyArea() {
  const area = document.getElementById('tag-study-area');
  if (!area) return;
  area.innerHTML = '';

  // choice タグを収集（壁打ち用）
  const allTags = sortTagsJa([...new Set(
    state.questions.flatMap(q => (q.choices || []).flatMap(c => c.tags || []))
  )]);

  if (allTags.length === 0) {
    const msg = document.createElement('p');
    msg.style.cssText = 'font-size:.8rem;color:var(--text-3);margin:0;';
    msg.textContent = 'タグが登録されていません';
    area.appendChild(msg);
    return;
  }

  // 検索ボックス＋選択クリア（タグが多いとき探しやすく）
  const searchWrap = document.createElement('div');
  searchWrap.className = 'tag-study-search-wrap';
  const search = document.createElement('input');
  search.type = 'text';
  search.className = 'tag-study-search';
  search.placeholder = `🔍 タグを検索（全${allTags.length}件）`;
  search.value = tagStudyFilter;
  searchWrap.appendChild(search);
  if (tagStudySelectedTags.size > 0) {
    const clr = document.createElement('button');
    clr.type = 'button';
    clr.className = 'tag-study-clear';
    clr.textContent = `選択クリア（${tagStudySelectedTags.size}）`;
    clr.addEventListener('click', () => { tagStudySelectedTags.clear(); renderTagStudyArea(); });
    searchWrap.appendChild(clr);
  }
  area.appendChild(searchWrap);

  // タグチップ（スクロール可）。行（あ行/か行…）ごとに見出し付きで縦に並べる。
  const chipsRow = document.createElement('div');
  chipsRow.className = 'tag-study-chips';
  // 行グループに振り分け（allTags は sortTagsJa 済みなので各行内も50音順）
  const gyoGroups = new Map();
  allTags.forEach(tag => {
    const g = tagGyo(tag);
    if (!gyoGroups.has(g)) gyoGroups.set(g, []);
    gyoGroups.get(g).push(tag);
  });
  const makeChip = tag => {
    const chip = document.createElement('button');
    chip.className = 'chip tag-study-chip' + (tagStudySelectedTags.has(tag) ? ' active' : '');
    chip.textContent = '#' + tag;
    chip.dataset.tag = tag;
    chip.addEventListener('click', () => {
      if (tagStudySelectedTags.has(tag)) tagStudySelectedTags.delete(tag);
      else tagStudySelectedTags.add(tag);
      renderTagStudyArea();
    });
    return chip;
  };
  TAG_GYO_ORDER.forEach(glabel => {
    const tags = gyoGroups.get(glabel);
    if (!tags || tags.length === 0) return;
    const groupEl = document.createElement('div');
    groupEl.className = 'tag-study-group';
    groupEl.dataset.gyo = glabel;
    const label = document.createElement('div');
    label.className = 'tag-study-group-label';
    label.textContent = glabel;
    const gchips = document.createElement('div');
    gchips.className = 'tag-study-group-chips';
    tags.forEach(tag => gchips.appendChild(makeChip(tag)));
    groupEl.append(label, gchips);
    chipsRow.appendChild(groupEl);
  });
  area.appendChild(chipsRow);

  // 漢字始まりで読み未登録のタグは「その他」に入る。読みはタグを選んで「読みを編集」から登録できる。
  const pendingReading = allTags.some(t => tagNeedsReading(t) && !(tagKey(t) in tagReadings));
  if (pendingReading) {
    const hint = document.createElement('div');
    hint.className = 'tag-study-reading-hint';
    hint.textContent = '漢字始まりで読み未登録のタグは「その他」に入ります。タグを選んで「🖊 読みを編集」で読みを登録すると五十音順に並びます。';
    area.appendChild(hint);
  }

  // 該当なしメッセージ用
  const emptyMsg = document.createElement('div');
  emptyMsg.className = 'tag-study-empty hidden';
  emptyMsg.textContent = '該当するタグがありません';
  chipsRow.appendChild(emptyMsg);

  // 検索フィルター（選択中タグは常に表示してロストを防ぐ）。入力中は再描画せず表示切替のみ＝フォーカス維持
  const applyTagFilter = () => {
    const q = tagStudyFilter.trim().toLowerCase().replace(/^#/, '');
    let visible = 0;
    chipsRow.querySelectorAll('.tag-study-chip').forEach(c => {
      const isActive = tagStudySelectedTags.has(c.dataset.tag);
      const match = isActive || !q || c.dataset.tag.toLowerCase().includes(q);
      c.classList.toggle('hidden', !match);
      if (match) visible++;
    });
    // 表示チップが無い行グループ（見出し含む）は隠す
    chipsRow.querySelectorAll('.tag-study-group').forEach(g => {
      const anyVisible = [...g.querySelectorAll('.tag-study-chip')].some(c => !c.classList.contains('hidden'));
      g.classList.toggle('hidden', !anyVisible);
    });
    emptyMsg.classList.toggle('hidden', visible > 0);
  };
  applyTagFilter();
  search.addEventListener('input', () => { tagStudyFilter = search.value; applyTagFilter(); });

  // タグ選択時: 壁打ちボタン（選択肢単位）
  if (tagStudySelectedTags.size > 0) {
    // 選択タグを持つ選択肢数
    // 出題側(startTagDrill)と同じ条件で数える（計算問題を除外しないと実際の出題数とズレる）
    const tagChoiceCount = state.questions
      .filter(q => !q.drillExcluded && !isFillBlankQuestion(q) && !isCalcQuestion(q) && q.choices?.length)
      .flatMap(q => (q.choices || []))
      .filter(c => (c.tags || []).some(t => tagStudySelectedTags.has(t)))
      .length;

    const infoEl = document.createElement('div');
    infoEl.style.cssText = 'font-size:.78rem;color:var(--text-3);margin:6px 2px 4px;';
    infoEl.textContent = `対象: ${tagChoiceCount}選択肢`;
    area.appendChild(infoEl);

    if (tagChoiceCount > 0) {
      const drillBtn = document.createElement('button');
      drillBtn.className = 'start-btn-card drill-all';
      drillBtn.style.marginTop = '6px';
      drillBtn.innerHTML = '<div class="btn-label">🥊 壁打ち</div><div class="btn-desc">選択タグの選択肢を1つずつ判定</div>';
      drillBtn.addEventListener('click', () => startTagDrill(tagStudySelectedTags));
      area.appendChild(drillBtn);
    }

    // 読みを編集（選択タグのうち、漢字始まり等で読みが並び順に必要なもの）
    const selectedNeedReading = [...tagStudySelectedTags].filter(tagNeedsReading);
    if (selectedNeedReading.length > 0) {
      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'tag-study-clear';
      editBtn.style.marginTop = '8px';
      editBtn.textContent = tagReadingPanelOpen ? '🖊 読みを編集（閉じる）' : '🖊 読みを編集';
      editBtn.addEventListener('click', () => { tagReadingPanelOpen = !tagReadingPanelOpen; renderTagStudyArea(); });
      area.appendChild(editBtn);

      if (tagReadingPanelOpen) {
        const panel = document.createElement('div');
        panel.className = 'tag-reading-panel';
        selectedNeedReading.forEach(tag => {
          const s = tagKey(tag);
          const row = document.createElement('div');
          row.className = 'tag-reading-row';
          const name = document.createElement('span');
          name.className = 'tag-reading-name';
          name.textContent = '#' + s;
          const input = document.createElement('input');
          input.type = 'text';
          input.className = 'tag-reading-input';
          input.placeholder = 'よみ（ひらがな）例: あつりょく';
          input.value = tagReadings[s] || '';
          input.addEventListener('keydown', e => {
            if (e.key === 'Enter') { e.preventDefault(); setTagReading(s, input.value); renderTagStudyArea(); }
          });
          input.addEventListener('blur', () => setTagReading(s, input.value)); // タブ移動時は保存のみ（再描画しない）
          row.append(name, input);
          panel.appendChild(row);
        });
        const note = document.createElement('div');
        note.className = 'tag-reading-note';
        note.textContent = '読みを入力して Enter で五十音順に反映されます。';
        panel.appendChild(note);
        area.appendChild(panel);
      }
    }
  }
}

function startTagDrill(selectedTags) {
  const queue = [];
  state.questions
    .filter(q => !q.drillExcluded && !isFillBlankQuestion(q) && !isCalcQuestion(q) && q.choices?.length)
    .forEach(q => {
      (q.choices || []).forEach((c, i) => {
        if ((c.tags || []).some(t => selectedTags.has(t))) {
          queue.push({ question: q, choice: c, choiceIndex: i });
        }
      });
    });
  if (queue.length === 0) { alert('出題できる選択肢がありません。'); return; }
  for (let i = queue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [queue[i], queue[j]] = [queue[j], queue[i]];
  }
  startDrillWithQueue(queue, 'keyword-search');
}

function startTagSession(mode, tagQs) {
  tagQs = (tagQs || []).filter(q => !isCalcQuestion(q)); // 計算問題は通常出題から除外
  if (tagQs.length === 0) { alert('対象問題がありません'); return; }
  if (hasInterruptedSession()) {
    pendingStartMode = { mode, filtered: tagQs };
    document.getElementById('modal-start-confirm').classList.remove('hidden');
    return;
  }
  clearInterruptedSession();
  _startSession(mode, tagQs);
}

function renderHome() {
  flushSessionTime();
  clearAllTempMarkers();   // ホームに戻ったら一時マーカーを消す
  gdriveCheckRemote().catch(() => {}); // Drive に新しいデータがあれば通知のみ（自動上書きはしない）
  updateHeaderStats();
  // ホームに戻ったらフィルター選択を解除（直前フィルターは lastUsedFilter* に記録済み）
  state.activeYears.clear();
  state.activeSections.clear();
  topFilterStartOpen     = false;  // 出題開始ポップアップだけは閉じる
  const categories = [...new Set(state.questions.map(q => q.category))]
    .sort((a, b) => a.localeCompare(b, 'ja'));
  renderCategoryFilter(categories);
  renderTopFilterCard();       // フィルター表示を最新状態にリセット
  renderTagStudyArea();        // タグ出題エリアを更新
  updateSubPanelVisibility();
  updateHomeStats();
  updateResumeButton();
  renderPendingVerify();
  // ブックマーク件数更新
  const bmCount = state.bookmarks.size;
  const bmDesc  = document.getElementById('bookmark-count-desc');
  if (bmDesc) bmDesc.textContent = bmCount > 0 ? `${bmCount}問 登録済み` : '登録した問題を出題';
  // 最近間違えた問題ボタン（セットがあるときだけ表示）
  const rwSets  = loadRecentWrong();
  const rwBtn   = document.getElementById('btn-start-recent-wrong');
  const rwDesc  = document.getElementById('recent-wrong-desc');
  if (rwBtn) rwBtn.classList.toggle('hidden', rwSets.length === 0);
  if (rwDesc && rwSets.length) rwDesc.textContent = `直近${rwSets.length}セットから選んで復習`;
  // 模試結果セクションをリセット
  document.getElementById('exam-result-section')?.classList.add('hidden');
  showScreen('home');
}

// ========== Toggle open-state helpers ==========
// トグルの開閉状態を保存（最大3階層：カテゴリ > 年度 > 問題）
function getToggleOpenState(containerId) {
  const open = {}; // { catName: { open, years: { yearName: { open, qs: Set } } } }
  const cont = document.getElementById(containerId);
  if (!cont) return open;
  cont.querySelectorAll(':scope > .stats-set').forEach(catEl => {
    const catBody = catEl.querySelector(':scope > .stats-set-body');
    const catName = catEl.querySelector('.stats-set-name')?.textContent?.trim();
    if (!catName) return;
    const catOpen = catBody && !catBody.classList.contains('hidden');
    open[catName] = { open: catOpen, years: {} };
    if (!catOpen || !catBody) return;
    catBody.querySelectorAll(':scope > .stats-question-section').forEach(yearEl => {
      const yearBody = yearEl.querySelector(':scope > .stats-question-body');
      const yearName = yearEl.querySelector('.stats-question-src')?.childNodes[0]?.textContent?.trim();
      if (!yearName) return;
      const yearOpen = yearBody && !yearBody.classList.contains('hidden');
      open[catName].years[yearName] = { open: yearOpen, qs: new Set() };
      if (!yearOpen || !yearBody) return;
      yearBody.querySelectorAll(':scope > .stats-question-section').forEach(qEl => {
        const qBody  = qEl.querySelector(':scope > .stats-question-body');
        const qLabel = qEl.querySelector('.stats-question-src')?.childNodes[0]?.textContent?.trim();
        if (qLabel && qBody && !qBody.classList.contains('hidden'))
          open[catName].years[yearName].qs.add(qLabel);
      });
    });
  });
  return open;
}

function makeChip(label, onClick) {
  const btn = document.createElement('button');
  btn.className = 'chip';
  btn.textContent = label;
  btn.addEventListener('click', onClick);
  return btn;
}

// ========== Study Screen ==========
const CHOICE_LABELS = ['a', 'b', 'c', 'd', 'e', 'f'];

function startSession(mode, opts = {}) {
  if (state.questions.length === 0) {
    alert('問題データがありません。JSONファイルを読み込んでください。');
    return;
  }
  let filtered = getFilteredQuestions();
  // 計算問題は通常出題から除外（計算問題練習でのみ出題。計算問題フィルター選択時は除外しない）
  if (!state.calcFilter) filtered = filtered.filter(q => !isCalcQuestion(q));
  // 「N連続正解を除外」: 全選択肢が直近N連続正解済みの問題を除外（N=3/4/5）
  if (opts.excludeStreak) filtered = filtered.filter(q => !isQuestionMasteredAt(q, opts.excludeStreak));
  if (filtered.length === 0) {
    alert(opts.excludeStreak
      ? `出題できる問題がありません。\n選択範囲はすべて${opts.excludeStreak}連続正解済みです。`
      : 'フィルターに合致する問題がありません。カテゴリを選択してください。');
    return;
  }
  // 直前セッションのフィルターを記録（ホーム帰還後に目印表示するため）
  lastUsedFilterYears    = new Set(state.activeYears);
  lastUsedFilterSections = new Set(state.activeSections);
  lastUsedFilterCat      = topFilterOpenCat;
  saveLastUsedFilter();
  // 中断データがあれば確認モーダルを表示
  if (loadInterruptedSession()) {
    pendingStartMode = { mode, filtered, examScoring: true };
    document.getElementById('modal-start-confirm').classList.remove('hidden');
    return;
  }
  _startSession(mode, filtered, { examScoring: true }); // カテゴリフィルター出題＝1問5点採点
}

function _startSession(mode, filtered, opts = {}) {
  flushSessionTime();
  clearAllTempMarkers();   // 新しい出題に進んだら一時マーカーを消す
  startSessionTimer();
  // 模試モードのタイマーが残っていれば停止
  if (state.examTimerInterval) { clearInterval(state.examTimerInterval); state.examTimerInterval = null; }
  document.getElementById('exam-timer-wrap')?.classList.add('hidden');
  state.examMode             = false;
  state.quickMode            = !!opts.quickMode;   // 「とりあえず50」モードか
  state.examScoring          = !!opts.examScoring; // カテゴリフィルター出題＝1問5点採点
  state.mode                 = mode;
  // 「もう一度」用に直前セッション情報を保存
  state.lastAgainType     = 'study';
  state.lastAgainMode     = mode;
  state.lastAgainFiltered = filtered.slice();
  state.lastAgainLimit    = null;
  // opts.queue があればそれをそのまま使う（事前構築済みキュー）
  let queue = opts.queue ? opts.queue : buildQueue(filtered, mode);
  if (!opts.queue && mode === 'random' && state.randomLimit) queue = queue.slice(0, state.randomLimit);
  if (queue.length === 0) {
    if (mode === 'weak') {
      alert('苦手な問題がありません。\n選択範囲に「直近不正解あり」の問題が見つかりませんでした。');
    } else if (mode === 'strong') {
      alert('得意な問題がありません。\n選択範囲に「直近2回以上正解」の問題が見つかりませんでした。');
    } else {
      alert('出題できる問題がありません。');
    }
    return;
  }
  state.queue                = queue;
  state.queueIndex           = 0;
  state.sessionStats          = { total: 0, correct: 0 };
  state.sessionWrongQuestions = [];
  state.sessionWrongChoices   = [];
  state.sessionHistory        = [];
  state.answers               = {};
  state.checked              = false;
  state.drillAnswered         = false;   // 壁打ちの答え合わせ状態を持ち越さない（マーカーの誤保存防止）
  markerDisplayOn             = false;   // 出題開始時はマーカー表示をリセット
  showScreen('study');
  renderQuestion();
}

// 「とりあえず50」: 全問から計算/1択選択を除き、壁打ち（1選択肢1答）形式で完全ランダム50択
function startRandomFifty() {
  if (state.questions.length === 0) {
    alert('問題データがありません。JSONファイルを読み込んでください。');
    return;
  }
  const queue = [];
  state.questions.forEach(q => {
    if (!isYearlyQuestion(q)) return;     // 年度別のみ（分野別・年度なしは重複が多いので除外）
    if (q.drillExcluded) return;          // 壁打ち除外指定は出さない
    if (isOnePickQuestion(q)) return;     // 計算・1択選択問題は除外
    if (isFillBlankQuestion(q)) return;
    (q.choices || []).forEach((c, i) => {
      queue.push({ question: q, choice: c, choiceIndex: i });
    });
  });
  if (queue.length === 0) {
    alert('出題できる選択肢がありません（年度別の問題のみが対象です。分野別・計算問題・1択選択問題は除外されます）。');
    return;
  }
  // シャッフルして先頭50択
  for (let i = queue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [queue[i], queue[j]] = [queue[j], queue[i]];
  }
  startDrillWithQueue(queue.slice(0, 50), 'quick50');
}

// 「とりあえず50」中に計算/1択として登録された問題をキューから除外してスキップ
function skipQuickQuestion() {
  state.queue.splice(state.queueIndex, 1);
  // queueIndex はそのまま（次の問題が繰り上がる）。末尾を超えたら結果画面へ。
  renderQuestion();
}

// ========== 出題ジェネレータ ==========
const EG_BUCKETS = [
  { key: 'recentWrong', label: '直近不正解' },
  { key: 'untried',     label: '未挑戦' },
  { key: 'streak1',     label: '1回正解' },
  { key: 'streak2',     label: '2連続正解' },
  { key: 'streak3',     label: '3連続正解' },
  { key: 'streak4',     label: '4連続正解' },
  { key: 'streak5',     label: '5連続正解' },
];
const EG_WEIGHT_OPTS = [
  { label: '多め',   val: 3 },
  { label: '普通',   val: 2 },
  { label: '少なめ', val: 1 },
  { label: '除外',   val: 0 },
];
let egCategory   = null;
let egShuffleUnit = 'question'; // 'question'=問題単位（既定） / 'choice'=選択肢単位
let egWeights  = { recentWrong: 3, untried: 3, streak1: 2, streak2: 1, streak3: 0, streak4: 0, streak5: 0 };

// history 配列 → 習熟度バケット
function bucketFromHistory(hist) {
  if (!Array.isArray(hist) || hist.length === 0) return 'untried';
  if (hist[hist.length - 1] === false) return 'recentWrong';
  let streak = 0;
  for (let i = hist.length - 1; i >= 0; i--) { if (hist[i] === true) streak++; else break; }
  if (streak >= 5) return 'streak5';
  if (streak === 4) return 'streak4';
  if (streak === 3) return 'streak3';
  if (streak === 2) return 'streak2';
  return 'streak1';
}
// progress エントリ → 習熟度バケット（ロック考慮。5連続ロック済みは常に streak5）
function bucketFromEntry(p) {
  if (p && entryStreak(p) >= STREAK_LOCK_AT) return 'streak5';
  return bucketFromHistory(p?.history);
}
// 問題の習熟度バケット（問題レベル q.id+':q'）
function questionBucket(q) { return bucketFromEntry(state.progress[q.id + ':q']); }
// 選択肢の習熟度バケット（選択肢レベル choice.id）
function choiceBucket(c) { return bucketFromEntry(state.progress[c.id]); }

// 指定分野の年度別問題（問番号が取れるもの）
function egYearQuestions(category) {
  return state.questions.filter(q => q.category === category && q.year && getQNum(q) !== 999);
}

function openExamGenerator() {
  if (state.questions.length === 0) { alert('問題データがありません。JSONファイルを読み込んでください。'); return; }
  const cats = sortCategories([...new Set(state.questions.filter(q => q.year && getQNum(q) !== 999).map(q => q.category))]);
  if (cats.length === 0) { alert('年度別の問題がありません。'); return; }
  if (!egCategory || !cats.includes(egCategory)) egCategory = cats[0];
  renderExamGeneratorCategories(cats);
  renderExamGeneratorShuffleUnit();
  renderExamGeneratorRatios();
  updateExamGeneratorInfo();
  document.getElementById('modal-exam-generator').classList.remove('hidden');
}

function closeExamGenerator() {
  document.getElementById('modal-exam-generator')?.classList.add('hidden');
}

function renderExamGeneratorCategories(cats) {
  const el = document.getElementById('eg-category-list');
  if (!el) return;
  el.innerHTML = '';
  cats.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'eg-cat-btn' + (cat === egCategory ? ' active' : '');
    btn.textContent = displayCategoryName(cat);
    btn.addEventListener('click', () => {
      egCategory = cat;
      renderExamGeneratorCategories(cats);
      updateExamGeneratorInfo();
    });
    el.appendChild(btn);
  });
}

function renderExamGeneratorShuffleUnit() {
  const el = document.getElementById('eg-shuffle-unit');
  if (!el) return;
  el.innerHTML = '';
  [
    { val: 'question', label: '問題単位' },
    { val: 'choice',   label: '選択肢単位' },
  ].forEach(o => {
    const btn = document.createElement('button');
    btn.className = 'eg-weight-btn' + (egShuffleUnit === o.val ? ' active' : '');
    btn.textContent = o.label;
    btn.addEventListener('click', () => {
      egShuffleUnit = o.val;
      renderExamGeneratorShuffleUnit();
      updateExamGeneratorInfo();
    });
    el.appendChild(btn);
  });
}

function renderExamGeneratorRatios() {
  const el = document.getElementById('eg-ratio-list');
  if (!el) return;
  el.innerHTML = '';
  EG_BUCKETS.forEach(b => {
    const row = document.createElement('div');
    row.className = 'eg-ratio-row';
    const name = document.createElement('div');
    name.className = 'eg-ratio-name';
    name.textContent = b.label;
    const opts = document.createElement('div');
    opts.className = 'eg-ratio-opts';
    EG_WEIGHT_OPTS.forEach(o => {
      const ob = document.createElement('button');
      ob.className = 'eg-weight-btn' + (egWeights[b.key] === o.val ? ' active' : '') + (o.val === 0 ? ' eg-weight-exclude' : '');
      ob.textContent = o.label;
      ob.addEventListener('click', () => {
        egWeights[b.key] = o.val;
        renderExamGeneratorRatios();
        updateExamGeneratorInfo();
      });
      opts.appendChild(ob);
    });
    row.append(name, opts);
    el.appendChild(row);
  });
}

function updateExamGeneratorInfo() {
  const el = document.getElementById('eg-info');
  if (!el) return;
  const yqs   = egYearQuestions(egCategory);
  const nums  = [...new Set(yqs.map(getQNum))];
  const counts = {};
  EG_BUCKETS.forEach(b => { counts[b.key] = 0; });
  let unitWord, methodNote;
  if (egShuffleUnit === 'choice') {
    yqs.forEach(q => (q.choices || []).forEach(c => { counts[choiceBucket(c)]++; }));
    unitWord = '選択肢';
    methodNote = '各問題番号の選択肢（イ・ロ・ハ…）を、それぞれ別の年度の同番号問題から組み合わせて出題';
  } else {
    yqs.forEach(q => { counts[questionBucket(q)]++; });
    unitWord = '問題';
    methodNote = '各問題番号を異なる年度から1問ずつ出題';
  }
  const bucketStr = EG_BUCKETS.map(b => `${b.label} ${counts[b.key]}`).join(' ／ ');
  el.innerHTML =
    `<div><strong>${displayCategoryName(egCategory)}</strong>：<strong>${nums.length}問</strong>を出題（${methodNote}）</div>
     <div class="eg-info-sub">対象${unitWord}の習熟度内訳：${bucketStr}</div>`;
}

// 出題セットを生成：問番号ごとに、割合に応じて年度を重み付き抽選（1問番号=1問）
function generateExamSet() {
  const yqs = egYearQuestions(egCategory);
  const byNum = {};
  yqs.forEach(q => { const n = getQNum(q); (byNum[n] = byNum[n] || []).push(q); });
  const nums = Object.keys(byNum).map(Number).sort((a, b) => a - b);
  const picked = [];
  nums.forEach(n => {
    const cands = byNum[n];
    const pool = [];
    cands.forEach(q => {
      const w = egWeights[questionBucket(q)] || 0;
      for (let k = 0; k < w; k++) pool.push(q);
    });
    // 割合条件に合致する候補がなければ、その問番号からランダムに選ぶ
    const chosen = pool.length > 0
      ? pool[Math.floor(Math.random() * pool.length)]
      : cands[Math.floor(Math.random() * cands.length)];
    picked.push(chosen);
  });
  return picked; // 問番号順（同じ問番号は1問のみ＝重複なし）
}

// 重み付き抽選（pool が空なら候補からランダム）
function egWeightedPick(cands, bucketFn) {
  const pool = [];
  cands.forEach(x => { const w = egWeights[bucketFn(x)] || 0; for (let k = 0; k < w; k++) pool.push(x); });
  const src = pool.length > 0 ? pool : cands;
  return src[Math.floor(Math.random() * src.length)];
}

// 選択肢単位で生成：問番号ごとに、各選択肢位置(イ/ロ/ハ…)を別年度の同番号問題から重み付き抽選で合成
function generateExamSetByChoice() {
  const yqs = egYearQuestions(egCategory);
  const byNum = {};
  yqs.forEach(q => { const n = getQNum(q); (byNum[n] = byNum[n] || []).push(q); });
  const nums = Object.keys(byNum).map(Number).sort((a, b) => a - b);
  const picked = [];
  nums.forEach(n => {
    const cands = byNum[n];
    // 計算/1択問題が混じる問番号は、選択肢合成せず問題単位で1問選ぶ（その形式を保つ）
    if (cands.some(isOnePickQuestion)) {
      picked.push(egWeightedPick(cands, questionBucket));
      return;
    }
    const basis = egWeightedPick(cands, questionBucket); // 問題文（stem）の代表
    const maxChoices = Math.max(...cands.map(q => (q.choices || []).length));
    const choices = [];
    for (let i = 0; i < maxChoices; i++) {
      const posCands = cands.map(q => (q.choices || [])[i]).filter(Boolean);
      if (posCands.length === 0) continue;
      const chosen = egWeightedPick(posCands, choiceBucket);
      choices.push({ ...chosen }); // 元の選択肢id・isCorrect等を保持（進捗は実choice.idに紐づく）
    }
    picked.push({
      id:             `gen-${egCategory}-q${n}`,   // 合成問題（番号ごとに安定id）
      category:       egCategory,
      subcategory:    basis.subcategory,
      section:        basis.section,
      year:           '出題ジェネレータ',
      source:         `出題ジェネレータ ${displayCategoryName(egCategory)} 問${n}`,
      questionText:   basis.questionText,
      questionBlocks: basis.questionBlocks,
      explanationImage: basis.explanationImage,
      tags:           [],
      choices,
    });
  });
  return picked;
}

function startExamGenerator() {
  if (!egCategory) { alert('分野を選択してください。'); return; }
  if (EG_BUCKETS.every(b => (egWeights[b.key] || 0) === 0)) {
    alert('すべて「除外」になっています。少なくとも1つは出題対象に設定してください。');
    return;
  }
  const picked = egShuffleUnit === 'choice' ? generateExamSetByChoice() : generateExamSet();
  if (picked.length === 0) { alert('出題できる問題がありません。'); return; }
  closeExamGenerator();
  if (loadInterruptedSession()) {
    pendingStartMode = { mode: 'sequential', filtered: picked, queue: picked };
    document.getElementById('modal-start-confirm').classList.remove('hidden');
    return;
  }
  _startSession('sequential', picked, { queue: picked });
}

function isCountQuestion(q) {
  return !!(q.correctAnswer && q.correctAnswer.includes('つ'));
}

function isCalcQuestion(q) {
  return q.questionType === 'calculation';
}
function isSingleSelectQuestion(q) {
  return q.questionType === 'single_select';
}
/** 計算問題 or 1択選択問題（どちらも1択選ぶUI） */
function isOnePickQuestion(q) {
  return isCalcQuestion(q) || isSingleSelectQuestion(q);
}

/**
 * 「年度別」として登録された問題か（`year` が無い / `分野別…` で始まるものは false）。
 * 分野別には年度別とほぼ同内容の問題が重複して登録されているため、
 * ランダム出題（とりあえず50）・キーワード検索の対象は年度別だけに絞る。
 */
function isYearlyQuestion(q) {
  return !!q?.year && !String(q.year).startsWith('分野別');
}

// 問題文から設問の極性を自動判定：誤答型（誤っているものを選ぶ）か正答型か
function detectPolarityFromText(text) {
  const t = String(text || '');
  // 「誤っている／適切でない／正しくない／不適切／妥当でない／当てはまらない」等 → 誤答型
  // （「誤差」等の誤検出を避けるため、誤は っ/り/ら が続く場合のみ）
  if (/誤(っ|り|ら)|適切でない|適切ではない|正しくない|不適切|不適当|妥当でない|妥当ではない|当てはまらない/.test(t)) {
    return 'incorrect';
  }
  return 'correct';
}
/**
 * 1択問題の設問極性を返す。'correct'=正しいものを選ぶ / 'incorrect'=誤っているものを選ぶ。
 * 明示設定 q.answerPolarity を優先し、なければ問題文から自動判定。
 */
function getQuestionPolarity(q) {
  if (q?.answerPolarity === 'correct' || q?.answerPolarity === 'incorrect') return q.answerPolarity;
  return detectPolarityFromText(q?.questionText || '');
}
/**
 * 1択問題における、その選択肢の「記述としての事実上の正誤」を返す。
 * 正答型：答えの選択肢(isCorrect)が正しい記述。
 * 誤答型：答えの選択肢(isCorrect)が誤った記述、残りは正しい記述。
 */
function singleSelectStatementTrue(q, c) {
  const findsWrong = getQuestionPolarity(q) === 'incorrect';
  return findsWrong ? !c.isCorrect : !!c.isCorrect;
}

// 計算問題用：クリックして1択選ぶ選択肢アイテム
function createChoiceItemCalc(choice, label) {
  const item = document.createElement('div');
  item.className = 'choice-item choice-item-calc';
  item.dataset.cid = choice.id;

  const top = document.createElement('div');
  top.className = 'choice-item-top';

  const lbl = document.createElement('span');
  lbl.className = 'choice-label';
  lbl.textContent = label + '.';

  const txt = document.createElement('div');
  txt.className = 'choice-item-text';
  txt.innerHTML = renderText(choice.text);

  const bmBtn = document.createElement('button');
  bmBtn.className = 'choice-bm-btn' + (state.choiceBookmarks.has(choice.id) ? ' bookmarked' : '');
  bmBtn.dataset.cid = choice.id;
  bmBtn.textContent = state.choiceBookmarks.has(choice.id) ? '★' : '☆';
  bmBtn.title = 'この選択肢をブックマーク';
  bmBtn.addEventListener('click', e => { e.stopPropagation(); toggleChoiceBookmark(choice.id); });

  top.append(lbl);
  const bmBtnRow = document.createElement('div');
  bmBtnRow.className = 'choice-item-btns';
  bmBtnRow.appendChild(bmBtn);
  item.append(top, txt, bmBtnRow);
  item.addEventListener('click', () => selectCalcAnswer(choice.id));
  return item;
}

function selectCalcAnswer(choiceId) {
  if (state.checked) return;
  state.answers.__calc__ = choiceId;

  document.querySelectorAll('.choice-item-calc').forEach(item => {
    item.classList.toggle('calc-selected', item.dataset.cid === choiceId);
  });

  document.getElementById('btn-check').disabled = false;
  const examNext = document.getElementById('btn-exam-next');
  if (examNext) examNext.disabled = false;
}

function parseCorrectCount(q) {
  const m = (q.correctAnswer || '').match(/\((\d+)\)/);
  return m ? parseInt(m[1]) : null;
}

function getTodayTier() {
  const log   = loadStudyLog();
  const entry = log[getLocalDateStr()] || {};
  const n     = entry.answered || 0;
  return n >= 250 ? 'diamond'
       : n >= 200 ? 'platinum'
       : n >= 150 ? 'gold'
       : n >= 100 ? 'silver'
       : n >=  50 ? 'copper'
       : '';
}

const STUDY_CARD_TIER_CLASSES = [
  'tier-border-copper','tier-border-silver','tier-border-gold',
  'tier-border-platinum','tier-border-diamond'
];
function updateStudyCardTier() {
  document.body.classList.remove(...STUDY_CARD_TIER_CLASSES);
  const tier = getTodayTier();
  if (tier) document.body.classList.add('tier-border-' + tier);
}

function renderQuestion() {
  if (state.queueIndex >= state.queue.length) {
    showSessionResult();
    return;
  }
  const q = state.queue[state.queueIndex];
  state.answers = {};
  state.checked = false;

  document.getElementById('study-progress').textContent =
    `${state.queueIndex + 1} / ${state.queue.length}`;
  document.getElementById('study-progress-bar').style.width =
    `${(state.queueIndex / state.queue.length) * 100}%`;

  document.getElementById('question-source').textContent =
    `${q.category}｜${q.source || q.id}`;

  // 直近3回の正誤ドット
  const qHistEl = document.getElementById('question-history-dots');
  if (qHistEl) {
    qHistEl.innerHTML = '';
    qHistEl.appendChild(makeHistoryDots(state.progress[q.id + ':q']));
  }

  // タグ表示
  const tagsEl = document.getElementById('question-tags');
  if (tagsEl) {
    tagsEl.innerHTML = '';
    (q.tags || []).forEach(tag => {
      const span = document.createElement('span');
      span.className = 'question-tag-chip';
      span.textContent = '#' + tag;
      tagsEl.appendChild(span);
    });
    tagsEl.classList.toggle('hidden', !(q.tags && q.tags.length > 0));
  }

  // 問題文・画像（ブロック形式 or 旧形式）
  const blocksContainer = document.getElementById('question-blocks');
  const qtEl   = document.getElementById('question-text');
  const imgArea = document.getElementById('question-image-area');
  const qBlocks = getQuestionBlocks(q);

  if (qBlocks.length > 0) {
    if (qtEl)   qtEl.classList.add('hidden');
    if (imgArea) { imgArea.innerHTML = ''; imgArea.classList.add('hidden'); }
    if (blocksContainer) {
      renderBlocksToEl(qBlocks, blocksContainer);
      blocksContainer.classList.remove('hidden');
    }
  } else {
    if (blocksContainer) { blocksContainer.innerHTML = ''; blocksContainer.classList.add('hidden'); }
    if (qtEl) { qtEl.classList.add('hidden'); }
    if (imgArea) { imgArea.innerHTML = ''; imgArea.classList.add('hidden'); }
  }

  const list = document.getElementById('choices-list');
  list.innerHTML = '';
  if (isOnePickQuestion(q)) {
    (q.choices || []).forEach((c, i) => {
      list.appendChild(createChoiceItemCalc(c, CHOICE_LABELS[i] || String(i + 1)));
    });
  } else {
    (q.choices || []).forEach((c, i) => {
      list.appendChild(createChoiceItem(c, CHOICE_LABELS[i] || String(i + 1)));
    });
  }

  // 計算問題 / 1択選択チェックボックス更新
  const studyCalcCheck   = document.getElementById('study-calc-mode-check');
  const studySingleCheck = document.getElementById('study-single-select-check');
  const studyCalcRow     = document.getElementById('study-calc-mode-row');
  if (studyCalcCheck)   studyCalcCheck.checked   = isCalcQuestion(q);
  if (studySingleCheck) studySingleCheck.checked = isSingleSelectQuestion(q);
  if (studyCalcRow)     studyCalcRow.classList.toggle('hidden', !!state.examMode);

  // ブックマークボタン更新
  const bmBtn = document.getElementById('btn-bookmark');
  if (bmBtn) {
    const bmed = state.bookmarks.has(q.id);
    bmBtn.textContent = bmed ? '★' : '☆';
    bmBtn.classList.toggle('bookmarked', bmed);
  }

  // マーカー適用
  _applyHighlights(q);
  _updateMarkerBtn();
  applyTempMarkers(q);   // 一時マーカー（薄黄緑）を再描画

  // メモセクション
  const memoSection = document.getElementById('memo-section');
  const memoInput   = document.getElementById('memo-input');
  const memoBadge   = document.getElementById('memo-has-badge');
  if (memoSection && memoInput) {
    if (state.examMode) {
      memoSection.classList.add('hidden');
    } else {
      memoSection.classList.remove('hidden');
      const noteText = getNote(q.id);
      memoInput.value = noteText;
      memoInput.dataset.qid = q.id;
      // メモ欄を閉じた状態にリセット
      document.getElementById('memo-body')?.classList.add('hidden');
      document.getElementById('memo-toggle-icon').textContent = '▶';
      if (memoBadge) memoBadge.classList.toggle('hidden', !noteText.trim());
    }
  }

  // 模試モード / 通常モード の切り替え
  const checkArea     = document.getElementById('check-area');
  const examNextArea  = document.getElementById('exam-next-area');
  const examCountArea = document.getElementById('exam-count-area');
  if (state.examMode) {
    checkArea.classList.add('hidden');
    examNextArea.classList.remove('hidden');
    document.getElementById('btn-exam-next').disabled = true;
    updateExamSubjectProgress();
    if (isCountQuestion(q)) {
      // 選択肢の○/×ボタンをチェックボックスに差し替え
      list.querySelectorAll('.choice-item-btns').forEach(el => el.remove());
      list.querySelectorAll('.choice-item').forEach((item, i) => {
        const cid = item.dataset.cid;
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.className = 'exam-count-cb';
        cb.dataset.cid = cid;
        cb.addEventListener('change', () => {
          const checked = [...list.querySelectorAll('.exam-count-cb:checked')].map(el => el.dataset.cid);
          if (!state.answers.__checked__) state.answers.__checked__ = [];
          state.answers.__checked__ = checked;
        });
        item.querySelector('.choice-item-top').appendChild(cb);
      });
      if (examCountArea) { examCountArea.classList.remove('hidden'); renderCountSelector(); }
    } else {
      if (examCountArea) examCountArea.classList.add('hidden');
    }
  } else {
    checkArea.classList.remove('hidden');
    examNextArea.classList.add('hidden');
    if (examCountArea) examCountArea.classList.add('hidden');
    document.getElementById('btn-check').disabled = true;
  }
  document.getElementById('next-area').classList.add('hidden');

  // 前後ナビボタンの状態を更新
  const prevNavBtn = document.getElementById('btn-study-prev');
  const nextNavBtn = document.getElementById('btn-study-next');
  if (prevNavBtn) prevNavBtn.disabled = (state.queueIndex <= 0);
  if (nextNavBtn) nextNavBtn.disabled = true; // 答え合わせ後に有効化

  // カード枠をティアカラーに更新
  updateStudyCardTier();
}

function createChoiceItem(choice, label) {
  const item = document.createElement('div');
  item.className = 'choice-item';
  item.dataset.cid = choice.id;

  const top = document.createElement('div');
  top.className = 'choice-item-top';

  const lbl = document.createElement('span');
  lbl.className = 'choice-label';
  lbl.textContent = label + '.';

  const txt = document.createElement('div');
  txt.className = 'choice-item-text';
  txt.innerHTML = renderText(choice.text);

  const btns = document.createElement('div');
  btns.className = 'choice-item-btns';

  const maruBtn = document.createElement('button');
  maruBtn.className = 'choice-judge-btn maru';
  maruBtn.textContent = '○';
  maruBtn.addEventListener('click', () => selectChoiceAnswer(choice.id, 'maru'));

  const batsuBtn = document.createElement('button');
  batsuBtn.className = 'choice-judge-btn batsu';
  batsuBtn.textContent = '×';
  batsuBtn.addEventListener('click', () => selectChoiceAnswer(choice.id, 'batsu'));

  const bmBtn = document.createElement('button');
  bmBtn.className = 'choice-bm-btn' + (state.choiceBookmarks.has(choice.id) ? ' bookmarked' : '');
  bmBtn.dataset.cid = choice.id;
  bmBtn.textContent = state.choiceBookmarks.has(choice.id) ? '★' : '☆';
  bmBtn.title = 'この選択肢をブックマーク';
  bmBtn.addEventListener('click', e => { e.stopPropagation(); toggleChoiceBookmark(choice.id); });

  btns.append(maruBtn, batsuBtn, bmBtn);
  top.append(lbl);

  // 選択肢ごとの直近3回ドット（テキスト行の上に表示）
  const choiceHistDots = makeHistoryDots(state.progress[choice.id]);
  choiceHistDots.classList.add('choice-hist-dots');

  if (choice.image) {
    const imgWrap = document.createElement('div');
    imgWrap.className = 'choice-img-resizable';
    if (choice.imageWidth) imgWrap.style.width = choice.imageWidth + 'px';
    const choiceImg = document.createElement('img');
    choiceImg.src = choice.image;
    choiceImg.className = 'choice-item-image';
    choiceImg.alt = '選択肢画像';
    choiceImg.loading = 'lazy';
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'choice-img-resize-handle';
    imgWrap.append(choiceImg, resizeHandle);
    _addResizeHandle(resizeHandle, choiceImg, () => choice.id);
    item.append(choiceHistDots, top, txt, imgWrap, btns);
  } else {
    item.append(choiceHistDots, top, txt, btns);
  }
  return item;
}

function selectChoiceAnswer(choiceId, answer) {
  if (state.checked) return;
  state.answers[choiceId] = answer;

  const item = document.querySelector(`.choice-item[data-cid="${choiceId}"]`);
  if (item) {
    item.querySelectorAll('.choice-judge-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.classList.contains(answer));
    });
  }

  const q = state.queue[state.queueIndex];
  const allAnswered = q.choices.every(c => state.answers[c.id]);
  document.getElementById('btn-check').disabled = !allAnswered;
  const examNext = document.getElementById('btn-exam-next');
  if (examNext) examNext.disabled = !allAnswered;

  // タッチデバイスのみ：次の未回答選択肢カードを画面上部へスクロール
  if ('ontouchstart' in window && !allAnswered) {
    const nextItem = [...document.querySelectorAll('#choices-list .choice-item')]
      .find(el => !state.answers[el.dataset.cid]);
    if (nextItem) {
      const headerH = document.querySelector('.app-header')?.offsetHeight ?? 0;
      const top = nextItem.getBoundingClientRect().top + window.scrollY - headerH - 8;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }
}

function renderCountSelector() {
  const area = document.getElementById('exam-count-area');
  if (!area) return;
  area.innerHTML = '';

  const label = document.createElement('div');
  label.className = 'exam-count-label';
  label.textContent = '正解の数を選んでください（1〜5）';

  const btnRow = document.createElement('div');
  btnRow.className = 'exam-count-btns';

  for (let n = 1; n <= 5; n++) {
    const btn = document.createElement('button');
    btn.className = 'exam-count-btn';
    btn.textContent = String(n);
    btn.dataset.count = n;
    btn.addEventListener('click', () => selectCountAnswer(n));
    btnRow.appendChild(btn);
  }

  area.append(label, btnRow);
}

function selectCountAnswer(n) {
  state.answers = { __count__: n, __checked__: state.answers.__checked__ || [] };
  document.querySelectorAll('.exam-count-btn').forEach(btn => {
    btn.classList.toggle('selected', parseInt(btn.dataset.count) === n);
  });
  const examNext = document.getElementById('btn-exam-next');
  if (examNext) examNext.disabled = false;
}

function checkAnswers() {
  if (state.checked) return;
  state.checked = true;

  const q = state.queue[state.queueIndex];

  // ── 1択選択モード（計算問題 or 選択肢1択問題） ──
  if (isOnePickQuestion(q)) {
    const correctChoice = q.choices.find(c => c.isCorrect);
    const userChoiceId  = state.answers.__calc__;
    const isRight       = !!correctChoice && userChoiceId === correctChoice.id;

    if (!_checkNoRecord) {
      if (isCalcQuestion(q)) recordAnswer(q.id + ':calc', isRight); // 計算問題専用記録
      recordAnswer(q.id + ':q', isRight);  // 問題レベル履歴（直近3回表示用）
      state.sessionStats.total++;
      if (isRight) state.sessionStats.correct++;
      if (!isRight) {
        if (correctChoice) state.sessionWrongChoices.push({ question: q, choice: correctChoice, choiceIndex: q.choices.indexOf(correctChoice) });
        state.sessionWrongQuestions.push(q);
      }
    }

    q.choices.forEach((c, i) => {
      const item = document.querySelector(`.choice-item[data-cid="${c.id}"]`);
      if (!item) return;
      item.style.cursor = 'default';

      if (c.isCorrect) {
        item.classList.add('result-correct');
        const resultRow = document.createElement('div');
        resultRow.className = 'choice-result-row';
        const lbl = document.createElement('div');
        lbl.className = 'choice-result-label is-correct';
        const lblText = document.createElement('span');
        lblText.textContent = c.id === userChoiceId ? '✓ 正解（あなたの選択）' : '← 正解';
        lbl.appendChild(lblText);
        const exp = document.createElement('div');
        exp.className = 'choice-explanation';
        exp.innerHTML = renderText(c.explanation || '');
        const aiBtn = document.createElement('button');
        aiBtn.className = 'btn-ai-explain';
        aiBtn.textContent = '📋 AI解説プロンプト';
        aiBtn.addEventListener('click', () => {
          openExplainOnClaude(q, c, true, 'maru');
          const orig = aiBtn.textContent;
          aiBtn.textContent = '✅ 解説プロンプトをコピーしました';
          setTimeout(() => { aiBtn.textContent = orig; }, 3000);
        });
        resultRow.append(lbl, exp);
        const expImg = makeChoiceExpImage(c);
        if (expImg) resultRow.appendChild(expImg);
        resultRow.appendChild(aiBtn);
        item.appendChild(resultRow);
      } else if (c.id === userChoiceId) {
        item.classList.add('result-incorrect');
        const resultRow = document.createElement('div');
        resultRow.className = 'choice-result-row';
        const lbl = document.createElement('div');
        lbl.className = 'choice-result-label is-incorrect';
        const lblText = document.createElement('span');
        lblText.textContent = '✗ あなたの選択（不正解）';
        lbl.appendChild(lblText);
        const exp = document.createElement('div');
        exp.className = 'choice-explanation';
        exp.innerHTML = renderText(c.explanation || '');
        const aiBtn = document.createElement('button');
        aiBtn.className = 'btn-ai-explain';
        aiBtn.textContent = '📋 AI解説プロンプト';
        aiBtn.addEventListener('click', () => {
          openExplainOnClaude(q, c, false, 'maru');
          const orig = aiBtn.textContent;
          aiBtn.textContent = '✅ 解説プロンプトをコピーしました';
          setTimeout(() => { aiBtn.textContent = orig; }, 3000);
        });
        resultRow.append(lbl, exp);
        const expImg = makeChoiceExpImage(c);
        if (expImg) resultRow.appendChild(expImg);
        resultRow.appendChild(aiBtn);
        item.appendChild(resultRow);
      } else if (isSingleSelectQuestion(q)) {
        // 1択問題：選ばなかった（誤りの）選択肢にも解説を表示
        const resultRow = document.createElement('div');
        resultRow.className = 'choice-result-row';
        const lbl = document.createElement('div');
        lbl.className = 'choice-result-label is-other';
        const lblText = document.createElement('span');
        lblText.textContent = '解説（誤り）';
        lbl.appendChild(lblText);
        const exp = document.createElement('div');
        exp.className = 'choice-explanation';
        exp.innerHTML = renderText(c.explanation || '');
        const aiBtn = document.createElement('button');
        aiBtn.className = 'btn-ai-explain';
        aiBtn.textContent = '📋 AI解説プロンプト';
        aiBtn.addEventListener('click', () => {
          openExplainOnClaude(q, c, false, 'maru');
          const orig = aiBtn.textContent;
          aiBtn.textContent = '✅ 解説プロンプトをコピーしました';
          setTimeout(() => { aiBtn.textContent = orig; }, 3000);
        });
        resultRow.append(lbl, exp);
        const expImg = makeChoiceExpImage(c);
        if (expImg) resultRow.appendChild(expImg);
        resultRow.appendChild(aiBtn);
        item.appendChild(resultRow);
      }
    });

    // 計算問題は問題単位1エントリ（選択肢全択ではなく）
    if (!_checkNoRecord) {
      const selectedChoice = q.choices.find(c => c.id === userChoiceId);
      const selectedIdx    = q.choices.findIndex(c => c.id === userChoiceId);
      const correctIdx     = q.choices.findIndex(c => c.isCorrect);
      state.sessionHistory.push({
        question:     q,
        isCalcMode:   isCalcQuestion(q),     // 計算問題フラグ（後方互換）
        isOnePickMode: true,                  // 1択モード統合フラグ
        choiceResults: [{
          choice:             correctChoice,
          choiceIndex:        correctIdx,
          isRight:            isRight,
          userAnswer:         'maru',
          selectedId:         userChoiceId,
          selectedChoice:     selectedChoice,
          selectedChoiceIndex: selectedIdx,
        }],
      });
    }

    // 解説画像（問題全体）
    renderQuestionExplanationImage(document.getElementById('explanation-image-area'), q);

    if (!_checkNoRecord) {
      recordStudyActivity(1, isRight ? 1 : 0, 1, q.category);
      updateHeaderStats();
      updateStudyCardTier();
    }
    document.getElementById('check-area').classList.add('hidden');
    document.getElementById('next-area').classList.remove('hidden');
    const nextNavBtnC = document.getElementById('btn-study-next');
    if (nextNavBtnC) nextNavBtnC.disabled = false;
    const { total, correct } = state.sessionStats;
    const accText = total > 0 ? `今回合計: ${correct}/${total} (${Math.round((correct / total) * 100)}%)` : '';
    document.getElementById('session-acc').textContent =
      `この問題: ${isRight ? '✓ 正解' : '✗ 不正解'}` + (accText ? ` ／ ${accText}` : '');
    _autoRevealMarkersOnCheck(q);
    return;
  }

  let qCorrect = 0;

  (q.choices || []).forEach((c, i) => {
    const userSaysCorrect = state.answers[c.id] === 'maru';
    const isRight = userSaysCorrect === c.isCorrect;

    if (!_checkNoRecord) {
      recordAnswer(c.id, isRight);
      state.sessionStats.total++;
      if (isRight) { state.sessionStats.correct++; qCorrect++; }
      else { state.sessionWrongChoices.push({ question: q, choice: c, choiceIndex: i }); }
    } else {
      if (isRight) qCorrect++;
    }

    const item = document.querySelector(`.choice-item[data-cid="${c.id}"]`);
    if (!item) return;

    item.classList.add(isRight ? 'result-correct' : 'result-incorrect');
    item.querySelectorAll('.choice-judge-btn').forEach(btn => {
      btn.disabled = true;
      // ユーザーの回答(○/×)を表示。前の問題に戻った時も選択状態を復元する。
      btn.classList.toggle('selected', !!state.answers[c.id] && btn.classList.contains(state.answers[c.id]));
    });

    const resultRow = document.createElement('div');
    resultRow.className = 'choice-result-row';

    const lbl = document.createElement('div');
    lbl.className = 'choice-result-label ' + (isRight ? 'is-correct' : 'is-incorrect');

    const lblText = document.createElement('span');
    lblText.textContent = isRight
      ? `✓ 正解 — この記述は「${c.isCorrect ? '正しい' : '誤り'}」`
      : `✗ 不正解 — この記述は「${c.isCorrect ? '正しい' : '誤り'}」`;

    const histDots = makeHistoryDots(state.progress[c.id]);

    lbl.append(lblText, histDots);

    const exp = document.createElement('div');
    exp.className = 'choice-explanation';
    exp.innerHTML = renderText(c.explanation || '');

    const aiBtn = document.createElement('button');
    aiBtn.className = 'btn-ai-explain';
    aiBtn.textContent = '📋 AI解説プロンプト';
    aiBtn.addEventListener('click', () => {
      openExplainOnClaude(q, c, isRight, state.answers[c.id]);
      const orig = aiBtn.textContent;
      aiBtn.textContent = '✅ コピー済み';
      setTimeout(() => { aiBtn.textContent = orig; }, 3000);
    });

    resultRow.append(lbl, exp);
    const expImg = makeChoiceExpImage(c);
    if (expImg) resultRow.appendChild(expImg);
    resultRow.appendChild(aiBtn);
    item.appendChild(resultRow);
  });

  // 解説画像ボタン（画像がある場合のみ）
  renderQuestionExplanationImage(document.getElementById('explanation-image-area'), q);

  if (!_checkNoRecord) {
    // 問題レベル履歴（直近3回表示用）
    recordAnswer(q.id + ':q', qCorrect === q.choices.length);
    // 1択以上間違えた問題を記録
    if (qCorrect < q.choices.length) state.sessionWrongQuestions.push(q);

    // 出題履歴に追加
    state.sessionHistory.push({
      question: q,
      choiceResults: (q.choices || []).map((c, i) => ({
        choice:      c,
        choiceIndex: i,
        isRight:     (state.answers[c.id] === 'maru') === c.isCorrect,
        userAnswer:  state.answers[c.id],
      })),
    });

    // 学習ログ記録
    recordStudyActivity(q.choices.length, qCorrect, 1, q.category);
    updateHeaderStats();
    updateStudyCardTier();
  }

  document.getElementById('check-area').classList.add('hidden');
  document.getElementById('next-area').classList.remove('hidden');
  const nextNavBtnR = document.getElementById('btn-study-next');
  if (nextNavBtnR) nextNavBtnR.disabled = false;

  const { total, correct } = state.sessionStats;
  const accText2 = total > 0 ? ` ／ 今回合計: ${correct}/${total} (${Math.round((correct / total) * 100)}%)` : '';
  document.getElementById('session-acc').textContent =
    `この問題: ${qCorrect}/${q.choices.length} 選択肢正解${accText2}`;

  _autoRevealMarkersOnCheck(q);
}

// ========== Exam Mode ==========
function startExamMode(filtered) {
  flushSessionTime();
  startSessionTimer();
  const limitMin = parseInt(document.getElementById('exam-time-limit').value || '0');
  state.quickMode          = false;
  state.mode               = 'sequential';
  state.queue              = buildQueue(filtered, 'sequential');
  state.queueIndex         = 0;
  state.sessionStats       = { total: 0, correct: 0 };
  state.sessionWrongQuestions = [];
  state.sessionWrongChoices   = [];
  state.answers            = {};
  state.checked            = false;
  state.examMode           = true;
  state.examTimeLimitMin   = limitMin;
  state.examElapsedSec     = 0;
  state.examAnswers        = {};
  state.examSubmitSet      = null;

  // 科目グループマップを構築
  state.examSubjectGroups  = {};
  state.queue.forEach((q, qi) => {
    const gk = getExamGroup(q);
    if (!gk) return;
    if (!state.examSubjectGroups[gk]) {
      const cfg = EXAM_SUBJECT_GROUPS[gk];
      state.examSubjectGroups[gk] = { queueIndices: [], required: cfg.required, label: cfg.label, maxScore: cfg.maxScore };
    }
    state.examSubjectGroups[gk].queueIndices.push(qi);
  });

  // タイマー開始
  const wrap    = document.getElementById('exam-timer-wrap');
  const fill    = document.getElementById('exam-timer-fill');
  const timeEl  = document.getElementById('exam-timer-text');
  if (wrap) wrap.classList.remove('hidden');

  if (state.examTimerInterval) clearInterval(state.examTimerInterval);
  state.examTimerInterval = setInterval(() => {
    state.examElapsedSec++;
    const m = Math.floor(state.examElapsedSec / 60);
    const s = state.examElapsedSec % 60;
    const elapsed = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    if (limitMin > 0) {
      const remaining = limitMin * 60 - state.examElapsedSec;
      if (remaining <= 0) { finishExam(); return; }
      const rm = Math.floor(remaining / 60), rs = remaining % 60;
      if (timeEl) timeEl.textContent = `残り ${String(rm).padStart(2,'0')}:${String(rs).padStart(2,'0')}`;
      if (fill)   fill.style.width = `${Math.min(100, (state.examElapsedSec / (limitMin * 60)) * 100)}%`;
    } else {
      if (timeEl) timeEl.textContent = elapsed;
    }
  }, 1000);

  markerDisplayOn = false;   // 出題開始時はマーカー表示をリセット
  showScreen('study');
  renderQuestion();
}

function examNextQuestion() {
  state.examAnswers[state.queueIndex] = { ...state.answers };
  state.queueIndex++;
  if (state.queueIndex >= state.queue.length) {
    checkExamSubmission();
  } else {
    state.answers = {};
    state.checked = false;
    renderQuestion();
    updateExamSubjectProgress();
  }
}

function examSkipQuestion() {
  state.examAnswers[state.queueIndex] = { __skipped__: true };
  state.queueIndex++;
  if (state.queueIndex >= state.queue.length) {
    checkExamSubmission();
  } else {
    state.answers = {};
    state.checked = false;
    renderQuestion();
    updateExamSubjectProgress();
  }
}

function updateExamSubjectProgress() {
  const el = document.getElementById('exam-subject-progress');
  if (!el) return;
  const groups = state.examSubjectGroups;
  if (Object.keys(groups).length === 0) { el.classList.add('hidden'); return; }
  el.classList.remove('hidden');
  el.innerHTML = Object.entries(groups).map(([gk, g]) => {
    const answered = g.queueIndices.filter(qi => isExamAnswered(state.examAnswers[qi])).length;
    const total    = g.queueIndices.length;
    const req      = g.required;
    const need     = req !== null ? req : total;
    const ok       = answered >= need;
    const reqStr   = req !== null ? `/${req}提出` : `/${total}`;
    return `<span class="exam-subj-pill${ok ? ' ok' : ''}">${g.label} ${answered}${reqStr}</span>`;
  }).join('');
}

function checkExamSubmission() {
  const hasSelective = Object.values(state.examSubjectGroups).some(g => g.required !== null);
  if (hasSelective) {
    showExamSubmitModal();
  } else {
    finishExam();
  }
}

function showExamSubmitModal() {
  const modal = document.getElementById('modal-exam-submit');
  if (!modal) { finishExam(); return; }

  const body = document.getElementById('exam-submit-body');
  body.innerHTML = '';

  Object.entries(state.examSubjectGroups).forEach(([gk, g]) => {
    const answeredIndices = g.queueIndices.filter(qi => isExamAnswered(state.examAnswers[qi]));
    const req   = g.required;
    const total = g.queueIndices.length;

    const section = document.createElement('div');
    section.className = 'exam-submit-section';

    const header = document.createElement('div');
    header.className = 'exam-submit-section-header';

    if (req === null) {
      // 全問必須 — ステータス表示のみ
      const miss = total - answeredIndices.length;
      header.innerHTML = `<strong>${g.label}</strong>　回答済み ${answeredIndices.length}/${total}問`;
      section.appendChild(header);
      if (miss > 0) {
        const w = document.createElement('div');
        w.className = 'exam-submit-warn-inline';
        w.textContent = `⚠ ${miss}問未回答のまま提出されます（0点）`;
        section.appendChild(w);
      }
    } else {
      const needsSelection = answeredIndices.length > req;
      if (needsSelection) {
        header.innerHTML = `<strong>${g.label}</strong>　${answeredIndices.length}問回答済み →
          <span id="exam-submit-sel-${gk}" class="exam-submit-sel-count">0</span>/${req}問選択（${req}問提出）`;
        section.appendChild(header);

        const listEl = document.createElement('div');
        listEl.className = 'exam-submit-list';

        answeredIndices.forEach((qi, idx) => {
          const q = state.queue[qi];
          const itemLabel = document.createElement('label');
          itemLabel.className = 'exam-submit-item';

          const cb = document.createElement('input');
          cb.type = 'checkbox';
          cb.dataset.qi    = String(qi);
          cb.dataset.group = gk;
          cb.className     = 'exam-submit-cb';
          cb.checked       = idx < req; // 最初の req 問をプリチェック

          cb.addEventListener('change', () => {
            const all = [...document.querySelectorAll(`.exam-submit-cb[data-group="${gk}"]`)];
            if (all.filter(el => el.checked).length > req) { cb.checked = false; return; }
            updateExamSubmitSelCounter(gk);
            updateExamSubmitConfirmBtn();
          });

          const srcSpan = document.createElement('span');
          srcSpan.className   = 'exam-submit-src';
          srcSpan.textContent = q.source || q.id;

          const catSpan = document.createElement('span');
          catSpan.className   = 'exam-submit-cat';
          catSpan.textContent = (q.category || '').replace('ガス技術：', '');

          itemLabel.append(cb, srcSpan, catSpan);
          listEl.appendChild(itemLabel);
        });

        section.appendChild(listEl);
        setTimeout(() => updateExamSubmitSelCounter(gk), 0);
      } else {
        // 回答数 ≤ required — 全自動提出
        const shortfall = req - answeredIndices.length;
        header.innerHTML = `<strong>${g.label}</strong>　${answeredIndices.length}問回答済み（${req}問提出必要）`;
        section.appendChild(header);
        if (shortfall > 0) {
          const w = document.createElement('div');
          w.className = 'exam-submit-warn-inline';
          w.textContent = `⚠ ${shortfall}問足りないため、回答済みの${answeredIndices.length}問で提出されます`;
          section.appendChild(w);
        }
      }
    }

    body.appendChild(section);
  });

  setTimeout(() => updateExamSubmitConfirmBtn(), 0);
  modal.classList.remove('hidden');
}

function updateExamSubmitSelCounter(gk) {
  const cnt = [...document.querySelectorAll(`.exam-submit-cb[data-group="${gk}"]:checked`)].length;
  const el  = document.getElementById(`exam-submit-sel-${gk}`);
  if (el) el.textContent = cnt;
}

function updateExamSubmitConfirmBtn() {
  const btn = document.getElementById('btn-exam-submit-confirm');
  if (!btn) return;
  let valid = true;
  Object.entries(state.examSubjectGroups).forEach(([gk, g]) => {
    if (g.required === null) return;
    const answered = g.queueIndices.filter(qi => isExamAnswered(state.examAnswers[qi])).length;
    if (answered > g.required) {
      const checked = [...document.querySelectorAll(`.exam-submit-cb[data-group="${gk}"]:checked`)].length;
      if (checked !== g.required) valid = false;
    }
  });
  btn.disabled = !valid;
}

function confirmExamSubmission() {
  const submitSet = new Set();
  Object.entries(state.examSubjectGroups).forEach(([gk, g]) => {
    const answered = g.queueIndices.filter(qi => isExamAnswered(state.examAnswers[qi]));
    if (g.required === null || answered.length <= g.required) {
      answered.forEach(qi => submitSet.add(qi));
    } else {
      document.querySelectorAll(`.exam-submit-cb[data-group="${gk}"]:checked`).forEach(cb => {
        submitSet.add(parseInt(cb.dataset.qi));
      });
    }
  });
  // グループ外の問題（カスタムカテゴリ等）は全て含める
  state.queue.forEach((q, qi) => {
    if (!getExamGroup(q) && isExamAnswered(state.examAnswers[qi])) submitSet.add(qi);
  });

  state.examSubmitSet = submitSet;
  document.getElementById('modal-exam-submit').classList.add('hidden');
  finishExam();
}

function finishExam() {
  if (state.examTimerInterval) { clearInterval(state.examTimerInterval); state.examTimerInterval = null; }
  const wrap = document.getElementById('exam-timer-wrap');
  if (wrap) wrap.classList.add('hidden');

  const elapsedMin = Math.floor(state.examElapsedSec / 60);
  const elapsedSec = state.examElapsedSec % 60;
  const timeStr    = `${String(elapsedMin).padStart(2,'0')}:${String(elapsedSec).padStart(2,'0')}`;

  let totalChoices = 0, correctChoices = 0;

  const results = state.queue.map((q, qi) => {
    // 提出セットが設定されていてこの問題が含まれない場合 → 未提出
    const inSubmit = !state.examSubmitSet || state.examSubmitSet.has(qi);
    const saved    = state.examAnswers[qi] || {};

    if (!inSubmit || !isExamAnswered(saved)) {
      return { q, qi, allRight: false, qCorrect: 0, totalInQ: 0, choiceResults: [], submitted: false };
    }

    let qCorrect = 0, allRight = false, choiceResults = [];

    if (isCountQuestion(q) && saved.__count__ !== undefined) {
      const correctCount = parseCorrectCount(q);
      allRight  = saved.__count__ === correctCount;
      qCorrect  = allRight ? 1 : 0;
      totalChoices += 1;
      if (allRight) correctChoices++;
      const checkedIds = saved.__checked__ || [];
      choiceResults = [{ isCountType: true, userCount: saved.__count__, correctCount, isRight: allRight, checkedIds }];
      if (!allRight) {
        (q.choices || []).forEach((c, i) => state.sessionWrongChoices.push({ question: q, choice: c, choiceIndex: i }));
      }
    } else {
      choiceResults = (q.choices || []).map(c => {
        totalChoices++;
        const userSays = saved[c.id] === 'maru';
        const isRight  = userSays === c.isCorrect;
        if (isRight) { correctChoices++; qCorrect++; }
        recordAnswer(c.id, isRight);
        return { choice: c, isRight };
      });
      allRight = qCorrect === (q.choices || []).length;
    }

    if (!allRight) state.sessionWrongQuestions.push(q);
    return { q, qi, allRight, qCorrect, totalInQ: isCountQuestion(q) ? 1 : (q.choices||[]).length, choiceResults, submitted: true };
  });

  results.filter(r => r.submitted && r.totalInQ > 0).forEach(r => {
    recordStudyActivity(r.totalInQ, r.qCorrect, 1, r.q.category);
  });

  const submittedResults = results.filter(r => r.submitted);
  const correctQ = submittedResults.filter(r => r.allRight).length;
  const totalQ   = submittedResults.length;

  document.getElementById('result-score').textContent = `${correctQ} / ${totalQ}`;
  document.getElementById('result-pct').textContent   = totalQ > 0 ? `${Math.round((correctQ / totalQ) * 100)}%` : '-';

  const sec = document.getElementById('exam-result-section');
  if (sec) {
    sec.classList.remove('hidden');
    const summary = document.getElementById('exam-result-summary');

    // 科目別スコア行
    const groups = state.examSubjectGroups;
    let subjectRows = '';
    let totalScore = 0, maxTotalScore = 0;
    const allStdSubjects = ['法令', '基礎', 'ガス技術'];
    const isFullExam = allStdSubjects.every(s => groups[s]);

    Object.entries(groups).forEach(([gk, g]) => {
      const gResults  = submittedResults.filter(r => g.queueIndices.includes(r.qi));
      const gCorrect  = gResults.filter(r => r.allRight).length;
      const gTotal    = gResults.length;
      const pointsEach = 5; // 各問5点固定
      const score      = gCorrect * pointsEach;
      totalScore    += score;
      maxTotalScore += g.maxScore;
      subjectRows   += `<div class="exam-summary-row">
        <span>${g.label}</span>
        <strong>${gCorrect}/${gTotal}問正解（${score}/${g.maxScore}点）</strong>
      </div>`;
    });

    summary.innerHTML = `
      <div class="exam-summary-row"><span>⏱ 所要時間</span><strong>${timeStr}</strong></div>
      ${subjectRows}
      ${isFullExam ? `<div class="exam-summary-row" style="border-top:1px solid var(--border);margin-top:4px;padding-top:6px;">
        <span>🏆 合計スコア</span><strong>${totalScore} / ${maxTotalScore}点</strong>
      </div>` : `<div class="exam-summary-row"><span>✅ 提出問正解</span><strong>${correctQ} / ${totalQ} 問</strong></div>`}
      <div class="exam-summary-row"><span>📊 選択肢正解率</span><strong>${totalChoices > 0 ? Math.round((correctChoices/totalChoices)*100) : 0}%（${correctChoices}/${totalChoices}）</strong></div>`;

    const list = document.getElementById('exam-result-list');
    list.innerHTML = '';
    results.forEach(({ q, allRight, qCorrect, totalInQ, choiceResults, submitted }) => {
      const row = document.createElement('div');

      if (!submitted) {
        row.className = 'exam-result-row exam-row-skip';
        row.innerHTML = `<span class="exam-row-icon">—</span>
          <span class="exam-row-src">${q.source || q.id}</span>
          <span class="exam-row-skip-label">未提出</span>`;
      } else {
        row.className = 'exam-result-row ' + (allRight ? 'exam-row-ok' : 'exam-row-ng');
        const cr = choiceResults[0];
        if (cr && cr.isCountType) {
          const checkedLabels = (cr.checkedIds || []).map(cid => {
            const idx = (q.choices || []).findIndex(c => c.id === cid);
            return idx >= 0 ? CHOICE_LABELS_JP[idx] : '';
          }).filter(Boolean);
          const checkedStr = checkedLabels.length > 0 ? `チェック：${checkedLabels.join('・')}` : 'チェックなし';
          row.innerHTML = `
            <span class="exam-row-icon">${allRight ? '✓' : '✗'}</span>
            <span class="exam-row-src">${q.source || q.id}</span>
            <span class="exam-row-count-detail">回答 ${cr.userCount}つ → 正解 ${cr.correctCount}つ　${checkedStr}</span>`;
        } else {
          row.innerHTML = `
            <span class="exam-row-icon">${allRight ? '✓' : '✗'}</span>
            <span class="exam-row-src">${q.source || q.id}</span>
            <span class="exam-row-score">${qCorrect}/${totalInQ}</span>`;
        }
      }
      list.appendChild(row);
    });
  }

  saveRecentWrong({ mode: 'exam', total: totalQ, correct: correctQ });
  const wrongQ = state.sessionWrongQuestions.length;
  const wrongC = state.sessionWrongChoices.length;
  const btnRQ  = document.getElementById('btn-retry-wrong-q');
  const btnRC  = document.getElementById('btn-retry-wrong-c');
  if (btnRQ) { btnRQ.textContent = `❌ 間違った問題をもう一度（${wrongQ}問）`; btnRQ.classList.toggle('hidden', wrongQ === 0); }
  if (btnRC) { btnRC.textContent = `🥊 間違えた選択肢をもう一度（${wrongC}選択肢）`; btnRC.classList.toggle('hidden', wrongC === 0); }

  state.examMode      = false;
  state.examSubmitSet = null;
  showScreen('result');
  initResultFocus();
}

function nextQuestion() {
  _navigateToIndex(state.queueIndex + 1);
}

// 1問5点採点：全選択肢正解で5点（1択・計算は選んだ選択肢が正解で5点）、部分点なし
function computeExamScore() {
  const hist = state.sessionHistory || [];
  let points = 0;
  hist.forEach(e => {
    const ok = (e.isOnePickMode || e.isCalcMode)
      ? !!(e.choiceResults?.[0]?.isRight)
      : (e.choiceResults || []).length > 0 && e.choiceResults.every(cr => cr.isRight);
    if (ok) points += 5;
  });
  return { points, maxPoints: hist.length * 5 };
}

// 採点率 → ティア（満点=ダイヤ / 80%↑=プラチナ / 70%↑=ゴールド / 60%↑=シルバー / 50%↑=ブロンズ）
function examScoreTier(pct) {
  if (pct >= 100) return 'diamond';
  if (pct >= 80)  return 'platinum';
  if (pct >= 70)  return 'gold';
  if (pct >= 60)  return 'silver';
  if (pct >= 50)  return 'bronze';
  return null;
}

function showSessionResult() {
  flushSessionTime();
  saveSessionRecord(); // 成績履歴に記録
  gdriveUpload(true).catch(() => {}); // Drive 自動保存（サイレント）
  const { total, correct } = state.sessionStats;
  const subEl   = document.getElementById('result-sub');
  const bigEl   = document.querySelector('#screen-result .result-big');
  const TIERCLS = ['tier-diamond','tier-platinum','tier-gold','tier-silver','tier-bronze'];
  if (bigEl) bigEl.classList.remove(...TIERCLS);

  if (state.examScoring) {
    // カテゴリフィルター出題：1問5点の採点で表示
    const { points, maxPoints } = computeExamScore();
    const pct = maxPoints > 0 ? Math.round((points / maxPoints) * 100) : 0;
    document.getElementById('result-score').textContent = `${points}／${maxPoints} 点`;
    document.getElementById('result-pct').textContent   = `${pct}%`;
    if (subEl) { subEl.textContent = `${correct}／${total} 選択肢`; subEl.classList.remove('hidden'); }
    const tier = examScoreTier(pct);
    if (tier && bigEl) bigEl.classList.add('tier-' + tier);  // 枠＋数字をティア演出（ヘッダー準拠）
  } else {
    document.getElementById('result-score').textContent = `${correct} / ${total}`;
    document.getElementById('result-pct').textContent =
      total > 0 ? `${Math.round((correct / total) * 100)}%` : '-';
    if (subEl) subEl.classList.add('hidden');
  }

  saveRecentWrong({ mode: 'normal', total, correct });
  const wrongQ = (state.sessionWrongQuestions || []).length;
  const wrongC = (state.sessionWrongChoices   || []).length;
  const btnRQ  = document.getElementById('btn-retry-wrong-q');
  const btnRC  = document.getElementById('btn-retry-wrong-c');
  if (btnRQ) {
    btnRQ.textContent = `❌ 間違った問題をもう一度（${wrongQ}問）`;
    btnRQ.classList.toggle('hidden', wrongQ === 0);
  }
  if (btnRC) {
    btnRC.textContent = `🥊 間違えた選択肢だけもう一度（${wrongC}選択肢）`;
    btnRC.classList.toggle('hidden', wrongC === 0);
  }

  try { renderSessionHistory(); } catch(e) { console.error('[result] renderSessionHistory error', e); }
  showScreen('result');
  initResultFocus();
}

// ========== Session History ==========

function renderSessionHistory() {
  const hist = state.sessionHistory || [];
  const sec  = document.getElementById('session-history-section');
  const list = document.getElementById('session-history-list');
  if (!sec || !list) return;
  if (hist.length === 0) { sec.classList.add('hidden'); return; }
  sec.classList.remove('hidden');
  list.innerHTML = '';

  hist.forEach((entry, qi) => {
    const q        = entry.question;
    const allRight = entry.choiceResults.every(r => r.isRight);
    const block    = document.createElement('div');
    block.className = 'sh-block ' + (allRight ? 'sh-block-ok' : 'sh-block-ng');

    const hdr = document.createElement('div');
    hdr.className = 'sh-block-hdr';
    const meta = [q.category, q.year].filter(Boolean).join(' ／ ');
    const srcLabel = q.source ? `<span class="sh-source">${q.source}</span>` : `<span class="sh-source">問${qi + 1}</span>`;
    hdr.innerHTML = `<span class="sh-meta">${meta}</span>${srcLabel}<span class="sh-qmark ${allRight ? 'sh-mark-ok' : 'sh-mark-ng'}">${allRight ? '✓' : '✗'}</span>`;
    block.appendChild(hdr);

    const choiceList = document.createElement('div');
    choiceList.className = 'sh-choice-list';

    if (entry.isCalcMode) {
      // 計算問題：問題単位で1行表示
      const cr  = entry.choiceResults[0];
      const row = document.createElement('div');
      row.className = 'sh-choice-row';
      const icon = document.createElement('span');
      icon.className = 'sh-icon ' + (cr.isRight ? 'sh-icon-ok' : 'sh-icon-ng');
      icon.textContent = cr.isRight ? '✓' : '✗';
      const lbl = document.createElement('span');
      lbl.className = 'sh-lbl';
      const selLabel  = CHOICE_LABELS_JP[cr.selectedChoiceIndex] ?? '';
      const corrLabel = CHOICE_LABELS_JP[cr.choiceIndex] ?? '';
      lbl.textContent = cr.isRight
        ? `正解（${selLabel}を選択）`
        : `不正解（${selLabel}→正解:${corrLabel}）`;
      const viewBtn = document.createElement('button');
      viewBtn.className = 'btn-sh-view';
      viewBtn.textContent = '問題を表示';
      viewBtn.addEventListener('click', () => openChoiceDetailModal(entry, cr));
      row.append(icon, lbl, viewBtn);
      choiceList.appendChild(row);
    } else {
      entry.choiceResults.forEach(cr => {
        const label = CHOICE_LABELS_JP[cr.choiceIndex] || String(cr.choiceIndex + 1);
        const row   = document.createElement('div');
        row.className = 'sh-choice-row';

        const icon = document.createElement('span');
        icon.className = 'sh-icon ' + (cr.isRight ? 'sh-icon-ok' : 'sh-icon-ng');
        icon.textContent = cr.isRight ? '✓' : '✗';

        const lbl = document.createElement('span');
        lbl.className = 'sh-lbl';
        lbl.textContent = label;

        const viewBtn = document.createElement('button');
        viewBtn.className = 'btn-sh-view';
        viewBtn.textContent = '問題を表示';
        viewBtn.addEventListener('click', () => openChoiceDetailModal(entry, cr));

        row.append(icon, lbl, viewBtn);
        choiceList.appendChild(row);
      });
    }
    block.appendChild(choiceList);
    list.appendChild(block);
  });
}

const CHOICE_LABELS_JP = ['イ', 'ロ', 'ハ', 'ニ', 'ホ', 'ヘ'];

// ========== Choice Detail Modal ==========

let cdmCurrentQId = null;

function openChoiceDetailModal(histEntry, cr) {
  const q = histEntry.question;
  cdmCurrentQId = q.id;

  document.getElementById('cdm-meta').textContent =
    [q.category, q.year, q.source].filter(Boolean).join(' ／ ');

  const qEl = document.getElementById('cdm-question');
  if (q.questionText) {
    qEl.innerHTML = renderText(q.questionText);   // textContent だと [r]…[/r] が記号のまま出る
    qEl.classList.remove('hidden');
  } else {
    qEl.classList.add('hidden');
  }

  const resultEl = document.getElementById('cdm-result');

  if (histEntry.isCalcMode) {
    // 計算問題モードの表示
    const selIdx   = cr.selectedChoiceIndex ?? -1;
    const corrIdx  = cr.choiceIndex;
    const selLabel  = selIdx  >= 0 ? CHOICE_LABELS_JP[selIdx]  || String(selIdx  + 1) : '?';
    const corrLabel = corrIdx >= 0 ? CHOICE_LABELS_JP[corrIdx] || String(corrIdx + 1) : '?';
    const selChoice  = cr.selectedChoice || (selIdx  >= 0 ? q.choices[selIdx]  : null);
    const corrChoice = cr.choice         || (corrIdx >= 0 ? q.choices[corrIdx] : null);

    document.getElementById('cdm-title').textContent = cr.isRight ? '✓ 正解' : '✗ 不正解';
    document.getElementById('cdm-choice').textContent =
      `選択：${selLabel}．${selChoice?.text || ''}`;

    resultEl.className = 'cdm-result-line ' + (cr.isRight ? 'cdm-ok' : 'cdm-ng');
    if (cr.isRight) {
      resultEl.innerHTML = `<strong>✓ 正解</strong><span class="cdm-detail">　${selLabel}を選択 — 正解です</span>`;
    } else {
      resultEl.innerHTML =
        `<strong>✗ 不正解</strong>` +
        `<span class="cdm-detail">　あなた: ${selLabel}　／　正解: ${corrLabel}．${corrChoice?.text || ''}</span>`;
    }
    document.getElementById('cdm-explanation').innerHTML =
      renderText(corrChoice?.explanation || selChoice?.explanation || '（解説なし）');
    _setCdmExpImage(corrChoice?.explanationImage ? corrChoice : selChoice);
  } else {
    // 通常問題の表示
    const c     = cr.choice;
    const label = CHOICE_LABELS_JP[cr.choiceIndex] || String(cr.choiceIndex + 1);

    document.getElementById('cdm-title').textContent =
      `選択肢 ${label}（${cr.isRight ? '正解' : '不正解'}）`;
    document.getElementById('cdm-choice').textContent = `${label}．${c.text || ''}`;

    const userAns = cr.userAnswer === 'maru' ? '○（正しい）' : '×（誤り）';
    const correct = c.isCorrect ? '正しい' : '誤り';
    resultEl.className = 'cdm-result-line ' + (cr.isRight ? 'cdm-ok' : 'cdm-ng');
    resultEl.innerHTML =
      `<strong>${cr.isRight ? '✓ 正解' : '✗ 不正解'}</strong>` +
      `<span class="cdm-detail">　あなた: ${userAns}　／　正解: ${correct}</span>`;

    document.getElementById('cdm-explanation').innerHTML = renderText(c.explanation || '（解説なし）');
    _setCdmExpImage(c);
  }

  renderCdmTags(q);
  updateCdmBookmark(q.id);
  document.getElementById('modal-choice-detail').classList.remove('hidden');
}

function updateCdmBookmark(qId) {
  const btn = document.getElementById('cdm-btn-bookmark');
  if (!btn) return;
  const bm = state.bookmarks.has(qId);
  btn.textContent = bm ? '★ ブックマーク済み' : '☆ ブックマーク';
  btn.classList.toggle('active', bm);
}

function renderCdmTags(q) {
  const area = document.getElementById('cdm-tags');
  if (!area) return;
  area.innerHTML = '';
  const tags = q.tags || [];
  if (tags.length > 0) {
    tags.forEach(t => {
      const chip = document.createElement('span');
      chip.className = 'cdm-tag-chip';
      chip.innerHTML = `#${t} <button class="cdm-tag-del" data-tag="${t}">×</button>`;
      chip.querySelector('.cdm-tag-del').addEventListener('click', () => {
        q.tags = q.tags.filter(x => x !== t);
        saveQuestions();
        renderCdmTags(q);
      });
      area.appendChild(chip);
    });
  }
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'タグを追加…';
  input.className = 'cdm-tag-input';
  input.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const tag = input.value.trim().replace(/^#/, '');
    if (!tag) return;
    if (!q.tags) q.tags = [];
    if (!q.tags.includes(tag)) { q.tags.push(tag); saveQuestions(); }
    input.value = '';
    renderCdmTags(q);
  });
  area.appendChild(input);
}

// ========== Drill Mode ==========
const DRILL_CHOICE_LABELS = ['イ', 'ロ', 'ハ', 'ニ', 'ホ', 'ヘ'];

function isFillBlankQuestion(q) {
  const blanks = /（\s*　*\s*）|（\s*\)+\s*）|\(\s*\)|□|＿＿|___/;
  if (q.type === 'fill' || q.type === 'fillblank') return true;
  if (q.questionText && blanks.test(q.questionText)) return true;
  if (q.choices && q.choices.some(c => blanks.test(c.text || ''))) return true;
  return false;
}

// ========== Drill Setup Modal ==========
// ===== ドリルプリセット（アセット）管理 =====
const DRILL_PRESETS_KEY = 'gas_drill_presets_v1';

function loadDrillPresets() {
  try {
    const data = JSON.parse(localStorage.getItem(DRILL_PRESETS_KEY));
    if (Array.isArray(data) && data.length === 3) drillPresets = data;
  } catch(e) {}
}

function saveDrillPresetsStorage() {
  localStorage.setItem(DRILL_PRESETS_KEY, JSON.stringify(drillPresets));
}

function renderDrillPresetArea() {
  const btnsEl = document.getElementById('drill-preset-btns');
  if (!btnsEl) return;
  btnsEl.innerHTML = '';
  drillPresets.forEach((preset, i) => {
    if (!preset) return;
    const btn = document.createElement('button');
    btn.className = 'drill-preset-btn' + (drillPresetActiveSlot === i ? ' active' : '');
    btn.textContent = `アセット${i + 1}`;
    const catStr  = (preset.cats || []).slice(0, 2).join(', ') + ((preset.cats || []).length > 2 ? '…' : '');
    const yearStr = (preset.years || []).length ? ` / ${(preset.years || []).slice(0,3).join(',')}` : '';
    const secStr  = (preset.sections || []).length ? ` / ${(preset.sections || []).slice(0,2).join(',')}` : '';
    btn.title = catStr + yearStr + secStr;
    btn.addEventListener('click', () => applyDrillPreset(i));
    btnsEl.appendChild(btn);
  });
  // ラジオ：アクティブスロットに合わせる
  if (drillPresetActiveSlot !== null) {
    const radio = document.querySelector(`input[name="drill-preset-slot"][value="${drillPresetActiveSlot}"]`);
    if (radio) radio.checked = true;
  }
  // アクションボタン：ラジオ選択スロット == アクティブスロット なら「解除」、それ以外は「登録」
  const actionBtn = document.getElementById('btn-drill-preset-action');
  if (!actionBtn) return;
  const selectedSlot = parseInt(document.querySelector('input[name="drill-preset-slot"]:checked')?.value ?? '0');
  if (drillPresetActiveSlot !== null && drillPresetActiveSlot === selectedSlot) {
    actionBtn.textContent = '解除';
    actionBtn.classList.add('is-release');
  } else {
    actionBtn.textContent = '登録';
    actionBtn.classList.remove('is-release');
  }
}

function applyDrillPreset(slot) {
  const preset = drillPresets[slot];
  if (!preset) return;
  // 既にアクティブなスロットを再押し → フィルターリセットして解除
  if (drillPresetActiveSlot === slot) {
    drillPresetActiveSlot = null;
    drillSetupCats.clear();
    drillSetupYears.clear();
    drillSetupSections.clear();
    drillSetupExcludeStreak = 0;
    drillSetupPrioritizeNew = false;
    setDrillExStreakBtns();
    const newChk = document.getElementById('drill-setup-prioritize-new');
    if (newChk) newChk.checked = false;
    renderDrillSetupFilters();
    return;
  }
  drillPresetActiveSlot = slot;
  drillSetupCats.clear();
  (preset.cats || []).forEach(c => drillSetupCats.add(c));
  drillSetupYears.clear();
  (preset.years || []).forEach(y => drillSetupYears.add(y));
  drillSetupSections.clear();
  (preset.sections || []).forEach(s => drillSetupSections.add(s));
  drillSetupExcludeStreak = (preset.excludeStreak != null) ? preset.excludeStreak : (preset.excludeStrong ? 3 : 0);
  drillSetupPrioritizeNew = preset.prioritizeNew || false;
  setDrillExStreakBtns();
  const newChk = document.getElementById('drill-setup-prioritize-new');
  if (newChk) newChk.checked = drillSetupPrioritizeNew;
  renderDrillSetupFilters();
}

function registerDrillPreset(slot) {
  drillPresets[slot] = {
    cats:          [...drillSetupCats],
    years:         [...drillSetupYears],
    sections:      [...drillSetupSections],
    excludeStreak: drillSetupExcludeStreak,
    prioritizeNew: drillSetupPrioritizeNew,
  };
  drillPresetActiveSlot = slot;
  saveDrillPresetsStorage();
  renderDrillPresetArea();
}

function releaseDrillPreset(slot) {
  drillPresets[slot] = null;
  drillPresetActiveSlot = null;
  drillSetupCats.clear();
  drillSetupYears.clear();
  drillSetupSections.clear();
  drillSetupExcludeStreak = 0;
  drillSetupPrioritizeNew = false;
  setDrillExStreakBtns();
  const newChk = document.getElementById('drill-setup-prioritize-new');
  if (newChk) newChk.checked = false;
  saveDrillPresetsStorage();
  renderDrillSetupFilters();
}

// 壁打ち設定の「連続正解を除外」ボタン群の選択状態を現在の drillSetupExcludeStreak に同期
function setDrillExStreakBtns() {
  document.querySelectorAll('#drill-exstreak-btns .tfx-btn').forEach(b =>
    b.classList.toggle('active', parseInt(b.dataset.streak) === drillSetupExcludeStreak));
}

function openDrillSetupModal(mode = 'all', triggerEl = null) {
  if (state.questions.length === 0) { alert('問題データがありません。'); return; }
  drillSetupMode = mode;
  drillSetupCats.clear();
  drillSetupYears.clear();
  drillSetupSections.clear();
  drillSetupLimit          = null;
  drillSetupExcludeStreak  = (mode === 'weak') ? 3 : 0;  // 苦手集中は既定で3連続正解を除外
  drillSetupPrioritizeNew  = false;
  drillPresetActiveSlot    = null;
  setDrillExStreakBtns();
  const newChk = document.getElementById('drill-setup-prioritize-new');
  if (newChk) newChk.checked = false;
  // タイトルをモードに応じて変更
  document.querySelector('#modal-drill-setup .modal-title').textContent =
    mode === 'weak' ? '🔥 苦手集中 設定' : '🥊 壁打ち設定';
  document.getElementById('drill-setup-step1').classList.remove('hidden');
  document.getElementById('drill-setup-step2').classList.add('hidden');
  renderDrillSetupFilters();
  // CSS側で top:105px + height:calc(100dvh-105px-12px) で全デバイス共通レイアウト
  document.getElementById('modal-drill-setup').classList.remove('hidden');
}

function renderDrillSetupFilters() {
  const allQs = state.questions.filter(q => !isFillBlankQuestion(q) && q.choices?.length);
  // カテゴリが選択されているものだけを relevantQs とする（未選択 = 0件）
  const relevantQs = allQs.filter(q => drillSetupCats.has(q.category));

  // ── カテゴリチップ ──
  const allCats = sortCategories([...new Set(allQs.map(q => q.category))]);
  const catsEl = document.getElementById('drill-setup-cats');
  catsEl.innerHTML = '';
  allCats.forEach(cat => {
    const chip = document.createElement('button');
    chip.className = 'drill-setup-chip' + (drillSetupCats.has(cat) ? ' active' : '');
    chip.textContent = cat;
    chip.addEventListener('click', () => {
      if (drillSetupCats.has(cat)) drillSetupCats.delete(cat);
      else drillSetupCats.add(cat);
      // カテゴリが変わったら年度・分野選択をリセット
      drillSetupYears.clear();
      drillSetupSections.clear();
      renderDrillSetupFilters();
    });
    catsEl.appendChild(chip);
  });
  // 全選択 / 選択解除ボタン（全て選択済みなら解除モード）
  const allCatsSelected = allCats.length > 0 && allCats.every(c => drillSetupCats.has(c));
  const catsAllBtn = document.getElementById('drill-cats-select-all');
  if (catsAllBtn) {
    catsAllBtn.textContent = allCatsSelected ? '選択解除' : '全選択';
    catsAllBtn.onclick = allCatsSelected
      ? () => { drillSetupCats.clear(); drillSetupYears.clear(); drillSetupSections.clear(); renderDrillSetupFilters(); }
      : () => { allCats.forEach(c => drillSetupCats.add(c)); drillSetupYears.clear(); drillSetupSections.clear(); renderDrillSetupFilters(); };
  }

  // ── 年度チップ ──
  const years = sortYearsDesc([...new Set(relevantQs.filter(q => q.year).map(q => q.year))]);
  const yearsEl = document.getElementById('drill-setup-years');
  yearsEl.innerHTML = '';
  if (years.length === 0) {
    yearsEl.innerHTML = '<span style="color:var(--text-3);font-size:.8rem;">' +
      (drillSetupCats.size === 0 ? 'カテゴリを選択してください' : '年度データなし') + '</span>';
  } else {
    years.forEach(year => {
      const chip = document.createElement('button');
      chip.className = 'drill-setup-chip' + (drillSetupYears.has(year) ? ' active' : '');
      chip.textContent = year;
      chip.addEventListener('click', () => {
        if (drillSetupYears.has(year)) drillSetupYears.delete(year);
        else drillSetupYears.add(year);
        renderDrillSetupFilters();
      });
      yearsEl.appendChild(chip);
    });
  }
  const allYearsSelected = years.length > 0 && years.every(y => drillSetupYears.has(y));
  const yearsAllBtn = document.getElementById('drill-years-select-all');
  if (yearsAllBtn) {
    yearsAllBtn.textContent = allYearsSelected ? '選択解除' : '全選択';
    yearsAllBtn.onclick = allYearsSelected
      ? () => { drillSetupYears.clear(); renderDrillSetupFilters(); }
      : () => { years.forEach(y => drillSetupYears.add(y)); renderDrillSetupFilters(); };
  }

  // ── 分野チップ ──
  const sections = sortSections([...new Set(relevantQs.filter(q => q.section).map(q => q.section))]);
  const secsEl = document.getElementById('drill-setup-sections');
  secsEl.innerHTML = '';
  if (sections.length === 0) {
    secsEl.innerHTML = '<span style="color:var(--text-3);font-size:.8rem;">' +
      (drillSetupCats.size === 0 ? 'カテゴリを選択してください' : '分野データなし') + '</span>';
  } else {
    sections.forEach(sec => {
      const chip = document.createElement('button');
      chip.className = 'drill-setup-chip' + (drillSetupSections.has(sec) ? ' active' : '');
      chip.textContent = sec;
      chip.addEventListener('click', () => {
        if (drillSetupSections.has(sec)) drillSetupSections.delete(sec);
        else drillSetupSections.add(sec);
        renderDrillSetupFilters();
      });
      secsEl.appendChild(chip);
    });
  }
  const allSecsSelected = sections.length > 0 && sections.every(s => drillSetupSections.has(s));
  const secsAllBtn = document.getElementById('drill-sections-select-all');
  if (secsAllBtn) {
    secsAllBtn.textContent = allSecsSelected ? '選択解除' : '全選択';
    secsAllBtn.onclick = allSecsSelected
      ? () => { drillSetupSections.clear(); renderDrillSetupFilters(); }
      : () => { sections.forEach(s => drillSetupSections.add(s)); renderDrillSetupFilters(); };
  }
  renderDrillPresetArea();
}

function buildDrillQueueCustom() {
  // 選択カテゴリ内の問題を抽出して、利用可能な年度・分野を把握する
  const relevantQs = state.questions.filter(q =>
    !q.drillExcluded && !isFillBlankQuestion(q) && !isCalcQuestion(q) && q.choices?.length && drillSetupCats.has(q.category)
  );
  const availableYears    = new Set(relevantQs.filter(q => q.year).map(q => q.year));
  const availableSections = new Set(relevantQs.filter(q => q.section).map(q => q.section));

  const hasYearChips    = availableYears.size > 0;
  const hasSectionChips = availableSections.size > 0;
  const yearSelected    = drillSetupYears.size > 0;
  const sectionSelected = drillSetupSections.size > 0;

  const filtered = relevantQs.filter(q => {
    // チップが存在する次元のうち、少なくとも1つは選択必須
    if (hasYearChips || hasSectionChips) {
      const anySelected = (hasYearChips && yearSelected) || (hasSectionChips && sectionSelected);
      if (!anySelected) return false;
    }
    // 年度が選択されていれば絞り込む（yearフィールドなしも除外）
    if (yearSelected && !drillSetupYears.has(q.year)) return false;
    // 分野が選択されていれば絞り込む（sectionフィールドなしも除外）
    if (sectionSelected && !drillSetupSections.has(q.section)) return false;
    return true;
  });
  const queue = [];
  filtered.forEach(q => {
    (q.choices || []).forEach((c, i) => {
      // N連続正解を除外（苦手集中は既定で3、ユーザーが3/4/5を選択可）
      if (drillSetupExcludeStreak && choiceStreak(c) >= drillSetupExcludeStreak) return;
      queue.push({ question: q, choice: c, choiceIndex: i });
    });
  });
  for (let i = queue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [queue[i], queue[j]] = [queue[j], queue[i]];
  }
  // 未出題を優先: シャッフル後に未出題→既出済みの順へ並び替え（各グループ内はランダムを維持）
  if (drillSetupPrioritizeNew) {
    const isNew = ({choice}) => !(state.progress[choice.id]?.history?.length > 0);
    const unasked  = queue.filter(item =>  isNew(item));
    const answered = queue.filter(item => !isNew(item));
    queue.splice(0, queue.length, ...unasked, ...answered);
  }
  return queue;
}

function showDrillCountStep() {
  const total = buildDrillQueueCustom().length;
  if (total === 0) {
    const msg = drillSetupExcludeStreak
      ? `出題できる選択肢がありません。\n選択した範囲の選択肢はすべて${drillSetupExcludeStreak}連続正解済みです。`
      : '条件に合う選択肢がありません。フィルターを見直してください。';
    alert(msg);
    return;
  }
  drillSetupLimit = null;
  document.querySelectorAll('#drill-setup-limit-btns .q-limit-btn').forEach(b => {
    b.classList.toggle('active', !b.dataset.limit);
  });
  document.getElementById('drill-setup-count-info').textContent = `対象：${total}択`;
  document.getElementById('drill-setup-step1').classList.add('hidden');
  document.getElementById('drill-setup-step2').classList.remove('hidden');
}

function startDrillFromSetup() {
  const fullQueue = buildDrillQueueCustom();
  if (fullQueue.length === 0) { alert('出題できる選択肢がありません。'); return; }
  // 「もう一度」用に制限前のキューとパラメータを保存
  state.lastAgainType     = 'drill';
  state.lastAgainMode     = drillSetupMode;
  state.lastAgainFiltered = fullQueue.slice();
  state.lastAgainLimit    = drillSetupLimit;
  let queue = drillSetupLimit ? fullQueue.slice(0, drillSetupLimit) : fullQueue;
  document.getElementById('modal-drill-setup').classList.add('hidden');
  state.drillQueue            = queue;
  state.drillIndex            = 0;
  state.drillMode             = drillSetupMode;
  state.drillStats            = { total: 0, correct: 0 };
  state.drillAnswered         = false;
  state.drillAnswers          = {};
  state.sessionWrongChoices   = [];
  state.sessionWrongQuestions = [];
  showScreen('drill');
  renderDrillChoice();
}

function renderDrillChoice() {
  markerDisplayOn = false;  // 次の選択肢に移ったらマーカーをリセット
  _applyDrillHighlights(null, null);
  const { question: q, choice: c, choiceIndex } = state.drillQueue[state.drillIndex];
  const total   = state.drillQueue.length;
  const current = state.drillIndex + 1;

  document.getElementById('drill-progress').textContent = `${current} / ${total}`;
  document.getElementById('drill-progress-bar').style.width = `${(current / total) * 100}%`;

  // 問題情報（年度・カテゴリ・問番号）
  const parts = [q.year, q.category, q.source || q.id].filter(Boolean);
  document.getElementById('drill-source').textContent = parts.join('  ／  ');

  // 問題文（学習画面と同じブロック描画を使う）
  // ⚠️ 以前は `qtEl.textContent = q.questionText` で流し込んでいたため、壁打ちだけ
  //    ・[r]…[/r] が赤太文字にならず記号のまま出る
  //    ・改行が潰れる
  //    ・2つ目以降のテキストブロックと画像が表示されない（questionText＝先頭ブロックのみのため）
  //    ＝「問題を修正しても壁打ちに反映されない」状態になっていた。
  const qtEl = document.getElementById('drill-question-text');
  const qBlocks = getQuestionBlocks(q);
  if (qBlocks.length > 0) {
    renderBlocksToEl(qBlocks, qtEl);
    qtEl.classList.remove('hidden');
  } else {
    qtEl.innerHTML = '';
    qtEl.classList.add('hidden');
  }

  // 選択肢ラベル・本文
  document.getElementById('drill-choice-label-badge').textContent =
    DRILL_CHOICE_LABELS[choiceIndex] || String(choiceIndex + 1);
  document.getElementById('drill-choice-text').innerHTML = renderText(c.text);
  // 選択肢画像
  const drillImgWrap = document.getElementById('drill-choice-img-wrap');
  const drillChoiceImg = document.getElementById('drill-choice-image');
  if (drillImgWrap && drillChoiceImg) {
    if (c.image) {
      drillChoiceImg.src = c.image;
      drillImgWrap.style.width = c.imageWidth ? c.imageWidth + 'px' : '';
      drillImgWrap.classList.remove('hidden');
      const oldHandle = document.getElementById('drill-choice-img-handle');
      if (oldHandle) {
        const newHandle = oldHandle.cloneNode(true);
        oldHandle.parentNode.replaceChild(newHandle, oldHandle);
        _addResizeHandle(newHandle, drillChoiceImg, () => c.id);
      }
    } else {
      drillChoiceImg.src = '';
      drillImgWrap.style.width = '';
      drillImgWrap.classList.add('hidden');
    }
  }

  // 過去3回ドット
  const dotsEl = document.getElementById('drill-history-dots');
  dotsEl.innerHTML = '';
  const p = state.progress[c.id];
  dotsEl.appendChild(makeHistoryDots(p));

  // 除外ボタン
  const drillExBtn = document.getElementById('btn-drill-exclude');
  if (drillExBtn) {
    drillExBtn.classList.toggle('excluded', !!q.drillExcluded);
    drillExBtn.title = q.drillExcluded ? '壁打ちから除外中（クリックで解除）' : '壁打ちから除外';
  }

  // ブックマークボタン（壁打ちは「選択肢単位」でブックマーク）
  const drillBmBtn = document.getElementById('btn-drill-bookmark');
  if (drillBmBtn) {
    const isBm = !!(c.id && state.choiceBookmarks.has(c.id));
    drillBmBtn.textContent = isBm ? '★' : '☆';
    drillBmBtn.classList.toggle('bookmarked', isBm);
  }

  // 計算問題 / 1択選択チェックボックス
  const drillCalcCheck   = document.getElementById('drill-calc-mode-check');
  const drillSingleCheck = document.getElementById('drill-single-select-check');
  if (drillCalcCheck)   drillCalcCheck.checked   = isCalcQuestion(q);
  if (drillSingleCheck) drillSingleCheck.checked = isSingleSelectQuestion(q);

  // 保存済み回答があれば復元、なければ通常の出題状態
  const savedAnswer = state.drillAnswers[state.drillIndex];
  if (savedAnswer) {
    // 答え合わせ済み状態を復元
    state.drillAnswered = true;
    document.getElementById('drill-answer-area').classList.add('hidden');
    document.getElementById('drill-feedback-area').classList.remove('hidden');

    const resultEl = document.getElementById('drill-result-label');
    resultEl.className = 'drill-result-label ' + (savedAnswer.isRight ? 'is-correct' : 'is-incorrect');
    resultEl.textContent = savedAnswer.isRight ? '✓ 正解！' : '✗ 不正解';

    document.getElementById('drill-answer-reveal').textContent =
      `この選択肢は「${savedAnswer.actuallyCorrect ? '正しい（○）' : '誤り（✕）'}」`;

    const expEl = document.getElementById('drill-explanation');
    if (c.explanation) {
      expEl.innerHTML = renderText(c.explanation);
      expEl.classList.remove('hidden');
    } else {
      expEl.classList.add('hidden');
    }
    _setDrillExpImage(c);
    // 問題全体の解説画像（学習画面と同じトグル）。選択肢ごとの解説画像とは別物
    renderQuestionExplanationImage(document.getElementById('drill-explanation-image-area'), q);

    const { total, correct } = state.drillStats;
    document.getElementById('drill-session-acc').textContent =
      `正答率: ${Math.round((correct / total) * 100)}%（${correct} / ${total}）`;

    const isLast = state.drillIndex >= state.drillQueue.length - 1;
    document.getElementById('btn-drill-next').textContent =
      isLast ? '結果を見る' : '次の選択肢へ →';

    _applyDrillHighlights(q, c);
    _updateDrillMarkerBtn(q, c);
    renderDrillTagSection(q, c);
  } else {
    // 未回答：通常の出題状態
    document.getElementById('drill-answer-area').classList.remove('hidden');
    document.getElementById('drill-feedback-area').classList.add('hidden');
    // 前の選択肢の解説画像が残らないよう消しておく
    renderQuestionExplanationImage(document.getElementById('drill-explanation-image-area'), null);
    const skipBtn = document.getElementById('btn-drill-skip');
    if (skipBtn) skipBtn.classList.toggle('hidden', state.drillMode !== 'keyword-search' && !q.drillExcluded);
    state.drillAnswered = false;
    // 答え合わせ前でもマーカーの表示/非表示を切り替えられるよう、ボタン状態を反映
    _applyDrillHighlights(q, c);
    _updateDrillMarkerBtn(q, c);
  }
}

function answerDrill(userSaysCorrect) {
  if (state.drillAnswered) return;
  state.drillAnswered = true;

  const { question: q, choice: c } = state.drillQueue[state.drillIndex];
  // 1択問題は「設問の答えか」ではなく「選択肢の記述が正しいか」で判定する
  // （誤答型の設問では答えの選択肢=誤った記述なので、極性に応じて反転させる）
  const actuallyCorrect = isSingleSelectQuestion(q)
    ? singleSelectStatementTrue(q, c)
    : c.isCorrect;
  const isRight = (userSaysCorrect === actuallyCorrect);

  // 回答状態を保存（前後ナビゲーション時の復元用）
  state.drillAnswers[state.drillIndex] = { userSaysCorrect, isRight, actuallyCorrect };

  state.drillStats.total++;
  if (isRight) state.drillStats.correct++;

  // 不正解を wrong リストに記録（リザルト画面のリトライボタン用）
  if (!isRight) {
    const { choiceIndex } = state.drillQueue[state.drillIndex];
    state.sessionWrongChoices.push({ question: q, choice: c, choiceIndex });
    if (!state.sessionWrongQuestions.find(x => x.id === q.id)) {
      state.sessionWrongQuestions.push(q);
    }
  }
  recordAnswer(c.id, isRight);

  // 選択肢1個分を日次ログに記録 & カテゴリ別集計
  recordStudyActivity(1, isRight ? 1 : 0, 0, q?.category);
  updateHeaderStats();
  if (q && q.category) sessionCatAnswers[q.category] = (sessionCatAnswers[q.category] || 0) + 1;

  // フィードバック表示
  document.getElementById('drill-answer-area').classList.add('hidden');
  document.getElementById('drill-feedback-area').classList.remove('hidden');

  const resultEl = document.getElementById('drill-result-label');
  resultEl.className = 'drill-result-label ' + (isRight ? 'is-correct' : 'is-incorrect');
  resultEl.textContent = isRight ? '✓ 正解！' : '✗ 不正解';

  document.getElementById('drill-answer-reveal').textContent =
    `この選択肢は「${actuallyCorrect ? '正しい（○）' : '誤り（✕）'}」`;

  const expEl = document.getElementById('drill-explanation');
  if (c.explanation) {
    expEl.innerHTML = renderText(c.explanation);
    expEl.classList.remove('hidden');
  } else {
    expEl.classList.add('hidden');
  }
  _setDrillExpImage(c);
  // 問題全体の解説画像（学習画面と同じトグル）。選択肢ごとの解説画像とは別物
  renderQuestionExplanationImage(document.getElementById('drill-explanation-image-area'), q);

  // 過去3回ドット更新
  const dotsEl = document.getElementById('drill-history-dots');
  dotsEl.innerHTML = '';
  dotsEl.appendChild(makeHistoryDots(state.progress[c.id]));

  // セッション正答率
  const { total, correct } = state.drillStats;
  document.getElementById('drill-session-acc').textContent =
    `正答率: ${Math.round((correct / total) * 100)}%（${correct} / ${total}）`;

  // 次ボタンテキスト
  const isLast = state.drillIndex >= state.drillQueue.length - 1;
  document.getElementById('btn-drill-next').textContent =
    isLast ? '結果を見る' : '次の選択肢へ →';

  // マーカー適用（解説の赤マーカーは常時・選択肢マーカーはON時）
  _applyDrillHighlights(q, c);
  _updateDrillMarkerBtn(q, c);

  // タグセクション更新
  renderDrillTagSection(q, c);
}

function renderDrillTagSection(q, c) {
  const chipsEl   = document.getElementById('drill-tag-chips');
  const suggestEl = document.getElementById('drill-tag-suggestions');
  if (!chipsEl || !suggestEl) return;

  const tags = c.tags || [];

  // choice タグを更新して保存する共通ヘルパー
  const saveChoiceTags = (newTags) => {
    const di = state.drillQueue?.[state.drillIndex];
    if (!di) return;
    const qIdx = state.questions.findIndex(x => x.id === di.question.id);
    if (qIdx === -1) return;
    const updatedQ = { ...state.questions[qIdx] };
    updatedQ.choices = updatedQ.choices.map(ch =>
      ch.id === c.id ? { ...ch, tags: newTags } : ch
    );
    state.questions[qIdx] = updatedQ;
    di.question = updatedQ;
    di.choice   = updatedQ.choices.find(ch => ch.id === c.id) || di.choice;
    saveQuestions();
    renderDrillTagSection(updatedQ, di.choice);
  };

  // 現在のタグをチップで表示（×ボタン付き）。漢字始まりタグは読み(よみ)状態も表示し、
  // チップ本文タップで タグ名＋読み を入力欄へ読み込んで編集できる。
  chipsEl.innerHTML = '';
  tags.forEach((tag, i) => {
    const chip = document.createElement('span');
    chip.className = 'edit-tag-chip';
    const label = document.createElement('span');
    label.className = 'edit-tag-label';
    const rd = tagReadings[tagKey(tag)];
    label.textContent = '#' + tag + (tagNeedsReading(tag) ? (rd ? `（${rd}）` : '（よみ未登録）') : '') + ' ';
    if (tagNeedsReading(tag)) {
      label.style.cursor = 'pointer';
      label.title = 'タップして よみ を編集';
      label.addEventListener('click', () => {
        const ti = document.getElementById('drill-tag-input');
        const ri = document.getElementById('drill-tag-reading-input');
        if (ti) ti.value = tag;
        if (ri) { ri.value = rd || ''; ri.focus(); }
      });
    }
    chip.appendChild(label);
    const rm = document.createElement('button');
    rm.type = 'button';
    rm.className = 'edit-tag-remove';
    rm.textContent = '✕';
    rm.addEventListener('click', () => saveChoiceTags(tags.filter((_, j) => j !== i)));
    chip.appendChild(rm);
    chipsEl.appendChild(chip);
  });

  // サジェスト（全選択肢のタグを収集）
  suggestEl.innerHTML = '';
  const allTags = sortTagsJa([...new Set(
    state.questions.flatMap(x => (x.choices || []).flatMap(ch => ch.tags || []))
  )]);
  allTags.forEach(tag => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'edit-tag-suggest-btn' + (tags.includes(tag) ? ' active' : '');
    btn.textContent = '#' + tag;
    btn.addEventListener('click', () => {
      saveChoiceTags(tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag]);
    });
    suggestEl.appendChild(btn);
  });
}

/** 壁打ちセッション終了 → リザルト画面へ（終了ボタン・最終問題どちらでも共通） */
function endDrillSession() {
  flushSessionTime();
  gdriveUpload(true).catch(() => {}); // Drive 自動保存（サイレント）
  const { total, correct } = state.drillStats;
  document.getElementById('result-score').textContent = `${correct} / ${total}`;
  document.getElementById('result-pct').textContent =
    total > 0 ? `${Math.round((correct / total) * 100)}%` : '-';

  saveRecentWrong({ mode: 'drill', total, correct });
  const wrongC = (state.sessionWrongChoices   || []).length;
  const wrongQ = (state.sessionWrongQuestions || []).length;
  const btnRQ  = document.getElementById('btn-retry-wrong-q');
  const btnRC  = document.getElementById('btn-retry-wrong-c');
  if (btnRQ) {
    btnRQ.textContent = `❌ 間違った問題をもう一度（${wrongQ}問）`;
    btnRQ.classList.toggle('hidden', wrongQ === 0);
  }
  if (btnRC) {
    btnRC.textContent = `🥊 間違えた選択肢をもう一度（${wrongC}選択肢）`;
    btnRC.classList.toggle('hidden', wrongC === 0);
  }
  showScreen('result');
  initResultFocus();
}

function nextDrill() {
  const isLast = state.drillIndex >= state.drillQueue.length - 1;
  if (isLast) { endDrillSession(); return; }
  state.drillIndex++;
  renderDrillChoice();
}

// ========== Stats Screen ==========
function makeHistoryDots(p) {
  const wrap = document.createElement('div');
  wrap.className = 'history-dots';
  let history = [];
  if (p) {
    if (Array.isArray(p.history)) {
      history = p.history;
    } else if (p.lastResult !== undefined) {
      history = [p.lastResult]; // 旧フォーマットの互換
    }
  }
  for (let slot = 0; slot < 5; slot++) {
    const dot = document.createElement('span');
    dot.className = 'history-dot';
    const idx = history.length - (5 - slot); // oldest→newest left→right
    if (idx >= 0) {
      dot.classList.add(history[idx] ? 'correct' : 'incorrect');
    } else {
      dot.classList.add('empty');
    }
    wrap.appendChild(dot);
  }
  return wrap;
}

// ========== 成績履歴ビュー ==========
function fmtTimestamp(ts) {
  const d  = new Date(ts);
  const mo = d.getMonth() + 1;
  return `${d.getFullYear()}年${mo}月${d.getDate()}日 ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}
function modeLabel(m) {
  return { sequential:'出題順', random:'ランダム', weak:'苦手優先' }[m] || m || '—';
}
function pct(c, t) { return t > 0 ? `${Math.round(c/t*100)}%` : '—'; }

function renderHistoryView() {
  const allRecords = loadSessionRecords();

  // ── フィルターバー ──
  const filterEl = document.getElementById('stats-hist-filter');
  filterEl.innerHTML = '';

  // カテゴリ一覧（記録内に存在するカテゴリのみ）
  const allCats = [...new Set(allRecords.flatMap(r => Object.keys(r.byCategory || {})))];
  const sortedCats = sortCategories(allCats);

  if (sortedCats.length > 0) {
    const catRow = document.createElement('div');
    catRow.className = 'qlist-filter-row';
    sortedCats.forEach(cat => {
      const chip = document.createElement('button');
      chip.className = 'chip qlist-filter-chip' + (histFilterCats.has(cat) ? ' active' : '');
      chip.textContent = displayCategoryName(cat);
      chip.addEventListener('click', () => {
        if (histFilterCats.has(cat)) histFilterCats.delete(cat);
        else histFilterCats.add(cat);
        renderHistoryView();
      });
      catRow.appendChild(chip);
    });
    filterEl.appendChild(catRow);

    if (histFilterCats.size > 0) {
      const clearBtn = document.createElement('button');
      clearBtn.className = 'btn btn-ghost btn-sm';
      clearBtn.textContent = '✕ クリア';
      clearBtn.style.cssText = 'margin-top:4px;';
      clearBtn.addEventListener('click', () => { histFilterCats.clear(); renderHistoryView(); });
      filterEl.appendChild(clearBtn);
    }
  }

  // フィルター適用
  const records = histFilterCats.size === 0
    ? allRecords
    : allRecords.filter(r => [...histFilterCats].some(c => r.byCategory?.[c]));

  // ── レコード一覧 ──
  const recEl = document.getElementById('stats-hist-records');
  recEl.innerHTML = '';

  if (records.length === 0) {
    const msg = document.createElement('div');
    msg.style.cssText = 'text-align:center;color:var(--text-3);padding:32px;font-size:.88rem;';
    msg.textContent = allRecords.length === 0
      ? '成績データがありません。学習を終えると自動的に記録されます。'
      : 'フィルター条件に一致する記録がありません';
    recEl.appendChild(msg);
  } else {
    records.forEach(rec => {
      const card = document.createElement('div');
      card.className = 'hist-record-card';

      // ヘッダー行
      const hdr = document.createElement('div');
      hdr.className = 'hist-record-hdr';
      const tsEl = document.createElement('span');
      tsEl.className = 'hist-record-ts';
      tsEl.textContent = fmtTimestamp(rec.ts);
      const modeEl = document.createElement('span');
      modeEl.className = 'hist-record-mode';
      modeEl.textContent = modeLabel(rec.mode);
      hdr.append(tsEl, modeEl);
      card.appendChild(hdr);

      // 全体スコア
      const overallEl = document.createElement('div');
      overallEl.className = 'hist-record-overall';
      overallEl.textContent =
        `${rec.questionCount}問  正解 ${rec.correct}/${rec.total}選択肢  正答率 ${pct(rec.correct, rec.total)}`;
      card.appendChild(overallEl);

      // カテゴリ別
      const byCat = rec.byCategory || {};
      const dispCats = histFilterCats.size > 0
        ? [...histFilterCats].filter(c => byCat[c])
        : sortCategories(Object.keys(byCat));

      if (dispCats.length > 0) {
        const table = document.createElement('div');
        table.className = 'hist-cat-table';
        dispCats.forEach(cat => {
          const d = byCat[cat];
          if (!d) return;
          const row = document.createElement('div');
          row.className = 'hist-cat-row';
          const nameEl = document.createElement('span');
          nameEl.className = 'hist-cat-name';
          nameEl.textContent = displayCategoryName(cat);
          const scoreEl = document.createElement('span');
          scoreEl.className = 'hist-cat-score';
          scoreEl.textContent = `${d.questions}問  ${d.correct}/${d.total}  ${pct(d.correct, d.total)}`;
          row.append(nameEl, scoreEl);
          table.appendChild(row);
        });
        card.appendChild(table);
      }

      // 年度別（折りたたみ）
      const byYear = rec.byYear || {};
      const yearKeys = sortYearsDesc(Object.keys(byYear).filter(Boolean));
      if (yearKeys.length > 0) {
        const toggle = document.createElement('button');
        toggle.className = 'btn btn-ghost btn-sm hist-year-toggle';
        toggle.textContent = '▶ 年度別';
        const yearTable = document.createElement('div');
        yearTable.className = 'hist-year-table hidden';
        yearKeys.forEach(yr => {
          const d = byYear[yr];
          const row = document.createElement('div');
          row.className = 'hist-cat-row';
          const nameEl = document.createElement('span');
          nameEl.className = 'hist-cat-name';
          nameEl.textContent = yr;
          const scoreEl = document.createElement('span');
          scoreEl.className = 'hist-cat-score';
          scoreEl.textContent = `${d.questions}問  ${d.correct}/${d.total}  ${pct(d.correct, d.total)}`;
          row.append(nameEl, scoreEl);
          yearTable.appendChild(row);
        });
        toggle.addEventListener('click', () => {
          const hidden = yearTable.classList.toggle('hidden');
          toggle.textContent = (hidden ? '▶' : '▼') + ' 年度別';
        });
        card.append(toggle, yearTable);
      }

      recEl.appendChild(card);
    });
  }

  // ── 分野別 挑戦回数サマリー ──
  const sumEl = document.getElementById('stats-hist-summary');
  sumEl.innerHTML = '';

  if (records.length > 0) {
    const catCount = {};
    records.forEach(rec => {
      const byCat = rec.byCategory || {};
      const dispCats = histFilterCats.size > 0
        ? [...histFilterCats].filter(c => byCat[c])
        : Object.keys(byCat);
      dispCats.forEach(cat => {
        if (!byCat[cat]) return;
        if (!catCount[cat]) catCount[cat] = { sessions: 0, total: 0, correct: 0, questions: 0 };
        catCount[cat].sessions++;
        catCount[cat].total    += byCat[cat].total;
        catCount[cat].correct  += byCat[cat].correct;
        catCount[cat].questions+= byCat[cat].questions;
      });
    });

    const sumCats = sortCategories(Object.keys(catCount));
    if (sumCats.length > 0) {
      const title = document.createElement('div');
      title.className = 'hist-summary-title';
      title.textContent = '📊 分野別 挑戦回数サマリー';
      sumEl.appendChild(title);

      const table = document.createElement('div');
      table.className = 'hist-cat-table hist-summary-table';

      // ヘッダー
      const hRow = document.createElement('div');
      hRow.className = 'hist-cat-row hist-sum-hdr';
      hRow.innerHTML =
        '<span class="hist-cat-name">分野</span>' +
        '<span class="hist-cat-score" style="grid-template-columns:3rem 6rem 3rem">挑戦回 / 合計問 / 正答率</span>';
      table.appendChild(hRow);

      sumCats.forEach(cat => {
        const d = catCount[cat];
        const row = document.createElement('div');
        row.className = 'hist-cat-row';
        const nameEl = document.createElement('span');
        nameEl.className = 'hist-cat-name';
        nameEl.textContent = displayCategoryName(cat);
        const scoreEl = document.createElement('span');
        scoreEl.className = 'hist-cat-score';
        scoreEl.textContent =
          `${d.sessions}回  ${d.questions}問  ${pct(d.correct, d.total)}`;
        row.append(nameEl, scoreEl);
        table.appendChild(row);
      });
      sumEl.appendChild(table);
    }
  }
}

function renderStats() {
  // タブ表示を最新状態に反映
  document.querySelectorAll('.stats-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === statsTabMode);
  });
  document.getElementById('stats-progress-view')?.classList.toggle('hidden', statsTabMode !== 'progress');
  document.getElementById('stats-history-view')?.classList.toggle('hidden',  statsTabMode !== 'history');

  showScreen('stats');

  if (statsTabMode === 'history') {
    renderHistoryView();
    return;
  }

  try { _renderStatsImpl(); }
  catch(e) {
    console.error('[renderStats error]', e);
    const container = document.getElementById('stats-container');
    container.innerHTML =
      `<div style="background:#7f1d1d;color:#fecaca;border-radius:8px;padding:16px;font-size:.85rem;margin:8px 0;">
        ⚠️ 学習進捗の表示中にエラーが発生しました:<br><code>${e.message}</code>
      </div>`;
  }
}
function _renderStatsImpl(openState) {
  openState = openState || {};

  // デフォルト問題を除外
  const allQ = state.questions.filter(q => q._setName !== 'デフォルト問題');

  const container = document.getElementById('stats-container');
  container.innerHTML = '';

  if (allQ.length === 0) {
    const msg = document.createElement('div');
    msg.style.cssText = 'text-align:center;color:var(--text-3);padding:40px;';
    msg.textContent = state.questions.length === 0
      ? '問題データがありません'
      : '学習進捗を表示できる問題がありません（デフォルト問題は対象外です）';
    container.appendChild(msg);
    showScreen('stats');
    return;
  }

  // Group: category → year → questions
  const grouped = {};
  allQ.forEach(q => {
    const cat  = q.category || 'カテゴリ不明';
    const year = q.year     || '年度不明';
    if (!grouped[cat])       grouped[cat] = {};
    if (!grouped[cat][year]) grouped[cat][year] = [];
    grouped[cat][year].push(q);
  });

  const sortedCats = sortCategories(Object.keys(grouped));

  sortedCats.forEach(cat => {
    const yearsMap     = grouped[cat];
    const catOpenState = openState[cat] || {};

    // 年度の並び順（西暦数値で比較。昇順/降順トグル対応）
    const sortedYears = Object.keys(yearsMap).sort((a, b) =>
      statsSortMode === 'year-asc' ? yearToNumber(a) - yearToNumber(b) : yearToNumber(b) - yearToNumber(a)
    );

    // カテゴリ集計
    let catTotal = 0, catCorrect = 0, catAttempted = 0, catChoices = 0;
    Object.values(yearsMap).forEach(qs => qs.forEach(q => (q.choices || []).forEach(c => {
      catChoices++;
      const p = state.progress[c.id];
      if (p && p.attempts > 0) { catTotal += p.attempts; catCorrect += p.correct; catAttempted++; }
    })));
    const catAcc  = catTotal > 0 ? Math.round((catCorrect / catTotal) * 100) : null;
    const totalQ  = Object.values(yearsMap).reduce((s, qs) => s + qs.length, 0);

    const catEl = document.createElement('div');
    catEl.className = 'stats-set';

    const catHeader = document.createElement('button');
    catHeader.className = 'stats-set-header';

    const icon = document.createElement('span');
    icon.className = 'stats-toggle-icon';
    icon.textContent = '▶';

    const nameEl = document.createElement('span');
    nameEl.className = 'stats-set-name';
    nameEl.textContent = displayCategoryName(cat);

    const summaryEl = document.createElement('span');
    summaryEl.className = 'stats-set-summary';
    summaryEl.textContent = catAcc !== null
      ? `${totalQ}問 ／ ${catAttempted}/${catChoices}選択肢 ／ 正答率 ${catAcc}%`
      : `${totalQ}問 ／ 未挑戦`;

    catHeader.append(icon, nameEl, summaryEl);

    const catBody = document.createElement('div');
    catBody.className = 'stats-set-body' + (catOpenState.open ? '' : ' hidden');
    if (catOpenState.open) icon.style.transform = 'rotate(90deg)';

    sortedYears.forEach(year => {
      // 問の並び順
      let qs = [...yearsMap[year]];
      if (statsSortMode === 'section') {
        qs.sort((a, b) => {
          const sa = parseInt(((a.section || '').match(/^(\d+)/) || [])[1] || '99');
          const sb = parseInt(((b.section || '').match(/^(\d+)/) || [])[1] || '99');
          return sa !== sb ? sa - sb : getQNum(a) - getQNum(b);
        });
      } else {
        qs.sort((a, b) => getQNum(a) - getQNum(b));
      }

      const yearOpenState = (catOpenState.years || {})[year] || {};

      // 年度集計
      let yTotal = 0, yCorrect = 0, yAttempted = 0, yChoices = 0;
      qs.forEach(q => (q.choices || []).forEach(c => {
        yChoices++;
        const p = state.progress[c.id];
        if (p && p.attempts > 0) { yTotal += p.attempts; yCorrect += p.correct; yAttempted++; }
      }));
      const yAcc = yTotal > 0 ? Math.round((yCorrect / yTotal) * 100) : null;

      const yearSection = document.createElement('div');
      yearSection.className = 'stats-question-section';

      const yearHeader = document.createElement('button');
      yearHeader.className = 'stats-question-header';

      const yIcon = document.createElement('span');
      yIcon.className = 'stats-toggle-icon';
      yIcon.textContent = '▶';

      const ySrc = document.createElement('span');
      ySrc.className = 'stats-question-src';
      ySrc.textContent = year;

      const ySummary = document.createElement('span');
      ySummary.className = 'stats-question-summary';
      ySummary.textContent = yAcc !== null
        ? `${qs.length}問 ／ ${yAttempted}/${yChoices}選択肢 ／ ${yAcc}%`
        : `${qs.length}問 ／ 未挑戦`;

      yearHeader.append(yIcon, ySrc, ySummary);

      const yearBody = document.createElement('div');
      yearBody.className = 'stats-question-body' + (yearOpenState.open ? '' : ' hidden');
      if (yearOpenState.open) yIcon.style.transform = 'rotate(90deg)';

      qs.forEach(q => {
        const choices = q.choices || [];
        let qAttempts = 0, qCorrect = 0, qAttempted = 0;
        choices.forEach(c => {
          const p = state.progress[c.id];
          if (p && p.attempts > 0) { qAttempts += p.attempts; qCorrect += p.correct; qAttempted++; }
        });
        const qAcc   = qAttempts > 0 ? Math.round((qCorrect / qAttempts) * 100) : null;
        const qLabel = getQLabel(q);
        const qOpen  = (yearOpenState.qs || new Set()).has(qLabel);

        const qSection = document.createElement('div');
        qSection.className = 'stats-question-section';

        const qHeader = document.createElement('button');
        qHeader.className = 'stats-question-header';

        const qIcon = document.createElement('span');
        qIcon.className = 'stats-toggle-icon';
        qIcon.textContent = '▶';

        const qSrc = document.createElement('span');
        qSrc.className = 'stats-question-src';
        qSrc.textContent = qLabel;

        const qSummary = document.createElement('span');
        qSummary.className = 'stats-question-summary';
        qSummary.textContent = qAcc !== null
          ? `${qAttempted}/${choices.length}選択肢 ／ ${qAcc}%`
          : '未挑戦';

        qHeader.append(qIcon, qSrc, qSummary);

        const qBody = document.createElement('div');
        qBody.className = 'stats-question-body' + (qOpen ? '' : ' hidden');
        if (qOpen) qIcon.style.transform = 'rotate(90deg)';

        const table = document.createElement('table');
        table.className = 'stats-choice-table';

        choices.forEach((c, i) => {
          const p = state.progress[c.id];
          const tr = document.createElement('tr');

          const tdLabel = document.createElement('td');
          tdLabel.className = 'td-label';
          tdLabel.textContent = (CHOICE_LABELS[i] || String(i + 1)) + '.';

          const tdText = document.createElement('td');
          tdText.className = 'td-text';
          tdText.textContent = c.text;

          const tdHistory = document.createElement('td');
          tdHistory.appendChild(makeHistoryDots(p));

          const tdAcc = document.createElement('td');
          tdAcc.className = 'td-acc';
          if (p && p.attempts > 0) {
            const acc = Math.round((p.correct / p.attempts) * 100);
            tdAcc.textContent = `${acc}% (${p.correct}/${p.attempts})`;
            if (acc >= 70) tdAcc.classList.add('cell-correct');
            else if (acc < 40) tdAcc.classList.add('cell-incorrect');
          } else {
            tdAcc.textContent = '未挑戦';
            tdAcc.style.color = 'var(--text-3)';
          }

          tr.append(tdLabel, tdText, tdHistory, tdAcc);
          table.appendChild(tr);
        });

        qBody.appendChild(table);

        qHeader.addEventListener('click', () => {
          const nowHidden = qBody.classList.toggle('hidden');
          qIcon.style.transform = nowHidden ? '' : 'rotate(90deg)';
        });

        qSection.append(qHeader, qBody);
        yearBody.appendChild(qSection);
      });

      yearHeader.addEventListener('click', () => {
        const nowHidden = yearBody.classList.toggle('hidden');
        yIcon.style.transform = nowHidden ? '' : 'rotate(90deg)';
      });

      yearSection.append(yearHeader, yearBody);
      catBody.appendChild(yearSection);
    });

    catHeader.addEventListener('click', () => {
      const nowHidden = catBody.classList.toggle('hidden');
      icon.style.transform = nowHidden ? '' : 'rotate(90deg)';
    });

    catEl.append(catHeader, catBody);
    container.appendChild(catEl);
  });

  showScreen('stats');
}

// ========== Questions Screen ==========

// source から問番号を数値で取得（ソート用）
function getQNum(q) {
  const m = (q.source || q.id).match(/問(\d+)/);
  return m ? parseInt(m[1]) : 999;
}

// source から "問N" だけ取り出して表示用に使う
function getQLabel(q) {
  const m = (q.source || q.id).match(/問(\d+)/);
  return m ? `問${m[1]}` : (q.source || q.id);
}

function deleteQuestionsByCategoryYear(category, year) {
  state.questions = state.questions.filter(q => !(q.category === category && q.year === year));
  saveQuestions();
  buildFilters();
  updateHomeStats();
}

// ========== 保存済み問題 独立フィルターバー ==========
function renderQlistFilterBar() {
  const bar = document.getElementById('qlist-filter-bar');
  if (!bar) return;
  bar.innerHTML = '';

  // ── カテゴリチップ行 ──
  const categories = [...new Set(state.questions.map(q => q.category).filter(Boolean))];
  const sortedCats = sortCategories(categories);
  if (sortedCats.length > 0) {
    const catRow = document.createElement('div');
    catRow.className = 'qlist-filter-row';
    sortedCats.forEach(cat => {
      const chip = document.createElement('button');
      chip.className = 'chip qlist-filter-chip' + (qlistFilterCats.has(cat) ? ' active' : '');
      chip.textContent = displayCategoryName(cat);
      chip.addEventListener('click', () => {
        if (qlistFilterCats.has(cat)) qlistFilterCats.delete(cat);
        else qlistFilterCats.add(cat);
        renderQlistFilterBar();
        renderQuestionList(getToggleOpenState('questions-container'));
      });
      catRow.appendChild(chip);
    });
    bar.appendChild(catRow);
  }

  // ── アクション行（ブックマーク・タグ・クリア） ──
  const actionRow = document.createElement('div');
  actionRow.className = 'qlist-filter-row qlist-filter-actions';

  const bmBtn = document.createElement('button');
  bmBtn.className = 'btn btn-ghost btn-sm' + (qlistFilterBookmark ? ' active' : '');
  bmBtn.textContent = qlistFilterBookmark ? '★ ブックマーク' : '☆ ブックマーク';
  bmBtn.title = 'ブックマークした問題だけ表示';
  bmBtn.addEventListener('click', () => {
    qlistFilterBookmark = !qlistFilterBookmark;
    renderQlistFilterBar();
    renderQuestionList(getToggleOpenState('questions-container'));
  });

  const tagBtn = document.createElement('button');
  tagBtn.className = 'btn btn-ghost btn-sm' + (qlistTagPanelOpen || qlistFilterTags.size > 0 ? ' active' : '');
  tagBtn.textContent = '🏷 タグ' + (qlistFilterTags.size > 0 ? ` (${qlistFilterTags.size})` : '');
  tagBtn.title = 'タグで絞り込む';
  tagBtn.addEventListener('click', () => {
    qlistTagPanelOpen = !qlistTagPanelOpen;
    renderQlistFilterBar();
  });

  actionRow.append(bmBtn, tagBtn);

  // クリアボタン（フィルターが有効な時のみ）
  const hasFilter = qlistFilterCats.size > 0 || qlistFilterBookmark || qlistFilterTags.size > 0;
  if (hasFilter) {
    const clearBtn = document.createElement('button');
    clearBtn.className = 'btn btn-ghost btn-sm';
    clearBtn.textContent = '✕ クリア';
    clearBtn.style.marginLeft = 'auto';
    clearBtn.addEventListener('click', () => {
      qlistFilterCats.clear();
      qlistFilterBookmark = false;
      qlistFilterTags.clear();
      qlistTagPanelOpen = false;
      renderQlistFilterBar();
      renderQuestionList(getToggleOpenState('questions-container'));
    });
    actionRow.appendChild(clearBtn);
  }
  bar.appendChild(actionRow);

  // ── タグパネル ──
  if (qlistTagPanelOpen) {
    const allTags = sortTagsJa([...new Set(state.questions.flatMap(q => q.tags || []))]);
    if (allTags.length > 0) {
      const tagRow = document.createElement('div');
      tagRow.className = 'qlist-filter-row qlist-tag-panel';
      allTags.forEach(tag => {
        const chip = document.createElement('button');
        chip.className = 'chip qlist-filter-chip' + (qlistFilterTags.has(tag) ? ' active' : '');
        chip.textContent = '#' + tag;
        chip.addEventListener('click', () => {
          if (qlistFilterTags.has(tag)) qlistFilterTags.delete(tag);
          else qlistFilterTags.add(tag);
          renderQlistFilterBar();
          renderQuestionList(getToggleOpenState('questions-container'));
        });
        tagRow.appendChild(chip);
      });
      bar.appendChild(tagRow);
    } else {
      const empty = document.createElement('div');
      empty.style.cssText = 'font-size:.75rem;color:var(--text-3);padding:4px 2px;';
      empty.textContent = 'タグが登録されていません';
      bar.appendChild(empty);
    }
  }
}

function renderQuestionList(openState) {
  openState = openState || {};
  const container = document.getElementById('questions-container');
  container.innerHTML = '';

  qlistNavQueue = []; // リセット

  // 独立フィルターを適用
  const hasFilter = qlistFilterCats.size > 0 || qlistFilterBookmark || qlistFilterTags.size > 0;
  const allQs = state.questions.filter(q => {
    if (!matchesSearch(q, qlistSearchQuery)) return false;
    if (qlistFilterCats.size > 0 && !qlistFilterCats.has(q.category)) return false;
    if (qlistFilterBookmark && !questionHasAnyBookmark(q)) return false; // 問題☆または選択肢☆
    if (qlistFilterTags.size > 0 && !q.tags?.some(t => qlistFilterTags.has(t))) return false;
    return true;
  });

  if (allQs.length === 0) {
    const msg = document.createElement('div');
    msg.style.cssText = 'text-align:center;color:var(--text-3);padding:40px;';
    msg.textContent = qlistSearchQuery
      ? `「${qlistSearchQuery}」に一致する問題がありません`
      : hasFilter ? 'フィルター条件に一致する問題がありません' : '問題がありません';
    container.appendChild(msg);
    renderBulkTagArea();
    showScreen('questions');
    return;
  }

  // Group: category → (year | '__sec__'+section | '年度不明') → questions
  const grouped = {};
  allQs.forEach(q => {
    const cat = q.category || 'カテゴリ不明';
    let bucket;
    if (q.year) {
      bucket = q.year;
    } else if (q.section) {
      bucket = '__sec__' + q.section;
    } else {
      bucket = '年度不明';
    }
    if (!grouped[cat])         grouped[cat] = {};
    if (!grouped[cat][bucket]) grouped[cat][bucket] = [];
    grouped[cat][bucket].push(q);
  });

  const sortedCats = sortCategories(Object.keys(grouped));

  sortedCats.forEach(cat => {
    const yearsMap    = grouped[cat];
    const totalQ      = Object.values(yearsMap).reduce((s, qs) => s + qs.length, 0);
    // getToggleOpenState は DOM の表示名でキーを保存するため、表示名で検索する
    const catOpenState = openState[displayCategoryName(cat)] || {};

    // 年度の並び順：年度あり → 分野別（__sec__プレフィックス）→ 年度不明
    const sortedYears = Object.keys(yearsMap).sort((a, b) => {
      const aIsSec = a.startsWith('__sec__');
      const bIsSec = b.startsWith('__sec__');
      const aIsUnk = a === '年度不明';
      const bIsUnk = b === '年度不明';
      if (aIsUnk !== bIsUnk) return aIsUnk ? 1 : -1;
      if (aIsSec !== bIsSec) return aIsSec ? 1 : -1;
      if (aIsSec && bIsSec) {
        const na = parseInt((a.slice(7).match(/^(\d+)/) || [])[1] || '99');
        const nb = parseInt((b.slice(7).match(/^(\d+)/) || [])[1] || '99');
        return na - nb;
      }
      return qlistSortMode === 'year-asc' ? yearToNumber(a) - yearToNumber(b) : yearToNumber(b) - yearToNumber(a);
    });

    // ── カテゴリ行 ──
    const catEl = document.createElement('div');
    catEl.className = 'stats-set';

    const catHeader = document.createElement('button');
    catHeader.className = 'stats-set-header';

    const icon = document.createElement('span');
    icon.className = 'stats-toggle-icon';
    icon.textContent = '▶';

    const nameEl = document.createElement('span');
    nameEl.className = 'stats-set-name';
    nameEl.textContent = displayCategoryName(cat);

    const summaryEl = document.createElement('span');
    summaryEl.className = 'stats-set-summary';
    summaryEl.textContent = `${totalQ}問`;

    catHeader.append(icon, nameEl, summaryEl);

    const catBody = document.createElement('div');
    catBody.className = 'stats-set-body' + (catOpenState.open ? '' : ' hidden');
    if (catOpenState.open) icon.style.transform = 'rotate(90deg)';

    sortedYears.forEach(year => {
      // 問の並び順（分野順モードのとき section → 問番号、それ以外は問番号のみ）
      let qs = [...yearsMap[year]];
      if (qlistSortMode === 'section') {
        qs.sort((a, b) => {
          const sa = parseInt(((a.section || '').match(/^(\d+)/) || [])[1] || '99');
          const sb = parseInt(((b.section || '').match(/^(\d+)/) || [])[1] || '99');
          return sa !== sb ? sa - sb : getQNum(a) - getQNum(b);
        });
      } else {
        qs.sort((a, b) => getQNum(a) - getQNum(b));
      }

      // ── 年度行 ──
      const yearSection = document.createElement('div');
      yearSection.className = 'stats-question-section';

      const yearHeader = document.createElement('button');
      yearHeader.className = 'stats-question-header';

      const yIcon = document.createElement('span');
      yIcon.className = 'stats-toggle-icon';
      yIcon.textContent = '▶';

      const isSectionBucket = year.startsWith('__sec__');
      const bucketLabel = isSectionBucket ? `分野別：${year.slice(7)}` : year;
      // DOM の表示ラベルと同じキーで開閉状態を検索
      const yearOpenState = (catOpenState.years || {})[bucketLabel] || {};

      const ySrc = document.createElement('span');
      ySrc.className = 'stats-question-src';
      ySrc.textContent = bucketLabel;

      const ySummary = document.createElement('span');
      ySummary.className = 'stats-question-summary';
      ySummary.textContent = `${qs.length}問`;

      const delYearBtn = document.createElement('button');
      delYearBtn.className = 'btn btn-danger btn-sm set-delete-btn';
      delYearBtn.textContent = '一括削除';
      delYearBtn.dataset.action = isSectionBucket ? 'delete-cat-sec' : 'delete-cat-year';
      delYearBtn.dataset.category = cat;
      if (isSectionBucket) delYearBtn.dataset.section = year.slice(7);
      else delYearBtn.dataset.year = year;

      if (qlistSelectMode) {
        const groupCb = document.createElement('input');
        groupCb.type = 'checkbox';
        groupCb.className = 'qlist-group-cb';
        const groupIds = qs.map(q => q.id);
        groupCb.dataset.groupIds = groupIds.join(',');
        const allSel = groupIds.every(id => selectedQIds.has(id));
        const anySel = groupIds.some(id => selectedQIds.has(id));
        groupCb.checked = allSel;
        groupCb.indeterminate = !allSel && anySel;
        groupCb.addEventListener('click', e => e.stopPropagation());
        groupCb.addEventListener('change', e => {
          if (e.target.checked) groupIds.forEach(id => selectedQIds.add(id));
          else groupIds.forEach(id => selectedQIds.delete(id));
          updateSelectBar();
          renderQuestionList(getToggleOpenState('questions-container'));
        });
        yearHeader.prepend(groupCb);
      }
      yearHeader.append(yIcon, ySrc, ySummary, delYearBtn);

      const yearBody = document.createElement('div');
      yearBody.className = 'stats-question-body' + (yearOpenState.open ? '' : ' hidden');
      if (yearOpenState.open) yIcon.style.transform = 'rotate(90deg)';

      qs.forEach(q => {
        qlistNavQueue.push(q.id);
        const row = document.createElement('div');
        row.className = 'qlist-row';

        const info = document.createElement('div');
        info.className = 'qlist-info';

        const srcEl = document.createElement('div');
        srcEl.className = 'qlist-src';
        // ★ ブックマーク表示（問題／選択肢を区別してラベル）
        appendBookmarkBadges(srcEl, q);
        srcEl.appendChild(document.createTextNode(getQLabel(q)));
        // 計算問題バッジ
        if (isCalcQuestion(q)) {
          const calcBadge = document.createElement('span');
          calcBadge.className = 'qlist-calc-badge';
          calcBadge.textContent = '🔢';
          calcBadge.title = '計算問題';
          srcEl.appendChild(calcBadge);
        }
        // タグインライン表示
        if (q.tags && q.tags.length > 0) {
          q.tags.forEach(tag => {
            const tagSpan = document.createElement('span');
            tagSpan.className = 'qlist-tag-inline';
            tagSpan.textContent = '#' + tag;
            srcEl.appendChild(tagSpan);
          });
        }

        const subEl = document.createElement('div');
        subEl.className = 'qlist-sub';
        subEl.textContent = [q.section, q.subcategory].filter(Boolean).join('　/　');

        info.append(srcEl, subEl);

        // チェックボックス（選択モード時）
        if (qlistSelectMode) {
          const cb = document.createElement('input');
          cb.type = 'checkbox';
          cb.className = 'qlist-cb';
          cb.checked = selectedQIds.has(q.id);
          cb.addEventListener('change', e => {
            if (e.target.checked) selectedQIds.add(q.id);
            else selectedQIds.delete(q.id);
            updateSelectBar();
          });
          row.prepend(cb);
          row.style.cursor = 'pointer';
          row.addEventListener('click', e => {
            if (e.target === cb) return;
            cb.checked = !cb.checked;
            cb.dispatchEvent(new Event('change'));
          });
        }

        const viewBtn = document.createElement('button');
        viewBtn.className = 'btn btn-ghost btn-sm';
        viewBtn.textContent = '表示';
        viewBtn.style.flexShrink = '0';
        viewBtn.addEventListener('click', e => { e.stopPropagation(); openViewModal(q.id); });

        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-outline btn-sm';
        editBtn.textContent = '編集';
        editBtn.style.flexShrink = '0';
        editBtn.addEventListener('click', e => { e.stopPropagation(); openEditModal(q.id, null, true); });

        const delBtn = document.createElement('button');
        delBtn.className = 'btn btn-danger btn-sm';
        delBtn.style.flexShrink = '0';
        delBtn.textContent = '削除';
        delBtn.dataset.action = 'delete-q';
        delBtn.dataset.qid = q.id;

        row.append(info, viewBtn, editBtn, delBtn);
        yearBody.appendChild(row);
      });

      yearHeader.addEventListener('click', () => {
        const nowHidden = yearBody.classList.toggle('hidden');
        yIcon.style.transform = nowHidden ? '' : 'rotate(90deg)';
      });

      yearSection.append(yearHeader, yearBody);
      catBody.appendChild(yearSection);
    });

    catHeader.addEventListener('click', () => {
      const nowHidden = catBody.classList.toggle('hidden');
      icon.style.transform = nowHidden ? '' : 'rotate(90deg)';
    });

    catEl.append(catHeader, catBody);
    container.appendChild(catEl);
  });

  renderBulkTagArea();
  showScreen('questions');
}

function renderFilteredQuestionList(openState) {
  openState = openState || {};
  const container = document.getElementById('questions-container');
  container.innerHTML = '';

  qlistNavQueue = []; // リセット
  const fqs = getFilteredQuestions().filter(q => matchesSearch(q, qlistSearchQuery));

  if (fqs.length === 0) {
    const msg = document.createElement('div');
    msg.style.cssText = 'text-align:center;color:var(--text-3);padding:40px;font-size:.88rem;';
    if (state.activeCategories.size === 0) {
      msg.textContent = 'ホーム画面でカテゴリフィルターを設定してください';
    } else if (qlistSearchQuery) {
      msg.textContent = `「${qlistSearchQuery}」に一致する問題がありません`;
    } else {
      msg.textContent = 'フィルター条件に一致する問題がありません';
    }
    container.appendChild(msg);
    showScreen('questions');
    return;
  }

  // Group by section
  const grouped = {};
  fqs.forEach(q => {
    const sec = q.section || '分野不明';
    if (!grouped[sec]) grouped[sec] = [];
    grouped[sec].push(q);
  });

  // Sort sections numerically by leading number
  const sortedSections = sortSections(Object.keys(grouped));

  sortedSections.forEach(sec => {
    const qs = grouped[sec];
    const secOpenState = openState[sec] || {};

    // Sort: year desc → qnum asc
    qs.sort((a, b) => {
      const yearCmp = yearToNumber(b.year) - yearToNumber(a.year);
      if (yearCmp !== 0) return yearCmp;
      return getQNum(a) - getQNum(b);
    });

    // Section header
    const secEl = document.createElement('div');
    secEl.className = 'stats-set';

    const secHeader = document.createElement('button');
    secHeader.className = 'stats-set-header';

    const icon = document.createElement('span');
    icon.className = 'stats-toggle-icon';
    icon.textContent = '▶';

    const nameEl = document.createElement('span');
    nameEl.className = 'stats-set-name';
    nameEl.textContent = sec;

    const summaryEl = document.createElement('span');
    summaryEl.className = 'stats-set-summary';
    summaryEl.textContent = `${qs.length}問`;

    secHeader.append(icon, nameEl, summaryEl);

    const secBody = document.createElement('div');
    secBody.className = 'stats-set-body' + (secOpenState.open ? '' : ' hidden');
    if (secOpenState.open) icon.style.transform = 'rotate(90deg)';

    qs.forEach(q => {
      const row = document.createElement('div');
      row.className = 'qlist-row';

      const info = document.createElement('div');
      info.className = 'qlist-info';

      const srcEl = document.createElement('div');
      srcEl.className = 'qlist-src';
      // ★ ブックマーク表示（問題／選択肢を区別してラベル）
      appendBookmarkBadges(srcEl, q);
      srcEl.appendChild(document.createTextNode(getQLabel(q) + (q.year ? ` (${q.year})` : '')));
      // 計算問題バッジ
      if (isCalcQuestion(q)) {
        const calcBadge = document.createElement('span');
        calcBadge.className = 'qlist-calc-badge';
        calcBadge.textContent = '🔢';
        calcBadge.title = '計算問題';
        srcEl.appendChild(calcBadge);
      }
      // タグインライン表示
      if (q.tags && q.tags.length > 0) {
        q.tags.forEach(tag => {
          const tagSpan = document.createElement('span');
          tagSpan.className = 'qlist-tag-inline';
          tagSpan.textContent = '#' + tag;
          srcEl.appendChild(tagSpan);
        });
      }

      const subEl = document.createElement('div');
      subEl.className = 'qlist-sub';
      subEl.textContent = q.subcategory || '';

      info.append(srcEl, subEl);

      qlistNavQueue.push(q.id);

      const viewBtn = document.createElement('button');
      viewBtn.className = 'btn btn-ghost btn-sm';
      viewBtn.textContent = '表示';
      viewBtn.style.flexShrink = '0';
      viewBtn.addEventListener('click', e => { e.stopPropagation(); openViewModal(q.id); });

      const editBtn = document.createElement('button');
      editBtn.className = 'btn btn-outline btn-sm';
      editBtn.textContent = '編集';
      editBtn.style.flexShrink = '0';
      editBtn.addEventListener('click', e => { e.stopPropagation(); openEditModal(q.id, null, true); });

      const delBtn = document.createElement('button');
      delBtn.className = 'btn btn-danger btn-sm';
      delBtn.style.flexShrink = '0';
      delBtn.textContent = '削除';
      delBtn.dataset.action = 'delete-q';
      delBtn.dataset.qid = q.id;

      row.append(info, viewBtn, editBtn, delBtn);
      secBody.appendChild(row);
    });

    secHeader.addEventListener('click', () => {
      const nowHidden = secBody.classList.toggle('hidden');
      icon.style.transform = nowHidden ? '' : 'rotate(90deg)';
    });

    secEl.append(secHeader, secBody);
    container.appendChild(secEl);
  });

  showScreen('questions');
}

function setupQuestionListDelegation() {
  const container = document.getElementById('questions-container');
  container.addEventListener('click', e => {
    // 個別削除
    const qBtn = e.target.closest('[data-action="delete-q"]');
    if (qBtn) {
      e.stopPropagation();
      const qid = qBtn.dataset.qid;
      const q   = state.questions.find(q => q.id === qid);
      const label = q ? (getQLabel(q) + (q.year ? ` (${q.year})` : '')) : qid;
      if (!confirm(`「${label}」を削除しますか？`)) return;
      const prevState1 = getToggleOpenState('questions-container');
      deleteQuestion(qid);
      renderQuestionList(prevState1);
      return;
    }
    // 年度一括削除
    const yBtn = e.target.closest('[data-action="delete-cat-year"]');
    if (yBtn) {
      e.stopPropagation();
      const { category, year } = yBtn.dataset;
      const count = state.questions.filter(q => q.category === category && q.year === year).length;
      if (!confirm(`「${category} ${year}」の全 ${count} 問を削除しますか？\nこの操作は取り消せません。`)) return;
      const prevState2 = getToggleOpenState('questions-container');
      deleteQuestionsByCategoryYear(category, year);
      renderQuestionList(prevState2);
    }
    // 分野別グループ一括削除
    const sBtn = e.target.closest('[data-action="delete-cat-sec"]');
    if (sBtn) {
      e.stopPropagation();
      const { category, section } = sBtn.dataset;
      const count = state.questions.filter(q => q.category === category && !q.year && q.section === section).length;
      if (!confirm(`「${category} 分野別：${section}」の全 ${count} 問を削除しますか？\nこの操作は取り消せません。`)) return;
      const prevState3 = getToggleOpenState('questions-container');
      state.questions = state.questions.filter(q => !(q.category === category && !q.year && q.section === section));
      saveQuestions();
      buildFilters();
      updateHomeStats();
      renderQuestionList(prevState3);
    }
  });
}

// ========== Export / Import Progress ==========
// ========== Export Questions ==========
function buildSetJson(setName, questions) {
  // _setName を除いてクリーンなJSONを生成
  const cleaned = questions.map(({ _setName, ...q }) => q);
  return {
    title: setName,
    meta: {
      title: setName,
      created: new Date().toISOString().slice(0, 10)
    },
    questions: cleaned
  };
}

function downloadJson(obj, filename) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function setNameToFilename(setName) {
  // "令和5年度 甲種 法令" → "r5-hourei.json" 的な変換（読みやすいファイル名）
  return setName
    .replace(/令和(\d+)年度/g, (_, n) => 'r' + n)
    .replace(/\s+/g, '_')
    .replace(/[^\w\-_.ぁ-んァ-ン一-龥]/g, '')
    + '.json';
}

function openExportQuestionsModal(mode = 'set') {
  const byCategory = (mode === 'category');

  // タイトル・説明をモードに合わせて更新
  const titleEl = document.getElementById('modal-export-q-title');
  const descEl  = document.getElementById('modal-export-q-desc');
  if (titleEl) titleEl.textContent = byCategory ? '📤 問題を科目別書き出し' : '📤 問題を年度別書き出し';
  if (descEl)  descEl.innerHTML = byCategory
    ? '登録済みの問題を科目（分野）ごとに1つのJSONファイルへ書き出します。<br>ダウンロードしたファイルは「JSONファイルを追加」で再度読み込めます。'
    : '登録済みの問題セットをJSONファイルに書き出します。<br>ダウンロードしたファイルは「JSONファイルを追加」で再度読み込めます。';

  const sets = {};
  state.questions.forEach(q => {
    let key;
    if (byCategory) {
      key = q.category || 'その他';
    } else {
      key = q._setName || 'その他';
      if (key === 'デフォルト問題') return; // デフォルトは書き出し対象外
    }
    if (!sets[key]) sets[key] = [];
    sets[key].push(q);
  });

  const list = document.getElementById('export-q-list');
  list.innerHTML = '';

  if (Object.keys(sets).length === 0) {
    list.innerHTML = '<p style="color:var(--text-3);font-size:.85rem;">書き出せる問題がありません。</p>';
    document.getElementById('btn-export-q-all').disabled = true;
  } else {
    document.getElementById('btn-export-q-all').disabled = false;

    // セット名に含まれる科目をCATEGORY_ORDER順のインデックスに変換（「：」以降のキーワードで判定）
    const setNameCatIndex = (name) => {
      const idx = CATEGORY_ORDER.findIndex(c => {
        const kw = c.split('：').pop(); // 'ガス技術：製造' → '製造'
        return name.includes(kw);
      });
      return idx === -1 ? 99 : idx;
    };

    // 並び順: 科目別はCATEGORY_ORDER順、年度別は年度↓新しい順→カテゴリ順→50音順（全画面と統一）
    const sortedSets = byCategory
      ? Object.entries(sets).sort(([a], [b]) => {
          const ia = CATEGORY_ORDER.indexOf(a);
          const ib = CATEGORY_ORDER.indexOf(b);
          if (ia !== ib) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
          return a.localeCompare(b, 'ja');
        })
      : Object.entries(sets).sort(([a], [b]) => {
          const ya = yearToNumber(a), yb = yearToNumber(b); // 元号対応・令和元/平成/2桁もOK
          if (ya !== yb) return yb - ya;                    // 新しい年度を上に
          const ia = setNameCatIndex(a), ib = setNameCatIndex(b);
          if (ia !== ib) return ia - ib;
          return a.localeCompare(b, 'ja');
        });

    sortedSets.forEach(([setName, qs]) => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border-light);';

      const info = document.createElement('div');
      info.innerHTML = `<div style="font-size:.88rem;color:var(--text-1);font-weight:600;">${setName}</div>
                        <div style="font-size:.75rem;color:var(--text-3);">${qs.length}問 ／ ${qs.reduce((s,q)=>s+(q.choices||[]).length,0)}選択肢</div>`;

      const btn = document.createElement('button');
      btn.className = 'btn btn-outline btn-sm';
      btn.textContent = '⬇ DL';
      btn.style.flexShrink = '0';
      btn.addEventListener('click', () => {
        downloadJson(buildSetJson(setName, qs), setNameToFilename(setName));
      });

      row.append(info, btn);
      list.appendChild(row);
    });

    // 全セットまとめてDL
    document.getElementById('btn-export-q-all').onclick = () => {
      sortedSets.forEach(([setName, qs], i) => {
        // 連続ダウンロード対策で少し間を空ける
        setTimeout(() => {
          downloadJson(buildSetJson(setName, qs), setNameToFilename(setName));
        }, i * 300);
      });
    };
  }

  document.getElementById('modal-export-questions').classList.remove('hidden');
}

// ========== Google Drive 自動同期 ==========
const GDRIVE_CLIENT_ID  = '615794538907-9d0hkcfp1paj88k3bknrjgndqdt86v7v.apps.googleusercontent.com';
const GDRIVE_SCOPE      = 'https://www.googleapis.com/auth/drive.appdata';
const GDRIVE_FILE       = 'gas_study_backup.json';
const GDRIVE_SYNCED_KEY   = 'gas_drive_synced_at';
const GDRIVE_CONNECTED_KEY = 'gas_drive_connected'; // ユーザーが一度でも接続したフラグ

let _gisTokenClient    = null;
let _gdriveToken       = null;

/** GIS ライブラリロード完了時に呼ばれる（index.html の onload 属性から） */
function _gisLoaded() {
  try {
    _gisTokenClient = google.accounts.oauth2.initTokenClient({
      client_id: GDRIVE_CLIENT_ID,
      scope:     GDRIVE_SCOPE,
      callback:  _onTokenResponse,
      // error_callback がないと iOS Chrome でポップアップブロック時にクラッシュする
      error_callback: err => console.warn('[GDrive] token error:', err?.type),
    });

    // 以前に接続済みの場合はサイレントでトークン取得を試みる
    // error_callback がエラーを捕捉し、location.reload() を廃止済みのためループしない
    if (localStorage.getItem(GDRIVE_CONNECTED_KEY)) {
      _updateDriveBtnUI(true);
      _gisTokenClient.requestAccessToken({ prompt: '' });
    }
  } catch(e) { console.warn('[GDrive] GIS init error', e); }
}

/** トークン取得成功時の共通処理 */
function _onTokenResponse(res) {
  if (res.error) { console.warn('[GDrive] token response error:', res.error); return; }
  _gdriveToken = res.access_token;
  _updateDriveBtnUI();
  // 自動上書きはせず、Drive に新しいデータがあるかだけ確認して通知
  if (!document.getElementById('screen-home')?.classList.contains('hidden')) {
    gdriveCheckRemote().catch(() => {});
  }
}

/** アクセストークン取得（サインインボタン用：ユーザー操作起点） */
function _gdriveRequestToken() {
  return new Promise((resolve, reject) => {
    if (!_gisTokenClient) { reject('GIS未ロード'); return; }
    _gisTokenClient.callback = res => {
      if (res.error) { reject(res.error); return; }
      _gdriveToken = res.access_token;
      resolve(res.access_token);
    };
    _gisTokenClient.requestAccessToken({ prompt: 'select_account' });
  });
}

/**
 * サイレント再認証（ユーザー操作不要）。
 * Googleのブラウザセッションが有効なら自動成功。
 * セッション切れ等の場合は reject される（その場合は手動再接続が必要）。
 */
function _gdriveRequestTokenSilent() {
  return new Promise((resolve, reject) => {
    if (!_gisTokenClient) { reject('GIS未ロード'); return; }
    _gisTokenClient.callback = res => {
      _gisTokenClient.callback = _onTokenResponse; // 元のコールバックに戻す
      if (res.error) { reject(res.error); return; }
      _gdriveToken = res.access_token;
      resolve(res.access_token);
    };
    _gisTokenClient.requestAccessToken({ prompt: '' });
  });
}

// connected=true → トークンはないがフラグあり（過去接続済み）の見た目
function _updateDriveBtnUI(connected = false) {
  const btn = document.getElementById('btn-drive-signin');
  if (!btn) return;
  if (_gdriveToken) {
    btn.textContent = '☁️ Drive 同期中';
    btn.classList.add('btn-connected');
  } else if (connected || localStorage.getItem(GDRIVE_CONNECTED_KEY)) {
    btn.textContent = '☁️ Drive 再接続する';
    btn.classList.add('btn-connected');
  } else {
    btn.textContent = '☁️ Driveに接続する';
    btn.classList.remove('btn-connected');
  }
}

/** 同期ステータス表示（ヘッダー右端の固定枠内で opacity トグル） */
let _syncTimer = null;
function showSyncStatus(msg, persistent = false) {
  const el = document.getElementById('sync-status');
  if (!el) return;
  el.innerHTML = `<span class="sync-badge">${msg}</span>`;
  el.classList.add('sync-active');
  clearTimeout(_syncTimer);
  // persistent=true（保存中など）は自動で消さず、次のステータス表示まで出し続ける
  if (!persistent) _syncTimer = setTimeout(() => el.classList.remove('sync-active'), 5000);
}

/**
 * 全データを Drive にアップロード。
 * silent=true → 未サインイン時はサイレント再接続を試み、失敗時のみ通知。
 * _isRetry=true → 401後の自動リトライ（1回のみ。無限ループ防止）。
 */
async function gdriveUpload(silent = false, _isRetry = false) {
  try {
    if (!_gdriveToken) {
      if (silent) {
        if (localStorage.getItem(GDRIVE_CONNECTED_KEY)) {
          // 過去に接続済み → サイレント再接続を試みてそのまま続行
          try {
            await _gdriveRequestTokenSilent();
            _updateDriveBtnUI();
          } catch {
            showSyncStatus('⚠️ Drive 未接続のため保存されませんでした（設定から再接続してください）');
            return;
          }
        } else {
          return; // 一度も接続したことがない → 何もしない（通知も不要）
        }
      } else {
        _gdriveToken = await _gdriveRequestToken(false);
        _updateDriveBtnUI();
      }
    }
    showSyncStatus('☁️ Drive に保存中…', true);  // 完了/失敗メッセージが出るまで表示し続ける

    // データ収集
    const lsData = {};
    for (const key of BACKUP_LS_KEYS) {
      const val = localStorage.getItem(key);
      if (val) lsData[key] = JSON.parse(val);
    }
    const idbImages = {};
    try {
      const db = await _openIDB();
      await new Promise(resolve => {
        const req = db.transaction(IDB_STORE, 'readonly').objectStore(IDB_STORE).openCursor();
        req.onsuccess = e => {
          const cursor = e.target.result;
          if (cursor) { idbImages[cursor.key] = cursor.value; cursor.continue(); }
          else resolve();
        };
        req.onerror = resolve;
      });
    } catch {}

    const now     = new Date().toISOString();
    const payload = JSON.stringify({ version: 2, exportedAt: now, localStorage: lsData, indexedDB: { images: idbImages } });

    // 既存ファイル検索
    const listRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name%3D%27${encodeURIComponent(GDRIVE_FILE)}%27&fields=files(id)`,
      { headers: { Authorization: `Bearer ${_gdriveToken}` } }
    );
    if (listRes.status === 401) {
      _gdriveToken = null; _updateDriveBtnUI();
      if (!_isRetry) {
        // サイレント再接続→自動リトライ（1回のみ）
        try { await _gdriveRequestTokenSilent(); _updateDriveBtnUI(); await gdriveUpload(silent, true); return; } catch {}
      }
      showSyncStatus('⚠️ Drive 再接続が必要です'); return;
    }
    const listData   = await listRes.json();
    const existingId = listData.files?.[0]?.id;

    const meta = { name: GDRIVE_FILE, mimeType: 'application/json' };
    if (!existingId) meta.parents = ['appDataFolder'];

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(meta)], { type: 'application/json' }));
    form.append('file',     new Blob([payload],              { type: 'application/json' }));

    const res = await fetch(
      existingId
        ? `https://www.googleapis.com/upload/drive/v3/files/${existingId}?uploadType=multipart`
        : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      { method: existingId ? 'PATCH' : 'POST', headers: { Authorization: `Bearer ${_gdriveToken}` }, body: form }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    localStorage.setItem(GDRIVE_SYNCED_KEY, new Date(now).getTime().toString());
    showSyncStatus('✅ Drive に保存しました');
  } catch(e) {
    console.error('[GDrive upload]', e);
    showSyncStatus('⚠️ Drive 保存失敗');
  }
}

/** Drive 上のバックアップファイル情報（id, modifiedTime）を取得 */
async function _gdriveFindFile() {
  const listRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name%3D%27${encodeURIComponent(GDRIVE_FILE)}%27&fields=files(id,modifiedTime)`,
    { headers: { Authorization: `Bearer ${_gdriveToken}` } }
  );
  if (!listRes.ok) {
    if (listRes.status === 401) { _gdriveToken = null; _updateDriveBtnUI(); }
    return null;
  }
  const listData = await listRes.json();
  return listData.files?.[0] || null;
}

/** Drive からデータを取得してローカルへ適用（タイムスタンプ問わず上書き） */
async function _gdriveFetchAndApply(fileId, driveTime) {
  const fileRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    { headers: { Authorization: `Bearer ${_gdriveToken}` } }
  );
  const data = await fileRes.json();

  const ls = data.localStorage || {};
  for (const key of BACKUP_LS_KEYS) {
    if (ls[key] !== undefined) localStorage.setItem(key, JSON.stringify(ls[key]));
  }
  const images = data.indexedDB?.images || {};
  for (const [key, val] of Object.entries(images)) await idbSet(key, val);

  localStorage.setItem(GDRIVE_SYNCED_KEY, driveTime.toString());
  // location.reload() はiOSでクラッシュするため、アプリ状態をその場で再初期化
  await _reloadAppState();
}

/** 手動ダウンロード：ユーザーが明示的に選んだ場合のみ、Drive の内容で上書きする */
async function gdriveDownloadNow() {
  if (!_gdriveToken) { showSyncStatus('⚠️ 先に「Driveに接続する」を押してください'); return; }
  try {
    showSyncStatus('☁️ Drive から取得中…');
    const file = await _gdriveFindFile();
    if (!file) { showSyncStatus('⚠️ Drive にバックアップが見つかりません'); return; }
    const driveTime = new Date(file.modifiedTime).getTime();
    await _gdriveFetchAndApply(file.id, driveTime);
    showSyncStatus('✅ Drive のデータを反映しました');
  } catch(e) {
    console.error('[GDrive download]', e);
    showSyncStatus('⚠️ ダウンロード失敗');
  }
}

/** 手動同期モーダルを開く（アップロード／ダウンロードを選択） */
async function openDriveSyncModal() {
  if (!_gdriveToken) {
    try {
      _gdriveToken = await _gdriveRequestToken();
      localStorage.setItem(GDRIVE_CONNECTED_KEY, '1');
      _updateDriveBtnUI();
    } catch {
      showSyncStatus('⚠️ 先に「Driveに接続する」を押してください');
      return;
    }
  }
  const modal   = document.getElementById('modal-drive-sync');
  const timesEl = document.getElementById('drive-sync-times');
  const fmt = ms => ms ? new Date(ms).toLocaleString('ja-JP') : '—';
  const localTime = parseInt(localStorage.getItem(GDRIVE_SYNCED_KEY) || '0');
  if (timesEl) timesEl.innerHTML = `Drive 最終更新：確認中…<br>このデバイス最終同期：${fmt(localTime)}`;
  modal.classList.remove('hidden');
  // Drive 側の更新日時を取得して表示
  try {
    const file = await _gdriveFindFile();
    const driveTime = file ? new Date(file.modifiedTime).getTime() : 0;
    if (timesEl) {
      const newer = driveTime > localTime ? '（Drive の方が新しい）'
                  : driveTime && driveTime < localTime ? '（このデバイスの方が新しい）' : '';
      timesEl.innerHTML = `Drive 最終更新：${file ? fmt(driveTime) : 'バックアップなし'} <span style="color:var(--primary-light)">${newer}</span><br>このデバイス最終同期：${fmt(localTime)}`;
    }
  } catch {
    if (timesEl) timesEl.innerHTML = `Drive 最終更新：取得失敗<br>このデバイス最終同期：${fmt(localTime)}`;
  }
}

/** 自動チェック：Drive が新しければ通知（自動上書きはしない）／ローカルが長期未保存なら自動バックアップ */
async function gdriveCheckRemote() {
  if (!_gdriveToken) return;
  try {
    const file = await _gdriveFindFile();
    const localTime = parseInt(localStorage.getItem(GDRIVE_SYNCED_KEY) || '0');
    const AUTO_BACKUP_MS = 3 * 86400000; // 3日
    if (!file) {
      // Drive にまだバックアップが無い → 初回バックアップを自動作成
      gdriveUpload(true).catch(() => {});
      return;
    }
    const driveTime = new Date(file.modifiedTime).getTime();
    if (driveTime > localTime) {
      // 他端末などで更新あり → 巻き戻り防止のため自動では取り込まず通知のみ
      showSyncStatus('☁️ Drive に新しいデータがあります（設定 → 🔄 Drive と同期）');
    } else if (localTime && Date.now() - localTime > AUTO_BACKUP_MS) {
      // ローカルが最新だが長期間バックアップしていない → 自動バックアップ
      gdriveUpload(true).catch(() => {});
    }
  } catch(e) {
    console.error('[GDrive check]', e);
  }
}

/** 未接続ユーザー向け：学習データが端末のみに保存されている旨を、たまに案内 */
function checkLocalBackupReminder() {
  if (localStorage.getItem(GDRIVE_CONNECTED_KEY)) return; // 接続済みは対象外
  const REMIND_KEY = 'gas_backup_remind_at';
  const now  = Date.now();
  const last = parseInt(localStorage.getItem(REMIND_KEY) || '0');
  if (last && now - last < 7 * 86400000) return; // 7日に1回まで
  // ある程度学習が貯まっている人にのみ表示（消えると痛い人向け）
  if (Object.keys(state.progress || {}).length < 10) return;
  showSyncStatus('💾 学習データはこの端末にのみ保存中です。設定 → ☁️ Drive 接続でバックアップを推奨');
  localStorage.setItem(REMIND_KEY, now.toString());
}

/** ページリロードなしでアプリ状態を再初期化（Drive同期後に使用） */
async function _reloadAppState() {
  try {
    loadAppSettings();
    loadProgress();
    loadDrillPresets();
    loadHighlights();
    loadEssayNotes();
    state.bookmarks       = loadBookmarks();
    state.choiceBookmarks = loadChoiceBookmarks();
    await loadCalcProblems();
    await loadStoredQuestions();
    migrateHighlightsToOwnerQuestion();   // questions ロード後（実問題idを引ける状態）で再配置
    updateHeaderStats();
    // 出題中・壁打ち中はホームへの強制遷移を行わない（セッションを中断しない）
    const inSession = ['screen-study', 'screen-drill'].some(
      id => !document.getElementById(id)?.classList.contains('hidden')
    );
    if (inSession) {
      showSyncStatus('✅ バックグラウンドでデータを更新しました');
    } else {
      renderHome();
      showSyncStatus('✅ データを反映しました');
    }
  } catch(e) {
    console.error('[GDrive] reloadAppState error', e);
  }
}

// ========== 全データ バックアップ/リストア ==========
const BACKUP_LS_KEYS = [
  'gas_study_progress_v1',
  'gas_bookmarks_v1',
  'gas_choice_bookmarks_v1',
  'gas_study_log_v1',
  'gas_session_records_v1',
  'gas_settings_v1',
  'gas_notes_v1',
  'gas_highlights_v1',
  'gas_drill_presets_v1',
  'gas_calc_problems_v1',
  'gas_questions_v1',
  'gas_pending_verify_v1',
  'gas_tag_readings_v1',
  'gas_external_study_v1',
  'gas_essay_notes_v1',
];

async function exportProgress() {
  const btn = document.getElementById('btn-export');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ 準備中…'; }

  try {
    // LocalStorage 収集
    const lsData = {};
    for (const key of BACKUP_LS_KEYS) {
      const val = localStorage.getItem(key);
      if (val) lsData[key] = JSON.parse(val);
    }

    // IndexedDB 画像を全収集
    const idbImages = {};
    try {
      const db = await _openIDB();
      await new Promise(resolve => {
        const req = db.transaction(IDB_STORE, 'readonly').objectStore(IDB_STORE).openCursor();
        req.onsuccess = e => {
          const cursor = e.target.result;
          if (cursor) { idbImages[cursor.key] = cursor.value; cursor.continue(); }
          else resolve();
        };
        req.onerror = resolve;
      });
    } catch {}

    const payload = {
      version:     2,
      exportedAt:  new Date().toISOString(),
      appVersion:  document.querySelector('script[src*="app.js"]')?.src?.match(/v=(\w+)/)?.[1] || '',
      localStorage: lsData,
      indexedDB:   { images: idbImages },
    };

    const json = JSON.stringify(payload);
    const blob = new Blob([json], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `gas_study_backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '💾 全データをエクスポート'; }
  }
}

async function importProgress(file) {
  const reader = new FileReader();
  reader.onload = async e => {
    try {
      const data = JSON.parse(e.target.result);

      // 旧形式（version 1 以前: progressオブジェクト直接）
      if (!data.version || data.version < 2) {
        const progress = data.progress ?? data;
        if (typeof progress !== 'object') throw new Error('形式不正');
        state.progress = progress;
        saveProgress();
        alert('進捗データをインポートしました（旧形式）。');
        updateHomeStats();
        return;
      }

      // 新形式 version 2
      if (!confirm(
        '現在のすべての学習データをバックアップファイルで上書きしますか？\n\n' +
        '・学習進捗　・カレンダー履歴\n' +
        '・ブックマーク　・ノート・マーカー\n' +
        '・計算問題　・カスタム問題\n\n' +
        'この操作は取り消せません。'
      )) return;

      // LocalStorage を復元
      const ls = data.localStorage || {};
      for (const key of BACKUP_LS_KEYS) {
        if (ls[key] !== undefined) {
          localStorage.setItem(key, JSON.stringify(ls[key]));
        }
      }

      // IndexedDB 画像を復元
      const images = data.indexedDB?.images || {};
      for (const [key, val] of Object.entries(images)) {
        await idbSet(key, val);
      }

      alert('インポート完了！');
      await _reloadAppState();
    } catch(err) {
      alert('ファイルの形式が正しくありません: ' + err.message);
    }
  };
  reader.readAsText(file, 'UTF-8');
}

function resetProgress() {
  if (!confirm('すべての学習進捗をリセットしますか？この操作は取り消せません。')) return;
  state.progress = {};
  saveProgress();
  updateHomeStats();
  alert('進捗をリセットしました。');
}

// ========== Retry Wrong ==========
// 直近の各セッションで間違えた問題を最大5セット保存（ホームからいつでも復習できるように）
const RECENT_WRONG_KEY = 'gas_recent_wrong_v1';
const RECENT_WRONG_MAX = 5;

// 保存形式: [{ ts, mode, label, total, correct, ids:[qId,...] }, ...]（新しい順、最大5件）
function loadRecentWrong() {
  let raw;
  try { raw = JSON.parse(localStorage.getItem(RECENT_WRONG_KEY) || '[]'); }
  catch { return []; }
  if (!Array.isArray(raw)) return [];
  // 旧形式（IDのフラット配列）→ 1セットに変換
  if (raw.length && typeof raw[0] === 'string') {
    return [{ ts: 0, mode: '', label: '', total: null, correct: null, ids: raw }];
  }
  return raw.filter(s => s && Array.isArray(s.ids) && s.ids.length > 0);
}

function saveRecentWrong(meta = {}) {
  const wrong = state.sessionWrongQuestions || [];
  const ids = [...new Set(wrong.map(q => q.id))];
  if (ids.length === 0) return;
  const cats = [...new Set(wrong.map(q => q.category).filter(Boolean))];
  const set = {
    ts:      Date.now(),
    mode:    meta.mode || '',
    label:   cats.length === 1 ? cats[0] : (cats.length === 0 ? '' : '混合'),
    total:   (typeof meta.total   === 'number') ? meta.total   : null,
    correct: (typeof meta.correct === 'number') ? meta.correct : null,
    ids,
  };
  const sets = [set, ...loadRecentWrong()].slice(0, RECENT_WRONG_MAX);
  localStorage.setItem(RECENT_WRONG_KEY, JSON.stringify(sets));
}

function deleteRecentWrongSet(ts) {
  const sets = loadRecentWrong().filter(s => s.ts !== ts);
  localStorage.setItem(RECENT_WRONG_KEY, JSON.stringify(sets));
}

function recentWrongModeBadge(mode) {
  if (mode === 'exam')  return '模試';
  if (mode === 'drill') return '壁打ち';
  return '学習';
}

// 直近の間違いセット一覧モーダルを開く
function openRecentWrongModal() {
  const sets   = loadRecentWrong();
  const modal  = document.getElementById('modal-recent-wrong');
  const listEl = document.getElementById('recent-wrong-list');
  if (!modal || !listEl) return;
  listEl.innerHTML = '';
  if (sets.length === 0) {
    listEl.innerHTML = '<div class="rw-empty">最近間違えた問題はありません。</div>';
  } else {
    // 出題形式トグル（通常 / 壁打ち）
    const fmtRow = document.createElement('div');
    fmtRow.className = 'rw-format-row';
    const fmtLabel = document.createElement('span');
    fmtLabel.className = 'rw-format-label';
    fmtLabel.textContent = '出題形式';
    fmtRow.appendChild(fmtLabel);
    [['normal', '📄 通常'], ['drill', '🥊 壁打ち']].forEach(([f, label]) => {
      const b = document.createElement('button');
      b.className = 'rw-format-btn' + (recentWrongFormat === f ? ' active' : '');
      b.textContent = label;
      b.addEventListener('click', () => {
        recentWrongFormat = f;
        fmtRow.querySelectorAll('.rw-format-btn').forEach(x => x.classList.toggle('active', x === b));
      });
      fmtRow.appendChild(b);
    });
    listEl.appendChild(fmtRow);

    // 全セットを結合した一括復習ボタン
    const allIds = [...new Set(sets.flatMap(s => s.ids))]
      .filter(id => state.questions.some(q => q.id === id));
    if (allIds.length > 0) {
      const allBtn = document.createElement('button');
      allBtn.className = 'rw-all-btn';
      allBtn.textContent = `📚 全問一括で復習（${allIds.length}問）`;
      allBtn.addEventListener('click', startRecentWrongAll);
      listEl.appendChild(allBtn);
    }
    sets.forEach(set => {
      const validCount = set.ids.filter(id => state.questions.some(q => q.id === id)).length;
      const scoreStr = (set.total != null && set.correct != null)
        ? `${set.correct}/${set.total} 正解` : '';
      const row = document.createElement('button');
      row.className = 'rw-set-row' + (validCount === 0 ? ' rw-set-empty' : '');
      row.innerHTML = `
        <div class="rw-set-main">
          <span class="rw-set-badge">${recentWrongModeBadge(set.mode)}</span>
          <span class="rw-set-label">${set.label || '学習セット'}</span>
          <span class="rw-set-count">❌ ${validCount}問</span>
        </div>
        <div class="rw-set-sub">
          <span class="rw-set-date">${set.ts ? fmtTimestamp(set.ts) : '以前の記録'}</span>
          ${scoreStr ? `<span class="rw-set-score">${scoreStr}</span>` : ''}
        </div>`;
      if (validCount === 0) {
        row.disabled = true;
      } else {
        row.addEventListener('click', () => startRecentWrongSet(set.ts));
      }
      listEl.appendChild(row);
    });
  }
  modal.classList.remove('hidden');
}

function closeRecentWrongModal() {
  document.getElementById('modal-recent-wrong')?.classList.add('hidden');
}

// 選択した形式（通常 / 壁打ち）で復習を開始
function _startRecentWrongQuestions(qs) {
  if (recentWrongFormat === 'drill') {
    const queue = [];
    qs.forEach(q => {
      if (isFillBlankQuestion(q) || isCalcQuestion(q)) return;
      (q.choices || []).forEach((c, i) => queue.push({ question: q, choice: c, choiceIndex: i }));
    });
    for (let i = queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [queue[i], queue[j]] = [queue[j], queue[i]];
    }
    if (queue.length === 0) { alert('壁打ちで出題できる選択肢がありません。'); renderHome(); return; }
    startDrillWithQueue(queue, 'recent-wrong');
  } else {
    _startSession('sequential', qs);
  }
}

// セットを選択 → そのセットは履歴から削除し、間違えた問題で学習開始
function startRecentWrongSet(ts) {
  const set = loadRecentWrong().find(s => s.ts === ts);
  deleteRecentWrongSet(ts);
  closeRecentWrongModal();
  const qs = set ? set.ids.map(id => state.questions.find(q => q.id === id)).filter(Boolean) : [];
  if (qs.length === 0) {
    alert('このセットの問題は見つかりませんでした（削除済みの可能性があります）。');
    renderHome();
    return;
  }
  _startRecentWrongQuestions(qs);
}

// 全セットの間違い問題を結合して一括復習（全セットを履歴から削除）
function startRecentWrongAll() {
  const sets  = loadRecentWrong();
  const allIds = [...new Set(sets.flatMap(s => s.ids))];
  const qs = allIds.map(id => state.questions.find(q => q.id === id)).filter(Boolean);
  localStorage.setItem(RECENT_WRONG_KEY, JSON.stringify([])); // 全セットを消費＝削除
  closeRecentWrongModal();
  if (qs.length === 0) {
    alert('復習できる問題がありません。');
    renderHome();
    return;
  }
  _startRecentWrongQuestions(qs);
}

// ブックマークした選択肢の出題アイテム（{question, choice, choiceIndex}）を集める
function bookmarkedChoiceItems() {
  const items = [];
  state.questions.forEach(q => {
    if (isFillBlankQuestion(q) || isCalcQuestion(q)) return;
    (q.choices || []).forEach((c, i) => {
      if (c.id && state.choiceBookmarks.has(c.id)) items.push({ question: q, choice: c, choiceIndex: i });
    });
  });
  return items;
}

// 問題が「問題ブックマーク（①☆）」「選択肢ブックマーク（②☆）」どちらで登録されているか
function questionBookmarkKinds(q) {
  const isQ = state.bookmarks.has(q.id);
  const choiceCount = (q.choices || []).filter(c => c.id && state.choiceBookmarks.has(c.id)).length;
  return { isQ, choiceCount };
}
function questionHasAnyBookmark(q) {
  const { isQ, choiceCount } = questionBookmarkKinds(q);
  return isQ || choiceCount > 0;
}
// 一覧の src 行に「問題／選択肢」ブックマークのラベルを付与
function appendBookmarkBadges(srcEl, q) {
  const { isQ, choiceCount } = questionBookmarkKinds(q);
  if (isQ) {
    const b = document.createElement('span');
    b.className = 'qlist-bm-badge qlist-bm-badge-q';
    b.textContent = '★問題';
    b.title = '問題としてブックマーク（ブックマーク出題「通常出題」で対象）';
    srcEl.appendChild(b);
  }
  if (choiceCount > 0) {
    const b = document.createElement('span');
    b.className = 'qlist-bm-badge qlist-bm-badge-c';
    b.textContent = `☆選択肢${choiceCount}`;
    b.title = '選択肢としてブックマーク（ブックマーク出題「壁打ち」で対象）';
    srcEl.appendChild(b);
  }
}

function retryWrongQuestions() {
  // 出題中に編集された問題も最新内容で出題されるよう、id で現行版に解決する
  const qs = (state.sessionWrongQuestions || [])
    .map(q => state.questions.find(x => x.id === q.id) || q);
  if (qs.length === 0) return;
  _startSession(state.mode, qs);
}

function retryWrongChoices() {
  // 同上：選択肢も現行の問題・選択肢に解決してから出題
  const resolved = (state.sessionWrongChoices || []).map(item => {
    const lq = state.questions.find(x => x.id === item.question.id) || item.question;
    const lc = lq.choices?.[item.choiceIndex] || item.choice;
    return { question: lq, choice: lc, choiceIndex: item.choiceIndex };
  });
  if (resolved.length === 0) return;
  // 計算問題は壁打ち（1選択肢ずつ○✕）に馴染まないため、他の壁打ち導線と同様に除外する
  const queue = resolved.filter(it => !isCalcQuestion(it.question));
  if (queue.length === 0) {
    alert('壁打ちで出題できる選択肢がありません。\n（計算問題は壁打ちの対象外です）');
    return;
  }
  for (let i = queue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [queue[i], queue[j]] = [queue[j], queue[i]];
  }
  startDrillWithQueue(queue);
}

// キーワードにマッチする選択肢を集める。
//  ・スペース（半角/全角）区切りで複数ワード → OR 検索（いずれか含めばヒット）
//  ・検索対象は「年度別」問題のみ（分野別・year無しは除外）。ほぼ同内容の重複出題を防ぐため。
function keywordMatchedChoices(keyword) {
  const words = (keyword || '').trim().toLowerCase().split(/[\s　]+/).filter(Boolean);
  if (words.length === 0) return [];
  const items = [];
  state.questions.forEach(q => {
    if (!isYearlyQuestion(q)) return;   // 年度別のみ
    if (isFillBlankQuestion(q) || isCalcQuestion(q)) return;
    (q.choices || []).forEach((c, i) => {
      const t = (c.text || '').toLowerCase();
      if (words.some(w => t.includes(w))) {                      // OR 検索
        items.push({ question: q, choice: c, choiceIndex: i });
      }
    });
  });
  return items;
}

function _shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// キーワード出題：壁打ち形式（従来どおり1選択肢ずつ即時判定）
function startKeywordDrill(keyword) {
  const items = keywordMatchedChoices(keyword);
  if (items.length === 0) { alert(`「${(keyword||'').trim()}」を含む選択肢がありません（年度別のみ検索）`); return; }
  startDrillWithQueue(_shuffleInPlace(items), 'keyword-search');
}

// キーワード出題：通常形式（ヒット選択肢を5つずつランダムに並べた合成問題で○×入力）
// 大元の問題文は表示しない。最終セットは5未満ならそのまま（4なら4、3なら3…）。
function startKeywordNormal(keyword) {
  const items = keywordMatchedChoices(keyword);
  if (items.length === 0) { alert(`「${(keyword||'').trim()}」を含む選択肢がありません（年度別のみ検索）`); return; }
  const choices = _shuffleInPlace(items.map(it => it.choice));
  const stamp = Date.now();
  const synth = [];
  for (let i = 0; i < choices.length; i += 5) {
    synth.push({
      id: `kwset-${stamp}-${synth.length}`,
      category: '🔍 キーワード出題',
      source: `セット${synth.length + 1}`,
      questionText: '',
      questionBlocks: [],
      tags: [],
      choices: choices.slice(i, i + 5),
    });
  }
  _startSession('sequential', synth, { queue: synth });
}

// キーワード出題の方式（壁打ち／通常）を選ぶポップアップ
function openKeywordModePopup(keyword) {
  const kw = (keyword || '').trim();
  if (!kw) { alert('キーワードを入力してください'); return; }
  const items = keywordMatchedChoices(kw);
  if (items.length === 0) { alert(`「${kw}」を含む選択肢がありません（年度別のみ検索）`); return; }
  const popup = document.getElementById('keyword-mode-popup');
  if (!popup) { startKeywordDrill(kw); return; }
  popup.innerHTML = '';
  const label = document.createElement('div');
  label.className = 'bookmark-popup-label';
  label.textContent = `🔍「${kw}」${items.length}選択肢`;
  popup.appendChild(label);
  const addBtn = (text, onClick) => {
    const btn = document.createElement('button');
    btn.className = 'top-filter-start-mode-btn';
    btn.textContent = text;
    btn.addEventListener('click', ev => { ev.stopPropagation(); popup.classList.add('hidden'); onClick(); });
    popup.appendChild(btn);
  };
  addBtn('🥊 壁打ちで出題', () => startKeywordDrill(kw));
  addBtn('📄 通常出題（5選択肢ずつ）', () => startKeywordNormal(kw));
  popup.classList.remove('hidden');
  setTimeout(() => {
    document.addEventListener('click', function closeKw() {
      popup.classList.add('hidden');
      document.removeEventListener('click', closeKw);
    }, { once: true });
  }, 0);
}

function startDrillWithQueue(queue, mode) {
  flushSessionTime();
  clearAllTempMarkers();
  startSessionTimer();
  state.drillQueue            = queue;
  state.drillIndex            = 0;
  state.drillMode             = mode || 'retry';
  state.drillStats            = { total: 0, correct: 0 };
  state.drillAnswered         = false;
  state.drillAnswers          = {};
  state.sessionWrongChoices   = [];
  state.sessionWrongQuestions = [];
  showScreen('drill');
  renderDrillChoice();
}

function prevDrill() {
  if (state.drillIndex <= 0) return;
  state.drillIndex--;
  renderDrillChoice();  // renderDrillChoice が保存済み回答を復元
}

function skipDrill() {
  const isLast = state.drillIndex >= state.drillQueue.length - 1;
  if (isLast) { endDrillSession(); return; }
  state.drillIndex++;
  state.drillAnswered = false;
  renderDrillChoice();
}

// ========== Interrupted Session ==========
function saveInterruptedSession() {
  const data = {
    queueIds:     state.queue.map(q => q.id),
    queueIndex:   state.queueIndex,
    mode:         state.mode,
    sessionStats: { ...state.sessionStats },
  };
  localStorage.setItem(INTERRUPTED_KEY, JSON.stringify(data));
}

function loadInterruptedSession() {
  try {
    const raw = localStorage.getItem(INTERRUPTED_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function clearInterruptedSession() {
  localStorage.removeItem(INTERRUPTED_KEY);
}

function interruptSession() {
  saveInterruptedSession();
  renderHome();
}

function resumeInterruptedSession() {
  const data = loadInterruptedSession();
  if (!data) { updateResumeButton(); return; }

  const idMap = {};
  state.questions.forEach(q => { idMap[q.id] = q; });
  const queue = (data.queueIds || []).map(id => idMap[id]).filter(Boolean);

  if (queue.length === 0) {
    alert('中断データの問題が見つかりません。\n問題データが削除された可能性があります。');
    clearInterruptedSession();
    updateResumeButton();
    return;
  }

  clearInterruptedSession();
  state.queue        = queue;
  state.queueIndex   = Math.min(data.queueIndex || 0, queue.length - 1);
  state.mode         = data.mode || 'random';
  state.sessionStats = data.sessionStats || { total: 0, correct: 0 };
  state.answers      = {};
  state.checked      = false;
  markerDisplayOn    = false;   // 出題開始時はマーカー表示をリセット

  showScreen('study');
  renderQuestion();
}

function updateResumeButton() {
  const btn  = document.getElementById('btn-resume-session');
  if (!btn) return;
  const data = loadInterruptedSession();
  if (!data) { btn.classList.add('hidden'); return; }
  const labels  = { random: 'ランダム', sequential: '出題順', weak: '苦手優先' };
  const modeStr = labels[data.mode] || data.mode || '';
  const current = (data.queueIndex || 0) + 1;
  const total   = (data.queueIds || []).length;
  btn.textContent = `▶ 中断から再開（${modeStr} ${current}/${total}問目）`;
  btn.classList.remove('hidden');
}

// ========== 検証待ちキュー ==========
function loadPendingVerify() {
  try { return JSON.parse(localStorage.getItem(PENDING_VERIFY_KEY) || '[]'); }
  catch { return []; }
}
function savePendingVerify(list) {
  localStorage.setItem(PENDING_VERIFY_KEY, JSON.stringify(list));
}
function addToPendingVerify(q) {
  const list = loadPendingVerify();
  if (list.some(item => item.qId === q.id)) return false; // 重複スキップ
  list.unshift({ qId: q.id, reportedAt: new Date().toISOString() });
  savePendingVerify(list);
  return true;
}
function removeFromPendingVerify(qId) {
  savePendingVerify(loadPendingVerify().filter(item => item.qId !== qId));
}

function renderPendingVerify() {
  const list    = loadPendingVerify();
  const card    = document.getElementById('pending-verify-card');
  const listEl  = document.getElementById('pending-verify-list');
  if (!card || !listEl) return;

  // 問題が1件もなければカードごと非表示
  const items = list.map(item => ({
    item,
    q: state.questions.find(q => q.id === item.qId),
  })).filter(({ q }) => q); // 削除済み問題は除外

  // データと実態を同期
  if (items.length !== list.length) {
    savePendingVerify(items.map(({ item }) => item));
  }

  card.classList.toggle('hidden', items.length === 0);
  listEl.innerHTML = '';

  items.forEach(({ item, q }) => {
    const row = document.createElement('div');
    row.className = 'pending-verify-row';

    const info = document.createElement('div');
    info.className = 'pending-verify-info';

    const label = document.createElement('span');
    label.className = 'pending-verify-label';
    label.textContent = [q.category, q.year, getQLabel(q)].filter(Boolean).join('　／　');

    const date = document.createElement('span');
    date.className = 'pending-verify-date';
    date.textContent = new Date(item.reportedAt).toLocaleDateString('ja-JP');

    info.append(label, date);

    const btns = document.createElement('div');
    btns.style.cssText = 'display:flex;gap:6px;flex-shrink:0;';

    const verifyBtn = document.createElement('button');
    verifyBtn.className = 'btn btn-outline btn-sm';
    verifyBtn.textContent = '📋 AI検証プロンプト';
    verifyBtn.addEventListener('click', () => {
      openVerifyOnClaude(q);
    });

    const delBtn = document.createElement('button');
    delBtn.className = 'btn btn-ghost btn-sm';
    delBtn.textContent = '✕';
    delBtn.title = '削除';
    delBtn.addEventListener('click', () => {
      removeFromPendingVerify(item.qId);
      renderPendingVerify();
    });

    btns.append(verifyBtn, delBtn);
    row.append(info, btns);
    listEl.appendChild(row);
  });
}

// ========== AI検証 (Method B) ==========
// focusChoice: ドリルモード時に注目している選択肢オブジェクト（省略時は全選択肢を検証）
function openVerifyOnClaude(q, focusChoice) {
  if (!q) return;
  const labels = ['a', 'b', 'c', 'd', 'e'];

  const choiceLines = (q.choices || []).map((c, i) => {
    const mark = c.isCorrect ? '○ 正しい' : '✕ 誤り';
    const focus = focusChoice && c === focusChoice ? '  ← ★検証対象' : '';
    return `${labels[i] || (i + 1)}. ${c.text}  →  ${mark}${focus}`;
  });

  let lines;
  if (focusChoice) {
    // ドリルモード: 対象選択肢のみ検証
    const ci = (q.choices || []).indexOf(focusChoice);
    const cLabel = (CHOICE_LABELS[ci] || String(ci + 1)) + '.';
    const mark = focusChoice.isCorrect ? '○ 正しい' : '✕ 誤り';
    lines = [
      'ガス主任技術者試験の問題の選択肢について、正誤判定が正しいか根拠を示して検証してください。',
      '',
      '【問題文（参考）】',
      q.body || '（問題文なし）',
      '',
      '【検証対象の選択肢】',
      `${cLabel} ${focusChoice.text}  →  現在の設定: ${mark}`,
      '',
      `【出典】${[q.year, q.source].filter(Boolean).join('　')}`,
      '',
      '法令・ガス技術の観点から、この選択肢の正誤判定が正確かどうか確認してください。',
      '',
      '---',
      '【出力形式】',
      '1. この選択肢の正誤判定が正しいかどうかを根拠とともに説明してください。',
      '2. 判定に誤りや補足が必要な場合は、問題編集画面の「解説」欄にそのまま貼り付けられる',
      '   解説文を以下の形式で作成してください：',
      '',
      '【貼り付け用解説文】',
      '（この選択肢の正誤と根拠を1〜3文で記述）',
    ];
  } else {
    // 通常出題モード: 全選択肢を検証
    lines = [
      'ガス主任技術者試験の問題について、各選択肢の正誤判定が正しいか根拠を示して検証してください。',
      '',
      '【問題文】',
      q.body || '（問題文なし）',
      '',
      '【選択肢と正解設定】',
      ...choiceLines,
      '',
      `【出典】${[q.year, q.source].filter(Boolean).join('　')}`,
      '',
      '法令・ガス技術の観点から正誤判定を確認してください。',
      '',
      '---',
      '【出力形式】',
      '1. 各選択肢について、判定が正しいか・誤りかを根拠とともに説明してください。',
      '2. 判定に誤りや補足が必要な場合は、問題編集画面の「解説」欄にそのまま貼り付けられる形式で、',
      '   以下のように解説文を作成してください：',
      '',
      '【貼り付け用解説文】',
      '（選択肢ごとの正誤と根拠を簡潔にまとめた解説文を記載）',
    ];
  }
  const prompt = lines.join('\n');

  const copyPromise = navigator.clipboard
    ? navigator.clipboard.writeText(prompt)
    : Promise.reject();

  copyPromise.catch(() => {
    const ta = document.createElement('textarea');
    ta.value = prompt;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }).finally(() => {
    ['btn-verify-ai', 'btn-verify-ai-drill'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn && !btn.closest('.hidden')) {
        const orig = btn.textContent;
        btn.textContent = '✅ 検証プロンプトをコピーしました';
        setTimeout(() => { btn.textContent = orig; }, 3000);
      }
    });
  });
}

// ========== AI 解説 ==========
function openExplainOnClaude(q, c, isRight, userAnswer) {
  const ci      = (q.choices || []).indexOf(c);
  const label   = CHOICE_LABELS_JP[ci] !== undefined ? CHOICE_LABELS_JP[ci] : String(ci + 1);
  const correct = c.isCorrect ? '正しい' : '誤り';
  const myAns   = userAnswer === 'maru' ? '○（正しい）' : '×（誤り）';
  const verdict = isRight ? '正解' : '不正解';

  const lines = [
    'ガス主任技術者試験の問題の選択肢について、詳しく解説してください。',
    '',
    '【問題文】',
    q.questionText || q.body || '（問題文なし）',
    '',
    `【選択肢 ${label}】`,
    c.text || '',
    '',
    `【正誤】この選択肢は「${correct}」`,
    `【私の回答】${myAns}（${verdict}）`,
    '',
    `【出典】${[q.category, q.year, q.source].filter(Boolean).join('　')}`,
    '',
    `この選択肢がなぜ「${correct}」なのか、ガス主任技術者試験の観点から根拠を示して詳しく解説してください。`,
    '関連する法令・規格・技術的根拠があれば合わせて説明してください。',
  ];
  const prompt = lines.join('\n');

  const copyPromise = navigator.clipboard
    ? navigator.clipboard.writeText(prompt)
    : Promise.reject();

  copyPromise.catch(() => {
    const ta = document.createElement('textarea');
    ta.value = prompt;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  });
}

// ========== Study Mode Navigation ==========

// 指定インデックスへ移動し、答え合わせ済みの場合は結果表示を復元する
function _navigateToIndex(newIndex) {
  state.queueIndex = newIndex;
  if (state.queueIndex >= state.queue.length) {
    showSessionResult();
    return;
  }
  markerDisplayOn = false;   // 問題移動時はマーカー表示をリセット
  const q = state.queue[state.queueIndex];
  const histEntry = state.sessionHistory.find(h => h.question.id === q.id);
  renderQuestion(); // state.answers / state.checked をリセットして描画
  if (histEntry) {
    if (histEntry.isCalcMode || histEntry.isOnePickMode) {
      state.answers.__calc__ = histEntry.choiceResults[0]?.selectedId;
    } else {
      (histEntry.choiceResults || []).forEach(cr => {
        if (cr.choice) state.answers[cr.choice.id] = cr.userAnswer;
      });
    }
    _checkNoRecord = true;
    try { checkAnswers(); } finally { _checkNoRecord = false; }
  }
}

function prevStudyQuestion() {
  if (state.queueIndex <= 0) return;
  _navigateToIndex(state.queueIndex - 1);
}

// ========== View / Edit Modal Navigation ==========
function updateModalNavUI() {
  const pos = modalNavIndex + 1;
  const total = qlistNavQueue.length;
  const hasPrev = modalNavIndex > 0;
  const hasNext = modalNavIndex < total - 1;
  ['view', 'edit'].forEach(mode => {
    const posEl  = document.getElementById(`modal-${mode}-nav-pos`);
    const prevEl = document.getElementById(`modal-${mode}-prev`);
    const nextEl = document.getElementById(`modal-${mode}-next`);
    if (posEl)  posEl.textContent = `${pos} / ${total}`;
    if (prevEl) prevEl.disabled = !hasPrev;
    if (nextEl) nextEl.disabled = !hasNext;
  });
}

function navigateModal(direction) {
  const newIndex = modalNavIndex + direction;
  if (newIndex < 0 || newIndex >= qlistNavQueue.length) return;
  const editModal = document.getElementById('modal-edit-q');
  const inEdit = !editModal.classList.contains('hidden');
  if (inEdit) saveEditSilent();
  modalNavIndex = newIndex;
  const qId = qlistNavQueue[modalNavIndex];
  if (inEdit) openEditModal(qId, null, true);
  else        openViewModal(qId);
}

function saveEditSilent() {
  if (!editingQId) return;
  const idx = state.questions.findIndex(q => q.id === editingQId);
  if (idx === -1) return;
  const q = { ...state.questions[idx] };
  if (editingChoiceIndex === null) {
    q.year         = document.getElementById('edit-year').value.trim();
    q.category     = document.getElementById('edit-category').value.trim() || q.category;
    q.subcategory  = document.getElementById('edit-subcategory').value.trim();
    q.section      = document.getElementById('edit-section').value.trim();
    q.source       = document.getElementById('edit-source').value.trim() || q.source;
    q.tags         = [...editingTags];
    syncEditBlocksFromDOM();
    const blocks = editingBlocks.filter(b =>
      (b.type === 'text' && b.content?.trim()) || (b.type === 'image' && b.src)
    ).map(b => b.type === 'text' ? { ...b, content: b.content.trim() } : { ...b });
    q.questionBlocks = blocks.length > 0 ? blocks : undefined;
    const firstText = blocks.find(b => b.type === 'text');
    q.questionText = firstText ? firstText.content : (q.questionText || '');
    delete q.image;
    // 問題タイプ（計算問題 / 1択選択モード）
    const calcCheckS   = document.getElementById('edit-calc-mode-check');
    const singleCheckS = document.getElementById('edit-single-select-check');
    if (calcCheckS && calcCheckS.checked) {
      q.questionType = 'calculation';
    } else if (singleCheckS && singleCheckS.checked) {
      q.questionType = 'single_select';
    } else {
      delete q.questionType;
    }
    // 設問タイプ（1択問題の極性）：auto は自動判定に任せるので保存しない
    {
      const polV = document.getElementById('edit-single-polarity')?.value;
      if (singleCheckS && singleCheckS.checked && (polV === 'correct' || polV === 'incorrect')) {
        q.answerPolarity = polV;
      } else {
        delete q.answerPolarity;
      }
    }
    // 解説画像
    if (editingExplanationImage) {
      q.explanationImage = editingExplanationImage;
    } else {
      delete q.explanationImage;
    }
  }
  const cards = document.querySelectorAll('#edit-choices-container .edit-choice-card');
  q.choices = [...(q.choices || [])];
  if (editingChoiceIndex !== null) {
    const card = cards[0];
    if (card && q.choices[editingChoiceIndex]) {
      q.choices[editingChoiceIndex] = {
        ...q.choices[editingChoiceIndex],
        text:        card.querySelector('.edit-choice-text-input')?.value.trim() ?? q.choices[editingChoiceIndex].text,
        isCorrect:   card.querySelector('.edit-maru')?.classList.contains('selected') ?? q.choices[editingChoiceIndex].isCorrect,
        explanation: card.querySelector('.edit-choice-exp-input')?.value.trim() ?? q.choices[editingChoiceIndex].explanation,
      };
      // 貼り付けたばかりの解説画像が ←→ 移動で消えないように反映する
      _applyEditedExpImage(q.choices[editingChoiceIndex], q.choices[editingChoiceIndex].id);
    }
  } else {
    cards.forEach((card, i) => {
      if (!q.choices[i]) return;
      q.choices[i] = {
        ...q.choices[i],
        text:        card.querySelector('.edit-choice-text-input')?.value.trim() ?? q.choices[i].text,
        isCorrect:   card.querySelector('.edit-maru')?.classList.contains('selected') ?? q.choices[i].isCorrect,
        explanation: card.querySelector('.edit-choice-exp-input')?.value.trim() ?? q.choices[i].explanation,
      };
      // 貼り付けたばかりの解説画像が ←→ 移動で消えないように反映する
      _applyEditedExpImage(q.choices[i], q.choices[i].id);
    });
  }
  state.questions[idx] = q;
  saveQuestions();
}

function openViewModal(qId) {
  const q = state.questions.find(q => q.id === qId);
  if (!q) return;
  const navIdx = qlistNavQueue.indexOf(qId);
  if (navIdx !== -1) modalNavIndex = navIdx;

  document.getElementById('modal-view-title').textContent =
    `📖 ${getQLabel(q)}${q.year ? '（' + q.year + '）' : ''}`;

  const body = document.getElementById('modal-view-body');
  body.innerHTML = '';

  const metaEl = document.createElement('div');
  metaEl.className = 'view-q-meta';
  metaEl.textContent = [q.category, q.section, q.source].filter(Boolean).join('　／　');
  body.appendChild(metaEl);

  // 問題文・図（ブロック形式 or 旧形式）
  const qBlocks = getQuestionBlocks(q);
  if (qBlocks.length > 0) {
    renderBlocksToEl(qBlocks, body);
  }

  const calcMode = isCalcQuestion(q);
  (q.choices || []).forEach((c, i) => {
    const choiceEl = document.createElement('div');
    choiceEl.className = `view-choice ${c.isCorrect ? 'view-choice-correct' : 'view-choice-wrong'}`;
    const hdr = document.createElement('div');
    hdr.className = 'view-choice-header';
    const badge = document.createElement('span');
    badge.className = 'view-choice-badge';
    badge.textContent = (CHOICE_LABELS[i] || String(i + 1)) + '.';
    if (calcMode) {
      // 計算問題は正解選択肢のみマーク表示
      if (c.isCorrect) {
        const mark = document.createElement('span');
        mark.className = 'view-choice-mark maru';
        mark.textContent = '正解';
        hdr.append(badge, mark);
      } else {
        hdr.appendChild(badge);
      }
    } else {
      const mark = document.createElement('span');
      mark.className = `view-choice-mark ${c.isCorrect ? 'maru' : 'batsu'}`;
      mark.textContent = c.isCorrect ? '○' : '✕';
      hdr.append(badge, mark);
    }
    const textEl = document.createElement('div');
    textEl.className = 'view-choice-text';
    textEl.textContent = c.text;
    choiceEl.append(hdr, textEl);
    if (c.explanation) {
      const expEl = document.createElement('div');
      expEl.className = 'view-choice-exp';
      expEl.textContent = c.explanation;
      choiceEl.appendChild(expEl);
    }
    const expImg = makeChoiceExpImage(c);
    if (expImg) choiceEl.appendChild(expImg);
    body.appendChild(choiceEl);
  });

  // 解説画像（ある場合のみトグルボタン）
  if (q.explanationImage) {
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'btn btn-ghost btn-sm explanation-image-toggle-btn';
    toggleBtn.style.cssText = 'margin-top:10px;width:100%;';
    toggleBtn.textContent = '🖼 解説画像を表示';
    const imgWrap = document.createElement('div');
    imgWrap.className = 'explanation-image-wrap hidden';
    const img = document.createElement('img');
    img.src = q.explanationImage;
    img.className = 'explanation-image';
    img.alt = '解説図';
    img.loading = 'lazy';
    imgWrap.appendChild(img);
    toggleBtn.addEventListener('click', () => {
      const isHidden = imgWrap.classList.toggle('hidden');
      toggleBtn.textContent = isHidden ? '🖼 解説画像を表示' : '🖼 解説画像を閉じる';
    });
    body.append(toggleBtn, imgWrap);
  }

  const navBar = document.getElementById('modal-view-nav-bar');
  if (navBar) navBar.classList.toggle('hidden', qlistNavQueue.length <= 1);
  updateModalNavUI();
  document.getElementById('modal-view-q').classList.remove('hidden');
}

// ========== Tag Edit UI ==========
function renderEditTagSection() {
  const currentTagsEl  = document.getElementById('edit-current-tags');
  const suggestEl      = document.getElementById('edit-tag-suggestions');
  if (!currentTagsEl) return;

  // 現在のタグをチップで表示（×ボタン付き）
  currentTagsEl.innerHTML = '';
  editingTags.forEach((tag, i) => {
    const chip = document.createElement('span');
    chip.className = 'edit-tag-chip';
    const label = document.createTextNode('#' + tag + ' ');
    const rm = document.createElement('button');
    rm.type = 'button';
    rm.className = 'edit-tag-remove';
    rm.textContent = '✕';
    rm.addEventListener('click', () => {
      editingTags.splice(i, 1);
      renderEditTagSection();
    });
    chip.append(label, rm);
    currentTagsEl.appendChild(chip);
  });

  // 既存タグをサジェストボタンで表示
  if (suggestEl) {
    suggestEl.innerHTML = '';
    const all = getAllTags();
    if (all.length === 0) {
      suggestEl.innerHTML = '<span style="font-size:.78rem;color:var(--text-3);">（まだタグがありません）</span>';
    } else {
      all.forEach(tag => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'edit-tag-suggest-btn' + (editingTags.includes(tag) ? ' active' : '');
        btn.textContent = '#' + tag;
        btn.addEventListener('click', () => {
          if (!editingTags.includes(tag)) {
            editingTags.push(tag);
            renderEditTagSection();
          }
        });
        suggestEl.appendChild(btn);
      });
    }
  }
}

// ========== Edit Modal ブロックエディタ ==========

// 問題のブロック配列を取得（旧形式との互換）
function getQuestionBlocks(q) {
  if (q.questionBlocks && q.questionBlocks.length > 0) return q.questionBlocks;
  const blocks = [];
  if (q.questionText) blocks.push({ type: 'text', content: q.questionText });
  if (q.image)        blocks.push({ type: 'image', src: q.image });
  return blocks;
}

// ブロック配列を DOM要素に描画（学習画面・閲覧モーダル共用）
function renderBlocksToEl(blocks, el) {
  el.innerHTML = '';
  blocks.forEach(block => {
    if (block.type === 'text' && block.content) {
      const div = document.createElement('div');
      div.className = 'question-text';
      div.innerHTML = renderText(block.content);
      el.appendChild(div);
    } else if (block.type === 'image' && block.src) {
      const wrap = document.createElement('div');
      wrap.className = 'question-image-area';
      const img = document.createElement('img');
      img.src = block.src;
      img.alt = '問題図';
      img.className = 'question-image';
      img.loading = 'lazy';
      wrap.appendChild(img);
      el.appendChild(wrap);
    }
  });
}

// ファイルを読んでブロックに追加
function loadImageFileToBlock(file) {
  if (!file || !file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = e => {
    editingBlocks.push({ type: 'image', src: e.target.result });
    renderEditBlocks();
  };
  reader.readAsDataURL(file);
}

function loadImageFileToExpImage(file) {
  if (!file || !file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = e => {
    editingExplanationImage = e.target.result;
    renderEditExpImageSection();
  };
  reader.readAsDataURL(file);
}

function renderEditExpImageSection() {
  const preview = document.getElementById('edit-exp-image-preview');
  const clearBtn = document.getElementById('btn-exp-img-clear');
  if (!preview) return;
  preview.innerHTML = '';
  if (editingExplanationImage) {
    const img = document.createElement('img');
    img.src = editingExplanationImage;
    img.className = 'edit-exp-image-thumb';
    img.alt = '解説図プレビュー';
    preview.appendChild(img);
    if (clearBtn) clearBtn.classList.remove('hidden');
  } else {
    if (clearBtn) clearBtn.classList.add('hidden');
  }
}

// DOMのテキストエリア値を editingBlocks に同期（保存前に呼ぶ）
function syncEditBlocksFromDOM() {
  // data-block-idx 属性を使ってテキストエリアをブロックに直接マッピング
  const textareas = document.querySelectorAll('#edit-blocks-container .edit-block-textarea[data-block-idx]');
  textareas.forEach(ta => {
    const idx = parseInt(ta.dataset.blockIdx, 10);
    if (!isNaN(idx) && editingBlocks[idx] && editingBlocks[idx].type === 'text') {
      editingBlocks[idx].content = ta.value;
    }
  });
}

// テキストエリア用リッチテキストツールバーを生成
function _makeRichToolbar() {
  const bar = document.createElement('div');
  bar.className = 'rich-toolbar';
  const redBtn = document.createElement('button');
  redBtn.type = 'button';
  redBtn.className = 'rtb-btn rtb-red';
  redBtn.title = '選択範囲を赤文字にする（[r]...[/r]）';
  redBtn.innerHTML = '<span style="color:#ef4444;font-weight:700;">A</span> 赤文字';
  bar.appendChild(redBtn);
  return bar;
}

// ブロックエディタを描画
function renderEditBlocks() {
  const container = document.getElementById('edit-blocks-container');
  if (!container) return;
  container.innerHTML = '';

  editingBlocks.forEach((block, idx) => {
    const wrap = document.createElement('div');
    wrap.className = 'edit-block';

    const header = document.createElement('div');
    header.className = 'edit-block-header';

    const typeLabel = document.createElement('span');
    typeLabel.textContent = block.type === 'text' ? '📝 テキスト' : '🖼 画像';

    const actions = document.createElement('div');
    actions.style.cssText = 'display:flex;gap:4px;';

    // 上へ
    if (idx > 0) {
      const upBtn = document.createElement('button');
      upBtn.type = 'button';
      upBtn.className = 'edit-block-move-btn';
      upBtn.textContent = '↑';
      upBtn.title = '上へ移動';
      upBtn.addEventListener('click', () => {
        [editingBlocks[idx - 1], editingBlocks[idx]] = [editingBlocks[idx], editingBlocks[idx - 1]];
        renderEditBlocks();
      });
      actions.appendChild(upBtn);
    }

    // 下へ
    if (idx < editingBlocks.length - 1) {
      const downBtn = document.createElement('button');
      downBtn.type = 'button';
      downBtn.className = 'edit-block-move-btn';
      downBtn.textContent = '↓';
      downBtn.title = '下へ移動';
      downBtn.addEventListener('click', () => {
        [editingBlocks[idx], editingBlocks[idx + 1]] = [editingBlocks[idx + 1], editingBlocks[idx]];
        renderEditBlocks();
      });
      actions.appendChild(downBtn);
    }

    // 削除
    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'edit-block-del-btn';
    delBtn.textContent = '✕';
    delBtn.title = '削除';
    delBtn.addEventListener('click', () => {
      editingBlocks.splice(idx, 1);
      renderEditBlocks();
    });
    actions.appendChild(delBtn);

    header.append(typeLabel, actions);
    wrap.appendChild(header);

    const body = document.createElement('div');
    body.className = 'edit-block-body';

    if (block.type === 'text') {
      const toolbar = _makeRichToolbar();
      const ta = document.createElement('textarea');
      ta.className = 'edit-input edit-block-textarea';
      ta.rows = 3;
      ta.placeholder = '問題文を入力...（[r]赤文字[/r] で強調）';
      ta.value = block.content || '';
      ta.dataset.blockIdx = String(idx);
      ta.addEventListener('input', () => { editingBlocks[idx].content = ta.value; });
      toolbar.querySelector('.rtb-red').addEventListener('click', () => insertMarkup(ta, '[r]', '[/r]'));
      body.appendChild(toolbar);
      body.appendChild(ta);
    } else if (block.type === 'image') {
      const img = document.createElement('img');
      img.className = 'edit-block-image';
      img.src = block.src;
      img.alt = '問題図';
      body.appendChild(img);
    }

    wrap.appendChild(body);
    container.appendChild(wrap);
  });
}

/**
 * 選択肢の解説に添付された画像の表示要素を作る（無ければ null）。
 * 注意: 必ず .choice-explanation の「兄弟」として差し込むこと。
 * 中に入れるとマーカー（赤太文字）の文字オフセット計算が狂う。
 */
function makeChoiceExpImage(c) {
  if (!c?.explanationImage) return null;
  const wrap = document.createElement('div');
  wrap.className = 'choice-exp-img-wrap';
  if (c.explanationImageWidth) wrap.style.width = c.explanationImageWidth + 'px';
  const img = document.createElement('img');
  img.src = c.explanationImage;
  img.className = 'choice-exp-image';
  img.alt = '解説図';
  img.loading = 'lazy';
  wrap.appendChild(img);
  return wrap;
}

// 振り返り（選択肢詳細モーダル）の解説画像を差し替える
function _setCdmExpImage(c) {
  const area = document.getElementById('cdm-exp-img');
  if (!area) return;
  area.innerHTML = '';
  const el = makeChoiceExpImage(c);
  if (el) area.appendChild(el);
}

/**
 * 問題全体の解説画像（`q.explanationImage`）をトグルボタン付きで領域に描画する。
 * 学習（`#explanation-image-area`）と壁打ち（`#drill-explanation-image-area`）で共用。
 * ⚠️ 選択肢ごとの `c.explanationImage`（常時表示）とは別物。
 */
function renderQuestionExplanationImage(areaEl, q) {
  if (!areaEl) return;
  areaEl.innerHTML = '';
  if (!q?.explanationImage) { areaEl.classList.add('hidden'); return; }
  areaEl.classList.remove('hidden');
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'btn btn-ghost btn-sm explanation-image-toggle-btn';
  toggleBtn.textContent = '🖼 解説画像を表示';
  const imgWrap = document.createElement('div');
  imgWrap.className = 'explanation-image-wrap hidden';
  const img = document.createElement('img');
  img.src = q.explanationImage;
  img.className = 'explanation-image';
  img.alt = '解説図';
  img.loading = 'lazy';
  imgWrap.appendChild(img);
  toggleBtn.addEventListener('click', () => {
    const isHidden = imgWrap.classList.toggle('hidden');
    toggleBtn.textContent = isHidden ? '🖼 解説画像を表示' : '🖼 解説画像を閉じる';
  });
  areaEl.append(toggleBtn, imgWrap);
}

// 壁打ち画面の解説画像を現在の選択肢に合わせて更新する
function _setDrillExpImage(c) {
  const wrap = document.getElementById('drill-exp-img-wrap');
  const img  = document.getElementById('drill-exp-image');
  if (!wrap || !img) return;
  if (c?.explanationImage) {
    img.src = c.explanationImage;
    wrap.style.width = c.explanationImageWidth ? c.explanationImageWidth + 'px' : '';
    wrap.classList.remove('hidden');
  } else {
    img.removeAttribute('src');
    wrap.style.width = '';
    wrap.classList.add('hidden');
  }
}

// 編集モーダルの解説画像（選択肢ごと）を保存対象の選択肢オブジェクトへ反映する
function _applyEditedExpImage(choice, cid) {
  if (editingChoiceExpImages[cid]) {
    choice.explanationImage = editingChoiceExpImages[cid];
  } else {
    delete choice.explanationImage;
  }
  if (editingChoiceExpWidths[cid] != null) {
    choice.explanationImageWidth = editingChoiceExpWidths[cid];
  } else {
    delete choice.explanationImageWidth;
  }
}

// 編集モーダルの「クリック→Ctrl+V」画像貼り付けゾーンを作る
function _makeImgPasteZone(cid, kind) {
  const zone = document.createElement('div');
  zone.className = 'edit-choice-img-paste-zone';
  zone.tabIndex = 0;
  zone.textContent = kind === 'exp'
    ? '📋 解説に画像を貼り付け（クリック → Ctrl+V）'
    : '📋 ここをクリック → Ctrl+V で画像を貼り付け';
  zone.addEventListener('click', () => {
    _editChoiceImgFocus = { cid, kind };
    document.querySelectorAll('.edit-choice-img-paste-zone').forEach(z => z.classList.remove('focused'));
    zone.classList.add('focused');
    zone.focus();
  });
  return zone;
}

// kind='choice' … 選択肢本文に付ける画像 / kind='exp' … その選択肢の解説に付ける画像
function _renderChoiceImgPreview(area, cid, kind = 'choice') {
  const imgStore   = kind === 'exp' ? editingChoiceExpImages : editingChoiceImages;
  const widthStore = kind === 'exp' ? editingChoiceExpWidths : editingChoiceWidths;
  const old = area.querySelector('.edit-choice-img-preview');
  if (old) old.remove();
  const src = imgStore[cid];
  if (!src) return;
  const wrap = document.createElement('div');
  wrap.className = 'edit-choice-img-preview';
  const img = document.createElement('img');
  img.src = src;
  img.className = 'edit-choice-img-thumb';
  img.alt = kind === 'exp' ? '解説画像' : '選択肢画像';
  const delBtn = document.createElement('button');
  delBtn.type = 'button';
  delBtn.className = 'edit-choice-img-del';
  delBtn.textContent = '🗑 削除';
  delBtn.addEventListener('click', () => {
    delete imgStore[cid];
    delete widthStore[cid];
    wrap.remove();
  });
  const widthWrap = document.createElement('div');
  widthWrap.className = 'edit-choice-img-width-wrap';
  const widthLabel = document.createElement('label');
  widthLabel.textContent = '表示幅(px):';
  widthLabel.className = 'edit-choice-img-width-label';
  const widthInput = document.createElement('input');
  widthInput.type = 'number';
  widthInput.className = 'edit-choice-img-width-input';
  widthInput.min = '50';
  widthInput.max = '800';
  widthInput.placeholder = '自動';
  const curW = widthStore[cid];
  if (curW) widthInput.value = curW;
  widthInput.addEventListener('input', () => {
    const v = parseInt(widthInput.value, 10);
    widthStore[cid] = isNaN(v) ? null : v;
  });
  widthWrap.append(widthLabel, widthInput);
  wrap.append(img, widthWrap, delBtn);
  area.appendChild(wrap);
}

function _addResizeHandle(handle, imgEl, getChoiceId) {
  let startX, startW;
  const getWrap = () => imgEl.closest('.choice-img-resizable') || imgEl.parentElement;

  handle.addEventListener('mousedown', e => {
    e.preventDefault();
    startX = e.clientX;
    startW = getWrap().offsetWidth;
    const onMove = ev => {
      const w = Math.max(50, startW + ev.clientX - startX);
      getWrap().style.width = w + 'px';
    };
    const onUp = ev => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      const w = Math.max(50, startW + ev.clientX - startX);
      getWrap().style.width = w + 'px';
      const cid = getChoiceId();
      if (cid) _saveChoiceImageWidth(cid, w);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });

  handle.addEventListener('touchstart', e => {
    e.preventDefault();
    startX = e.touches[0].clientX;
    startW = getWrap().offsetWidth;
    const onMove = ev => {
      const w = Math.max(50, startW + ev.touches[0].clientX - startX);
      getWrap().style.width = w + 'px';
    };
    const onEnd = ev => {
      handle.removeEventListener('touchmove', onMove);
      handle.removeEventListener('touchend', onEnd);
      const w = Math.max(50, startW + ev.changedTouches[0].clientX - startX);
      getWrap().style.width = w + 'px';
      const cid = getChoiceId();
      if (cid) _saveChoiceImageWidth(cid, w);
    };
    handle.addEventListener('touchmove', onMove, { passive: false });
    handle.addEventListener('touchend', onEnd);
  }, { passive: false });
}

function _saveChoiceImageWidth(choiceId, width) {
  for (const q of state.questions) {
    const c = (q.choices || []).find(ch => ch.id === choiceId);
    if (c) {
      c.imageWidth = Math.round(width);
      saveQuestions(true); // 幅のみの変更なので画像のIDB再書き込みは省略
      return;
    }
  }
}

function handleEditImagePaste(e) {
  const modal = document.getElementById('modal-edit-q');
  if (!modal || modal.classList.contains('hidden')) return;
  if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
  const items = e.clipboardData?.items;
  if (!items) return;
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      e.preventDefault();
      // 選択肢／解説の画像ゾーンがフォーカスされている場合はそちらに貼り付け
      if (_editChoiceImgFocus) {
        const { cid, kind } = _editChoiceImgFocus;
        const reader = new FileReader();
        reader.onload = ev => {
          (kind === 'exp' ? editingChoiceExpImages : editingChoiceImages)[cid] = ev.target.result;
          const sel = kind === 'exp' ? '.edit-choice-exp-img-area' : '.edit-choice-img-area';
          const area = document.querySelector(`${sel}[data-cid="${cid}"]`);
          if (area) _renderChoiceImgPreview(area, cid, kind);
        };
        reader.readAsDataURL(item.getAsFile());
        break;
      }
      // 解説画像セクション内からのペーストなら解説画像として扱う
      const expSection = document.getElementById('edit-exp-image-section');
      if (expSection && expSection.contains(e.target)) {
        loadImageFileToExpImage(item.getAsFile());
      } else {
        loadImageFileToBlock(item.getAsFile());
      }
      break;
    }
  }
}

// 編集モーダルの「設問タイプ」行の表示/ヒントを現在の状態に合わせて更新
function updateEditPolarityRow() {
  const row    = document.getElementById('edit-single-polarity-row');
  const single = document.getElementById('edit-single-select-check');
  const sel    = document.getElementById('edit-single-polarity');
  const hint   = document.getElementById('edit-single-polarity-hint');
  if (!row || !single || !sel) return;
  // 1択選択問題のときだけ表示
  row.style.display = single.checked ? '' : 'none';
  if (!single.checked) return;
  if (hint) {
    if (sel.value === 'auto') {
      const qText = document.querySelector('#edit-blocks-container .edit-block-textarea')?.value
                 || (state.questions.find(q => q.id === editingQId)?.questionText) || '';
      const detected = detectPolarityFromText(qText);
      hint.textContent = `自動判定の結果：「${detected === 'incorrect' ? '誤っているものを選ぶ' : '正しいものを選ぶ'}」設問`;
    } else {
      hint.textContent = '';
    }
  }
}

// ========== Edit Modal ==========
function openEditModal(qId, choiceIndex, fromList) {
  const q = state.questions.find(q => q.id === qId);
  if (!q) return;
  editingQId         = qId;
  editingChoiceIndex = (choiceIndex !== undefined && choiceIndex !== null) ? choiceIndex : null;

  const singleMode = editingChoiceIndex !== null;
  const label = CHOICE_LABELS[editingChoiceIndex] || String((editingChoiceIndex || 0) + 1);

  document.getElementById('modal-edit-title').textContent = singleMode
    ? `✏️ 選択肢 ${label} を編集 — ${getQLabel(q)}`
    : `✏️ 問題を編集 — ${getQLabel(q)}`;

  // メタフィールドとヘッダーはシングルモード時に隠す
  document.querySelector('#modal-edit-q .edit-meta-grid').style.display  = singleMode ? 'none' : '';
  document.querySelector('#modal-edit-q .edit-choices-header').style.display = singleMode ? 'none' : '';
  const tagsSection = document.getElementById('edit-tags-section');
  if (tagsSection) tagsSection.style.display = singleMode ? 'none' : '';

  if (!singleMode) {
    document.getElementById('edit-year').value         = q.year         || '';
    document.getElementById('edit-category').value     = q.category     || '';
    document.getElementById('edit-subcategory').value  = q.subcategory  || '';
    document.getElementById('edit-section').value      = q.section      || '';
    document.getElementById('edit-source').value       = q.source       || '';
    // タグ初期化
    editingTags = [...(q.tags || [])];
    renderEditTagSection();
    // ブロック初期化
    editingBlocks = getQuestionBlocks(q).map(b => ({ ...b }));
    if (editingBlocks.length === 0) editingBlocks.push({ type: 'text', content: '' });
    renderEditBlocks();
  }
  // ブロックセクションはシングルモード時に隠す
  const blocksSection = document.getElementById('edit-blocks-section');
  if (blocksSection) blocksSection.style.display = singleMode ? 'none' : '';

  // 計算問題 / 1択選択モード初期化
  const calcCheck   = document.getElementById('edit-calc-mode-check');
  const singleCheck = document.getElementById('edit-single-select-check');
  if (calcCheck)   calcCheck.checked   = q.questionType === 'calculation';
  if (singleCheck) singleCheck.checked = q.questionType === 'single_select';
  const calcRow = document.getElementById('edit-calc-mode-row');
  if (calcRow) calcRow.style.display = singleMode ? 'none' : '';

  // 設問タイプ（1択問題の極性）初期化
  const polSel = document.getElementById('edit-single-polarity');
  if (polSel) polSel.value = (q.answerPolarity === 'correct' || q.answerPolarity === 'incorrect') ? q.answerPolarity : 'auto';
  updateEditPolarityRow();

  // 解説画像初期化
  editingExplanationImage = q.explanationImage || null;
  renderEditExpImageSection();
  // 選択肢画像初期化
  editingChoiceImages = {};
  editingChoiceWidths = {};
  editingChoiceExpImages = {};
  editingChoiceExpWidths = {};
  _editChoiceImgFocus = null;
  (q.choices || []).forEach(c => {
    if (c.image) editingChoiceImages[c.id] = c.image;
    if (c.imageWidth) editingChoiceWidths[c.id] = c.imageWidth;
    if (c.explanationImage) editingChoiceExpImages[c.id] = c.explanationImage;
    if (c.explanationImageWidth) editingChoiceExpWidths[c.id] = c.explanationImageWidth;
  });
  const expImgSection = document.getElementById('edit-exp-image-section');
  if (expImgSection) expImgSection.style.display = singleMode ? 'none' : '';

  const container = document.getElementById('edit-choices-container');
  container.innerHTML = '';

  // シングルモード: 対象の選択肢のみ / 通常モード: 全選択肢
  const targetChoices = singleMode
    ? [[q.choices[editingChoiceIndex], editingChoiceIndex]]
    : (q.choices || []).map((c, i) => [c, i]);

  targetChoices.forEach(([c, i]) => {
    const label = CHOICE_LABELS[i] || String(i + 1);
    const card = document.createElement('div');
    card.className = 'edit-choice-card';
    card.dataset.cid = c.id;

    const hdr = document.createElement('div');
    hdr.className = 'edit-choice-header';
    hdr.textContent = label + '.';

    const textToolbar = _makeRichToolbar();
    const textInput = document.createElement('textarea');
    textInput.className = 'edit-input edit-choice-text-input';
    textInput.rows = 2;
    textInput.value = c.text || '';
    textToolbar.querySelector('.rtb-red').addEventListener('click', () => insertMarkup(textInput, '[r]', '[/r]'));

    const correctRow = document.createElement('div');
    correctRow.className = 'edit-correct-btns';

    const maruBtn = document.createElement('button');
    maruBtn.type = 'button';
    maruBtn.className = 'edit-correct-btn edit-maru' + (c.isCorrect ? ' selected' : '');
    maruBtn.textContent = '○ 正しい';

    const batsuBtn = document.createElement('button');
    batsuBtn.type = 'button';
    batsuBtn.className = 'edit-correct-btn edit-batsu' + (!c.isCorrect ? ' selected' : '');
    batsuBtn.textContent = '✕ 誤り';

    maruBtn.addEventListener('click', () => {
      maruBtn.classList.add('selected');
      batsuBtn.classList.remove('selected');
    });
    batsuBtn.addEventListener('click', () => {
      batsuBtn.classList.add('selected');
      maruBtn.classList.remove('selected');
    });

    correctRow.append(maruBtn, batsuBtn);

    const expLabel = document.createElement('label');
    expLabel.className = 'edit-label';
    expLabel.textContent = '解説';

    const expToolbar = _makeRichToolbar();
    const expInput = document.createElement('textarea');
    expInput.className = 'edit-input edit-choice-exp-input';
    expInput.rows = 2;
    expInput.value = c.explanation || '';
    expToolbar.querySelector('.rtb-red').addEventListener('click', () => insertMarkup(expInput, '[r]', '[/r]'));

    // 選択肢画像エリア
    const choiceImgArea = document.createElement('div');
    choiceImgArea.className = 'edit-choice-img-area';
    choiceImgArea.dataset.cid = c.id;
    const imgPasteZone = _makeImgPasteZone(c.id, 'choice');
    choiceImgArea.appendChild(imgPasteZone);
    _renderChoiceImgPreview(choiceImgArea, c.id, 'choice');

    // 解説画像エリア（解説文の直下に貼り付け）
    const expImgArea = document.createElement('div');
    expImgArea.className = 'edit-choice-exp-img-area';
    expImgArea.dataset.cid = c.id;
    expImgArea.appendChild(_makeImgPasteZone(c.id, 'exp'));
    _renderChoiceImgPreview(expImgArea, c.id, 'exp');

    card.append(hdr, textToolbar, textInput, choiceImgArea, correctRow, expLabel, expToolbar, expInput, expImgArea);
    container.appendChild(card);
  });

  // ナビバー制御（問題リストから開いたときのみ表示）
  const showNav = !!fromList && qlistNavQueue.length > 1;
  const editNavBar = document.getElementById('modal-edit-nav-bar');
  if (editNavBar) editNavBar.classList.toggle('hidden', !showNav);
  if (showNav) {
    const navIdx = qlistNavQueue.indexOf(qId);
    if (navIdx !== -1) modalNavIndex = navIdx;
    updateModalNavUI();
  }

  document.getElementById('modal-edit-q').classList.remove('hidden');
  document.addEventListener('paste', handleEditImagePaste);
}

// 出題画面で問題を編集・保存した後、答え合わせ済みの状態を保ったまま表示を更新する
// 記録済み progress の「最後の履歴エントリ」を編集後の正誤で訂正する（連続正解の補正）
function _fixLastProgressEntry(key, newRight) {
  const p = state.progress[key];
  if (!p || !Array.isArray(p.history) || p.history.length === 0) return;
  const last = p.history.length - 1;
  if (p.history[last] === newRight) return;
  p.history[last] = newRight;
  p.correct = newRight ? (p.correct || 0) + 1 : Math.max(0, (p.correct || 0) - 1);
  lockIfMastered(p);   // 訂正の結果5連続に到達したらロック（既にロック済みなら維持）
}

// 出題中に問題を編集した際、答え合わせ済みなら記録済みの判定（連続正解・正答数・間違いリスト・振り返り）を
// 編集後の内容で訂正する。
function _recorrectStudyProgressAfterEdit(q, savedAnswers) {
  const lastHist = key => {
    const h = state.progress[key]?.history;
    return (Array.isArray(h) && h.length) ? h[h.length - 1] : null;
  };
  const statDelta = (oldR, newR) => {
    if (oldR === null || oldR === newR) return;
    if (newR) state.sessionStats.correct = Math.min(state.sessionStats.total, (state.sessionStats.correct || 0) + 1);
    else      state.sessionStats.correct = Math.max(0, (state.sessionStats.correct || 0) - 1);
  };
  const setQWrong = isWrong => {
    const a = state.sessionWrongQuestions || (state.sessionWrongQuestions = []);
    const i = a.findIndex(x => x.id === q.id);
    if (isWrong && i === -1) a.push(q);
    else if (!isWrong && i !== -1) a.splice(i, 1);
  };
  const setCWrong = (c, idx, isWrong) => {
    const a = state.sessionWrongChoices || (state.sessionWrongChoices = []);
    const i = a.findIndex(it => it.question.id === q.id && it.choice?.id === c.id);
    if (isWrong && i === -1) a.push({ question: q, choice: c, choiceIndex: idx });
    else if (!isWrong && i !== -1) a.splice(i, 1);
  };

  if (isOnePickQuestion(q)) {
    const correct = q.choices.find(c => c.isCorrect);
    const picked  = savedAnswers.__calc__;
    const newR = !!correct && picked === correct.id;
    statDelta(lastHist(q.id + ':q'), newR);
    _fixLastProgressEntry(q.id + ':q', newR);
    if (isCalcQuestion(q)) _fixLastProgressEntry(q.id + ':calc', newR);
    setQWrong(!newR);
    if (correct) setCWrong(correct, q.choices.indexOf(correct), !newR);
  } else {
    let allRight = true;
    (q.choices || []).forEach((c, i) => {
      const newR = (savedAnswers[c.id] === 'maru') === c.isCorrect;
      statDelta(lastHist(c.id), newR);
      _fixLastProgressEntry(c.id, newR);
      setCWrong(c, i, !newR);
      if (!newR) allRight = false;
    });
    _fixLastProgressEntry(q.id + ':q', allRight);
    setQWrong(!allRight);
  }

  // リザルトの振り返り（sessionHistory）も最新の正誤に更新
  const he = (state.sessionHistory || []).find(h => h.question?.id === q.id);
  if (he) {
    if (isOnePickQuestion(q)) {
      const correct = q.choices.find(c => c.isCorrect);
      if (he.choiceResults?.[0]) he.choiceResults[0].isRight = !!correct && savedAnswers.__calc__ === correct.id;
    } else {
      (he.choiceResults || []).forEach(cr => {
        const c = q.choices.find(x => x.id === cr.choice?.id) || cr.choice;
        if (c) cr.isRight = (savedAnswers[c.id] === 'maru') === c.isCorrect;
      });
    }
  }
  saveProgress();
}

function _refreshStudyAfterEdit(updatedQ) {
  const wasChecked   = state.checked;
  const savedAnswers = { ...state.answers };

  if (wasChecked) {
    // renderQuestion() より先に progress を訂正しておく。
    // こうすることで renderQuestion() がドットを描画する時点で正しい値が使われる。
    _recorrectStudyProgressAfterEdit(updatedQ, savedAnswers);
  }

  // 最新の問題内容で再描画（state.checked=false・answers={} にリセットされる）
  // progress は上で訂正済みなので、ドットも正しい状態で描画される。
  renderQuestion();

  if (wasChecked) {
    // 回答を復元して再度答え合わせ → 表示のみ更新（progress 等は上で訂正済み）
    state.answers = savedAnswers;
    _checkNoRecord = true;
    try { checkAnswers(); } finally { _checkNoRecord = false; }
    // checkAnswers() 後にボタンの選択済み状態（selected クラス）を復元
    Object.entries(savedAnswers).forEach(([cid, ans]) => {
      const item = document.querySelector(`.choice-item[data-cid="${cid}"]`);
      if (!item) return;
      item.querySelectorAll('.choice-judge-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.classList.contains(ans));
      });
    });
  }
}

// ==================== 答え合わせ画面のインライン編集 ====================
// モーダルを出さず、答え合わせ画面の **表示中の要素をそのまま編集可能（contenteditable）** にする。
// レイアウトも赤文字表示も変えずに文字だけ上書きできる。保存時に赤文字spanを [r]…[/r] へ復元する。
// 正誤(○/×)・画像・タグ・選択肢の追加削除などの構造編集は「詳細編集」モーダル（openEditModal）側。

// 表示中の要素を編集可能にする（レイアウト保持のため中身は再描画しない）
function _makeInlineEditable(el) {
  if (!el) return;
  el.setAttribute('contenteditable', 'true');
  el.classList.add('inline-editable');
  el.spellcheck = false;
}

// contenteditable のDOMを保存用の生テキストへ直列化する。
// テキスト→そのまま / <br>→改行 / <span class="q-red">→[r]…[/r] / <div>|<p>→改行境界。
function _serializeEditable(el) {
  let out = '';
  const walk = node => {
    node.childNodes.forEach(ch => {
      if (ch.nodeType === Node.TEXT_NODE) {
        out += ch.textContent;
      } else if (ch.nodeType === Node.ELEMENT_NODE) {
        const tag = ch.tagName;
        if (tag === 'BR') {
          out += '\n';
        } else if (ch.classList && ch.classList.contains('q-red')) {
          out += '[r]'; walk(ch); out += '[/r]';
        } else if (tag === 'DIV' || tag === 'P') {
          if (out && !out.endsWith('\n')) out += '\n';   // ブロック要素は改行境界
          walk(ch);
        } else {
          walk(ch);
        }
      }
    });
  };
  walk(el);
  return out;
}

// インライン編集を破棄してフラグを畳む（画面離脱・セッション移動時の保険）
function _resetInlineEditState() {
  if (!inlineEditMode) return;
  inlineEditMode = false;
  document.body.classList.remove('inline-editing');
  document.removeEventListener('paste', handleInlineEditPaste, true);
}

// 「この問題を修正」ボタン：インライン編集ON/OFFトグル（答え合わせ後のみ）
function toggleInlineEdit() {
  if (!state.checked) return;                 // 答え合わせ後だけ編集可
  if (inlineEditMode) exitInlineEdit(true);   // ONなら保存して終了
  else enterInlineEdit();
}

function enterInlineEdit() {
  const q = state.queue[state.queueIndex];
  if (!q) return;
  inlineEditMode = true;
  document.body.classList.add('inline-editing');
  // 表示中の要素をそのまま編集可能にする（レイアウト・赤文字はそのまま）
  document.querySelectorAll('#question-blocks .question-text').forEach(_makeInlineEditable);
  document.querySelectorAll('#choices-list .choice-item-text').forEach(_makeInlineEditable);
  document.querySelectorAll('#choices-list .choice-explanation').forEach(_makeInlineEditable);
  updateInlineEditUI();
  document.addEventListener('paste', handleInlineEditPaste, true);   // 貼り付けはプレーンテキスト化
}

function exitInlineEdit(save) {
  let updated = state.queue[state.queueIndex];
  if (save) updated = saveInlineEdit() || updated;
  inlineEditMode = false;
  document.body.classList.remove('inline-editing');
  document.removeEventListener('paste', handleInlineEditPaste, true);
  updateInlineEditUI();
  _refreshStudyAfterEdit(updated);   // 答え合わせ表示を再構築（contenteditableも解除される）
}

// 編集中のDOMから生テキストを読み取り、q 本体へ書き戻して保存。差し替えた q を返す。
function saveInlineEdit() {
  const cur = state.queue[state.queueIndex];
  if (!cur) return null;
  const idx = state.questions.findIndex(x => x.id === cur.id);
  if (idx === -1) return null;
  const q = { ...state.questions[idx] };

  // 問題文：表示順に .question-text を読み、テキストブロックへ反映（画像ブロックはそのまま）
  const textEls = [...document.querySelectorAll('#question-blocks .question-text')];
  let ti = 0;
  let newBlocks = getQuestionBlocks(state.questions[idx]).map(b => {
    if (b.type === 'text') {
      const el = textEls[ti++];
      return { type: 'text', content: el ? _serializeEditable(el).replace(/\s+$/, '') : b.content };
    }
    return { ...b };
  });
  newBlocks = newBlocks.filter(b => (b.type === 'text' && b.content && b.content.trim()) || (b.type === 'image' && b.src));
  q.questionBlocks = newBlocks.length ? newBlocks : undefined;
  const firstText = newBlocks.find(b => b.type === 'text');
  q.questionText = firstText ? firstText.content : (q.questionText || '');

  // 選択肢：DOM上の .choice-item-text / .choice-explanation を読み取り（表示されている分だけ更新）
  q.choices = (q.choices || []).map(orig => {
    const item = document.querySelector(`#choices-list .choice-item[data-cid="${orig.id}"]`);
    if (!item) return orig;
    const nc = { ...orig };
    const tEl = item.querySelector('.choice-item-text');
    if (tEl) nc.text = _serializeEditable(tEl).trim();
    const eEl = item.querySelector('.choice-explanation');
    if (eEl) nc.explanation = _serializeEditable(eEl).trim();
    return nc;
  });

  state.questions[idx] = q;
  saveQuestions();
  buildFilters();
  // 出題キュー・間違いリストの参照を差し替え（再出題時に最新版が使われるように）
  const qi = state.queue.findIndex(item => item.id === q.id);
  if (qi !== -1) state.queue[qi] = q;
  const wi = (state.sessionWrongQuestions || []).findIndex(item => item.id === q.id);
  if (wi !== -1) state.sessionWrongQuestions[wi] = q;
  return q;
}

// 編集中の貼り付けは、書式付きHTMLを避けてプレーンテキストだけ挿入する（直列化を壊さない）
function handleInlineEditPaste(e) {
  if (!inlineEditMode) return;
  const el = e.target && e.target.closest && e.target.closest('.inline-editable');
  if (!el) return;
  e.preventDefault();
  const text = (e.clipboardData || window.clipboardData).getData('text/plain');
  const sel = window.getSelection();
  if (sel && sel.rangeCount) {
    const range = sel.getRangeAt(0);
    range.deleteContents();
    const node = document.createTextNode(text);
    range.insertNode(node);
    range.setStartAfter(node);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  } else {
    el.appendChild(document.createTextNode(text));
  }
}

// 編集モードのボタン表示・他操作の有効/無効を更新
function updateInlineEditUI() {
  const editBtn   = document.getElementById('btn-edit-study-q');
  const detailBtn = document.getElementById('btn-detail-edit-study-q');
  const cancelBtn = document.getElementById('btn-cancel-inline-edit');
  const nextBtn   = document.getElementById('btn-next');
  if (editBtn) {
    editBtn.textContent = inlineEditMode ? '✅ 保存して編集を終了' : '✏️ この問題を修正';
    editBtn.classList.toggle('inline-edit-active', inlineEditMode);
  }
  if (cancelBtn) cancelBtn.classList.toggle('hidden', !inlineEditMode);
  if (detailBtn) detailBtn.classList.toggle('hidden', inlineEditMode);
  if (nextBtn)   nextBtn.disabled = inlineEditMode;
  // 編集中はナビ・マーカー・ブックマークを止める（誤操作で編集が飛ぶのを防ぐ）
  ['btn-marker-toggle', 'btn-study-prev', 'btn-study-next', 'btn-bookmark', 'btn-report-study-q', 'btn-verify-ai'].forEach(id => {
    const b = document.getElementById(id);
    if (b) b.disabled = inlineEditMode;
  });
}

function saveEditModal() {
  if (!editingQId) return;
  // 保存前にトグル開閉状態を退避（モーダルの後ろにあるリストの状態を保持）
  _savedQlistOpenState = getToggleOpenState('questions-container');
  const idx = state.questions.findIndex(q => q.id === editingQId);
  if (idx === -1) return;

  const q = { ...state.questions[idx] };

  if (editingChoiceIndex === null) {
    // 通常モード: メタフィールドも保存
    q.year         = document.getElementById('edit-year').value.trim();
    q.category     = document.getElementById('edit-category').value.trim()     || q.category;
    q.subcategory  = document.getElementById('edit-subcategory').value.trim();
    q.section      = document.getElementById('edit-section').value.trim();
    q.source       = document.getElementById('edit-source').value.trim()       || q.source;
    q.tags         = [...editingTags];
    // DOMから最新のテキスト値を同期（inputイベント漏れ対策）
    syncEditBlocksFromDOM();
    console.log('[saveEditModal] editingBlocks after sync:', JSON.stringify(editingBlocks.map(b => b.type === 'text' ? {type:'text', content: b.content?.slice(0,30)+'...'} : {type:'image'})));
    // ブロック保存
    const blocks = editingBlocks.filter(b =>
      (b.type === 'text' && b.content?.trim()) ||
      (b.type === 'image' && b.src)
    ).map(b => b.type === 'text' ? { ...b, content: b.content.trim() } : { ...b });
    console.log('[saveEditModal] saving blocks:', blocks.length, 'first text:', blocks.find(b=>b.type==='text')?.content?.slice(0,50));
    q.questionBlocks = blocks.length > 0 ? blocks : undefined;
    // 後方互換: questionText は先頭テキストブロックで更新
    const firstText = blocks.find(b => b.type === 'text');
    q.questionText = firstText ? firstText.content : (q.questionText || '');
    delete q.image; // 旧フィールド削除
    // 問題タイプ（計算問題 / 1択選択モード）
    const calcCheck2   = document.getElementById('edit-calc-mode-check');
    const singleCheck2 = document.getElementById('edit-single-select-check');
    if (calcCheck2 && calcCheck2.checked) {
      q.questionType = 'calculation';
    } else if (singleCheck2 && singleCheck2.checked) {
      q.questionType = 'single_select';
    } else {
      delete q.questionType;
    }
    // 設問タイプ（1択問題の極性）：auto は自動判定に任せるので保存しない
    {
      const polV = document.getElementById('edit-single-polarity')?.value;
      if (singleCheck2 && singleCheck2.checked && (polV === 'correct' || polV === 'incorrect')) {
        q.answerPolarity = polV;
      } else {
        delete q.answerPolarity;
      }
    }
    // 解説画像
    if (editingExplanationImage) {
      q.explanationImage = editingExplanationImage;
    } else {
      delete q.explanationImage;
    }
  }

  const cards = document.querySelectorAll('#edit-choices-container .edit-choice-card');
  q.choices = [...(q.choices || [])];

  if (editingChoiceIndex !== null) {
    // シングルモード: 対象選択肢のみ更新
    const card = cards[0];
    if (card && q.choices[editingChoiceIndex]) {
      const textInput = card.querySelector('.edit-choice-text-input');
      const expInput  = card.querySelector('.edit-choice-exp-input');
      const maruBtn   = card.querySelector('.edit-maru');
      const cid = q.choices[editingChoiceIndex].id;
      q.choices[editingChoiceIndex] = {
        ...q.choices[editingChoiceIndex],
        text:        textInput ? textInput.value.trim()                : q.choices[editingChoiceIndex].text,
        isCorrect:   maruBtn  ? maruBtn.classList.contains('selected') : q.choices[editingChoiceIndex].isCorrect,
        explanation: expInput  ? expInput.value.trim()                 : q.choices[editingChoiceIndex].explanation,
      };
      if (editingChoiceImages[cid]) {
        q.choices[editingChoiceIndex].image = editingChoiceImages[cid];
      } else {
        delete q.choices[editingChoiceIndex].image;
      }
      if (editingChoiceWidths[cid] != null) {
        q.choices[editingChoiceIndex].imageWidth = editingChoiceWidths[cid];
      } else {
        delete q.choices[editingChoiceIndex].imageWidth;
      }
      _applyEditedExpImage(q.choices[editingChoiceIndex], cid);
    }
  } else {
    // 通常モード: 全選択肢を更新
    cards.forEach((card, i) => {
      if (!q.choices[i]) return;
      const textInput = card.querySelector('.edit-choice-text-input');
      const expInput  = card.querySelector('.edit-choice-exp-input');
      const maruBtn   = card.querySelector('.edit-maru');
      const cid = q.choices[i].id;
      q.choices[i] = {
        ...q.choices[i],
        text:        textInput ? textInput.value.trim()                : q.choices[i].text,
        isCorrect:   maruBtn  ? maruBtn.classList.contains('selected') : q.choices[i].isCorrect,
        explanation: expInput  ? expInput.value.trim()                 : q.choices[i].explanation,
      };
      if (editingChoiceImages[cid]) {
        q.choices[i].image = editingChoiceImages[cid];
      } else {
        delete q.choices[i].image;
      }
      if (editingChoiceWidths[cid] != null) {
        q.choices[i].imageWidth = editingChoiceWidths[cid];
      } else {
        delete q.choices[i].imageWidth;
      }
      _applyEditedExpImage(q.choices[i], cid);
    });
  }

  state.questions[idx] = q;
  saveQuestions();
  buildFilters();

  // 保存済み問題の管理画面からの編集は、画面を切り替えず（モーダルを閉じず）保存だけ行う
  const inManagement = !document.getElementById('screen-questions').classList.contains('hidden');
  if (inManagement) {
    renderQuestionList(_savedQlistOpenState);  // 背後のリストを最新化
    _savedQlistOpenState = null;
    const sb = document.getElementById('modal-edit-save');
    if (sb && !sb.dataset.saving) {
      sb.dataset.saving = '1';
      const orig = sb.textContent;
      sb.textContent = '✓ 保存しました';
      sb.disabled = true;
      setTimeout(() => { sb.textContent = orig; sb.disabled = false; delete sb.dataset.saving; }, 1200);
    }
    return; // 編集状態は維持（続けて編集・←→移動が可能）
  }

  document.getElementById('modal-edit-q').classList.add('hidden');
  document.removeEventListener('paste', handleEditImagePaste);
  editingQId         = null;
  editingChoiceIndex = null;
  editingChoiceImages = {};
  editingChoiceWidths = {};
  editingChoiceExpImages = {};
  editingChoiceExpWidths = {};
  _editChoiceImgFocus = null;
  if (!document.getElementById('screen-stats').classList.contains('hidden')) {
    _renderStatsImpl();
  }

  // 出題画面が表示中の場合：queue / sessionWrongQuestions の参照を差し替えて再描画
  if (!document.getElementById('screen-study')?.classList.contains('hidden')) {
    // queue 内の該当エントリを新オブジェクトに差し替え
    const qi = state.queue.findIndex(item => item.id === q.id);
    if (qi !== -1) state.queue[qi] = q;
    // 間違い問題リストも差し替え（再出題時に最新版が使われるように）
    const wi = (state.sessionWrongQuestions || []).findIndex(item => item.id === q.id);
    if (wi !== -1) state.sessionWrongQuestions[wi] = q;
    // 現在表示中の問題だった場合、画面を更新
    if (state.queue[state.queueIndex]?.id === q.id) {
      _refreshStudyAfterEdit(q);
    }
  }

  // 壁打ち画面が表示中の場合：drillQueue の参照を差し替えて再描画
  if (!document.getElementById('screen-drill')?.classList.contains('hidden')) {
    // drillQueue 内の該当エントリをすべて最新の question / choice に差し替え
    (state.drillQueue || []).forEach(item => {
      if (item.question.id !== q.id) return;
      item.question = q;
      const updatedChoice = q.choices?.[item.choiceIndex];
      if (updatedChoice) item.choice = updatedChoice;
    });
    // 間違いリストも差し替え
    (state.sessionWrongChoices || []).forEach(item => {
      if (item.question.id !== q.id) return;
      item.question = q;
      const updatedChoice = q.choices?.[item.choiceIndex];
      if (updatedChoice) item.choice = updatedChoice;
    });
    (state.sessionWrongQuestions || []).forEach((item, i) => {
      if (item.id === q.id) state.sessionWrongQuestions[i] = q;
    });
    // 現在表示中の選択肢だった場合、画面を再描画
    const curDi = state.drillQueue?.[state.drillIndex];
    if (curDi?.question.id === q.id) {
      // 答え合わせ済みの場合、保存された正誤を最新の isCorrect で再計算
      const savedAns = state.drillAnswers[state.drillIndex];
      if (savedAns) {
        // 1択問題は「記述の正誤」（設問の極性を考慮）で判定
        const newActuallyCorrect = isSingleSelectQuestion(q)
          ? singleSelectStatementTrue(q, curDi.choice)
          : curDi.choice.isCorrect;
        const newIsRight = (savedAns.userSaysCorrect === newActuallyCorrect);
        // 正誤が変わったら drillStats・連続正解(progress)・間違いリストも補正
        if (newIsRight !== savedAns.isRight) {
          if (newIsRight) state.drillStats.correct = Math.min(state.drillStats.total, state.drillStats.correct + 1);
          else            state.drillStats.correct = Math.max(0, state.drillStats.correct - 1);
          _fixLastProgressEntry(curDi.choice.id, newIsRight);
          const wa = state.sessionWrongChoices || (state.sessionWrongChoices = []);
          const wi = wa.findIndex(it => it.question.id === q.id && it.choice?.id === curDi.choice.id);
          if (!newIsRight && wi === -1) wa.push({ question: q, choice: curDi.choice, choiceIndex: curDi.choiceIndex });
          else if (newIsRight && wi !== -1) wa.splice(wi, 1);
          saveProgress();
        }
        state.drillAnswers[state.drillIndex] = {
          ...savedAns,
          actuallyCorrect: newActuallyCorrect,
          isRight: newIsRight,
        };
      }
      renderDrillChoice();
    }
  }
}

// ========== 計算問題練習 ==========
const CALC_PROBLEMS_KEY = 'gas_calc_problems_v1';

function handleCalcAddImagePaste(e) {
  const modal = document.getElementById('modal-calc-add');
  if (!modal || modal.classList.contains('hidden')) return;
  // テキスト入力中はスキップ
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  const items = e.clipboardData?.items;
  if (!items) return;
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile();
      const reader = new FileReader();
      reader.onload = ev => {
        const target  = calcAddPasteTarget;
        const preview = document.getElementById(
          target === 'explanation' ? 'calc-add-exp-preview' : 'calc-add-problem-preview'
        );
        if (preview) {
          preview.innerHTML = `<img src="${ev.target.result}" alt="">`;
          preview._imgData  = ev.target.result;
        }
      };
      reader.readAsDataURL(file);
      e.preventDefault();
      break;
    }
  }
}

async function loadCalcProblems() {
  try {
    const data = JSON.parse(localStorage.getItem(CALC_PROBLEMS_KEY));
    if (!Array.isArray(data)) return;
    calcProblems = await Promise.all(data.map(async p => ({
      ...p,
      problemImage:     await idbResolveImage(p.problemImage),
      explanationImage: await idbResolveImage(p.explanationImage),
    })));
    // 旧形式（data:直埋め）を検出したら新形式に自動移行
    if (data.some(p => p.problemImage?.startsWith('data:') || p.explanationImage?.startsWith('data:'))) {
      await saveCalcProblems();
    }
  } catch(e) {}
}

async function saveCalcProblems() {
  try {
    // 画像をIDBに保存し、LocalStorageには参照のみ格納
    const metadata = await Promise.all(calcProblems.map(async p => {
      const m = { id: p.id, title: p.title, subcategory: p.subcategory, category: p.category, year: p.year, mark: p.mark || '' };
      if (p.problemImage?.startsWith('data:')) {
        await idbSet('calc_' + p.id + '_prob', p.problemImage);
        m.problemImage = IDB_REF + 'calc_' + p.id + '_prob';
      } else {
        m.problemImage = p.problemImage || null;
      }
      if (p.explanationImage?.startsWith('data:')) {
        await idbSet('calc_' + p.id + '_exp', p.explanationImage);
        m.explanationImage = IDB_REF + 'calc_' + p.id + '_exp';
      } else {
        m.explanationImage = p.explanationImage || null;
      }
      return m;
    }));
    localStorage.setItem(CALC_PROBLEMS_KEY, JSON.stringify(metadata));
    return true;
  } catch(e) {
    return false;
  }
}

// 計算問題一覧の全グループ（タイトル・サブカテゴリ）を折りたたむ
function collapseAllCalcGroups() {
  collapsedCalcTitles.clear();
  collapsedCalcSubcats.clear();
  calcProblems.forEach(p => {
    const tk = p.title || '';
    collapsedCalcTitles.add(tk);
    collapsedCalcSubcats.add(tk + '::' + (p.subcategory || ''));
  });
}

function renderCalcPracticeScreen() {
  const listEl  = document.getElementById('calc-practice-list');
  const emptyEl = document.getElementById('calc-practice-empty');
  if (!listEl || !emptyEl) return;

  if (calcProblems.length === 0) {
    listEl.innerHTML = '';
    emptyEl.classList.remove('hidden');
    return;
  }
  emptyEl.classList.add('hidden');
  listEl.innerHTML = '';

  const isRegistered = calcSortMode === 'registered-asc' || calcSortMode === 'registered-desc';
  const descending   = calcSortMode === 'registered-desc';

  // ── タイトルでグループ化（全モード共通。マークフィルター適用）──
  const groups = new Map(); // titleKey → { title, items: [{p, origIndex}] }
  calcProblems.forEach((p, i) => {
    if (calcMarkFilter.size > 0 && !calcMarkFilter.has(p.mark)) return; // ◎/〇フィルター
    const key = p.title || '';
    if (!groups.has(key)) groups.set(key, { title: p.title || '', items: [] });
    groups.get(key).items.push({ p, origIndex: i });
  });

  // マークフィルターで該当0件
  if (groups.size === 0) {
    listEl.innerHTML = '<p style="color:var(--text-3);font-size:.85rem;text-align:center;padding:20px 0;">該当する計算問題がありません</p>';
    return;
  }

  // ── グループのソートキー配列を生成 ──
  let sortedKeys;
  if (isRegistered) {
    // 登録順：グループ内の最小(古い順) or 最大(新しい順) origIndex でグループを並べる
    sortedKeys = [...groups.keys()].sort((a, b) => {
      const idxA = descending
        ? Math.max(...groups.get(a).items.map(x => x.origIndex))
        : Math.min(...groups.get(a).items.map(x => x.origIndex));
      const idxB = descending
        ? Math.max(...groups.get(b).items.map(x => x.origIndex))
        : Math.min(...groups.get(b).items.map(x => x.origIndex));
      return descending ? idxB - idxA : idxA - idxB;
    });
  } else {
    // タイトル順：五十音順（空文字は末尾）
    sortedKeys = [...groups.keys()].sort((a, b) => {
      if (a === '' && b === '') return 0;
      if (a === '') return 1;
      if (b === '') return -1;
      return a.localeCompare(b, 'ja');
    });
  }

  // ── 各グループをレンダリング ──
  sortedKeys.forEach(key => {
    const group = groups.get(key);

    // グループ内のアイテムをソート
    if (isRegistered) {
      // 登録順：origIndex で昇順 / 降順
      group.items.sort((a, b) =>
        descending ? b.origIndex - a.origIndex : a.origIndex - b.origIndex
      );
    } else {
      // タイトル順：サブカテゴリの五十音順（空は末尾）
      group.items.sort((a, b) => {
        const sa = a.p.subcategory || '';
        const sb = b.p.subcategory || '';
        if (sa === '' && sb === '') return 0;
        if (sa === '') return 1;
        if (sb === '') return -1;
        return sa.localeCompare(sb, 'ja');
      });
    }

    const isCollapsed = collapsedCalcTitles.has(key);
    const groupEl = document.createElement('div');
    groupEl.className = 'calc-title-group' + (isCollapsed ? ' collapsed' : '');
    groupEl.dataset.titleKey = key;

    // グループヘッダー
    const headerEl = document.createElement('div');
    headerEl.className = 'calc-title-group-header';
    headerEl.innerHTML =
      `<span class="calc-title-toggle-icon">▼</span>` +
      `<span class="calc-title-group-name">${escapeHtml(group.title || '（タイトルなし）')}</span>` +
      `<span class="calc-title-group-count">${group.items.length}問</span>`;
    headerEl.addEventListener('click', () => {
      groupEl.classList.toggle('collapsed');
      if (groupEl.classList.contains('collapsed')) {
        collapsedCalcTitles.add(key);
      } else {
        collapsedCalcTitles.delete(key);
      }
    });
    groupEl.appendChild(headerEl);

    // ── タイトルグループ内のアイテムを平坦に表示（サブカテゴリの仕切りなし）──
    // 並び：登録順=origIndex / タイトル順=サブカテゴリ→origIndex
    const flatItems = group.items.slice().sort((a, b) => {
      if (isRegistered) return descending ? b.origIndex - a.origIndex : a.origIndex - b.origIndex;
      const sa = a.p.subcategory || '', sb = b.p.subcategory || '';
      if (sa !== sb) {
        if (sa === '') return 1;
        if (sb === '') return -1;
        return sa.localeCompare(sb, 'ja');
      }
      return a.origIndex - b.origIndex;
    });

    const itemsEl = document.createElement('div');
    itemsEl.className = 'calc-title-group-items';

    flatItems.forEach(({ p, origIndex }) => {
      // 表示順：◎/〇 ／ 年度 ／ カテゴリ ／ サブカテゴリ
      const metaParts = [p.year, p.category, p.subcategory].filter(Boolean);
      const metaHtml = `<span class="calc-practice-item-meta">${escapeHtml(metaParts.join('　／　'))}</span>`;
      const calcTier = streakTierFromEntry(state.progress[p.id]);   // ロック考慮
      const markHtml = p.mark
        ? `<span class="calc-practice-item-mark mark-${p.mark === '◎' ? 'double' : 'single'}">${p.mark}</span>`
        : '';
      const itemEl = document.createElement('div');
      itemEl.className = 'calc-practice-item' + (calcTier ? ' tier-' + calcTier : '');
      itemEl.dataset.index = origIndex;
      itemEl.innerHTML = markHtml + metaHtml;
      // 直近5回の正誤ドット（出題画面と同じ表示を一覧でも見られるように）
      const listDots = makeHistoryDots(state.progress[p.id]);
      listDots.classList.add('calc-practice-item-dots');
      itemEl.appendChild(listDots);
      itemEl.addEventListener('click', () => {
        calcDetailIndex = parseInt(itemEl.dataset.index);
        openCalcDetail();
      });
      itemsEl.appendChild(itemEl);
    });

    groupEl.appendChild(itemsEl);
    listEl.appendChild(groupEl);
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function openCalcDetail() {
  renderCalcDetailScreen();
  showScreen('calc-detail');
}

function renderCalcDetailScreen() {
  const p = calcProblems[calcDetailIndex];
  if (!p) return;

  // ヘッダー位置
  const posEl = document.getElementById('calc-detail-pos');
  if (posEl) posEl.textContent = `${calcDetailIndex + 1} / ${calcProblems.length}`;

  // メタ情報（先頭に◎/〇マークを一覧と同じ色付きで表示）
  const metaEl = document.getElementById('calc-detail-meta');
  if (metaEl) {
    const parts = [];
    if (p.title)       parts.push(p.title);
    if (p.subcategory) parts.push(p.subcategory);
    if (p.year)        parts.push(p.year);
    if (p.category)    parts.push(p.category);
    const markHtml = p.mark
      ? `<span class="calc-practice-item-mark mark-${p.mark === '◎' ? 'double' : 'single'}">${p.mark}</span>　`
      : '';
    metaEl.innerHTML = markHtml + escapeHtml(parts.join('　／　'));
  }

  // 問題画像
  const probEl = document.getElementById('calc-detail-problem-img');
  if (probEl) {
    probEl.innerHTML = p.problemImage
      ? `<img src="${p.problemImage}" alt="問題">`
      : `<div style="text-align:center;color:var(--text-3);padding:30px;">画像なし</div>`;
  }

  // 解説エリアを初期非表示にリセット
  const expWrap = document.getElementById('calc-detail-exp-wrap');
  if (expWrap) expWrap.classList.add('hidden');
  const toggleBtn = document.getElementById('btn-calc-toggle-exp');
  if (toggleBtn) {
    toggleBtn.textContent = '解説を見る';
    toggleBtn.className = 'btn btn-primary';
  }

  // 解説画像
  const expEl = document.getElementById('calc-detail-exp-img');
  if (expEl) {
    expEl.innerHTML = p.explanationImage
      ? `<img src="${p.explanationImage}" alt="解説">`
      : `<div style="text-align:center;color:var(--text-3);padding:30px;">画像なし</div>`;
  }

  // 正誤履歴ドット（直近5回）
  const dotsEl = document.getElementById('calc-detail-dots');
  if (dotsEl) dotsEl.replaceChildren(makeHistoryDots(state.progress[p.id]));
  const accEl0 = document.getElementById('calc-detail-acc');
  if (accEl0) accEl0.textContent = '';

  // 前後ボタン制御
  const prevBtn = document.getElementById('btn-calc-prev');
  const nextBtn = document.getElementById('btn-calc-next');
  if (prevBtn) prevBtn.disabled = calcDetailIndex <= 0;
  if (nextBtn) nextBtn.disabled = calcDetailIndex >= calcProblems.length - 1;
}

// 計算問題の正誤を記録（直近5回まで履歴・ティアに反映）。解説の開閉状態は維持する。
function recordCalcAnswer(isRight) {
  const p = calcProblems[calcDetailIndex];
  if (!p) return;
  recordAnswer(p.id, isRight);
  recordStudyActivity(1, isRight ? 1 : 0, 1, '計算問題'); // 今日の学習（選択肢・問数）に加算
  updateHeaderStats();                                    // ヘッダーの「今日の学習」を即時反映
  const dotsEl = document.getElementById('calc-detail-dots');
  if (dotsEl) dotsEl.replaceChildren(makeHistoryDots(state.progress[p.id]));
  const accEl = document.getElementById('calc-detail-acc');
  if (accEl) accEl.textContent = isRight ? '✓ 正解を記録しました' : '✗ 不正解を記録しました';
}

/**
 * 年度文字列を西暦数値に変換（ソート用）。
 * 対応形式の例：「令和5年度」「平成30年度」「甲R5」「甲30」「乙H28」「2023」。
 *  - 令和: 令和N / 令N / RN（甲R5 等）
 *  - 平成: 平成N / 平N / HN
 *  - 昭和: 昭和N / 昭N / SN
 *  - 「甲/乙/丙」+数字（元号略字なし）は平成として扱う（甲20→平成20）
 */
function jaYearToNum(yr) {
  if (!yr) return 0;
  const toN = s => s === '元' ? 1 : parseInt(s, 10);
  let m;
  if ((m = yr.match(/(?:令和|令|[RＲ])\s*(\d+|元)/i))) return 2018 + toN(m[1]);
  if ((m = yr.match(/(?:平成|平|[HＨ])\s*(\d+|元)/i))) return 1988 + toN(m[1]);
  if ((m = yr.match(/(?:昭和|昭|[SＳ])\s*(\d+|元)/i))) return 1925 + toN(m[1]);
  if ((m = yr.match(/(\d{4})/)))                       return parseInt(m[1], 10);
  if ((m = yr.match(/[甲乙丙]\s*(\d+)/)))              return 1988 + toN(m[1]); // 甲20→平成20
  if ((m = yr.match(/(\d+)/)))                         return parseInt(m[1], 10);
  return 0;
}

/** datalistを登録済みデータで更新する */
function refreshCalcDatalistOptions() {
  const fillList = (id, values, sortFn) => {
    const dl = document.getElementById(id);
    if (!dl) return;
    let unique = [...new Set(values.filter(Boolean))];
    if (sortFn) unique = unique.sort(sortFn);
    dl.innerHTML = unique.map(v => `<option value="${escapeHtml(v)}">`).join('');
  };
  fillList('calc-title-list',       calcProblems.map(p => p.title).filter(Boolean));
  fillList('calc-subcategory-list', calcProblems.map(p => p.subcategory).filter(Boolean));
  fillList('calc-category-list',    calcProblems.map(p => p.category).filter(Boolean));
  fillList('calc-year-list',        calcProblems.map(p => p.year).filter(Boolean),
    (a, b) => jaYearToNum(b) - jaYearToNum(a));
}

// 計算問題モーダルの入力内容をデータオブジェクトに集約（保存・サイレント保存で共用）
function collectCalcModalData() {
  const probPrev = document.getElementById('calc-add-problem-preview');
  const expPrev  = document.getElementById('calc-add-exp-preview');
  const isEdit   = editingCalcIndex !== null;
  return {
    id:               isEdit ? calcProblems[editingCalcIndex].id : 'calc_' + Date.now(),
    title:            (document.getElementById('calc-add-title')?.value       || '').trim(),
    subcategory:      (document.getElementById('calc-add-subcategory')?.value || '').trim(),
    category:         (document.getElementById('calc-add-category')?.value    || '').trim(),
    year:             (document.getElementById('calc-add-year')?.value        || '').trim(),
    mark:             document.getElementById('calc-mark-btns')?.dataset.mark || '',
    problemImage:     probPrev?._imgData || null,
    explanationImage: expPrev?._imgData  || null,
  };
}

// 編集中の計算問題を閉じずに保存（前後ナビ用）。画像が揃っていれば true
async function saveCalcEditSilent() {
  if (editingCalcIndex === null) return false;
  const data = collectCalcModalData();
  if (!data.problemImage || !data.explanationImage) return false;
  calcProblems[editingCalcIndex] = data;
  await saveCalcProblems();
  return true;
}

// 前後ナビ行（編集モード時のみ表示）の状態を更新
function updateCalcEditNav() {
  const nav = document.getElementById('calc-edit-nav');
  if (!nav) return;
  const isEdit = editingCalcIndex !== null;
  nav.classList.toggle('hidden', !isEdit);
  if (!isEdit) return;
  const pos = document.getElementById('calc-edit-nav-pos');
  if (pos) pos.textContent = `${editingCalcIndex + 1} / ${calcProblems.length}`;
  const prev = document.getElementById('calc-edit-prev');
  const next = document.getElementById('calc-edit-next');
  if (prev) prev.disabled = editingCalcIndex <= 0;
  if (next) next.disabled = editingCalcIndex >= calcProblems.length - 1;
}

// 編集画面のまま前/次の登録問題へ移動（現在の編集内容はサイレント保存）
async function navigateCalcEdit(direction) {
  if (editingCalcIndex === null) return;
  const newIndex = editingCalcIndex + direction;
  if (newIndex < 0 || newIndex >= calcProblems.length) return;
  await saveCalcEditSilent();
  openCalcModal(newIndex);
}

/**
 * 計算問題追加/編集モーダルを開く
 * @param {number|null} editIndex - null=追加, number=編集対象インデックス
 */
function openCalcModal(editIndex) {
  editingCalcIndex = editIndex;
  const isEdit = editIndex !== null;
  const p = isEdit ? calcProblems[editIndex] : null;

  // モーダルタイトル・ボタンテキスト
  document.getElementById('calc-modal-title').textContent = isEdit ? '✏️ 計算問題を編集' : '🔢 計算問題を追加';
  document.getElementById('calc-add-save').textContent    = isEdit ? '保存する' : '追加する';

  // フィールド初期値
  const _setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
  _setVal('calc-add-title',       p?.title);
  _setVal('calc-add-subcategory', p?.subcategory);
  _setVal('calc-add-category',    p?.category);
  _setVal('calc-add-year',        p?.year);

  // マーク（◎/〇）の初期状態
  const markWrap = document.getElementById('calc-mark-btns');
  if (markWrap) {
    const cur = p?.mark || '';
    markWrap.dataset.mark = cur;
    markWrap.querySelectorAll('.calc-mark-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.mark === cur));
  }

  // 画像プレビュー
  const probPrev = document.getElementById('calc-add-problem-preview');
  const expPrev  = document.getElementById('calc-add-exp-preview');
  if (p?.problemImage) {
    probPrev.innerHTML = `<img src="${p.problemImage}" alt="">`;
    probPrev._imgData  = p.problemImage;  // 編集時は既存画像をデフォルトに
  } else {
    probPrev.innerHTML = '<span class="calc-img-empty">画像が選択されていません</span>';
    probPrev._imgData  = null;
  }
  if (p?.explanationImage) {
    expPrev.innerHTML = `<img src="${p.explanationImage}" alt="">`;
    expPrev._imgData  = p.explanationImage;
  } else {
    expPrev.innerHTML = '<span class="calc-img-empty">画像が選択されていません</span>';
    expPrev._imgData  = null;
  }

  document.getElementById('calc-add-error').classList.add('hidden');
  document.getElementById('input-calc-problem-img').value = '';
  document.getElementById('input-calc-exp-img').value     = '';
  calcAddPasteTarget = 'problem';

  // datalistを最新データで更新
  refreshCalcDatalistOptions();

  // 前後ナビ（編集モード時のみ）
  updateCalcEditNav();

  document.getElementById('modal-calc-add').classList.remove('hidden');
  // ナビで開き直しても多重登録しないよう、いったん解除してから登録
  document.removeEventListener('paste', handleCalcAddImagePaste);
  document.addEventListener('paste', handleCalcAddImagePaste);
}

// ========== 論述問題練習（Essay Notes） ==========
/**
 * 模範解答を丸ごと登録し、一部を塗りつぶして暗記するモード。
 *
 * データ: essayNotes（`gas_essay_notes_v1`）
 *   [{ id, category:'法令'|'消費機器', title, body, blanks:[{id,start,end,text}], created, updated }]
 *   blanks = 隠す候補の範囲。`start/end` は **renderText(body) の可視テキスト上のオフセット**、
 *   `text` はマーカーと同じ再アンカー用の実文字列（本文を編集しても位置が追従する）。
 *
 * レベル: ESSAY_LEVEL_PCT[level] の割合ぶんの blanks を **毎回ランダムに** 選んで隠す
 *         （割合の基準は文字数ではなく blanks の個数）。
 */
const ESSAY_LEVEL_PCT = [0, 20, 40, 60, 80, 100];   // index = レベル

let essayNotes      = [];     // 登録済みの模範解答
let essayListCat    = '法令'; // 一覧で表示中の科目
let essayCurrentId  = null;   // 練習／編集中のノートid
let essayLevel      = 1;      // 隠すレベル（0〜5）
let essayHiddenIds  = new Set();  // 今回隠している blank の id
let essayEditBlanks = [];     // 編集画面の作業コピー

function loadEssayNotes() {
  try {
    const raw = localStorage.getItem(ESSAY_NOTES_KEY);
    essayNotes = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(essayNotes)) essayNotes = [];
  } catch { essayNotes = []; }
}

function saveEssayNotes() {
  localStorage.setItem(ESSAY_NOTES_KEY, JSON.stringify(essayNotes));
}

function essayNoteById(id) { return essayNotes.find(n => n.id === id) || null; }

// ── 一覧 ──
function openEssayList(cat) {
  if (cat) essayListCat = cat;
  renderEssayListScreen();
  showScreen('essay-list');
}

function renderEssayListScreen() {
  const titleEl = document.getElementById('essay-list-title');
  const listEl  = document.getElementById('essay-list');
  const emptyEl = document.getElementById('essay-list-empty');
  if (!listEl || !emptyEl) return;

  if (titleEl) titleEl.textContent = `📝 論述問題練習（${essayListCat}）`;

  const notes = essayNotes.filter(n => n.category === essayListCat);
  listEl.innerHTML = '';
  emptyEl.classList.toggle('hidden', notes.length > 0);

  notes.forEach(n => {
    const item = document.createElement('button');
    item.className = 'essay-list-item';
    const t = document.createElement('div');
    t.className = 'essay-list-item-title';
    t.textContent = n.title || '(無題)';
    const meta = document.createElement('div');
    meta.className = 'essay-list-item-meta';
    meta.textContent = `隠す範囲 ${(n.blanks || []).length}件`;
    item.append(t, meta);
    item.addEventListener('click', () => openEssayPractice(n.id));
    listEl.appendChild(item);
  });
}

// ── 練習 ──
/** レベルに応じて隠す blank を毎回ランダムに選び直す */
function rerollEssayHidden() {
  const note = essayNoteById(essayCurrentId);
  const blanks = (note && note.blanks) || [];
  const pct = ESSAY_LEVEL_PCT[essayLevel] ?? 0;
  if (pct <= 0 || blanks.length === 0) { essayHiddenIds = new Set(); return; }
  if (pct >= 100) { essayHiddenIds = new Set(blanks.map(b => b.id)); return; }
  const n = Math.max(1, Math.round(blanks.length * pct / 100));
  essayHiddenIds = new Set(_shuffleInPlace(blanks.slice()).slice(0, n).map(b => b.id));
}

function openEssayPractice(id) {
  essayCurrentId = id;
  rerollEssayHidden();
  renderEssayPractice();
  showScreen('essay-practice');
}

function renderEssayLevelBtns() {
  const wrap = document.getElementById('essay-level-btns');
  if (!wrap) return;
  wrap.innerHTML = '';
  ESSAY_LEVEL_PCT.forEach((pct, lv) => {
    const b = document.createElement('button');
    b.className = 'essay-level-btn' + (essayLevel === lv ? ' active' : '');
    b.textContent = `Lv${lv}（${pct}%）`;
    b.addEventListener('click', () => {
      essayLevel = lv;
      rerollEssayHidden();
      renderEssayPractice();
    });
    wrap.appendChild(b);
  });
}

function renderEssayPractice() {
  const note = essayNoteById(essayCurrentId);
  if (!note) { openEssayList(essayListCat); return; }

  document.getElementById('essay-practice-title').textContent = note.title || '(無題)';
  renderEssayLevelBtns();

  const bodyEl = document.getElementById('essay-practice-body');
  bodyEl.innerHTML = renderText(note.body || '');

  // 選ばれた blank を塗りつぶす。位置は毎回テキストから再アンカーしてズレを防ぐ
  let dirty = false;
  const dead = [];
  (note.blanks || []).forEach(b => {
    if (!essayHiddenIds.has(b.id)) return;
    const a = _anchorHighlight(bodyEl, b);
    if (!a.valid) { dead.push(b); return; }   // 本文編集で復元できなくなった範囲
    if (a.changed) { b.start = a.start; b.end = a.end; dirty = true; }
    _applyHighlightRange(bodyEl, a.start, a.end, b.id, 'essay-blank');
  });
  if (dead.length) {
    note.blanks = (note.blanks || []).filter(b => !dead.includes(b));
    dirty = true;
  }
  if (dirty) saveEssayNotes();

  // 隠された部分はクリックで表示／非表示をトグル
  bodyEl.onclick = e => {
    const m = e.target.closest('mark.essay-blank');
    if (m) m.classList.toggle('revealed');
  };

  _updateEssayRevealBtn();
}

/** 「全部表示／全部隠す」ボタンのラベルを現在の状態に合わせる */
function _updateEssayRevealBtn() {
  const btn = document.getElementById('btn-essay-reveal-all');
  if (!btn) return;
  const marks = document.querySelectorAll('#essay-practice-body mark.essay-blank');
  const allRevealed = marks.length > 0 && [...marks].every(m => m.classList.contains('revealed'));
  btn.textContent = allRevealed ? '🙈 全部隠す' : '👁 全部表示';
  btn.classList.toggle('hidden', marks.length === 0);
}

// ── 編集 ──
function openEssayEdit(id) {
  essayCurrentId = id;
  const note = id ? essayNoteById(id) : null;
  document.getElementById('essay-edit-title').value    = note?.title || '';
  document.getElementById('essay-edit-body').value     = note?.body  || '';
  document.getElementById('essay-edit-category').value = note?.category || essayListCat;
  essayEditBlanks = (note?.blanks || []).map(b => ({ ...b }));
  document.getElementById('btn-essay-delete').classList.toggle('hidden', !note);
  renderEssayEditPreview();
  showScreen('essay-edit');
}

function renderEssayEditPreview() {
  const prev = document.getElementById('essay-edit-preview');
  if (!prev) return;
  const body = document.getElementById('essay-edit-body').value || '';
  prev.innerHTML = renderText(body);

  // 指定済みの範囲を赤マーカーで表示。本文を編集していても実文字列で位置を補正する
  // （ここでは復元できない範囲も **消さない**。入力途中で一時的に一致しないだけの場合があるため、
  //   実際に落とすのは保存時だけ。）
  let shown = 0;
  essayEditBlanks.forEach(b => {
    const a = _anchorHighlight(prev, b);
    if (!a.valid) return;
    b.start = a.start; b.end = a.end;
    _applyHighlightRange(prev, a.start, a.end, b.id, 'essay-blank-edit');
    shown++;
  });

  const countEl = document.getElementById('essay-blank-count');
  if (countEl) {
    const total = essayEditBlanks.length;
    countEl.textContent = shown === total
      ? `${total}件を指定中`
      : `${total}件を指定中（うち${total - shown}件は本文と一致せず未表示）`;
  }
}

/**
 * プレビューの操作を1つの mouseup にまとめる。
 *   ドラッグ（範囲選択あり）→ 隠す範囲を作る（重なり・隣接は1つに融合）
 *   クリック（範囲選択なし）→ その位置の指定済み範囲を解除
 * ⚠️ 作成と解除を mouseup / click に分けると、ドラッグ直後に発火する click が
 *    作ったばかりの範囲を消してしまう。それをフラグで抑えると、click が来ない
 *    操作（範囲外でドラッグを終える等）でフラグが残り、次の正当なクリックが
 *    無視される。両方を mouseup で処理すればこの問題自体が起きない。
 */
function onEssayPreviewMouseUp(e) {
  const prev = document.getElementById('essay-edit-preview');
  if (!prev) return;
  const sel = window.getSelection();

  // クリック（選択なし）＝ 指定済み範囲の解除
  if (!sel || sel.isCollapsed || !sel.rangeCount) {
    const m = e.target.closest?.('mark.essay-blank-edit');
    if (!m) return;
    essayEditBlanks = essayEditBlanks.filter(b => b.id !== m.dataset.hid);
    renderEssayEditPreview();
    return;
  }

  const range = sel.getRangeAt(0);
  const startEl = range.startContainer.nodeType === Node.TEXT_NODE
    ? range.startContainer.parentElement : range.startContainer;
  if (!prev.contains(startEl)) return;

  const start = _getTextOffset(prev, range.startContainer, range.startOffset);
  const end   = _getTextOffset(prev, range.endContainer,   range.endOffset);
  sel.removeAllRanges();
  if (start >= end) return;

  // 重なる／端が接する既存範囲を取り込んで1つにまとめる（マーカーと同じ挙動）
  // ※ 変数名に e は使わない（引数の event と衝突する）
  let ms = start, me = end, merged = true;
  const kept = [];
  while (merged) {
    merged = false;
    essayEditBlanks.forEach(b => {
      if (b._merge) return;
      if (b.start <= me && b.end >= ms) { ms = Math.min(ms, b.start); me = Math.max(me, b.end); b._merge = true; merged = true; }
    });
  }
  essayEditBlanks.forEach(b => { if (!b._merge) kept.push(b); });

  const full = _visibleText(prev);
  ms = Math.max(0, ms); me = Math.min(full.length, me);
  if (ms >= me) { essayEditBlanks.forEach(b => delete b._merge); return; }

  kept.push({ id: crypto.randomUUID(), start: ms, end: me, text: full.slice(ms, me) });
  essayEditBlanks = kept.sort((a, b) => a.start - b.start);
  renderEssayEditPreview();
}

function saveEssayEdit() {
  const title = document.getElementById('essay-edit-title').value.trim();
  const body  = document.getElementById('essay-edit-body').value;
  const cat   = document.getElementById('essay-edit-category').value;
  if (!title)      { alert('タイトルを入力してください。'); return; }
  if (!body.trim()){ alert('本文を入力してください。');     return; }

  // 保存する本文で再アンカーし、復元できない範囲だけ落とす
  const probe = document.createElement('div');
  probe.innerHTML = renderText(body);
  const kept = [];
  let dropped = 0;
  essayEditBlanks.forEach(b => {
    const a = _anchorHighlight(probe, b);
    if (a.valid) kept.push({ id: b.id, start: a.start, end: a.end, text: b.text });
    else dropped++;
  });
  if (dropped > 0 &&
      !confirm(`本文と一致しなくなった隠す範囲が${dropped}件あります。\nこの${dropped}件を削除して保存しますか？`)) return;

  const now = Date.now();
  let note = essayCurrentId ? essayNoteById(essayCurrentId) : null;
  if (note) {
    Object.assign(note, { title, body, category: cat, blanks: kept, updated: now });
  } else {
    note = { id: 'essay_' + now, category: cat, title, body, blanks: kept, created: now, updated: now };
    essayNotes.push(note);
    essayCurrentId = note.id;
  }
  saveEssayNotes();
  essayListCat = cat;
  openEssayPractice(note.id);
  showSyncStatus('💾 保存しました');
}

function deleteEssayNote() {
  const note = essayNoteById(essayCurrentId);
  if (!note) return;
  if (!confirm(`「${note.title}」を削除します。\nこの操作は元に戻せません。よろしいですか？`)) return;
  essayNotes = essayNotes.filter(n => n.id !== note.id);
  saveEssayNotes();
  essayCurrentId = null;
  openEssayList(essayListCat);
}

/** 論述画面のボタン類を登録（DOMContentLoaded から1回だけ呼ぶ） */
function initEssayScreens() {
  document.getElementById('btn-essay-back-home').addEventListener('click', renderHome);
  document.getElementById('btn-essay-add').addEventListener('click', () => openEssayEdit(null));

  document.getElementById('btn-essay-practice-back').addEventListener('click', () => openEssayList(essayListCat));
  document.getElementById('btn-essay-practice-edit').addEventListener('click', () => openEssayEdit(essayCurrentId));
  document.getElementById('btn-essay-reroll').addEventListener('click', () => { rerollEssayHidden(); renderEssayPractice(); });
  document.getElementById('btn-essay-reveal-all').addEventListener('click', () => {
    const marks = document.querySelectorAll('#essay-practice-body mark.essay-blank');
    const allRevealed = marks.length > 0 && [...marks].every(m => m.classList.contains('revealed'));
    marks.forEach(m => m.classList.toggle('revealed', !allRevealed));
    _updateEssayRevealBtn();
  });

  document.getElementById('btn-essay-edit-cancel').addEventListener('click', () => {
    if (essayCurrentId && essayNoteById(essayCurrentId)) openEssayPractice(essayCurrentId);
    else openEssayList(essayListCat);
  });
  document.getElementById('btn-essay-save').addEventListener('click', saveEssayEdit);
  document.getElementById('btn-essay-delete').addEventListener('click', deleteEssayNote);

  document.getElementById('essay-edit-body').addEventListener('input', renderEssayEditPreview);
  // 作成（ドラッグ）も解除（クリック）も mouseup 側で処理する
  document.getElementById('essay-edit-preview').addEventListener('mouseup', onEssayPreviewMouseUp);
}

// ========== Init ==========
document.addEventListener('DOMContentLoaded', async () => { try {
  loadAppSettings();
  loadProgress();
  loadLastUsedFilter();
  loadDrillPresets();
  await loadCalcProblems();
  migrateQuestionHistory();  // 選択肢historyから問題レベルhistoryを生成（初回のみ）
  loadHighlights();
  loadEssayNotes();
  state.bookmarks       = loadBookmarks();
  state.choiceBookmarks = loadChoiceBookmarks();
  loadTagReadings();
  initEssayScreens();
  updateHeaderStats();

  if (!await loadStoredQuestions()) {
    if (window.DEFAULT_QUESTIONS) {
      state.questions = (window.DEFAULT_QUESTIONS.questions || []).map(q =>
        ({ ...q, _setName: 'デフォルト問題' })
      );
      saveQuestions();
    }
  } else {
    // Migrate questions that predate _setName
    let migrated = false;
    state.questions.forEach(q => {
      if (!q._setName) { q._setName = 'デフォルト問題'; migrated = true; }
    });
    if (migrated) saveQuestions();
  }

  // 合成問題id配下に取り残されたマーカーを実問題idへ移す（questions ロード後に実行）
  migrateHighlightsToOwnerQuestion();

  buildFilters();
  renderHome();
  scheduleMidnightReset();
  setTimeout(checkLocalBackupReminder, 2500); // 未接続ユーザーへのバックアップ案内

  // ========== カレンダー日付ホバーツールチップ ==========
  (() => {
    const tip   = document.getElementById('cal-day-tooltip');
    const numEl = tip.querySelector('.ctip-num');
    const TIER_CLASSES = ['tier-copper','tier-silver','tier-gold','tier-platinum','tier-diamond'];

    document.addEventListener('mousemove', e => {
      const day = e.target.closest('.jcal-day[data-tip]');
      if (!day) { tip.classList.add('hidden'); return; }

      const ans   = parseInt(day.dataset.ans) || 0;
      const date  = day.dataset.tip || '';
      const tier  = day.dataset.tier || 'tier-none';

      tip.classList.remove(...TIER_CLASSES);
      if (tier !== 'tier-none') tip.classList.add(tier);
      if (ans <= 0) { tip.classList.add('hidden'); return; }
      numEl.textContent = ans;
      tip.classList.remove('hidden');

      // 画面端対応ポジショニング
      tip.style.left = '0'; tip.style.top = '0';
      const tw = tip.offsetWidth, th = tip.offsetHeight;
      const vw = window.innerWidth, vh = window.innerHeight;
      let lx = e.clientX + 16, ly = e.clientY - 12;
      if (lx + tw > vw - 8) lx = e.clientX - tw - 16;
      if (ly + th > vh - 8) ly = vh - th - 8;
      tip.style.left = lx + 'px';
      tip.style.top  = ly + 'px';
    });

    document.addEventListener('mouseleave', () => tip.classList.add('hidden'));
  })();

  setupQuestionListDelegation();

  // Questions JSON load (file)
  document.getElementById('btn-load-json').addEventListener('click', () => {
    document.getElementById('input-questions-file').click();
  });
  document.getElementById('input-questions-file').addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = await loadQuestionsFromFile(file);
      const setName = data.title || (data.meta && data.meta.title) || file.name.replace(/\.json$/i, '');
      const { added, updated } = mergeQuestions(data, setName);
      alert(`追加: ${added} 問、更新（上書き）: ${updated} 問`);
      if (!document.getElementById('screen-questions')?.classList.contains('hidden')) renderQuestionList();
    } catch (err) { alert(err.message); }
    e.target.value = '';
  });

  // Questions JSON paste (textarea modal)
  const modalPaste = document.getElementById('modal-paste-json');
  const pasteArea  = document.getElementById('paste-json-area');
  const pasteError = document.getElementById('paste-json-error');

  if (modalPaste && pasteArea && pasteError) {
    function openPasteModal() {
      pasteArea.value = '';
      pasteError.textContent = '';
      pasteError.classList.add('hidden');
      modalPaste.classList.remove('hidden');
      setTimeout(() => pasteArea.focus(), 50);
    }
    function closePasteModal() {
      modalPaste.classList.add('hidden');
    }

    const btnPasteJson    = document.getElementById('btn-paste-json');
    const btnPasteClose   = document.getElementById('modal-paste-close');
    const btnPasteCancel  = document.getElementById('btn-paste-cancel');
    const btnPasteSubmit  = document.getElementById('btn-paste-submit');

    if (btnPasteJson)   btnPasteJson.addEventListener('click', openPasteModal);
    if (btnPasteClose)  btnPasteClose.addEventListener('click', closePasteModal);
    if (btnPasteCancel) btnPasteCancel.addEventListener('click', closePasteModal);
    modalPaste.addEventListener('click', e => { if (e.target === modalPaste) closePasteModal(); });

    if (btnPasteSubmit) btnPasteSubmit.addEventListener('click', () => {
      const raw = pasteArea.value.trim();
      if (!raw) {
        pasteError.textContent = 'JSONが入力されていません。';
        pasteError.classList.remove('hidden');
        return;
      }
      let data;
      try {
        data = JSON.parse(raw);
      } catch (err) {
        pasteError.textContent = 'JSONの解析に失敗しました:\n' + err.message;
        pasteError.classList.remove('hidden');
        return;
      }
      if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
        pasteError.textContent = '「questions」配列が見つからないか、空です。JSONの形式を確認してください。';
        pasteError.classList.remove('hidden');
        return;
      }
      const setName = data.title || (data.meta && data.meta.title) || '貼り付けデータ';
      const { added, updated } = mergeQuestions(data, setName);
      closePasteModal();
      alert(`「${setName}」を追加しました。\n追加: ${added} 問、更新（上書き）: ${updated} 問`);
      if (!document.getElementById('screen-questions')?.classList.contains('hidden')) renderQuestionList();
    });
  }

  // ── フィルター 全選択/全解除 ──
  function setAllChips(chipGroupId, activeSet, activate) {
    const group = document.getElementById(chipGroupId);
    if (!group) return;
    group.querySelectorAll('.chip').forEach(chip => {
      if (activate) activeSet.add(chip.textContent);
      else          activeSet.delete(chip.textContent);
      chip.classList.toggle('active', activate);
    });
  }

  document.getElementById('btn-cat-all').addEventListener('click', () => {
    setAllChips('filter-categories', state.activeCategories, true);
    refreshSubFilters(); updateHomeStats();
  });
  document.getElementById('btn-cat-none').addEventListener('click', () => {
    setAllChips('filter-categories', state.activeCategories, false);
    refreshSubFilters(); updateHomeStats();
  });
  document.getElementById('btn-year-all').addEventListener('click', () => {
    setAllChips('filter-years', state.activeYears, true);
  });
  document.getElementById('btn-year-none').addEventListener('click', () => {
    setAllChips('filter-years', state.activeYears, false);
  });
  document.getElementById('btn-sec-all').addEventListener('click', () => {
    setAllChips('filter-sections', state.activeSections, true);
  });
  document.getElementById('btn-sec-none').addEventListener('click', () => {
    setAllChips('filter-sections', state.activeSections, false);
  });

  // ── 保存済み問題 ソートバー ──
  document.querySelectorAll('.btn-sort').forEach(btn => {
    btn.addEventListener('click', () => {
      const prevState = getToggleOpenState('questions-container');
      qlistSortMode = btn.dataset.sort;
      document.querySelectorAll('.btn-sort').forEach(b => b.classList.toggle('active', b === btn));
      renderQuestionList(prevState);
    });
  });

  // ── 学習進捗 ソートバー ──
  document.querySelectorAll('.btn-sort-stats').forEach(btn => {
    btn.addEventListener('click', () => {
      const prevState = getToggleOpenState('stats-container');
      statsSortMode = btn.dataset.sort;
      document.querySelectorAll('.btn-sort-stats').forEach(b => b.classList.toggle('active', b === btn));
      _renderStatsImpl(prevState);
    });
  });

  // ── キーボード操作（出題画面） ──
  document.addEventListener('keydown', e => {
    const screen = document.getElementById('screen-study');
    if (!screen || screen.classList.contains('hidden')) return;
    // インライン編集中は問題移動・選択などのショートカットを一切無効化。
    // ←→はブラウザ既定のキャレット移動になり、編集を抜けるまで問題は動かない。
    if (inlineEditMode) return;
    // モーダルが開いているときは無視
    if (document.querySelector('.modal-overlay:not(.hidden)')) return;
    // input/textarea/contenteditable フォーカス中は無視
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || document.activeElement?.isContentEditable) return;

    const q = state.queue[state.queueIndex];
    if (!q) return;

    // 数字キー 1〜9: 対応する選択肢を選択
    if (/^[1-9]$/.test(e.key)) {
      const idx = parseInt(e.key) - 1;
      if (!q.choices || idx >= q.choices.length) return;
      e.preventDefault();
      if (state.checked) return;
      const choice = q.choices[idx];
      if (isOnePickQuestion(q)) {
        // 1択選択問題・計算問題: その選択肢を選ぶ
        selectCalcAnswer(choice.id);
      } else {
        // 通常問題: ○/✕をトグル
        const current = state.answers[choice.id];
        selectChoiceAnswer(choice.id, current === 'maru' ? 'batsu' : 'maru');
      }
      return;
    }

    // Enterキー: 答え合わせ または 次の問題
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopImmediatePropagation(); // 画面遷移後に result ハンドラが同イベントを拾わないよう伝搬を止める
      const nextArea = document.getElementById('next-area');
      if (nextArea && !nextArea.classList.contains('hidden')) {
        nextQuestion();
      } else {
        const btnCheck = document.getElementById('btn-check');
        if (btnCheck && !btnCheck.disabled) checkAnswers();
      }
      return;
    }

    // Backspace / ← : 前の問題へ戻る（回答前後問わず）
    if (e.key === 'Backspace' || e.key === 'ArrowLeft') {
      e.preventDefault();
      prevStudyQuestion();
      return;
    }

    // → : 次の問題へ（答え合わせ済みのときのみ）
    if (e.key === 'ArrowRight' && state.checked) {
      e.preventDefault();
      nextQuestion();
      return;
    }

    // + キー: ブックマーク登録/解除
    if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      if (q) {
        toggleBookmark(q.id);
        const bmBtn = document.getElementById('btn-bookmark');
        if (bmBtn) {
          const isBm = state.bookmarks.has(q.id);
          bmBtn.textContent = isBm ? '★' : '☆';
          bmBtn.classList.toggle('bookmarked', isBm);
        }
      }
      return;
    }

    // - キー: マーカー表示/非表示トグル
    if (e.key === '-') {
      e.preventDefault();
      markerDisplayOn = !markerDisplayOn;
      _applyHighlights(q);
      applyTempMarkers(q);
      _updateMarkerBtn();
      return;
    }
  });

  // ── 中断・再開 ──
  document.getElementById('btn-interrupt-session').addEventListener('click', interruptSession);
  document.getElementById('btn-resume-session').addEventListener('click', resumeInterruptedSession);

  // ── 新規開始確認モーダル ──
  document.getElementById('btn-start-confirm-yes').addEventListener('click', () => {
    document.getElementById('modal-start-confirm').classList.add('hidden');
    if (pendingStartMode) {
      const { mode, filtered, queue, quickMode, examScoring } = pendingStartMode;
      pendingStartMode = null;
      clearInterruptedSession();
      _startSession(mode, filtered, { queue, quickMode, examScoring });
    }
  });
  document.getElementById('btn-start-confirm-no').addEventListener('click', () => {
    document.getElementById('modal-start-confirm').classList.add('hidden');
    pendingStartMode = null;
  });

  // ── 模試モード ──
  function openExamModal() {
    if (state.questions.length === 0) { alert('問題データがありません。'); return; }
    document.getElementById('exam-step-time').classList.remove('hidden');
    document.getElementById('exam-step-year').classList.add('hidden');
    document.getElementById('modal-exam').classList.remove('hidden');
  }
  function closeExamModal() {
    document.getElementById('modal-exam').classList.add('hidden');
  }
  function showExamYearStep() {
    // 利用可能な年度を収集
    const years = sortYearsDesc([...new Set(state.questions.filter(q => q.year).map(q => q.year))]);
    const list = document.getElementById('exam-year-list');
    list.innerHTML = '';
    years.forEach(year => {
      const qs = state.questions.filter(q => q.year === year);
      const btn = document.createElement('button');
      btn.className = 'top-filter-item';
      btn.innerHTML = `<span>${year}</span><span class="top-filter-item-cnt">${qs.length}問</span>`;
      btn.addEventListener('click', () => {
        closeExamModal();
        startExamMode(qs);
      });
      list.appendChild(btn);
    });
    document.getElementById('exam-step-time').classList.add('hidden');
    document.getElementById('exam-step-year').classList.remove('hidden');
  }

  document.getElementById('btn-start-exam').addEventListener('click', openExamModal);
  document.getElementById('btn-exam-to-year').addEventListener('click', showExamYearStep);
  document.getElementById('btn-exam-back').addEventListener('click', () => {
    document.getElementById('exam-step-year').classList.add('hidden');
    document.getElementById('exam-step-time').classList.remove('hidden');
  });
  document.getElementById('btn-exam-cancel').addEventListener('click', closeExamModal);
  document.getElementById('modal-exam-close').addEventListener('click', closeExamModal);
  document.getElementById('modal-exam').addEventListener('click', e => {
    if (e.target === document.getElementById('modal-exam')) closeExamModal();
  });
  document.getElementById('btn-exam-next').addEventListener('click', examNextQuestion);
  document.getElementById('btn-exam-skip').addEventListener('click', examSkipQuestion);
  document.getElementById('btn-exam-submit-confirm').addEventListener('click', confirmExamSubmission);

  // ── 最近間違えた問題 ──
  const _rwBtn = document.getElementById('btn-start-recent-wrong');
  if (_rwBtn) _rwBtn.addEventListener('click', openRecentWrongModal);
  document.getElementById('rw-modal-close')?.addEventListener('click', closeRecentWrongModal);
  document.getElementById('modal-recent-wrong')?.addEventListener('click', e => {
    if (e.target.id === 'modal-recent-wrong') closeRecentWrongModal();
  });

  // ── ブックマーク ──
  const bookmarkPopup = document.getElementById('bookmark-start-popup');
  document.getElementById('btn-start-bookmark').addEventListener('click', e => {
    e.stopPropagation();
    const bqs    = state.questions.filter(q => state.bookmarks.has(q.id));
    const cItems = bookmarkedChoiceItems();
    if (bqs.length === 0 && cItems.length === 0) {
      alert('ブックマークした問題・選択肢がありません。\n出題画面の ☆ ボタンで登録できます。');
      return;
    }
    // ポップアップを構築（☆問題／☆選択肢＋分野で絞り込む多階層ナビ）
    bookmarkPopup.innerHTML = '';
    const addLabel = text => {
      const l = document.createElement('div');
      l.className = 'bookmark-popup-label';
      l.textContent = text;
      bookmarkPopup.appendChild(l);
    };
    // keepOpen=true のボタンはポップアップを閉じず、次の階層を描画するナビ用
    const addBtn = (label, onClick, keepOpen = false) => {
      const btn = document.createElement('button');
      btn.className = 'top-filter-start-mode-btn';
      btn.textContent = label;
      btn.addEventListener('click', ev => {
        ev.stopPropagation();                       // 外側クリック閉じ処理を発火させない
        if (!keepOpen) bookmarkPopup.classList.add('hidden');
        onClick();
      });
      bookmarkPopup.appendChild(btn);
    };
    const shuffleArr = arr => {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };

    // ①☆問題＝通常出題のみ／②☆選択肢＝壁打ちのみ。両者を明確に分離する。
    //   - 「通常出題」は①☆を付けた問題のみ（全選択肢に○×）
    //   - 「壁打ち」は②☆を付けた選択肢のみ（同問題の非ブクマ選択肢は出さない）
    // 出題開始ヘルパ（分野で絞り込んだ集合をそのまま渡せる）
    const startBookmarkNormal = questions => _startSession('sequential', questions);
    const startBookmarkDrill  = items => startDrillWithQueue(shuffleArr(items.map(it => ({ ...it }))), 'bookmark');

    // 分野ごとにブックマークを集計。q.category を5分野
    //（法令／ガス技術：製造／ガス技術：供給／ガス技術：消費機器／基礎）に正規化して分類する。
    const NO_SEC = '（分野なし）';
    const catOf = q => {
      const c = displayCategoryName(q.category || '');   // 「ガス技術：消費」→「消費機器」に寄せる
      if (!c) return NO_SEC;
      if (c === '法令' || c === '基礎') return c;
      if (c.includes('製造')) return 'ガス技術：製造';
      if (c.includes('供給')) return 'ガス技術：供給';
      if (c.includes('消費')) return 'ガス技術：消費機器';
      return c;
    };
    const secMap = new Map(); // 分野名 -> { qs:[☆問題], items:[☆選択肢] }
    const ensureSec = sec => { if (!secMap.has(sec)) secMap.set(sec, { qs: [], items: [] }); return secMap.get(sec); };
    bqs.forEach(q => ensureSec(catOf(q)).qs.push(q));
    cItems.forEach(it => ensureSec(catOf(it.question)).items.push(it));
    // 分野の並びは CATEGORY_ORDER（sortCategories）。未設定は末尾。
    const secNames = sortCategories([...secMap.keys()].filter(s => s !== NO_SEC));
    if (secMap.has(NO_SEC)) secNames.push(NO_SEC);

    // メイン画面：全分野まとめての出題ボタン＋（分野が複数あれば）分野別の絞り込み
    const renderMain = () => {
      bookmarkPopup.innerHTML = '';
      addLabel('ブックマーク出題');
      if (bqs.length > 0) {
        addBtn(`📄 通常出題（☆問題 ${bqs.length}問）`, () => startBookmarkNormal(bqs));
      }
      if (cItems.length > 0) {
        addBtn(`🥊 壁打ち（☆選択肢 ${cItems.length}個）`, () => startBookmarkDrill(cItems));
      }
      if (secNames.length >= 2) {
        addLabel('📂 分野で絞り込む');
        secNames.forEach(sec => {
          const { qs, items } = secMap.get(sec);
          const parts = [];
          if (qs.length)    parts.push(`☆問題${qs.length}`);
          if (items.length) parts.push(`☆選択肢${items.length}`);
          addBtn(`${sec}（${parts.join(' / ')}）`, () => renderSection(sec), true);
        });
      }
    };
    // 分野サブ画面：戻る＋その分野に絞った通常出題／壁打ち
    const renderSection = sec => {
      const { qs, items } = secMap.get(sec);
      bookmarkPopup.innerHTML = '';
      addBtn('◀ 分野一覧に戻る', () => renderMain(), true);
      addLabel(`📂 ${sec}`);
      if (qs.length > 0) {
        addBtn(`📄 通常出題（☆問題 ${qs.length}問）`, () => startBookmarkNormal(qs));
      }
      if (items.length > 0) {
        addBtn(`🥊 壁打ち（☆選択肢 ${items.length}個）`, () => startBookmarkDrill(items));
      }
    };

    renderMain();
    bookmarkPopup.classList.remove('hidden');
    // クリック外で閉じる
    setTimeout(() => {
      document.addEventListener('click', function closeBookmarkPopup() {
        bookmarkPopup.classList.add('hidden');
        document.removeEventListener('click', closeBookmarkPopup);
      }, { once: true });
    }, 0);
  });
  document.getElementById('btn-bookmark').addEventListener('click', () => {
    const q = state.queue[state.queueIndex];
    if (!q) return;
    toggleBookmark(q.id);
    const bmed = state.bookmarks.has(q.id);
    const btn  = document.getElementById('btn-bookmark');
    btn.textContent = bmed ? '★' : '☆';
    btn.classList.toggle('bookmarked', bmed);
  });

  // ── マーカートグル ──
  document.getElementById('btn-marker-toggle').addEventListener('click', () => {
    markerDisplayOn = !markerDisplayOn;
    const q = state.queueIndex < state.queue.length ? state.queue[state.queueIndex] : null;
    _applyHighlights(q);
    applyTempMarkers(q);
    _updateMarkerBtn();
  });

  // ── 選択肢テキスト・解説のドラッグでマーカー作成（答え合わせ後のみ）──
  // 選択肢テキスト → 黄色マーカー、解説テキスト → 赤文字マーカー
  // 作成は markerDisplayOn の状態に依存しない（マーカー表示OFFでもドラッグで作成可。
  // 作成時に表示をONにするので、「－」でOFFにした後でも追加マーカーを引ける）
  document.addEventListener('mouseup', e => {
    if (inlineEditMode) return;   // インライン編集中はドラッグでのマーカー作成を停止
    // ダブルクリック（＝マーカー削除の操作）は 2回目の click で単語が自動選択され、
    // mouseup → dblclick の順に発火する。この mouseup をマーカー作成として拾うと
    // 融合で id が振り直され、直後の dblclick が **古い id** を消しに行って何も消えない。
    // ＝「ダブルクリックで赤太文字が解除できない」バグになるので、ここで捨てる。
    if (e.detail >= 2) return;

    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    if (range.collapsed) return;

    const startEl = range.startContainer.nodeType === Node.TEXT_NODE
      ? range.startContainer.parentElement
      : range.startContainer;
    // ※以前は「開始点が既存マーカー内ならスキップ」していたが、それだと半分マークした後に
    //   先頭が赤マーク内に入り、全体を選び直しても広げられなくなる。重なりは下で融合するので撤廃。

    // どちらの画面でドラッグしたかは **DOMの所属で判定** する。
    // state.drillAnswered 等のフラグはセッションをまたいで残ることがあり
    // （通常セッション開始時にリセットされない経路がある）、それを信じると
    // 学習画面のドラッグを壁打ち扱いして「前のセッションの問題」にマーカーを
    // 保存してしまい、赤太文字が付かない＝機能しないように見えるバグになる。
    // 解説の .choice-explanation は学習・壁打ちで共用クラスなので特に重要。
    const inDrill = !!startEl.closest('#screen-drill');
    const inStudy = !inDrill && !!startEl.closest('#choices-list');
    if (!inDrill && !inStudy) return;
    // 作成できるのは答え合わせ後のみ
    if (inDrill ? !state.drillAnswered : !state.checked) return;

    // 壁打ちモード：drill-choice-text（選択肢）または choice-explanation（解説）
    const drillTextEl  = inDrill ? startEl.closest('.drill-choice-text') : null;
    // 通常モード
    const choiceTextEl = inStudy ? startEl.closest('.choice-item-text') : null;
    const choiceExpEl  = startEl.closest('.choice-explanation');

    const targetEl = drillTextEl || choiceTextEl || choiceExpEl;
    if (!targetEl) return;

    let area, choiceId, q;
    if (drillTextEl) {
      // 壁打ち：選択肢テキスト
      area = 'choice';
      const di = state.drillQueue?.[state.drillIndex];
      if (!di) return;
      q = di.question; choiceId = di.choice.id;
    } else if (choiceTextEl) {
      area = 'choice';
      const ci = targetEl.closest('[data-cid]');
      if (!ci) return;
      choiceId = ci.dataset.cid; q = state.queue[state.queueIndex];
    } else {
      // 解説（通常 or 壁打ち共通クラス）
      area = 'explanation';
      if (inDrill) {
        const di = state.drillQueue?.[state.drillIndex];
        if (!di) return;
        q = di.question; choiceId = di.choice.id;
      } else {
        const ci = targetEl.closest('[data-cid]');
        if (!ci) return;
        choiceId = ci.dataset.cid; q = state.queue[state.queueIndex];
      }
    }
    if (!q) return;

    const start = _getTextOffset(targetEl, range.startContainer, range.startOffset);
    const end   = _getTextOffset(targetEl, range.endContainer,   range.endOffset);
    if (start >= end) { sel.removeAllRanges(); return; }

    sel.removeAllRanges();
    // 保存先は表示中の問題ではなく **その選択肢を持つ実問題** のバケット。
    // 合成問題（キーワード出題・出題ジェネレータ）で付けたマーカーも
    // 通常出題／壁打ちの双方から見えるようにするため。
    const hkey = hlKey(choiceId, q.id);
    if (!highlightsData[hkey]) highlightsData[hkey] = [];

    // 同じ選択肢・同じ領域(area)の既存マーカーのうち、今回の範囲と重なる／隣接するものは
    // 1つに融合(union)する。これにより「半分マーク→全体を選び直し」で赤太文字が全体に広がる。
    // （重なりを無視して破棄していた旧仕様が「半分までしか塗れない」原因だった）
    // ただし範囲外（現在のテキスト長を超える）マーカーは融合対象にしない。取り込むと
    // 融合結果まで範囲外になり、描画されない＝ドラッグしても赤くならない状態になるため。
    const fullLen  = _visibleText(targetEl).length;
    const inBounds = h => h.start >= 0 && h.end <= fullLen && h.start < h.end;
    const sameTarget = h => h.choiceId === choiceId && (h.area || 'choice') === area && inBounds(h);

    const redraw = () => {
      if (inDrill) {
        _applyDrillHighlights(q, state.drillQueue[state.drillIndex].choice);
        _updateDrillMarkerBtn(q, state.drillQueue[state.drillIndex].choice);
      } else {
        _applyHighlights(q);
        applyTempMarkers(q);
        _updateMarkerBtn();
      }
    };

    // 既存マーカーの **内側だけ** をなぞった場合は「解除」（＝ドラッグでのトグルOFF）。
    // はみ出して選んだ場合は下の融合処理で拡張になるので、
    // 「半分マーク→全体を選び直して広げる」は今まで通り動く。
    const enclosing = highlightsData[hkey].find(h => sameTarget(h) && h.start <= start && h.end >= end);
    if (enclosing) {
      _hlRemoveEntries([{ key: hkey, h: enclosing }]);
      saveHighlights();
      redraw();
      return;
    }

    let mStart = start, mEnd = end, changed = true;
    while (changed) {
      changed = false;
      for (const h of highlightsData[hkey]) {
        if (h._merge || !sameTarget(h)) continue;
        if (h.start <= mEnd && h.end >= mStart) {   // 重なり or 端が接する
          mStart = Math.min(mStart, h.start);
          mEnd   = Math.max(mEnd,   h.end);
          h._merge = true;
          changed = true;
        }
      }
    }
    mStart = Math.max(0, mStart);
    mEnd   = Math.min(fullLen, mEnd);
    if (mStart >= mEnd) return;
    // 融合対象にしなかった範囲外マーカーはここで一緒に捨てる（残しても描画・削除ができない）
    const kept = highlightsData[hkey].filter(h => {
      if (h._merge) return false;
      if (h.choiceId === choiceId && (h.area || 'choice') === area && !inBounds(h)) return false;
      return true;
    });
    // マークした実文字列も保存（表示時に再アンカーしてズレを防ぐ）
    const text = _visibleText(targetEl).slice(mStart, mEnd);
    kept.push({ id: crypto.randomUUID(), choiceId, area, start: mStart, end: mEnd, text });
    highlightsData[hkey] = kept;
    markerDisplayOn = true;   // 作成したマーカー（黄色含む）が必ず見えるよう表示ON
    saveHighlights();
    redraw();
  });

  // ── マーカーのダブルクリックで削除 ──
  document.addEventListener('dblclick', e => {
    if (inlineEditMode) return;   // インライン編集中はマーカー操作を停止
    const mark = e.target.closest('mark.q-highlight, mark.q-highlight-red');
    if (!mark) return;
    if (!markerDisplayOn && mark.classList.contains('q-highlight')) return;
    e.preventDefault();
    // 作成側と同じく、フラグではなく mark の所属画面で判定する
    // （フラグを信じると別セッションの問題からマーカーを消してしまう）
    const inDrill = !!mark.closest('#screen-drill') && !!state.drillQueue?.[state.drillIndex];
    const q = inDrill ? state.drillQueue[state.drillIndex].question : state.queue[state.queueIndex];
    if (!q) return;
    const hid = mark.dataset.hid;
    if (!hid) return;
    // 保存先は実問題のバケットなので、削除も選択肢から引いたキーで行う
    const choiceId = inDrill
      ? state.drillQueue[state.drillIndex].choice.id
      : mark.closest('[data-cid]')?.dataset.cid;
    const dkey = hlKey(choiceId, q.id);
    if (highlightsData[dkey]) {
      highlightsData[dkey] = highlightsData[dkey].filter(h => h.id !== hid);
      if (highlightsData[dkey].length === 0) delete highlightsData[dkey];
    }
    saveHighlights();
    if (inDrill) {
      _applyDrillHighlights(q, state.drillQueue[state.drillIndex].choice);
      _updateDrillMarkerBtn(q, state.drillQueue[state.drillIndex].choice);
    } else {
      _applyHighlights(q);
      applyTempMarkers(q);
      _updateMarkerBtn();
    }
  });

  // ── 一時マーカー（薄黄緑）：答え合わせ前のドラッグで問題文・選択肢文に引く（保存しない）──
  document.addEventListener('mouseup', e => {
    const studyScreen = document.getElementById('screen-study');
    if (!studyScreen || studyScreen.classList.contains('hidden')) return;
    if (state.checked) return;  // 答え合わせ後は保存マーカー側が担当
    const q = state.queue[state.queueIndex];
    if (!q) return;

    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    if (range.collapsed) return;

    const startEl = range.startContainer.nodeType === Node.TEXT_NODE
      ? range.startContainer.parentElement : range.startContainer;
    if (startEl.closest('mark.temp-hl')) { sel.removeAllRanges(); return; } // 既存内で開始はスキップ

    let area, choiceId = null, root;
    const choiceTextEl = startEl.closest('#choices-list .choice-item-text');
    const qBlocksEl    = startEl.closest('#question-blocks');
    if (choiceTextEl) {
      const ci = choiceTextEl.closest('[data-cid]');
      if (!ci) return;
      area = 'c'; choiceId = ci.dataset.cid; root = choiceTextEl;
    } else if (qBlocksEl) {
      area = 'q'; root = qBlocksEl;
    } else return;

    const start = _getTextOffset(root, range.startContainer, range.startOffset);
    const end   = _getTextOffset(root, range.endContainer,   range.endOffset);
    if (start >= end) { sel.removeAllRanges(); return; }

    const arr = tempMarkers[q.id] || (tempMarkers[q.id] = []);
    // 重なる既存マーカーがあれば消す（再度範囲指定で消える＝トグル）
    const overlap = arr.filter(h => h.area === area && (h.choiceId || null) === choiceId && h.start < end && h.end > start);
    sel.removeAllRanges();
    if (overlap.length > 0) {
      tempMarkers[q.id] = arr.filter(h => !overlap.includes(h));
    } else {
      const text = _visibleText(root).slice(start, end);
      arr.push({ id: crypto.randomUUID(), area, choiceId, start, end, text });
    }
    applyTempMarkers(q);
  });

  // ── 一時マーカーのダブルクリック削除 ──
  document.addEventListener('dblclick', e => {
    const mark = e.target.closest('mark.temp-hl');
    if (!mark) return;
    const studyScreen = document.getElementById('screen-study');
    if (!studyScreen || studyScreen.classList.contains('hidden')) return;
    const q = state.queue[state.queueIndex];
    if (!q) return;
    const hid = mark.dataset.hid;
    if (tempMarkers[q.id]) {
      tempMarkers[q.id] = tempMarkers[q.id].filter(h => h.id !== hid);
      if (tempMarkers[q.id].length === 0) delete tempMarkers[q.id];
    }
    applyTempMarkers(q);
  });

  // ── ヘッダーポップアップ ──
  const HD_POPUPS = ['calendar', 'weakness', 'settings', 'data'];
  function closeAllHdPopups() {
    HD_POPUPS.forEach(id => {
      document.getElementById('hd-popup-' + id).classList.add('hidden');
      document.getElementById('btn-hd-' + id).classList.remove('active');
    });
    document.getElementById('hd-popup-backdrop').classList.add('hidden');
  }
  function toggleHdPopup(id, onOpen) {
    const popup = document.getElementById('hd-popup-' + id);
    const btn   = document.getElementById('btn-hd-' + id);
    const isOpen = !popup.classList.contains('hidden');
    closeAllHdPopups();
    if (!isOpen) {
      popup.classList.remove('hidden');
      btn.classList.add('active');
      document.getElementById('hd-popup-backdrop').classList.remove('hidden');
      if (onOpen) onOpen();
    }
  }
  // ヘッダー高さをCSS変数にセット
  const hdrEl = document.querySelector('.app-header');
  document.documentElement.style.setProperty('--hd-height', hdrEl.offsetHeight + 'px');

  document.getElementById('btn-hd-calendar').addEventListener('click', () =>
    toggleHdPopup('calendar', renderCalendar));
  document.getElementById('btn-hd-weakness').addEventListener('click', () =>
    toggleHdPopup('weakness', renderWeaknessReport));
  document.getElementById('btn-hd-settings').addEventListener('click', () =>
    toggleHdPopup('settings'));
  document.getElementById('btn-hd-data').addEventListener('click', () =>
    toggleHdPopup('data'));
  document.getElementById('hd-popup-backdrop').addEventListener('click', closeAllHdPopups);

  // ランダム問題数ボタンは削除済み（フィルター出題開始で代替）

  // ── 壁打ち設定モーダル ──
  // 連続正解を除外（3/4/5、同じものを再クリックで解除）
  document.querySelectorAll('#drill-exstreak-btns .tfx-btn').forEach(b => {
    b.addEventListener('click', () => {
      const n = parseInt(b.dataset.streak);
      drillSetupExcludeStreak = (drillSetupExcludeStreak === n) ? 0 : n;
      setDrillExStreakBtns();
    });
  });
  document.getElementById('drill-setup-prioritize-new').addEventListener('change', e => {
    drillSetupPrioritizeNew = e.target.checked;
  });
  document.getElementById('btn-drill-preset-action').addEventListener('click', () => {
    const slot = parseInt(document.querySelector('input[name="drill-preset-slot"]:checked')?.value ?? '0');
    if (drillPresetActiveSlot !== null && drillPresetActiveSlot === slot) {
      releaseDrillPreset(slot);
    } else {
      registerDrillPreset(slot);
    }
  });
  document.querySelectorAll('input[name="drill-preset-slot"]').forEach(radio => {
    radio.addEventListener('change', () => {
      if (drillPresetActiveSlot !== null) {
        // アクティブなプリセットがある場合はフィルターごとリセット
        drillPresetActiveSlot = null;
        drillSetupCats.clear();
        drillSetupYears.clear();
        drillSetupSections.clear();
        drillSetupExcludeStreak = 0;
        drillSetupPrioritizeNew = false;
        setDrillExStreakBtns();
        const newChk = document.getElementById('drill-setup-prioritize-new');
        if (newChk) newChk.checked = false;
        renderDrillSetupFilters();
      } else {
        renderDrillPresetArea();
      }
    });
  });
  document.getElementById('btn-drill-to-count').addEventListener('click', showDrillCountStep);
  document.getElementById('btn-drill-back-filter').addEventListener('click', () => {
    document.getElementById('drill-setup-step2').classList.add('hidden');
    document.getElementById('drill-setup-step1').classList.remove('hidden');
  });
  document.getElementById('btn-drill-start-now').addEventListener('click', startDrillFromSetup);
  document.querySelectorAll('#drill-setup-limit-btns .q-limit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#drill-setup-limit-btns .q-limit-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      drillSetupLimit = btn.dataset.limit ? parseInt(btn.dataset.limit) : null;
    });
  });

  // 壁打ち問題数ボタンはモーダル内のみ（drill-limit-btnsは削除済み）

  // ── メモ 折りたたみ ──
  document.getElementById('memo-toggle').addEventListener('click', () => {
    const body = document.getElementById('memo-body');
    const icon = document.getElementById('memo-toggle-icon');
    const isOpen = !body.classList.contains('hidden');
    body.classList.toggle('hidden', isOpen);
    icon.textContent = isOpen ? '▶' : '▼';
    if (!isOpen) document.getElementById('memo-input')?.focus();
  });
  document.getElementById('memo-input').addEventListener('input', e => {
    onMemoInput(e.target.dataset.qid, e.target.value);
  });


  // Study modes（ランダム/出題順/苦手優先はフィルター出題開始ポップアップから）

  // Drill mode
  document.getElementById('btn-start-drill-all').addEventListener('click',  e => openDrillSetupModal('all',  e.currentTarget));
  document.getElementById('btn-start-drill-weak').addEventListener('click', e => openDrillSetupModal('weak', e.currentTarget));
  document.getElementById('btn-start-quick50')?.addEventListener('click', startRandomFifty);
  // ── 出題ジェネレータ ──
  document.getElementById('btn-exam-generator')?.addEventListener('click', openExamGenerator);
  document.getElementById('eg-close')?.addEventListener('click', closeExamGenerator);
  document.getElementById('eg-close2')?.addEventListener('click', closeExamGenerator);
  document.getElementById('eg-generate')?.addEventListener('click', startExamGenerator);
  document.getElementById('modal-exam-generator')?.addEventListener('click', e => {
    if (e.target.id === 'modal-exam-generator') closeExamGenerator();
  });
  document.getElementById('btn-start-drill-search').addEventListener('click', e => {
    e.stopPropagation();
    openKeywordModePopup(document.getElementById('drill-search-input').value);
  });
  document.getElementById('drill-search-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') openKeywordModePopup(e.target.value);
  });
  document.getElementById('btn-drill-maru').addEventListener('click',  () => answerDrill(true));
  document.getElementById('btn-drill-batsu').addEventListener('click', () => answerDrill(false));
  document.getElementById('btn-drill-next').addEventListener('click',  nextDrill);
  document.getElementById('btn-drill-marker-toggle').addEventListener('click', () => {
    markerDisplayOn = !markerDisplayOn;
    const di = state.drillQueue[state.drillIndex];
    if (!di) return;
    _applyDrillHighlights(di.question, di.choice);
    _updateDrillMarkerBtn(di.question, di.choice);
  });

  // 壁打ち：タグ追加
  const _drillAddTag = () => {
    const input   = document.getElementById('drill-tag-input');
    const readEl  = document.getElementById('drill-tag-reading-input');
    const val     = (input?.value || '').trim().replace(/^#+/, '');
    const reading = (readEl?.value || '').trim();
    if (!val) return;
    // よみが入力されていれば、タグの読みを登録（既存タグへの読み追記もできる）
    if (reading) setTagReading(val, reading);
    const di = state.drillQueue?.[state.drillIndex];
    if (!di) return;
    const qIdx = state.questions.findIndex(x => x.id === di.question.id);
    if (qIdx === -1) return;
    const c   = di.choice;
    const cur = c.tags || [];
    if (cur.includes(val)) { input.value = ''; if (readEl) readEl.value = ''; renderDrillTagSection(di.question, c); return; }
    const updatedQ = { ...state.questions[qIdx] };
    updatedQ.choices = updatedQ.choices.map(ch =>
      ch.id === c.id ? { ...ch, tags: [...cur, val] } : ch
    );
    state.questions[qIdx] = updatedQ;
    di.question = updatedQ;
    di.choice   = updatedQ.choices.find(ch => ch.id === c.id) || di.choice;
    saveQuestions();
    renderDrillTagSection(updatedQ, di.choice);
    input.value = '';
    if (readEl) readEl.value = '';
    input.focus();
  };
  document.getElementById('btn-drill-add-tag').addEventListener('click', _drillAddTag);
  document.getElementById('drill-tag-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); _drillAddTag(); }
  });

  // 壁打ち：除外トグル
  document.getElementById('btn-drill-exclude').addEventListener('click', () => {
    const di = state.drillQueue?.[state.drillIndex];
    if (!di) return;
    const qIdx = state.questions.findIndex(x => x.id === di.question.id);
    if (qIdx === -1) return;
    const updatedQ = { ...state.questions[qIdx] };
    if (updatedQ.drillExcluded) {
      delete updatedQ.drillExcluded;
    } else {
      updatedQ.drillExcluded = true;
    }
    state.questions[qIdx] = updatedQ;
    di.question = updatedQ;
    saveQuestions();
    const btn = document.getElementById('btn-drill-exclude');
    btn.classList.toggle('excluded', !!updatedQ.drillExcluded);
    btn.title = updatedQ.drillExcluded ? '壁打ちから除外中（クリックで解除）' : '壁打ちから除外';
    // スキップボタンの表示を即時反映
    const skipBtn = document.getElementById('btn-drill-skip');
    if (skipBtn && !state.drillAnswered) {
      skipBtn.classList.toggle('hidden', !updatedQ.drillExcluded && state.drillMode !== 'keyword-search');
    }
  });

  // 壁打ち：ブックマーク
  document.getElementById('btn-drill-bookmark').addEventListener('click', () => {
    const di = state.drillQueue?.[state.drillIndex];
    if (!di || !di.choice?.id) return;
    toggleChoiceBookmark(di.choice.id);   // 壁打ちは「選択肢単位」でブックマーク
    const isBm = state.choiceBookmarks.has(di.choice.id);
    const btn = document.getElementById('btn-drill-bookmark');
    btn.textContent = isBm ? '★' : '☆';
    btn.classList.toggle('bookmarked', isBm);
  });

  // 壁打ち：計算問題チェックボックス
  document.getElementById('drill-calc-mode-check').addEventListener('change', e => {
    const di = state.drillQueue?.[state.drillIndex];
    if (!di) return;
    const qIdx = state.questions.findIndex(x => x.id === di.question.id);
    if (qIdx === -1) return;
    const updatedQ = { ...state.questions[qIdx] };
    if (e.target.checked) {
      updatedQ.questionType = 'calculation';
      const sc = document.getElementById('drill-single-select-check');
      if (sc) sc.checked = false;
    } else {
      if (updatedQ.questionType === 'calculation') delete updatedQ.questionType;
    }
    state.questions[qIdx] = updatedQ;
    di.question = updatedQ;
    saveQuestions();
  });

  // 壁打ち：1択選択問題チェックボックス
  document.getElementById('drill-single-select-check').addEventListener('change', e => {
    const di = state.drillQueue?.[state.drillIndex];
    if (!di) return;
    const qIdx = state.questions.findIndex(x => x.id === di.question.id);
    if (qIdx === -1) return;
    const updatedQ = { ...state.questions[qIdx] };
    if (e.target.checked) {
      updatedQ.questionType = 'single_select';
      const cc = document.getElementById('drill-calc-mode-check');
      if (cc) cc.checked = false;
    } else {
      if (updatedQ.questionType === 'single_select') delete updatedQ.questionType;
    }
    state.questions[qIdx] = updatedQ;
    di.question = updatedQ;
    saveQuestions();
  });
  document.getElementById('btn-drill-skip').addEventListener('click',  skipDrill);

  // ── 壁打ちキーボード操作 ──
  document.addEventListener('keydown', e => {
    if (document.getElementById('screen-drill').classList.contains('hidden')) return;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
    switch (e.key) {
      case '1':          answerDrill(true);  break;
      case '2':          answerDrill(false); break;
      case 'Enter':
      case 'ArrowRight':
        e.preventDefault();
        e.stopImmediatePropagation(); // 画面遷移後に result ハンドラが同イベントを拾わないよう伝搬を止める
        if (state.drillAnswered) nextDrill(); else skipDrill();
        break;
      case 'Backspace':
      case 'ArrowLeft':
        e.preventDefault();
        prevDrill();
        break;
      case '+':
      case '=': {
        e.preventDefault();
        const item = state.drillQueue[state.drillIndex];
        if (item?.choice?.id) {
          toggleChoiceBookmark(item.choice.id);   // 壁打ちは「選択肢単位」でブックマーク
          const isBm = state.choiceBookmarks.has(item.choice.id);
          const bmBtn = document.getElementById('btn-drill-bookmark');
          if (bmBtn) { bmBtn.textContent = isBm ? '★' : '☆'; bmBtn.classList.toggle('bookmarked', isBm); }
        }
        break;
      }
      case '-': {
        // マーカー表示/非表示トグル（答え合わせ前でも可・通常モードと同じ）
        e.preventDefault();
        markerDisplayOn = !markerDisplayOn;
        const di = state.drillQueue[state.drillIndex];
        if (di) {
          _applyDrillHighlights(di.question, di.choice);
          _updateDrillMarkerBtn(di.question, di.choice);
        }
        break;
      }
    }
  });
  document.getElementById('btn-edit-drill-choice').addEventListener('click', () => {
    const item = state.drillQueue[state.drillIndex];
    if (item) openEditModal(item.question.id, item.choiceIndex);
  });
  document.getElementById('btn-report-drill-q').addEventListener('click', () => {
    const item = state.drillQueue[state.drillIndex];
    if (!item) return;
    const btn = document.getElementById('btn-report-drill-q');
    if (addToPendingVerify(item.question)) {
      const orig = btn.textContent;
      btn.textContent = '✅ 追加済み';
      setTimeout(() => { btn.textContent = orig; }, 2500);
    } else {
      const orig = btn.textContent;
      btn.textContent = '⚠️ 報告済み';
      setTimeout(() => { btn.textContent = orig; }, 2500);
    }
  });
  document.getElementById('btn-verify-ai-drill').addEventListener('click', () => {
    const item = state.drillQueue[state.drillIndex];
    if (item) openVerifyOnClaude(item.question, item.choice);
  });
  document.getElementById('btn-end-drill').addEventListener('click',   endDrillSession);

  // 壁打ち：答え合わせ後にボタン以外をタップで次の選択肢へ（スクロール時は無効）
  let _drillTouchStartY = 0;
  let _drillTouchScrolled = false;
  const _drillScreen = document.getElementById('screen-drill');
  _drillScreen.addEventListener('touchstart', e => {
    _drillTouchStartY   = e.touches[0].clientY;
    _drillTouchScrolled = false;
  }, { passive: true });
  _drillScreen.addEventListener('touchmove', e => {
    if (Math.abs(e.touches[0].clientY - _drillTouchStartY) > 8) _drillTouchScrolled = true;
  }, { passive: true });
  _drillScreen.addEventListener('touchend', e => {
    if (!state.drillAnswered || _drillTouchScrolled) return;
    // 学習画面と同じく、マーカー上のタップは次へ送りの対象外（ダブルタップ削除を可能にする）
    const INTERACTIVE = 'button, a, input, select, textarea, label, [role="button"], mark.q-highlight, mark.q-highlight-red, mark.temp-hl';
    if (e.target.closest(INTERACTIVE)) return;
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.getElementById('btn-drill-next').click();
  }, { passive: false });

  // 答え合わせ後にボタン以外をタップで次の問題へ（スクロール時は無効）
  let _studyTouchStartY = 0;
  let _studyTouchScrolled = false;
  const _studyScreen = document.getElementById('screen-study');
  _studyScreen.addEventListener('touchstart', e => {
    _studyTouchStartY   = e.touches[0].clientY;
    _studyTouchScrolled = false;
  }, { passive: true });
  _studyScreen.addEventListener('touchmove', e => {
    if (Math.abs(e.touches[0].clientY - _studyTouchStartY) > 8) _studyTouchScrolled = true;
  }, { passive: true });
  _studyScreen.addEventListener('touchend', e => {
    if (inlineEditMode) return;   // 編集中はタップ＝キャレット移動なので「次へ」を発火させない
    if (!state.checked || _studyTouchScrolled) return;
    // mark（マーカー）を除外しないと、1タップ目で「次へ」が発動してダブルタップ削除が
    // 原理的にできなくなる。マーカー上のタップは次へ送りの対象外にする。
    const INTERACTIVE = 'button, a, input, select, textarea, label, [role="button"], [contenteditable="true"], mark.q-highlight, mark.q-highlight-red, mark.temp-hl';
    if (e.target.closest(INTERACTIVE)) return;
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'instant' });
    nextQuestion();
  }, { passive: false });

  // 答え合わせ前：選択肢カード本体のタップで ○⇔× をトグル（PCの数字キーと同じ挙動）
  // ○×ボタン・ブックマーク等のインタラクティブ要素・画像リサイズハンドルのタップは対象外
  _studyScreen.addEventListener('touchend', e => {
    if (state.checked || _studyTouchScrolled) return;
    const INTERACTIVE = 'button, a, input, select, textarea, label, [role="button"], .choice-img-resize-handle';
    if (e.target.closest(INTERACTIVE)) return;
    const item = e.target.closest('.choice-item');
    if (!item || !item.dataset.cid) return;
    const q = state.queue[state.queueIndex];
    if (!q || isOnePickQuestion(q)) return; // 1択・計算問題は選択肢タップ=そのまま選択なので除外
    e.preventDefault();
    const current = state.answers[item.dataset.cid];
    selectChoiceAnswer(item.dataset.cid, current === 'maru' ? 'batsu' : 'maru');
  }, { passive: false });

  // Study actions
  document.getElementById('btn-check').addEventListener('click', checkAnswers);
  document.getElementById('btn-next').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    nextQuestion();
  });
  document.getElementById('btn-end-session').addEventListener('click', showSessionResult);
  document.getElementById('btn-study-prev').addEventListener('click', prevStudyQuestion);
  document.getElementById('btn-study-next').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    nextQuestion();
  });

  // Study screen — この問題を修正 / 問題を報告 / AIで検証
  document.getElementById('btn-edit-study-q').addEventListener('click', () => {
    toggleInlineEdit();   // 答え合わせ画面でその場編集をON/OFF
  });
  document.getElementById('btn-cancel-inline-edit')?.addEventListener('click', () => {
    exitInlineEdit(false);  // 保存せず破棄
  });
  document.getElementById('btn-detail-edit-study-q')?.addEventListener('click', () => {
    const q = state.queue[state.queueIndex];
    if (q) openEditModal(q.id);   // 従来の詳細編集モーダル
  });
  document.getElementById('btn-clear-marks-study')?.addEventListener('click', clearMarksForCurrentQuestion);
  document.getElementById('btn-clear-marks-drill')?.addEventListener('click', clearMarksForCurrentDrillChoice);
  document.getElementById('btn-report-study-q').addEventListener('click', () => {
    const q = state.queue[state.queueIndex];
    if (!q) return;
    const btn = document.getElementById('btn-report-study-q');
    if (addToPendingVerify(q)) {
      const orig = btn.textContent;
      btn.textContent = '✅ 検証待ちに追加しました';
      setTimeout(() => { btn.textContent = orig; }, 2500);
    } else {
      const orig = btn.textContent;
      btn.textContent = '⚠️ 既に報告済みです';
      setTimeout(() => { btn.textContent = orig; }, 2500);
    }
  });
  document.getElementById('btn-verify-ai').addEventListener('click', () => {
    openVerifyOnClaude(state.queue[state.queueIndex]);
  });

  // ========== 計算問題練習 ==========
  // ホーム→一覧（全トグルを閉じた状態で開く）
  document.getElementById('btn-start-calc-practice').addEventListener('click', () => {
    collapseAllCalcGroups();
    renderCalcPracticeScreen();
    showScreen('calc-practice');
  });

  // 一覧→ホーム
  document.getElementById('btn-calc-back-home').addEventListener('click', renderHome);

  // ◎/〇 マークフィルター（押すたびにON/OFF。両方ONで◎と〇の両方表示）
  document.querySelectorAll('.calc-mark-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const m = btn.dataset.mark;
      if (calcMarkFilter.has(m)) calcMarkFilter.delete(m);
      else calcMarkFilter.add(m);
      btn.classList.toggle('active', calcMarkFilter.has(m));
      renderCalcPracticeScreen();
    });
  });

  // ソートボタン
  const registeredBtn = document.querySelector('.calc-sort-btn[data-sort="registered"]');
  document.querySelectorAll('.calc-sort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.sort === 'registered') {
        // 登録順ボタン：押すたびに 古い順 ↔ 新しい順 をトグル
        if (calcSortMode === 'registered-asc') {
          calcSortMode = 'registered-desc';
          btn.textContent = '登録順 ↓';
        } else {
          calcSortMode = 'registered-asc';
          btn.textContent = '登録順 ↑';
        }
      } else {
        calcSortMode = 'title';
        if (registeredBtn) registeredBtn.textContent = '登録順';
      }
      document.querySelectorAll('.calc-sort-btn').forEach(b =>
        b.classList.toggle('active', b === btn)
      );
      // ソート変更時は全グループを折りたたんだ状態で表示
      collapsedCalcTitles.clear();
      collapsedCalcSubcats.clear();
      calcProblems.forEach(p => {
        const tk = p.title || '';
        collapsedCalcTitles.add(tk);
        collapsedCalcSubcats.add(tk + '::' + (p.subcategory || ''));
      });
      renderCalcPracticeScreen();
    });
  });

  // 追加ボタン→モーダルを開く（追加モード）
  document.getElementById('btn-calc-add').addEventListener('click', () => openCalcModal(null));

  const closeCalcAddModal = () => {
    document.getElementById('modal-calc-add').classList.add('hidden');
    document.removeEventListener('paste', handleCalcAddImagePaste);
    editingCalcIndex = null;
  };
  document.getElementById('calc-add-close').addEventListener('click',  closeCalcAddModal);
  document.getElementById('calc-add-cancel').addEventListener('click', closeCalcAddModal);
  // 枠外クリックでは閉じない（入力途中のデータを守るため）

  // 問題画像選択（クリックでペースト先も切り替え）
  document.getElementById('btn-calc-problem-img').addEventListener('click', () => {
    calcAddPasteTarget = 'problem';
    document.getElementById('input-calc-problem-img').click();
  });
  document.getElementById('calc-add-problem-preview').addEventListener('click', () => {
    calcAddPasteTarget = 'problem';
  });
  document.getElementById('input-calc-problem-img').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const preview = document.getElementById('calc-add-problem-preview');
      preview.innerHTML = `<img src="${ev.target.result}" alt="">`;
      preview._imgData = ev.target.result;
    };
    reader.readAsDataURL(file);
  });

  // 解説画像選択（クリックでペースト先も切り替え）
  document.getElementById('btn-calc-exp-img').addEventListener('click', () => {
    calcAddPasteTarget = 'explanation';
    document.getElementById('input-calc-exp-img').click();
  });
  document.getElementById('calc-add-exp-preview').addEventListener('click', () => {
    calcAddPasteTarget = 'explanation';
  });
  document.getElementById('input-calc-exp-img').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const preview = document.getElementById('calc-add-exp-preview');
      preview.innerHTML = `<img src="${ev.target.result}" alt="">`;
      preview._imgData = ev.target.result;
    };
    reader.readAsDataURL(file);
  });

  // マーク（◎/〇）選択トグル
  document.getElementById('calc-mark-btns')?.addEventListener('click', e => {
    const btn = e.target.closest('.calc-mark-btn');
    if (!btn) return;
    const wrap = document.getElementById('calc-mark-btns');
    const next = (wrap.dataset.mark === btn.dataset.mark) ? '' : btn.dataset.mark; // 再クリックで解除
    wrap.dataset.mark = next;
    wrap.querySelectorAll('.calc-mark-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.mark === next));
  });

  // 編集画面のまま前/次の登録問題へ
  document.getElementById('calc-edit-prev')?.addEventListener('click', () => navigateCalcEdit(-1));
  document.getElementById('calc-edit-next')?.addEventListener('click', () => navigateCalcEdit(1));

  // 追加 / 編集 保存
  document.getElementById('calc-add-save').addEventListener('click', async () => {
    const errorEl  = document.getElementById('calc-add-error');
    const probPrev = document.getElementById('calc-add-problem-preview');
    const expPrev  = document.getElementById('calc-add-exp-preview');
    const probImg  = probPrev._imgData || null;
    const expImg   = expPrev._imgData  || null;
    if (!probImg || !expImg) {
      errorEl.textContent = '問題画像と解説画像を両方選択してください';
      errorEl.classList.remove('hidden');
      return;
    }
    errorEl.classList.add('hidden');

    const isEdit = editingCalcIndex !== null;
    const data = collectCalcModalData();

    if (isEdit) {
      calcProblems[editingCalcIndex] = data;
    } else {
      calcProblems.push(data);
    }
    const saved = await saveCalcProblems();
    if (!saved) {
      // 保存失敗時はデータを戻してエラー表示
      if (isEdit) {
        // 編集前のデータには戻せないため警告のみ
      } else {
        calcProblems.pop();
      }
      errorEl.textContent = '保存できませんでした。ブラウザの保存容量が上限に達しています。既存の問題を削除してから追加してください。';
      errorEl.classList.remove('hidden');
      return;
    }
    closeCalcAddModal(); // paste listenerもここで解除

    if (isEdit) {
      // 編集後は詳細画面を再描画
      renderCalcDetailScreen();
    } else {
      renderCalcPracticeScreen();
    }
  });

  // 詳細画面：一覧へ戻る
  document.getElementById('btn-calc-detail-back').addEventListener('click', () => {
    renderCalcPracticeScreen();
    showScreen('calc-practice');
  });

  // 詳細画面：編集
  document.getElementById('btn-calc-detail-edit').addEventListener('click', () => {
    openCalcModal(calcDetailIndex);
  });

  // 詳細画面：削除
  document.getElementById('btn-calc-detail-delete').addEventListener('click', () => {
    if (!confirm(`この問題を削除しますか？`)) return;
    calcProblems.splice(calcDetailIndex, 1);
    saveCalcProblems();
    if (calcProblems.length === 0) {
      renderCalcPracticeScreen();
      showScreen('calc-practice');
    } else {
      calcDetailIndex = Math.min(calcDetailIndex, calcProblems.length - 1);
      renderCalcDetailScreen();
    }
  });

  // 詳細画面：解説トグル
  document.getElementById('btn-calc-toggle-exp').addEventListener('click', () => {
    const wrap      = document.getElementById('calc-detail-exp-wrap');
    const btn       = document.getElementById('btn-calc-toggle-exp');
    const isHidden  = wrap.classList.contains('hidden');
    wrap.classList.toggle('hidden', !isHidden);
    if (isHidden) {
      btn.textContent = '解説を閉じる';
      btn.className   = 'btn btn-ghost';
    } else {
      btn.textContent = '解説を見る';
      btn.className   = 'btn btn-primary';
    }
  });

  // 詳細画面：前へ
  document.getElementById('btn-calc-prev').addEventListener('click', () => {
    if (calcDetailIndex > 0) {
      calcDetailIndex--;
      renderCalcDetailScreen();
    }
  });

  // 詳細画面：次へ
  document.getElementById('btn-calc-next').addEventListener('click', () => {
    if (calcDetailIndex < calcProblems.length - 1) {
      calcDetailIndex++;
      renderCalcDetailScreen();
    }
  });

  // 詳細画面：正誤を記録（○ / ✕）
  document.getElementById('btn-calc-correct')?.addEventListener('click', () => recordCalcAnswer(true));
  document.getElementById('btn-calc-wrong')?.addEventListener('click', () => recordCalcAnswer(false));

  // Result
  document.getElementById('btn-retry-wrong-q').addEventListener('click', retryWrongQuestions);
  document.getElementById('btn-retry-wrong-c').addEventListener('click', retryWrongChoices);
  document.getElementById('btn-again').addEventListener('click', () => {
    if (state.lastAgainType === 'drill' && state.lastAgainFiltered?.length) {
      // 直前がドリルセッション → 同じ条件でドリルを再開
      let q = [...state.lastAgainFiltered];
      // 再シャッフル
      for (let i = q.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [q[i], q[j]] = [q[j], q[i]];
      }
      if (state.lastAgainLimit) q = q.slice(0, state.lastAgainLimit);
      startDrillWithQueue(q, state.lastAgainMode);
    } else if (state.lastAgainType === 'study' && state.lastAgainFiltered?.length) {
      // 直前が通常学習セッション → 同じ問題セットで再開（フィルター変化の影響なし）
      _startSession(state.lastAgainMode || state.mode, state.lastAgainFiltered);
    } else {
      // フォールバック（初回など）
      startSession(state.mode);
    }
  });
  document.getElementById('btn-to-home-from-result').addEventListener('click', renderHome);

  // Result screen keyboard navigation
  document.addEventListener('keydown', e => {
    if (document.getElementById('screen-result').classList.contains('hidden')) return;
    if (['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)) return;
    const btns = getResultBtns();
    if (!btns.length) return;
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        resultFocusIndex = (resultFocusIndex + 1) % btns.length;
        applyResultFocus();
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        resultFocusIndex = (resultFocusIndex - 1 + btns.length) % btns.length;
        applyResultFocus();
        break;
      case 'Enter': {
        e.preventDefault();
        const btn = btns[resultFocusIndex];
        if (btn) btn.click();
        break;
      }
    }
  });

  // Choice Detail Modal
  const closeCdm = () => document.getElementById('modal-choice-detail').classList.add('hidden');
  document.getElementById('cdm-close').addEventListener('click',  closeCdm);
  document.getElementById('cdm-close2').addEventListener('click', closeCdm);
  document.getElementById('cdm-btn-bookmark').addEventListener('click', () => {
    if (!cdmCurrentQId) return;
    toggleBookmark(cdmCurrentQId);
    updateCdmBookmark(cdmCurrentQId);
  });
  document.getElementById('cdm-btn-tag').addEventListener('click', () => {
    document.getElementById('cdm-tags').querySelector('.cdm-tag-input')?.focus();
  });

  // Home
  document.getElementById('btn-hd-home').addEventListener('click', () => { closeAllHdPopups(); renderHome(); });

  // Stats
  document.getElementById('btn-hd-stats').addEventListener('click', renderStats);
  document.getElementById('btn-to-home-from-stats').addEventListener('click', renderHome);

  // 成績タブ切り替え
  document.querySelectorAll('.stats-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      statsTabMode = tab.dataset.tab;
      renderStats();
    });
  });

  // Question list
  document.getElementById('btn-question-list').addEventListener('click', () => {
    qlistSearchQuery    = '';
    qlistFilterCats     = new Set();
    qlistFilterBookmark = false;
    qlistFilterTags     = new Set();
    qlistTagPanelOpen   = false;
    qlistSelectMode     = false;
    selectedQIds.clear();
    const searchEl = document.getElementById('qlist-search');
    if (searchEl) searchEl.value = '';
    document.getElementById('qlist-select-bar')?.classList.add('hidden');
    document.getElementById('btn-select-mode')?.classList.remove('active');
    renderQlistFilterBar();
    renderQuestionList();
  });

  // ── 新規作成モーダル ──
  document.getElementById('btn-create-q').addEventListener('click', openCreateModal);
  const closeCreateModal = () => document.getElementById('modal-create-q').classList.add('hidden');
  document.getElementById('create-q-close').addEventListener('click',  closeCreateModal);
  document.getElementById('create-q-cancel').addEventListener('click', closeCreateModal);
  // 枠外クリックでは閉じない（作成中のデータを守るため）
  document.getElementById('create-add-choice').addEventListener('click', () => {
    if (createChoicesList.length >= 7) return;
    createChoicesList.push({ text: '', isCorrect: false });
    renderCreateChoicesList();
  });
  document.getElementById('create-q-save').addEventListener('click', saveCreateQuestion);
  // カテゴリ「新規入力」選択時
  document.getElementById('create-category').addEventListener('change', e => {
    if (e.target.value === '__new__') {
      const name = prompt('新しいカテゴリ名を入力してください:');
      if (name && name.trim()) {
        const opt = document.createElement('option');
        opt.value = name.trim(); opt.textContent = name.trim();
        e.target.insertBefore(opt, e.target.lastElementChild);
        e.target.value = name.trim();
      } else {
        e.target.value = '';
      }
    }
  });

  // ── 一括選択・削除・編集 ──
  document.getElementById('btn-select-mode').addEventListener('click', () => toggleSelectMode());
  document.getElementById('btn-cancel-select').addEventListener('click', () => toggleSelectMode(false));
  document.getElementById('btn-delete-selected').addEventListener('click', deleteSelectedQuestions);
  document.getElementById('btn-bulk-edit').addEventListener('click', openBulkEditModal);
  document.getElementById('btn-bulk-edit-apply').addEventListener('click', applyBulkEdit);
  document.getElementById('qlist-select-all').addEventListener('change', e => {
    if (e.target.checked) qlistNavQueue.forEach(id => selectedQIds.add(id));
    else qlistNavQueue.forEach(id => selectedQIds.delete(id));
    updateSelectBar();
    // チェックボックスの見た目を更新
    document.querySelectorAll('.qlist-cb').forEach(cb => {
      cb.checked = selectedQIds.has(cb.closest('.qlist-row')?.dataset?.qid ||
        cb.closest('[data-qid]')?.dataset?.qid || '');
    });
    renderQuestionList(getToggleOpenState('questions-container'));
  });

  document.getElementById('qlist-search').addEventListener('input', e => {
    qlistSearchQuery = e.target.value;
    renderQuestionList(getToggleOpenState('questions-container'));
  });
  document.getElementById('btn-to-home-from-questions').addEventListener('click', renderHome);

  document.getElementById('btn-delete-all').addEventListener('click', () => {
    if (!confirm(`全 ${state.questions.length} 問を削除しますか？この操作は取り消せません。`)) return;
    deleteAllQuestions();
    renderQuestionList(); // 全削除後は空なので状態保持不要
  });

  // 検証待ち 全削除
  document.getElementById('btn-pending-clear-all').addEventListener('click', () => {
    if (!confirm('検証待ちの問題をすべて削除しますか？')) return;
    savePendingVerify([]);
    renderPendingVerify();
  });

  // ── JSONエディタ ──
  document.getElementById('btn-json-editor').addEventListener('click', openJsonEditor);
  const closeJsonEditor = () => document.getElementById('modal-json-editor').classList.add('hidden');
  document.getElementById('json-editor-close').addEventListener('click',  closeJsonEditor);
  document.getElementById('json-editor-cancel').addEventListener('click', closeJsonEditor);
  document.getElementById('modal-json-editor').addEventListener('click', e => {
    if (e.target === document.getElementById('modal-json-editor')) closeJsonEditor();
  });
  document.getElementById('json-edit-set-select').addEventListener('change', e => {
    loadJsonForSet(e.target.value);
  });
  document.getElementById('json-editor-area').addEventListener('input', e => {
    clearTimeout(_jsonEditorDebounce);
    const text = e.target.value;
    const cc   = document.getElementById('json-editor-charcount');
    if (cc) cc.textContent = `${text.length.toLocaleString()} 文字`;
    _jsonEditorDebounce = setTimeout(() => updateJsonEditorStatus(text), 400);
  });
  document.getElementById('json-editor-apply').addEventListener('click', applyJsonEdit);

  // Questions export
  document.getElementById('btn-export-questions').addEventListener('click', () => openExportQuestionsModal('set'));
  document.getElementById('btn-export-questions-cat').addEventListener('click', () => openExportQuestionsModal('category'));
  const closeExportQ = () => document.getElementById('modal-export-questions').classList.add('hidden');
  document.getElementById('modal-export-q-close').addEventListener('click', closeExportQ);
  document.getElementById('btn-export-q-close2').addEventListener('click', closeExportQ);
  document.getElementById('modal-export-questions').addEventListener('click', e => {
    if (e.target === document.getElementById('modal-export-questions')) closeExportQ();
  });

  // Progress export/import/reset
  document.getElementById('btn-export').addEventListener('click', exportProgress);
  document.getElementById('btn-import').addEventListener('click', () => {
    document.getElementById('input-progress-file').click();
  });
  document.getElementById('input-progress-file').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    importProgress(file);
    e.target.value = '';
  });
  document.getElementById('btn-reset').addEventListener('click', resetProgress);

  // ── Google Drive サインイン ──
  document.getElementById('btn-drive-signin').addEventListener('click', async () => {
    try {
      const token = await _gdriveRequestToken(); // ユーザー操作起点なのでポップアップOK
      localStorage.setItem(GDRIVE_CONNECTED_KEY, '1');
      _updateDriveBtnUI();
      showSyncStatus('☁️ Drive に接続しました');
      gdriveCheckRemote().catch(() => {});
    } catch(e) {
      showSyncStatus('⚠️ サインイン失敗: ' + e);
    }
  });

  // ── 外部学習の実績入力 ──
  document.getElementById('btn-external-study')?.addEventListener('click', openExternalStudyModal);
  document.getElementById('btn-external-study-add')?.addEventListener('click', () => {
    const input = document.getElementById('external-study-input');
    const n = _parseExtStudyValue(input?.value);
    if (n === null) { _extStudyError('0より大きい整数を入力してください。'); return; }
    _extStudyError('');
    addExternalStudy(n);
    updateHeaderStats();          // 「今日の学習」表示に即反映
    renderExternalStudyModal();
    if (input) { input.value = ''; input.focus(); }
  });
  document.getElementById('external-study-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); document.getElementById('btn-external-study-add').click(); }
  });
  document.getElementById('btn-external-study-close')?.addEventListener('click', () => {
    document.getElementById('modal-external-study')?.classList.add('hidden');
  });
  document.getElementById('modal-external-study')?.addEventListener('click', e => {
    if (e.target.id === 'modal-external-study') document.getElementById('modal-external-study').classList.add('hidden');
  });

  // ── Drive 手動同期：アップロード／ダウンロードを選ばせる ──
  document.getElementById('btn-drive-sync').addEventListener('click', () => openDriveSyncModal());
  document.getElementById('btn-drive-sync-cancel').addEventListener('click', () => {
    document.getElementById('modal-drive-sync').classList.add('hidden');
  });
  document.getElementById('btn-drive-sync-upload').addEventListener('click', async () => {
    if (!confirm('⚠️ このデバイスの内容で Drive を上書きします。\n他のデバイスでより新しく保存している場合、その進捗が失われる可能性があります。\n\nアップロードを実行しますか？')) return;
    document.getElementById('modal-drive-sync').classList.add('hidden');
    await gdriveUpload(false);
  });
  document.getElementById('btn-drive-sync-download').addEventListener('click', async () => {
    if (!confirm('⚠️ Drive の内容でこのデバイスを上書きします。\nこのデバイスの方が新しい場合、進捗が巻き戻る可能性があります。\n\nダウンロードを実行しますか？')) return;
    document.getElementById('modal-drive-sync').classList.add('hidden');
    await gdriveDownloadNow();
  });

  // ── タグ追加ボタン ──
  document.getElementById('btn-add-tag').addEventListener('click', () => {
    const input = document.getElementById('edit-tag-input');
    const val   = input.value.trim().replace(/^#+/, '');
    if (val && !editingTags.includes(val)) {
      editingTags.push(val);
      renderEditTagSection();
    }
    input.value = '';
    input.focus();
  });
  document.getElementById('edit-tag-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); document.getElementById('btn-add-tag').click(); }
  });

  // ── 設問タイプ（1択問題の極性）行の表示・ヒント更新 ──
  document.getElementById('edit-single-select-check')?.addEventListener('change', updateEditPolarityRow);
  document.getElementById('edit-single-polarity')?.addEventListener('change', updateEditPolarityRow);

  // ── ハッシュタグフィルター 折りたたみ ──
  document.getElementById('filter-tag-toggle-row').addEventListener('click', (e) => {
    if (e.target.closest('#filter-tag-ctrl-btns')) return; // 全選択/全解除ボタンは別処理
    const body    = document.getElementById('filter-tag-body');
    const icon    = document.getElementById('filter-tag-toggle-icon');
    const ctrlBtns = document.getElementById('filter-tag-ctrl-btns');
    const isOpen  = !body.classList.contains('hidden');
    body.classList.toggle('hidden', isOpen);
    icon.textContent = isOpen ? '▶' : '▼';
    if (ctrlBtns) ctrlBtns.style.display = isOpen ? 'none' : '';
  });
  document.getElementById('btn-tag-all').addEventListener('click', () => {
    getAllTags().forEach(t => state.activeTags.add(t));
    renderHashtagFilter();
    updateHomeStats();
  });
  document.getElementById('btn-tag-none').addEventListener('click', () => {
    state.activeTags.clear();
    renderHashtagFilter();
    updateHomeStats();
  });

  // ── 編集モーダル ──
  // ── 表示モーダル ──
  const closeViewModal = () => document.getElementById('modal-view-q').classList.add('hidden');
  document.getElementById('modal-view-close').addEventListener('click',  closeViewModal);
  document.getElementById('modal-view-close2').addEventListener('click', closeViewModal);
  document.getElementById('modal-view-q').addEventListener('click', e => {
    if (e.target === document.getElementById('modal-view-q')) closeViewModal();
  });
  document.getElementById('modal-view-edit').addEventListener('click', () => {
    const qId = qlistNavQueue[modalNavIndex];
    closeViewModal();
    openEditModal(qId, null, true);
  });
  document.getElementById('modal-view-prev').addEventListener('click', () => navigateModal(-1));
  document.getElementById('modal-view-next').addEventListener('click', () => navigateModal(+1));
  document.getElementById('modal-edit-prev').addEventListener('click', () => navigateModal(-1));
  document.getElementById('modal-edit-next').addEventListener('click', () => navigateModal(+1));

  // ── 表示・編集モーダル キーボードナビゲーション（←→で問題送り）──
  document.addEventListener('keydown', e => {
    const viewOpen = !document.getElementById('modal-view-q').classList.contains('hidden');
    const editOpen = !document.getElementById('modal-edit-q').classList.contains('hidden');
    if (!viewOpen && !editOpen) return;
    // input / textarea / select にフォーカス中は無視（テキスト入力を妨げない）
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      navigateModal(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      navigateModal(+1);
    }
  });

  // ── 表示設定 ──
  document.getElementById('settings-font-size').querySelectorAll('.settings-btn').forEach(btn => {
    btn.classList.toggle('active', Number(btn.dataset.value) === appSettings.fontSize);
    btn.addEventListener('click', () => {
      appSettings.fontSize = Number(btn.dataset.value);
      saveAppSettings();
      applyAppSettings();
      document.getElementById('settings-font-size').querySelectorAll('.settings-btn')
        .forEach(b => b.classList.toggle('active', b === btn));
    });
  });
  document.getElementById('settings-font-weight').querySelectorAll('.settings-btn').forEach(btn => {
    btn.classList.toggle('active', Number(btn.dataset.value) === appSettings.fontWeight);
    btn.addEventListener('click', () => {
      appSettings.fontWeight = Number(btn.dataset.value);
      saveAppSettings();
      applyAppSettings();
      document.getElementById('settings-font-weight').querySelectorAll('.settings-btn')
        .forEach(b => b.classList.toggle('active', b === btn));
    });
  });

  // ── 編集モーダル ──
  const closeEditModal = () => {
    document.getElementById('modal-edit-q').classList.add('hidden');
    document.removeEventListener('paste', handleEditImagePaste);
    // メタグリッドを通常表示に戻す
    const mg = document.querySelector('#modal-edit-q .edit-meta-grid');
    const ch = document.querySelector('#modal-edit-q .edit-choices-header');
    if (mg) mg.style.display = '';
    if (ch) ch.style.display = '';
    editingQId          = null;
    editingChoiceIndex  = null;
    editingChoiceImages = {};
    editingChoiceWidths = {};
    editingChoiceExpImages = {};
    editingChoiceExpWidths = {};
    _editChoiceImgFocus = null;
  };
  document.getElementById('modal-edit-close').addEventListener('click', closeEditModal);
  document.getElementById('modal-edit-cancel').addEventListener('click', closeEditModal);
  // 枠外クリックでは閉じない（編集中のデータを守るため）
  document.getElementById('modal-edit-save').addEventListener('click', saveEditModal);

  // ── 編集モーダル ブロックエディタ ──
  document.getElementById('btn-add-text-block').addEventListener('click', () => {
    editingBlocks.push({ type: 'text', content: '' });
    renderEditBlocks();
    // 追加したテキストエリアにフォーカス
    const textareas = document.querySelectorAll('#edit-blocks-container .edit-block-textarea');
    if (textareas.length) textareas[textareas.length - 1].focus();
  });
  document.getElementById('btn-add-image-block').addEventListener('click', () => {
    document.getElementById('input-edit-image').click();
  });
  document.getElementById('input-edit-image').addEventListener('change', e => {
    loadImageFileToBlock(e.target.files[0]);
    e.target.value = '';
  });

  // 解説画像ボタン
  document.getElementById('btn-exp-img-upload').addEventListener('click', () => {
    document.getElementById('input-exp-image').click();
  });
  document.getElementById('input-exp-image').addEventListener('change', e => {
    loadImageFileToExpImage(e.target.files[0]);
    e.target.value = '';
  });
  document.getElementById('btn-exp-img-clear').addEventListener('click', () => {
    editingExplanationImage = null;
    renderEditExpImageSection();
  });

  // 出題画面：計算問題チェックボックス
  document.getElementById('study-calc-mode-check').addEventListener('change', e => {
    const q = state.queue[state.queueIndex];
    if (!q) return;
    const qIdx = state.questions.findIndex(x => x.id === q.id);
    if (qIdx === -1) return;
    const updatedQ = { ...state.questions[qIdx] };
    if (e.target.checked) {
      updatedQ.questionType = 'calculation';
      // 排他：1択選択チェックを外す
      const singleCheck = document.getElementById('study-single-select-check');
      if (singleCheck) singleCheck.checked = false;
    } else {
      delete updatedQ.questionType;
    }
    state.questions[qIdx] = updatedQ;
    state.queue[state.queueIndex] = updatedQ;
    saveQuestions();

    // 「とりあえず50」中に計算/1択として登録したら、その問題は対象外なのでスキップ
    if (state.quickMode && e.target.checked) { skipQuickQuestion(); return; }

    // 未回答なら選択肢UIを切り替え
    if (!state.checked) {
      const list = document.getElementById('choices-list');
      list.innerHTML = '';
      state.answers = {};
      document.getElementById('btn-check').disabled = true;
      if (isOnePickQuestion(updatedQ)) {
        (updatedQ.choices || []).forEach((c, i) => {
          list.appendChild(createChoiceItemCalc(c, CHOICE_LABELS[i] || String(i + 1)));
        });
      } else {
        (updatedQ.choices || []).forEach((c, i) => {
          list.appendChild(createChoiceItem(c, CHOICE_LABELS[i] || String(i + 1)));
        });
      }
    }
  });

  // 出題画面：1択選択問題チェックボックス
  document.getElementById('study-single-select-check').addEventListener('change', e => {
    const q = state.queue[state.queueIndex];
    if (!q) return;
    const qIdx = state.questions.findIndex(x => x.id === q.id);
    if (qIdx === -1) return;
    const updatedQ = { ...state.questions[qIdx] };
    if (e.target.checked) {
      updatedQ.questionType = 'single_select';
      // 排他：計算問題チェックを外す
      const calcCheck = document.getElementById('study-calc-mode-check');
      if (calcCheck) calcCheck.checked = false;
    } else {
      if (updatedQ.questionType === 'single_select') delete updatedQ.questionType;
    }
    state.questions[qIdx] = updatedQ;
    state.queue[state.queueIndex] = updatedQ;
    saveQuestions();

    // 「とりあえず50」中に計算/1択として登録したら、その問題は対象外なのでスキップ
    if (state.quickMode && e.target.checked) { skipQuickQuestion(); return; }

    // 未回答なら選択肢UIを切り替え
    if (!state.checked) {
      const list = document.getElementById('choices-list');
      list.innerHTML = '';
      state.answers = {};
      document.getElementById('btn-check').disabled = true;
      if (isOnePickQuestion(updatedQ)) {
        (updatedQ.choices || []).forEach((c, i) => {
          list.appendChild(createChoiceItemCalc(c, CHOICE_LABELS[i] || String(i + 1)));
        });
      } else {
        (updatedQ.choices || []).forEach((c, i) => {
          list.appendChild(createChoiceItem(c, CHOICE_LABELS[i] || String(i + 1)));
        });
      }
    }
  });

} catch(e) {
  console.error('[App init error]', e);
  document.body.insertAdjacentHTML('afterbegin',
    `<div style="position:fixed;top:0;left:0;right:0;z-index:9999;background:#7f1d1d;color:#fecaca;padding:12px 16px;font-size:.85rem;font-family:monospace;">
      ⚠️ 初期化エラー: ${e.message}<br><small>${e.stack || ''}</small>
    </div>`);
}});
