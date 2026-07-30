# 手順スクリーンショットの撮り方（Xcodeシミュレータ）

赤い印つきの切り抜き5枚を作る。**イラストで再現せず、必ず実機の画面を使う。**

## 準備

```bash
# Xcodeが有効になっていること(初回のみ・パスワードを聞かれる)
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer

# 端末を起動(小さい画面でも収まるか確認したいので SE も作ると良い)
xcrun simctl list devicetypes | grep -i iphone
xcrun simctl boot "<UDID>"
```

## 撮影

```bash
# アプリを開く(ローカル開発サーバの場合は --ip 0.0.0.0 で起動しておく)
xcrun simctl openurl "<UDID>" "http://192.168.1.x:8799/"

# 画面を撮る
xcrun simctl io "<UDID>" screenshot /tmp/shot.png
```

撮る画面は次の5つ。**Safariのツールバー配置（コンパクト／下／上）で見た目が変わる**ので、
自分の端末で実際に出るものを撮る。

1. Safari下部バー（右端の「•••」または「共有」マーク）
2. 「•••」を押して出るメニューの「共有」の行
3. 共有シート下部の丸いボタン列の「表示を増やす」
4. 共有シートの「ホーム画面に追加」の行
5. 追加確認画面の右上「追加」（青いボタン）

さらに、完成後のホーム画面アイコンも1枚（`done-icon.png`）。

## 切り抜きと赤い印

押す場所の**周辺だけ**を切り抜き、赤い枠か赤い丸を**1つだけ**足す。

```python
from PIL import Image, ImageDraw
RED = (198, 40, 40)
im = Image.open("/tmp/shot.png").convert("RGB")
c = im.crop((x1, y1, x2, y2))            # 押す場所の周辺だけ
d = ImageDraw.Draw(c)
d.rounded_rectangle((6, 6, c.width - 6, c.height - 6), radius=18, outline=RED, width=9)
c.save("public/help/img/t2-share.png")
```

## 確認

- 帯の高さが**画面の上から42%以内**に収まっているか（超えると共有シートに隠れる）
- 一番小さい端末（iPhone SE 第3世代・375x667pt）でも5手順すべてが見えるか
- 横スクロールが出ていないか
