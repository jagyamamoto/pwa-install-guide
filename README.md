# shared-pwa-install-guide

**Webアプリを「ホーム画面のアイコン」にしてもらうための案内部品**（高齢者・スマホに不慣れな人向け）。

亀戸七丁目北部町会アプリで、実機テストと修正を10回以上繰り返して到達した設計をそのまま部品化した。
**コードより、ここに書いた「実測値」と「失敗の記録」のほうが価値がある。**
根拠を捨ててコードだけ写すと、同じ失敗を必ず繰り返す。

---

## 1. これが解く問題

iOSでは、Webアプリをホーム画面に置く操作をアプリ側から自動化できない。利用者が自分で
「共有 → ホーム画面に追加 → 追加」を辿るしかない。ところが、

- **操作を始めると、OSの共有シートがページを覆う**（＝説明が見えなくなる）
- **高齢者は「見たものを覚えて操作する」ことができない**（作業記憶が1動作しか保たない）

この2つが重なるため、ふつうのマニュアル（写真を並べた説明）は**紙面の出来と無関係に必ず失敗する**。

## 2. 実機で確かめた事実

検証環境: iPhone 17e / iPhone SE 第3世代（Xcodeシミュレータ・iOS 26.5）
＋ iPhone 15 Pro Max 実機（オーナー撮影のスクリーンショット）

| # | 調べたこと | 結果 |
| --- | --- | --- |
| 1 | 共有シート表示中、ページはどこまで見えるか | **画面の上から42.7%は覆われない**（17e・SEでほぼ同一比率） |
| 2 | 共有シート表示中、JSは動くか | **動く**（開いたまま秒カウンタが進み続けた） |
| 3 | シートの開閉をページが検知できるか | **できない**（blur/focus/visibilitychange/resize/visualViewport いずれも発火せず） |
| 4 | `<title>` は共有シートに出るか | **出る**（シート最上部）。ただし後述の落とし穴あり |
| 5 | `navigator.share()` でワンボタン設置できるか | **不可**。開いたシートに「ホーム画面に追加」が無い |
| 6 | 共有シートのサムネイルは何が出るか | `og:image` 未指定だとページ内の画像（地図など）が拾われる → **必ず指定** |
| 7 | ブラウザから「追加済みか」を判定できるか | **できない**。Safariとホーム画面アプリは**保存領域が別** |
| 8 | Safari以外から追加できるか | **iOS 16.4以降のみ**。16.3以前はSafari限定（MDN・下記） |
| 9 | 全面を1色で塗るとどうなるか | **ブラウザのバーまでその色に染まる**。共有ボタンが同化して見えなくなる |
| 10 | 共有シートの題名は何文字入るか | **約16文字**。超えると末尾が「…」（2例で確認） |

出典（#8）: [MDN ウェブアプリのインストールとアンインストール](https://developer.mozilla.org/ja/docs/Web/Progressive_web_apps/Guides/Installing)

### iPhone 15 Pro Max・Chromeの実測（画素単位）

画面 1290x2796px = 430x932pt @3x

| 領域 | 範囲 | 画面比 |
| --- | --- | --- |
| 上枠（ステータス＋アドレス欄。**Chromeの共有ボタンはここ**） | 0〜107pt | 11.5% |
| ページ表示領域 | 107〜854pt（**747pt**） | 80.2% |
| 下枠（Chromeのツールバー） | 854〜932pt（78pt） | 8.4% |

最小の iPhone SE（375x667pt）へ当てはめると表示領域は約 **535pt**。
よって**帯の高さは250pt以内**に収める。

## 3. 設計原則（守らないと通じない）

1. **記憶ゼロ** — 手順を自動で送らない。全手順を実物写真つきで**常時ぜんぶ**出し、
   利用者は自分の画面と写真を見比べるだけ（再認のみ／想起させない）。
   - ⚠ **時間で自動進行させる実装は実機テストで失敗した。** 利用者は自分のペースで
     進むため「帯の指示」と「実際の画面」が必ず食い違う。
2. **帯は共有ボタンと反対側に置く** — 同じ側だと (a) 押すべきボタンを自分で隠す
   (b) その側のブラウザのバーが色づいて同化する。
   | ブラウザ | 共有ボタン | 帯 |
   | --- | --- | --- |
   | Safari | 画面の**下** | **上** |
   | Chrome | 画面の**上**（アドレス欄の右端） | **下** |
3. **全面を1色で塗らない** — 背景は白。黄色は帯とカードだけ（実測#9）。
4. **設定中は背景を隠す** — 後ろに通常画面が見えると「どちらを操作するのか」で迷う。
5. **誤りゼロ（errorless learning）** — 「押し間違えても、途中でやめても、壊れたり
   お金がかかったりすることは絶対にありません」を**開始前に**伝える。
6. **閉じても必ず戻れる** — ×を押した**その瞬間**に小さな入口へ切り替える。
   リロード待ちにすると誤って閉じた人が詰む。メニューにも常設の入口を置く。
7. **完了は自動で判定** — 成否を本人に判断させない。ホーム画面から起動されたことを
   検知して「設定できました」を一度だけ出す。
8. **矢印は対象の方向へ寄せる** — 中央に置くと別の場所を指す。Chromeは右上（30度傾ける）、
   Safariは右下。
9. **自尊心を守る** — 「かんたん」「簡単3ステップ」と書かない。

