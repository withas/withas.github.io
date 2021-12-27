[cm]
[clearfix]

;メニューボタンの表示
[showmenubutton]

;メッセージウィンドウの設定
[position layer="message0" left="20" top="400" width="920" height="200" page="fore" visible="true"]

;文字が表示される領域を調整
[position layer="message0" page="fore" margint="45" marginl="50" marginr="70" marginb="60"]

;キャラクターの名前が表示される文字領域
[ptext name="chara_name_area" layer="message0" color="white" size="24" x="50" y="410"]

;上記で定義した領域がキャラクターの名前表示であることを宣言（これがないと#の部分でエラーになります）
[chara_config ptext="chara_name_area"]

#
[nowait]読み込み中……[endnowait]

[iscript]
    tf.images = [
        "data/fgimage/chara/akane/normal.png",
        "data/fgimage/chara/akane/angry.png",
        "data/fgimage/chara/akane/doki.png",
        "data/fgimage/chara/akane/happy.png",
        "data/fgimage/chara/akane/sad.png",
        "data/bgimage/room.jpg",
    ]
[endscript]
[preload storage="&tf.images" wait="true"]

[cm]

#
[nowait]画面をクリックするとスタートします。[endnowait][p]

[playbgm storage="music.ogg"]

[chara_show name="akane"]

#akane
「今からex_bgmovieタグを実行します」[p]

#akane:sad
「もしあなたがこれをPCで見ていれば動画が、スマホで見ていれば静止画が背景に表示されるはずです」[p]
「わかりやすくtime=3000で呼び出します」[p]

#akane:angry
「ではいきますよ。背景をよーく見ていてください」[p]

#

[ex_bgmovie storage="gaming_room.webm" 画像="room.jpg" time="3000"]

#akane:happy
「どうでしょう、仕様通りの動作になりましたか？」[p]

#akane:doki
「もしなっていなかったら教えて下さいね」[p]

#
以上です。

[s]
