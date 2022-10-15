var G = {};
var initObj = null;
var listNum = 0;
$(function () {
	getValue();
	$("#serverEn").on("click", changeServerEn);
	$("#mppeEn").on("click", changeMppeEn);
	$("#addBtn").on("click", addRuleByHand);
	$("#serverList").delegate(".del", "click", delList);

	$("#startIp, #serverIp, #serverMask").inputCorrect("ip");
	$("#endIp").inputCorrect("num");

	$("#startIp").on("blur keyup", function () {
		var startIp = $("#startIp").val();
		var arry = startIp.split(".");
		var str = arry[0] + "." + arry[1] + "." + arry[2] + ".";

		if (!$.validate.valid.ip.all(startIp)) {
			$("#endNet").html(str);
		}
	});

	$("#submit").on("click", function () {
		G.validate.checkAll();
	});
	checkData();
	top.loginOut();
	top.$(".main-dailog").removeClass("none");
	top.$(".save-msg").addClass("none");
});


function changeServerEn() {
	var className = $("#serverEn").attr("class");
	if (className == "btn-off") {
		$("#serverEn").attr("class", "btn-on");
		$("#serverEn").val(1);
		$("#pptp_set").removeClass("none");
	} else {
		$("#serverEn").attr("class", "btn-off");
		$("#serverEn").val(0);
		$("#pptp_set").addClass("none");
	}
	top.initIframeHeight();
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

function addRuleByHand() {
	var username = $("#ruleAddTr #userName").val(),
		password = $("#ruleAddTr #password").val();
		//remark = $("#ruleAddTr").children().eq(5).find("input").val();

	var ruleMsg=checkRule($("#ruleAddTr")[0]);
	if (!ruleMsg) {
		//检查用户名是否有重复
		$("#serverList tr").each(function() {
			var usernameExist = $(this).find("[data-role=username]").val();
			if (usernameExist == username) {
				ruleMsg = _("The username already exists.");
				return false;
			}
		});
	}
	if (ruleMsg) {
		showErrMsg("msg-err", ruleMsg);
	} else {
		addList({
			"userName": username,
			"password": password
		});
		$("#ruleAddTr").find("input").each(function() {
			if (this.type.toLowerCase() === "text") {
				this.value = "";
			} else if (this.type.toLowerCase() === "checkbox"){
				this.checked = false;
			}
		});
	}
}

function addList(rowDataObj) {
	var str = "",
		$row = null,
		statusTxt = [_("Disconnected"), _("Connected")];

	if ($("#serverList tr").length >= 8) {
		showErrMsg("msg-err", _("Up to %s entries can be added.", [8]));
		return;
	}
	listNum++;
	str = "<tr>";
	str += "<td><span alt='pptpStatus'></span></td>";
	str += "<td><input data-role='username' type='hidden' id='userName" + listNum + "'/><span></span></td>";
	str += "<td><input data-role='password' type='text' id='password" + listNum + "' class='input-small' maxLength='32' style='width:80px;'></td>";
	str += "<td><input type='button' value='" + _("Delete") + "' class='btn btn-small del'></td></tr>";
	$row = $(str);
	$("#serverList").append($row);
	if (rowDataObj) {
		$row.find("[alt=pptpStatus]").html(statusTxt[parseInt(rowDataObj.connsta, 10)]?statusTxt[parseInt(rowDataObj.connsta, 10)]:"--");
		$row.find("[data-role=username]").val(rowDataObj.userName).next().html(rowDataObj.userName);;
		$row.find("[data-role=password]").val(rowDataObj.password);

	}
	top.initIframeHeight();
}

function delList() {
	$(this).parent().parent().remove();
}

//检查一条规则是否合法
function checkRule(rowEle) {
	var rel_ip = /^([1-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){2}([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])$/,
		rel_mask = /^(254|252|248|240|224|192)\.0\.0\.0$|^(255\.(254|252|248|240|224|192|128|0)\.0\.0)$|^(255\.255\.(254|252|248|240|224|192|128|0)\.0)$|^(255\.255\.255\.(252|248|240|224|192|128|0))$/,

		lanIp = G.data.lanIp,
		lanMask = G.data.lanIp,
		guestIp = G.data.guestIp,

		username = $(rowEle).children().eq(1).find("input").val(),
		password = $(rowEle).children().eq(2).find("input").val();


	if (!username || username == "") {
		$(rowEle).children().eq(1).find("input").focus();
		return _("Please specify a username.");
	} else if ($.validate.valid.pwd(username)) {
		$(rowEle).children().eq(1).find("input").focus();
		return $.validate.valid.pwd(username);		
	}
	if (password == "") {
		$(rowEle).children().eq(2).find("input").focus();
		return _("Please specify a password.");
	} else if ($.validate.valid.pwd(password)) {
		$(rowEle).children().eq(2).find("input").focus();
		return $.validate.valid.pwd(password);		
	}
}

function checkData() {
	G.validate = $.validate({
		custom: function () {
			var i = 0,
				trArry = $("#serverList").children(),
				len = trArry.length,
				lanIp = G.data.lanIp,
				lanMask = G.data.lanMask,
				guestIp = G.data.guestIp,
				guestMask = G.data.guestMask,
				wanIp = G.data.wanIp,
				wanMask = G.data.wanMask,
				rel_ip = /^([1-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){2}([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])$/,
				rel_mask = /^(254|252|248|240|224|192)\.0\.0\.0$|^(255\.(254|252|248|240|224|192|128|0)\.0\.0)$|^(255\.255\.(254|252|248|240|224|192|128|0)\.0)$|^(255\.255\.255\.(252|248|240|224|192|128|0))$/,
				startIp,
				endIp,
				msg = "";

			startIp = $("#startIp").val();
			endIp = $("#endIp").val();

			if ($("#serverEn").val() == "1") {
				if (lanIp != "" && checkIpInSameSegment(startIp, lanMask, lanIp, lanMask)) {
					startIp = $("#startIp").val();
					return _("The start IP of IP Range and LAN IP (%s) should not be in the same network segment.",[lanIp]);
				}

				// 决策： 访客网络网段冲突有后台处理
				/*if (guestIp != "" && checkIpInSameSegment(startIp, lanMask, guestIp, guestMask)) {
					startIp = $("#startIp").val()
					return _("The start IP of IP Range and Guest Network IP (%s) should not be in the same network segment.",[guestIp]);
				}*/

				if (wanIp != "" && checkIpInSameSegment(startIp, lanMask, wanIp, wanMask)) {
					startIp = $("#startIp").val()
					return _("The start IP of IP Range and WAN IP (%s) should not be in the same network segment.",[wanIp]);
				}


				startIp = $("#startIp").val().split(".")[3];
				endIp = $("#endIp").val();
				if (parseInt(startIp, 10) > parseInt(endIp, 10)) {
					return _("The start IP cannot be greater than the end IP.");
				}

				if ((startIp+"") == "1") {
					return _("The last digit of start IP can not be 1");
				}

				//todo： 判断地址池包含8个
				if ((parseInt(endIp, 10) - parseInt(startIp, 10)) < 7) {
					return _("Please ensure that the IP pool contains 8 IP addresses at least.");
				}

				var ruleMsg;
				for (i = 0; i < len; i++) {
					ruleMsg=checkRule(trArry[i]);
					if (ruleMsg) {return ruleMsg;}
				}
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
	$.GetSetData.getJson("goform/GetPptpServerCfg?" + Math.random(), initValue);
}

function updateConnectStatus(data) {
	var statusTxt = [_("Disconnected"), _("Connected")],
		rowDataObj = null;

	for (var i = 1; i < data.length; i++) {
		rowDataObj = data[i];
		$("input[data-role=username]").each(function() {
			if (this.value == rowDataObj.userName) {
				$(this).parents("tr").find("[alt=pptpStatus]").html(statusTxt[parseInt(rowDataObj.connsta, 10)]?statusTxt[parseInt(rowDataObj.connsta, 10)]:"--");
				return false;
			}
		});
	}	
}

function initValue(obj) {
	var doc,
		str = "",
		len = obj.length,
		i = 1;
	G.data = obj[0];
	initObj = obj;

	$("#serverEn").attr("class", (obj[0].serverEn == "1"?"btn-off":"btn-on"));
	changeServerEn();
	$("#mppeEn").attr("class", (obj[0].mppe == "1"?"btn-off":"btn-on"));
	changeMppeEn();
	if (obj[0].mppeOp.replace(/[^\d]/g, "") != "")
	$("[name='mppeNum'][value='" + obj[0].mppeOp + "']")[0].checked = true;

	var ipArry = obj[0].endIp.split(".");
	$("#startIp").val(obj[0].startIp);
	$("#endNet").html(ipArry[0] + "." + ipArry[1] + "." + ipArry[2] + ".");
	$("#endIp").val(ipArry[3]);

	for (i = 1; i < len; i++) { addList(obj[i]); }

	//更新连接状态
	setInterval(function() {
		$.GetSetData.getJson("goform/GetPptpServerCfg?" + Math.random(), updateConnectStatus);
	}, 2000);
}

function preSubmit() {
	var data,
		i = 0,
		username,
		password,
		netEn,
		serverIp,
		serverMask,
		remark,
		trArry = $("#serverList").children(),
		listEmpty = false;
		len = trArry.length;

	if ($("#serverEn").val() == 1) {
		data = "serverEn=" + $("#serverEn").val();
		data += "&startIp=" + $("#startIp").val();
		data += "&endIp=" + $("#endNet").html() + $("#endIp").val();
		data += "&mppe=" + $("#mppeEn").val();
		data += "&mppeOp=" + $("[name='mppeNum']:checked").val();
		data += "&list=";

		if (!listEmpty) {
			for (i = 0; i < len; i++) {
				username = $(trArry[i]).children().eq(1).find("input").val();
				password = $(trArry[i]).children().eq(2).find("input").val();

				data += encodeURIComponent(username) + ";";
				data += encodeURIComponent(password) + ";";
				data += "0;";//netEn
				data += ";";//serverIp
				data += ";";//serverMask
				data += "~";//remark encodeURIComponent(remark)
			}		
		}

		data = data.replace(/[~]$/, "");		
	} else {
		data = "serverEn=" + $("#serverEn").val();
		data += "&startIp=" + initObj[0].startIp;
		data += "&endIp=" + initObj[0].endIp;
		data += "&mppe=" + initObj[0].mppe;
		data += "&mppeOp=" + initObj[0].mppeOp;
		data += "&list=";

		if (!listEmpty) {
			for (i = 1; i < initObj.length; i++) {
				username = initObj[i].userName;
				password = initObj[i].password;

				data += encodeURIComponent(username) + ";";
				data += encodeURIComponent(password) + ";";
				data += "0;";//netEn
				data += ";";//serverIp
				data += ";";//serverMask
				data += "~";//remark encodeURIComponent(remark)
			}		
		}

		data = data.replace(/[~]$/, "");			
	}

	$.post("goform/SetPptpServerCfg", data, callback);
}

function callback(str) {
	if (!top.isTimeout(str)) {
		return;
	}
	var num = $.parseJSON(str).errCode;
	top.showSaveMsg(num);
	if (num == 0) {
		top.vpnInfo.initValue();
	}
}