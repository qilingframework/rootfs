var G = {};
var initObj = null;
$(function () {
	getValue();
	$("#submit").on("click", function () {
		G.validate.checkAll();
	});
	checkData();
	top.loginOut();
	top.$(".main-dailog").removeClass("none");
	top.$(".save-msg").addClass("none");
});

function checkData() {
	G.validate = $.validate({
		custom: function () {

			/*if ($("#ntpServer").val() == "") {
				$("#ntpServer").focus();
				return _("Please enter a legal NTP server address.");
			}
			if (!(/^[ -~]+$/g).test($("#ntpServer").val())) {
				$("#ntpServer").focus();
				return _("Please enter a legal NTP server address.");
			}*/
		},
		success: function () {
			preSubmit();
		},

		error: function (msg) {
			if (msg) {
				$("#msg-err").html(msg);
			}
			return;
		}
	});
}

function getValue() {
	$.GetSetData.getJson("goform/GetSysTimeCfg?" + Math.random(), initValue);
}

function initValue(obj) {
	initObj = obj;
	//$("[name='timeType'][value='" + obj.timeType + "']")[0].checked = true;
	$("#timeZone").val(obj.timeZone);
	/*$("#ntpServer").val(obj.ntpServer);
	$("#timePeriod").val(obj.timePeriod);*/
	top.initIframeHeight();
}

function preSubmit() {
	var data,
		subObj = {};
	subObj = {
		//"timeType": $("[name='timeType']:checked").val(),
		//"timePeriod": $("#timePeriod").val(initObj.timePeriod),
		//"ntpServer": $("#ntpServer").val(initObj.ntpServer),
		"timePeriod": initObj.timePeriod,
		"ntpServer": initObj.ntpServer,
		"timeZone": $("#timeZone").val()
			//"time": $("#time").val()
	};
	data = objTostring(subObj);
	$.post("goform/SetSysTimeCfg", data, callback);
}

function callback(str) {
	if (!top.isTimeout(str)) {
		return;
	}
	var num = $.parseJSON(str).errCode;

	top.showSaveMsg(num);
	if (num == 0) {
		top.advInfo.initValue();
	}
}