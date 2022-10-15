
var G = {},
	//langStrs = {"en": "0", "cn": "1", "zh": "2"},
	//language = langStrs[B.getLang()];
	language = B.getLang();
$(function () {
	$("#sys_backup, #sys_restore, #sys_config, #sys_pwd, #sys_reboot, #sys_restore, #sys_upgrade, #download_soft").on("click", system.preSubmit);

	$("[name='upgradeType']").on("click", changeUpgradeType);
	G.time = 0;
	checkData();
	top.loginOut();

	top.$(".main-dailog").removeClass("none");
	top.$(".save-msg").addClass("none");
	top.initIframeHeight();
});
var system = {};
var G = {};

function checkData() {
	G.validate = $.validate({
		custom: function () {},

		success: function () {

		},

		error: function (msg) {

		}
	});
}

system = {
	preSubmit: function () {
		G.index = 0;
		var id = $(this).attr("id");
		switch (id) {
		case "sys_backup":
			system.backUp();
			top.$(".main-dailog").addClass("none");
			top.$("#gbx_overlay").remove();
			return;
			break;
		case "sys_config":
			system.config();
			break;
		case "sys_pwd":
			system.password();
			break;
		case "sys_reboot":
			system.reboot();
			break;
		case "sys_restore":
			system.restore();
			break;
		case "sys_upgrade":
			system.upgrade();
			break;
		case "download_soft":
			system.download_soft();
			return;
			break;
		}
		if (G.index == 1) {
			return;
		}
		top.$(".main-dailog").addClass("none");

	},
	backUp: function () {
		if (confirm(_("Are you sure to backup your configuration to local host?"))) {
			window.location = "cgi-bin/DownloadCfg/RouterCfm.cfg";
		}
		top.$("#gbx_overlay").remove();
		//document.forms[0].submit();
	},
	config: function () {
		document.forms[0].submit();
	},
	password: function () {
		var oldPw = $('#SYSOPS').val(),
			newPw = $('#SYSPS').val(),
			confirmPw = $('#SYSPS2').val();
		if (newPw == "" || confirmPw == "") {
			showErrMsg("msg-err", _("Please enter a new/confirm password."));
			G.index = 1;
			return false;
		}

		if (/([^\x00-\x80])/.test(confirmPw) || /([^\x00-\x80])/.test(newPw)) {
			showErrMsg("msg-err", _("New/confirm password can not contains Illegal characters."));
			G.index = 1;
			return false;
		}
		
		if (newPw.charAt(0) == " " || newPw.charAt(newPw.length - 1) == " " || confirmPw.charAt(0) == " " || confirmPw.charAt(confirmPw.length - 1) == " ") {
			showErrMsg("msg-err",_("The first and last character of the New/confirm password cannot be blank space."));
			G.index = 1;
			return false;
		}

		if (newPw.length < 5 || confirmPw.length < 5) {
			showErrMsg("msg-err", _("The new/confirm password cannot be less than 5 characters."));
			G.index = 1;
			return false;
		}

		if (newPw != confirmPw) {
			showErrMsg("msg-err", _("Password mismatch!"));
			G.index = 1;
			return false;
		}

		document.forms[0].SYSOPS.value = str_encode(oldPw);
		document.forms[0].SYSPS.value = str_encode(newPw);
		document.forms[0].SYSPS2.value = str_encode(confirmPw);
		document.forms[0].submit();
	},
	reboot: function () {
		//window.location.href = "redirect.html?3";
		document.forms[0].submit();
	},
	restore: function () {
		if ($("#filename").val() == "") {
			showErrMsg("msg-err", _("Please select a file to restore."));
			G.index = 1;
			return false;
		}
		if ($("#filename").val().substr($("#filename").val().length-4) != ".cfg") {
			showErrMsg("msg-err", _("The backup file's suffix must be .cfg"));
			G.index = 1;
			return false;			
		}
		document.forms[0].submit();
		//$.post("")
	},
	upgrade: function () {
		if ($("#upgradeFile").val() == "") {
			//if($("#cur_fw_ver").html() == $("#new_fw_ver").html()) {
			showErrMsg("msg-err", _("Please select a firmware to upgrade."));
			G.index = 1;
			return false;
			//}
			//$.post("goform/SysToolSetUpgrade", "action=0",callbackUpgrade)
		} else {
			document.forms[0].submit();
		}
	},
	download_soft: function () {


		if (window.confirm(_("After the firmware is downloaded, the Router will start upgrade automatically. Keep the power supply on during the upgrade in case of damage to the Router."))) {
			
			$("#download_soft").attr("disabled", true);
			$('input[name="upgradeType"]').attr("disabled", true);
			
			$("#download_soft, #status_progress, #download_note, #status_checked").addClass("none");

			$("#status_checking").removeClass("none").html(_("Preparing downloading..."));
			//不允许跳转页面
			top.$(".iframe-close").addClass("none");
			
			$.getJSON("goform/cloudv2?module=wansta&opt=query&rand=" + Math.random(), function(obj){
				if(obj.wan_sta == 0) {
					
					$("#status_checking").html(_("Fail to access the Internet. Please check the Internet."));
					$("#download_soft").attr("disabled", false);
					$('input[name="upgradeType"]').attr("disabled", false);
					top.$(".iframe-close").removeClass("none");
				} else {
					
					$.getJSON("goform/cloudv2?module=olupgrade&opt=queryupgrade&rand=" + new Date().toTimeString(), queryUpgradeStatus);
				}
			});
			
			
		}
	}
		
}



