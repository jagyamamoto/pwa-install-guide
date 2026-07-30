// PWA「ホーム画面に追加」案内 — 汎用版(高齢者・スマホに不慣れな人向け)
//
// 設計の根拠と実測値は ../README.md を必ず読むこと。要点だけ再掲する:
//
//  1. 記憶ゼロ設計
//     利用者は「見たものを覚えて操作する」ことができない前提。よって手順を
//     自動で進めない。5手順を実物スクリーンショット付きで常時ぜんぶ出し、
//     利用者は自分の画面と写真を見比べるだけでよい(再認のみ)。
//     ⚠ 時間で自動的に進める実装は実機テストで失敗した。戻さないこと。
//
//  2. 共有シートに隠れない位置
//     iOSの共有シートは画面下から現れ、上端は画面の上から約42.7%。
//     iPhone 17e(390x844pt) / iPhone SE第3世代(375x667pt) の実測で比率はほぼ一定。
//     案内はこの範囲(上から42%以内)に収める。
//     シート表示中もページのJS・アニメーションは動き続ける(実測済み)。
//
//  3. 見た目をアプリ本体と変える
//     アプリと同じ配色だと「指示」だと気づかれない。黄色地+黒文字
//     (道路標識と同じ最高コントラスト)にして別物だと一目で分かるようにする。
//
//  4. 設定中は背景を完全に隠す
//     後ろに通常画面が見えていると「どちらを操作するのか」で迷う。
//
//  5. 閉じても必ず戻れる
//     ×で閉じた**その瞬間**に小さな入口へ切り替える。リロード待ちにすると
//     誤って閉じた人が詰む。メニューにも常設の入口を置く。
//
//  6. iOSでは「追加済みか」を端末側で判定できない
//     Safariとホーム画面アプリは保存領域が別。ホーム画面から起動したときに
//     サーバへ記録し、Safari側はそれを読む(onInstalled / installed プロパティ)。
import { useEffect, useRef, useState } from "react";
import { type Lang, type Strings, STRINGS } from "./strings";

export type InstallStep = {
  /** 押す場所だけを切り抜いた実機スクリーンショット。赤い印は1枚に1つ。 */
  img: string;
  /** 読み上げ用。画面に出ている文字をそのまま含める。 */
  alt: string;
  /** 手順の説明。画面に表示されている文字を鍵括弧つきでそのまま使う。 */
  label: string;
};

export type InstallGuideConfig = {
  /** 本番URL。Safari以外で開かれたときのコピー用。 */
  appUrl: string;
  /** 共有シート最上部に注入する指示文(約20文字で省略される)。 */
  injectedTitle?: string;
  /** iOSの手順。省略すると STRINGS の既定文言＋既定の画像パスを使う。 */
  steps: InstallStep[];
  /** 完成後のホーム画面アイコン画像(実機の切り抜き)。 */
  doneIconImg?: string;
  /** localStorage のキー接頭辞。1つの端末で複数アプリを使う場合に分ける。 */
  storagePrefix?: string;
  /** 帯・入口の配色。既定は黄色地+黒文字(変更は非推奨)。 */
  theme?: { bg?: string; fg?: string };
  /** 表示言語。 */
  lang?: Lang;
  /** ホーム画面から起動したことを検知したときに呼ばれる(サーバ記録用)。 */
  onInstalled?: () => void;
  /**
   * 追加済みだと分かっている場合 true。true の間は案内を一切出さない。
   * iOSはSafariとホーム画面アプリで保存領域が別なので、サーバ側の記録を渡す。
   */
  installed?: boolean;
};

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export function isIOS(): boolean {
  return /iPhone|iPad|iPod/.test(navigator.userAgent);
}

export function isAndroid(): boolean {
  return /Android/.test(navigator.userAgent);
}

