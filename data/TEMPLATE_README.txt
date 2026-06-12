{
  "_TEMPLATE_説明": [
    "このファイルはAIに問題をJSON化してもらうためのテンプレートです。",
    "実際のデータファイルには _TEMPLATE_説明 / _TEMPLATE_パターン説明 キーは含めないでください。",
    "──────────────────────────────────────",
    "【ファイル命名規則】",
    "  年度別     : r{年度数字}_{種別}_{科目}.json",
    "               例: r8_甲種_法令.json / r8_甲種_ガス技術製造.json",
    "  分野別     : 分野別過去問_{節番号}節_{節名称}_問{開始}問{終了}.json",
    "               例: 分野別過去問_1節_目的と定義_問1問6.json",
    "",
    "【IDの命名規則】",
    "  年度別問題  : r{年度}-{科目略}-q{問番号3桁}",
    "               例: r8-hourei-q001 / r8-seizo-q001 / r8-kyokyu-q001 / r8-shohi-q001 / r8-kiso-q001",
    "  分野別問題  : bunyabetsu-{科目略}-{節番号}-q{問番号3桁}",
    "               例: bunyabetsu-hourei-1-q001",
    "  選択肢(イロハニホ型) : {問ID}-i / -ro / -ha / -ni / -ho",
    "  選択肢(番号型)       : {問ID}-1 / -2 / -3 / -4 / -5",
    "",
    "【科目略称一覧】",
    "  hourei  = 法令",
    "  seizo   = ガス技術（製造）",
    "  kyokyu  = ガス技術（供給）",
    "  shohi   = ガス技術（消費）",
    "  kiso    = 基礎",
    "",
    "【category フィールド値】",
    "  「法令」「ガス技術（製造）」「ガス技術（供給）」「ガス技術（消費）」「基礎」",
    "",
    "【問題パターン】",
    "  パターンA: イロハニホ型 ＋ 「〇つ」正解  → 法令・ガス技術 でよく使われる",
    "  パターンB: イロハニホ型 ＋ 単一正解      → 「誤っているものはどれか」等",
    "  パターンC: (1)〜(5)番号型 ＋ 単一正解    → 基礎でよく使われる"
  ],

  "_TEMPLATE_パターン説明": {
    "correctAnswer_例": {
      "いくつあるか": "(1) 1つ  または  (2) 2つ  または  (3) 3つ  など",
      "単一正解(イロハ型)": "「イ」または「ロ」など、正解選択肢のラベル",
      "単一正解(番号型)": "(4) 125  など選択肢のtext文字列をそのまま入れる"
    }
  },

  "title": "【ここにタイトルを入れる】例: 令和8年度 甲種 法令",
  "meta": {
    "title": "【ここにタイトルを入れる】例: 令和8年度 甲種 法令",
    "created": "YYYY-MM-DD"
  },
  "questions": [

    {
      "_comment": "=== パターンA: イロハニホ型 ＋ 正解が「〇つ」（法令・ガス技術でよく使う） ===",
      "id": "r8-hourei-q001",
      "category": "法令",
      "subcategory": "【小区分名】例: 用語の定義等",
      "year": "令和8年度",
      "source": "令和8年度 甲種 法令 問1",
      "section": "",
      "tags": [],
      "questionText": "【問題文をそのまま入れる】例: 法令で規定されている用語の定義等に関する次の記述のうち、正しいものはいくつあるか。",
      "choices": [
        {
          "id": "r8-hourei-q001-i",
          "text": "イ 【イの選択肢文をそのまま入れる】",
          "isCorrect": false,
          "explanation": "【正誤の根拠を入れる】例: 誤り。法第2条第1項。〇〇ではなく「△△」が正しい。"
        },
        {
          "id": "r8-hourei-q001-ro",
          "text": "ロ 【ロの選択肢文をそのまま入れる】",
          "isCorrect": true,
          "explanation": "【正誤の根拠を入れる】例: 正しい。法第2条第13項の定義通りである。"
        },
        {
          "id": "r8-hourei-q001-ha",
          "text": "ハ 【ハの選択肢文をそのまま入れる】",
          "isCorrect": false,
          "explanation": "【正誤の根拠を入れる】"
        },
        {
          "id": "r8-hourei-q001-ni",
          "text": "ニ 【ニの選択肢文をそのまま入れる】",
          "isCorrect": false,
          "explanation": "【正誤の根拠を入れる】"
        },
        {
          "id": "r8-hourei-q001-ho",
          "text": "ホ 【ホの選択肢文をそのまま入れる】",
          "isCorrect": false,
          "explanation": "【正誤の根拠を入れる】"
        }
      ],
      "correctAnswer": "(1) 1つ"
    },

    {
      "_comment": "=== パターンB: イロハニホ型 ＋ 単一正解（「誤っているものはどれか」等） ===",
      "id": "r8-hourei-q002",
      "category": "法令",
      "subcategory": "【小区分名】",
      "year": "令和8年度",
      "source": "令和8年度 甲種 法令 問2",
      "section": "",
      "tags": [],
      "questionText": "【問題文】例: 法令で規定されている〇〇に関する次の記述のうち、誤っているものはどれか。",
      "choices": [
        {
          "id": "r8-hourei-q002-i",
          "text": "イ 【選択肢文】",
          "isCorrect": false,
          "explanation": "【根拠】"
        },
        {
          "id": "r8-hourei-q002-ro",
          "text": "ロ 【選択肢文】",
          "isCorrect": false,
          "explanation": "【根拠】"
        },
        {
          "id": "r8-hourei-q002-ha",
          "text": "ハ 【選択肢文（これが誤り＝正解）】",
          "isCorrect": true,
          "explanation": "【根拠】例: 誤り。法第〇条。〇〇ではなく「△△」が正しい。"
        },
        {
          "id": "r8-hourei-q002-ni",
          "text": "ニ 【選択肢文】",
          "isCorrect": false,
          "explanation": "【根拠】"
        },
        {
          "id": "r8-hourei-q002-ho",
          "text": "ホ 【選択肢文】",
          "isCorrect": false,
          "explanation": "【根拠】"
        }
      ],
      "correctAnswer": "ハ"
    },

    {
      "_comment": "=== パターンC: (1)〜(5)番号型 ＋ 単一正解（基礎でよく使う） ===",
      "id": "r8-kiso-q001",
      "category": "基礎",
      "subcategory": "【小区分名】例: 気体工学",
      "year": "令和8年度",
      "source": "令和8年度 甲種 基礎 問1",
      "section": "【大区分名】例: 熱力学・気体工学",
      "tags": [],
      "questionText": "【問題文】例: 〇〇に関する次の記述のうち、誤っているものはどれか。",
      "choices": [
        {
          "id": "r8-kiso-q001-1",
          "text": "(1) 【選択肢文】",
          "isCorrect": false,
          "explanation": "【根拠】"
        },
        {
          "id": "r8-kiso-q001-2",
          "text": "(2) 【選択肢文】",
          "isCorrect": false,
          "explanation": "【根拠】"
        },
        {
          "id": "r8-kiso-q001-3",
          "text": "(3) 【選択肢文（これが誤り＝正解）】",
          "isCorrect": true,
          "explanation": "【根拠】例: 誤り。〇〇の正しい値は△△である。"
        },
        {
          "id": "r8-kiso-q001-4",
          "text": "(4) 【選択肢文】",
          "isCorrect": false,
          "explanation": "【根拠】"
        },
        {
          "id": "r8-kiso-q001-5",
          "text": "(5) 【選択肢文】",
          "isCorrect": false,
          "explanation": "【根拠】"
        }
      ],
      "correctAnswer": "(3) 【正解の選択肢textをそのまま】"
    },

    {
      "_comment": "=== 分野別過去問の場合（IDとyear・sourceの書き方が異なる） ===",
      "id": "bunyabetsu-hourei-1-q001",
      "category": "法令",
      "subcategory": "1節 目的と定義",
      "year": "分野別：1節 目的と定義",
      "source": "令和8年度 甲種 法令 問1",
      "section": "",
      "tags": [],
      "questionText": "【問題文】（令和8年度 甲種）",
      "choices": [
        {
          "id": "bunyabetsu-hourei-1-q001-i",
          "text": "イ 【選択肢文】",
          "isCorrect": false,
          "explanation": "【根拠】"
        },
        {
          "id": "bunyabetsu-hourei-1-q001-ro",
          "text": "ロ 【選択肢文】",
          "isCorrect": true,
          "explanation": "【根拠】"
        },
        {
          "id": "bunyabetsu-hourei-1-q001-ha",
          "text": "ハ 【選択肢文】",
          "isCorrect": false,
          "explanation": "【根拠】"
        },
        {
          "id": "bunyabetsu-hourei-1-q001-ni",
          "text": "ニ 【選択肢文】",
          "isCorrect": false,
          "explanation": "【根拠】"
        },
        {
          "id": "bunyabetsu-hourei-1-q001-ho",
          "text": "ホ 【選択肢文】",
          "isCorrect": false,
          "explanation": "【根拠】"
        }
      ],
      "correctAnswer": "(1) 1つ"
    }

  ]
}
