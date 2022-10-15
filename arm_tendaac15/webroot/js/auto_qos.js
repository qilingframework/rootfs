var G = {};
$(function () {
	$("#submit").on("click", function () {
		G.validate.checkAll();
	});
	$("#autoQosEnable").on("click", changeQoSEn);

	//$("#test_qos").on("click", beginTest);

	getValue();
	top.loginOut();

	checkData();

	top.$(".main-dailog").removeClass("none");
	top.$(".save-msg").addClass("none");
});



function testSpeedFailed(str) {


	top.$("#iframe-msg").html(str);
	setTimeout(function () {
		top.$("#iframe-msg").html("");
	}, 3000);

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

function changeTimeType() {

	top.initIframeHeight();
}

function beginTest(data) {
	//先进性云管理检测，是否开启
	var num = $.parseJSON(data).errCode;

	if (num == 0) {
		top.showSaveMsg(num, "设置保存成功", 4);
	}
}



function changeQoSEn() {
	var className = $("#autoQosEnable").attr("class");
	if (className == "btn-off") {
		$("#autoQosEnable").attr("class", "btn-on");
		$("#autoQosEnable").val(1);
		$("#rate_set").removeClass("none");
		$(".help-block").css("display", "none");
	} else {
		$("#autoQosEnable").attr("class", "btn-off");
		$("#autoQosEnable").val(0);
		$("#rate_set").addClass("none");
		$(".help-block").css("display", "block");
	}
	top.initIframeHeight();
}

function getValue() {
	$.getJSON("goform/initAutoQos?" + Math.random(), initValue);
}

function initValue(obj) {
	top.$(".main-dailog").removeClass("none");
	top.$("iframe").removeClass("none");
	top.$(".loadding-page").addClass("none");

	if (obj.enable == 0) {
		$("#autoQosEnable").attr("class", "btn-off");
		$("#autoQosEnable").val(0);
		$("#rate_set").addClass("none");
		$(".help-block").css("display", "block");
	} else {
		$("#autoQosEnable").attr("class", "btn-on");
		$("#autoQosEnable").val(1);
		$("#rate_set").removeClass("none");
		$(".help-block").css("display", "none");
	}

	//if(obj.upSpeed == 0 || obj.downSpeed == 0) {
	if (obj.speedtest_ret == "3") {
		$("#need_test").addClass("none");
	} else {

		$("#need_test").removeClass("none");

	}



	//$("#wan_up").val(obj.up);
	//$("#wan_down").val(obj.down);
	$("#mode_" + obj.mode).prop("checked", true);
	top.initIframeHeight();
}

function preSubmit() {
	var subObj = {},

		subStr = "";

	//如果不需要测速就直接保存，否则先进行测速，然后再进行保存配置
	subObj = {
		"enable": $("#autoQosEnable").val(),
		//"up":up,
		///"down":down
		"mode": 0
			//"mode": $("input[name=mode]:checked").attr("id").split("_")[1], 仅有一个模式
	}
	subStr = objTostring(subObj);



	if ($("#autoQosEnable").val() == 1 && !$("#need_test").hasClass("none")) {
		//开启才能测速
		$.post("goform/saveAutoQos", subStr, beginTest);

	} else {
		$.post("goform/saveAutoQos", subStr, callback);
	}
}

function callback(str) {
	if (!top.isTimeout(str)) {
		return;
	}
	var num = $.parseJSON(str).errCode;
	top.showSaveMsg(num, "设置保存成功");
	if (num == 0) {
		top.advInfo.initValue();
	}
}