function setCheckbox(arry) {
	var i = 0,
		len = arry.length,
		val;
	for (i = 0; i < len; i++) {
		val = $("#" + arry[i]).val();
		if (val == 1) {
			$("#" + arry[i]).attr("checked", true);
		} else {
			$("#" + arry[i]).attr("checked", false);
		}
	}
}

function loginOut() {
	//$(document).ajaxError(function () {
	//top.location.reload(true);
	//});
}

function getCheckbox(arry) {
	var i = 0,
		length = arry.length;
	for (i = 0; i < length; i++) {
		if ($("#" + arry[i])[0].checked == true) {
			$("#" + arry[i]).val(1);
		} else {
			$("#" + arry[i]).val(0);
		}
	}
}

function inputValue(obj) {
	var prop;
	for (prop in obj) {
		$("#" + prop).val(obj[prop]);
	}
}

function formatSeconds(value) {
	var theTime = parseInt(value); // 秒 
	var theTime1 = 0; // 分 
	var theTime2 = 0; // 小时
	var theTime3 = 0; // 天
	// alert(theTime); 
	if (theTime > 60) {
		theTime1 = parseInt(theTime / 60);
		theTime = parseInt(theTime % 60);
		// alert(theTime1+"-"+theTime); 
		if (theTime1 > 60) {
			theTime2 = parseInt(theTime1 / 60);
			theTime1 = parseInt(theTime1 % 60);
			if (theTime2 > 24) {
				theTime3 = parseInt(theTime2 / 24);
				theTime2 = parseInt(theTime2 % 24);
			}
		}
	}
	var result = "" + parseInt(theTime) + _("s");
	if (theTime1 > 0) {
		result = "" + parseInt(theTime1) + _("min") + " " + result;
	}
	if (theTime2 > 0) {
		result = "" + parseInt(theTime2) + _("h") + " " + result;
	}
	if (theTime3 > 0) {
		result = "" + parseInt(theTime3) + _("day") + " " + result;
	}
	return result;
}

function checkIpInSameSegment(eip, emask, ip, mask) {
	var index = 0;
	var eipp = "";
	var emaskk = "";
	if (typeof (eip) == "object")
		eipp = eip.split(".");
	else
		eipp = eip.split(".");

	if (typeof (emask) == "object")
		emaskk = emask.split(".");
	else
		emaskk = emask.split(".");
	if (ip == '' && mask == '')
		return false;
	var ipp = ip.split(".");
	var maskk = mask.split(".");
	var msk = maskk;
	for (var i = 0; i < 4; i++) {
		if (emaskk[i] == maskk[i]) {
			continue;
		} else if (emaskk[i] > maskk[i]) {
			msk = maskk;
			break;
		} else {
			msk = emaskk;
			break;
		}
	}
	for (var i = 0; i < 4; i++) {
		if ((eipp[i] & msk[i]) != (ipp[i] & msk[i])) {
			return false;
		}
	}
	return true;
}

function objTostring(obj) {
	var prop,
		str = "";
	for (prop in obj) {
		str += prop + "=" + encodeURIComponent(obj[prop]) + "&";
	}
	str = str.replace(/[&]$/, "");
	return str;
}


//拿到字符串的字节数
function getStrByteNum(str) {
	var totalLength = 0,
		charCode;

	for (var i = str.length - 1; i >= 0; i--) {
		charCode = str.charCodeAt(i);
		if (charCode <= 0x007f) {
			totalLength++;
		} else if ((charCode >= 0x0080) && (charCode <= 0x07ff)) {
			totalLength += 2;
		} else if ((charCode >= 0x0800) && (charCode <= 0xffff)) {
			totalLength += 3;
		} else {
			totalLength += 4;
		}
	}
	return totalLength;
}


function showErrMsg(id, str, noFadeAway) {
	var T = 0;
	var showErrMsgFun = function (id, str, noFadeAway) {
		clearTimeout(T);
		$("#" + id).html(str);
		if (!noFadeAway) {
			T = setTimeout(function () {
				$("#" + id).html("&nbsp;");
			}, 2000);
		}
	}
	showErrMsg = showErrMsgFun;
	showErrMsgFun(id, str, noFadeAway);
}

