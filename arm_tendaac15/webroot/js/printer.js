var G = {};
$(function () {
	getValue();
	$("#printerEn").on("click", changePrinterEn);
	$("#submit").on("click", function () {
		G.validate.checkAll();
	});
	checkData();
	top.loginOut();
	top.initIframeHeight();
	top.$(".main-dailog").removeClass("none");
	top.$(".save-msg").addClass("none");
});

function changePrinterEn() {
	var className = $("#printerEn").attr("class");
	if (className == "btn-off") {
		$("#printerEn").attr("class", "btn-on");
		$("#printerEn").val(1);
	} else {
		$("#printerEn").attr("class", "btn-off");
		$("#printerEn").val(0);
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
	$.GetSetData.getJson("goform/GetPrinterCfg?" + Math.random(), initValue);
}

function initValue(obj) {

	if (obj.printerEn == "1") {
		$("#printerEn").attr("class", "btn-on");
		$("#printerEn").val(1);
	} else {
		$("#printerEn").attr("class", "btn-off");
		$("#printerEn").val(0);
	}

	if (typeof obj.connectPrinter != "undefined" && obj.connectPrinter == "1") {
		$("#printer_notice").removeClass("none");
	} else {
		$("#printer_notice").addClass("none");
	}

	top.initIframeHeight();
}
 
function preSubmit() {
	var data = "printerEn=" + $("#printerEn").val();
	$.post("goform/SetPrinterCfg", data, callback);
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