tyrano.plugin.kag.ftag = {
	tyrano: null,
	kag: null,
	array_tag: [],
	master_tag: {},
	current_order_index: -1,
	init: function () {
		for (var order_type in tyrano.plugin.kag.tag) {
			this.master_tag[order_type] = object(tyrano.plugin.kag.tag[order_type]);
			this.master_tag[order_type].kag = this.kag
		}
	},
	buildTag: function (array_tag, label_name) {
		this.array_tag = array_tag;
		if (label_name) this.nextOrderWithLabel(label_name);
		else this.nextOrderWithLabel("")
	},
	buildTagIndex: function (array_tag, index, auto_next) {
		this.array_tag = array_tag;
		this.nextOrderWithIndex(index,
			undefined, undefined, undefined, auto_next)
	},
	completeTrans: function () {
		this.kag.stat.is_trans = false;
		if (this.kag.stat.is_stop == true) {
			this.kag.layer.showEventLayer();
			this.nextOrder()
		}
	},
	hideNextImg: function () {
		$(".img_next").remove();
		$(".glyph_image").hide()
	},
	showNextImg: function () {
		if (this.kag.stat.flag_glyph == "false") {
			$(".img_next").remove();
			var jtext = this.kag.getMessageInnerLayer();
			jtext.find("p").append("<img class='img_next' src='./tyrano/images/system/nextpage.gif' />")
		} else $(".glyph_image").show()
	},
	nextOrder: function () {
		this.kag.layer.layer_event.hide();
		var that = this;
		if (this.kag.stat.is_strong_stop == true) return false;
		if (this.kag.stat.is_adding_text == true) return false;
		this.current_order_index++;
		if (this.array_tag.length <= this.current_order_index) {
			this.kag.endStorage();
			return false
		}
		var tag = $.cloneObject(this.array_tag[this.current_order_index]);
		this.kag.stat.current_line = tag.line;
		if (this.kag.is_rider) {
			tag.ks_file = this.kag.stat.current_scenario;
			this.kag.rider.pushConsoleLog(tag)
		} else {
			this.kag.log("**:" +
				this.current_order_index + "　line:" + tag.line);
			this.kag.log(tag)
		}
		if (tag.name == "call" && tag.pm.storage == "make.ks" || this.kag.stat.current_scenario == "make.ks") {
			if (this.kag.stat.flag_ref_page == true) {
				this.kag.tmp.loading_make_ref = true;
				this.kag.stat.flag_ref_page = false
			}
		} else if (this.kag.stat.flag_ref_page == true) {
			this.kag.stat.flag_ref_page = false;
			this.kag.stat.log_clear = true;
			this.kag.ftag.hideNextImg();
			this.kag.getMessageInnerLayer().html("")
		}
		if (this.checkCond(tag) != true) {
			this.nextOrder();
			return
		}
		if (this.kag.stat.is_hide_message ==
			true) {
			this.kag.layer.showMessageLayers();
			this.kag.stat.is_hide_message = false
		}
		if (this.master_tag[tag.name]) {
			tag.pm = this.convertEntity(tag.pm);
			var err_str = this.checkVital(tag);
			if (this.master_tag[tag.name].log_join) this.kag.stat.log_join = "true";
			else if (tag.name == "text");
			else this.kag.stat.log_join = "false";
			if (this.checkCw(tag)) this.kag.layer.layer_event.show();
			if (err_str != "") this.kag.error(err_str);
			else this.master_tag[tag.name].start($.extend(true, $.cloneObject(this.master_tag[tag.name].pm), tag.pm))
		} else if (this.kag.stat.map_macro[tag.name]) {
			tag.pm =
				this.convertEntity(tag.pm);
			var pms = tag.pm;
			var map_obj = this.kag.stat.map_macro[tag.name];
			var back_pm = {};
			back_pm.index = this.kag.ftag.current_order_index;
			back_pm.storage = this.kag.stat.current_scenario;
			back_pm.pm = pms;
			this.kag.stat.mp = pms;
			this.kag.pushStack("macro", back_pm);
			this.kag.ftag.nextOrderWithIndex(map_obj.index, map_obj.storage)
		} else {
			$.error_message($.lang("tag") + "：[" + tag.name + "]" + $.lang("not_exists"));
			this.nextOrder()
		}
	},
	checkCw: function (tag) {
		var master_tag = this.master_tag[tag.name];
		if (master_tag.cw)
			if (this.kag.stat.is_script !=
				true && this.kag.stat.is_html != true && this.kag.stat.checking_macro != true) return true;
			else return false;
		else return false
	},
	nextOrderWithTag: function (target_tags) {
		try {
			this.current_order_index++;
			var tag = this.array_tag[this.current_order_index];
			if (this.checkCond(tag) != true);
			if (target_tags[tag.name] == "")
				if (this.master_tag[tag.name]) {
					switch (tag.name) {
					case "elsif":
					case "else":
					case "endif":
						var root = this.kag.getStack("if");
						if (!root || tag.pm.deep_if != root.deep) return false
					}
					tag.pm = this.convertEntity(tag.pm);
					this.master_tag[tag.name].start($.extend(true,
						$.cloneObject(this.master_tag[tag.name].pm), tag.pm));
					return true
				} else return false;
			else return false
		} catch (e) {
			console.log(this.array_tag);
			return false
		}
	},
	convertEntity: function (pm) {
		var that = this;
		if (pm["*"] == "") pm = $.extend(true, this.kag.stat.mp, $.cloneObject(pm));
		for (key in pm) {
			var val = pm[key];
			var c = "";
			if (val.length > 0) c = val.substr(0, 1);
			if (val.length > 0 && c === "&") pm[key] = this.kag.embScript(val.substr(1, val.length));
			else if (val.length > 0 && c === "%") {
				var map_obj = this.kag.getStack("macro");
				if (map_obj) pm[key] =
					map_obj.pm[val.substr(1, val.length)];
				var d = val.split("|");
				if (d.length == 2)
					if (map_obj.pm[$.trim(d[0]).substr(1, $.trim(d[0]).length)]) pm[key] = map_obj.pm[$.trim(d[0]).substr(1, $.trim(d[0]).length)];
					else pm[key] = $.trim(d[1])
			}
		}
		return pm
	},
	checkVital: function (tag) {
		var master_tag = this.master_tag[tag.name];
		var err_str = "";
		if (master_tag.vital);
		else return "";
		var array_vital = master_tag.vital;
		for (var i = 0; i < array_vital.length; i++)
			if (tag.pm[array_vital[i]]) {
				if (tag.pm[array_vital[i]] == "") err_str += "タグ「" +
					tag.name + "」にパラメーター「" + array_vital[i] + "」は必須です　\n"
			} else err_str += "タグ「" + tag.name + "」にパラメーター「" + array_vital[i] + "」は必須です　\n";
		return err_str
	},
	checkCond: function (tag) {
		var pm = tag.pm;
		if (pm.cond) {
			var cond = pm.cond;
			return this.kag.embScript(cond)
		} else return true
	},
	startTag: function (name, pm) {
		this.master_tag[name].start($.extend(true, $.cloneObject(this.master_tag[name].pm),
			pm))
	},
	nextOrderWithLabel: function (label_name, scenario_file) {
		this.kag.stat.is_strong_stop = false;
		if (label_name) {
			if (label_name.indexOf("*") != -1) label_name = label_name.substr(1, label_name.length);
			this.kag.ftag.startTag("label", {
				"label_name": label_name,
				"nextorder": "false"
			})
		}
		if (label_name == "*savesnap") {
			var tmpsnap = this.kag.menu.snap;
			var co = tmpsnap.current_order_index;
			var cs = tmpsnap.stat.current_scenario;
			this.nextOrderWithIndex(co, cs, undefined, undefined, "snap");
			return
		}
		var that = this;
		var original_scenario =
			scenario_file;
		label_name = label_name || "";
		scenario_file = scenario_file || this.kag.stat.current_scenario;
		label_name = label_name.replace("*", "");
		if (scenario_file != this.kag.stat.current_scenario && original_scenario != null) {
			this.kag.layer.hideEventLayer();
			this.kag.loadScenario(scenario_file, function (array_tag) {
				that.kag.layer.showEventLayer();
				that.kag.ftag.buildTag(array_tag, label_name)
			})
		} else if (label_name == "") {
			this.current_order_index = -1;
			this.nextOrder()
		} else if (this.kag.stat.map_label[label_name]) {
			var label_obj =
				this.kag.stat.map_label[label_name];
			this.current_order_index = label_obj.index;
			this.nextOrder()
		} else {
			$.error_message($.lang("label") + "：'" + label_name + "'" + $.lang("not_exists"));
			this.nextOrder()
		}
	},
	nextOrderWithIndex: function (index, scenario_file, flag, insert, auto_next) {
		this.kag.stat.is_strong_stop = false;
		this.kag.layer.showEventLayer();
		var that = this;
		flag = flag || false;
		auto_next = auto_next || "yes";
		scenario_file = scenario_file || this.kag.stat.current_scenario;
		if (scenario_file != this.kag.stat.current_scenario ||
			flag == true) {
			this.kag.layer.hideEventLayer();
			this.kag.loadScenario(scenario_file, function (tmp_array_tag) {
				var array_tag = $.extend(true, [], tmp_array_tag);
				if (typeof insert == "object") array_tag.splice(index + 1, 0, insert);
				that.kag.layer.showEventLayer();
				that.kag.ftag.buildTagIndex(array_tag, index, auto_next)
			})
		} else {
			this.current_order_index = index;
			if (auto_next == "yes") this.nextOrder();
			else if (auto_next == "snap") {
				this.kag.stat.is_strong_stop = this.kag.menu.snap.stat.is_strong_stop;
				if (this.kag.stat.is_skip == true &&
					this.kag.stat.is_strong_stop == false) this.kag.ftag.nextOrder()
			} else if (auto_next == "stop") this.kag.ftag.startTag("s", {
				"val": {}
			})
		}
	}
};
tyrano.plugin.kag.tag.text = {
	cw: true,
	pm: {
		"val": "",
		"backlog": "add"
	},
	start: function (pm) {
		if (this.kag.stat.is_script == true) {
			this.kag.stat.buff_script += pm.val + "\n";
			this.kag.ftag.nextOrder();
			return
		}
		if (this.kag.stat.is_html == true) {
			this.kag.stat.map_html.buff_html += pm.val;
			this.kag.ftag.nextOrder();
			return
		}
		var j_inner_message = this.kag.getMessageInnerLayer();
		j_inner_message.css({
			"letter-spacing": this.kag.config.defaultPitch + "px",
			"line-height": parseInt(this.kag.config.defaultFontSize) + parseInt(this.kag.config.defaultLineSpacing) +
				"px",
			"font-family": this.kag.config.userFace
		});
		this.kag.stat.current_message_str = pm.val;
		if (this.kag.stat.vertical == "true") {
			if (this.kag.config.defaultAutoReturn != "false") {
				var j_outer_message = this.kag.getMessageOuterLayer();
				var limit_width = parseInt(j_outer_message.css("width")) * 0.8;
				var current_width = parseInt(j_inner_message.find("p").css("width"));
				if (current_width > limit_width) this.kag.getMessageInnerLayer().html("")
			}
			this.showMessage(pm.val, pm, true)
		} else {
			if (this.kag.config.defaultAutoReturn != "false") {
				var j_outer_message =
					this.kag.getMessageOuterLayer();
				var limit_height = parseInt(j_outer_message.css("height")) * 0.8;
				var current_height = parseInt(j_inner_message.find("p").css("height"));
				if (current_height > limit_height) this.kag.getMessageInnerLayer().html("")
			}
			this.showMessage(pm.val, pm, false)
		}
	},
	showMessage: function (message_str, pm, isVertical) {
		var that = this;
		if (that.kag.stat.log_join == "true") pm.backlog = "join";
		var chara_name = $.isNull($(".chara_name_area").html());
		if (chara_name != "" && pm.backlog != "join" || chara_name != "" && this.kag.stat.f_chara_ptext ==
			"true") {
			this.kag.pushBackLog("<b class='backlog_chara_name " + chara_name + "'>" + chara_name + "</b>：<span class='backlog_text " + chara_name + "'>" + message_str + "</span>", "add");
			if (this.kag.stat.f_chara_ptext == "true") {
				this.kag.stat.f_chara_ptext = "false";
				this.kag.stat.log_join = "true"
			}
		} else {
			var log_str = "<span class='backlog_text " + chara_name + "'>" + message_str + "</span>";
			if (pm.backlog == "join") this.kag.pushBackLog(log_str, "join");
			else this.kag.pushBackLog(log_str, "add")
		}
		if (that.kag.stat.play_speak == true) speechSynthesis.speak(new SpeechSynthesisUtterance(message_str));
		that.kag.ftag.hideNextImg();
		(function (jtext) {
			if (jtext.html() == "")
				if (isVertical) jtext.append("<p class='vertical_text'></p>");
				else jtext.append("<p class=''></p>");
			var current_str = "";
			if (jtext.find("p").find(".current_span").length != 0) current_str = jtext.find("p").find(".current_span").html();
			that.kag.checkMessage(jtext);
			var j_span = that.kag.getMessageCurrentSpan();
			j_span.css({
				"color": that.kag.stat.font.color,
				"font-weight": that.kag.stat.font.bold,
				"font-size": that.kag.stat.font.size + "px",
				"font-family": that.kag.stat.font.face,
				"font-style": that.kag.stat.font.italic
			});
			if (that.kag.stat.font.edge != "") {
				var edge_color = that.kag.stat.font.edge;
				j_span.css("text-shadow", "1px 1px 0 " + edge_color + ", -1px 1px 0 " + edge_color + ",1px -1px 0 " + edge_color + ",-1px -1px 0 " + edge_color + "")
			} else if (that.kag.stat.font.shadow != "") j_span.css("text-shadow", "2px 2px 2px " + that.kag.stat.font.shadow);
			if (that.kag.config.autoRecordLabel == "true")
				if (that.kag.stat.already_read == true) {
					if (that.kag.config.alreadyReadTextColor != "default") j_span.css("color", $.convertColor(that.kag.config.alreadyReadTextColor))
				} else if (that.kag.config.unReadTextSkip ==
				"false") that.kag.stat.is_skip = false;
			var ch_speed = 30;
			if (that.kag.stat.ch_speed != "") ch_speed = parseInt(that.kag.stat.ch_speed);
			else if (that.kag.config.chSpeed) ch_speed = parseInt(that.kag.config.chSpeed);
			var append_str = "";
			for (var i = 0; i < message_str.length; i++) {
				var c = message_str.charAt(i);
				if (that.kag.stat.ruby_str != "") {
					c = "<ruby><rb>" + c + "</rb><rt>" + that.kag.stat.ruby_str + "</rt></ruby>";
					that.kag.stat.ruby_str = ""
				}
				append_str += "<span style='visibility: hidden'>" + c + "</span>"
			}
			current_str += "<span>" + append_str + "</span>";
			that.kag.appendMessage(jtext, current_str);
			var append_span = j_span.children("span:last-child");
			var makeVisible = function (index) {
				append_span.children("span:eq(" + index + ")").css("visibility", "visible")
			};
			var makeVisibleAll = function () {
				append_span.children("span").css("visibility", "visible")
			};
			var pchar = function (index) {
				var isOneByOne = that.kag.stat.is_skip != true && that.kag.stat.is_nowait != true && ch_speed >= 3;
				if (isOneByOne) makeVisible(index);
				if (index <= message_str.length) {
					that.kag.stat.is_adding_text = true;
					if (that.kag.stat.is_click_text ==
						true || that.kag.stat.is_skip == true || that.kag.stat.is_nowait == true) pchar(++index);
					else setTimeout(function () {
						pchar(++index)
					}, ch_speed)
				} else {
					that.kag.stat.is_adding_text = false;
					that.kag.stat.is_click_text = false;
					if (that.kag.stat.is_stop != "true")
						if (!isOneByOne) {
							makeVisibleAll();
							setTimeout(function () {
								if (!that.kag.stat.is_hide_message) that.kag.ftag.nextOrder()
							}, parseInt(that.kag.config.skipSpeed))
						} else if (!that.kag.stat.is_hide_message) that.kag.ftag.nextOrder()
				}
			};
			pchar(0)
		})(this.kag.getMessageInnerLayer())
	},
	nextOrder: function () {},
	test: function () {}
};
tyrano.plugin.kag.tag.label = {
	pm: {
		nextorder: "true"
	},
	start: function (pm) {
		if (this.kag.config.autoRecordLabel == "true") {
			var sf_tmp = "trail_" + this.kag.stat.current_scenario.replace(".ks", "").replace(/\u002f/g, "").replace(/:/g, "").replace(/\./g, "");
			var sf_buff = this.kag.stat.buff_label_name;
			var sf_label = sf_tmp + "_" + pm.label_name;
			if (this.kag.stat.buff_label_name != "") {
				if (!this.kag.variable.sf.record) this.kag.variable.sf.record = {};
				var sf_str = "sf.record." + sf_buff;
				var scr_str = "" + sf_str + " = " + sf_str + "  || 0;" + sf_str +
					"++;";
				this.kag.evalScript(scr_str)
			}
			if (this.kag.variable.sf.record)
				if (this.kag.variable.sf.record[sf_label]) this.kag.stat.already_read = true;
				else this.kag.stat.already_read = false;
			this.kag.stat.buff_label_name = sf_label
		}
		if (pm.nextorder == "true") this.kag.ftag.nextOrder()
	}
};
tyrano.plugin.kag.tag.config_record_label = {
	pm: {
		color: "",
		skip: ""
	},
	start: function (pm) {
		var that = this;
		if (pm.color != "") {
			this.kag.config.alreadyReadTextColor = pm.color;
			this.kag.ftag.startTag("eval", {
				"exp": "sf._system_config_already_read_text_color = " + pm.color
			})
		}
		if (pm.skip != "") {
			if (pm.skip == "true") this.kag.config.unReadTextSkip = "true";
			else this.kag.config.unReadTextSkip = "false";
			this.kag.ftag.startTag("eval", {
				"exp": "sf._system_config_unread_text_skip = '" + pm.skip + "'"
			})
		}
		this.kag.ftag.nextOrder()
	}
};
tyrano.plugin.kag.tag.l = {
	cw: true,
	start: function () {
		var that = this;
		this.kag.ftag.showNextImg();
		if (this.kag.stat.is_skip == true) this.kag.ftag.nextOrder();
		else if (this.kag.stat.is_auto == true) {
			this.kag.stat.is_wait_auto = true;
			var auto_speed = that.kag.config.autoSpeed;
			if (that.kag.config.autoSpeedWithText != "0") {
				var cnt_text = this.kag.stat.current_message_str.length;
				auto_speed = parseInt(auto_speed) + parseInt(that.kag.config.autoSpeedWithText) * cnt_text
			}
			setTimeout(function () {
				if (that.kag.stat.is_wait_auto == true)
					if (that.kag.tmp.is_vo_play ==
						true) that.kag.tmp.is_vo_play_wait = true;
					else that.kag.ftag.nextOrder()
			}, auto_speed)
		}
	}
};
tyrano.plugin.kag.tag.p = {
	cw: true,
	start: function () {
		var that = this;
		this.kag.stat.flag_ref_page = true;
		this.kag.ftag.showNextImg();
		if (this.kag.stat.is_skip == true) this.kag.ftag.nextOrder();
		else if (this.kag.stat.is_auto == true) {
			this.kag.stat.is_wait_auto = true;
			var auto_speed = that.kag.config.autoSpeed;
			if (that.kag.config.autoSpeedWithText != "0") {
				var cnt_text = this.kag.stat.current_message_str.length;
				auto_speed = parseInt(auto_speed) + parseInt(that.kag.config.autoSpeedWithText) * cnt_text
			}
			setTimeout(function () {
				if (that.kag.stat.is_wait_auto ==
					true)
					if (that.kag.tmp.is_vo_play == true) that.kag.tmp.is_vo_play_wait = true;
					else that.kag.ftag.nextOrder()
			}, auto_speed)
		}
	}
};
tyrano.plugin.kag.tag.graph = {
	vital: ["storage"],
	pm: {
		storage: null
	},
	start: function (pm) {
		var jtext = this.kag.getMessageInnerLayer();
		var current_str = "";
		if (jtext.find("p").find(".current_span").length != 0) current_str = jtext.find("p").find(".current_span").html();
		var storage_url = "";
		if ($.isHTTP(pm.storage)) storage_url = pm.storage;
		else storage_url = "./data/image/" + pm.storage;
		this.kag.appendMessage(jtext, current_str + "<img src='" + storage_url + "' >");
		this.kag.ftag.nextOrder()
	}
};
tyrano.plugin.kag.tag.jump = {
	pm: {
		storage: null,
		target: null,
		countpage: true
	},
	start: function (pm) {
		var that = this;
		setTimeout(function () {
			that.kag.ftag.nextOrderWithLabel(pm.target, pm.storage)
		}, 1)
	}
};
tyrano.plugin.kag.tag.r = {
	log_join: "true",
	start: function () {
		var that = this;
		var j_inner_message = this.kag.getMessageInnerLayer();
		var txt = j_inner_message.find("p").find(".current_span").html() + "<br />";
		j_inner_message.find("p").find(".current_span").html(txt);
		setTimeout(function () {
			that.kag.ftag.nextOrder()
		}, 5)
	}
};
tyrano.plugin.kag.tag.er = {
	start: function () {
		this.kag.ftag.hideNextImg();
		this.kag.getMessageInnerLayer().html("");
		this.kag.ftag.startTag("resetfont")
	}
};
tyrano.plugin.kag.tag.cm = {
	start: function () {
		this.kag.ftag.hideNextImg();
		this.kag.layer.clearMessageInnerLayerAll();
		this.kag.stat.log_clear = true;
		this.kag.layer.getFreeLayer().html("").hide();
		this.kag.ftag.startTag("resetfont")
	}
};
tyrano.plugin.kag.tag.ct = {
	start: function () {
		this.kag.ftag.hideNextImg();
		this.kag.layer.clearMessageInnerLayerAll();
		this.kag.layer.getFreeLayer().html("").hide();
		this.kag.stat.current_layer = "message0";
		this.kag.stat.current_page = "fore";
		this.kag.ftag.startTag("resetfont")
	}
};
tyrano.plugin.kag.tag.current = {
	pm: {
		layer: "",
		page: "fore"
	},
	start: function (pm) {
		if (pm.layer == "") pm.layer = this.kag.stat.current_layer;
		this.kag.stat.current_layer = pm.layer;
		this.kag.stat.current_page = pm.page;
		this.kag.ftag.nextOrder()
	}
};
tyrano.plugin.kag.tag.position = {
	pm: {
		layer: "message0",
		page: "fore",
		left: "",
		top: "",
		width: "",
		height: "",
		color: "",
		opacity: "",
		vertical: "",
		frame: "",
		marginl: "0",
		margint: "0",
		marginr: "0",
		marginb: "0"
	},
	start: function (pm) {
		var target_layer = this.kag.layer.getLayer(pm.layer, pm.page).find(".message_outer");
		var new_style = {};
		if (pm.left != "") new_style["left"] = pm.left + "px";
		if (pm.top != "") new_style["top"] = pm.top + "px";
		if (pm.width != "") new_style["width"] = pm.width + "px";
		if (pm.height != "") new_style["height"] = pm.height + "px";
		if (pm.color !=
			"") new_style["background-color"] = $.convertColor(pm.color);
		if (pm.frame == "none") {
			target_layer.css("opacity", $.convertOpacity(this.kag.config.frameOpacity));
			target_layer.css("background-image", "");
			target_layer.css("background-color", $.convertColor(this.kag.config.frameColor))
		} else if (pm.frame != "") {
			var storage_url = "";
			if ($.isHTTP(pm.frame)) storage_url = pm.frame;
			else storage_url = "./data/image/" + pm.frame + "";
			target_layer.css("background-image", "url(" + storage_url + ")");
			target_layer.css("background-repeat", "no-repeat");
			target_layer.css("opacity", 1);
			target_layer.css("background-color", "")
		}
		if (pm.opacity != "") target_layer.css("opacity", $.convertOpacity(pm.opacity));
		this.kag.setStyles(target_layer, new_style);
		this.kag.layer.refMessageLayer(pm.layer);
		var layer_inner = this.kag.layer.getLayer(pm.layer, pm.page).find(".message_inner");
		if (pm.vertical != "")
			if (pm.vertical == "true") {
				this.kag.stat.vertical = "true";
				layer_inner.find("p").addClass("vertical_text")
			} else {
				this.kag.stat.vertical = "false";
				layer_inner.find("p").removeClass("vertical_text")
			}
		var new_style_inner = {};
		if (pm.marginl != "0") new_style_inner["padding-left"] = parseInt(pm.marginl) + "px";
		if (pm.margint != "0") new_style_inner["padding-top"] = parseInt(pm.margint) + "px";
		if (pm.marginr != "0") new_style_inner["width"] = parseInt(layer_inner.css("width")) - parseInt(pm.marginr) - parseInt(pm.marginl) + "px";
		if (pm.marginb != "0") new_style_inner["height"] = parseInt(layer_inner.css("height")) - parseInt(pm.marginb) - parseInt(pm.margint) + "px";
		this.kag.setStyles(layer_inner, new_style_inner);
		this.kag.ftag.nextOrder()
	}
};


