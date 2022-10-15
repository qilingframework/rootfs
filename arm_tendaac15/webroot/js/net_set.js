var G = {};
//网络状态，外网设置要用到的联网状态
var statusTxtObj = {
	/*
	第一位传给页面判断是否有断开操作(1,可断开2没有断开)
	第二位传给页面显示颜色(1表示错误颜色、2表示尝试颜色、3表示成功颜色)
	第三位是否连接上(0表示未连上， 1表示连上)既是否显示联网时长
	第四位表示工作模式(0表示AP,1表示WISP,2表示APClient)
	第五位表示WAN口类型(0表示DHCP,1表示static IP,2表示PPPOE)
	第六位和第七位表示错误代码编号
	*/
	/***********AP*********/
	//DHCP
	"1": _("There is no Ethernet cable on the WAN port. Please check and insert the Ethernet cable into WAN port."),
	"2": _("Disconnected"),
	"3": _("Connecting..."),//(之前在1203里面这个状态表示保存了数据但是没有连接上去的情况下提示的，保留之前的)"
	"4": _("Connected…Accessing the Internet…"),
	"5": _("Disconneted. Please contact your ISP!"),
	"6": _("Connected…Accessing the Internet…"),
	"7": _("Connected! You can surf the Internet."),
	//静态：
	"101": _("There is no Ethernet cable on the WAN port. Please check and insert the Ethernet cable into WAN port."),
	"102": _("Disconnected"),
	"103": _("Connecting…Detecting the Internet…"),//(之前在1203里面这个状态表示保存了数据但是没有连接上去的情况下提示的，保留之前的)"
	"104": _("Connected…Accessing the Internet…"), 
	"105": _("Disconneted. Please contact your ISP!"),
	"106": _("Connected…Accessing the Internet…"),
	"107": _("Connected! You can surf the Internet."),
	//PPPOE
	"201": _("There is no Ethernet cable on the WAN port. Please check and insert the Ethernet cable into WAN port."),
	"202": _("Disconnected"),
	"203": _("Checking your Username and Password. Please wait..."),
	"204": _("Dial-up Successfully!"),
	"205": _("Fail to check the username and password."),
	"206": _("No response from the remote server. Please check whether you can access the Internet using your Modem, if the problem persists, contact your local Internet Service Provider for help."),
	"207": _("Disconneted. Please contact your ISP!"),
	"208": _("Connecting..."),
	"209": _("Connected! You can surf the Internet."),
	/************WISP**************/
	//DHCP 
	"1001": _("No bridge yet in WISP mode."),
	"1002": _("No bridge yet in WISP mode."),
	"1003": _("Bridging in WISP mode…"),
	"1004": _("Bridged successfully in WISP mode. Trying accessing the Internet…"),
	"1005": _("Disconneted. Please contact your ISP!"),
	"1006": _("Bridged successfully in WISP mode. Trying accessing the Internet…"),
	"1007": _("Connected! You can surf the Internet."),
	//静态 
	"1101": _("No bridge yet in WISP mode."),
	"1102": _("No bridge yet in WISP mode."),
	"1103": _("Bridging in WISP mode…"),
	"1104": _("Bridged successfully in WISP mode. Trying accessing the Internet…"),
	"1105": _("Disconneted. Please contact your ISP!"),
	"1106": _("Bridged successfully in WISP mode. Trying accessing the Internet…"),
	"1107": _("Connected! You can surf the Internet."),
	//APClinet
	"2001": _("No bridge yet in Universal Repeater mode."),
	"2002": _("Bridging in Universal Repeater mode…"),
	"2003": _("Bridged successfully in Universal Repeater mode.")
};


$(function () {
	//initHtml();
	//getValue();
	//initEvent();
	netInfo.init();
	top.loginOut();
	top.$(".main-dailog").removeClass("none");
	top.$(".save-msg").addClass("none");
});

function callback(str) {
	if (!top.isTimeout(str)) {
		return;
	}
	var num = $.parseJSON(str).errCode;
	top.showSaveMsg(num);
}


