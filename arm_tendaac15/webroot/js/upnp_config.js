var G = {};
$(function () {
	$("#upnpEn").on("click", changeUpnpEn);
	top.loginOut();

	getValue();
	top.initIframeHeight();
});

function changeUpnpEn() {
	var className = $("#upnpEn").attr("class");
	if (className == "btn-off") {
		$("#upnpEn").attr("class", "btn-on");
		$("#upnpEn").val(1);
		$("#upnpList").removeClass("none");
	} else {
		$("#upnpEn").attr("class", "btn-off");
		$("#upnpEn").val(0);
		$("#upnpList").addClass("none");
	}
	preSubmit();
	top.initIframeHeight();
}

function getValue() {
	$.getJSON("goform/GetUpnpCfg?" + Math.random(), initValue);
}

function initValue(obj) {
	if (obj[0].upnpEn == "1") {
		$("#upnpEn").attr("class", "btn-on");
		$("#upnpEn").val(1);
		$("#upnpList").removeClass("none");
	} else {
		$("#upnpEn").attr("class", "btn-off");
		$("#upnpEn").val(0);
		$("#upnpList").addClass("none");
	}
	var str = "",
		len = obj.length,
		i = 1;
	for (i = 1; i < len; i++) {
		str += "<tr>";
		str += "<td>" + obj[i].remoteHost + "</td>";
		str += "<td>" + obj[i].outPort + "</td>";
		str += "<td>" + obj[i].host + "</td>";
		str += "<td>" + obj[i].inPort + "</td>";
		str += "<td>" + obj[i].protocol + "</td>";
		str += "</tr>";
	}

	$("#upnpBody").html(str);
	top.$(".main-dailog").removeClass("none");
	top.$(".save-msg").addClass("none");
	top.initIframeHeight();
}

function preSubmit() {
	var data = "upnpEn=" + $("#upnpEn").val();
	$.post("goform/SetUpnpCfg", data, callback);
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