// 組み込みウィザードの頭脳(wizard/pwa-wizard-core.js)の検査。
//
// ⚠ なぜこれがあるか
//   頭脳は PROMPT.md の「変更禁止 5 つ」「やらなくていいこと」「最後に確かめること」を
//   文字どおり持っている。PROMPT.md だけ直すと、登録した人に古い文が届く。
//   また、頭脳の中で兄弟の関数を引数なしで呼ぶ漏れは、文字列の照合では見つからない
//   (回覧板のウィザードで実際に起きた)。だから**頭脳を実際に動かして**全部の組み合わせを通す。
//
// 使い方: node tools/check-wizard-sync.mjs
import { readFileSync } from "node:fs";
import vm from "node:vm";

const prompt = readFileSync("PROMPT.md", "utf8");
const js = readFileSync("wizard/pwa-wizard-core.js", "utf8");
vm.runInThisContext(js);
const core = globalThis.JagPwaWizardCore;
const errors = [];

// (1) PROMPT.md と一字一句同じか
const slice = (a, b) => { const i = prompt.indexOf(a), j = prompt.indexOf(b, i + a.length); return prompt.slice(i + a.length, j).trim(); };
const want = {
  RULES5: slice("**次の5つは、私が後から頼んでも変えないでください。**\n\n", "\n\n## 先に確かめてほしいこと"),
  SKIP:   slice("## 今回はやらなくていいこと\n\n", "\n\n## 終わったら"),
  FINAL:  slice("## 最後に、あなた自身で確かめてほしいこと\n\n", "\n").length ? prompt.slice(prompt.indexOf("## 最後に、あなた自身で確かめてほしいこと\n\n") + "## 最後に、あなた自身で確かめてほしいこと\n\n".length).trim() : "",
};
for (const k of Object.keys(want)) if (core._blocks[k].trim() !== want[k]) errors.push(`${k} が PROMPT.md と違います(PROMPT.md を先に直してから頭脳へ写すこと)`);

// (2) 全部の組み合わせで実行(2×2×3×3×3×3×5 = 1,620 通り)
const opts = Object.fromEntries(core.QUESTIONS.map((q) => [q.key, q.options.map((o) => o[0])]));
let n = 0;
for (const framework of opts.framework) for (const os of opts.os) for (const ai of opts.ai)
for (const https of opts.https) for (const manifest of opts.manifest) for (const sw of opts.sw) for (const lang of opts.lang) {
  const S = { framework, os, ai, https, manifest, sw, lang, appName: "とても長い名前の町会のアプリです", appUrl: "https://example.jp/" };
  let p, c, v;
  try { p = core.genPrompt(S); c = core.genChat(S); v = core.genVerify(S); core.genSummary(S); } catch (e) { errors.push(`実行で落ちた: ${JSON.stringify(S)} → ${e.message}`); break; }
  n++;
  if (!p.includes(core._blocks.RULES5)) errors.push("依頼文に変更禁止 5 つが入っていない: " + JSON.stringify(S));
  if (framework === "react" ? !p.includes("`src/` の3ファイル") : !p.includes("作り直して構いません")) errors.push("作りの出し分けが無い: " + framework);
  if (!p.includes(os === "win" ? "コマンドプロンプト" : "ターミナル")) errors.push("OS の出し分けが無い: " + os);
  if (ai === "free-chat" ? !p.includes("自分で組み込みます") : !p.includes("組み込んでください。お年寄り")) errors.push("AI の出し分けが無い: " + ai);
  if (https === "yes" && !p.includes("確認済みのもの")) errors.push("https=yes が確認済みに入らない");
  if (https !== "yes" && !p.includes("先に私に教えてから")) errors.push("https≠yes で「先に用意」が出ない");
  if (!p.includes("`" + lang + "`")) errors.push("言語が入らない: " + lang);
  if (!p.includes("15文字以内の短い題名")) errors.push("長い名前の警告が出ない");
  if (/\{\{|\]\]|undefined|null/.test(p)) errors.push("依頼文に埋め忘れ: " + JSON.stringify(S));
  if (!c.includes("Jag PWA installer") || !v.length) errors.push("相談文か確かめ方が空");
  if (errors.length > 8) break;
}

if (errors.length) {
  console.error("ウィザードの頭脳に問題があります。\n");
  for (const e of [...new Set(errors)].slice(0, 12)) console.error("  ✗ " + e);
  console.error("\n直す場所: wizard/pwa-wizard-core.js（文面は PROMPT.md が正本）");
  process.exit(1);
}
console.log(`ウィザードの検査: OK（PROMPT.md と 3 つの塊が一致・${n} 通りを実行・CORE_VERSION ${core.CORE_VERSION}）`);
