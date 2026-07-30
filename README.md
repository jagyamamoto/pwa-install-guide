# shared-pwa-install-guide

**Webアプリを「ホーム画面のアイコン」にしてもらうための案内部品**（高齢者・スマホに不慣れな人向け）。

亀戸七丁目北部町会アプリ（2026-07-30）で、実機検証と実利用テストを繰り返して到達した設計をそのまま部品化したもの。
**設計の根拠になった実測値と失敗の記録が本書の中心**。コードだけ写して根拠を捨てると同じ失敗を繰り返す。

---

## 1. これが解く問題

iOSでは、Webアプリをホーム画面に置く操作をアプリ側から自動化できない。利用者が自分で
「共有 → ホーム画面に追加 → 追加」を辿るしかない。ところが、

- **操作を始めると、OSの共有シートがページを覆う**（＝説明が見えなくなる）
- **高齢者は「見たものを覚えて操作する」ことができない**（作業記憶が1動作しか保たない）

この2つが重なるため、ふつうのマニュアル（スクリーンショットを並べた説明）は**紙面の出来と無関係に必ず失敗する**。

## 2. 実機で確かめた事実（iPhone 17e / iPhone SE 第3世代・iOS 26.5 Safari）

| # | 調べたこと | 結果 |
| --- | --- | --- |
| 1 | 共有シート表示中、ページはどこまで見えるか | **画面の上から42.7%は覆われない**（17e・SE でほぼ同一比率） |
| 2 | 共有シート表示中、JSやアニメーションは動くか | **動く**（シートを開いたまま秒カウンタが進み続けた） |
| 3 | シートの開閉をページが検知できるか | **できない**（blur / focus / visibilitychange / resize / visualViewport いずれも発火しない） |
| 4 | `<title>` は共有シートに出るか | **出る**（シート最上部。約20文字で省略）→ 指示文を注入できる |
| 5 | `navigator.share()` でワンボタン設置できるか | **不可**。開いたシートに「ホーム画面に追加」が無い（コピー等のみ） |
| 6 | 共有シートのサムネイルは何が出るか | `og:image` 未指定だとページ内の画像（地図など）が拾われる → **必ず指定する** |
| 7 | Safariから「追加済みか」を判定できるか | **できない**。Safariとホーム画面アプリは**保存領域が別**（localStorage も別） |

### 結論として採った形

事実1と2の組み合わせが答え。**画面上部に固定した案内は、共有シートに覆われず、さらに書き換えもできる。**
「説明が消えるから覚えてもらうしかない」という前提そのものが誤りだった。

## 3. 設計原則（守らないと通じない）

1. **記憶ゼロ** — 手順を自動で進めない。5手順を実物スクリーンショット付きで**常時ぜんぶ**出し、
   利用者は自分の画面と写真を見比べるだけ（再認のみ／想起させない）。
   - ⚠ **時間で自動進行させる実装は実機テストで失敗した。** 利用者は自分のペースで進むため
     「帯の指示」と「実際の画面」が必ず食い違う（何も開いていないのに『共有を押す』等）。
2. **見た目をアプリ本体と変える** — 黄色地＋黒文字。アプリと同じ配色だと「指示」だと気づかれない。
3. **設定中は背景を完全に隠す** — 後ろに通常画面が見えると「どちらを操作するのか」で迷う。
4. **誤りゼロ（errorless learning）** — 「押し間違えても、途中でやめても、壊れたりお金がかかったり
   することは絶対にありません」を**開始前に**伝える。高齢者は誤操作も強く学習してしまう。
5. **閉じても必ず戻れる** — ×を押した**その瞬間**に小さな入口へ切り替える。
   リロード待ちにすると、誤って閉じた人が次に何をすればよいか分からなくなる。
   加えてメニューにも常設の入口を置く。
6. **完了は自動で判定** — 成否を本人に判断させない。ホーム画面から起動されたことを検知して
   「設定できました」を一度だけ出す。
7. **自尊心を守る** — 「かんたん」「簡単3ステップ」と書かない。できなかった人を傷つける。

## 4. 文言のルール

**使ってはいけない語**：PWA / インストール / シェアボタン / 共有シート / スクロール /
下記URL / こちらをクリック / 簡単3ステップ / スタンドアロン

**代わりに使う**：
- 「このページをホーム画面に置きます」
- 「画面の右下の …マークを押す」
- 「白い画面を指で上に動かす」（「スクロール」と書かない）
- 「右上の「追加」を押す」

**画面に出ている文字は一字一句そのまま**鍵括弧つきで書く。動詞は「押す」に統一する。
「白いところの外側」のような**書き手目線の表現を使わない**（実利用テストで通じなかった）。

## 5. 使い方

```bash
# 取り込む(このリポジトリをsubmoduleにするか、src/ をコピーする)
cp -r shared-pwa-install-guide/src/* your-app/src/client/install-guide/
```

