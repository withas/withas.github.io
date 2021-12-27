[macro name="ex_bgmovie"]
    [iscript]
        tf.is_pc = ($.userenv() == "pc");
    [endscript]
    [if exp="tf.is_pc"]
        [bgmovie *]
    [else]
        [bg storage=%画像 time=%time]
    [endif]
[endmacro]

[return]
