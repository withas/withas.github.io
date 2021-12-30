[cm]
[clearfix]

;メニューボタンの表示
[showmenubutton]

;メッセージウィンドウの設定
[position layer="message0" left="20" top="480" width="1240" height="200" page="fore" visible="true"]

;文字が表示される領域を調整
[position layer="message0" page="fore" margint="45" marginl="50" marginr="70" marginb="60"]

;キャラクターの名前が表示される文字領域
[ptext name="chara_name_area" layer="message0" color="white" size="24" x="50" y="490"]

;上記で定義した領域がキャラクターの名前表示であることを宣言（これがないと#の部分でエラーになります）
[chara_config ptext="chara_name_area"]

#
[nowait]読み込み中……[endnowait]

[iscript]
    tf.images = [
        "data/fgimage/chara/akane/normal.png",
        "data/fgimage/chara/akane/angry.png",
        "data/fgimage/chara/akane/happy.png",
        "data/bgimage/room.jpg",
        "data/bgimage/rouka.jpg",
        "data/image/mozaiku.jpg",
    ]
[endscript]
[preload storage="&tf.images" wait="true"]

[cm]

#
[nowait]画面をクリックするとスタートします（音が出ます）[endnowait][p]

[mask time="10"]
[bg storage="room.jpg" time="10"]
[chara_show name="akane" time="10"]
[mask_off time="1000"]

#akane
「mozaiku.webmをlayermode_movieタグで表示します」[p]
#

[layermode_movie video="mozaiku.webm" time="1500" wait="true" mode="color-burn"]

#akane:happy
「この状態で背景を変更してみます」[p]
#

[bg storage="rouka.jpg"]

#akane:angry
「ＢＧＭを流してみちゃったり……」[p]

[playbgm storage="music.ogg"]

#akane
「一度free_layermodeします」[p]
#

[free_layermode time="2000"]

#akane:happy
「今度はmozaiku.jpgをlayermodeタグで表示します」[p]
#

[layermode graphic="mozaiku.jpg" time="1500" wait="true" mode="color-burn"]

#akane:happy
「またこの状態で背景を変更してみます」[p]
#

[bg storage="room.jpg"]

#akane:angry
「ＢＧＭをフェードアウトさせてみちゃったり……」[p]

[fadeoutbgm time="1500"]

#akane
「最後にもう一度free_layermodeします」[p]
#

[free_layermode time="2000"]

以上です。

[s]