function initIframeHeight() {
	if (!$("#gbx_overlay").is(":visible")) {
		return;
	}

	var iframeHeight = $(".dailog-iframe").contents().find("fieldset:eq(0)").height() + 40,
		maxHeight = $(window).height() - 20,
		dialogBoxHeight = iframeHeight + 80;

	dialogBoxHeight = (dialogBoxHeight > maxHeight ? maxHeight : dialogBoxHeight);
	iframeHeight = dialogBoxHeight - 50;
	$(".dailog-iframe").css("height", (iframeHeight + 10) + "px");
	$(".dailog-iframe").contents().find("body").css("height", iframeHeight + "px");
	$(".main-dailog").css({
		"top": "50%",
		"margin-top": -dialogBoxHeight / 2 - 30 + "px",
		"height": dialogBoxHeight + "px"
	});
	if ($(".main-dailog").offset().top < 0) {
		$(".main-dailog").css({
			"top": "10px",
			"margin-top": "0"
		});
	}
}

function showIframe(title, url, width, height, extraDataStr) {
	var extraDataStr = extraDataStr || "";
	if ($("#gbx_overlay").length == 0) {
		$("<div id='gbx_overlay'></div>").appendTo("body");
	}
	$(".save-msg").removeClass("none");
	$("#page-message").html(_("Loading..."));

	$("iframe").attr("src", url + "?random=" + Math.random() + "&" + extraDataStr);
	$("#head_title").html(title);

	//位置调整
	$(".main-dailog").css("width", width + "px").addClass("none");
	$(".dailog-iframe").css("width", width + "px");
	$(".main-dailog").css({
		"left": "50%",
		"top": "50%",
		"width": width + "px",
		"margin-left": -width / 2 + "px",
		"margin-top": -$(".main-dailog").outerHeight() / 2 + "px"
	});

	$("#head_title2").addClass("none").removeClass("selected");
	$(".fopare-ifmwrap-title").removeClass("border-bottom");
	$("#head_title").removeClass("selected");

	//iframe加载成功之后，initIframeHeight()
	$("iframe").on("load.iframeload", function () {
		$(".main-dailog").removeClass("none")
		$(".save-msg").addClass("none");
		var time = 0;
		(function () {
			if (time < 1) {
				initIframeHeight();
				time++;
				setTimeout(arguments.callee, 30);
			} else {
				return;
			}
		})();
		initIframeHeight();
		$("iframe").off(".iframeload");
	});
}

function closeIframe() {
	$(".main-dailog").addClass("none");
	$(".main-dailog").find("iframe").attr("src", "").removeClass("none");
	$("#iframe-msg").html("");
	$("#gbx_overlay").remove();
}

