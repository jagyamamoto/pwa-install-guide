// PWA「ホーム画面に追加」案内 — 汎用版
//
// 高齢者・スマホに不慣れな人が**自力で**ホーム画面にアイコンを置けるようにする部品。
// ある町内会アプリで、実機テストと修正を繰り返して到達した形をそのまま部品化した。
//
// ⚠ 設計の根拠(実測値と、失敗して捨てた実装)は ../README.md に全部書いてある。
//   コードだけ写して根拠を捨てると、同じ失敗を必ず繰り返す。特に次の5つ:
//     1. 手順を時間で自動送りしない(実機で必ずズレる)
//     2. 帯は共有ボタンと**反対側**に置く(自分で隠す/色が同化するため)
//     3. 全面を1色で塗らない(ブラウザのバーまで染まり、共有ボタンが同化する)
//     4. 共有シートの題名は document.title と og:title の**両方**を書き換える
//     5. その題名は**15文字以内**(超えると「…」で切れる)
import { useEffect, useState } from "react";
import { type Lang, type Strings, STRINGS } from "./strings";

export type Step = {
  img?: string;
  alt?: string;
  label: string;
  /**
   * 押すものの**候補**。機種やブラウザの版で文字が違うときに並べて見せる。
   * ⚠ 1つに絞らないこと。Androidのメニューの文言は端末ごとに違い、
   *   外した1つを断定で書くと「そんなものは無い」で手が止まる。
   *   並べておけば、利用者は自分の画面と見比べて選ぶだけで済む（再認のみ）。
   */
  options?: string[];
};

/** Androidのブラウザの系統。メニューの位置と文言がここで決まる。 */
export type AndroidBrowser = "chrome" | "samsung" | "firefox" | "edge" | "opera" | "other";

export type InstallGuideConfig = {
  /** 本番URL。アプリ内ブラウザから抜けるときのコピー用。 */
  appUrl: string;
  /** 画像の置き場所。assets/ をここへ配置する(例: "/help/img")。 */
  assetBase: string;
  /** 完成後のホーム画面アイコンの写真(アプリ固有。実機から切り出す)。 */
  doneIconImg?: string;
  /** 表示言語。既定は ja。 */
  lang?: Lang;
  /** localStorage キーの接頭辞。1端末で複数アプリを使うときに分ける。 */
  storagePrefix?: string;
  /**
   * 追加済みだと分かっているとき true。true の間は案内を出さない。
   * ⚠ iOSはSafariとホーム画面アプリで**保存領域が別**なので端末側では判定できない。
   *   サーバ側の記録を渡すこと(README「追加済みかの判定」)。
   */
  installed?: boolean;
  /** ホーム画面から起動したことを検知したとき。サーバへ記録する用。 */
  onInstalled?: () => void;
  /** Android/Chromeの「1回押すだけ」が使えるか。 */
  oneTapAvailable?: boolean;
  /** その「1回押すだけ」を実行する。 */
  onOneTapInstall?: () => Promise<unknown> | void;
  /** 手順を差し替えたいとき(通常は不要。既定で同梱の写真を使う)。 */
  iosSafariSteps?: Step[];
  iosChromeSteps?: Step[];
  /** Androidの手順。既定は写真なしの文字だけ(理由は defaultAndroidSteps)。 */
  androidSteps?: Step[];
  /** Androidのアプリ内ブラウザから逃がすときに見せるChromeのアイコン画像。 */
  chromeIconImg?: string;
};

/**
 * Androidの `beforeinstallprompt` は**ページ表示より遅れて届く**。
 * ⚠ 届く前に判定すると「1回押すだけ」を取り逃がす。実機で 200〜800ms 程度かかった。
 *   余裕を見て、この時間だけ待ってから最初の画面を出す。
 */
const ANDROID_PROMPT_GRACE_MS = 1200;

/* ============ 端末とブラウザの判定 ============ */

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
  return /Android/i.test(navigator.userAgent);
}

/** iOSのSafari本体か。LINE・Chrome等のアプリ内ブラウザを除外する。 */
export function isIOSSafari(): boolean {
  if (!isIOS()) return false;
  return !/CriOS|FxiOS|EdgiOS|Line\/|FBAN|FBAV|Instagram|GSA\/|YJApp|Twitter/i.test(
    navigator.userAgent,
  );
}

