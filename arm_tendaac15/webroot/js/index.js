var G = {};

$(function () {
	getInitData();
	initEvent();
	$("#changePwdEn")[0].checked = false;
	clickLoginPwd();
	$('#username').addPlaceholder(_("ISP Username"));
	//$('#password').addPlaceholder("宽带密码");
	$('#password').initPassword(_('ISP Password'), false, false);
	$('#wrlPassword').initPassword(_("WiFi password(8~32 characters)"), false, false);
	$('#loginPwd').initPassword(_("Login password(5~32 characters)"), false, false);
	var langTxt = {
		"cn": "中文",
		"en": "English",
		"zh": "繁體中文"
	};
	$("#langToggle span").html(langTxt[B.getLang()]);
});

function getInitData() {
	/*G.data = {
		"net": "1",   //是否检测网络
		"line": "0",  //是否连接网线
		"wanType":"2"  //2 pppop 0 dhcp
	};*/
	G.checkNet = false;
	G.checkLine = false;
	G.accessType = 1; //1有线，2无线
	//获取数据，产品名称，根据产品名称显示图片
	$.GetSetData.getJson("goform/getProduct" + "?" + Math.random(), function (obj) {
		/*if (obj.product) {
			$("#product_name").attr("src", "./img/" + obj.product.toLowerCase() + ".png");
		} else {
			$("#product_name").attr("src", "./img/" + "fh1203" + ".png");
		}*/

		G.accessType = obj.accessType;
	});
}

function clickLoginPwd() {
	if ($("#changePwdEn")[0].checked) {
		$("#loginPwd").parent().parent().css("display", "none");
	} else {
		$("#loginPwd").parent().parent().css("display", "");
	}
}

function initEvent() {
	$("#start-btn").on("click", startSet);
	$("#step-next").on("click", nextSet);
	$("#more_set").on("click", moreSet);
	$("#step-over").on("click", overStep);
	$(".mastbody .input-text").on("focus", addFocus);
	$(".mastbody .input-text").on("blur", delFocus);
	$("#back, .iframe-close").on("click", backSetWifi);
	$("#continue").on("click", continueSet);

	$("#changePwdEn").on("click", clickLoginPwd);

	$(document).on("keydown", function (event) {
		if (event.keyCode == 13) {
			//startSet, nextSet, moreSet, overStep,continueSetcontinue==
			/*if(!$("#step1").hasClass("none")) {
				//进行开始设置
				startSet();
			} else if(!$("#step2").hasClass("none")){
				if(!$("#confirmNext").hasClass("none")) {
					backSetWifi();
				} else {
					nextSet();
				}
			}*/

			if (!$("#first_begin").hasClass("none")) {
				//进行开始设置
				startSet();
			} else {
				if (!$("#confirmNext").hasClass("none")) {
					backSetWifi();
				} else {
					nextSet();
				}
			}
		}
	});

	//$("#url_link").on("click",function() {
	//	window.open("http://wifi.yunos.com/aliwifi/down.htm","_blank");
	//});


	//语言选择
	$("#langToggle").on("click", function () {
		if ($("#langMenu").hasClass("none")) {
			$("#langMenu").removeClass("none")
		} else {
			$("#langMenu").addClass("none")
		}
	});
	$("#langMenu a").on("click", function () {
		$("#langToggle span").html($(this).html());
		$("#langMenu").addClass("none")
		B.setLang($(this).attr("data-country"));
		setTimeout("location.reload()", 300);
	})
	$(document).on("click", function (e) {
		if ($(e.target).parents("#lang").length == 0)
			$("#langMenu").addClass("none")
	});
}

function showMsg(className, str) {
	$("." + className).html(str);
	/*setTimeout(function() {
		$("."+className).html("&nbsp;");
	},2000)*/
}

function delFocus() {
	$(this).parent().parent().removeClass("text-focus");
}

function addFocus() {
	$(this).parent().parent().addClass("text-focus");
}

