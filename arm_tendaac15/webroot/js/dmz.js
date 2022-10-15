var G = {},
	initObj = {};
$(function () {
	getValue();
	$("#dmzEn").on("click", changeDmzEn);
	$("#submit").on("click", function () {
		G.validate.checkAll();
	});
	checkData();
	top.loginOut();
	top.$(".main-dailog").removeClass("none");
	top.$(".save-msg").addClass("none");

	$("#hostIp").inputCorrect("num");
});

function changeDmzEn() {
	var className = $("#dmzEn").attr("class");
	if (className == "btn-off") {
		$("#dmzEn").attr("class", "btn-on");
		$("#dmzEn").val(1);
		$("#dmz_set").removeClass("none");
	} else {
		$("#dmzEn").attr("class", "btn-off");
		$("#dmzEn").val(0);
		$("#dmz_set").addClass("none");
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
	$.GetSetData.getJson("goform/GetDMZCfg?" + Math.random(), initValue);
}

function initValue(obj) {
	initObj = obj;


	var net_arry = obj["dmzIp"].split(".");
	var lan_arry = obj["lanIp"].split(".");

	top.$(".main-dailog").removeClass("none");
	top.$("iframe").removeClass("none");
	top.$(".loadding-page").addClass("none");

	if (obj["dmzEn"] == "0") {
		$("#dmzEn").attr("class", "btn-off");
		$("#dmzEn").val(0);
		$("#dmz_set").addClass("none");
	} else {
		$("#dmzEn").attr("class", "btn-on");
		$("#dmzEn").val(1);
		$("#dmz_set").removeClass("none");
	}
	$("#dmz_net").html(lan_arry[0] + "." + lan_arry[1] + "." + lan_arry[2] + ".");
	if (obj["dmzIp"] != "") {
		$("#hostIp").val(net_arry[3]);
	} else {
		$("#hostIp").val("");
	}
	top.initIframeHeight();
}

function preSubmit() {
	var dmzIp,
		dmzEn,
		data,
		hostIp;
	var rel = /^[0-9]{1,}$/,
		hostIp = parseInt($("#hostIp").val(), 10),
		dmzEn = $("#dmzEn").val(),
		dmzIp = (dmzEn == 1 ? $("#dmz_net").html() + hostIp : initObj.dmzIp);


	if (dmzEn == 1 && dmzIp == initObj.lanIp) {
		showErrMsg("msg-err", _("The DMZ Host IP and the LAN IP cannot be the same."));
		return false;
	}

	data = "dmzEn=" + dmzEn + "&dmzIp=" + dmzIp;
	if (!$("#hostIp").hasClass("validatebox-invalid")) {
		$.post("goform/SetDMZCfg", data, callback);
	}
}

function callback(str) {
	if (!top.isTimeout(str)) {
		return;
	}
	var num = $.parseJSON(str).errCode;

	if (num == 2) {
		//与lan口IP相同
		//top.$("#iframe-msg").removeClass("none");
		top.$("#iframe-msg").html(_("The DMZ Host IP and the LAN IP cannot be the same."));
		setTimeout(function () {
			top.$("#iframe-msg").html("");
		}, 800);
	} else {
		top.showSaveMsg(num);
		if (num == 0) {
			//getValue();
			top.advInfo.initValue();
		}
	}


}