/** iPhoneのChromeか(UAに CriOS が入る)。 */
export function isIOSChrome(): boolean {
  return isIOS() && /CriOS/i.test(navigator.userAgent);
}

/** LINEのアプリ内ブラウザか。 */
export function isLineBrowser(): boolean {
  return /Line\//i.test(navigator.userAgent);
}

/**
 * Androidのアプリ内ブラウザ(LINE・Facebook・Instagram等)か。
 * ここからはホーム画面に追加できないので、外のブラウザへ逃がすしかない。
 * `; wv)` はAndroid標準のWebViewが名乗る印。
 */
export function isAndroidInApp(): boolean {
  if (!isAndroid()) return false;
  return /Line\/|FBAN|FBAV|Instagram|Twitter|; wv\)/i.test(navigator.userAgent);
}

/**
 * Androidのブラウザの系統を見る。
 *
 * ⚠ **文言をブラウザの「版」から割り出すことはできない。**（2026-08-09 調査）
 *   1. Chrome 110以降、UAのマイナー版は `0.0.0` に丸められる。取れるのはメジャー番号だけ
 *   2. そのメジャー番号と文言が対応しない。文言の変更は Finch（サーバ側の実験配信）で
 *      段階的に配られるため、**同じ Chrome 140 でも端末により
 *      「アプリをインストール」と「インストールしてショートカットを作成」が分かれる**
 *   3. 文言はサイトの言語ではなく**端末のUI言語**で出る
 *   → だから1つに断定せず、系統だけ見て**候補を並べる**（Step.options）。
 *
 * ⚠ 判定の順番を変えないこと。Samsung・Edge・Opera のUAには Chrome/ が入っている。
 */
