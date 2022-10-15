$(function () {
	$("#submit").on("click", preSubmit);
	getValue();
	top.loginOut();

	top.$(".main-dailog").removeClass("none");
	top.$(".save-msg").addClass("none");
});

function getValue() {
	$.getJSON("goform/WifiPowerGet?" + Math.random(), initValue);
}

function initValue(obj) {
	top.$(".main-dailog").removeClass("none");
	top.$("iframe").removeClass("none");
	top.$(".loadding-page").addClass("none");

	$("#power").val(obj.power);
	$("#power_5g").val(obj.power_5g);
}

function preSubmit() {
	var subStr = "power=" + $("#power").val() + "&power_5g=" + $("#power_5g").val();
	$.post("goform/WifiPowerSet", subStr, callback);
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