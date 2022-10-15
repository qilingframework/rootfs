var G = {},
	initObj = null;
	ipAllAllow = false;

$(function () {
	getValue();
	$("#remoteWebEn").on("click", changeDmzEn);
	$("#submit").on("click", function () {
		G.validate.checkAll();
	});

	$.validate.valid.remoteIp = function(str) {
		if (str == "0.0.0.0") return;
		return $.validate.valid.ip.all(str);
	}
	$("#remotePort").inputCorrect("num");
	$("#remoteIp").inputCorrect("ip");
	checkData();
	top.loginOut();
	top.$(".main-dailog").removeClass("none");
	top.$(".save-msg").addClass("none");
	top.initIframeHeight();
});

function changeDmzEn() {
	var className = $("#remoteWebEn").attr("class");
	if (className == "btn-off") {
		$("#remoteWebEn").attr("class", "btn-on");
		$("#remoteWebEn").val(1);
		$("#remote_set").removeClass("none");
	} else {
		$("#remoteWebEn").attr("class", "btn-off");
		$("#remoteWebEn").val(0);
		$("#remote_set").addClass("none");
	}
	top.initIframeHeight();
}

function checkData() {
	G.validate = $.validate({
		custom: function () {},

		success: function () {
			preSubmit();
		},

		error: function (msg) {
			return;
		}
	});
}

function getValue() {
	$.getJSON("goform/GetRemoteWebCfg?" + Math.random(), initValue);
}

function initValue(obj) {
	initObj = obj;
	if (obj.remoteWebEn == "1") {
		$("#remoteWebEn").attr("class", "btn-on");
		$("#remoteWebEn").val(1);
		$("#remote_set").removeClass("none");
	} else {
		$("#remoteWebEn").attr("class", "btn-off");
		$("#remoteWebEn").val(0);
		$("#remote_set").addClass("none");
	}

	$("#remoteIp").val(obj.remoteIp);
	$("#remotePort").val(obj.remotePort);
	top.initIframeHeight();
}

function preSubmit() {
	var data = "",
		subObj = null;

	if ($("#remoteWebEn").val() == 1) {
		subObj = {
			"remoteWebEn": $("#remoteWebEn").val(),
			"remoteIp": $("#remoteIp").val(),
			"remotePort": parseInt($("#remotePort").val(), 10)
		};		
	} else {
		subObj = {
			"remoteWebEn": $("#remoteWebEn").val(),
			"remoteIp": initObj.remoteIp,
			"remotePort": initObj.remotePort
		};	
	}


	if (checkIpInSameSegment(initObj.lanIp, "255.255.255.0", subObj.remoteIp, "255.255.255.0")) {
		showErrMsg("msg-err", _("%s and %s (%s) should not be in the same network segment.", [_("Remote Web IP"),_("LAN IP"),initObj.lanIp]));
		return false;
	}

	// 决策： 访客网络网段冲突有后台处理
	/*if (initObj.wlGuestIp && checkIpInSameSegment(initObj.wlGuestIp, "255.255.255.0", subObj.remoteIp, "255.255.255.0")) {
		showErrMsg("msg-err", _("%s and %s (%s) should not be in the same network segment.", [_("Remote Web IP"),_("Guest Network IP"),initObj.wlGuestIp]));
		return false;
	}*/

	data = objTostring(subObj);
	$.post("goform/SetRemoteWebCfg", data, callback);
}

function callback(str) {
	if (!top.isTimeout(str)) {
		return;
	}
	var num = $.parseJSON(str).errCode;

	top.showSaveMsg(num);
	if (num == 0) {
		//getValue();
		top.advInfo.initValue();
	}
}