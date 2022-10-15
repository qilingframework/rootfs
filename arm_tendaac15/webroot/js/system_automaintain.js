var G = {};
$(function () {
	getValue();
	$("#autoRebootEn").on("click", changeRebootEn);
	$("#submit").on("click", function () {
		G.validate.checkAll();
	});
	checkData();
	top.loginOut();
	top.$(".main-dailog").removeClass("none");
	top.$(".save-msg").addClass("none");
});

function changeRebootEn() {
	var className = $("#autoRebootEn").attr("class");
	if (className == "btn-off") {
		$("#autoRebootEn").attr("class", "btn-on");
		$("#autoRebootEn").val(1);
	} else {
		$("#autoRebootEn").attr("class", "btn-off");
		$("#autoRebootEn").val(0);
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
	$.GetSetData.getJson("goform/GetSysAutoRebbotCfg?" + Math.random(), initValue);
}

function initValue(obj) {
	(obj.timeUp == "1"?$("#timeUpTip").addClass("none"):$("#timeUpTip").removeClass("none"));
	if (obj.autoRebootEn == "1") {
		$("#autoRebootEn").attr("class", "btn-on");
		$("#autoRebootEn").val(1);
	} else {
		$("#autoRebootEn").attr("class", "btn-off");
		$("#autoRebootEn").val(0);
	}
	$("#autoTip").html(_("If Auto reboot enabled, the router will auto-reboot to maintain itself during %s each day, once traffic drops below %sKB/s.", ["03:00~05:00", obj.speed]));
	top.initIframeHeight();
}

function preSubmit() {
	var data = "autoRebootEn=" + $("#autoRebootEn").val();
	$.post("goform/SetSysAutoRebbotCfg", data, callback)
}

function callback(str) {
	if (!top.isTimeout(str)) {
		return;
	}
	var num = $.parseJSON(str).errCode;
	top.showSaveMsg(num);
	if (num == 0) {
		top.sysInfo.initValue();
	}

}