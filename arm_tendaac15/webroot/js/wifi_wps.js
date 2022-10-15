$(function () {
	initEvent();
	getValue();
	top.loginOut();

	top.$(".main-dailog").removeClass("none");
	top.$(".save-msg").addClass("none");
});

var initScanObj = {},
	initObj = {};

function initEvent() {
	$("#wpsSubmit").on("click", function() {
		if (!this.disabled)
		$.post("goform/WifiWpsStart", "action=wps", callback);
	});
	$("#wpsEn").on("click", function() {
		if (initObj.wl_mode != "ap" || initObj.wl_en == "0") {
			return;
		}		
		changeWpsEn();
		preSubmit();
	});
}

function changeWpsEn() {
	if ($("#wpsEn")[0].className == "btn-off") {
		$("#wpsEn").attr("class", "btn-on");
		$("#wpsEn").val(1);
	} else {
		$("#wpsEn").attr("class", "btn-off");
		$("#wpsEn").val(0);
	}
	top.initIframeHeight();
}

function getValue() {
	$.getJSON("goform/WifiWpsGet?" + Math.random(), initValue);
}

function initValue(obj) {
	initObj = obj;
	$("#pinCode").html(obj.pinCode);
	$("#waitingTip").html(" ").addClass("none");
	if (obj.wl_mode != "ap" || obj.wl_en == "0") {
		if (obj.wl_mode != "ap")
		showErrMsg("msg-err", _("The Wireless Reapter is enabled. Please go to Wireless settings to disable Wireless Reapter first."), true);
		if (obj.wl_en == "0")
		showErrMsg("msg-err", _("The Wireless feature is disabled. Please enable wireless feature first."), true);
		$("#wpsSubmit")[0].disabled = true;
		//$("#submit")[0].disabled = true;
	}
	$("#wpsEn").attr("class", (obj.wpsEn == "1" ? "btn-off": "btn-on"));
	changeWpsEn();
	if (obj.wpsEn == "1") {
		$("#wpsMethod").removeClass("none");
	} else {
		$("#wpsMethod").addClass("none");
	}
	top.initIframeHeight();
}

function preSubmit() {
	$("#wpsMethod").addClass("none");
	$.post("goform/WifiWpsSet", "wpsEn=" + $("#wpsEn").val(), callback);
	if ($("#wpsEn").val() == "1") {
		$("#waitingTip").html(_("Enabling WPS...")).removeClass("none");
	} else {
		$("#waitingTip").html(_("Disabling WPS...")).removeClass("none");
	}
}

function callback(str) {
	if (!top.isTimeout(str)) {
		return;
	}
	var num = $.parseJSON(str).errCode;
	//top.showSaveMsg(num);
	if (num == 0) {
		top.wrlInfo.initValue();
		setTimeout(function() {
			getValue();
			$("#waitingTip").html(" ").addClass("none");			
		}, 2000);
	}
}