/**
 * iOSのSafari本体か。
 * LINE・Gmail・Chrome(CriOS)などのアプリ内ブラウザでは「ホーム画面に追加」が
 * できないため、手順を見せずSafariへ移る案内だけを出す。
 */
export function isIOSSafari(): boolean {
  const ua = navigator.userAgent;
  if (!isIOS()) return false;
  return !/CriOS|FxiOS|EdgiOS|Line\/|FBAN|FBAV|Instagram|GSA\/|YJApp|Twitter/i.test(ua);
}

function CopyUrlButton({ url, t }: { url: string; t: Strings }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="ig-copy-btn"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
        } catch {
          // clipboard API が使えない端末向けの保険
          const ta = document.createElement("textarea");
          ta.value = url;
          document.body.appendChild(ta);
          ta.select();
          try {
            document.execCommand("copy");
            setCopied(true);
          } catch {
            /* 失敗したら文字は変えない(押し直してもらう) */
          }
          document.body.removeChild(ta);
        }
      }}
    >
      {copied ? t.copied : t.copyUrl}
    </button>
  );
}

/** 画面上部に固定する案内。手順を常時ぜんぶ表示する(自動で進めない)。 */
function GuideBand({
  cfg,
  t,
  onDismiss,
  onRestart,
}: {
  cfg: InstallGuideConfig;
  t: Strings;
  onDismiss: () => void;
  onRestart: () => void;
}) {
  const originalTitle = useRef(document.title);

  // 共有シートの最上部にはページタイトルが表示される。そこにも指示を出す
  // (実機検証で確認済み。約20文字で省略されるので短文にする)。
  useEffect(() => {
    if (!cfg.injectedTitle) return;
    document.title = cfg.injectedTitle;
    return () => {
      document.title = originalTitle.current;
    };
  }, [cfg.injectedTitle]);

  return (
    <div className="ig-band" role="region" aria-label={t.bandTitle}>
      <div className="ig-band-head">
        <span className="ig-band-title">{t.bandTitle}</span>
        <span className="ig-band-label">{t.bandLead}</span>
        <button className="ig-band-close" onClick={onDismiss} aria-label={t.close}>
          ×
        </button>
      </div>

      <ol className="ig-steps">
        {cfg.steps.map((s, i) => (
          <li className="ig-step-row" key={s.img}>
            <span className="ig-step-num">{i + 1}</span>
            <img className="ig-step-img" src={s.img} alt={s.alt} />
            <span className="ig-step-label">{s.label}</span>
          </li>
        ))}
      </ol>

      {/* 迷ったときの退避。実際には黄色い帯のどこを押しても開いているシートは
          閉じるが、「どこでも押せる」では伝わらないのでボタンとして見せる。 */}
      <button className="ig-band-back" onClick={onRestart}>
        {t.restart}
      </button>
    </div>
  );
}