/*function callbackOnlineUp(str) {
	$("#begin_upgrade").attr("disabled", false);
	var num = $.parseJSON(str).errCode;
	
	//获取状态为6时，开始转圈圈
	
	if(num == 0) {
		checkingStatus(100);
		//window.location.href = "redirect.html?1";
	} else {
		alert(num);		
	}
}
*/



function callbackUpgrade(str) {
	var num = $.parseJSON(str).errCode;
	if (num == 0) {
		window.location.href = "redirect.html?1";
	}
}

var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function utf16to8(str) {
	var out, i, len, c;

	out = "";
	len = str.length;
	for (i = 0; i < len; i++) {
		c = str.charCodeAt(i);
		if ((c >= 0x0001) && (c <= 0x007F)) {
			out += str.charAt(i);
		} else if (c > 0x07FF) {
			out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
			out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
			out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
		} else {
			out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
			out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
		}
	}
	return out;
}

function base64encode(str) {
	var out, i, len;
	var c1, c2, c3;


	len = str.length;
	i = 0;
	out = "";
	while (i < len) {
		c1 = str.charCodeAt(i++) & 0xff;
		if (i == len) {
			out += base64EncodeChars.charAt(c1 >> 2);
			out += base64EncodeChars.charAt((c1 & 0x3) << 4);
			out += "==";
			break;
		}
		c2 = str.charCodeAt(i++);
		if (i == len) {
			out += base64EncodeChars.charAt(c1 >> 2);
			out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
			out += base64EncodeChars.charAt((c2 & 0xF) << 2);
			out += "=";
			break;
		}
		c3 = str.charCodeAt(i++);
		out += base64EncodeChars.charAt(c1 >> 2);
		out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
		out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
		out += base64EncodeChars.charAt(c3 & 0x3F);
	}
	return out;
}

function str_encode(str) {
	return base64encode(utf16to8(str));
}

function init() {
	var msg = location.search.substring(1) || "-1";
	if (msg == "1") {
		$("#msg-err").html(_("Wrong password!"));
		top.$(".main-dailog").removeClass("none");
	} else {
		$("#msg-err").html("&nbsp;");
	}
	$('#SYSOPS').initPassword('', true, false);
	$('#SYSPS').initPassword('', true, false);
	$('#SYSPS2').initPassword('', true, false);
	$.GetSetData.getJson("goform/SysToolpassword?" + Math.random(), function (obj) {
		G.ispwd = obj.ispwd || "0";
		if (G.ispwd == "1") {
			$("#old_pwd").removeClass("none");
		} else {
			$("#old_pwd").addClass("none");
		}
		top.initIframeHeight();
	});
}

function initDirectUpgrade() {
	$.getJSON("goform/cloudv2?module=wansta&opt=query&rand=" + Math.random(), function(obj){
		if(obj.wan_sta == 0) {
			
			$("#status_checking").html(_("Fail to access the Internet. Please check the Internet."));
		} else {
			
			$.getJSON("goform/cloudv2?module=olupgrade&opt=queryversion&rand=" + new Date().toTimeString(), onlineQueryVersion);
		}
	});
	
}

function initUpgrade() {
	var msg = location.search.substring(1) || "0";
	//1001 格式错误
	//1002 CRC校验失败
	//1003 文件大小错误
	//1004 升级失败
	//1005 内存不足，请重启路由器
	if (msg == "1001") {
		$("#msg-err").html(_("Format error!"));
	} else if (msg == "1002") {
		$("#msg-err").html(_("CRC check Failure"));
	} else if (msg == "1003") {
		$("#msg-err").html(_("File size error"));
	} else if (msg == "1004") {
		$("#msg-err").html(_("Fail to upgrade it!"));
	} else if (msg == "1005") {
		$("#msg-err").html(_("Internal memory is not enough. Please reboot the router before upgrading."));
	}
	top.$(".main-dailog").removeClass("none");
	$.GetSetData.getJson("goform/SysToolGetUpgrade?" + Math.random(), callback);

	//TODO:进行在线升级状态查询
	
	$("#status_checking").html(_("Detecting new version...please wait..."));
	
	$.getJSON("goform/cloudv2?module=wansta&opt=query&rand=" + Math.random(), function(obj){
		if(obj.wan_sta == 0) {
			
			$("#status_checking").html(_("Fail to access the Internet. Please check the Internet."));
		} else {
			$.getJSON("goform/cloudv2?module=olupgrade&opt=queryversion&rand=" + new Date().toTimeString(), onlineQueryVersion);
		}
	});
	
	
}



