var G = {};
var initObj = null;
var statusTxt = [_("Disconnected"), _("Connected")];

$(function () {
	getValue();
	$("#clientIp, #clientMask, #serverMask").inputCorrect("ip");
	$("#clientEn").on("click", changeClientEn);
	$("[name=clientType]").on("click", changeClientType);
	$("#mppeEn").on("click", changeMppeEn);
	$("#submit").on("click", function () {
		G.validate.checkAll();
	});
	$("#vpnStatusRefreshBtn").on("click", refreshStatus);
	checkData();
	top.loginOut();
	top.$(".main-dailog").removeClass("none");
	top.$(".save-msg").addClass("none");
	$.validate.valid.ppoe = {
		all: function (str) {
			var ret = this.specific(str);

			if (ret) {
				return ret;
			}
		},
		specific: function (str) {
			var ret = str;
			var rel = /[^\x00-\x80]|[\\~;'&"%\s]/;
			if (rel.test(str)) {
				return _("\\ ~ ; ' & \" % and blank space are not allowed.");
			}
		}
	}
});

function changeClientEn() {
	var className = $("#clientEn").attr("class");
	if (className == "btn-off") {
		$("#clientEn").attr("class", "btn-on");
		$("#clientEn").val(1);
		$("#client_set").removeClass("none");
	} else {
		$("#clientEn").attr("class", "btn-off");
		$("#clientEn").val(0);
		$("#client_set").addClass("none");
	}
	top.initIframeHeight();
}

function changeClientType() {
	var clientType = $("[name='clientType']:checked").val();

	if (clientType == "l2tp") {
		$("#mppeWrap").addClass("none");
	} else {
		$("#mppeWrap").removeClass("none");
	}
}

function changeMppeEn() {
	var className = $("#mppeEn").attr("class");
	if (className == "btn-off") {
		$("#mppeEn").attr("class", "btn-on");
		$("#mppeEn").val(1);
		$("#mppeNumWrap").removeClass("none");
	} else {
		$("#mppeEn").attr("class", "btn-off");
		$("#mppeEn").val(0);
		$("#mppeNumWrap").addClass("none");
	}
	top.initIframeHeight();	
}

function checkData() {
	G.validate = $.validate({
		custom: function () {
			if ($("#clientEn").val() == "1") {
				/*msg = checkIsVoildIpMask("clientIp", "clientMask");
				if (msg) {
					$("#clientIp").focus();
					return msg;
				}*/
				if ($("#domain").val() == "") {
					$("#domain").focus();
					return _("Please specify a domain name.");
				}
				if ($("#userName").val() == "") {
					$("#userName").focus();
					return _("Please specify a username.");
				}
				if ($("#password").val() == "") {
					$("#password").focus();
					return _("Please specify a password.");
				}

				//不能和pppoe用户名一样
				/*if (initObj.wanConnType == "2" && initObj.wanUser == $("#userName").val()) {
					return _("The username of ISP and PPTP/L2TP Client can not be the same!");
				}*/
			}
		},

		success: function () {
			preSubmit();
		},

		error: function (msg) {
			if (msg) {
				showErrMsg("msg-err", msg);
			}
			return;
		}
	});
}

function getValue() {
	$.GetSetData.getJson("goform/GetPptpClientCfg?" + Math.random(), initValue);
}

function refreshStatus() {
	$.GetSetData.getJson("goform/GetPptpClientCfg?" + Math.random(), function(obj) {
		$("#vpnStatus").html(statusTxt[parseInt(obj.vpnStatus, 10)]);
		if (obj.vpnIp != "0" && obj.vpnIp != "" && obj.vpnStatus != "0") {
			$("#vpnIpWrap").removeClass("none").find("#vpnIp").html(obj.vpnIp);
		} else {
			$("#vpnIpWrap").addClass("none");
		}
	});
}

function initValue(obj) {
	initObj = obj;
	$("#clientEn").attr("class", obj.clientEn == "1"?"btn-off":"btn-on");
	changeClientEn();

	$("#mppeEn").attr("class", (obj.clientMppe == "1"?"btn-off":"btn-on"));
	changeMppeEn();
	if (obj.clientMppeOp.replace(/[^\d]/g, "") != "")
	$("[name='mppeNum'][value='" + obj.clientMppeOp + "']")[0].checked = true;

	$("[name='clientType'][value='" + obj.clientType + "']")[0].checked = true;
	changeClientType();

	//$("#clientIp").val(obj.clientIp);
	//$("#clientMask").val(obj.clientMask);
	$("#domain").val(obj.domain);
	$("#userName").val(obj.userName);
	$("#password").val(obj.password);

	//获取到的IP地址
	if (obj.clientType != "pptp") {
		$("#vpnIpLabel").html($("#vpnIpLabel").html().replace("PPTP", "L2TP"));
	}
	refreshStatus();
	top.initIframeHeight();
}

function preSubmit() {
	var data,
		subObj = {};

	if ($("#clientEn").val() == 1) {
		subObj = {
			"clientEn": $("#clientEn").val(),
			"clientType": $("[name='clientType']:checked").val(),
			"clientMppe": $("[name='clientType']:checked").val() == "l2tp" ? initObj.clientMppe : $("#mppeEn").val(),
			"clientMppeOp": $("[name='clientType']:checked").val() == "l2tp" ? initObj.clientMppeOp : $("[name='mppeNum']:checked").val(),
			//"clientIp": $("#clientIp").val(),
			//"clientMask": $("#clientMask").val(),
			"domain": $("#domain").val(),
			"userName": $("#userName").val(),
			"password": $("#password").val()
		}		
	} else {
		subObj = {
			"clientEn": $("#clientEn").val(),
			"clientType": initObj.clientType,
			"clientMppe": initObj.clientMppe,
			"clientMppeOp": initObj.clientMppeOp,
			//"clientIp": $("#clientIp").val(),
			//"clientMask": $("#clientMask").val(),
			"domain": initObj.domain,
			"userName": initObj.userName,
			"password": initObj.password
		}		
	}

	data = objTostring(subObj);
	$.post("goform/SetPptpClientCfg", data, callback);
}

function callback(str) {
	if (!top.isTimeout(str)) {
		return;
	}
	var num = $.parseJSON(str).errCode;

	top.showSaveMsg(num);
	if (num == 0) {
		//getValue();
		top.vpnInfo.initValue();
	}
}