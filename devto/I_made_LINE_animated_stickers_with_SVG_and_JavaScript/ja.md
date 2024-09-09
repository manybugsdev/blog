# I made LINE animated stickers with SVG and JavaScript.

概要:まず SVG を dataURI に変換し canvas に drawImage で描写します。getImageData でピクセルデータを得た後、UPNG.js を使って アニメーション png ファイルを作ります。もう二度とやりたくありません。

## What is LINE?

あなたは LINE というメッセンジャーアプリを知っていますか？韓国の IT 企業 NAVER にルーツを持ち、今は日本の LINE ヤフーによって運営されています。

LINE について聞いたことがない人もいるかも知れません。Telegram や WhatsApp と比べてダウンロード数も少ないマイナーなアプリです。そもそも Facebook のような SNS のみ使用して、このようなアプリは不必要だと考えている人も多いです。

https://www.statista.com/statistics/1263360/most-popular-messenger-apps-worldwide-by-monthly-downloads/

しかしそんな中で、ほぼ全ての国民が LINE を使っている国があります。それは、私の母国である日本です。

なぜそんなにも人気があるのでしょうか？最初は東日本大震災の時に繋がらなくなった電話の代替手段として LINE は日本で開発されたそうです。私も記憶していますが、ちょうどその頃日本は旧式の携帯電話から現在のスマートフォンへと移行が進んでおり、その波に上手く乗っていた印象があります。

![old type cell phone]()

日本人は個人情報をインターネット上に公開する Facebook のような SNS に抵抗があり、閉じた関係性の人のみとチャットで連絡が取れる LINE はすぐに受け入れられて、現在も多くの日本人に使われています。(余談ですが、日本では他人の LINE の ID を聞くことは、プライバシーに踏み込む行為という印象があります。つまり、好きな人の LINE の ID を聞くことが、日本人の恋愛のスタート地点なのです！)

![love](12063_paint.png)

## What is LINE stickers.

私は LINE の最大の魅力はスタンプ(Sticker)機能だと思っています。とても可愛らしくて個性のあるスタンプがたくさんあり、スタンプを介したコミュニケーション
