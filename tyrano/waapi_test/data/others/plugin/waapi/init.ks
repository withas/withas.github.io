*waapi

;ライブラリロード
[loadjs storage="plugin/waapi/audio-metadata.min.js"]
[loadjs storage="plugin/waapi/audio-context.js"]

;valueset
[iscript]
//BGM と SE
mp.bgm = mp.bgm || "data/bgm/";
mp.se = mp.se || "data/sound/";

tf.bgm = new soundlist(mp.bgm);
tf.se = new soundlist(mp.se);
[endscript]

;str = ファイル名
[macro name="loadbgm"]
[iscript]
tf.bgm.add(mp.str);
[endscript]
[endmacro]

[macro name="loadse"]
[iscript]
tf.se.add(mp.str);
[endscript]
[endmacro]

;str = ファイル名
;time = フェードインにかかる時間（ミリ秒）
;vol = ボリューム(0から100:一応100以上も指定できるが音が壊れる)
;loop = ループ指定("true" or "false" 必ず文字列リテラルで指定する)
;start = 再生開始位置(秒数)
;buf = プレイリスト番号
[macro name="lbgm"]
[iscript]
mp.vol    = mp.vol    || "50";
mp.loop   = mp.loop   || "true";
mp.time   = mp.time   || "0";
mp.buf    = mp.buf    || "0";
mp.start  = mp.start  || "0";

tf.bgm.stop("0",mp.buf);

var param = new playparam();
param.setVolume(mp.vol);
param.setLoop(mp.loop);
param.setEndTime(mp.time);
param.setStart(mp.start);

tf.bgm.play(mp.str,param,mp.buf);
[endscript]
[endmacro]

[macro name="lse"]
[iscript]
mp.vol    = mp.vol    || "50";
mp.loop   = mp.loop   || "true";
mp.time   = mp.time   || "0";
mp.buf    = mp.buf    || "0";
mp.start  = mp.start  || "0";

tf.se.stop("0",mp.buf);

var param = new playparam();
param.setVolume(mp.vol);
param.setLoop(mp.loop);
param.setEndTime(mp.time);
param.setStart(mp.start);

tf.se.play(mp.str,param,mp.buf);
[endscript]
[endmacro]

;time = フェードアウトにかかる時間（ミリ秒）
;buf = プレイリスト番号
[macro name="lbgmstop"]
[iscript]
mp.time   = mp.time   || "0";
mp.buf    = mp.buf    || "0";

tf.bgm.stop(mp.time,mp.buf);
[endscript]
[endmacro]

[macro name="lsestop"]
[iscript]
mp.time   = mp.time   || "0";
mp.buf    = mp.buf    || "0";

tf.se.stop(mp.time,mp.buf);
[endscript]
[endmacro]

;time = フェードインにかかる時間（ミリ秒）
;vol = ボリューム(0から100:一応100以上も指定できるが音が壊れる)
;loop = ループ指定("true" or "false" 必ず文字列リテラルで指定する)
;start = 再生開始位置(秒数)
;buf = プレイリスト番号
[macro name="lbgmresume"]
[iscript]
mp.vol    = mp.vol    || "50";
mp.loop   = mp.loop   || "true";
mp.buf    = mp.buf    || "0";

tf.bgm.stop("0",mp.buf);

var param = new playparam();
param.setVolume(mp.vol);
param.setLoop(mp.loop);
if (typeof mp.time !== 'undefined') param.setEndTime(mp.time);
if (typeof mp.start !== 'undefined') param.setStart(mp.start);

tf.bgm.resume(mp.str,param,mp.buf);
[endscript]
[endmacro]

[macro name="lseresume"]
[iscript]
mp.vol    = mp.vol    || "50";
mp.loop   = mp.loop   || "true";
mp.buf    = mp.buf    || "0";

tf.se.stop("0",mp.buf);

var param = new playparam();
param.setVolume(mp.vol);
param.setLoop(mp.loop);
if (typeof mp.time !== 'undefined') param.setEndTime(mp.time);
if (typeof mp.start !== 'undefined') param.setStart(mp.start);

tf.se.resume(mp.str,param,mp.buf);
[endscript]
[endmacro]

;vol = ボリューム(0から100:一応100以上も指定できるが音が壊れる)
;time = フェードイン/アウトにかかる時間（ミリ秒）
;buf = プレイリスト番号
[macro name="lbgmvol"]
[iscript]
mp.time   = mp.time   || "0";
mp.buf    = mp.buf    || "0";

tf.bgm.volume(mp.vol,mp.time,mp.buf);
[endscript]
[endmacro]

[macro name="lsevol"]
[iscript]
mp.time   = mp.time   || "0";
mp.buf    = mp.buf    || "0";

tf.se.volume(mp.vol,mp.time,mp.buf);
[endscript]
[endmacro]

[return]
