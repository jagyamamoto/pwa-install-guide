// 表示文言(多言語)。
//
// ⚠ 文言のルール。守らないと高齢者・スマホに不慣れな人には通じない。
//  - 画面に出ている文字は**一字一句そのまま**鍵括弧つきで書く
//  - 動詞は「押す」に統一する(タップ・クリック・選択を混ぜない)
//  - 使ってはいけない語:
//      PWA / インストール / シェアボタン / 共有シート / スクロール /
//      下記URL / こちらをクリック / 簡単3ステップ / スタンドアロン
//  - 「白いところの外側」のような**書き手目線の表現**を使わない。
//    利用者が実際に目にする色・形・文字で書く(実利用テストで通じなかった)
//  - 「かんたん」と書かない(できなかった人を傷つける)
//  - 方向は「上」ではなく「右上」のように**左右まで**書く
//
// ⚠⚠ shareTitleSafari / shareTitleChrome は **15文字以内**。
//    16文字を超えると共有シートで末尾が「…」に切られる(実機で2回確認)。
//    切れた「…」は「まだ続きがある」と誤解させるので、
//    丁寧さより**全部出ること**を優先する。

export type Lang = "ja" | "ja-easy" | "en" | "zh" | "vi";

export type Strings = {
  /* 共有シートの題名(15文字以内) */
  shareTitleSafari: string;
  shareTitleChrome: string;
  /* 帯 */
  bandTitle: string;
  bandLead: string;
  restart: string;
  /* 視線誘導 */
  lookUpRight: string;
  lookDownRight: string;
  /** Edge(Android)だけメニューが画面の下の**まん中**にある。右下と書くと外れる。 */
  lookDownCenter: string;
  /* 開始前 */
  introTitle: string;
  introBody: string;
  introBodyOneTap: string;
  /** Androidで「1回押すだけ」が使えないとき。帯は画面の下に出る。 */
  introBodyAndroid: string;
  introSafety: string;
  start: string;
  addNow: string;
  later: string;
  close: string;
  next: string;
  ok: string;
  reopen: string;
  /* 完了 */
  doneTitle: string;
  doneBody: string;
  doneIconAlt: string;
  /* 通知の許可 */
  notifyTitle: string;
  notifyBody: string;
  notifyMockAlt: string;
  notifyMockText: string;
  notifyNo: string;
  notifyYes: string;
  notifyWhy: string;
  /* アプリ内ブラウザからの脱出 */
  outsideTitle: string;
  outsideBody: string;
  safariIconAlt: string;
  safariLook: string;
  /** Androidの脱出先はSafariではなくChrome。名前と見た目を分けて持つ。 */
  chromeName: string;
  chromeLook: string;
  openExternal: string;
  lineFallback: string;
  lineFallbackAndroid: string;
  inAppFallback: string;
  inAppFallbackAndroid: string;
  sureWay: string;
  sureStep1: string;
  sureStep2: string;
  sureStep2Android: string;
  sureStep3: string;
  sureStep3Android: string;
  copyUrl: string;
  copied: string;
  copiedAndroid: string;
  /* 手順の文言 */
  sfStep1: string;
  sfStep2: string;
  sfStep3: string;
  sfStep4: string;
  sfStep5: string;
  crStep1: string;
  crStep2: string;
  crStep3: string;
  crStep4: string;
  /**
   * Androidの手順。
   *
   * ⚠ 写真は同梱していない。Androidはメーカーの改変でメニューの見た目の差が大きく、
   *   合わない写真は「自分のと違う」と手を止めさせるため、位置を言葉で書いている。
   *
   * ⚠⚠ **押すものの文言をブラウザの「版」から割り出すことはできない。**（2026-08-09 調査）
   *   Chrome 110以降、UAのマイナー版は 0.0.0 に丸められ、取れるのはメジャー番号だけ。
   *   しかもその番号と文言が対応しない（Finch＝サーバ側の実験配信で段階的に変わるため、
   *   同じ Chrome 140 でも「アプリをインストール」と
   *   「インストールしてショートカットを作成」に分かれる）。
   *   さらに文言は端末のUI言語で出るので、日本語ページでも別の言語で表示されうる。
   *   → 1つに断定せず、`agPick*` に**候補を並べて**見比べてもらう。
   *
   * ⚠ agPick* の中身は画面に出ている文字そのものなので、「インストール」を含む。
   *   このファイル冒頭の「使ってはいけない語」は**こちらの地の文**についての規則で、
   *   画面の文字の引用には当てはまらない（規則1「一字一句そのまま鍵括弧つき」が優先）。
   */
  agMenuChrome: string;
  agMenuSamsung: string;
  agMenuFirefox: string;
  agMenuEdge: string;
  agMenuOpera: string;
  agMenuOther: string;
  agPickLead: string;
  agPickChrome: string[];
  agPickSamsung: string[];
  agPickFirefox: string[];
  agPickEdge: string[];
  agPickOpera: string[];
  agPickOther: string[];
  agConfirm: string;
  /* 読み上げ用 */
  altDots: string;
  altShare: string;
  altShowMore: string;
  altAddHome: string;
  altAdd: string;
  altChromeShare: string;
};