tyrano.plugin.kag.tag.image = {
	pm: {
		layer: "base",
		page: "fore",
		visible: "",
		top: "",
		left: "",
		x: "",
		y: "",
		width: "",
		height: "",
		pos: "",
		name: "",
		folder: "",
		time: "",
		wait: "true",
		depth: "front",
		reflect: "",
		zindex: "1"
	},
	start: function (t) {
		var a = "",
			e = "",
			s = this;
		if ("base" != t.layer) {
			var r = {};
			if ("true" == t.visible && "fore" == t.page && (r.display = "block"), this.kag.setStyles(this.kag.layer.getLayer(t.layer, t.page), r), "" != t.pos) switch (t.pos) {
			case "left":
			case "l":
				t.left = this.kag.config["scPositionX.left"];
				break;
			case "left_center":
			case "lc":
				t.left = this.kag.config["scPositionX.left_center"];
				break;
			case "center":
			case "c":
				t.left = this.kag.config["scPositionX.center"];
				break;
			case "right_center":
			case "rc":
				t.left = this.kag.config["scPositionX.right_center"];
				break;
			case "right":
			case "r":
				t.left = this.kag.config["scPositionX.right"]
			}
			e = "" != t.folder ? t.folder : "fgimage", a = $.isHTTP(t.storage) ? t.storage : "./data/" + e + "/" + t.storage;
			var i = $("<img />");
			i.attr("src", a), i.css("position", "absolute"), i.css("top", t.top + "px"), i.css("left", t.left + "px"), "" != t.width && i.css("width", t.width + "px"), "" != t.height && i.css("height", t.height + "px"), "" != t.x && i.css("left", t.x + "px"), "" != t.y && i.css("top", t.y + "px"), "" != t.zindex && i.css("z-index", t.zindex), "" != t.reflect && "true" == t.reflect && i.addClass("reflect"), $.setName(i, t.name), 0 != t.time && "0" != t.time || (t.time = ""), "" != t.time ? (i.css("opacity", 0), "back" == t.depth ? this.kag.layer.getLayer(t.layer, t.page).prepend(i) : this.kag.layer.getLayer(t.layer, t.page).append(i), i.animate({
				opacity: 1
			}, parseInt(t.time), function () {
				"true" == t.wait && s.kag.ftag.nextOrder()
			}), "true" != t.wait && s.kag.ftag.nextOrder()) : ("back" == t.depth ? this.kag.layer.getLayer(t.layer, t.page).prepend(i) : this.kag.layer.getLayer(t.layer, t.page).append(i), this.kag.ftag.nextOrder())
		} else {
			e = "" != t.folder ? t.folder : "bgimage";
			var n = {
				"background-image": "url(" + (a = $.isHTTP(t.storage) ? t.storage : "./data/" + e + "/" + t.storage) + ")",
				display: "none"
			};
			"fore" === t.page && (n.display = "block"), this.kag.setStyles(this.kag.layer.getLayer(t.layer, t.page), n), this.kag.ftag.nextOrder()
		}
	}
},



