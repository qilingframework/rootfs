var G = {},
	initObj = null;

$(function () {
	getValue();
	$("#ddnsEn").on("click", changeDdnsEn);
	$("#submit").on("click", function () {
		G.validate.checkAll();
	});
	$("#btnLink").on("click", function () {
		var netAddress = $("#serverName").val();
		window.open("http://" + netAddress, "");
	});
	checkData();
	top.loginOut();
	top.initIframeHeight();
	top.$(".main-dailog").removeClass("none");
	top.$(".save-msg").addClass("none");
});

function changeDdnsEn() {
	var className = $("#ddnsEn").attr("class");
	if (className == "btn-off") {
		$("#ddnsEn").attr("class", "btn-on");
		$("#ddnsEn").val(1);
		$("#ddns_set").removeClass("none");
	} else {
		$("#ddnsEn").attr("class", "btn-off");
		$("#ddnsEn").val(0);
		$("#ddns_set").addClass("none");
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
	$.getJSON("goform/GetDDNSCfg?" + Math.random(), initValue);
}

function initValue(obj) {
	initObj = obj;
	if (obj.ddnsEn == "1") {
		$("#ddnsEn").attr("class", "btn-on");
		$("#ddnsEn").val(1);
		$("#ddns_set").removeClass("none");
	} else {
		$("#ddnsEn").attr("class", "btn-off");
		$("#ddnsEn").val(0);
		$("#ddns_set").addClass("none");
	}
	$("#serverName").val(obj.serverName);
	$("#ddnsUser").val(obj.ddnsUser);
	$("#ddnsPwd").val(obj.ddnsPwd);
	$("#ddnsDomain").val(obj.ddnsDomain);

	top.initIframeHeight();
}

function preSubmit() {
	var data,
		subObj = {};

	if ($("#ddnsEn").val() == 1) {
		subObj = {
			"ddnsEn": $("#ddnsEn").val(),
			"serverName": $("#serverName").val(),
			"ddnsUser": $("#ddnsUser").val(),
			"ddnsPwd": $("#ddnsPwd").val(),
			"ddnsDomain": $("#ddnsDomain").val()
		}		
	} else {
		subObj = {
			"ddnsEn": $("#ddnsEn").val(),
			"serverName": initObj.serverName,
			"ddnsUser": initObj.ddnsUser,
			"ddnsPwd": initObj.ddnsPwd,
			"ddnsDomain": initObj.ddnsDomain
		}			
	}

	data = objTostring(subObj);
	$.post("goform/SetDDNSCfg", data, callback);
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