const ja: Strings = {
  shareTitleSafari: "最後にホーム画面に追加を押す", // 14文字
  shareTitleChrome: "表示を増やす→ホーム画面に追加", // 15文字

  bandTitle: "設定方法",
  bandLead: "1から順に押していってください",
  restart: "押すものが見つからない → さいしょの画面にもどる",

  lookUpRight: "押すものは、この画面の右上にあります",
  lookDownRight: "押すものは、この画面の右下にあります",
  lookDownCenter: "押すものは、この画面のいちばん下、まん中にあります",

  introTitle: "アプリを使う準備をします",
  introBody: "押すものの写真を画面の上に出しておきます。何も覚えなくて大丈夫です。",
  introBodyOneTap: "下のボタンを1回押すだけで終わります。",
  introBodyAndroid: "押すものの場所を画面の下に出しておきます。何も覚えなくて大丈夫です。",
  introSafety:
    "押し間違えても、途中でやめても、壊れたりお金がかかったりすることは絶対にありません。",
  start: "はじめる",
  addNow: "ホーム画面に追加する",
  later: "あとで",
  close: "やめる",
  next: "つぎへ",
  ok: "わかりました",
  reopen: "ここから最初の設定をする",

  doneTitle: "設定できました",
  doneBody: "次回からも、ホーム画面のこのアイコンを押してください。",
  doneIconAlt: "ホーム画面のアイコン",

  notifyTitle: "あと1つだけ、大切なお願い",
  notifyBody: "このあと下のような確認が出たら、右の「許可」を押してください。",
  notifyMockAlt: "通知の確認画面。右側の許可を押します",
  notifyMockText: "このアプリが通知を送信します。よろしいですか?",
  notifyNo: "許可しない",
  notifyYes: "許可",
  notifyWhy: "「許可」を押さないと、新しいお知らせが届きません。",

  outsideTitle: "この絵のアプリで開き直してください",
  outsideBody: "いまの画面のままでは、ホーム画面に置く設定ができません。",
  safariIconAlt: "Safariのアイコン",
  safariLook: "青い丸に、赤と白の針の絵",
  chromeName: "Chrome",
  chromeLook: "赤・黄・緑の輪の、まん中に青い丸の絵",
  openExternal: "外のブラウザで開く",
  lineFallback:
    "上のボタンで開かないときは、この画面の右下の「…」を押して、「他のアプリで開く」（または「Safariで開く」）を選んでください。",
  lineFallbackAndroid:
    "上のボタンで開かないときは、この画面の右上の「…」を押して、「他のアプリで開く」（または「ブラウザで開く」）を選んでください。",
  inAppFallback:
    "この画面の「…」から「Safariで開く」を選べることがあります。見つからないときは、下のボタンでアドレスを写してください。",
  inAppFallbackAndroid:
    "この画面の「…」から「ブラウザで開く」を選べることがあります。見つからないときは、下のボタンでアドレスを写してください。",
  sureWay: "うまくいかないときの、確実なやり方",
  sureStep1: "このボタンを押します（アドレスが自動で写されます）",
  sureStep2: "ホーム画面にもどって、上の絵の「Safari」を押します",
  sureStep2Android: "ホーム画面にもどって、上の絵の「Chrome」を押します",
  sureStep3: "画面の下の住所の欄を長押しして、「ペーストして開く」を押します",
  sureStep3Android: "画面の上の住所の欄を長押しして、「貼り付けて検索」を押します",
  copyUrl: "アドレスをコピーする",
  copied: "コピーしました。次はSafariを開いてください",
  copiedAndroid: "コピーしました。次はChromeを開いてください",

  sfStep1: "画面の右下の …マークを押す",
  sfStep2: "「共有」を押す",
  sfStep3: "「表示を増やす」を押す",
  sfStep4: "「ホーム画面に追加」を押す",
  sfStep5: "右上の「追加」を押す",

  crStep1: "画面の いちばん上、住所の右にある この印を押す",
  crStep2: "「表示を増やす」を押す",
  crStep3: "「ホーム画面に追加」を押す",
  crStep4: "右上の青い「追加」を押す",

  agMenuChrome: "画面の右上の、たて に3つ ならんだ点を押す",
  agMenuSamsung: "画面の右下の、よこ線が3本ならんだ印を押す",
  agMenuFirefox: "画面の右上の、たて に3つ ならんだ点を押す",
  agMenuEdge: "画面のいちばん下の、まん中の「…」を押す",
  agMenuOpera: "画面の右下の、赤い丸の印を押す",
  agMenuOther: "この画面のメニュー（よこ線3本、または点3つ）を押す",

  agPickLead: "次のどれかが出るので、出ているものを押す",
  agPickChrome: [
    "アプリをインストール",
    "インストールしてショートカットを作成",
    "ホーム画面に追加",
  ],
  agPickSamsung: ["現在のページを追加 → ホーム画面", "ページを追加 → ホーム画面"],
  agPickFirefox: ["ホーム画面に追加", "アプリをインストール"],
  agPickEdge: ["アプリ → このサイトをインストール", "ホーム画面に追加"],
  agPickOpera: ["ホーム画面に追加", "アプリをインストール"],
  agPickOther: ["アプリをインストール", "ホーム画面に追加"],
  agConfirm: "出てきた画面の「インストール」を押す。「追加」と出ることもある",

  altDots: "画面の右下にある点3つのボタン",
  altShare: "共有と書かれた行",
  altShowMore: "表示を増やすボタン",
  altAddHome: "ホーム画面に追加と書かれた行",
  altAdd: "右上の青い追加ボタン",
  altChromeShare: "画面の上、アドレス欄の右にある共有マーク",
};