netInfo = {
	loadding: false,
	time : 0,
	isConnect: false,//是否已经连上，既按钮是连接还是断开
	hasConnTime: false,//是否有联网时长
	saveType: "",//操作类型，是连接（connect）还是断开（disconnect）
	currentWanType: 0,
	ajaxInterval: null,
	initObj: null,
	saving: false,//保存中，连接中或断开中
	init: function () {
		if (!netInfo.loading) {
			$("#netWanType").on("change", netInfo.changeWanType);
			$("#pppoeDnsAuto").on("change", netInfo.changePppoeDnsType);
			$("#dhcpDnsAuto").on("change", netInfo.changeDhcpDnsType);
			$("#wan_submit").on("click", function () {
				if (!this.disabled)
				G.validate.checkAll();
			});
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
			$("#staticIp,#mask,#gateway,#dns1,#dns2").inputCorrect("ip");
			G.validate = $.validate({
				custom: function () {},

				success: function () {
					netInfo.preSubmit();
				},

				error: function (msg) {
					return;
				}
			});			
			netInfo.loading = true;
		}
		$("#adslUser").addPlaceholder(_("Enter the username your ISP gave you"));
		$("#adslPwd").addPlaceholder(_("Enter the password your ISP gave you"));
		$("#gateway").attr("data-options",'{"type":"ip","msg":"'+_("Please enter a correct gateway.")+'"}');
		$("#dns1").attr("data-options",'{"type":"ip","msg":"'+_("Please enter a correct preferred DNS Server.")+'"}');
		$("#dns2").attr("data-options",'{"type":"ip","msg":"'+_("Please enter a correct alternate DNS Server.")+'"}');

		$.GetSetData.getJson("goform/getWanParameters?" + Math.random(), function(obj) {
			$("#loadingTip").addClass("none");
			$("#netWrap").removeClass("none");
			//定时刷新器
			netInfo.initObj = obj;
			if (!netInfo.ajaxInterval) {
				netInfo.ajaxInterval = new AjaxInterval({
					url: "goform/getWanParameters",
					successFun: function(data) {netInfo.setValue(data);},
					gapTime: 5000
				});
			} else {
				netInfo.ajaxInterval.startUpdate();
			}

			//client+ap 不允许配置外网设置，隐藏配置内容
			if (obj.wl_mode == "apclient") {
				$("#internet-form").addClass("none");
				$("#notAllowTip").removeClass("none");
			} else {
				$("#internet-form").removeClass("none");
				$("#notAllowTip").addClass("none");
			}

			//wisp下没有pppoe拨号
			var wanOptStr = '<option value="0">' + _("DHCP") + '</option><option value="1">' + _("Static IP") + '</option>';
			if (obj.wl_mode != "wisp") {//wisp 隐藏pppoe选择框
				wanOptStr += '<option value="2">' + _(" PPPoE") + '</option>';
			}
			$("#netWanType").html(wanOptStr);
			
			$("#netWanType").val(obj.wanType);
			$("#static_ip input").val("");
			inputValue(obj);
			
			$("#adslUser").addPlaceholder(_("Enter the username your ISP gave you"));
			$("#adslPwd").addPlaceholder(_("Enter the password your ISP gave you"));

			netInfo.setValue(obj);
			netInfo.changeWanType();
			netInfo.changePppoeDnsType();
			netInfo.changeDhcpDnsType();
		});

	},
	setValue: (function() {
		var conTypeTxts = [_("DHCP"), _("Static IP"), _("PPPoE")],
			statusType = 1,//连接状态类型，1错误， 2尝试，3成功
			isConnect = 1,//是否接上（显示接入时长）0未接上 1接上 
			statusClasses = ["text-error", "text-warning", "text-success"];

		return function (obj) {

			//如果当前连接方式不是所选方式，不更新
			if (obj.wanType != $("#netWanType").val()) {
				netInfo.ajaxInterval.stopUpdate();
				return;
			}
			clearTimeout(netInfo.time);
			
			netInfo.currentWanType = obj["wanType"];


			//推荐连接方式
			if (conTypeTxts[parseInt(obj["outType"], 10)]) {
				$("#outType").html(conTypeTxts[parseInt(obj["outType"], 10)]);
				$("#net_recomend_wrap").removeClass("none");
			} else {
				$("#net_recomend_wrap").addClass("none");
			}
			
			//联网状态
			$("#connectStatus").html(statusTxtObj[parseInt(obj["connectStatus"].substr(obj["connectStatus"].length-4), 10) + ""]);
			
			statusType = parseInt(obj["connectStatus"].charAt(1), 10);
			$("#connectStatus").attr("class", statusClasses[statusType-1]);

			//联网时长
			isConnect = parseInt(obj["connectStatus"].charAt(2), 10);
			$("#connectTime").html(formatSeconds(obj["connectTime"]));
			if (isConnect == 1) {
				$("#connect_time").removeClass("none");
			} else {
				$("#connect_time").addClass("none");
			}
			netInfo.hasConnTime = (isConnect == 1? true: false);

			//状态码第一个决定按钮是连接还是断开
			netInfo.isConnect = (parseInt(obj["connectStatus"].charAt(0)) == 1? true: false);
			netInfo.changeWanType();
			netInfo.changePppoeDnsType();
			netInfo.changeDhcpDnsType();
		}
	})(),


	checkWanData: function () {
		var wan_type = $("#netWanType").val(),
			ip = $("#staticIp").val(),
			mask = $("#mask").val(),
			gw = $("#gateway").val(),
			dns1 = $("#dns1").val(),
			dns2 = $("#dns2").val(),
			ppoe_user = $("#adslUser").val(),
			ppoe_pwd = $("#adslPwd").val(),
			lanIp = $("#lanIp").val(),
			lanMask = $("#lanMask").val(),
			btn_val = $("#wan_submit").val();

		if (btn_val == _("Connect")) {
			if(wan_type == 0) {
				if($("#dhcpDnsAuto").val() == "0") {
					if($("#dhcpDns1").val() == $("#dhcpDns2").val()) {
						return _("DNS1 and DNS2 cannot be the same.");
					}
				}
			} else if (wan_type == 1) { //static IP

				//同网段判断
				if (checkIpInSameSegment(ip, mask, lanIp, lanMask)) {
					return _("%s and %s (%s) should not be in the same network segment.", [_("WAN IP"),_("LAN IP"),lanIp]);
				}
				if (netInfo.initObj.pptpSvrIp && checkIpInSameSegment(ip, mask, netInfo.initObj.pptpSvrIp, netInfo.initObj.pptpSvrMask)) {
					return _("%s and %s (%s) should not be in the same network segment.", [_("WAN IP"),_("PPTP Server IP"), netInfo.initObj.pptpSvrIp]);
				}
				
				// 决策： 访客网络网段冲突有后台处理
				/*if (netInfo.initObj.guestIp && checkIpInSameSegment(ip, mask, netInfo.initObj.guestIp, netInfo.initObj.guestMask)) {
					return _("%s and %s (%s) should not be in the same network segment.", [_("WAN IP"),_("Guest Network IP"), netInfo.initObj.guestIp]);
				}*/

				
				if (!checkIpInSameSegment(ip, mask, gw, mask)) {
					return _("Gateway and the IP address must be on the same network segment.");
				}
				if (ip == gw) {
					return _("The IP address and gateway cannot be the same.");
				}
				if (ip == dns1) {
					return _("The IP address and DNS1 cannot be the same.");
				}
				if (dns1 == dns2) {
					return _("DNS1 and DNS2 cannot be the same.");
				}

				var mask_arry = mask.split("."),
					ip_arry = ip.split("."),
					mask_arry2 = [],
					maskk,
					netIndex = 0,
					netIndexl = 0,
					bIndex = 0;
				if (ip_arry[0] == 127) {
					return _("The first number of the IP cannot be 127");
				}
				if (ip_arry[0] == 0 || ip_arry[0] >= 224) {
					return _("IP Address error!");
				}

				for (var i = 0; i < 4; i++) { // IP & mask
					if ((ip_arry[i] & mask_arry[i]) == 0) {
						netIndexl += 0;
					} else {
						netIndexl += 1;
					}
				}

				for (var i = 0; i < mask_arry.length; i++) {
					maskk = 255 - parseInt(mask_arry[i], 10);
					mask_arry2.push(maskk);
				}
				for (var k = 0; k < 4; k++) { // ip & 255-mask
					if ((ip_arry[k] & mask_arry2[k]) == 0) {
						netIndex += 0;
					} else {
						netIndex += 1;
					}
				}
				if (netIndex == 0 || netIndexl == 0) {
					return _("IP network segment is not allowed. Please enter a specific correct IP.");
				}
				for (var j = 0; j < 4; j++) { // ip | mask
					if ((ip_arry[j] | mask_arry[j]) == 255) {
						bIndex += 0;
					} else {
						bIndex += 1;
					}
				}

				if (bIndex == 0) {
					return _("Broadcast IP address is not allowed. Please enter a specific correct IP.");
				}

			} else if (wan_type == 2) { //pppoe
				if (ppoe_user == "" || ppoe_pwd == "") {
					return _("Please enter the ISP Username/Password");
				}
				
				if($("#pppoeDnsAuto").val() == "0") {
					if($("#pppoeDns1").val() == $("#pppoeDns2").val()) {
						return _("DNS1 and DNS2 cannot be the same.");
					}
				}
				/*if (netInfo.initObj.vpnClient == "1" && netInfo.initObj.vpnClientUser == ppoe_user) {
					return _("The username of ISP and PPTP/L2TP Client can not be the same!");
				}*/
			}
		}
	},

	preSubmit: function () {
		var subData,
			subObj;

		if ($("#wan_submit").val() == _("Connect")) {
			$("#connect").val(1);
			netInfo.saveType = "connect";
		} else {
			$("#connect").val(0);
			netInfo.saveType = "disconnect";
		}
		subData = $("#internet-form").serialize();
		subData = subData.replace("netWanType", "wanType");
		var msg = netInfo.checkWanData();
		if (msg) {
			showErrMsg("message-err", msg);
			return;
		}
		$.post("goform/WanParameterSetting?" + Math.random(), subData, netInfo.callback);
		$("#wan_submit")[0].disabled = true;
		$("#netWanType").prop("disabled", true);
		netInfo.saving = true;
	},


	callback: function (str) {
		if (!top.isTimeout(str)) {
			return;
		}

		var resultObj = $.parseJSON(str),
			num = resultObj.errCode,
			sleep_time = resultObj.sleep_time,
			isVpn = (sleep_time > 10? true: false),
			waitTime = -1,//连接或断开操作成功之后需要等待的时间
			minTime = 4;//连接或断开操作至少要花费的时间，

		if (num == 0) {
			showSaveMsg(num);
			$("#wan_submit").blur();
			netInfo.init();

		} else {
			showSaveMsg(num);
		}

		(function() {
			if (netInfo.saveType == "connect" && netInfo.hasConnTime && minTime <= 0) {
				//连接成功
				waitTime = 5;//非vpn多等5秒
				if (isVpn)
				waitTime = 10;//vpn多等10秒
			}
			if (netInfo.saveType == "disconnect" && !netInfo.isConnect && minTime <= 0) {
				waitTime = 0;
				//断开成功
				if (isVpn)
				waitTime = 5;//vpn多等5秒
			}

			if (sleep_time > 0 && waitTime == -1) {

				$("#wan_submit").val(_("Please Wait..."));
				sleep_time--;
				minTime--;
				setTimeout(arguments.callee, 1000);

			} else {
				if (isVpn) {
					//vpn 到了后台传过来的等待时间就页面可以操作了
					waitTime = (waitTime > sleep_time? sleep_time: (waitTime==-1? 0: waitTime));
				} else {
					//非vpn 到了后台传过来的等待时间且到了操作成功的等待时间，页面才可以操作
					waitTime = (waitTime==-1? 0: waitTime);
				}

				setTimeout(function() {
					$("#wan_submit")[0].disabled = false;
					$("#netWanType").prop("disabled", false);
					netInfo.saving = false;
					netInfo.changeWanType();					
				}, waitTime*1000);
			}		
		})();
	},

	changeWanType: function () {
		var wan_type = $("#netWanType").val(),
			btnTxts = [_("Connect"), _("Disconnect")],
			btnTxt = "";
		
		if (wan_type == 0) {
			$("#dhcp_set").removeClass("none");
			$("#static_ip, #ppoe_set").addClass("none");

		} else if (wan_type == 1) {
			$("#static_ip").removeClass("none");
			$("#ppoe_set, #dhcp_set").addClass("none");

		} else if (wan_type == 2) {
			$("#ppoe_set").removeClass("none");
			$("#static_ip, #dhcp_set").addClass("none");
		}

		if (netInfo.currentWanType == wan_type) {
			if (netInfo.isConnect) {
				$("#static_ip, #ppoe_set, #dhcp_set").addClass("none");
				btnTxt = btnTxts[1];
			} else {
				btnTxt = btnTxts[0];
			}
			$("#connect_message").removeClass("none");
			netInfo.ajaxInterval.startUpdate();
		} else {
			$("#connect_message").addClass("none");
			btnTxt = btnTxts[0];
			netInfo.ajaxInterval.stopUpdate();
		}

		if (!netInfo.saving) {
			$("#wan_submit").val(btnTxt);
		}

		top.initIframeHeight();
	},
	changePppoeDnsType: function() {
		var dns_set = $("#pppoeDnsAuto").val();
		switch (dns_set) {
			case "1":
				$("#pppoe-manual-wrapper").addClass("none");
				break;
			default:
				$("#pppoe-manual-wrapper").removeClass("none");
				break;
		}
		top.initIframeHeight();
	},

	changeDhcpDnsType: function() {
		var dns_set = $("#dhcpDnsAuto").val();
		switch (dns_set) {
			case "1":
				$("#dhcp-manual-wrapper").addClass("none");
				break;
			default:
				$("#dhcp-manual-wrapper").removeClass("none");
				break;
		}
		top.initIframeHeight();
	}
};