function showSaveMsg(num, str, flag, change) {
	var str = str || _("Saving..."),
		flag = flag || "-1",
		hideDialog = true;

	$("#gbx_overlay").remove();
	$("<div id='gbx_overlay'></div>").appendTo("body");
	if (num == 0) {
		$("#page-message").html(str);
		$(".save-msg").removeClass("none");
		if (flag == "-1") { //常用 
			setTimeout(function () {
				$(".save-msg").addClass("none");
				$("#gbx_overlay").remove();
			}, 2000);
		} else if (flag == "1") { //复制
			$(".save-loading").addClass("hidden");
			setTimeout(function () {
				$(".save-msg").addClass("none");
				$("#gbx_overlay").remove();
				$(".save-loading").removeClass("hidden");
			}, 1000);
		} else if (flag == 2) { //加入黑名单
			//$("#gbx_overlay").remove();
			setTimeout(function () {
				$(".save-msg").addClass("none");
				$(".main-dailog").removeClass("none");
			}, 2000);
		} else if (flag == 3) {
			//针对禁止wifi和加入黑名单，等待1秒后再获取数据
			setTimeout(function () {
				top.mainPageLogic.modelObj = "staInfo";
				top.staInfo.initValue();
				$(".save-msg").addClass("none");
				$("#gbx_overlay").remove();
			}, 1000);

		} else if ((/^([1-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){2}([1-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])$/).test(flag)) {
			//修改LAN
			//改变LAN
			if (change) {
				setTimeout(function () {
					jumpTo(flag, function () {
						$(".save-msg").addClass("none");
						$(".main-dailog").removeClass("none");
						$("#gbx_overlay").remove();
					});
					//top.location.href = "http://" + flag;
				}, 20000);
			} else {
				setTimeout(function () {
					$(".save-msg").addClass("none");
					$("#gbx_overlay").remove();
				}, 2000);
			}

		} else if (flag == 4) {
			//智能QoS测速中	
			if (str == _("Saved")) {
				getCloudInfo()
			} else {
				checkBandWidth();
			}
		} else if (flag == 5) { //外网设置耗时 5 秒
			hideDialog = false;
			/*setTimeout(function () {
				$(".save-msg").addClass("none");
				$("#gbx_overlay").remove();
			}, 4000);*/
		}
	} else if (num == "999") {
		hideDialog = false; //不隐藏弹出框
		$(".save-msg").removeClass("none");
		$("#page-message").html(_("Not saved!"));
		$("#page-message").addClass("none");
		top.location.reload(true);
	} else {
		$(".save-msg").removeClass("none");
		$("#page-message").html(_("Not saved!"));
		setTimeout(function () {
			$(".save-msg").addClass("none");
			$("#gbx_overlay").remove();
		}, 1000);
	}
	if (hideDialog) {
		$(".main-dailog").addClass("none");
	}
}

function getCloudInfo() {

	$.GetSetData.getJson("goform/cloud?module=getInfo&rand=" + new Date().toTimeString(), function (obj) {

		if (!obj.password) {
			//无密码需要自动生成密码
			obj.password = str_encode(randomString());
		}
		var str = "ucloud_enable=" + obj.enable + "&password=" + obj.password + "&speed_dir=1"; //1：下行，0：上行
		//不管是否开启云服务，都将数据传给后台，如果
		//if(confirm("测速期间网络将断开，是否继续？")) {

		$.post("goform/SetSpeedWan", str, function () {
			showSaveMsg(0, "正在测试下载速度", 4);
		});

		//}

	});
}


/***********************
	*重启、升级、恢复出厂设置、还原等操作
	*str: 操作的动作 
	
**********************/
var pc = 0;
var upgradeTime = 0,
	rebootTime = 0;
(function ($) {
	$.progress = {
		showPro: function (str, str2, ip) {
			closeIframe();
			str2 = str2 || _("Rebooting...please wait...");
			ipaddress = "";
			ipaddress = ip || "";
			if ($("#gbx_overlay").length == 0) {
				$("<div id='gbx_overlay'></div>").appendTo("body");
			}
			var html = '<div id="loading_div" >' +
				'<div id="up_contain">' +
				'<span class="upgrading"><span class="upgrade_pc"></span></span><br />' + ("Upgrading...DO NOT remove the power supply.") + '<span id="upgrade_text"></span>' +
				'</div>' +
				'<div class="load-img"><span id="load_pc" class="up-loadding load-reboot"></span></div><br />' + str2 + '<span id="load_text"></span>' +
				'</div>';
			$(html).appendTo("body");
			$this_obj = $("#loading_div")
			$("#loading_div").css("left", ($.viewportWidth() - $this_obj.width()) / 2);
			$("#loading_div").css("top", ($.viewportHeight() - $this_obj.height()) / 2);
			$this_obj.css("z-index", 3000);
			$this_obj.css("position", "absolute");
			switch (str) {
			case "upgrade":
				$("#up_contain").addClass("none");
				rebooting(1450);
				break;
			case "reboot":
				$("#up_contain").addClass("none");
				rebooting(550);
				break;
			case "apclient":
				$("#up_contain").addClass("none");
				rebooting(750);
				break;
			case "restore":
			case "restoreDefault":
				$("#up_contain").addClass("none");
				rebooting(650);
				break;
			}
		}
	}
})(jQuery);

function rebooting(time) {
	time = time || 200;
	if (pc <= 100) {
		clearTimeout(rebootTime);
		rebootTime = setTimeout('rebooting(' + time + ')', time);
		//$(".load_pc").css("width", pc+'%');
		$("#load_pc").attr("class", "up-loadding load-reboot");
		$("#load_text").html(pc + '%');
		pc++;
	} else {
		clearTimeout(rebootTime);
		pc = 1;
		if (ipaddress != "" && (/^([1-9]|[1-9]\d|1\d\d|2[0-1]\d|22[0-3])\.(([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){2}([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])$/).test(ipaddress) == true || ipaddress == "tendawifi.com") {
			jumpTo(ipaddress, function () {
				$("#gbx_overlay").remove();
				$("#loading_div").remove();
			});
		} else {
			jumpTo(window.location.host, function () {
				$("#gbx_overlay").remove();
				$("#loading_div").remove();
			});
		}
	}
}

//跳转，用于重启之后，升级之后，恢复出厂设置，修改lanip的跳转
//使用到jsonp
function jumpTo(address, callback) {
	var checkRebootT = setInterval(function () {
		$.ajax({
			type: "get",
			url: "http://" + address + "/goform/getRebootStatus",
			dataType: "jsonp",
			jsonp: "callback", //传递给请求处理程序或页面的，用以获得jsonp回调函数名的参数名(一般默认为:callback)
			jsonpCallback: "flightHandler", //自定义的jsonp回调函数名称，默认为jQuery自动生成的随机函数名，也可以写"?"，jQuery会自动为你处理数据
			success: function (json) {
				(typeof callback == "function") && callback();
				clearInterval(checkRebootT);
				if (address == window.location.host) {
					top.location.reload(true);
				} else {
					top.location.href = "http://" + address;
				}
			}
		});
	}, 3000);
}

function isTimeout(str) {
	if (str.indexOf("<!DOCTYPE") != -1) {
		top.location.reload(true);
		return false;
	}
	return true;
}

function randomString() {
	var len = 8;
	var $chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	var maxPos = $chars.length;
	var pwd = '';
	for (i = 0; i < len; i++) {
		pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
	}

	return pwd;
}


function str_decode(str) {
	return utf8to16(base64decode(str))
}

function str_encode(str) {
	return base64encode(utf16to8(str));
}

function utf8to16(str) {
	var out, i, len, c;
	var char2, char3;

	out = "";
	len = str.length;
	i = 0;
	while (i < len) {
		c = str.charCodeAt(i++);
		switch (c >> 4) {
		case 0:
		case 1:
		case 2:
		case 3:
		case 4:
		case 5:
		case 6:
		case 7:
			// 0xxxxxxx
			out += str.charAt(i - 1);
			break;
		case 12:
		case 13:
			// 110x xxxx   10xx xxxx
			char2 = str.charCodeAt(i++);
			out += String.fromCharCode(((c & 0x1f) << 6) | (char2 & 0x3f));
			break;
		case 14:
			// 1110 xxxx  10xx xxxx  10xx xxxx
			char2 = str.charCodeAt(i++);
			char3 = str.charCodeAt(i++);
			out += String.fromCharCode(((c & 0x0f) << 12) |
				((char2 & 0x3f) << 6) |
				((char3 & 0x3f) << 0));
			break;
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

function base64decode(str) {
	var c1, c2, c3, c4;
	var i, len, out;

	len = str.length;

	i = 0;
	out = "";
	while (i < len) {

		do {
			c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
		} while (i < len && c1 == -1);
		if (c1 == -1)
			break;


		do {
			c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
		} while (i < len && c2 == -1);
		if (c2 == -1)
			break;

		out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));


		do {
			c3 = str.charCodeAt(i++) & 0xff;
			if (c3 == 61)
				return out;
			c3 = base64DecodeChars[c3];
		} while (i < len && c3 == -1);
		if (c3 == -1)
			break;

		out += String.fromCharCode(((c2 & 0xf) << 4) | ((c3 & 0x3c) >> 2));


		do {
			c4 = str.charCodeAt(i++) & 0xff;
			if (c4 == 61)
				return out;
			c4 = base64DecodeChars[c4];
		} while (i < len && c4 == -1);
		if (c4 == -1)
			break;
		out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
	}
	return out;
}

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


var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var base64DecodeChars = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
	52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
	15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
	41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1
);

/*检查IP 掩码的合法性*/
function checkIsVoildIpMask(ipElem, maskElem) {
	var ip,
		mask,
		ipArry,
		maskArry,
		len,
		maskArry2 = [],
		netIndex = 0,
		netIndex1 = 0,
		broadIndex = 0,
		i = 0;


	ip = ipElem;
	mask = maskElem;

	ipArry = ip.split(".");
	maskArry = mask.split(".");
	len = ipArry.length;

	for (i = 0; i < len; i++) {
		maskArry2[i] = 255 - Number(maskArry[i]);
	}

	for (var k = 0; k < 4; k++) { // ip & mask
		if ((ipArry[k] & maskArry[k]) == 0) {
			netIndex1 += 0;
		} else {
			netIndex1 += 1;
		}
	}
	for (var k = 0; k < 4; k++) { // ip & 255 - mask
		if ((ipArry[k] & maskArry2[k]) == 0) {
			netIndex += 0;
		} else {
			netIndex += 1;
		}
	}

	if (netIndex == 0 || netIndex1 == 0) {
		return;
	} else {
		return _("请输入一个IP网段");
	}
}

//usb容量条
(function ($) {
	var create = function (ele, percent, width, showTxt) {
		$(ele).addClass("progress-bar");
		ele.innerHTML = "<span class='progress-btm'></span><p class='progress-txt'></p>";
		ele.style.width = width + "px";
		setTimeout(function () {
			setPercent(ele, percent, showTxt);
		}, 10);

	}
	var setPercent = function (ele, percent, showTxt) {
		var showTxt = showTxt ? showTxt : percent + "%";
		if (/\.\d{3,}/.test(percent.toString())) {
			percent = Math.ceil(percent * 100) / 100;
		}
		$(ele).find(".progress-btm").css("width", percent + "%");
		/*if(percent>100){
		    $(ele).find(".progress-btm").after("<span class='progress-txt'>"+showTxt+"</span>");
		}else{
		    if(percent>98){
		        $(ele).find(".progress-btm").css("border-radius","4px").html("<span class='progress-txt'>"+showTxt+"</span>");
		    }else{
		        $(ele).find(".progress-btm").css("border-radius","4px 0 0 4px").html("<span class='progress-txt'>"+showTxt+"</span>");
		    }
		}*/
		$(ele).find(".progress-txt").html(showTxt);
	}

	$.fn.toProgress = function (percent, width, showTxt) {
		var percent = percent ? (parseFloat(percent) <= 100 && parseFloat(percent) >= 0 ? parseFloat(percent) : 0) : 0,
			width = width ? (parseInt(width) > 30 ? parseInt(width) : 100) : 100;
		this.each(function () {
			create(this, percent, width, showTxt);
			var that = this;
		});
		return this;
	}
})($);


/**
 * 定时刷新类 by zzc
 * 约定是返回json数据
 * @method startUpdate 开始更新 创建对象后自动调用一次
 * @method stopUpdate 停止更新
 */
function AjaxInterval(options) {
	var defaults = {
			url: "", //更新数据的url
			data: "", //更新数据的url附带数据
			successFun: null, //更新成功的回调
			errorFun: null, //更新异常（网络问题）的回调
			gapTime: -1 //更新间隔时间
		},
		nextT = 1,
		handling = false,
		stop = false,
		errorWaitTime = 2000;

	options = $.extend(defaults, options);

	function update() {
		if (handling || stop) {
			return;
		}
		clearTimeout(nextT);
		handling = true;
		$.ajax({
			"type": "get",
			"url": options.url + "?" + Math.random(),
			"data": "",
			"success": function (data) {
				if (data.indexOf("<!DOCTYPE") != -1) {
					window.location.reload(true);
					return false;
				}

				data = $.parseJSON(data);

				var goOnUpdate = options.successFun(data);
				if (goOnUpdate == "-1") {
					stop = true;
				}
				handling = false;
				if (!stop)
					if (options.gapTime != -1) {
						nextT = setTimeout(update, options.gapTime);
					}
			},
			"error": function (a, b, errorThrown) {
				options.failFun && options.failFun();
				handling = false;
				if (!stop)
					if (options.gapTime != -1) {
						nextT = setTimeout(update, options.gapTime);
					}
			}
		});
	}
	update();

	this.startUpdate = function () {
		stop = false;
		update();
	}
	this.stopUpdate = function () {
		stop = true;
	}
}


/**
 * jq自动纠错插件 by zzc
 * 在输入框元素keyup blur的时候纠错
 */
!(function () {
	var corrector = {
		ip: function (str) {
			var curVal = str,
				ipArr;
			curVal = curVal.replace(/([^\d\.]|\s)/g, "");

			ipArr = curVal.split(".");
			$.each(ipArr, function (i, ipPart) {
				ipArr[i] = (ipArr[i] == "" ? "" : parseInt(ipPart, 10));
			});
			return ipArr.join(".");
		},
		mac: function (str) {
			var curVal = str;
			curVal = curVal.replace(/([^\d\:a-fA-F]|\s)/g, "");
			return curVal;
		},
		num: function (str) {
			var curVal = str;
			curVal = curVal.replace(/([^\d]|\s)/g, "");
			return isNaN(parseInt(curVal, 10)) ? "" : parseInt(curVal, 10) + "";
		},
		float: function (str) {
			var curVal = str;
			curVal = curVal.replace(/([^\d\.]|\s)/g, "");
			if (/\./.test(curVal)) {
				var split = curVal.split(".");
				curVal = split[0] + ".";
				split.shift();
				curVal += split.join("");
			}
			return curVal;
		}
	}
	$.fn.inputCorrect = function (type) {
		this.each(function () {
			$(this).on("keyup blur", function () {
				if (this.value == "") return;
				var newVal = corrector[type](this.value);
				if (newVal != this.value) {
					this.value = newVal;
				}
			});
		});
		return this;
	}
})();

//判断时间是否重叠, 传入的是整型 如16:30 ---> 数字 1630
function isTimeOverlaping(timeAStart, timeAEnd, timeBStart, timeBEnd) {
	timeAStart = parseInt(timeAStart, 10);
	timeAEnd = parseInt(timeAEnd, 10);
	timeBStart = parseInt(timeBStart, 10);
	timeBEnd = parseInt(timeBEnd, 10);

	if (timeAStart > timeAEnd && timeBStart > timeBEnd) {
		return true;
	} else if (timeAStart > timeAEnd) {
		return !(timeAStart >= timeBEnd && timeAEnd <= timeBStart);
	} else if (timeBStart > timeBEnd) {
		return !(timeBStart >= timeAEnd && timeBEnd <= timeAStart);
	} else {
		return !(timeAStart >= timeBEnd || timeAEnd <= timeBStart);
	}
}


$.GetSetData = {
	getData: function (url, handler) {
		if (url.indexOf("?") < 0) {
			url += "?" + Math.random();
		}
		$.ajax({
			url: url,
			cache: false,
			type: "get",
			dataType: "text",
			async: true,
			success: function (data, status) {
				if (data.indexOf("<!DOCTYPE") != -1) {
					window.location.reload(true);
					return false;
				}

				if(data === "") {
					alert(_("Please exit your security suite to display this webpage normally."));
				}

				if (typeof handler == "function") {
					handler.apply(this, arguments);
				}
			},
			error: function (msg, status) {
				if (typeof handler == "function") {
					//handler.apply(this, arguments);
				}
			},
			complete: function (xhr) {
				xhr = null;
			}
		});

	},

	getJson: function (url, handler) {
		this.getData(url, function (data) {
			handler($.parseJSON(data));
		});
	},

	setData: function (url, data, handler) {
		$.ajax({
			url: url,
			cache: false,
			type: "get",
			dataType: "text",
			async: true,
			data: data,
			success: function (data) {
				if (data.indexOf("<!DOCTYPE") != -1) {
					window.location.reload(true);
					return false;
				}
				if ((typeof handler).toString() == "function") {
					handler(data);
				}
			}
		});
	}
};