export default function InstallGuide({
  config,
  openNow,
  onOpened,
}: {
  config: InstallGuideConfig;
  /** メニュー等から強制的に開くきっかけ */
  openNow?: boolean;
  onOpened?: () => void;
}) {
  const cfg = config;
  const t = STRINGS[cfg.lang ?? "ja"];
  const prefix = cfg.storagePrefix ?? "installGuide";
  const DISMISS_KEY = `${prefix}Closed`;
  const WELCOME_KEY = `${prefix}WelcomeDone`;

  const [mode, setMode] = useState<
    "hidden" | "welcome" | "intro" | "guide" | "safari" | "reopen"
  >("hidden");

  useEffect(() => {
    if (isStandalone()) {
      // ホーム画面のアイコンから起動できている=追加済み。
      // サーバに記録しておき、次にブラウザで開いたときは案内を出さない。
      cfg.onInstalled?.();
      if (!localStorage.getItem(WELCOME_KEY)) setMode("welcome");
      return;
    }
    // Androidは Chrome の beforeinstallprompt で1タップ設置できるので、
    // そちらの導線に任せる(このコンポーネントはiOS専用の救済)。
    if (!isIOS()) return;
    if (cfg.installed) return; // 追加済みと分かっている人には出さない
    // ⚠ 一度閉じても「二度と出ない」にしない。誤って閉じた人が詰むため、
    //   閉じたあとは小さな入口(reopen)を必ず出す。
    if (localStorage.getItem(DISMISS_KEY)) {
      setMode(isIOSSafari() ? "reopen" : "hidden");
      return;
    }
    setMode(isIOSSafari() ? "intro" : "safari");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg.installed]);

  // メニュー等から呼ばれたら、閉じていても必ず開く
  useEffect(() => {
    if (!openNow) return;
    localStorage.removeItem(DISMISS_KEY);
    setMode(isIOSSafari() ? "intro" : "safari");
    onOpened?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openNow]);

  if (mode === "hidden") return null;

  // 閉じたら、その場で小さな入口に切り替える。
  // ⚠ ここで hidden にすると、リロードするまで入口が出ず詰む。
  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, new Date().toISOString());
    setMode(isIOSSafari() ? "reopen" : "hidden");
  };

  if (mode === "reopen") {
    return (
      <button
        className="ig-reopen"
        onClick={() => {
          localStorage.removeItem(DISMISS_KEY);
          setMode("intro");
        }}
      >
        {t.reopen}
      </button>
    );
  }

  if (mode === "welcome") {
    return (
      <div className="ig-welcome">
        <h2 className="ig-welcome-title">{t.doneTitle}</h2>
        {cfg.doneIconImg && (
          <img className="ig-done-icon" src={cfg.doneIconImg} alt={t.doneIconAlt} />
        )}
        <p className="ig-welcome-body">{t.doneBody}</p>
        <button
          className="ig-intro-btn"
          onClick={() => {
            localStorage.setItem(WELCOME_KEY, "1");
            setMode("hidden");
          }}
        >
          {t.start}
        </button>
      </div>
    );
  }

  // Safari以外(LINE内ブラウザ等)。手順は見せず、Safariへ移る案内だけ。
  if (mode === "safari") {
    return (
      <div className="ig-fullscreen ig-fullscreen-center">
        <div className="ig-intro">
          <div className="ig-intro-head">
            <h2 className="ig-intro-title">{t.safariTitle}</h2>
            <button className="ig-band-close" onClick={dismiss} aria-label={t.later}>
              ×
            </button>
          </div>
          <p className="ig-intro-body">{t.safariBody}</p>
          <ol className="ig-safari-steps">
            <li>
              {t.safariStep1}
              <div style={{ margin: "10px 0" }}>
                <CopyUrlButton url={cfg.appUrl} t={t} />
              </div>
            </li>
            <li>{t.safariStep2}</li>
            <li>{t.safariStep3}</li>
          </ol>
        </div>
      </div>
    );
  }

  // 設定中は背景(ふだんの画面)を完全に隠す。
  // ⚠ 後ろが見えていると「どちらを操作するのか」で迷う。半透明に戻さないこと。
  if (mode === "guide") {
    return (
      <div className="ig-fullscreen">
        <GuideBand cfg={cfg} t={t} onDismiss={dismiss} onRestart={() => setMode("intro")} />
      </div>
    );
  }

  // mode === "intro": 開始前。誤りゼロ設計の安心保証をここで先に伝える。
  return (
    <div className="ig-fullscreen ig-fullscreen-center">
      <div className="ig-intro">
        <div className="ig-intro-head">
          <h2 className="ig-intro-title">{t.introTitle}</h2>
          <button className="ig-band-close" onClick={dismiss} aria-label={t.later}>
            ×
          </button>
        </div>
        <p className="ig-intro-body">{t.introBody}</p>
        <p className="ig-intro-note">{t.introSafety}</p>
        <button className="ig-intro-btn" onClick={() => setMode("guide")}>
          {t.start}
        </button>
      </div>
    </div>
  );
}