function callback(obj) {
	$("#cur_fw_ver").html(obj.cur_fw_ver);
	//$("#new_fw_ver").html(obj.new_fw_ver);
	//$("#releaseNote").html(obj.releaseNote);
}

function checkCloudServer() {
	$.GetSetData.getJson("goform/cloud?module=getInfo&rand=" + new Date().toTimeString(), function (obj) {
		if (obj.enable == 0) {
			if (!obj.password) {
				//无密码需要自动生成密码
				obj.password = str_encode(randomString());
			}
			var subObj = {
				"enable": 1,
				"password": obj.password,
				"list": obj.list
			}
			subStr = objTostring(subObj);
			$.post("goform/cloud?module=setInfo&rand=" + new Date().toTimeString(), subStr, delayCheckStatus);
		} else {
			delayCheckStatus();
		}
	});


}

function onlineErrCode(num) {
	var result = "";
	switch(num) {
		case 0:
			break;
		case 1:
			result = _("Unkonwn Error");
			break;
		case 2:
			result = _("JSON data is too long");
			break;
		case 3:
			result = _("Failed to allocate the memory. The memory is not enough");
			break;
		case 4:
			result = _("Connection Error");
			break;
		case 5:
		case 6:
			result = _("Failed to connect to the socket");
			break;
		case 7:
		case 8:
			result = _("Failed to run the command");
			break;
		case 9:
			result = _("Sent an invalid command");
			break;
		case 10:
		case 11:
		case 12:
			result = _("Failed to analyse, package or detect data");
			break;
		case 13:
		case 14:
		case 17:
			result = _("Failed to connect to the server");
			break;
		case 15:
			result = _("Authentication Failure");
			break;
		case 16:
			result = _("The Tenda App feature is disabled");
			break;
		case 18:
			result = _("Cloud Server is busy now. Updating or testing speed");
			break;
		case 19:
			result = _("Connecting server...");
			break;
	}
	
	return result;
			
}


function onlineQueryVersion(obj) {
	var ver_info = obj.ver_info;
	
	var result = onlineErrCode(ver_info.err_code);
	if(ver_info.err_code == 19) {
		$("#status_checking").removeClass("none").html(result);
			
		setTimeout(function(){
			$.getJSON("goform/cloudv2?module=olupgrade&opt=queryversion&rand=" + new Date().toTimeString(), onlineQueryVersion);	
		}, 2000);	
		return;
	}
	
	if(result == "") {
		
		switch(ver_info.resp_type) {
			case 0:
			//获取到新版本，显示版本信息，根据当前语言来显示
				$("#status_checking, #status_progress, #download_note, #upgrade_err").addClass("none");
				$("#status_checked, #download_soft").removeClass("none");
				//显示信息
				$("#new_fw_ver").html(ver_info.detail.newest_ver);
				var description = ver_info.detail.description;
				if(language == "en") {
					description = ver_info.detail.description_en;
				} else if (language == "cn") {
					description = ver_info.detail.description;	
				} else if(language == "zh"){
					description = ver_info.detail.description_zh_tw;	
				}
				if(description) {
					$("#releaseNote").val(description.join(""));
				} else {
					$("#releaseNote").val(ver_info.detail.description);	
				}
				
				break;
			case 1:
			//没有新版本
				$("#status_checking").html(_("The current version is the latest. Do not need upgrade."));
				break;
	
		}
	} else {
		$("#status_checking").html(result);
	}
	
	top.initIframeHeight();
}


function queryUpgradeStatus(obj) {
	
	var num = 0;

	if (typeof obj == "string" && obj.indexOf("!DOCTYPE html") >= 0) {
		//被重置了页面，说明升级有问题
		num = -1;
	}
	if (num == 0) {
		
		clearTimeout(G.time);
		
		showOnlineUp(obj);
		

	} else {
		$("#download_soft").attr("disabled", false);
		top.$(".iframe-close").removeClass("none");
		top.$("#page-message").html(_("Upgrade Error! Please check the Internet Status."));
		setTimeout(function () {
			top.$(".main-dailog").removeClass("none");
			//显示页面，隐藏保存进度条
			top.$(".save-msg").addClass("none");
		}, 1000);
	}
}



