[plugin name="waapi"]

[loadbgm str="dotabata.ogg"]

[macro name="日時取得"]
    [iscript]
        var _f = f;

        (function() {
            'use strict';

            const date = new Date();

            _f.month = date.getMonth() + 1;
            _f.date = date.getDate();
            _f.hour = date.getHours();
            _f.minute = date.getMinutes();
            _f.second = date.getSeconds();
        })();
    [endscript]
[endmacro]

[macro name="日時表示"]
    [emb exp="f.month"]/[emb exp="f.date"] [emb exp="f.hour"]:[emb exp="f.minute"]:[emb exp="f.second"]
[endmacro]

;メッセージウィンドウの設定
[position layer="message0" left="20" top="480" width="1240" height="200" page="fore" visible="true"]

;文字が表示される領域を調整
[position layer="message0" page="fore" margint="45" marginl="50" marginr="70" marginb="60"]

画面をクリック／タップするとスタート[p]

[bg storage="room.jpg" time="500"]

まずは普通にplaybgmで再生します。[p]

[playbgm storage="dotabata.ogg" volume="25" loop="true"]
[日時取得]

[日時表示]に再生を開始しました。[r]
曲の長さは21秒です。[wait time="24000"][p]

一度BGMを停止します。[p]

[stopbgm]

次はWEB_AUDIO_APIを使って再生します。[p]

[lbgm str="dotabata.ogg" vol="25" loop="true" buf="0" start="0"]
[日時取得]

[日時表示]に再生を開始しました。[r]
曲の長さは21秒です。[wait time="24000"][p]

BGMを停止します。[p]

[lbgmstop buf="0"]

以上です。

[s]
