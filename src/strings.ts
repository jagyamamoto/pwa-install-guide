// 表示文言(多言語)。
//
// ⚠ 文言のルール(高齢者・スマホに不慣れな人向け)。守らないと通じない:
//  - 画面に出ている文字は**一字一句そのまま**鍵括弧つきで書く。
//  - 動詞は「押す」に統一する(タップ・クリック・選択を混ぜない)。
//  - 使ってはいけない語: PWA / インストール / シェアボタン / 共有シート /
//    スクロール / 下記URL / こちらをクリック / 簡単3ステップ
//  - 「白いところの外側」のような書き手目線の表現を使わない。
//    利用者が実際に目にする色・形・文字で書く。
//  - 「かんたん」と書かない(できなかった人を傷つける)。

export type Lang = "ja" | "ja-easy" | "en" | "zh" | "vi";

export type Strings = {
  /** 帯の見出し */
  bandTitle: string;
  /** 帯の副題 */
  bandLead: string;
  /** 開始前の見出し */
  introTitle: string;
  introBody: string;
  /** 誤りゼロ設計の安心保証。必ず開始前に見せる。 */
  introSafety: string;
  start: string;
  later: string;
  close: string;
  /** 迷ったときに最初へ戻るボタン */
  restart: string;
  /** 閉じたあとに出る小さな入口 */
  reopen: string;
  /** 追加完了後(ホーム画面から起動したとき) */
  doneTitle: string;
  doneBody: string;
  doneIconAlt: string;
  /** Safari以外で開かれたとき */
  safariTitle: string;
  safariBody: string;
  safariStep1: string;
  safariStep2: string;
  safariStep3: string;
  copyUrl: string;
  copied: string;
};