export function androidBrowser(): AndroidBrowser {
  const ua = navigator.userAgent;
  if (/SamsungBrowser/i.test(ua)) return "samsung";
  if (/EdgA\//i.test(ua)) return "edge";
  if (/OPR\//i.test(ua)) return "opera";
  if (/Firefox\//i.test(ua)) return "firefox";
  if (/Chrome\//i.test(ua)) return "chrome";
  return "other";
}

/**
 * そのブラウザのメニューが画面の**上**にあるか。帯はこの反対側に置く。
 * Chrome・Firefox は右上の ⋮ / Samsung・Edge・Opera は画面の下。
 */
export function androidMenuIsUp(b: AndroidBrowser): boolean {
  return b === "chrome" || b === "firefox" || b === "other";
}

/** iOSのバージョン(例: 18.4)。取れないときは null。 */
export function iosVersion(): number | null {
  const m = navigator.userAgent.match(/OS (\d+)[_.](\d+)/);
  return m ? Number(m[1]) + Number(m[2]) / 10 : null;
}

/**
 * Safari以外のブラウザから追加できるのは **iOS 16.4 以降**。16.3以前はSafari限定。
 * 出典: MDN https://developer.mozilla.org/ja/docs/Web/Progressive_web_apps/Guides/Installing
 */
export function canInstallOutsideSafari(): boolean {
  const v = iosVersion();
  return v === null ? true : v >= 16.4; // 判定できないときは出す側に倒す
}

/* ============ 共有シートの題名 ============ */

/**
 * 共有シートの最上部に出る題名を書き換える。
 * ⚠ Safariは document.title より **og:title を優先する**。両方書き換えること。
 *   片方だけにして、元の題名が出てしまった事故がある(実機で確認)。
 * ⚠ 文字数は **15文字以内**。16文字を超えると末尾が「…」で切られる(実機で2回確認)。
 */
export function setShareTitle(text: string): () => void {
  const prevDoc = document.title;
  const og = document.querySelector('meta[property="og:title"]');
  const prevOg = og?.getAttribute("content") ?? null;
  document.title = text;
  og?.setAttribute("content", text);
  return () => {
    document.title = prevDoc;
    if (og && prevOg !== null) og.setAttribute("content", prevOg);
  };
}

/* ============ 既定の手順(写真は assets/ に同梱) ============ */

function defaultSafariSteps(base: string, t: Strings): Step[] {
  return [
    { img: `${base}/ios-safari/1-dots.png`, alt: t.altDots, label: t.sfStep1 },
    { img: `${base}/ios-safari/2-share.png`, alt: t.altShare, label: t.sfStep2 },
    { img: `${base}/ios-safari/3-showmore.png`, alt: t.altShowMore, label: t.sfStep3 },
    { img: `${base}/ios-safari/4-addhome.png`, alt: t.altAddHome, label: t.sfStep4 },
    { img: `${base}/ios-safari/5-add.png`, alt: t.altAdd, label: t.sfStep5 },
  ];
}

function defaultChromeSteps(base: string, t: Strings): Step[] {
  return [
    { img: `${base}/ios-chrome/1-share.jpg`, alt: t.altChromeShare, label: t.crStep1 },
    { img: `${base}/ios-chrome/2-showmore.jpg`, alt: t.altShowMore, label: t.crStep2 },
    { img: `${base}/ios-chrome/3-addhome.jpg`, alt: t.altAddHome, label: t.crStep3 },
    { img: `${base}/ios-chrome/4-add.jpg`, alt: t.altAdd, label: t.crStep4 },
  ];
}

/**
 * Androidの手順。**写真は付けない。**
 * Androidはメーカーごとにメニューの見た目が違い、合わない写真は
 * 「自分のと違う」と手を止めさせる。位置を言葉で書くほうが確実だった。
 * 自分の端末の写真を撮ったら `androidSteps` で差し替えられる。
 *
 * 2段目は**候補を並べる**。理由は androidBrowser() の注記のとおり、
 * 文言をブラウザの版から割り出すことができないため。
 */
function defaultAndroidSteps(t: Strings, b: AndroidBrowser): Step[] {
  const menu =
    b === "samsung"
      ? t.agMenuSamsung
      : b === "edge"
        ? t.agMenuEdge
        : b === "opera"
          ? t.agMenuOpera
          : b === "firefox"
            ? t.agMenuFirefox
            : b === "chrome"
              ? t.agMenuChrome
              : t.agMenuOther;
  const options =
    b === "samsung"
      ? t.agPickSamsung
      : b === "edge"
        ? t.agPickEdge
        : b === "opera"
          ? t.agPickOpera
          : b === "firefox"
            ? t.agPickFirefox
            : b === "chrome"
              ? t.agPickChrome
              : t.agPickOther;
  return [
    { label: menu },
    { label: t.agPickLead, options },
    { label: t.agConfirm },
  ];
}

/* ============ 部品 ============ */

function CopyUrlButton({
  url,
  label,
  doneLabel,
}: {
  url: string;
  label: string;
  /** 写したあとの文字。逃がす先のブラウザ名が入るので端末で変わる。 */
  doneLabel: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="ig-copy-btn"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
        } catch {
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
      {copied ? doneLabel : label}
    </button>
  );
}

/**
 * 手順の帯。**手順は常時ぜんぶ出す。自動で送らない。**
 * 利用者は自分の画面と写真を見比べて選ぶだけでよい(記憶も待ちも不要)。
 */
function GuideBand({
  steps,
  t,
  place,
  onDismiss,
  onRestart,
}: {
  steps: Step[];
  t: Strings;
  /**
   * ⚠ 帯は共有ボタンと**反対側**に置く。理由は2つ:
   *   1. 同じ側だと押すべきボタンを自分で隠す
   *   2. 帯を置いた側の端が色づき、ブラウザのバーまで染まって同化する
   *   Safari(共有は下) → "top" / Chrome(共有は上) → "bottom"
   */
  place: "top" | "bottom";
  onDismiss: () => void;
  onRestart: () => void;
}) {
  // 共有シートの題名の差し替えは iOS だけ。Androidの「ホーム画面に追加」は
  // document.title ではなく manifest の名前を出すので、変えると混乱するだけ。
  useEffect(() => {
    if (!isIOS()) return;
    return setShareTitle(place === "bottom" ? t.shareTitleChrome : t.shareTitleSafari);
  }, [place, t]);

  return (
    <div
      className={`ig-band${place === "bottom" ? " ig-band-bottom" : ""}`}
      role="region"
      aria-label={t.bandTitle}
    >
      <div className="ig-band-head">
        <span className="ig-band-title">{t.bandTitle}</span>
        <span className="ig-band-label">{t.bandLead}</span>
        <button className="ig-band-close" onClick={onDismiss} aria-label={t.close}>
          ×
        </button>
      </div>

      <ol className="ig-steps">
        {steps.map((s, i) => (
          <li className="ig-step-row" key={s.label}>
            <span className="ig-step-num">{i + 1}</span>
            {s.img && <img className="ig-step-img" src={s.img} alt={s.alt} />}
            <span className="ig-step-label">
              {s.label}
              {/* 候補は縦に並べる。横に「／」でつなぐと1つの長い文に見えて、
                  選ぶものだと分からない(見比べて選ばせるのが目的)。 */}
              {s.options && (
                <span className="ig-step-options">
                  {s.options.map((o) => (
                    <span className="ig-step-option" key={o}>
                      {o}
                    </span>
                  ))}
                </span>
              )}
            </span>
          </li>
        ))}
      </ol>

      {/* 迷ったときの退避。実際は帯のどこを押してもシートは閉じるが、
          「どこでも押せる」では伝わらないのでボタンとして見せる。 */}
      <button className="ig-band-back" onClick={onRestart}>
        {t.restart}
      </button>
    </div>
  );
}

/* ============ 本体 ============ */

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
  const base = cfg.assetBase.replace(/\/$/, "");
  const prefix = cfg.storagePrefix ?? "installGuide";
  const DISMISS_KEY = `${prefix}Closed`;
  const WELCOME_KEY = `${prefix}WelcomeDone`;

  const [mode, setMode] = useState<
    "hidden" | "welcome" | "notify" | "intro" | "guide" | "outside" | "reopen"
  >("hidden");

  const oneTap = !!cfg.oneTapAvailable;
  const android = isAndroid();
  const andBrowser = android ? androidBrowser() : "other";
  const useChrome = isIOSChrome() && canInstallOutsideSafari();
  const steps = android
    ? (cfg.androidSteps ?? defaultAndroidSteps(t, andBrowser))
    : useChrome
      ? (cfg.iosChromeSteps ?? defaultChromeSteps(base, t))
      : (cfg.iosSafariSteps ?? defaultSafariSteps(base, t));

  /**
   * 押すものが画面の**上**にあるか。帯はその反対側に置く(README の原則2)。
   * Safari=下 → 帯は上 / iOS Chrome=上 → 帯は下。
   * ⚠ Androidは一律ではない。Chrome・Firefoxは右上の ⋮ だが、
   *   Samsung Internet・Edge・Opera はメニューが**画面の下**にある。
   */
  const targetIsUp = android ? androidMenuIsUp(andBrowser) : useChrome;

  /**
   * ここで案内を出せる環境か。
   *
   * ⚠ Androidを `oneTap` で判定してはいけない。ここが 2026-08-09 まで入っていた不具合。
   *   `beforeinstallprompt` は非同期で遅れて届き、そもそも届かないブラウザもある
   *   (Firefox・Samsung Internet・一部のメーカー製ブラウザ)。届く前に判定すると
   *   `canGuideHere` が false になり、**AndroidなのにiOS用の「Safariで開き直して」**が出た。
   *   Androidは「1回押すだけ」が使えなくても手動の手順を出せるので、常に案内できる。
   *   出せないのはアプリ内ブラウザ(LINE等)のときだけ。
   */
  const canGuideHere = android ? !isAndroidInApp() : isIOSSafari() || useChrome;
  const entryMode = (): "intro" | "outside" => (canGuideHere ? "intro" : "outside");
  const closedMode = (): "reopen" | "hidden" => (canGuideHere ? "reopen" : "hidden");

  /**
   * Androidでは `beforeinstallprompt` を少しだけ待つ。
   * 待たずに描くと「はじめる」(手動)を先に見せてしまい、直後に
   * 「1回押すだけ」へ化けて利用者を驚かせる。
   */
  const [promptSettled, setPromptSettled] = useState(!android);
  useEffect(() => {
    if (promptSettled) return;
    if (oneTap) {
      setPromptSettled(true);
      return;
    }
    const id = window.setTimeout(() => setPromptSettled(true), ANDROID_PROMPT_GRACE_MS);
    return () => window.clearTimeout(id);
  }, [promptSettled, oneTap]);

  useEffect(() => {
    if (isStandalone()) {
      // ホーム画面から起動できている＝設定済み。サーバへ記録しておく。
      cfg.onInstalled?.();
      if (!localStorage.getItem(WELCOME_KEY)) setMode("welcome");
      return;
    }
    if (!isIOS() && !android) return; // パソコンには出さない
    if (cfg.installed) return; // 設定済みが分かっている人には出さない
    if (!promptSettled) return; // Androidは beforeinstallprompt を待ってから出す
    // ⚠ 一度閉じても「二度と出ない」にしない。誤って閉じた人が詰むため、
    //   閉じたあとは小さな入口(reopen)を必ず残す。
    // ⚠ ここの依存に oneTap を入れないこと。あとから届いたときに mode が
    //   intro へ巻き戻り、手順の途中の人が最初の画面に戻される。
    //   「1回押すだけ」への切り替えは intro の描画側が oneTap を見て行う。
    setMode(localStorage.getItem(DISMISS_KEY) ? closedMode() : entryMode());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg.installed, promptSettled]);

  // ⚠ 題名の差し替えは **intro の段階から**。「はじめる」を押す前に
  //   共有シートを開く人がいて、そのとき元の題名が出てしまうため。
  useEffect(() => {
    if (!isIOS()) return; // Androidは共有シートを使わない
    if (mode !== "intro" && mode !== "guide") return;
    return setShareTitle(useChrome ? t.shareTitleChrome : t.shareTitleSafari);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, useChrome]);

  useEffect(() => {
    if (!openNow) return;
    localStorage.removeItem(DISMISS_KEY);
    setMode(entryMode());
    onOpened?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openNow]);

  if (mode === "hidden") return null;

  // 閉じたら**その場で**小さな入口へ切り替える。
  // ⚠ ここで hidden にすると、リロードするまで入口が出ず、誤って閉じた人が詰む。
  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, new Date().toISOString());
    setMode(closedMode());
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
    const granted =
      typeof Notification !== "undefined" && Notification.permission === "granted";
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
            // すでに許可済みの人に「許可を押して」と言うと混乱するので出さない。
            if (granted) {
              localStorage.setItem(WELCOME_KEY, "1");
              setMode("hidden");
            } else setMode("notify");
          }}
        >
          {t.next}
        </button>
      </div>
    );
  }

  // 通知の「許可」の案内。
  // ⚠ この1画面を消さないこと。押し忘れると、新しいお知らせが届かない。
  if (mode === "notify") {
    const finish = () => {
      localStorage.setItem(WELCOME_KEY, "1");
      setMode("hidden");
    };
    return (
      <div className="ig-welcome" style={{ textAlign: "left" }}>
        <h2 className="ig-welcome-title">{t.notifyTitle}</h2>
        <p className="ig-welcome-body">{t.notifyBody}</p>
        <div className="ig-notify-mock" role="img" aria-label={t.notifyMockAlt}>
          <p className="ig-notify-text">{t.notifyMockText}</p>
          <div className="ig-notify-btns">
            <span className="ig-notify-no">{t.notifyNo}</span>
            <span className="ig-notify-yes">{t.notifyYes}</span>
          </div>
        </div>
        <p className="ig-notify-why">{t.notifyWhy}</p>
        <button className="ig-intro-btn" onClick={finish}>
          {t.ok}
        </button>
      </div>
    );
  }

  // アプリ内ブラウザ(LINEなど)。ここでは追加できない。
  // ⚠ 「Safariで開いて」の文字だけでは通じない。**Safariのアイコン写真を必ず見せる**。
  if (mode === "outside") {
    const inLine = isLineBrowser();
    // ⚠ 逃がす先は端末で違う。AndroidにSafariの絵を出すと、存在しないアプリを
    //   探させることになる(2026-08-09の実機報告はこれが起きていた)。
    const iconImg = android ? cfg.chromeIconImg : `${base}/common/icon-safari.png`;
    const browserName = android ? t.chromeName : "Safari";
    const browserLook = android ? t.chromeLook : t.safariLook;
    return (
      <div className="ig-fullscreen ig-fullscreen-center">
        <div className="ig-intro">
          <div className="ig-intro-head">
            <h2 className="ig-intro-title">{t.outsideTitle}</h2>
            <button className="ig-band-close" onClick={dismiss} aria-label={t.later}>
              ×
            </button>
          </div>

          <div className="ig-safari-id">
            {/* Androidは絵を同梱していない(Googleのロゴを再配布しないため)。
                cfg.chromeIconImg を渡せば同じ形で出る。 */}
            {iconImg && <img src={iconImg} alt={android ? browserName : t.safariIconAlt} />}
            <div>
              <div className="ig-safari-name">{browserName}</div>
              <div className="ig-safari-note">{browserLook}</div>
            </div>
          </div>

          <p className="ig-intro-body">{t.outsideBody}</p>

          {inLine ? (
            <>
              {/* LINEは ?openExternalBrowser=1 を付けたアドレスを、
                  LINEの中ではなく外のブラウザで開く。まずこれを試させる。 */}
              <button
                className="ig-intro-btn"
                onClick={() => {
                  const u = new URL(cfg.appUrl);
                  u.searchParams.set("openExternalBrowser", "1");
                  window.location.href = u.toString();
                }}
              >
                {t.openExternal}
              </button>
              <p className="ig-intro-note">
                {android ? t.lineFallbackAndroid : t.lineFallback}
              </p>
            </>
          ) : (
            <p className="ig-intro-note">
              {android ? t.inAppFallbackAndroid : t.inAppFallback}
            </p>
          )}

          <details className="ig-details">
            <summary>{t.sureWay}</summary>
            <ol className="ig-safari-steps">
              <li>
                {t.sureStep1}
                <div style={{ margin: "10px 0" }}>
                  <CopyUrlButton
                    url={cfg.appUrl}
                    label={t.copyUrl}
                    doneLabel={android ? t.copiedAndroid : t.copied}
                  />
                </div>
              </li>
              <li>{android ? t.sureStep2Android : t.sureStep2}</li>
              <li>{android ? t.sureStep3Android : t.sureStep3}</li>
            </ol>
          </details>
        </div>
      </div>
    );
  }

  // 設定中は背景を完全に隠す。後ろが見えると「どちらを操作するのか」で迷う。
  if (mode === "guide") {
    return (
      <div className="ig-fullscreen">
        {/* 押すものは**このページの外**(ブラウザのボタン)にある。
            ⚠ 矢印は必ず対象の方向へ寄せる。中央だと別の場所を指してしまう。 */}
        {targetIsUp ? (
          <div className="ig-look ig-look-up">
            <div className="ig-look-arrow" aria-hidden="true">
              ↑
            </div>
            <p>{t.lookUpRight}</p>
          </div>
        ) : (
          <div className="ig-look ig-look-down">
            {/* ⚠ Edge(Android)だけメニューが下の**まん中**。右下と書くと外れる。 */}
            <p>{andBrowser === "edge" ? t.lookDownCenter : t.lookDownRight}</p>
            <div className="ig-look-arrow" aria-hidden="true">
              ↓
            </div>
          </div>
        )}
        <GuideBand
          steps={steps}
          t={t}
          place={targetIsUp ? "bottom" : "top"}
          onDismiss={dismiss}
          onRestart={() => setMode("intro")}
        />
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
        {/* ⚠ oneTap は遅れて true になることがある。ここは毎回の描画で読み直すので、
            届いた瞬間に「1回押すだけ」へ切り替わる(mode は動かさない)。 */}
        <p className="ig-intro-body">
          {oneTap ? t.introBodyOneTap : android ? t.introBodyAndroid : t.introBody}
        </p>
        <p className="ig-intro-note">{t.introSafety}</p>
        <button
          className="ig-intro-btn"
          onClick={async () => {
            if (oneTap) {
              await cfg.onOneTapInstall?.();
              return;
            }
            setMode("guide");
          }}
        >
          {oneTap ? t.addNow : t.start}
        </button>
      </div>
    </div>
  );
}