tyrano.plugin.kag.tag.freeimage = {
	vital: ["layer"],
	pm: {
		layer: "",
		page: "fore",
		time: "",
		wait: "true"
	},
	start: function (pm) {
		var that = this;
		if (pm.layer != "base") {
			if (pm.time == 0) pm.time = "";
			if (pm.time != "") {
				var j_obj = this.kag.layer.getLayer(pm.layer, pm.page).children();
				if (!j_obj.get(0))
					if (pm.wait == "true") {
						that.kag.ftag.nextOrder();
						return
					}
				var cnt = 0;
				var s_cnt = j_obj.length;
				j_obj.animate({
					"opacity": 0
				}, parseInt(pm.time), function () {
					that.kag.layer.getLayer(pm.layer, pm.page).empty();
					cnt++;
					if (s_cnt == cnt)
						if (pm.wait == "true") that.kag.ftag.nextOrder()
				})
			} else {
				that.kag.layer.getLayer(pm.layer,
					pm.page).empty();
				that.kag.ftag.nextOrder()
			}
		} else {
			this.kag.layer.getLayer(pm.layer, pm.page).css("background-image", "");
			this.kag.ftag.nextOrder()
		}
		if (pm.wait == "false") this.kag.ftag.nextOrder()
	}
};
tyrano.plugin.kag.tag.freelayer = tyrano.plugin.kag.tag.freeimage;
tyrano.plugin.kag.tag.free = {
	vital: ["layer", "name"],
	pm: {
		layer: "",
		page: "fore",
		name: "",
		wait: "true",
		time: ""
	},
	start: function (pm) {
		var that = this;
		if (pm.layer != "base") {
			if (pm.time == 0) pm.time = "";
			if (pm.time != "") {
				var j_obj = this.kag.layer.getLayer(pm.layer, pm.page);
				j_obj = j_obj.find("." + pm.name);
				if (!j_obj.get(0))
					if (pm.wait == "true") {
						that.kag.ftag.nextOrder();
						return
					}
				var cnt = 0;
				var s_cnt = j_obj.length;
				j_obj.animate({
					"opacity": 0
				}, parseInt(pm.time), function () {
					j_obj.remove();
					cnt++;
					if (cnt == s_cnt)
						if (pm.wait == "true") that.kag.ftag.nextOrder()
				});
				if (pm.wait == "false") that.kag.ftag.nextOrder()
			} else {
				var j_obj = this.kag.layer.getLayer(pm.layer, pm.page);
				j_obj = j_obj.find("." + pm.name);
				j_obj.remove();
				that.kag.ftag.nextOrder()
			}
		} else {
			var j_obj = this.kag.layer.getLayer(pm.layer, pm.page);
			j_obj = j_obj.find("." + pm.name);
			j_obj.remove();
			this.kag.ftag.nextOrder()
		}
	}
};
tyrano.plugin.kag.tag.ptext = {
	vital: ["layer", "x", "y"],
	pm: {
		"layer": "0",
		"page": "fore",
		"x": 0,
		"y": 0,
		"vertical": "false",
		"text": "",
		"size": "",
		"face": "",
		"color": "",
		"italic": "",
		"bold": "",
		"align": "left",
		"edge": "",
		"shadow": "",
		"name": "",
		"time": "",
		"width": "",
		"zindex": "9999",
		"overwrite": "false"
	},
	start: function (pm) {
		var that = this;
		if (pm.face == "") pm.face = that.kag.stat.font.face;
		if (pm.color == "") pm.color = $.convertColor(that.kag.stat.font.color);
		else pm.color = $.convertColor(pm.color);
		var font_new_style = {
			"color": pm.color,
			"font-weight": pm.bold,
			"font-style": pm.fontstyle,
			"font-size": pm.size + "px",
			"font-family": pm.face,
			"z-index": "999",
			"text": ""
		};
		if (pm.edge != "") {
			var edge_color = $.convertColor(pm.edge);
			font_new_style["text-shadow"] = "1px 1px 0 " + edge_color + ", -1px 1px 0 " + edge_color + ",1px -1px 0 " + edge_color + ",-1px -1px 0 " + edge_color + ""
		} else if (pm.shadow != "") font_new_style["text-shadow"] = "2px 2px 2px " + $.convertColor(pm.shadow);
		var target_layer = this.kag.layer.getLayer(pm.layer, pm.page);
		if (pm.overwrite == "true" && pm.name != "")
			if ($("." +
					pm.name).length > 0) {
				$("." + pm.name).html($.escapeHTML(pm.text));
				if (pm.x != 0) $("." + pm.name).css("left", parseInt(pm.x));
				if (pm.y != 0) $("." + pm.name).css("top", parseInt(pm.y));
				if (pm.color != "") $("." + pm.name).css("color", $.convertColor(pm.color));
				if (pm.size != "") $("." + pm.name).css("font-size", parseInt(pm.size));
				this.kag.ftag.nextOrder();
				return false
			}
		var tobj = $("<p></p>");
		tobj.css("position", "absolute");
		tobj.css("top", pm.y + "px");
		tobj.css("left", pm.x + "px");
		tobj.css("width", pm.width);
		tobj.css("text-align", pm.align);
		if (pm.vertical == "true") tobj.addClass("vertical_text");
		$.setName(tobj, pm.name);
		tobj.html($.escapeHTML(pm.text));
		this.kag.setStyles(tobj, font_new_style);
		if (pm.layer == "fix") tobj.addClass("fixlayer");
		if (pm.time != "") {
			tobj.css("opacity", 0);
			target_layer.append(tobj);
			tobj.animate({
				"opacity": 1
			}, parseInt(pm.time), function () {
				that.kag.ftag.nextOrder()
			})
		} else {
			target_layer.append(tobj);
			this.kag.ftag.nextOrder()
		}
	}
};
tyrano.plugin.kag.tag.mtext = {
	vital: ["x", "y"],
	pm: {
		"layer": "0",
		"page": "fore",
		"x": 0,
		"y": 0,
		"vertical": "false",
		"text": "",
		"size": "",
		"face": "",
		"color": "",
		"italic": "",
		"bold": "",
		"shadow": "",
		"edge": "",
		"name": "",
		"zindex": "9999",
		"width": "",
		"align": "left",
		"fadeout": "true",
		"time": "2000",
		"in_effect": "fadeIn",
		"in_delay": "50",
		"in_delay_scale": "1.5",
		"in_sync": "false",
		"in_shuffle": "false",
		"in_reverse": "false",
		"wait": "true",
		"out_effect": "fadeOut",
		"out_delay": "50",
		"out_scale_delay": "",
		"out_sync": "false",
		"out_shuffle": "false",
		"out_reverse": "false"
	},
	start: function (pm) {
		var that = this;
		if (pm.face == "") pm.face = that.kag.stat.font.face;
		if (pm.color == "") pm.color = $.convertColor(that.kag.stat.font.color);
		else pm.color = $.convertColor(pm.color);
		var font_new_style = {
			"color": pm.color,
			"font-weight": pm.bold,
			"font-style": pm.fontstyle,
			"font-size": pm.size + "px",
			"font-family": pm.face,
			"z-index": "999",
			"text": ""
		};
		if (pm.edge != "") {
			var edge_color = $.convertColor(pm.edge);
			font_new_style["text-shadow"] = "1px 1px 0 " + edge_color + ", -1px 1px 0 " + edge_color +
				",1px -1px 0 " + edge_color + ",-1px -1px 0 " + edge_color + ""
		} else if (pm.shadow != "") font_new_style["text-shadow"] = "2px 2px 2px " + $.convertColor(pm.shadow);
		var target_layer = this.kag.layer.getLayer(pm.layer, pm.page);
		var tobj = $("<p></p>");
		tobj.css("position", "absolute");
		tobj.css("top", pm.y + "px");
		tobj.css("left", pm.x + "px");
		tobj.css("width", pm.width);
		tobj.css("text-align", pm.align);
		if (pm.vertical == "true") tobj.addClass("vertical_text");
		$.setName(tobj, pm.name);
		tobj.html(pm.text);
		this.kag.setStyles(tobj, font_new_style);
		if (pm.layer == "fix") tobj.addClass("fixlayer");
		target_layer.append(tobj);
		for (key in pm)
			if (pm[key] == "true") pm[key] = true;
			else if (pm[key] == "false") pm[key] = false;
		tobj.textillate({
			"loop": pm["fadeout"],
			"minDisplayTime": pm["time"],
			"in": {
				"effect": pm["in_effect"],
				"delayScale": pm["in_delay_scale"],
				"delay": pm["in_delay"],
				"sync": pm["in_sync"],
				"shuffle": pm["in_shuffle"],
				"reverse": pm["in_reverse"],
				"callback": function () {
					if (pm.fadeout == false && pm.wait == true) that.kag.ftag.nextOrder()
				}
			},
			"out": {
				"effect": pm["out_effect"],
				"delayScale": pm["out_delay_scale"],
				"delay": pm["out_delay"],
				"sync": pm["out_sync"],
				"shuffle": pm["out_shuffle"],
				"reverse": pm["out_reverse"],
				"callback": function () {
					tobj.remove();
					if (pm.wait == true) that.kag.ftag.nextOrder()
				}
			}
		});
		if (pm.wait != true) this.kag.ftag.nextOrder()
	}
};
tyrano.plugin.kag.tag.backlay = {
	pm: {
		layer: ""
	},
	start: function (pm) {
		this.kag.layer.backlay(pm.layer);
		this.kag.ftag.nextOrder()
	}
};
tyrano.plugin.kag.tag.wt = {
	start: function (pm) {
		if (this.kag.stat.is_trans == false) {
			this.kag.layer.showEventLayer();
			this.kag.ftag.nextOrder()
		} else this.kag.layer.hideEventLayer()
	}
};
tyrano.plugin.kag.tag.wb = {
	start: function (pm) {
		this.kag.layer.hideEventLayer()
	}
};
tyrano.plugin.kag.tag.link = {
	pm: {
		target: null,
		storage: null
	},
	start: function (pm) {
		var that = this;
		var j_span = this.kag.setMessageCurrentSpan();
		j_span.css("cursor", "pointer");
		(function () {
			var _target = pm.target;
			var _storage = pm.storage;
			that.kag.event.addEventElement({
				"tag": "link",
				"j_target": j_span,
				"pm": pm
			});
			that.setEvent(j_span, pm)
		})();
		this.kag.ftag.nextOrder()
	},
	setEvent: function (j_span, pm) {
		var _target = pm.target;
		var _storage = pm.storage;
		var that = TYRANO;
		j_span.bind("click touchstart", function (e) {
			TYRANO.kag.ftag.nextOrderWithLabel(_target,
				_storage);
			TYRANO.kag.layer.showEventLayer();
			if (that.kag.stat.skip_link == "true") e.stopPropagation();
			else that.kag.stat.is_skip = false
		});
		j_span.css("cursor", "pointer")
	}
};
tyrano.plugin.kag.tag.endlink = {
	start: function (pm) {
		var j_span = this.kag.setMessageCurrentSpan();
		this.kag.ftag.nextOrder()
	}
};
tyrano.plugin.kag.tag.s = {
	start: function () {
		this.kag.stat.is_strong_stop = true;
		this.kag.layer.hideEventLayer()
	}
};
tyrano.plugin.kag.tag._s = {
	vital: [],
	pm: {},
	start: function (pm) {
		this.kag.stat.strong_stop_recover_index = this.kag.ftag.current_order_index;
		this.kag.ftag.nextOrder()
	}
};
tyrano.plugin.kag.tag.wait = {
	vital: ["time"],
	pm: {
		time: 0
	},
	start: function (pm) {
		var that = this;
		this.kag.stat.is_strong_stop = true;
		this.kag.stat.is_wait = true;
		this.kag.layer.hideEventLayer();
		that.kag.tmp.wait_id = setTimeout(function () {
			that.kag.stat.is_strong_stop = false;
			that.kag.stat.is_wait = false;
			that.kag.layer.showEventLayer();
			that.kag.ftag.nextOrder()
		}, pm.time)
	}
};
tyrano.plugin.kag.tag.wait_cancel = {
	vital: [],
	pm: {},
	start: function (pm) {
		var that = this;
		clearTimeout(this.kag.tmp.wait_id);
		this.kag.tmp.wait_id = "";
		this.kag.stat.is_strong_stop = false;
		this.kag.stat.is_wait = false;
		this.kag.layer.showEventLayer();
		this.kag.ftag.nextOrder()
	}
};
tyrano.plugin.kag.tag.hidemessage = {
	start: function () {
		this.kag.stat.is_hide_message = true;
		this.kag.layer.hideMessageLayers();
		this.kag.layer.layer_event.show()
	}
};
tyrano.plugin.kag.tag.quake = {
	vital: ["time"],
	pm: {
		count: 5,
		time: 300,
		timemode: "",
		hmax: "0",
		vmax: "10",
		wait: "true"
	},
	start: function (pm) {
		var that = this;
		if (pm.hmax != "0") $("." + this.kag.define.BASE_DIV_NAME).effect("shake", {
			times: parseInt(pm.count),
			distance: parseInt(pm.hmax),
			direction: "left"
		}, parseInt(pm.time), function () {
			if (pm.wait == "true") that.kag.ftag.nextOrder()
		});
		else if (pm.vmax != "0") $("." + this.kag.define.BASE_DIV_NAME).effect("shake", {
				times: parseInt(pm.count),
				distance: parseInt(pm.vmax),
				direction: "up"
			}, parseInt(pm.time),
			function () {
				if (pm.wait == "true") that.kag.ftag.nextOrder()
			});
		if (pm.wait == "false") that.kag.ftag.nextOrder()
	}
};
tyrano.plugin.kag.tag.font = {
	pm: {},
	log_join: "true",
	start: function (pm) {
		this.kag.setMessageCurrentSpan();
		var new_font = {};
		if (pm.size) this.kag.stat.font.size = pm.size;
		if (pm.color) this.kag.stat.font.color = $.convertColor(pm.color);
		if (pm.bold) this.kag.stat.font.bold = $.convertBold(pm.bold);
		if (pm.face) this.kag.stat.font.face = pm.face;
		if (pm.italic) this.kag.stat.font["italic"] = $.convertItalic(pm.italic);
		if (pm.edge)
			if (pm.edge == "none" || pm.edge == "") this.kag.stat.font.edge = "";
			else this.kag.stat.font.edge = $.convertColor(pm.edge);
		if (pm.shadow)
			if (pm.shadow == "none" || pm.shadow == "") this.kag.stat.font.shadow = "";
			else this.kag.stat.font.shadow = $.convertColor(pm.shadow);
		this.kag.ftag.nextOrder()
	}
};
tyrano.plugin.kag.tag.deffont = {
	pm: {},
	start: function (pm) {
		var new_font = {};
		if (pm.size) this.kag.stat.default_font.size = pm.size;
		if (pm.color) this.kag.stat.default_font.color = $.convertColor(pm.color);
		if (pm.bold) this.kag.stat.default_font.bold = $.convertBold(pm.bold);
		if (pm.face) this.kag.stat.default_font.face = pm.face;
		if (pm.italic) this.kag.stat.default_font.italic = $.convertItalic(pm.italic);
		if (pm.edge)
			if (pm.edge == "none" || pm.edge == "") this.kag.stat.default_font.edge = "";
			else this.kag.stat.default_font.edge = $.convertColor(pm.edge);
		if (pm.shadow)
			if (pm.shadow == "none" || pm.shadow == "") this.kag.stat.default_font.shadow = "";
			else this.kag.stat.default_font.shadow = $.convertColor(pm.shadow);
		this.kag.ftag.nextOrder()
	}
};
tyrano.plugin.kag.tag.delay = {
	pm: {
		speed: ""
	},
	log_join: "true",
	start: function (pm) {
		if (pm.speed != "") this.kag.stat.ch_speed = parseInt(pm.speed);
		this.kag.ftag.nextOrder()
	}
};
tyrano.plugin.kag.tag.resetdelay = {
	pm: {
		speed: ""
	},
	log_join: "true",
	start: function (pm) {
		this.kag.stat.ch_speed = "";
		this.kag.ftag.nextOrder()
	}
};
tyrano.plugin.kag.tag.configdelay = {
	pm: {
		speed: ""
	},
	start: function (pm) {
		if (pm.speed != "") {
			this.kag.stat.ch_speed = "";
			this.kag.config.chSpeed = pm.speed;
			this.kag.ftag.startTag("eval", {
				"exp": "sf._config_ch_speed = " + pm.speed
			})
		} else this.kag.ftag.nextOrder()
	}
};
tyrano.plugin.kag.tag.nowait = {
	pm: {},
	start: function (pm) {
		this.kag.stat.is_nowait = true;
		this.kag.ftag.nextOrder()
	}
};
tyrano.plugin.kag.tag.endnowait = {
	pm: {},
	start: function (pm) {
		this.kag.stat.is_nowait = false;
		this.kag.ftag.nextOrder()
	}
};
tyrano.plugin.kag.tag.resetfont = {
	log_join: "true",
	start: function () {
		var j_span = this.kag.setMessageCurrentSpan();
		this.kag.stat.font = $.extend(true, {}, this.kag.stat.default_font);
		this.kag.ftag.nextOrder()
	}
};
tyrano.plugin.kag.tag.layopt = {
	vital: ["layer"],
	pm: {
		layer: "",
		page: "fore",
		visible: "",
		left: "",
		top: "",
		opacity: "",
		autohide: false,
		index: 10
	},
	start: function (pm) {
		var that = this;
		if (pm.layer == "message") {
			pm.layer = this.kag.stat.current_layer;
			pm.page = this.kag.stat.current_page
		}
		var j_layer = this.kag.layer.getLayer(pm.layer, pm.page);
		if (pm.layer == "fix" || pm.layer == "fixlayer") j_layer = $("#tyrano_base").find(".fixlayer");
		if (pm.visible != "")
			if (pm.visible == "true") {
				if (pm.page == "fore") j_layer.css("display", "");
				j_layer.attr("l_visible",
					"true")
			} else {
				j_layer.css("display", "none");
				j_layer.attr("l_visible", "false")
			}
		if (pm.left != "") j_layer.css("left", parseInt(pm.left));
		if (pm.top != "") j_layer.css("top", parseInt(pm.top));
		if (pm.opacity != "") j_layer.css("opacity", $.convertOpacity(pm.opacity));
		this.kag.ftag.nextOrder()
	}
};
tyrano.plugin.kag.tag["ruby"] = {
	vital: ["text"],
	pm: {
		text: ""
	},
	log_join: "true",
	start: function (pm) {
		var str = pm.text;
		this.kag.stat.ruby_str = str;
		this.kag.ftag.nextOrder()
	}
};
tyrano.plugin.kag.tag.cancelskip = {
	start: function (pm) {
		this.kag.stat.is_skip = false;
		this.kag.ftag.nextOrder()
	}
};
tyrano.plugin.kag.tag.locate = {
	pm: {
		x: null,
		y: null
	},
	start: function (pm) {
		if (pm.x != null) this.kag.stat.locate.x = pm.x;
		if (pm.y != null) this.kag.stat.locate.y = pm.y;
		this.kag.ftag.nextOrder()
	}
};
tyrano.plugin.kag.tag.button = {
	pm: {
		graphic: "",
		storage: null,
		target: null,
		ext: "",
		name: "",
		x: "",
		y: "",
		width: "",
		height: "",
		fix: "false",
		savesnap: "false",
		folder: "image",
		exp: "",
		prevar: "",
		visible: "true",
		hint: "",
		clickse: "",
		enterse: "",
		leavese: "",
		clickimg: "",
		enterimg: "",
		auto_next: "yes",
		role: ""
	},
	start: function (pm) {
		var that = this;
		var target_layer = null;
		if (pm.role != "") pm.fix = "true";
		if (pm.fix == "false") {
			target_layer = this.kag.layer.getFreeLayer();
			target_layer.css("z-index", 999999)
		} else target_layer = this.kag.layer.getLayer("fix");
		var storage_url = "";
		if ($.isHTTP(pm.graphic)) storage_url = pm.graphic;
		else storage_url = "./data/" + pm.folder + "/" + pm.graphic;
		var j_button = $("<img />");
		j_button.attr("src", storage_url);
		j_button.css("position", "absolute");
		j_button.css("cursor", "pointer");
		j_button.css("z-index", 99999999);
		if (pm.visible == "true") j_button.show();
		else j_button.hide();
		if (pm.x == "") j_button.css("left", this.kag.stat.locate.x + "px");
		else j_button.css("left", pm.x + "px");
		if (pm.y == "") j_button.css("top", this.kag.stat.locate.y + "px");
		else j_button.css("top",
			pm.y + "px");
		if (pm.fix != "false") j_button.addClass("fixlayer");
		if (pm.width != "") j_button.css("width", pm.width + "px");
		if (pm.height != "") j_button.css("height", pm.height + "px");
		if (pm.hint != "") j_button.attr({
			"title": pm.hint,
			"alt": pm.hint
		});
		$.setName(j_button, pm.name);
		that.kag.event.addEventElement({
			"tag": "button",
			"j_target": j_button,
			"pm": pm
		});
		that.setEvent(j_button, pm);
		target_layer.append(j_button);
		if (pm.fix == "false") target_layer.show();
		this.kag.ftag.nextOrder()
	},
	setEvent: function (j_button, pm) {
		var that = TYRANO;
		(function () {
			var _target = pm.target;
			var _storage = pm.storage;
			var _pm = pm;
			var preexp = that.kag.embScript(pm.preexp);
			var button_clicked = false;
			j_button.hover(function () {
				if (_pm.enterse != "") that.kag.ftag.startTag("playse", {
					"storage": _pm.enterse,
					"stop": true
				});
				if (_pm.enterimg != "") {
					var enter_img_url = "";
					if ($.isHTTP(_pm.enterimg)) enter_img_url = _pm.enterimg;
					else enter_img_url = "./data/" + _pm.folder + "/" + _pm.enterimg;
					$(this).attr("src", enter_img_url)
				}
			}, function () {
				if (_pm.leavese != "") that.kag.ftag.startTag("playse", {
					"storage": _pm.leavese,
					"stop": true
				});
				if (_pm.enterimg != "") {
					var enter_img_url = "";
					if ($.isHTTP(_pm.graphic)) enter_img_url = _pm.graphic;
					else enter_img_url = "./data/" + _pm.folder + "/" + _pm.graphic;
					$(this).attr("src", enter_img_url)
				}
			});
			j_button.click(function (event) {
				if (_pm.clickimg != "") {
					var click_img_url = "";
					if ($.isHTTP(_pm.clickimg)) click_img_url = _pm.clickimg;
					else click_img_url = "./data/" + _pm.folder + "/" + _pm.clickimg;
					j_button.attr("src", click_img_url)
				}
				if (button_clicked == true && _pm.fix == "false") return false;
				if (that.kag.stat.is_strong_stop !=
					true && _pm.fix == "false") return false;
				button_clicked = true;
				if (_pm.exp != "") that.kag.embScript(_pm.exp, preexp);
				if (_pm.savesnap == "true") {
					if (that.kag.stat.is_stop == true) return false;
					that.kag.menu.snapSave(that.kag.stat.current_save_str)
				}
				if (that.kag.layer.layer_event.css("display") == "none" && that.kag.stat.is_strong_stop != true) return false;
				if (_pm.role != "") {
					that.kag.stat.is_skip = false;
					if (_pm.role != "auto") that.kag.ftag.startTag("autostop", {
						next: "false"
					});
					if (_pm.role == "save" || _pm.role == "menu" || _pm.role == "quicksave" ||
						_pm.role == "sleepgame")
						if (that.kag.stat.is_adding_text == true || that.kag.stat.is_wait == true) return false;
					switch (_pm.role) {
					case "save":
						that.kag.menu.displaySave();
						break;
					case "load":
						that.kag.menu.displayLoad();
						break;
					case "window":
						that.kag.layer.hideMessageLayers();
						break;
					case "title":
						that.kag.backTitle();
						break;
					case "menu":
						that.kag.menu.showMenu();
						break;
					case "skip":
						that.kag.ftag.startTag("skipstart", {});
						break;
					case "backlog":
						that.kag.menu.displayLog();
						break;
					case "fullscreen":
						that.kag.menu.screenFull();
						break;
					case "quicksave":
						that.kag.menu.setQuickSave();
						break;
					case "quickload":
						that.kag.menu.loadQuickSave();
						break;
					case "auto":
						if (that.kag.stat.is_auto == true) that.kag.ftag.startTag("autostop", {
							next: "false"
						});
						else that.kag.ftag.startTag("autostart", {});
						break;
					case "sleepgame":
						j_button.trigger("mouseout");
						if (that.kag.tmp.sleep_game != null) return false;
						that.kag.tmp.sleep_game = {};
						_pm.next = false;
						that.kag.ftag.startTag("sleepgame", _pm);
						break
					}
					if (_pm.clickse != "") that.kag.ftag.startTag("playse", {
						"storage": _pm.clickse,
						"stop": true
					});
					event.stopPropagation();
					return false
				}
				if (_pm.clickse != "") that.kag.ftag.startTag("playse", {
					"storage": _pm.clickse,
					"stop": true
				});
				that.kag.layer.showEventLayer();
				if (_pm.role == "" && _pm.fix == "true") {
					var stack_pm = that.kag.getStack("call");
					if (stack_pm == null) {
						var _auto_next = _pm.auto_next;
						if (that.kag.stat.is_strong_stop == true) _auto_next = "stop";
						else;
						that.kag.ftag.startTag("call", {
							storage: _storage,
							target: _target,
							auto_next: _auto_next
						})
					} else {
						that.kag.log("callスタックが残っている場合、fixボタンは反応しません");
						that.kag.log(stack_pm);
						return false
					}
				} else that.kag.ftag.startTag("jump", _pm);
				if (that.kag.stat.skip_link == "true") event.stopPropagation();
				else that.kag.stat.is_skip = false
			})
		})()
	}
};
tyrano.plugin.kag.tag.glink = {
	pm: {
		color: "black",
		font_color: "",
		storage: null,
		target: null,
		name: "",
		text: "",
		x: "auto",
		y: "",
		width: "",
		height: "",
		size: 30,
		graphic: "",
		enterimg: "",
		clickse: "",
		enterse: "",
		leavese: "",
		face: ""
	},
	start: function (pm) {
		var that = this;
		var target_layer = null;
		target_layer = this.kag.layer.getFreeLayer();
		target_layer.css("z-index", 999999);
		var j_button = $("<div class='glink_button'>" + pm.text + "</div>");
		j_button.css("position", "absolute");
		j_button.css("cursor", "pointer");
		j_button.css("z-index", 99999999);
		j_button.css("font-size", pm.size + "px");
		if (pm.font_color != "") j_button.css("color", $.convertColor(pm.font_color));
		if (pm.height != "") j_button.css("height", pm.height + "px");
		if (pm.width != "") j_button.css("width", pm.width + "px");
		if (pm.graphic != "") {
			j_button.removeClass("glink_button").addClass("button_graphic");
			var img_url = "./data/image/" + pm.graphic;
			j_button.css("background-image", "url(" + img_url + ")");
			j_button.css("background-repeat", "no-repeat");
			j_button.css("background-position", "center center");
			j_button.css("background-size",
				"100% 100%")
		} else j_button.addClass(pm.color);
		if (pm.face != "") j_button.css("font-family", pm.face);
		else if (that.kag.stat.font.face != "") j_button.css("font-family", that.kag.stat.font.face);
		if (pm.x == "auto") {
			var sc_width = parseInt(that.kag.config.scWidth);
			var center = Math.floor(parseInt(j_button.css("width")) / 2);
			var base = Math.floor(sc_width / 2);
			var first_left = base - center;
			j_button.css("left", first_left + "px")
		} else if (pm.x == "") j_button.css("left", this.kag.stat.locate.x + "px");
		else j_button.css("left", pm.x + "px");
		if (pm.y == "") j_button.css("top", this.kag.stat.locate.y + "px");
		else j_button.css("top", pm.y + "px");
		$.setName(j_button, pm.name);
		that.kag.event.addEventElement({
			"tag": "glink",
			"j_target": j_button,
			"pm": pm
		});
		this.setEvent(j_button, pm);
		target_layer.append(j_button);
		target_layer.show();
		this.kag.ftag.nextOrder()
	},
	setEvent: function (j_button, pm) {
		var that = TYRANO;
		(function () {
			var _target = pm.target;
			var _storage = pm.storage;
			var _pm = pm;
			var preexp = that.kag.embScript(pm.preexp);
			var button_clicked = false;
			j_button.click(function (e) {
				if (_pm.clickse !=
					"") that.kag.ftag.startTag("playse", {
					"storage": _pm.clickse,
					"stop": true
				});
				if (that.kag.stat.is_strong_stop != true) return false;
				button_clicked = true;
				if (_pm.exp != "") that.kag.embScript(_pm.exp, preexp);
				that.kag.layer.showEventLayer();
				that.kag.ftag.startTag("cm", {});
				that.kag.ftag.startTag("jump", _pm);
				if (that.kag.stat.skip_link == "true") e.stopPropagation();
				else that.kag.stat.is_skip = false
			});
			j_button.hover(function () {
				if (_pm.enterimg != "") {
					var enterimg_url = "./data/image/" + _pm.enterimg;
					j_button.css("background-image",
						"url(" + enterimg_url + ")")
				}
				if (_pm.enterse != "") that.kag.ftag.startTag("playse", {
					"storage": _pm.enterse,
					"stop": true
				})
			}, function () {
				if (_pm.enterimg != "") {
					var img_url = "./data/image/" + _pm.graphic;
					j_button.css("background-image", "url(" + img_url + ")")
				}
				if (_pm.leavese != "") that.kag.ftag.startTag("playse", {
					"storage": _pm.leavese,
					"stop": true
				})
			})
		})()
	}
};
tyrano.plugin.kag.tag.clickable = {
	vital: ["width", "height"],
	pm: {
		width: "0",
		height: "0",
		x: "",
		y: "",
		border: "none",
		color: "",
		mouseopacity: "",
		opacity: "140",
		storage: null,
		target: null,
		name: ""
	},
	start: function (pm) {
		var that = this;
		var layer_free = this.kag.layer.getFreeLayer();
		layer_free.css("z-index", 9999999);
		var j_button = $("<div />");
		j_button.css("position", "absolute");
		j_button.css("cursor", "pointer");
		j_button.css("top", this.kag.stat.locate.y + "px");
		j_button.css("left", this.kag.stat.locate.x + "px");
		j_button.css("width",
			pm.width + "px");
		j_button.css("height", pm.height + "px");
		j_button.css("opacity", $.convertOpacity(pm.opacity));
		j_button.css("background-color", $.convertColor(pm.color));
		j_button.css("border", $.replaceAll(pm.border, ":", " "));
		if (pm.x != "") j_button.css("left", parseInt(pm.x));
		if (pm.y != "") j_button.css("top", parseInt(pm.y));
		that.kag.event.addEventElement({
			"tag": "clickable",
			"j_target": j_button,
			"pm": pm
		});
		that.setEvent(j_button, pm);
		layer_free.append(j_button);
		layer_free.show();
		this.kag.ftag.nextOrder()
	},
	setEvent: function (j_button,
		pm) {
		var that = TYRANO;
		(function () {
			var _target = pm.target;
			var _storage = pm.storage;
			var _pm = pm;
			if (_pm.mouseopacity != "") {
				j_button.bind("mouseover", function () {
					j_button.css("opacity", $.convertOpacity(_pm.mouseopacity))
				});
				j_button.bind("mouseout", function () {
					j_button.css("opacity", $.convertOpacity(_pm.opacity))
				})
			}
			j_button.click(function () {
				var is_s = function (obj) {
					if (obj.kag.stat.is_strong_stop != true) return false;
					return true
				}(that);
				if (is_s == false) return false;
				that.kag.ftag.startTag("cm", {});
				that.kag.layer.showEventLayer();
				that.kag.ftag.startTag("jump", _pm)
			})
		})()
	}
};
tyrano.plugin.kag.tag.glyph = {
	pm: {
		line: "nextpage.gif",
		layer: "message0",
		fix: "false",
		left: 0,
		top: 0
	},
	start: function (pm) {
		var that = this;
		$(".glyph_image").remove();
		if (pm.fix == "true") {
			var j_layer = this.kag.layer.getLayer(pm.layer);
			var j_next = $("<img class='glyph_image' />");
			j_next.attr("src", "./tyrano/images/system/" + pm.line);
			j_next.css("position", "absolute");
			j_next.css("z-index", 99999);
			j_next.css("top", pm.top + "px");
			j_next.css("left", pm.left + "px");
			j_next.css("display", "none");
			j_layer.append(j_next);
			this.kag.stat.flag_glyph =
				"true"
		} else this.kag.stat.flag_glyph = "false";
		this.kag.ftag.nextOrder()
	}
};
tyrano.plugin.kag.tag.trans = {
	vital: ["time", "layer"],
	pm: {
		layer: "base",
		method: "fadeIn",
		children: false,
		time: 1500
	},
	start: function (pm) {
		this.kag.ftag.hideNextImg();
		this.kag.stat.is_trans = true;
		var that = this;
		var comp_num = 0;
		var layer_num = $.countObj(this.kag.layer.map_layer_fore);
		if (pm.children == "false") layer_num = 0;
		var map_layer_fore = $.cloneObject(this.kag.layer.map_layer_fore);
		var map_layer_back = $.cloneObject(this.kag.layer.map_layer_back);
		for (key in map_layer_fore)
			if (pm.children == true || key === pm.layer)(function () {
				var _key =
					key;
				var layer_fore = map_layer_fore[_key];
				var layer_back = map_layer_back[_key];
				if (_key.indexOf("message") != -1 && layer_back.attr("l_visible") == "false") {
					comp_num++;
					that.kag.layer.forelay(_key)
				} else $.trans(pm.method, layer_back, parseInt(pm.time), "show", function () {
					comp_num++;
					that.kag.layer.forelay(_key);
					that.kag.ftag.completeTrans();
					that.kag.ftag.hideNextImg()
				})
			})();
		this.kag.ftag.nextOrder()
	}
};
tyrano.plugin.kag.tag.bg = {
	vital: ["storage"],
	pm: {
		storage: "",
		method: "crossfade",
		wait: "true",
		time: 3E3,
		cross: "false"
	},
	start: function (pm) {
		this.kag.ftag.hideNextImg();
		var that = this;
		if (pm.time == 0) pm.wait = "false";
		var storage_url = "./data/bgimage/" + pm.storage;
		if ($.isHTTP(pm.storage)) storage_url = pm.storage;
		this.kag.preload(storage_url, function () {
			var j_old_bg = that.kag.layer.getLayer("base", "fore");
			var j_new_bg = j_old_bg.clone(false);
			j_new_bg.css("background-image", "url(" + storage_url + ")");
			j_new_bg.css("display",
				"none");
			j_old_bg.after(j_new_bg);
			that.kag.ftag.hideNextImg();
			that.kag.layer.updateLayer("base", "fore", j_new_bg);
			if (pm.wait == "true") that.kag.layer.hideEventLayer();
			pm.time = that.kag.cutTimeWithSkip(pm.time);
			if (pm.cross == "true") $.trans(pm.method, j_old_bg, parseInt(pm.time), "hide", function () {
				j_old_bg.remove()
			});
			$.trans(pm.method, j_new_bg, parseInt(pm.time), "show", function () {
				j_new_bg.css("opacity", 1);
				if (pm.cross == "false") j_old_bg.remove();
				if (pm.wait == "true") {
					that.kag.layer.showEventLayer();
					that.kag.ftag.nextOrder()
				}
			})
		});
		if (pm.wait == "false") this.kag.ftag.nextOrder()
	}
};
tyrano.plugin.kag.tag.bg2 = {
	vital: ["storage"],
	pm: {
		name: "",
		storage: "",
		method: "crossfade",
		wait: "true",
		time: 3E3,
		width: "",
		height: "",
		left: "",
		top: "",
		cross: "false"
	},
	start: function (pm) {
		this.kag.ftag.hideNextImg();
		var that = this;
		if (pm.time == 0) pm.wait = "false";
		var storage_url = "./data/bgimage/" + pm.storage;
		if ($.isHTTP(pm.storage)) storage_url = pm.storage;
		this.kag.preload(storage_url, function () {
			var j_old_bg = that.kag.layer.getLayer("base", "fore");
			var j_new_bg = j_old_bg.clone(false);
			var j_bg_img = $("<img />");
			j_bg_img.css("positioin",
				"absolute");
			var scWidth = parseInt(that.kag.config.scWidth);
			var scHeight = parseInt(that.kag.config.scHeight);
			var left = 0;
			var top = 0;
			if (pm.width != "") scWidth = parseInt(pm.width);
			if (pm.height != "") scHeight = parseInt(pm.height);
			if (pm.left != "") left = parseInt(pm.left);
			if (pm.top != "") top = parseInt(pm.top);
			j_bg_img.css({
				width: scWidth,
				height: scHeight,
				left: left,
				top: top
			});
			j_bg_img.attr("src", storage_url);
			$.setName(j_new_bg, pm.name);
			j_new_bg.find("img").remove();
			j_new_bg.append(j_bg_img);
			j_new_bg.css("display", "none");
			j_old_bg.after(j_new_bg);
			that.kag.ftag.hideNextImg();
			that.kag.layer.updateLayer("base", "fore", j_new_bg);
			if (pm.wait == "true") that.kag.layer.hideEventLayer();
			pm.time = that.kag.cutTimeWithSkip(pm.time);
			if (pm.cross == "true") $.trans(pm.method, j_old_bg, parseInt(pm.time), "hide", function () {
				j_old_bg.remove()
			});
			$.trans(pm.method, j_new_bg, parseInt(pm.time), "show", function () {
				j_new_bg.css("opacity", 1);
				if (pm.cross == "false") j_old_bg.remove();
				if (pm.wait == "true") {
					that.kag.layer.showEventLayer();
					that.kag.ftag.nextOrder()
				}
			})
		});
		if (pm.wait == "false") this.kag.ftag.nextOrder()
	}
};
tyrano.plugin.kag.tag.layermode = {
	vital: [],
	pm: {
		name: "",
		graphic: "",
		color: "",
		mode: "multiply",
		folder: "",
		opacity: "",
		time: "500",
		wait: "true"
	},
	start: function (pm) {
		this.kag.ftag.hideNextImg();
		var that = this;
		var blend_layer = null;
		blend_layer = $("<div class='layer_blend_mode blendlayer' style='display:none;position:absolute;width:100%;height:100%;z-index:99'></div>");
		if (pm.name != "") blend_layer.addClass("layer_blend_" + pm.name);
		if (pm.color != "") blend_layer.css("background-color", $.convertColor(pm.color));
		if (pm.opacity !=
			"") blend_layer.css("opacity", $.convertOpacity(pm.opacity));
		if (pm.folder != "") folder = pm.folder;
		else folder = "image";
		var storage_url = "";
		if (pm.graphic != "") {
			storage_url = "./data/" + folder + "/" + pm.graphic;
			blend_layer.css("background-image", "url(" + storage_url + ")")
		}
		blend_layer.css("mix-blend-mode", pm.mode);
		$("#tyrano_base").append(blend_layer);
		if (pm.graphic != "") this.kag.preload(storage_url, function () {
			blend_layer.fadeIn(parseInt(pm.time), function () {
				if (pm.wait == "true") that.kag.ftag.nextOrder()
			})
		});
		else blend_layer.fadeIn(parseInt(pm.time),
			function () {
				if (pm.wait == "true") that.kag.ftag.nextOrder()
			});
		if (pm.wait == "false") this.kag.ftag.nextOrder()
	}
};
tyrano.plugin.kag.tag.layermode_movie = {
	vital: ["video"],
	pm: {
		name: "",
		mode: "multiply",
		opacity: "",
		time: "500",
		wait: "false",
		video: "",
		volume: "",
		loop: "true",
		speed: "",
		stop: "false"
	},
	start: function (pm) {
		this.kag.ftag.hideNextImg();
		var that = this;
		var blend_layer = null;
		blend_layer = $("<video class='layer_blend_mode blendlayer blendvideo' data-video-name='" + pm.name + "' data-video-pm='' style='display:none;position:absolute;width:100%;height:100%;z-index:99' ></video>");
		var video = blend_layer.get(0);
		var url = "./data/video/" +
			pm.video;
		video.src = url;
		if (pm.volume != "") video.volume = parseFloat(parseInt(pm.volume) / 100);
		else video.volume = 0;
		if (pm.speed != "") video.defaultPlaybackRate = parseFloat(pm.speed);
		video.style.backgroundColor = "black";
		video.style.position = "absolute";
		video.style.top = "0px";
		video.style.left = "0px";
		video.style.width = "auto";
		video.style.height = "auto";
		video.style.minHeight = "100%";
		video.style.minWidth = "100%";
		video.style.backgroundSize = "cover";
		video.autoplay = true;
		video.autobuffer = true;
		video.setAttribute("playsinline",
			"1");
		if (pm.loop == "true") video.loop = true;
		else video.loop = false;
		video.addEventListener("ended", function (e) {
			if (pm.wait == "true") that.kag.ftag.nextOrder()
		});
		var j_video = $(video);
		j_video.attr("data-video-pm", JSON.stringify(pm));
		j_video.hide();
		video.load();
		video.play();
		blend_layer = j_video;
		if (pm.name != "") blend_layer.addClass("layer_blend_" + pm.name);
		if (pm.opacity != "") blend_layer.css("opacity", $.convertOpacity(pm.opacity));
		blend_layer.css("mix-blend-mode", pm.mode);
		$("#tyrano_base").append(blend_layer);
		blend_layer.fadeIn(parseInt(pm.time),
			function () {
				if (pm.wait == "true" && pm.loop == "true")
					if (pm.stop != "true") that.kag.ftag.nextOrder()
			});
		if (pm.wait == "false")
			if (pm.stop != "true") this.kag.ftag.nextOrder()
	}
};
tyrano.plugin.kag.tag.free_layermode = {
	vital: [],
	pm: {
		name: "",
		time: "500",
		wait: "true"
	},
	start: function (pm) {
		this.kag.ftag.hideNextImg();
		var that = this;
		var blend_layer = {};
		if (pm.name != "") blend_layer = $(".layer_blend_" + pm.name);
		else blend_layer = $(".blendlayer");
		var cnt = blend_layer.length;
		var n = 0;
		if (cnt == 0) {
			that.kag.ftag.nextOrder();
			return
		}
		blend_layer.each(function () {
			var blend_obj = $(this);
			blend_obj.fadeOut(parseInt(pm.time), function () {
				blend_obj.remove();
				n++;
				if (pm.wait == "true")
					if (cnt == n) that.kag.ftag.nextOrder()
			})
		});
		if (pm.wait == "false") this.kag.ftag.nextOrder()
	}
};