## 4. 文言のルール

**禁止語**: PWA / インストール / シェアボタン / 共有シート / スクロール /
下記URL / こちらをクリック / 簡単3ステップ / スタンドアロン

- 画面に出ている文字は**一字一句そのまま**鍵括弧つきで書く。動詞は「押す」に統一
- 「白いところの外側」のような**書き手目線の表現は禁止**（実利用テストで通じなかった）
- 方向は「上」ではなく「**右上**」のように左右まで書く
- **共有シートの題名は15文字以内**（16文字超で「…」に切られる）

## 5. 使い方

```bash
cp -r shared-pwa-install-guide/src/*    your-app/src/client/install-guide/
cp -r shared-pwa-install-guide/assets/* your-app/public/help/img/
```

```tsx
import InstallGuide from "./install-guide/InstallGuide";
import "./install-guide/install-guide.css";

<InstallGuide
  config={{
    appUrl: "https://example.workers.dev",
    assetBase: "/help/img",                 // assets/ を置いた場所
    doneIconImg: "/help/img/done-icon.png", // このアプリのホーム画面アイコンの写真
    lang: "ja",
    installed: me?.user?.pwa_installed,      // サーバ側の記録(後述)
    onInstalled: () => api("/api/me/installed", { body: {} }).catch(() => {}),
    oneTapAvailable: oneTap,                 // Android/Chrome の beforeinstallprompt
    onOneTapInstall: promptInstall,
  }}
  openNow={openFromMenu}
  onOpened={() => setOpenFromMenu(false)}
/>
```

### 同梱している写真（OSの画面なので全アプリ共通・撮り直し不要）

```
assets/ios-safari/  1-dots / 2-share / 3-showmore / 4-addhome / 5-add
assets/ios-chrome/  1-share / 2-showmore / 3-addhome / 4-add
assets/common/      icon-safari.png
```

**アプリ固有で用意が必要なのは `done-icon.png`（完成後のホーム画面アイコン）だけ。**
撮り方は `tools/capture-ios-steps.md`。

### 端末の出し分け（自動）

| 端末・環境 | 出るもの |
| --- | --- |
| iOS Safari | 帯は**上**・5手順 |
| iOS Chrome（16.4以降） | 帯は**下**・4手順・上向き矢印 |
| iOS Chrome（16.3以前） | Safari誘導（16.3以前はSafari限定のため） |
| LINE等のアプリ内ブラウザ | Safariアイコン＋脱出ボタン（手順は出さない） |
| ホーム画面から起動 | 「設定できました」→通知の許可の案内 |
| Android | `oneTapAvailable` のときだけ1タップ設置ボタン |
| パソコン | 何も出さない |

### 「追加済みか」の判定（重要）

iOSでは**Safariとホーム画面アプリで保存領域が別**なので端末内の記録では判定できない。
ホーム画面から起動したときにサーバへ記録し、ブラウザ側はそれを読む。
監査ログを使えばスキーマ変更なしで済む。

```ts
app.post("/api/me/installed", async (c) => {
  const u = requireUser(c);
  const has = await db.prepare(
    "SELECT 1 AS x FROM audit_log WHERE actor_id=? AND action='pwa.installed' LIMIT 1",
  ).bind(u.id).first();
  if (!has) await audit(db, u.id, "pwa.installed", "person", u.id);
  return c.json({ ok: true });
});
// /api/me のレスポンスに user.pwa_installed = !!row を足す
```

⚠ 未ログインの訪問者は判定できない（そのときは案内を出してよい）。

### `index.html` に必ず入れるもの

```html
<link rel="manifest" href="/manifest.webmanifest" />
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
<!-- 共有シート最上部のサムネイル。未指定だとページ内の画像が拾われる -->
<meta property="og:image" content="/icons/icon-192.png" />
<!-- ⚠ og:title は部品が書き換える。**必ず置いておく**こと。
     無いと document.title だけになり、Safariで指示が出ないことがある -->
<meta property="og:title" content="アプリ名" />
```

ホーム画面のアイコン名は**4〜7文字程度**に（長いと省略されて本人が見つけられない）。

### LINEで配るとき

URLに `?openExternalBrowser=1` を付ける。LINEはこれを見て、アプリ内ブラウザではなく
端末の既定ブラウザで開く。**LINEで配るリンク・QRは必ずこちらを使う。**

## 6. まだ解けていないこと

- **QRからインストール済みPWAを直接開くこと** — iOSでは不可能。ホーム画面のWebアプリは
  独自URLスキームを持たず、URLは必ずブラウザで開く（Androidは可能）。
  アイコンを見失った人の逃げ道は ①Push通知をタップ ②設定をやり直してアイコンを作り直す。
- **Picture in Picture を保険に使えるか** — 未検証。canvas由来の映像はPiP非対応と判明。
  実ファイルの動画での可否はシミュレータが動画を再生できず判定できなかった。
- **LINE内から `openExternalBrowser=1` へ遷移させる動き** — LINEの版によって効かない
  可能性がある（実機のLINEが無く未検証）。効かない場合の逃げ道は画面に併記済み。

## 7. 出自

- 実装元: 亀戸七丁目北部町会アプリ `src/client/pages/InstallGuide.tsx`
- 検証: 2026-07-30 〜 2026-08-05
- 設計方針の全文: 同アプリ `docs/使い方ガイド設計方針_記憶ゼロ設計.md`