function initValue(obj) {
	G.data = obj;
	$("#ssid").val(G.data.ssid);
	$("#wrlPassword, #wrlPassword_").val(G.data.wrlPassword);
	$("#power").val(G.data.power);
	$("#country").val(G.data.country);
	if (G.data.power == "high") { //高功率
		$("#power_setting").css("display", "none");
	} else { //低功率
		$("#power_setting").css("display", "");
	}
	$('#ssid').addPlaceholder(_("WiFi Name"));
	if (G.data.line == 1) { //检测是否插网线
		//G.data.net = 0;
		$("#net_setting").addClass("none");
		if (G.data.net == 1) { //是否检测完
			if ($("#step-over").hasClass("none")) {
				//表示已经通过了这个检测，就不需要再进行了
				return;
			}
			G.checkNet = true;
			$("#net_find").addClass("none");

			if (G.data.wanType == "0") {
				$("#dhcp_setting").removeClass("none");
				$("#step-over").addClass("none");
			} else if (G.data.wanType == "2") {
				$("#ppoe_setting").removeClass("none");
				//$("#username")[0].focus();	
			} else if (G.data.wanType == "-2") {
				$("#static_setting").removeClass("none");
				$("#step-over").addClass("none");
			} else {
				$("#wifi_setting").removeClass("none");
				$("#wrlPassword").focus();
				$("#step-over").addClass("none");
			}
			$("#step-next").val(_("Next"));

		} else {

			$("#net_find").removeClass("none");
			setTimeout(function () {
				$.GetSetData.getJson("goform/fast_setting_get" + "?" + Math.random(), initValue);
			}, 5000);
		}
	} else {
		$("#net_find").addClass("none");
		if ($("#step-over").hasClass("none")) {
			//表示已经手动跳过wan口检测了

		} else {
			$("#net_setting").removeClass("none");

			G.time = setTimeout(function () {
				$.GetSetData.getJson("goform/fast_setting_get" + "?" + Math.random(), initValue);
			}, 2000);
		}
	}
	if (!$("#net_find").hasClass("none")) {
		$("#btn_control").addClass("none");
	} else {
		$("#btn_control").removeClass("none");
	}
}

function startSet() {
	$("body").removeClass("index-body");
	//$("#step1").addClass("none");
	$("#first_begin").addClass("none");
	//$("#step2").removeClass("none");
	$("#net_find").removeClass("none");
	//隐藏语言选择框
	$("#lang").addClass("none");
	/*$.ajaxSetup({
		error:function(x,e){
			setTimeout(function() {
				top.location.reload(true)}
			,4000);
			return false;
		}
	});*/

	$.GetSetData.getJson("goform/fast_setting_get?" + Math.random(), initValue);

}

function getTimeZone() {
	var a = [],
		b = new Date().getTime(),
		zone = new Date().getTimezoneOffset() / -60,
		timeZoneStr;

	/*if (a = displayDstSwitchDates()) {
		if (a[0] < a[1]) {
			if (b > a[0] && b < a[1]) {
				zone--;
			}
		} else {
			if (b > a[0] || b < a[1]) {
				zone--;
			}
		}
	}*/

	if (zone > 0) {
		zone = ((zone * 100) + 0); //变成600
		if (zone < 1000) {
			zone = "+0" + zone;
		} else {
			zone = "+" + zone;
		}

	} else if (zone < 0) {
		zone = zone * (-100); //变成650
		if (zone < 1000) {
			zone = "-0" + zone;
		} else {
			zone = "-" + zone;
		}
	} else {
		zone = "+0000";
	}

	timeZoneStr = zone.slice(0, zone.length - 2) + ":" + zone.slice(-2);

	return timeZoneStr;
}