```tsx
import InstallGuide from "./install-guide/InstallGuide";
import "./install-guide/install-guide.css";

<InstallGuide
  config={{
    appUrl: "https://example.workers.dev",
    injectedTitle: "↓ホーム画面に追加を押す", // 共有シート最上部に出す指示
    lang: "ja",
    installed: me?.user?.pwa_installed,      // サーバ側の記録(後述)
    onInstalled: () => api("/api/me/installed", { body: {} }).catch(() => {}),
    doneIconImg: "/help/img/done-icon.png",
    steps: [
      { img: "/help/img/t1-dots.png",     alt: "画面の右下の点3つ",       label: "画面の右下の …マークを押す" },
      { img: "/help/img/t2-share.png",    alt: "共有と書かれた行",         label: "「共有」を押す" },
      { img: "/help/img/t3-showmore.png", alt: "表示を増やすボタン",       label: "「表示を増やす」を押す" },
      { img: "/help/img/t4-addhome.png",  alt: "ホーム画面に追加の行",     label: "「ホーム画面に追加」を押す" },
      { img: "/help/img/t5-add.png",      alt: "右上の青い追加ボタン",     label: "右上の「追加」を押す" },
    ],
  }}
  openNow={openFromMenu}
  onOpened={() => setOpenFromMenu(false)}
/>
```

### 端末の出し分け

コンポーネントが自動で判定する（`isIOS` / `isAndroid` / `isIOSSafari` もexportしている）。

| 端末・環境 | 出るもの |
| --- | --- |
| iOS Safari（未設定） | 設定の入口 → 全画面の手順 |
| iOS のLINE内ブラウザ・Chrome等 | 手順は出さず「Safariで開いてください」＋アドレスのコピー |
| ホーム画面のアイコンから起動 | 「設定できました」を一度だけ |
| Android | **何も出さない**（Chromeの `beforeinstallprompt` で1タップ設置できるため、そちらに任せる） |
| iOS・設定済み（`installed: true`） | 何も出さない |

### 「追加済みか」の判定（重要）

iOSでは**Safariとホーム画面アプリで保存領域が別**なので、端末内の記録では判定できない。
ホーム画面から起動したときにサーバへ記録し、ブラウザ側はそれを読む。

サーバ側の実装例（監査ログを使えばスキーマ変更なしで足りる）:

```ts
// 記録する
app.post("/api/me/installed", async (c) => {
  const u = requireUser(c);
  const has = await db.prepare(
    "SELECT 1 AS x FROM audit_log WHERE actor_id=? AND action='pwa.installed' LIMIT 1",
  ).bind(u.id).first();
  if (!has) await audit(db, u.id, "pwa.installed", "person", u.id);
  return c.json({ ok: true });
});

// 読む(/api/me のレスポンスに足す)
const row = await db.prepare(
  "SELECT 1 AS x FROM audit_log WHERE actor_id=? AND action='pwa.installed' LIMIT 1",
).bind(u.id).first();
// → user.pwa_installed = !!row
```

⚠ 未ログインの訪問者については判定できない（そのときは案内を出してよい）。

### `index.html` に必ず入れるもの

```html
<link rel="manifest" href="/manifest.webmanifest" />
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
<!-- 共有シート最上部のサムネイル。未指定だとページ内の画像(地図等)が拾われる -->
<meta property="og:image" content="/icons/icon-192.png" />
<meta property="og:title" content="アプリ名" />
```

ホーム画面のアイコン名は**4〜7文字程度**にする（長いと省略されて本人が見つけられない）。

## 6. 手順スクリーンショットの用意

**必ず実機（またはシミュレータ）の日本語画面を使う**。イラストで再現しない。
押す場所の**周辺だけ**を切り抜き、**赤い印は1枚に1つ**。

`tools/capture-ios-steps.sh` に、Xcodeシミュレータで撮る手順をまとめてある。

## 7. まだ解けていないこと

- **QRコードから、インストール済みのアイコン（PWA）を直接開くこと** — iOSでは不可能。
  ホーム画面のWebアプリは独自URLスキームを持たず、URLを開くと必ずSafariになる。
  （Androidは可能。インストール済みPWAがURLを引き受ける）
  アイコンを見失った人への現実的な逃げ道は、①Push通知をタップして開く（iOSのWeb Pushは
  ホーム画面アプリでのみ動くので、通知が来ている＝設置済み）②もう一度設定してアイコンを作り直す。
- **Picture in Picture を保険に使えるか** — 未検証（canvas由来の映像はPiP非対応と判明。
  実ファイルの動画での可否はシミュレータが動画を再生できず判定できなかった）。

## 8. 出自

- 実装元：亀戸七丁目北部町会アプリ `src/client/pages/InstallGuide.tsx`
- 設計方針の全文：同アプリ `docs/使い方ガイド設計方針_記憶ゼロ設計.md`
- 検証日：2026-07-30（iPhone 17e / iPhone SE 第3世代・iOS 26.5）
