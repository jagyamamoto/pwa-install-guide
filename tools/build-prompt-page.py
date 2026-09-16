#!/usr/bin/env python3
"""PROMPT.md の依頼文を、紹介サイトのページへ流し込む。

⚠ なぜこれがあるか
  依頼文が PROMPT.md とサイトの2か所にあると、必ず片方だけ直して食い違う。
  実際、INTEGRATION.md は中身が上級者向けに育ったのに、
  サイトの「はじめ方」は「これをコピーすれば初心者でも使えます」と案内し続けていた。
  正本は PROMPT.md ひとつ。サイトはここから作る。

使い方: python3 tools/build-prompt-page.py [--check]
  --check … 食い違っていたら終了コード1（公開前の確認用）
"""
import io, re, sys, html

SRC = "PROMPT.md"
PAGE = "docs/getting-started.html"
BEGIN, END = "<!-- PROMPT:BEGIN -->", "<!-- PROMPT:END -->"

md = io.open(SRC, encoding="utf-8").read()
# 「---」だけの行から下が、AIに渡す本文
parts = re.split(r'^---\s*$', md, flags=re.M)
if len(parts) < 2:
    sys.exit(f"{SRC}: 「---」の区切りが見つかりません")
body = parts[-1].strip() + "\n"

page = io.open(PAGE, encoding="utf-8").read()
m = re.search(re.escape(BEGIN) + r'(.*?)' + re.escape(END), page, re.S)
if not m:
    sys.exit(f"{PAGE}: {BEGIN} … {END} の目印がありません")

want = html.escape(body, quote=False)
if m.group(1) == want:
    print("依頼文: サイトと PROMPT.md は一致しています")
    sys.exit(0)

if "--check" in sys.argv:
    print("✗ 依頼文がサイトと PROMPT.md で食い違っています。")
    print("  直す: python3 tools/build-prompt-page.py")
    sys.exit(1)

io.open(PAGE, "w", encoding="utf-8").write(page[:m.start(1)] + want + page[m.end(1):])
print(f"依頼文をサイトへ反映しました（{len(body)}字）")