function showUpgradeErr(str) {

	$("#upgrade_err").removeClass("none").html(str);
	setTimeout(function () {
		$("#upgrade_err").html("");
		$("#upgrade_err").addClass("none");
	}, 1000);
}

function showOnlineUp(obj) {
	var update_info = {},
		wait_info = {},
		width_bg = parseInt($("#progress_bg").css("width"), 10),
		width_tip = parseInt($("#progress_num").css("width"), 10);
	width_bar = parseInt($("#progress_bar").css("width"), 10);
	
	
	up_info = obj.up_info;
	
	var result = onlineErrCode(up_info.err_code);
	
	if(up_info.err_code == 19) {
		$("#status_checking").removeClass("none").html(result);
			
		checkingStatus(2000);	
		return;
	}
	
	if(result == "") {
		$("#upgrade_err").addClass("none").html("");
		switch(up_info.resp_type) {
			case 0:
				//正在询问升级服务器，即正在准备下载
				$('input[name="upgradeType"]').attr("disabled", true);

				$("#download_soft, #status_progress, #download_note, #status_checked").addClass("none");
			

				$("#status_checking").removeClass("none").html(_("Preparing downloading..."));

				//继续检测
				checkingStatus(5000);
				break;
			case 1:
				//内存不足
				top.$(".iframe-close").removeClass("none");
				$('input[name="upgradeType"]').attr("disabled", false);
				$("#status_checking, #status_progress, #download_note, #download_soft").addClass("none");
				$("#status_checked").removeClass("none");
				$("#upgrade_err").html(_("Internal memory is not enough. Please reboot the router before downloading.")).removeClass("none");
				break;
			case 2: 
				//路由器在排队升级
				$('input[name="upgradeType"]').attr("disabled", true);
				$("#download_soft, #status_progress , #download_note, #status_checked").addClass("none");

				wait_info = up_info.detail;
				$("#status_checking").removeClass("none").html(_("There are(is) %s user(s) are queuing, you may need wait for %s seconds.", [wait_info.pos, wait_info.time]));
				checkingStatus(2000);
				break;
			case 3:
			    //路由器正在下载固件
				$('input[name="upgradeType"]').attr("disabled", true);
				$("#status_checking,#download_soft, #status_checked").addClass("none");

				$("#status_progress, #download_note").removeClass("none");
				var progress = parseInt(up_info.detail.recved/up_info.detail.fw_size * 100, 10);
				width_bar = (width_bg - width_tip) * progress / 100 + width_tip;
	
				$("#progress_bar").css("width", width_bar + "px");
				$("#progress_num span").html(progress + "%");
				checkingStatus(2000);
				break;
			case 4:
				//路由器正在烧写固件
				$('input[name="upgradeType"]').attr("disabled", true);
				//下载完成后，隐藏更新内容，显示正在准备升级
				$("#status_checked, #download_soft, #status_progress, #download_note").addClass("none");
				$("#status_checking").removeClass("none").html(_("Preparing upgrade...please wait..."));

				top.$(".iframe-close").removeClass("none");
				top.$(".main-dailog").addClass("none");
				top.$.progress.showPro("upgrade", _("Upgrading...please wait..."));

				break;
				
			default:
				top.$(".iframe-close").removeClass("none");
				$('input[name="upgradeType"]').attr("disabled", false);
				top.$("#page-message").html(_("Fail to upgrade it!"));
				setTimeout(function () {
					top.$(".main-dailog").removeClass("none");
					//显示页面，隐藏保存进度条
	
				}, 1000);
				break;
		}
	} else {
		$("#status_checking, #status_progress, #download_note, #download_soft").addClass("none");
		$("#status_checked").removeClass("none");
		$("#upgrade_err").removeClass("none").html(result);	
		top.$(".iframe-close").removeClass("none");
	}
		
	
	
	top.initIframeHeight();
}

function delayCheckStatus(data) {
	checkingStatus(5000);
}

function checkingStatus(time) {
	clearTimeout(G.time);
	G.time = setTimeout(function () {
		$.getJSON("goform/cloudv2?module=olupgrade&opt=queryupgrade&rand=" + new Date().toTimeString(), showOnlineUp);
	}, time);
}

function changeUpgradeType() {
	if ($("#local_upgrade").prop("checked")) {
		
		$("#local_upgrade_wrap").removeClass("none");
		$("#online_upgrade_wrap").addClass("none");
	} else {
		$("#online_upgrade_wrap").removeClass("none");
		$("#local_upgrade_wrap").addClass("none");
		
	}

	top.initIframeHeight();
}

function initBackup() {
	var msg = location.search.substring(1) || "0";
	if (msg == "1") {
		$("#msg-err").html(_("Fail to restore it!"));
	}
	top.initIframeHeight();
}