function nextSet() {
	var data;
	if (!$("#net_find").hasClass("none")) {
		setTimeout(function () {
			$.GetSetData.getJson("goform/fast_setting_get" + "?" + Math.random(), initValue);
		}, 5000);
	} else if (!$("#net_setting").hasClass("none")) {
		$.GetSetData.getJson("goform/fast_setting_get" + "?" + Math.random(), function (obj) {
			G.data = obj;
			if (G.data.line == 1) {
				if (G.data.wanType == 0) {
					$("#dhcp_setting").removeClass("none");
					$("#net_setting").addClass("none");
					$("#step-next").val(_("Next"));
					$("#step-over").addClass("none");
				} else if (G.data.wanType == -1) {
					$("#net_setting").addClass("none");
					$("#net_find").removeClass("none");
					$("#btn_control").addClass("none");
					nextSet();
				} else if (G.data.wanType == -2) {
					$("#static_setting").removeClass("none");
					$("#net_setting").addClass("none");
					$("#step-next").val(_("Next"));
					$("#step-over").addClass("none");
				} else if (G.data.wanType == 2) {
					$("#ppoe_setting").removeClass("none");
					//$("#username")[0].focus();	
					$("#net_setting").addClass("none");
					$("#step-next").val(_("Next"));
				} else {
					$("#net_setting").addClass("none");
					$("#net_find").removeClass("none");
				}
			} else {
				showMsg("main-text", _("Please insert an Ethernet cable to go forward."));
				//继续按钮
				$(".main-text").css("color", "red");
				//moveL();
				//setTimeout(moveR, 50);
				//setTimeout(moveL, 100);
				//setTimeout(moveR, 150);
				//setTimeout(moveR, 150);
			}
		});

	} else if (!$("#dhcp_setting").hasClass("none")) {
		$("#dhcp_setting").addClass("none")
		$("#wifi_setting").removeClass("none");
		$("#wrlPassword").focus();
	} else if (!$("#static_setting").hasClass("none")) {
		$("#static_setting").addClass("none")
		$("#wifi_setting").removeClass("none");
		$("#wrlPassword").focus();
	} else if (!$("#ppoe_setting").hasClass("none")) {
		var user = $("#username").val(),
			pwd = $("#password").val(),
			data = "",
			//rel = /[\\"']/g;
			rel = /[^\x00-\x80]|[\\~;'&"%\s]/;
		if (user == "" || pwd == "") {
			showErrMsg("message-error", _("Please specify your ISP username and password."));
			return;
		}
		if (rel.test(user) || rel.test(pwd)) {
			showErrMsg("message-error", _("Username/password cannot contain blank space , \\ ~ ; ' & \" %, ect."));
			return;
		}
		data = "username=" + encodeURIComponent(user) + "&password=" + encodeURIComponent(pwd);

		$("#step-next").blur();

		$.post("goform/fast_setting_pppoe_set", data, handPpoe);
	} else if (!$("#wifi_setting").hasClass("none")) {
		var ssid = $("#ssid").val(),
			wrlPwd = $("#wrlPassword").val(),
			loginPwd = $("#loginPwd").val();
		rel = /[!@#$%^]/g;
		rel_str = /[^\x00-\x80]/;
		if (ssid == "") {
			showErrMsg("message-ssid", _("Please specify a WiFi Name. "));
			return;
		}

		if (ssid.charAt(0) == " " || ssid.charAt(ssid.length - 1) == " ") {
			showErrMsg("message-ssid", _("The first and last character of the WiFi Name cannot be blank space."));
			return;
		}

		if (getStrByteNum(ssid) > 29) {
			showErrMsg("message-ssid", _("Up to %s characters are allowed", [29]));
			return;
		}

		if (wrlPwd != "") {

			if (!/^[\x00-\x80]{8,32}$/.test(wrlPwd)) {
				showErrMsg("message-ssid", _("WiFi password must be made of 8~32 characters."));
				return;
			}

			if (wrlPwd.charAt(0) == " " || wrlPwd.charAt(wrlPwd.length - 1) == " ") {
				showErrMsg("message-ssid", _("The first and last character of the WiFi Password cannot be blank space."));
				return;
			}

			var login_pwd;
			if (!$("#changePwdEn")[0].checked) {
				if (!/^[\x00-\x80]{5,32}$/.test(loginPwd)) {
					showErrMsg("message-ssid", _("Login password must be made of 5~32 characters."));
					return;
				}
				if (loginPwd.charAt(0) == " " || loginPwd.charAt(loginPwd.length - 1) == " ") {
					showErrMsg("message-ssid", _("The first and last character of the login password cannot be blank space."));
					return;
				}
				login_pwd = $("#loginPwd").val();
			} else {
				login_pwd = wrlPwd;
			}

			//TODO:hack wan connected
			//$("#waiting").removeClass("none");
			//$("#wifi_setting").addClass("none");
			//$("#btn_control").addClass("none");

			var dateArry = /([\+\-]\d{2})(\d{2})/.exec((new Date()).toString());

			var subObj = {
				"country": $("#country").val(),
				"ssid": $("#ssid").val(),
				"wrlPassword": wrlPwd,
				"power": $("#power").val(),
				"timeZone": getTimeZone(),
				"loginPwd": str_encode(login_pwd)
			}
			data = objTostring(subObj);
			$.GetSetData.getJson("goform/getWanConnectStatus?" + Math.random(), function (obj) {
				G.wanStatus = obj.connectStatus;
				$.post("goform/fast_setting_wifi_set", data, handWifi);
			});
		} else {

			if (!$("#changePwdEn")[0].checked) {
				if (!/^[\x00-\x80]{5,32}$/.test(loginPwd)) {
					showErrMsg("message-ssid", _("Login password must be made of 5~32 characters."));
					return;
				}
				if (loginPwd.charAt(0) == " " || loginPwd.charAt(loginPwd.length - 1) == " ") {
					showErrMsg("message-ssid", _("The first and last character of the login password cannot be blank space."));
					return;
				}

			} else {
				showErrMsg("message-ssid", _("Please specify a WiFi password before you set up the login password as the same as the WiFi password."));
				return;
			}
			$("#wifi_setting").addClass("none");
			$("#btn_control").addClass("none");
			$("input[type='text'], input[type='password']").blur();
			$("#confirmNext").removeClass("none");
		}
	}
}

function moveL() {
	$(".main-text").css("color", "red");
	$(".main-text").animate({
		"padding-left": "20px"
	}, "fast");
}

function moveR() {
	$(".main-text").animate({
		"padding-left": "0px"
	}, "fast");
}

function backSetWifi() {
	$("#confirmNext").addClass("none");
	$("#wifi_setting").removeClass("none");
	$("#btn_control").removeClass("none");
	$("#wrlPassword").focus();
	$("#wrlPassword_").focus();
}

function continueSet() {
	var data = "";
	//TODO:hack wan connected
	$("#confirmNext").addClass("none");
	//$("#waiting").removeClass("none");
	var dateArry = /([\+\-]\d{2})(\d{2})/.exec((new Date()).toString());

	var subObj = {
		"country": $("#country").val(),
		"ssid": $("#ssid").val(),
		"wrlPassword": "",
		"power": $("#power").val(),
		"timeZone": getTimeZone(),
		"loginPwd": str_encode($("#loginPwd").val())
	}
	data = objTostring(subObj);
	//data = "ssid=" + encodeURIComponent($("#ssid").val()) + "&wrlPassword=" + encodeURIComponent($("#wrlPassword").val());
	$.GetSetData.getJson("goform/getWanConnectStatus?" + Math.random(), function (obj) {
		G.wanStatus = obj.connectStatus;
		$.post("goform/fast_setting_wifi_set", data, handWifi);
	});
}

function showFinish() {
	$("#btn_control").addClass("none");
	if (G.wanStatus == "7") {
		//已联网，
		$(".loadding-ok img").attr("src", "./img/ok_connected.png")
		$("#waiting").addClass("none");
		$("#set_ok").removeClass("none");
		$("#wifi_setting").addClass("none");

		$("#ssid_2g").html($("#ssid").val());
		$("#ssid_5g").html($("#ssid").val() + "_5G");
		$("#connected").removeClass("none");
		if (G.accessType == 1) {
			$("#connected-tip, .wel-button").removeClass("none");
		} else {
			$("#connected-tip, .wel-button").addClass("none");
		}

	} else {
		//TODO: 跳转到未联网状态,即不显示恭喜您可以上网了
		//倒计时完成后需要再次获取wan口数据，如果G.wanStatus仍然不等于7，则不显示恭喜您可以上网了
		//$.GetSetData.getJson("goform/getWanConnectStatus?"+Math.random(),function(obj) {
		//G.wanStatus = obj.connectStatus;
		//G.wanStatus = "6";
		$("#waiting").addClass("none");
		$("#set_ok").removeClass("none");
		$("#wifi_setting").addClass("none");

		$("#ssid_2g").html($("#ssid").val());
		$("#ssid_5g").html($("#ssid").val() + "_5G");

		if (G.wanStatus == 7) {
			$(".loadding-ok img").attr("src", "./img/ok_connected.png")
			$("#connected").removeClass("none");

			if (G.accessType == 1) {
				$("#connected-tip, .wel-button").removeClass("none");
			} else {
				$("#connected-tip, .wel-button").addClass("none");
			}
		} else {
			$(".loadding-ok img").attr("src", "./img/ok.png")
			$("#connected, #connected-tip, .wel-button").addClass("none");
			//间隔3秒后未联网时，跳转到主页
			if (G.accessType == 1) {
				setTimeout(function () {
					window.location = window.location.href.split("/index")[0];
				}, 3000);
			}
		}
	}

}

function handWifi() {
	var index = 0;
	if (G.wanStatus == "7") {
		showFinish();
		return;
	}
	$("#waiting").removeClass("none");
	$("#wifi_setting").addClass("none");
	$("#btn_control").addClass("none");
	setTimeout(function () {
		$.GetSetData.getJson("goform/getWanConnectStatus?" + Math.random(), function (obj) {
			G.wanStatus = obj.connectStatus;
		});
	}, 5000);
	if (index == 0) {
		var pc = 9;
		var time = setInterval(function () {
			$(".loadding-number").html(pc);
			if (pc == 0) {
				showFinish();
				clearInterval(time);
			}
			pc--;
		}, 1000);
	}
}

function handPpoe(str) {
	var index = $.parseJSON(str).errCode;
	if (index == 0) {
		$("#ppoe_setting").addClass("none");
		$("#wifi_setting").removeClass("none");
		$("#wrlPassword").focus();
		$("#step-over").addClass("none");
		$(".save-msg").addClass("none");
		$("#page-message").html("");
	}
}

function moreSet() {
	window.location = window.location.href.split("/index.html")[0];
}

function overStep() {
	clearTimeout(G.time);
	$("#step-next").val(_("Next"));
	if (!$("#net_setting").hasClass("none")) {
		$("#net_setting").addClass("none");
		$("#wifi_setting").removeClass("none");
		$("#wrlPassword").focus();
		$("#step-over").addClass("none");
	} else if (!$("#ppoe_setting").hasClass("none")) {
		$("#ppoe_setting").addClass("none");
		$("#wifi_setting").removeClass("none");
		$("#wrlPassword").focus();
		$("#step-over").addClass("none");
	}
	$("#wrlPassword_").focus();
}