export const STRINGS: Record<Lang, Strings> = {
  ja: {
    bandTitle: "設定方法",
    bandLead: "1から順に押していってください",
    introTitle: "アプリを使う準備をします",
    introBody: "押すものの写真を画面の上に出しておきます。何も覚えなくて大丈夫です。",
    introSafety:
      "押し間違えても、途中でやめても、壊れたりお金がかかったりすることは絶対にありません。",
    start: "はじめる",
    later: "あとで",
    close: "やめる",
    restart: "押すものが見つからない → さいしょの画面にもどる",
    reopen: "ここから最初の設定をする",
    doneTitle: "設定できました",
    doneBody: "次回からも、ホーム画面のこのアイコンを押してください。",
    doneIconAlt: "ホーム画面のアイコン",
    safariTitle: "青いコンパスの「Safari」で開いてください",
    safariBody: "この画面では、ホーム画面への設定ができません。次の順でSafariに移ってください。",
    safariStep1: "このボタンを押します(アドレスが自動で写されます)",
    safariStep2: "ホーム画面にもどって、青いコンパスの「Safari」を開きます",
    safariStep3: "画面下の住所欄を長押しして、「ペーストして開く」を押します",
    copyUrl: "アドレスをコピーする",
    copied: "コピーしました。次はSafariを開いてください",
  },

  // やさしい日本語(漢字を減らし、一文を短くする)
  "ja-easy": {
    bandTitle: "せっていの しかた",
    bandLead: "1から じゅんばんに おしてください",
    introTitle: "アプリを つかう じゅんびを します",
    introBody: "おすものの しゃしんを 画面の うえに 出します。おぼえなくて だいじょうぶです。",
    introSafety: "まちがえても、やめても、こわれません。おかねも かかりません。",
    start: "はじめる",
    later: "あとで",
    close: "やめる",
    restart: "みつからない → さいしょに もどる",
    reopen: "ここから せっていを する",
    doneTitle: "できました",
    doneBody: "つぎからは、この アイコンを おしてください。",
    doneIconAlt: "ホームがめんの アイコン",
    safariTitle: "あおい コンパスの「Safari」で ひらいてください",
    safariBody: "この がめんでは せっていが できません。つぎの じゅんばんで Safariに いきます。",
    safariStep1: "このボタンを おします(アドレスが コピーされます)",
    safariStep2: "ホームがめんに もどって、あおい コンパスを ひらきます",
    safariStep3: "がめんの したの じゅうしょの ところを ながおしして「ペーストして ひらく」を おします",
    copyUrl: "アドレスを コピーする",
    copied: "コピーしました。つぎは Safariを ひらいてください",
  },

  en: {
    bandTitle: "How to set up",
    bandLead: "Tap them in order, starting from 1",
    introTitle: "Let's get the app ready",
    introBody: "We'll keep photos of what to tap at the top of the screen. Nothing to memorize.",
    introSafety: "Tapping the wrong thing or stopping partway will never break anything or cost money.",
    start: "Start",
    later: "Later",
    close: "Close",
    restart: "Can't find it → Back to the first screen",
    reopen: "Set up the app here",
    doneTitle: "All set",
    doneBody: "From now on, tap this icon on your Home Screen.",
    doneIconAlt: "Home Screen icon",
    safariTitle: "Please open this in Safari (the blue compass)",
    safariBody: "This screen can't add to the Home Screen. Move to Safari like this.",
    safariStep1: "Tap this button (the address is copied for you)",
    safariStep2: "Go to the Home Screen and open Safari (the blue compass)",
    safariStep3: "Press and hold the address bar, then tap Paste and Go",
    copyUrl: "Copy the address",
    copied: "Copied. Now open Safari",
  },

  zh: {
    bandTitle: "设置方法",
    bandLead: "请从 1 开始依次点按",
    introTitle: "准备开始使用本应用",
    introBody: "我们会把要点按的位置照片显示在屏幕上方。您不需要记住任何内容。",
    introSafety: "即使点错或中途停止，也绝不会损坏设备或产生费用。",
    start: "开始",
    later: "以后再说",
    close: "关闭",
    restart: "找不到 → 回到第一个画面",
    reopen: "在此进行初始设置",
    doneTitle: "设置完成",
    doneBody: "以后请点按主屏幕上的这个图标。",
    doneIconAlt: "主屏幕图标",
    safariTitle: "请用蓝色指南针「Safari」打开",
    safariBody: "此画面无法添加到主屏幕。请按以下顺序切换到 Safari。",
    safariStep1: "点按此按钮(网址会自动复制)",
    safariStep2: "回到主屏幕，打开蓝色指南针 Safari",
    safariStep3: "长按屏幕下方的网址栏，点按「粘贴并前往」",
    copyUrl: "复制网址",
    copied: "已复制。接下来请打开 Safari",
  },

  vi: {
    bandTitle: "Cách thiết lập",
    bandLead: "Hãy nhấn lần lượt từ số 1",
    introTitle: "Chuẩn bị để dùng ứng dụng",
    introBody: "Ảnh của những chỗ cần nhấn sẽ luôn hiện ở phía trên. Bạn không cần ghi nhớ gì.",
    introSafety: "Nhấn sai hoặc dừng giữa chừng cũng không làm hỏng máy và không mất phí.",
    start: "Bắt đầu",
    later: "Để sau",
    close: "Đóng",
    restart: "Không tìm thấy → Về màn hình đầu tiên",
    reopen: "Thiết lập lần đầu tại đây",
    doneTitle: "Đã thiết lập xong",
    doneBody: "Từ lần sau, hãy nhấn biểu tượng này trên màn hình chính.",
    doneIconAlt: "Biểu tượng trên màn hình chính",
    safariTitle: "Hãy mở bằng «Safari» (la bàn màu xanh)",
    safariBody: "Màn hình này không thêm được vào màn hình chính. Hãy chuyển sang Safari.",
    safariStep1: "Nhấn nút này (địa chỉ sẽ được sao chép)",
    safariStep2: "Về màn hình chính và mở Safari (la bàn màu xanh)",
    safariStep3: "Nhấn giữ thanh địa chỉ ở dưới, rồi chọn «Paste and Go»",
    copyUrl: "Sao chép địa chỉ",
    copied: "Đã sao chép. Bây giờ hãy mở Safari",
  },
};