// やさしい日本語(漢字を減らし、一文を短くする)
const jaEasy: Strings = {
  ...ja,
  shareTitleSafari: "さいごに ホーム画面に追加", // 13文字
  shareTitleChrome: "表示を増やす→ホーム画面に追加",
  bandTitle: "せっていの しかた",
  bandLead: "1から じゅんばんに おしてください",
  restart: "みつからない → さいしょに もどる",
  lookUpRight: "おすものは、この がめんの みぎうえ です",
  lookDownRight: "おすものは、この がめんの みぎした です",
  lookDownCenter: "おすものは、この がめんの いちばん した、まんなか です",
  introTitle: "アプリを つかう じゅんびを します",
  introBody: "おすものの しゃしんを がめんの うえに 出します。おぼえなくて だいじょうぶです。",
  introBodyAndroid: "おすものの ばしょを がめんの したに 出します。おぼえなくて だいじょうぶです。",
  introSafety: "まちがえても、やめても、こわれません。おかねも かかりません。",
  start: "はじめる",
  reopen: "ここから せっていを する",
  doneTitle: "できました",
  doneBody: "つぎからは、この アイコンを おしてください。",
  chromeLook: "あか・きいろ・みどりの わの まんなかに あおい まる",
  agMenuChrome: "がめんの みぎうえの、たてに 3つ ならんだ 点を おす",
  agMenuFirefox: "がめんの みぎうえの、たてに 3つ ならんだ 点を おす",
  agMenuSamsung: "がめんの みぎしたの、よこ線が 3本 ならんだ しるしを おす",
  agMenuEdge: "がめんの いちばん したの、まんなかの「…」を おす",
  agMenuOpera: "がめんの みぎしたの、あかい まるの しるしを おす",
  agMenuOther: "この がめんの メニュー（よこ線3本、または 点3つ）を おす",
  agPickLead: "つぎの どれかが 出ます。出ているものを おす",
  agConfirm: "出てきた がめんの「インストール」を おす。「追加」と 出ることも あります",
};

