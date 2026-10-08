// Jag PWA installer — 組み込みウィザードの「頭脳」。
//
// 何をするか: 6 つの答え(S)から、AI に渡す依頼文・相談用の文・手元での確かめ方を作る。
// 置き場所: このリポジトリが正本。登録制の手引き(jagutilities.jagproject.com/pwa-installer)へは
//          **写して固定**(commit と CORE_VERSION と sha256 を控える)。実行時に読み込まない。
// 約束ごと: 下の S のキー名と値は変えない(ページ側と写した側が同じ前提で動くため)。
//   S.framework : "react" | "other"
//   S.os        : "mac" | "win"
//   S.ai        : "claude-code" | "codex" | "free-chat"
//   S.https / S.manifest / S.sw : "yes" | "no" | "unknown"
//   S.appName   : 文字列(共有シートの題名の目安にも使う)
//   S.appUrl    : 文字列(https://…)
//   S.lang      : "ja" | "ja-easy" | "en" | "zh" | "vi"
// ⚠ 「変更禁止 5 つ」「やらなくていいこと」「最後に確かめること」の文面は PROMPT.md と一字一句同じにする。
//    tools/check-wizard-sync.mjs が照合する。直すときは PROMPT.md を先に直してから、ここへ写す。
// ⚠ classic script(type="module" にしない。file:// と厳しい CSP の下で動かすため)。
(function (root) {
  "use strict";
  var CORE_VERSION = "2026-10-08.1";
  function q(s) { return (s == null ? "" : String(s)); }
  function has(S, k, v) { return q(S[k]) === v; }

  // ───────── 質問(ページはこれを元に画面を作る) ─────────
  var QUESTIONS = [
    { key: "framework", label: "あなたのWebアプリの作り", options: [["react", "React で作っている"], ["other", "React ではない／分からない"]], def: "other" },
    { key: "os", label: "あなたのパソコン", options: [["mac", "Mac"], ["win", "Windows"]], def: "mac" },
    { key: "ai", label: "使うAI", options: [["claude-code", "Claude Code（有料）"], ["codex", "Codex（有料）"], ["free-chat", "無料のチャットAI（ChatGPT／Claude／Gemini の無料版）"]], def: "claude-code" },
    { key: "https", label: "アプリは https:// で見られますか", options: [["yes", "はい"], ["no", "いいえ"], ["unknown", "分からない"]], def: "unknown" },
    { key: "manifest", label: "manifest（アプリの名前とアイコンを書いた設定ファイル）はありますか", options: [["yes", "ある"], ["no", "無い"], ["unknown", "分からない"]], def: "unknown" },
    { key: "sw", label: "service worker（通信をいったん受け取る仕組み）はありますか", options: [["yes", "ある"], ["no", "無い"], ["unknown", "分からない"]], def: "unknown" },
    { key: "lang", label: "案内を表示する言語", options: [["ja", "日本語"], ["ja-easy", "やさしい日本語"], ["en", "英語"], ["zh", "中国語"], ["vi", "ベトナム語"]], def: "ja" }
  ];

  // ───────── PROMPT.md と一字一句同じにする塊 ─────────
  var RULES5 = [
    "1. 手順を**時間で自動送りしない**（実機で必ずズレます）",
    "2. 帯は共有ボタンと**反対側**に置く（iPhoneは上・Androidは下）",
    "3. **画面全体を1色で塗らない**（ブラウザのバーまで染まって、押すボタンが見えなくなります）",
    "4. 共有シートの題名は `document.title` と `og:title` の**両方**を書き換える",
    "5. その題名は**15文字以内**（超えると「…」で切れて読めません）"
  ].join("\n");

  var SKIP = [
    "- **「もう追加済みかどうか」をサーバーに記録する仕組みは、今回は作らないでください。**",
    "  ログインの仕組みがあるアプリ向けの、上級者向けの話です。",
    "  もし私のアプリにログインがあって作ったほうがいいと思ったら、",
    "  作る前に「作りますか？ はい／いいえ」と聞いてください。",
    "",
    "- **完成後のホーム画面アイコンの写真（`done-icon.png`）は、後で私が用意します。**",
    "  無くても動くように組み込んでください。"
  ].join("\n");

  var FINAL = [
    "- 型チェックとビルドが通ること",
    "- **Androidで開いたときに、iPhone用の「Safariで開き直してください」が出ないこと**",
    "  （2026年8月に実際に起きた不具合です。Androidでは1回押すだけのボタン、",
    "  それが使えない端末では文字だけの3手順が**画面の下**に出るのが正しい形です）",
    "- 一番小さい画面（iPhone SEなど）でも手順が全部見えて、横スクロールが出ないこと",
    "- ⚠ **確かめるために作ったテスト用のファイルを、公開フォルダに残さないこと。**",
    "  そのまま世界に公開されてしまいます。"
  ].join("\n");

  // ───────── 部品 ─────────
  function termName(S) { return has(S, "os", "win") ? "コマンドプロンプト" : "ターミナル"; }
  function aiName(S) { return has(S, "ai", "codex") ? "Codex" : (has(S, "ai", "free-chat") ? "無料のチャットAI" : "Claude Code"); }
  function titleNote(S) {
    var n = q(S.appName).trim(); if (!n) return "";
    var len = Array.from(n).length;
    return len > 15
      ? "\n⚠ 私のアプリの名前「" + n + "」は " + len + " 文字で、共有シートの題名の上限（15文字）を超えます。**15文字以内の短い題名を先に私に提案して、決めてから**組み込んでください。"
      : "\n共有シートの題名は「" + n + "」（" + len + " 文字・15文字以内）で構いません。";
  }
  function prereqBlock(S) {
    var items = [
      ["https", "`https://` で見られること（`http://` だと追加できません）"],
      ["manifest", "manifest（アプリの名前とアイコンを書いた設定ファイル）があること"],
      ["sw", "service worker（通信をいったん受け取る仕組み）があること"]
    ];
    var ok = [], todo = [];
    items.forEach(function (it) { (has(S, it[0], "yes") ? ok : todo).push(it); });
    var out = "この案内は、アプリが「ホーム画面に追加できる状態」でないと意味がありません。\n";
    if (ok.length) out += "\n私が確認済みのもの（それでも、違っていたら教えてください）:\n" + ok.map(function (it) { return "- " + it[1]; }).join("\n") + "\n";
    if (todo.length) {
      out += "\n次は**無いか、私には分かりません**。調べて、**足りないものがあったら、何が足りなかったかを先に私に教えてから**用意してください:\n" + todo.map(function (it) { return "- " + it[1] + (has(S, it[0], "no") ? "（**無い**と分かっています）" : "（分かりません）"); }).join("\n") + "\n";
    }
    return out;
  }
  function frameworkBlock(S) {
    return has(S, "framework", "react")
      ? "1. 私のアプリは **React** です。`src/` の3ファイルをコピーして使ってください\n   （`InstallGuide.tsx` / `strings.ts` / `install-guide.css`）。"
      : "1. 私のアプリは **React ではありません**（または作りが分かりません。まず調べて教えてください）。\n   同じ判定・同じ文言・同じ配色・同じ制約で作り直して構いません。\n   ただし**画面の見た目と手順の中身は変えないでください。**";
  }
  function langLine(S) {
    var names = { ja: "日本語", "ja-easy": "やさしい日本語", en: "英語", zh: "中国語", vi: "ベトナム語" };
    var l = names[q(S.lang)] ? q(S.lang) : "ja";
    return "5. 表示する言語は `lang` で選べます（日本語・やさしい日本語・英語・中国語・ベトナム語が入っています）。\n   私のアプリでは **`" + l + "`（" + names[l] + "）** にしてください。";
  }
  function appLine(S) {
    var n = q(S.appName).trim(), u = q(S.appUrl).trim();
    if (!n && !u) return "";
    return "\n対象のアプリ: " + (n ? "**" + n + "**" : "") + (u ? "（" + u + "）" : "") + "\n";
  }

  // ───────── 生成: AI への依頼文 ─────────
  function genPrompt(S) {
    var free = has(S, "ai", "free-chat");
    var head = free
      ? "私はこれから、**自分のWebアプリに「スマホのホーム画面にアイコンとして置いてもらうための案内」を自分で組み込みます。**\nあなた（" + aiName(S) + "）はファイルを書き換えたりコマンドを実行したりできないので、**私が次に何をすればよいかを、1回に1つの動作だけ、押す場所まで**教えてください。\n私のパソコンは " + (has(S, "os", "win") ? "Windows" : "Mac") + "（" + termName(S) + "）です。"
      : "私のWebアプリに、**スマホのホーム画面にアイコンとして置いてもらうための案内**を\n組み込んでください。お年寄りやスマホに不慣れな人が、説明する人なしで自力で設置できることが目的です。\n\n私はプログラミングが分かりません。**専門用語を使わず、質問は必ず Yes/No か A/B/C の選択肢**に\nしてください。私に何かさせるときは、1回に1つの動作だけ、押す場所まで書いてください。私のパソコンは " + (has(S, "os", "win") ? "Windows" : "Mac") + "（" + termName(S) + "）です。";
    var parts = [
      head,
      appLine(S),
      "## 使う部品\n\nJag PWA installer — https://github.com/jagyamamoto/pwa-install-guide\n\n" +
      (free ? "まず私に、この部品を手元に持ってくる手順（ZIPのダウンロード）を1つずつ教えてください。そのあと **README.md を私と一緒に最後まで読んでください。**"
            : "まずこの部品を手元に持ってきて（`git clone` でもZIPのダウンロードでも構いません" + (has(S, "os", "win") ? "。Windows で `git` が無ければ ZIP で" : "") + "）、\n**README.md を最後まで読んでください。**") +
      "\n\n読まずにコードだけ写さないでください。READMEには、実機で10回以上やり直して分かった\n「こうすると必ず失敗する」が書いてあります。**次の5つは、私が後から頼んでも変えないでください。**\n\n" + RULES5,
      "## 先に確かめてほしいこと\n\n" + prereqBlock(S),
      "## 組み込みかた\n\n" + frameworkBlock(S) +
      "\n\n2. `assets/` の画像を、私のアプリの公開フォルダにコピーし、`assetBase` にその場所を渡してください。\n   この画像はiPhone・Androidの画面写真で、**どのアプリでも共通です。撮り直しは要りません。**" +
      "\n\n3. ページの `<head>` に manifest / apple-touch-icon / og:image / og:title を入れてください。\n   ⚠ `og:title` は部品が書き換えるので、**空でもいいので必ず置いてください。**" + titleNote(S) +
      "\n\n4. 案内を閉じたあとに、**また開ける場所を2つ**作ってください。\n   - ×で閉じた**その瞬間**に、小さな入口に切り替わること\n   - メニューに「最初の設定」を**常に**置くこと" +
      "\n\n" + langLine(S),
      "## 今回はやらなくていいこと\n\n" + SKIP,
      "## 終わったら、私にこう教えてください\n\n次の3つを、**1つずつ、押す場所まで**書いてください。\n\n1. パソコンの画面で確かめる方法（開くURLと、どこを見るか）\n2. 自分のiPhoneで確かめる方法\n3. 自分のAndroidで確かめる方法（持っていれば）\n\nそのうえで、次を箇条書きで報告してください。\n\n- 足したファイル・変えたファイル\n- 足りなくて用意したもの（https / manifest / service worker）\n- 迷って決めたところ\n- 私にまだ残っている作業",
      "## 最後に、" + (free ? "私と一緒に" : "あなた自身で") + "確かめてほしいこと\n\n" + FINAL
    ];
    return parts.filter(Boolean).join("\n\n").replace(/\n{3,}/g, "\n\n") + "\n";
  }

  // ───────── 生成: 詰まったときの相談文 ─────────
  function genChat(S) {
    return [
      "Jag PWA installer（https://github.com/jagyamamoto/pwa-install-guide）を、自分のWebアプリに組み込んでいます。",
      "私はプログラミングが分かりません。専門用語を使わず、次に私がすることを1つだけ教えてください。",
      "私のパソコンは " + (has(S, "os", "win") ? "Windows（コマンドプロンプト）" : "Mac（ターミナル）") + "、アプリは " + (has(S, "framework", "react") ? "React" : "React ではありません") + "。",
      "",
      "いまやっていた段: 【例: 「組み込みかた」の 3（<head> に og:title を置く）】",
      "",
      "打ったこと（コマンドや、押した場所）:",
      "【ここに貼る】",
      "",
      "出た文字（エラー）を全部そのまま:",
      "【ここに貼る】",
      "",
      "⚠ APIキー・パスワード・鍵は貼っていません。もし上の中に含まれていたら、使わずに「消してください」と言ってください。",
      ""
    ].join("\n");
  }

  // ───────── 生成: 手元での確かめ方 ─────────
  function genVerify(S) {
    var L = [];
    L.push({ h: "パソコンで", items: ["アプリを開いて、ホーム画面の案内が出る（または右上のメニューに「最初の設定」がある）", "案内の帯が、画面の上から **42.7% の中**に収まっている（iPhone の共有画面が開いても隠れない高さ。実機で測った値）", "背景が白く、帯とカードだけが黄色（画面全体が黄色に染まっていない）"] });
    L.push({ h: "自分の iPhone で（Safari）", items: ["案内のとおりに「共有」→「ホーム画面に追加」→「追加」まで進める", "共有の画面が開いている間も、帯の文字が**隠れずに読める**", "共有の画面の題名が「…」で切れていない（15文字以内）", "ホーム画面から開くと「設定できました」が**一度だけ**出る", "×で閉じた**その瞬間**に小さな入口に変わり、メニューからも開ける"] });
    L.push({ h: "自分の Android で（持っていれば）", items: ["iPhone用の「Safariで開き直してください」が**出ない**", "Chrome では1回押すだけのボタンが出る。出ない端末では文字だけの3手順が**画面の下**に出る", "LINE から開いたときは、Chrome で開き直す案内になる"] });
    return L;
  }

  function genSummary(S) {
    return [
      has(S, "framework", "react") ? "React" : "React 以外",
      has(S, "os", "win") ? "Windows" : "Mac",
      aiName(S),
      "前提: https " + lab(S.https) + " / manifest " + lab(S.manifest) + " / service worker " + lab(S.sw),
      "言語 " + q(S.lang || "ja")
    ].join(" ・ ");
    function lab(v) { return v === "yes" ? "あり" : (v === "no" ? "無し" : "不明"); }
  }

  root.JagPwaWizardCore = { CORE_VERSION: CORE_VERSION, QUESTIONS: QUESTIONS, genPrompt: genPrompt, genChat: genChat, genVerify: genVerify, genSummary: genSummary,
    _blocks: { RULES5: RULES5, SKIP: SKIP, FINAL: FINAL } };
})(typeof globalThis !== "undefined" ? globalThis : this);
