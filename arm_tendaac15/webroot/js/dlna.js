var G = {},
	initObj = null;

$(function () {
	getValue();
	$("#dlnaEn").on("click", changeDLNAEn);
	$("#submit").on("click", function () {
		G.validate.checkAll();
	});
	checkData();
	top.loginOut();
	top.$(".main-dailog").removeClass("none");
	top.$(".save-msg").addClass("none");
	top.initIframeHeight();
});

function changeDLNAEn() {
	var className = $("#dlnaEn").attr("class");
	if (className == "btn-off") {
		$("#dlnaEn").attr("class", "btn-on");
		$("#dlnaEn").val(1);
		$("#dlna_set").removeClass("none");
	} else {
		$("#dlnaEn").attr("class", "btn-off");
		$("#dlnaEn").val(0);
		$("#dlna_set").addClass("none");
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
	$.GetSetData.getJson("goform/GetDlnaCfg?" + Math.random(), initValue);
}

function initValue(obj) {
	initObj = obj;
	if (obj.dlnaEn == "1") {
		$("#dlnaEn").attr("class", "btn-on");
		$("#dlnaEn").val(1);
		$("#dlna_set").removeClass("none");
	} else {
		$("#dlnaEn").attr("class", "btn-off");
		$("#dlnaEn").val(0);
		$("#dlna_set").addClass("none");
	}
	$("#deviceName").val(obj.deviceName);

	top.initIframeHeight();
}

function preSubmit() {
	var data,
		deviceName = ($("#dlnaEn").val() == 1?$("#deviceName").val():initObj.deviceName);
		
	data = "dlnaEn=" + $("#dlnaEn").val() + "&deviceName=" + deviceName;
	$.post("goform/SetDlnaCfg", data, callback);
}

function callback(str) {
	if (!top.isTimeout(str)) {
		return;
	}
	var num = $.parseJSON(str).errCode;
	top.showSaveMsg(num);
	if (num == 0) {
		//getValue();
		top.usbInfo.initValue();
	}
}