const en: Strings = {
  ...ja,
  sureWay: "If it still does not work, try this",
  sureStep1: "Tap this button (the address is copied for you)",
  sureStep2: 'Go back to the Home screen and tap "Safari", shown above',
  sureStep3: 'Press and hold the address bar at the bottom, then tap "Paste and Go"',
  copyUrl: "Copy the address",
  copied: "Copied. Now open Safari",
  lineFallback:
    'If the button above does not work, tap the "…" at the bottom right of this screen and choose "Open in another app" (or "Open in Safari").',
  inAppFallback:
    'You may be able to choose "Open in Safari" from the "…" on this screen. If you cannot find it, use the button below to copy the address.',
  altDots: "The three-dot button at the bottom right",
  altShare: 'The row labelled "Share"',
  altShowMore: 'The "Show More" button',
  altAddHome: 'The row labelled "Add to Home Screen"',
  altAdd: 'The blue "Add" button at the top right',
  altChromeShare: "The share mark at the top, right of the address bar",
  shareTitleSafari: "Tap Add to Home Screen",
  shareTitleChrome: "More → Add to Home Screen",
  bandTitle: "How to set up",
  bandLead: "Tap them in order, starting from 1",
  restart: "Can't find it → Back to the first screen",
  lookUpRight: "What you tap is at the TOP RIGHT of this screen",
  lookDownRight: "What you tap is at the BOTTOM RIGHT of this screen",
  lookDownCenter: "What you tap is at the BOTTOM CENTER of this screen",
  introTitle: "Let's get the app ready",
  introBody: "We'll keep photos of what to tap on screen. Nothing to memorize.",
  introBodyOneTap: "Just one tap on the button below.",
  introBodyAndroid: "We'll keep the steps at the bottom of the screen. Nothing to memorize.",
  introSafety:
    "Tapping the wrong thing or stopping partway will never break anything or cost money.",
  start: "Start",
  addNow: "Add to Home Screen",
  later: "Later",
  close: "Close",
  next: "Next",
  ok: "Got it",
  reopen: "Set up the app here",
  doneTitle: "All set",
  doneBody: "From now on, tap this icon on your Home Screen.",
  doneIconAlt: "Home Screen icon",
  notifyTitle: "One last important thing",
  notifyBody: 'When the box below appears, please tap "Allow" on the right.',
  notifyMockAlt: "Notification prompt. Tap Allow on the right",
  notifyMockText: '"This app" would like to send you notifications.',
  notifyNo: "Don't Allow",
  notifyYes: "Allow",
  notifyWhy: 'If you don\'t tap "Allow", new notices will not reach you.',
  outsideTitle: "Please reopen this in the app shown below",
  outsideBody: "You cannot add to the Home Screen from this screen.",
  safariIconAlt: "Safari icon",
  safariLook: "A blue circle with a red and white needle",
  chromeName: "Chrome",
  chromeLook: "A red, yellow and green ring with a blue circle in the middle",
  openExternal: "Open in the outside browser",
  lineFallbackAndroid:
    'If the button above does not work, tap the "…" at the top right of this screen and choose "Open in other app" (or "Open in browser").',
  inAppFallbackAndroid:
    'You may be able to choose "Open in browser" from the "…" on this screen. If you cannot find it, use the button below to copy the address.',
  sureStep2Android: 'Go back to the Home screen and tap "Chrome", shown above',
  sureStep3Android: 'Press and hold the address bar at the top, then tap "Paste and go"',
  copiedAndroid: "Copied. Now open Chrome",
  sfStep1: "Tap the ••• at the bottom right",
  sfStep2: 'Tap "Share"',
  sfStep3: 'Tap "Show More"',
  sfStep4: 'Tap "Add to Home Screen"',
  sfStep5: 'Tap "Add" at the top right',
  crStep1: "Tap this mark at the very top, right of the address",
  crStep2: 'Tap "Show More"',
  crStep3: 'Tap "Add to Home Screen"',
  crStep4: 'Tap the blue "Add" at the top right',
  agMenuChrome: "Tap the three dots stacked vertically at the top right",
  agMenuFirefox: "Tap the three dots stacked vertically at the top right",
  agMenuSamsung: "Tap the three stacked lines at the bottom right",
  agMenuEdge: 'Tap the "…" in the middle of the very bottom of the screen',
  agMenuOpera: "Tap the red circle mark at the bottom right",
  agMenuOther: "Tap this browser's menu (three lines, or three dots)",
  agPickLead: "One of these will appear. Tap whichever you see",
  agPickChrome: ["Install app", "Install and create shortcut", "Add to Home screen"],
  agPickSamsung: ["Add page to → Home screen", "Add current page to → Home screen"],
  agPickFirefox: ["Add to Home screen", "Install app"],
  agPickEdge: ["Apps → Install this site", "Add to Home screen"],
  agPickOpera: ["Add to Home screen", "Install app"],
  agPickOther: ["Install app", "Add to Home screen"],
  agConfirm: 'Tap "Install" on the box that appears. It may say "Add" instead',
};

