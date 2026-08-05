# 写真の撮り方

## アプリ固有で必要なのは1枚だけ

`done-icon.png` … ホーム画面に追加したあとの、そのアプリのアイコン。

```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer  # 初回のみ
xcrun simctl boot "<UDID>"
xcrun simctl openurl "<UDID>" "http://192.168.1.x:8799/"   # 開発サーバは --ip 0.0.0.0 で起動
# 実際にホーム画面へ追加し、ホーム画面を撮る
xcrun simctl io "<UDID>" screenshot /tmp/home.png
```

アイコンだけを正方形に切り出す:

```python
from PIL import Image
im = Image.open("/tmp/home.png").convert("RGB")
im.crop((x1, y1, x2, y2)).resize((256, 256), Image.LANCZOS).save("done-icon.png")
```

## OSの画面（同梱済み。撮り直し不要）

`assets/ios-safari/` と `assets/ios-chrome/` はiOSのシステム画面なので、
どのアプリでも同じものが出る。日本語表示のiOS 26.5で撮影済み。

作り直す場合は、押す場所の**周辺だけ**を切り抜き、**赤い印は1枚に1つ**。
赤枠の位置は自動で検出できる:

```python
from PIL import Image
im = Image.open("shot.png").convert("RGB")
xs=[];ys=[]
for y in range(im.height):
    for x in range(im.width):
        r,g,b = im.getpixel((x,y))
        if r>150 and g<90 and b<90: xs.append(x); ys.append(y)
im.crop((min(xs)-6, min(ys)-6, max(xs)+6, max(ys)+6)).save("out.png")
```

⚠ ChromeはApp Storeが無いシミュレータに入れられない。Chromeの画面は実機で撮る
（Chromiumを自前ビルドする道もあるが約116GB・数時間かかるので割に合わない）。

## 確認

- 帯の高さが**250pt以内**か（最小のiPhone SEで表示領域は約535pt）
- 38px表示にしても赤い印が判別できるか
- 横スクロールが出ていないか
