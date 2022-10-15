var G = {};
$(function () {
	initHtml();

	$.validate.valid.ssid = {
		all: function (str) {
			var ret = this.specific(str);
			//ssid 前后不能有空格，可以输入任何字符包括中文，仅32个字节的长度
			if (ret) {
				return ret;
			}

			if (str.charAt(0) == " " || str.charAt(str.length - 1) == " ") {
				return _("The first and last character of the WiFi Name cannot be blank space.");
			}
		},
		specific: function (str) {
			var ret = str;
			if ((null == str.match(/[^ -~]/g) ? str.length : str.length + str.match(/[^ -~]/g).length * 2) > 32) {
				return _("Up to %s characters are allowed",[32]);
			}
		}
	}
	$.validate.valid.ssidPwd = {
		all: function (str) {
			var ret = this.specific(str);

			if (ret) {
				return ret;
			}
			if (str.length < 8 || str.length > 63) {
				return _("The password should be made of 8~63 characters.");
			}
			//密码不允许输入空格
			//if (str.indexOf(" ") >= 0) {
			//	return _("WiFi Password cannot contain blank space.");
			//}
			//密码前后不能有空格
			if (str.charAt(0) == " " || str.charAt(str.length - 1) == " ") {
				return _("The first and last character of the WiFi Password cannot be blank space.");
			}
		},
		specific: function (str) {
			var ret = str;
			if (/[^\x00-\x80]/.test(str)) {
				return _("Illegal characters are not allowed.");
			}
		}
	}
	checkData();
	initEvent();
	getValue();
	top.loginOut();
});

function initHtml() {
	top.$(".main-dailog").removeClass("none");
	top.$(".save-msg").addClass("none");
}

function initEvent() {
	$("#save").on("click", function () {
		G.validate.checkAll();
	});
	$("#pwd_none,#pwd_none_5g").on("click", clickNoneSec);
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
	$.getJSON("goform/WifiBasicGet?" + Math.random(), initValue);
}

function initValue(obj) {

	inputValue(obj);
	//mainPageLogic.validate.checkAll("wrl-form");
	if (obj.security == "none") {
		$("#pwd_none")[0].checked = true;
	} else {
		$("#pwd_none")[0].checked = false;
	}

	if (obj.security_5g == "none") {
		$("#pwd_none_5g")[0].checked = true;
	} else {
		$("#pwd_none_5g")[0].checked = false;
	}
	if (obj.hideSsid == 1) {
		$("#hideSsid")[0].checked = true;
	} else {
		$("#hideSsid")[0].checked = false;
	}
	if (obj.hideSsid_5g == 1) {
		$("#hideSsid_5g")[0].checked = true;
	} else {
		$("#hideSsid_5g")[0].checked = false;
	}
	clickNoneSec();
};

function clickNoneSec() {
	if ($("#pwd_none")[0].checked) {
		$("#pwd_none").parent().parent().find(":text, :password").eq(0).val("").attr("disabled", true);
	} else {
		$("#pwd_none").parent().parent().find(":text, :password").eq(0).removeAttr("disabled");
	}
	if ($("#pwd_none_5g")[0].checked) {
		$("#pwd_none_5g").parent().parent().find(":text, :password").eq(0).val("").attr("disabled", true);
	} else {
		$("#pwd_none_5g").parent().parent().find(":text, :password").eq(0).removeAttr("disabled");
	}
};

function preSubmit() {
	var subData,
		dataObj,
		subObj;
		
	getCheckbox(["pwd_none", "pwd_none_5g", "hideSsid", "hideSsid_5g"]);
	if ($("#wrlPwd").val() != "") {
		$("#security").val("wpapsk");
	} else {
		$("#security").val("none");
	}

	if ($("#wrlPwd_5g").val() != "") {
		$("#security_5g").val("wpapsk");
	} else {
		$("#security_5g").val("none");
	}
	dataObj = {
		"security": $("#security").val(),
		"security_5g": $("#security_5g").val(),
		"ssid": $("#ssid").val(),
		"ssid_5g": $("#ssid_5g").val(),
		"hideSsid": $("#hideSsid").val(),
		"hideSsid_5g": $("#hideSsid_5g").val(),
		"wrlPwd": $("#wrlPwd").val(),
		"wrlPwd_5g": $("#wrlPwd_5g").val()
	}
	subData = objTostring(dataObj);
	$.post("goform/WifiBasicSet", subData, callback);

}

function callback(str) {
	if (!top.isTimeout(str)) {
		return;
	}
	var num = $.parseJSON(str).errCode;
	top.showSaveMsg(num);
	if (num == 0) {
		$("#wrl_submit").blur();
		top.wrlInfo.initValue();
		top.staInfo.initValue();
	}
}