const zh: Strings = {
  ...ja,
  introBodyOneTap: "只需点按下面的按钮一次即可完成。",
  addNow: "添加到主屏幕",
  later: "以后再说",
  close: "取消",
  next: "下一步",
  ok: "知道了",
  doneIconAlt: "主屏幕上的图标",
  notifyTitle: "还有最后一件重要的事",
  notifyBody: "接下来出现下面的提示时，请点按右侧的「允许」。",
  notifyMockAlt: "通知确认画面。请点按右侧的允许",
  notifyMockText: "此应用要向您发送通知。是否允许？",
  notifyNo: "不允许",
  notifyYes: "允许",
  notifyWhy: "不点按「允许」，新的通知就不会送达。",
  outsideTitle: "请用下图的应用重新打开",
  outsideBody: "保持现在的画面，无法完成添加到主屏幕的设置。",
  safariIconAlt: "Safari 图标",
  safariLook: "蓝色圆形，中间是红白指针",
  chromeName: "Chrome",
  openExternal: "在外部浏览器中打开",
  lineFallback:
    "如果上面的按钮无效，请点按本画面右下角的「…」，选择「用其他应用打开」（或「用 Safari 打开」）。",
  lineFallbackAndroid:
    "如果上面的按钮无效，请点按本画面右上角的「…」，选择「用其他应用打开」（或「用浏览器打开」）。",
  inAppFallback:
    "本画面的「…」中可能有「用 Safari 打开」。找不到时，请用下面的按钮复制网址。",
  inAppFallbackAndroid:
    "本画面的「…」中可能有「用浏览器打开」。找不到时，请用下面的按钮复制网址。",
  sureWay: "还是不行时的可靠做法",
  sureStep1: "点按这个按钮（网址会自动复制）",
  sureStep2: "回到主屏幕，点按上图的「Safari」",
  sureStep3: "长按画面下方的网址栏，点按「粘贴并前往」",
  copyUrl: "复制网址",
  copied: "已复制。接下来请打开 Safari",
  sfStep1: "点按画面右下角的 … 标记",
  sfStep2: "点按「分享」",
  sfStep3: "点按「显示更多」",
  sfStep4: "点按「添加到主屏幕」",
  sfStep5: "点按右上角的「添加」",
  crStep1: "点按画面最上方、网址右侧的这个标记",
  crStep2: "点按「显示更多」",
  crStep3: "点按「添加到主屏幕」",
  crStep4: "点按右上角蓝色的「添加」",
  altDots: "画面右下角的三点按钮",
  altShare: "写着「分享」的一行",
  altShowMore: "「显示更多」按钮",
  altAddHome: "写着「添加到主屏幕」的一行",
  altAdd: "右上角蓝色的添加按钮",
  altChromeShare: "画面上方、网址栏右侧的分享标记",
  shareTitleSafari: "最后请点按 添加到主屏幕",
  shareTitleChrome: "显示更多→添加到主屏幕",
  bandTitle: "设置方法",
  bandLead: "请从 1 开始依次点按",
  restart: "找不到 → 回到第一个画面",
  lookUpRight: "要点按的位置在本画面的右上角",
  lookDownRight: "要点按的位置在本画面的右下角",
  lookDownCenter: "要点按的位置在本画面最下方的中间",
  introTitle: "准备开始使用本应用",
  introBody: "我们会把要点按的位置照片显示在画面上。您不需要记住任何内容。",
  introBodyAndroid: "我们会把操作步骤显示在画面下方。您不需要记住任何内容。",
  introSafety: "即使点错或中途停止，也绝不会损坏设备或产生费用。",
  start: "开始",
  reopen: "在此进行初始设置",
  doneTitle: "设置完成",
  doneBody: "以后请点按主屏幕上的这个图标。",
  chromeLook: "红、黄、绿三色圆环，中间是蓝色圆点",
  sureStep2Android: "回到主屏幕，点按上图的「Chrome」",
  sureStep3Android: "长按画面上方的网址栏，点按「粘贴并搜索」",
  copiedAndroid: "已复制。接下来请打开 Chrome",
  agMenuChrome: "点按画面右上角竖排的三个点",
  agMenuFirefox: "点按画面右上角竖排的三个点",
  agMenuSamsung: "点按画面右下角的三条横线",
  agMenuEdge: "点按画面最下方中间的「…」",
  agMenuOpera: "点按画面右下角的红色圆形标志",
  agMenuOther: "点按本浏览器的菜单（三条横线或三个点）",
  agPickLead: "会出现以下其中一项，请点按您看到的那一项",
  agPickChrome: ["安装应用", "安装并创建快捷方式", "添加到主屏幕"],
  agPickSamsung: ["添加当前页面 → 主屏幕", "添加页面 → 主屏幕"],
  agPickFirefox: ["添加到主屏幕", "安装应用"],
  agPickEdge: ["应用 → 安装此网站", "添加到主屏幕"],
  agPickOpera: ["添加到主屏幕", "安装应用"],
  agPickOther: ["安装应用", "添加到主屏幕"],
  agConfirm: "点按出现的画面中的「安装」。也可能显示为「添加」",
};

const vi: Strings = {
  ...ja,
  introBodyOneTap: "Chỉ cần nhấn một lần vào nút bên dưới là xong.",
  addNow: "Thêm vào Màn hình chính",
  later: "Để sau",
  close: "Hủy",
  next: "Tiếp theo",
  ok: "Đã hiểu",
  doneIconAlt: "Biểu tượng trên Màn hình chính",
  notifyTitle: "Còn một điều quan trọng cuối cùng",
  notifyBody: 'Khi hộp thoại dưới đây hiện ra, hãy nhấn "Cho phép" ở bên phải.',
  notifyMockAlt: "Hộp thoại thông báo. Hãy nhấn Cho phép ở bên phải",
  notifyMockText: "Ứng dụng này muốn gửi thông báo cho bạn. Bạn đồng ý chứ?",
  notifyNo: "Không cho phép",
  notifyYes: "Cho phép",
  notifyWhy: 'Nếu không nhấn "Cho phép", bạn sẽ không nhận được thông báo mới.',
  outsideTitle: "Hãy mở lại bằng ứng dụng trong hình",
  outsideBody: "Với màn hình hiện tại, bạn không thể thêm vào Màn hình chính.",
  safariIconAlt: "Biểu tượng Safari",
  safariLook: "Hình tròn màu xanh dương với kim đỏ trắng ở giữa",
  chromeName: "Chrome",
  openExternal: "Mở bằng trình duyệt bên ngoài",
  lineFallback:
    'Nếu nút ở trên không mở được, hãy nhấn "…" ở góc dưới bên phải màn hình và chọn "Mở bằng ứng dụng khác" (hoặc "Mở bằng Safari").',
  lineFallbackAndroid:
    'Nếu nút ở trên không mở được, hãy nhấn "…" ở góc trên bên phải màn hình và chọn "Mở bằng ứng dụng khác" (hoặc "Mở bằng trình duyệt").',
  inAppFallback:
    'Bạn có thể chọn "Mở bằng Safari" từ dấu "…" trên màn hình này. Nếu không tìm thấy, hãy dùng nút bên dưới để sao chép địa chỉ.',
  inAppFallbackAndroid:
    'Bạn có thể chọn "Mở bằng trình duyệt" từ dấu "…" trên màn hình này. Nếu không tìm thấy, hãy dùng nút bên dưới để sao chép địa chỉ.',
  sureWay: "Cách chắc chắn khi vẫn không được",
  sureStep1: "Nhấn nút này (địa chỉ sẽ tự động được sao chép)",
  sureStep2: 'Quay lại Màn hình chính và nhấn "Safari" như hình trên',
  sureStep3: 'Nhấn giữ thanh địa chỉ ở phía dưới, rồi nhấn "Dán và Truy cập"',
  copyUrl: "Sao chép địa chỉ",
  copied: "Đã sao chép. Bây giờ hãy mở Safari",
  sfStep1: "Nhấn dấu … ở góc dưới bên phải màn hình",
  sfStep2: 'Nhấn "Chia sẻ"',
  sfStep3: 'Nhấn "Hiện thêm"',
  sfStep4: 'Nhấn "Thêm vào Màn hình chính"',
  sfStep5: 'Nhấn "Thêm" ở góc trên bên phải',
  crStep1: "Nhấn dấu này ở trên cùng, bên phải thanh địa chỉ",
  crStep2: 'Nhấn "Hiện thêm"',
  crStep3: 'Nhấn "Thêm vào Màn hình chính"',
  crStep4: 'Nhấn nút "Thêm" màu xanh ở góc trên bên phải',
  altDots: "Nút ba chấm ở góc dưới bên phải màn hình",
  altShare: 'Dòng ghi "Chia sẻ"',
  altShowMore: 'Nút "Hiện thêm"',
  altAddHome: 'Dòng ghi "Thêm vào Màn hình chính"',
  altAdd: 'Nút "Thêm" màu xanh ở góc trên bên phải',
  altChromeShare: "Dấu chia sẻ ở phía trên, bên phải thanh địa chỉ",
  shareTitleSafari: "Cuối cùng: Thêm vào Màn hình chính",
  shareTitleChrome: "Xem thêm → Thêm vào Màn hình chính",
  bandTitle: "Cách thiết lập",
  bandLead: "Hãy nhấn lần lượt từ số 1",
  restart: "Không tìm thấy → Về màn hình đầu tiên",
  lookUpRight: "Thứ cần nhấn nằm ở góc trên bên phải màn hình",
  lookDownRight: "Thứ cần nhấn nằm ở góc dưới bên phải màn hình",
  lookDownCenter: "Thứ cần nhấn nằm ở chính giữa dưới cùng màn hình",
  introTitle: "Chuẩn bị để dùng ứng dụng",
  introBody: "Ảnh của những chỗ cần nhấn sẽ luôn hiện trên màn hình. Bạn không cần ghi nhớ gì.",
  introBodyAndroid: "Các bước sẽ luôn hiện ở phía dưới màn hình. Bạn không cần ghi nhớ gì.",
  introSafety: "Nhấn sai hoặc dừng giữa chừng cũng không làm hỏng máy và không mất phí.",
  start: "Bắt đầu",
  reopen: "Thiết lập lần đầu tại đây",
  doneTitle: "Đã thiết lập xong",
  doneBody: "Từ lần sau, hãy nhấn biểu tượng này trên màn hình chính.",
  chromeLook: "Vòng tròn đỏ, vàng, xanh lá với chấm xanh dương ở giữa",
  sureStep2Android: 'Quay lại màn hình chính và nhấn "Chrome" như hình trên',
  sureStep3Android: 'Nhấn giữ thanh địa chỉ ở phía trên, rồi nhấn "Dán và tìm kiếm"',
  copiedAndroid: "Đã sao chép. Bây giờ hãy mở Chrome",
  agMenuChrome: "Nhấn ba chấm dọc ở góc trên bên phải màn hình",
  agMenuFirefox: "Nhấn ba chấm dọc ở góc trên bên phải màn hình",
  agMenuSamsung: "Nhấn ba vạch ngang ở góc dưới bên phải màn hình",
  agMenuEdge: 'Nhấn dấu "…" ở chính giữa dưới cùng màn hình',
  agMenuOpera: "Nhấn biểu tượng hình tròn màu đỏ ở góc dưới bên phải",
  agMenuOther: "Nhấn menu của trình duyệt (ba vạch hoặc ba chấm)",
  agPickLead: "Một trong những mục sau sẽ hiện ra. Hãy nhấn mục bạn nhìn thấy",
  agPickChrome: ["Cài đặt ứng dụng", "Cài đặt và tạo lối tắt", "Thêm vào Màn hình chính"],
  agPickSamsung: ["Thêm trang hiện tại → Màn hình chính", "Thêm trang → Màn hình chính"],
  agPickFirefox: ["Thêm vào Màn hình chính", "Cài đặt ứng dụng"],
  agPickEdge: ["Ứng dụng → Cài đặt trang này", "Thêm vào Màn hình chính"],
  agPickOpera: ["Thêm vào Màn hình chính", "Cài đặt ứng dụng"],
  agPickOther: ["Cài đặt ứng dụng", "Thêm vào Màn hình chính"],
  agConfirm: 'Nhấn "Cài đặt" trên hộp thoại hiện ra. Cũng có thể hiển thị là "Thêm"',
};

export const STRINGS: Record<Lang, Strings> = { ja, "ja-easy": jaEasy, en, zh, vi };
