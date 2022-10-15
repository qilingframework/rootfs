var G = {
		menuChanging: false,
		iframeFlag: false,
		initPage: false,
		initYunFlag: false
	},
	mainPageLogic, staInfo, netInfo, advInfo, wrlInfo, sysInfo;

function PageModel(url, subUrl) {
	// 获取数据的方式
	this.method = 'ajax';
	this.getUrl = url;
	this.subUrl = subUrl;

	// 获取数据
	this.pGet = function (successCallback, errorCallback) {
		$.ajax({
			url: this.getUrl,
			cache: false,
			type: "GET",
			success: successCallback,
			error: errorCallback
		});
	};

	// 提交数据
	this.pSubmit = function (obj) {
		$.ajax({
			url: obj.url,
			type: "POST",
			data: obj.data,
			success: obj.callback
				//error: errorCallback
		});
	};
}

function PageView(modules) {
	this.modules = modules;

	// 初始化 页面视图
	this.init = function () {
		var len = this.module.length,
			i;

		// 循环初始各模块
		for (i = 0; i < len; i++) {
			this.module[i].initView();
			this.module[i].initControl();
		}
	};


	//获取页面元素数据
	//==========================================================================
	// 以元素 ID 来获取提交的值
	this.getVal = function (id) {
		return $('#' + id).val();
	};

	// 获取页面要提交的值， 有值返回对象，无这返回 null
	this.getSubmitData = function (data) {
		var ret = null;
		ret = data;
		return ret;
	};


	//页面元素显示相关
	//==========================================================================

	// 初始化页面最小高度
	this.initPageMiniHeight = function () {
		$('.main-section').css('min-height', ($.viewportHeight() - 20) + 'px');

		// IE 6 not support min-height
		// In IE 6 height the same as min-height
		if (typeof isIE6 !== "undefined") {
			$('.main-section, .nav').css('height', ($.viewportHeight() - 20) + 'px');
		}

	};

	// 总体数据验证错误时处理入口
	this.showInvalidError = function (msg) {
		$('#page-message').html(msg || ' ');
		return;
	};

	// 数据提交成功时处理入口
	this.showSuccessful = function (msg) {
		$('#page-message').html(msg);
		location.reload();
	};

	// 数据 提交失败时处理入口
	this.showError = function (msg) {
		$('#page-message').html(msg);
	};

	// 获取数据 失败时处理入口
	this.showGetError = function (msg) {
		$('#page-message').html(msg);
	};

	this.showChangeMenu = function ($active, targetTop, callBack) {
		$active.stop().animate({
			"top": targetTop
		}, 1000, "easeInOutExpo", callBack);
	};

	this.showChangePage = function ($active, hei, callBack) {
		$active.stop().animate({
			"margin-top": hei
		}, 1000, "easeInOutExpo", callBack);
	};

	this.scrollTo = function ($active, targetMarginTop, callBack) {
		$active.stop().animate({
			"margin-top": targetMarginTop
		}, 100, "easeInOutExpo", callBack);
	};

	this.showScrollEnd = function ($cur, hei, callBack) {
		$cur.animate({
			"margin-top": hei
		}, 300).animate({
			"margin-top": 0
		}, 300, callBack);
	}

	//页面元素事件事件监听
	//==========================================================================

	// 导航事件监听
	this.addNavHandler = function (callBack) {
		$('#main-nav a').on('click', function (e) {
			e.preventDefault();
		});

		$('#main-nav a').on('click.menu', callBack);
	};

	// 给提交按钮添加，回调函数
	this.addSubmitHandler = function (callBack) {
		$('#subBtn').on('click', function (e) {
			e.preventDefault();
			callBack.apply();
		});
	};
}

function PageLogic(pageView, pageModel) {

	this.modelObj = "";
	// 给页面添加全局数据验证
	this.validate = $.validate({
		custom: function () {
			var returnVal;
			if (window[mainPageLogic.modelObj].checkValidate) {
				returnVal = window[mainPageLogic.modelObj].checkValidate(); //模块数据验证
			}

			if (returnVal != true) {
				return returnVal;
			}
		},

		success: function () {
			//var data = pageView.getSubmitData();
			var subObj = window[mainPageLogic.modelObj].preSubmit(); //数据提交
			if (subObj) {
				pageModel.pSubmit(subObj);
			}
		},

		error: function (msg) {
			pageView.showInvalidError(msg);
		}
	});

	this.initModule = function (id) {
		var menus = {
			"system-status": 'staInfo',
			"internet-setting": 'netInfo',
			"wireless-setting": "wrlInfo",
			"guest-setting": "guestInfo",
			"power-setting": "powerInfo",
			"usb-setting": "usbInfo",
			"vpn-setting": "vpnInfo",
			"advance": "advInfo",
			"system": "sysInfo"
		};
		mainPageLogic.modelObj = menus[id];
		//清空错误信息
		$(".validatebox-invalid").each(function () {
			this['data-check-error'] = false;
			$(this).removeClass("validatebox-invalid");
		});
		//$(".validatebox-invalid").removeClass("validatebox-invalid");
		$(".validatebox-tip").parent().remove();
		$.validate.utils.errorNum = 0;
		$.validateTipId = 0;

		window[menus[id]].init();
		G.initPage = true;

		//点击菜单。检查是否要跳到登录页面(检查开销比较小的定时重启接口，看是否返回登录页面)
		$.GetSetData.getData("goform/GetSysAutoRebbotCfg?" + Math.random(), function callback(str) {
			if (str.indexOf("<!DOCTYPE") != -1) {
				location.reload(true);
			}
		});
	}

	this.changeMenu = function (curId, targetId) {

		// 如果在同一菜单, 直接放回不做其他操作
		if (curId === targetId) {
			return;
		}

		var menus = {
				"system-status": 0,
				"internet-setting": 1,
				"wireless-setting": 2,
				"guest-setting": 3,
				"power-setting": 4,
				"usb-setting": 5,
				"vpn-setting": 6,
				"advance": 7,
				"system": 8,
				"other": 9
			},
			$cur = $('#' + curId),
			$target = $('#' + targetId),
			curHeight = $cur.height(),
			targetPageTop, targetMenuTop;

		G.menuChanging = true;

		// 初始化模块
		this.initModule(targetId);

		// 向 上 切换页面
		if (menus[curId] > menus[targetId]) {
			$target.addClass('active');
			$target.css('margin-top', '-' + $target.height() + 'px');

			targetPageTop = 0;

			// 向 下 却换页面
		} else if (menus[curId] < menus[targetId]) {
			$target.addClass('active');
			$target.css('margin-top', '0px');
			targetPageTop = -curHeight;
			$target = $cur;
		}

		// 却换页面内容动画
		pageView.showChangePage($target, targetPageTop, function () {
			G.menuChanging = false;
			$cur.removeClass('active');
		});

		// 却换左边菜单样式或动画
		targetMenuTop = $("#main-nav a").eq(menus[targetId]).offset().top + 13;

		pageView.showChangeMenu($("#main-nav-label"), targetMenuTop, function () {
			$('#main-nav li').eq(menus[curId]).removeClass('active');
			$('#main-nav li').eq(menus[targetId]).addClass('active');
		});
		//window.location.hash = "#-" + targetId;
	};

	this.scorllPageUptoEndNum = 0;
	this.scorllPageDowntoEndNum = 0;
	this.scorllPage = function ($active, dir, targetId) {
		var viewHeight = $.viewportHeight(),
			curMarginTop = parseInt($active.css('margin-top'), 10),
			curHeight = $active.height(),
			difHeight = curHeight - viewHeight,
			targetMarginTop;

		if ((curMarginTop === 0 && dir === 'up') ||
			(dir === 'down' && curMarginTop === -difHeight)) {

			if (this.scorllPageUptoEndNum < 2 && this.scorllPageDowntoEndNum < 2) {
				if (curMarginTop === 0 && dir === 'up') {
					this.scorllPageUptoEndNum += 1;
					this.scorllPageDowntoEndNum = 0;
				} else if (dir === 'down' && curMarginTop === -difHeight) {
					this.scorllPageUptoEndNum = 0;
					this.scorllPageDowntoEndNum += 1;
				}
			} else {
				this.scorllPageUptoEndNum = 0;
				this.scorllPageDowntoEndNum = 0;
				this.changeMenu($active.attr('id'), targetId);
			}
			return;
		}

		if (dir === 'down') {
			targetMarginTop = curMarginTop - 120;
			targetMarginTop = (difHeight + targetMarginTop) > 0 ?
				targetMarginTop : -difHeight;

		} else if (dir === 'up') {
			targetMarginTop = curMarginTop + 120;

			targetMarginTop = targetMarginTop > 0 ?
				0 : targetMarginTop;
		}

		G.menuChanging = true;
		pageView.scrollTo($active, targetMarginTop, function () {
			G.menuChanging = false;
		});
	}

	// 实现最顶端或最底端回弹效果
	this.scorllEnd = function ($active, dir) {
		G.menuChanging = true;

		if (dir === 'down') {
			pageView.showScrollEnd($active, '-15%', function () {
				G.menuChanging = false;
			});
		} else if (dir === 'up') {
			pageView.showScrollEnd($active, '15%', function () {
				G.menuChanging = false;
			});
		}
	}

	this.onMenuClick = function (e) {
		var curId = $(".nav-list.active a")[0].href.split('#')[1],
			targetId = e.target.href.split('#')[1];

		if (curId == targetId) {
			this.initModule(targetId);
			return;
		}
		if (!G.menuChanging) {
			$(".nav-list.active").removeClass('active');
			$(e.target).parent().addClass('active');

			this.changeMenu(curId, targetId);
		}
	}

	this.onMousewheel = function (e, delta) {

		// 如果菜单切换中，不响应滚轮事件
		if (G.menuChanging) {
			return;
		}
		var dir = delta > 0 ? 'up' : 'down',
			wheelSpeed = Math.abs(delta),
			$curMenu = $(".nav-list.active"),
			curId = $curMenu.find('a')[0].href.split('#')[1],
			viewHeight = $.viewportHeight(),
			$cur = $('#' + curId),
			curHeight = $cur.height(),
			isScrollEnd = false,
			$targetMenu, targetId;

		// 滚轮向 上 滚
		if (delta > 0 && curId !== 'system-status') {
			$targetMenu = $curMenu.prev();

			// 滚轮向 下 滚
		} else if (delta < 0 && curId !== 'system') {
			$targetMenu = $curMenu.next();

			// 第一页且向上滚 或 最后一页且向下滚
		} else {
			$targetMenu = $curMenu;
			isScrollEnd = true;
		}
		targetId = $targetMenu.find('a')[0].href.split('#')[1];

		// 如果视窗高度 大于 当前页面高度，则执行页面却换
		if (viewHeight >= curHeight) {

			// 如果能有页面可以切换
			if (!isScrollEnd) {
				this.changeMenu(curId, targetId);
			}

			// 如果本页面还有内容没显示，则执行页面滚动
		} else {
			this.scorllPage($cur, dir, targetId);
		}
		// 如果滚动到尽头
		if (isScrollEnd) {
			this.scorllEnd($cur, dir);
		}
	}

	// 初始化页面
	this.init = function () {
		var that = this;

		// 先执行数据的获取，获取成功后执行 页面视图的初始化
		//pageModel.pGet(pageView.init, pageView.showGetError);

		if (!G.initPage) {
			var curId = "system-status";
			//var hashId = window.location.hash.replace("#-","");
			var hashId = "system-status";

			if ($("a[href=#" + hashId + "]").length != 0) {
				curId = hashId;
			}

			$("#main-nav li, .main-section").removeClass("active");
			$("a[href=#" + curId + "]").parents("li").addClass("active");
			$("#" + curId).addClass("active").css("margin-top", "0");
			/*setTimeout(function() {
				$("#main-nav-label").css("top",$("a[href=#"+curId+"]").offset().top + 13 + "px");
			},100);*/
			$("#main-nav-label").css("top", 73 + "px");


			this.initModule(curId);
			G.initPage = true;
		}

		pageView.addSubmitHandler(function (e) {
			that.validate.checkAll();
		});

		pageView.addNavHandler(function (e) {
			that.onMenuClick(e);
		});

		pageView.initPageMiniHeight();

		$("body").on('mousewheel', function (e, delta) {

			/*if (!G.iframeFlag) {
				that.onMousewheel(e, delta);
			}*/
			if ($("#gbx_overlay").length == 0 || $("#gbx_overlay").is(":hidden")) {
				that.onMousewheel(e, delta);
			}
		});

		$(window).resize(function () {
			pageView.initPageMiniHeight();
			initIframeHeight();
		});

		$(".iframe-close").off("click").on("click", closeIframe);
		closeIframe();
	};
}

$(function () {
	var getUrl = 'index.html',
		subUrl = 'subtest',
		mainPageModel = new PageModel(getUrl, subUrl),
		mainPageView = new PageView();

	mainPageLogic = new PageLogic(mainPageView, mainPageModel);
	mainPageLogic.init();
	//loginOut();

	//获取产品型号，显示或隐藏功能
	$.GetSetData.getJson("goform/getProduct" + "?" + Math.random(), function (obj) {
		if (obj.product == "f1203") {
			//F1203没有wifi信号增强功能
			$("#adv_power").addClass("none");
		} else {
			$("#adv_power").removeClass("none");
		}
	});
});

var G_colors = ['#f37239', '#f5ac3b', '#b2d33f', '#3da64b', '#5dcdde', '#0388c0', '#783594', '#b93e98',
	'#f7a37e', '#f8c97f', '#cde282', '#81c58a', '#96deea', '#5bb2d6', '#a77cb9', '#d181bc',
	'#fac7b0', '#fbdeb1', '#e0edb2', '#b1dbb7', '#beebf2', '#9acfe6', '#c9aed4', '#e3b2d6',
	'#fde3d7', '#fdeed8', '#f0f6d9', '#d8eddb', '#dff5f8', '#cde7f2', '#e4d7ea', '#f1d8ea'
];

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
	"3": _("Connecting..."), //(之前在1203里面这个状态表示保存了数据但是没有连接上去的情况下提示的，保留之前的)"
	"4": _("Connected…Accessing the Internet…"),
	"5": _("Disconneted. Please contact your ISP!"),
	"6": _("Connected…Accessing the Internet…"),
	"7": _("Connected! You can surf the Internet."),
	//静态：
	"101": _("There is no Ethernet cable on the WAN port. Please check and insert the Ethernet cable into WAN port."),
	"102": _("Disconnected"),
	"103": _("Connecting…Detecting the Internet…"), //(之前在1203里面这个状态表示保存了数据但是没有连接上去的情况下提示的，保留之前的)"
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

staInfo = {
	mouseOver: false,
	loading: false,
	checkBand: false,
	initObj: {},
	statusObj: null,
	time: "",
	init: function () {
		if (!staInfo.loading) {

			$("#blackList").on("click", function () {
				showIframe(_("Blacklist(%s)", [staInfo.statusObj.blackNum]), "filter_list.html", 570, 490);
			});

			$("#onlineList").on("click", function () {
				showIframe(_("Attached Devices (%s)", [staInfo.statusObj.clientNum]), "online_list.html", 800, 490);
			});


			$("#status_wl_more").on("click", function () {
				showIframe(_("Wireless Settings"), "wireless_ssid.html", 610, 490);
			});

			$("#status_wan_more").on("click", function () {
				if (staInfo.statusObj.wanStatus.charAt(3) != 2) //非apclient
					showIframe(_("Internet Settings"), "net_set.html", 620, 450);
			});

			$("#wanStatusTxtWrap").on("click", function () {
				var wanStatus = $("#wanStatus").val();
				staInfo.showWanStatusPicIframe(wanStatus);
			});

			//处理错误吗后几位为206的过长的状态信息
			$("#wanStatusTxtWrap").on("mouseenter", ".wan-status-detail-btn", function () {
				$(this).next().stop().fadeIn(200);
			}).on("mouseleave", ".wan-status-detail-btn", function () {
				$(this).next().stop().fadeOut(200);
			});


			var Msg = location.search.substring(1) || "0";
			if (Msg == 1) {
				mainPageLogic.changeMenu("system-status", "advance");
				return;
			}

			staInfo.loading = true;
		}
		staInfo.initValue();
	},

	showWanStatusPicIframe: function (wanStatus) {
		/*switch (parseInt(wanStatus)) {
			case 0:
				showIframe("WAN口未插网线", "wan_status.html", 610, 450, "wanStatus="+wanStatus);
				break;
		}*/
	},

	initValue: function () {
		if (mainPageLogic.modelObj == "staInfo") {
			clearTimeout(staInfo.time);
			staInfo.time = setTimeout("staInfo.initValue()", 2000);
		} else {
			clearTimeout(staInfo.time);
			return;
		}

		$.GetSetData.getJson("goform/GetRouterStatus", staInfo.setImage);
	},
	/*弹出页面后，取消循环取数据 ztt*/
	cancelValue: function () {
		mainPageLogic.modelObj = "";
	},

	setImage: function (obj) {
		var selectedOffset = 0,
			speed_unit,
			option = {},
			data = [];

		$(".row").removeClass("hidden");
		//data.push(["other",parseFloat(obj[len-1].surBandwidth)])
		//$("#deviceName").html(obj[len-1].deviceName);

		if (obj.wanStatus.charAt(1) == "3") { //已连接
			$(".status-wrap").addClass("internet-line-up").removeClass("internet-line-disable").removeClass("internet-line-connectting");
		} else if (obj.wanStatus.charAt(1) == "1") {
			$(".status-wrap").addClass("internet-line-disable").removeClass("internet-line-up").removeClass("internet-line-connectting");
		} else {
			$(".status-wrap").addClass("internet-line-connectting").removeClass("internet-line-up").removeClass("internet-line-disable");
		}

		if (obj.wanStatus.substr(obj.wanStatus.length - 4).charAt(0) == "2") {
			$("#deviceListWrap").addClass("none");
		} else {
			$("#deviceListWrap").removeClass("none");
			$("#clientNum").html(obj.clientNum);
			$("#blackNum").html(obj.blackNum);
		}


		if (!staInfo.statusObj || staInfo.statusObj.wanStatus != obj.wanStatus)
			staInfo.setWanStatus(obj);
		staInfo.setWlStatus(obj);
		//staInfo.setLineUp(obj);
		staInfo.statusObj = obj;
	},

	setLineUp: function (obj) {
		var lineupArr = obj.lineup.split("|");

		$.each(lineupArr, function (i, val) {
			if (val == "1") {
				$("#status-lineup-wrap li").eq(i).addClass("lineup");
			} else {
				$("#status-lineup-wrap li").eq(i).removeClass("lineup");
			}
		})
	},

	setWanStatus: function (obj) {

		$("#wanStatus").val(obj.wanStatus);

		//联网状态
		var statusTxt = "";
		if (parseInt(obj["wanStatus"].substr(obj["wanStatus"].length - 4), 10) + "" == "206") {
			statusTxt = _("No response from the remote server.") + "<a class='wan-status-detail-btn'>" + _("details ") + "</a><span class='wan-status-detail none'><div>" + _("Please check whether you can access the Internet using your Modem, if the problem persists, contact your local Internet Service Provider for help.") + "</div></span>";

		} else {
			statusTxt = statusTxtObj[parseInt(obj["wanStatus"].substr(obj["wanStatus"].length - 4), 10) + ""];
		}
		$("#status_wan_txt").html(statusTxt);

		var statusType = parseInt(obj["wanStatus"].charAt(1), 10),
			statusClasses = ["text-error", "text-warning", "text-success"];
		$("#status_wan_txt").attr("class", statusClasses[statusType - 1]);
	},

	setWlStatus: function (obj) {
		var secTxtArr = [_("Unencrypted"), _("Encrypted")];
		$(".status-wl-info").removeClass("none");
		if (obj.wl24gEn == "1") {
			$("#status_wl_info_txt .wl24g-name").html(obj.wl24gName).attr("title", obj.wl24gName);
			//$("#status_wl_info_txt .wl24g-sec").html(secTxtArr[parseInt(obj.wl24gsec, 10)]);
			//$("#status_wl_info_txt .wl24g-sec").removeClass("none");
		} else {
			//$("#status_wl_info_txt .wl24g-sec").addClass("none");
			$("#status_wl_info_txt .wl24g-name").html(_("Disabled"));
		}

		if (obj.wl5gEn == "1") {
			$("#status_wl_info_txt .wl5g-name").html(obj.wl5gName).attr("title", obj.wl5gName);
			//$("#status_wl_info_txt .wl5g-sec").html(secTxtArr[parseInt(obj.wl5gsec, 10)]);
			//$("#status_wl_info_txt .wl5g-sec").removeClass("none");
		} else {
			//$("#status_wl_info_txt .wl5g-sec").addClass("none");
			$("#status_wl_info_txt .wl5g-name").html(_("Disabled"));
		}

		if (obj.wl5gEn == "0" && obj.wl24gEn == "0") {
			//$(".status-wl-info").addClass("none");
			$("#status_wl_more").addClass("wireless-line-disable").removeClass("wireless-line-up");
		} else {
			//$(".status-wl-info").removeClass("none");
			$("#status_wl_more").removeClass("wireless-line-disable").addClass("wireless-line-up");
		}
	}
}

netInfo = {
	loadding: false,
	time: 0,
	isConnect: false, //是否已经连上，既按钮是连接还是断开
	hasConnTime: false, //是否有联网时长
	saveType: "", //操作类型，是连接（connect）还是断开（disconnect）
	currentWanType: 0,
	ajaxInterval: null,
	initObj: null,
	saving: false, //保存中，连接中或断开中
	init: function () {
		if (!netInfo.loading) {
			$("#netWanType").on("change", netInfo.changeWanType);

			$("#pppoeDnsAuto").on("change", netInfo.changePppoeDnsType);

			$("#dhcpDnsAuto").on("change", netInfo.changeDhcpDnsType);
			

			$("#wan_submit").on("click", function () {
				if (!this.disabled)
					mainPageLogic.validate.checkAll("internet-form");
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
			netInfo.loading = true;
		}

		$("#adslUser").addPlaceholder(_("Enter the username your ISP gave you"));
		$("#adslPwd").addPlaceholder(_("Enter the password your ISP gave you"));
		$("#gateway").attr("data-options", '{"type":"ip","msg":"' + _("Please enter a correct gateway.") + '"}');
		$("#dns1").attr("data-options", '{"type":"ip","msg":"' + _("Please enter a correct preferred DNS Server.") + '"}');
		$("#dns2").attr("data-options", '{"type":"ip","msg":"' + _("Please enter a correct alternate DNS Server.") + '"}');

		$.GetSetData.getJson("goform/getWanParameters?" + Math.random(), function (obj) {
			netInfo.initObj = obj;
			//定时刷新器
			if (!netInfo.ajaxInterval) {
				netInfo.ajaxInterval = new AjaxInterval({
					url: "goform/getWanParameters",
					successFun: function (data) {
						netInfo.setValue(data);
					},
					gapTime: 2000
				});
			} else {
				netInfo.ajaxInterval.startUpdate();
			}

			//wisp下没有pppoe拨号
			var wanOptStr = '<option value="0">' + _("DHCP") + '</option><option value="1">' + _("Static IP") + '</option>';
			if (obj.wl_mode != "wisp") { //wisp 隐藏pppoe选择框
				wanOptStr += '<option value="2">' + _(" PPPoE") + '</option>';
			}
			$("#netWanType").html(wanOptStr);

			$("#netWanType").val(obj.wanType);
			$("#static_ip input").val("");
			inputValue(obj);
			$("#adslUser").addPlaceholder(_("Enter the username your ISP gave you"));
			$("#adslPwd").addPlaceholder(_("Enter the password your ISP gave you"));


			//client+ap 不允许配置外网设置，隐藏配置内容
			if (obj.wl_mode == "apclient") {
				$("#notAllowTip").removeClass("none");
				$("#net_recomend_wrap, #connectStatusWrap, #connect_time").addClass("none");
				$("#wan_submit, #netWanType").prop("disabled", true);
				return;
			} else {
				$("#notAllowTip").addClass("none");
				if (!netInfo.saving)
					$("#wan_submit, #netWanType").prop("disabled", false);
			}
			netInfo.setValue(obj);
			netInfo.changeWanType();
			netInfo.changePppoeDnsType();
			netInfo.changeDhcpDnsType();
		});
	},
	setValue: (function () {
		var conTypeTxts = [_("DHCP"), _("Static IP"), _("PPPoE")],
			statusType = 1, //连接状态类型，1错误， 2尝试，3成功
			isConnect = 1, //是否接上（显示接入时长）0未接上 1接上 
			statusClasses = ["text-error", "text-warning", "text-success"];

		return function (obj) {

			//如果当前连接方式不是所选方式，不更新
			if (obj.wanType != $("#netWanType").val() || mainPageLogic.modelObj != "netInfo" || obj.wl_mode == "apclient") {
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
			$("#connectStatus").html(statusTxtObj[parseInt(obj["connectStatus"].substr(obj["connectStatus"].length - 4), 10) + ""]);

			statusType = parseInt(obj["connectStatus"].charAt(1), 10);
			$("#connectStatus").attr("class", statusClasses[statusType - 1]);
			$("#connectStatusWrap").removeClass("none");

			//联网时长
			isConnect = parseInt(obj["connectStatus"].charAt(2), 10);
			$("#connectTime").html(formatSeconds(obj["connectTime"]));
			setTimeout(function () {
				$("#connectTime").html(formatSeconds(parseInt(obj["connectTime"], 10) + 1))
			}, 1000);
			if (isConnect == 1) {
				$("#connect_time").removeClass("none");
			} else {
				$("#connect_time").addClass("none");
			}
			netInfo.hasConnTime = (isConnect == 1 ? true : false);

			//状态码第一个决定按钮是连接还是断开
			netInfo.isConnect = (parseInt(obj["connectStatus"].charAt(0)) == 1 ? true : false);

			/*//如果pptp客户端开启 已确认不做提示
			if (obj["vpnClient"] == 1) {
				$("#notAllowTip").removeClass("none").html(_("The system is accessing the Internet by using VPN access. Any change in the current page will make the VPN access failed."));
			} else {
				$("#notAllowTip").addClass("none").html("");
			}*/

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
					return _("%s and %s (%s) should not be in the same network segment.", [_("WAN IP"), _("LAN IP"), lanIp]);
				}
				if (netInfo.initObj.pptpSvrIp && checkIpInSameSegment(ip, mask, netInfo.initObj.pptpSvrIp, netInfo.initObj.pptpSvrMask)) {
					return _("%s and %s (%s) should not be in the same network segment.", [_("WAN IP"), _("PPTP Server IP"), netInfo.initObj.pptpSvrIp]);
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

		$("#wan_submit")[0].disabled = true;
		$("#netWanType").prop("disabled", true);
		netInfo.saving = true;

		subObj = {
			"data": subData,
			"url": "goform/WanParameterSetting?" + Math.random(),
			"callback": netInfo.callback
		}
		return subObj;
	},
	callback: function (str) {
		if (!top.isTimeout(str)) {
			return;
		}

		var resultObj = $.parseJSON(str),
			num = resultObj.errCode,
			sleep_time = resultObj.sleep_time,
			isVpn = (sleep_time > 10 ? true : false),
			waitTime = -1, //连接或断开操作成功之后需要等待的时间
			minTime = 4; //连接或断开操作至少要花费的时间，

		if (num == 0) {
			showSaveMsg(num);
			$("#wan_submit").blur();
			netInfo.init();

		} else {
			showSaveMsg(num);
		}

		(function () {
			if (netInfo.saveType == "connect" && netInfo.hasConnTime && minTime <= 0) {
				//连接成功
				waitTime = 5; //非vpn多等5秒
				if (isVpn)
					waitTime = 10; //vpn多等10秒
			}
			if (netInfo.saveType == "disconnect" && !netInfo.isConnect && minTime <= 0) {
				waitTime = 0;
				//断开成功
				if (isVpn)
					waitTime = 5; //vpn多等5秒
			}

			if (sleep_time > 0 && waitTime == -1) {

				$("#wan_submit").val(_("Please Wait..."));
				sleep_time--;
				minTime--;
				setTimeout(arguments.callee, 1000);

			} else {
				if (isVpn) {
					//vpn 到了后台传过来的等待时间就页面可以操作了
					waitTime = (waitTime > sleep_time ? sleep_time : (waitTime == -1 ? 0 : waitTime));
				} else {
					//非vpn 到了后台传过来的等待时间且到了操作成功的等待时间，页面才可以操作
					waitTime = (waitTime == -1 ? 0 : waitTime);
				}

				setTimeout(function () {
					$("#wan_submit")[0].disabled = false;
					$("#netWanType").prop("disabled", false);
					netInfo.saving = false;
					netInfo.changeWanType();
				}, waitTime * 1000);
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
	}
};

wrlInfo = {
	loading: false,
	data: null,
	init: function () {
		if (!wrlInfo.loading) {
			$("#wireless-setting .main-area").on("click", wrlInfo.getIframe);
			wrlInfo.loading = true;
		}
		wrlInfo.initValue();
	},

	getIframe: function () {
		var id = $(this).attr("id");
		switch (id) {
		case "wrl_ssid_pwd":
			showIframe(_("WiFi Name and Password"), "wireless_ssid.html", 610, 490);
			break;
		case "wrl_wifi_time":
			showIframe(_("WiFi Schedule"), "wifi_time.html", 610, 470);
			break;
		case "wrl_bridge":
			showIframe(_("Wireless Repeating"), "wisp.html", 700, 350);
			break;
		case "wrl_channel":
			showIframe(_("Channel & Bandwidth"), "wireless.html", 460, 480);
			break;
		case "wrl_signal":
			showIframe(_("WiFi Signal Conditioning"), "wifi_power.html", 435, 220);
			break;
		case "wrl_wps":
			showIframe("WPS", "wifi_wps.html", 600, 400);
			break;
		}
	},

	initValue: function () {
		$.GetSetData.getJson("goform/GetWrlStatus?" + Math.random(), wrlInfo.setValue);
	},
	setValue: function (obj) {
		wrlInfo.data = obj;
		if (obj.schedWifiEn == "1") {
			$("#wrl_wifi_time .function-status").html(_("Enable"));
		} else {
			$("#wrl_wifi_time .function-status").html(_("Disable"));
		}
		if (obj.wispEn == 0) {
			$("#wrl_bridge .function-status").html(_("Disable"));
			//$("#sys_lan_status").removeClass("disabled");
		} else if (obj.wispEn == 2) {
			//$("#sys_lan_status").addClass("disabled");
			$("#wrl_bridge .function-status").html(_("Connected"));
		} else {
			//$("#sys_lan_status").addClass("disabled");
			$("#wrl_bridge .function-status").html(_("Enable"));
		}

		$("#wrl_wps .function-status").html(obj.wpsEn == "1" ? _("Enable") : _("Disable"));
	}
};

guestInfo = {
	loading: false,
	initObj: null,
	init: function () {
		if (!guestInfo.loading) {
			$("#guest_submit").on("click", function () {
				if (!this.disabled)
					mainPageLogic.validate.checkAll("guest-form");
			});
			$("#guestEn").on("click", function () {
				if (guestInfo.initObj.wl_mode == "ap" && guestInfo.initObj.wl_en != "0") {
					guestInfo.changeBtnEn.call(this);
				}
			});

			guestInfo.loading = true;
		}
		guestInfo.initValue();
	},
	changeBtnEn: function () {
		var className = $(this).attr("class");
		if (className == "btn-off") {
			$(this).attr("class", "btn-on");
			$(this).val(1);
		} else {
			$(this).attr("class", "btn-off");
			$(this).val(0);
		}
	},
	initValue: function () {
		$.GetSetData.getJson("goform/WifiGuestGet?" + Math.random(), guestInfo.setValue);
	},
	setValue: function (obj) {
		guestInfo.initObj = obj;
		inputValue(obj);
		$("#guestEn").attr("class", (obj.guestEn == "1" ? "btn-off" : "btn-on"));
		guestInfo.changeBtnEn.call($("#guestEn")[0]);

		if (obj.wl_mode != "ap" || obj.wl_en != "1") {
			$("#guest_submit")[0].disabled = true;
			if (obj.wl_mode != "ap") {
				showErrMsg("guest_save_msg", _("The Wireless Reapter is enabled. This feature is not available."), true);
			} else if (obj.wl_en != "1") {
				showErrMsg("guest_save_msg", _("The Wireless feature is disabled. This feature is not available."), true);
			}
		} else {
			showErrMsg("guest_save_msg", "", true);
			$("#guest_submit")[0].disabled = false;
		}
	},
	checkValidate: function () {},
	preSubmit: function () {
		var subData,
			dataObj,
			subObj,
			callback,
			guestSecurity;

		guestSecurity = $("#wrlPwd").val() != "" ? "wpapsk" : "none";

		dataObj = {
			"guestEn": $("#guestEn").val(),
			"guestEn_5g": $("#guestEn").val(),
			"guestSecurity": guestSecurity,
			"guestSecurity_5g": guestSecurity,
			"guestSsid": $("#guestSsid").val(),
			"guestSsid_5g": $("#guestSsid_5g").val(),
			"guestWrlPwd": $("#guestWrlPwd").val(),
			"guestWrlPwd_5g": $("#guestWrlPwd").val()
		}
		subData = objTostring(dataObj);
		//subData = $("#wrl-form").serialize()+"&hideSsid=" + $("#hideSsid").val() + "&hideSsid_5g=" + $("#hideSsid_5g").val();
		//showErrMsg("wrl_save_msg", "无线将断开，请重新连接！");
		subObj = {
			"data": subData,
			"url": "goform/WifiGuestSet",
			"callback": guestInfo.callback
		};
		return subObj;
	},
	callback: function (str) {
		if (!top.isTimeout(str)) {
			return;
		}
		var num = $.parseJSON(str).errCode;
		showSaveMsg(num);
		if (num == 0) {
			$("#guest_submit").blur();
			guestInfo.initValue();
		}
	}
};

powerInfo = {
	loading: false,
	initObj: {},
	init: function () {
		if (!powerInfo.loading) {
			powerInfo.initHtml();
			$("#power_submit").on("click", function () {
				mainPageLogic.validate.checkAll("power-form");
			});
			$("#powerSavingEn").on("click", function () {
				if (powerInfo.initObj.wl_mode == "ap")
					powerInfo.changePowerEn.call(this);
			});
			$("#startHour,#startMin,#endHour,#endMin").on("change", powerInfo.changeTimeSet);
			powerInfo.loading = true;
		}
		powerInfo.initValue();
	},
	initHtml: function () {
		var hour_str = "",
			min_str = "",
			i = 0,
			k = 0;
		for (i = 0; i < 24; i++) {
			hour_str += "<option value='" + ((100 + i).toString()).slice(1, 3) + "'>" + ((100 + i).toString()).slice(1, 3) + "</option>";
		}
		for (k = 0; k < 60; k++) {
			min_str += "<option value='" + ((100 + k).toString()).slice(1, 3) + "'>" + ((100 + k).toString()).slice(1, 3) + "</option>";
		}
		$("#startHour").html(hour_str);
		$("#startMin").html(min_str);
		$("#endHour").html(hour_str);
		$("#endMin").html(min_str);
	},
	changePowerEn: function () {

		var className = $(this).attr("class");
		if (className == "btn-off") {
			$(this).attr("class", "btn-on");
			$("#power_time_set").removeClass("none");
			$("#power_save_delay_set").removeClass("none");
			$("#power_notice").addClass("none");
			$(this).val(1);
		} else {
			$(this).attr("class", "btn-off");
			$("#power_time_set").addClass("none");
			$("#power_save_delay_set").addClass("none");
			$("#power_notice").removeClass("none");
			$(this).val(0);
		}
	},
	changeTimeSet: function () {
		var startTimeMin = parseInt($("#startHour").val() * 60) + parseInt($("#startMin").val()),
			endTimeMin = parseInt($("#endHour").val() * 60) + parseInt($("#endMin").val()),
			totalTime = 0;

		if (startTimeMin > endTimeMin) {
			totalTime = 24 * 60 - startTimeMin + endTimeMin;
		} else {
			totalTime = endTimeMin - startTimeMin;
		}
		$("#power_save_tip").html(_("It can save %s kw·h every month as estimated.", [(totalTime * 10 / (24 * 60)).toFixed(2)]));
		return totalTime; //return total min;
	},
	initValue: function () {
		$.GetSetData.getJson("goform/PowerSaveGet?" + Math.random(), powerInfo.setValue);
	},
	setValue: function (obj) {
		(obj.timeUp == "1" ? $("#timeUpTip").addClass("none") : $("#timeUpTip").removeClass("none"));
		powerInfo.initObj = obj;
		inputValue(obj);
		$("#powerSavingEn").attr("class", (obj.powerSavingEn == "1" ? "btn-off" : "btn-on"));
		powerInfo.changePowerEn.call($("#powerSavingEn")[0]);

		$("#power_save_delay")[0].checked = (obj.powerSaveDelay == "1" ? true : false);
		var time = obj.time;

		$("#startHour").val(time.split("-")[0].split(":")[0]);
		$("#startMin").val(time.split("-")[0].split(":")[1]);
		$("#endHour").val(time.split("-")[1].split(":")[0]);
		$("#endMin").val(time.split("-")[1].split(":")[1]);

		powerInfo.changeTimeSet();

		if (obj.wl_mode != "ap") {
			showErrMsg("power-message-err", _("The Wireless Reapter is enabled. This feature is not available."), true);
			$("#timeUpTip").addClass("none");
			$("#power_submit")[0].disabled = true;
		} else {
			showErrMsg("power-message-err", "", true);
			$("#power_submit")[0].disabled = false;
		}
	},
	checkValidate: function () {},
	preSubmit: function () {
		var subData,
			dataObj,
			subObj,
			callback,
			powerSavingEn = $("#powerSavingEn").val();
		startHour = $("#startHour").val(),
			startMin = $("#startMin").val(),
			endHour = $("#endHour").val(),
			endMin = $("#endMin").val(),
			time = startHour + ":" + startMin + "-" + endHour + ":" + endMin;

		if (powerSavingEn == "1") {
			if (startHour == endHour && startMin == endMin) {
				showErrMsg("power-message-err", _("The start time and end time should not be the same."));
				return;
			}
			/*if (parseInt(powerInfo.changeTimeSet(), 10) <= 5) {
				showErrMsg("power-message-err", _("The total time of smart Power-save must be greater than 5 mins a day."));
				return;
			}*/

			//判断时间是否与智能led冲突
			if (powerInfo.initObj.ledTime) {
				var ledTimeStart = parseInt(powerInfo.initObj.ledTime.split("-")[0].replace(/[^\d]/g, ""), 10),
					ledTimeEnd = parseInt(powerInfo.initObj.ledTime.split("-")[1].replace(/[^\d]/g, ""), 10);
				if (isTimeOverlaping(ledTimeStart, ledTimeEnd, parseInt(startHour + "" + startMin, 10), parseInt(endHour + "" + endMin, 10))) {
					//重叠
					if (!window.confirm(_("The time period you set up in Power Saving(%s) overlaps with that in Smart LED(%s).During the overlapping time, the settings in Smart LED will be ineffective. Are you sure to save the settings?", [time, powerInfo.initObj.ledTime]))) {
						return;
					}
				}
			}

			//判断时间是否与wifi开关冲突
			if (powerInfo.initObj.wifiTime) {
				var wifiTimeStart = parseInt(powerInfo.initObj.wifiTime.split("-")[0].replace(/[^\d]/g, ""), 10),
					wifiTimeEnd = parseInt(powerInfo.initObj.wifiTime.split("-")[1].replace(/[^\d]/g, ""), 10);
				if (isTimeOverlaping(wifiTimeStart, wifiTimeEnd, parseInt(startHour + "" + startMin, 10), parseInt(endHour + "" + endMin, 10))) {
					//重叠
					if (!window.confirm(_("The time period you set up in Power Saving(%s) overlaps with that in WiFi Schedule(%s). During the overlapping time, the settings in WiFi Schedule will be ineffective. Are you sure to save the settings?", [time, powerInfo.initObj.wifiTime]))) {
						return;
					}
				}
			}

			dataObj = {
				"powerSavingEn": powerSavingEn,
				"time": startHour + ":" + startMin + "-" + endHour + ":" + endMin,
				"powerSaveDelay": $("#power_save_delay")[0].checked ? "1" : "0"
			}
		} else {

			dataObj = {
				"powerSavingEn": powerSavingEn,
				"time": powerInfo.initObj.time,
				"powerSaveDelay": powerInfo.initObj.powerSaveDelay
			}
		}


		subData = objTostring(dataObj);
		subObj = {
			"data": subData,
			"url": "goform/PowerSaveSet",
			"callback": powerInfo.callback
		};
		return subObj;
	},
	callback: function (str) {
		if (!top.isTimeout(str)) {
			return;
		}
		var num = $.parseJSON(str).errCode;
		showSaveMsg(num);
		if (num == 0) {
			$("#wrl_submit").blur();
			powerInfo.initValue();
		}
	}
};

usbInfo = {

	loading: false,
	data: null,
	init: function () {
		if (!usbInfo.loading) {
			$("#usb-setting .main-area").on("click", usbInfo.getIframe);
			usbInfo.loading = true;
		}
		//不需要获取数据
		//usbInfo.initValue();
	},
	initValue: function () {
		//$.GetSetData.getJson("goform/GetUSBStatus?" + Math.random(), usbInfo.setValue);
	},
	setValue: function (obj) {
		usbInfo.data = obj;
		if (obj.dlna == "0") {
			$("#usb_dlna .function-status").html(_("Disable"));
		} else {
			$("#usb_dlna .function-status").html(_("Enable"));
		}
		if (obj.printer == "0") {
			$("#usb_printer .function-status").html(_("Disable"));
		} else {
			$("#usb_printer .function-status").html(_("Enable"));
		}
	},
	getIframe: function () {
		var id = $(this).attr("id");
		switch (id) {
		case "usb_samba":
			showIframe(_("File Share"), "samba.html", 540, 450);
			break;
		case "usb_dlna":
			showIframe("DLNA", "dlna.html", 500, 240);
			break;
		case "usb_printer":
			showIframe(_("Printer Service"), "printer.html", 500, 240);
			break;
		}
	}

};
vpnInfo = {
	loading: false,
	data: null,
	init: function () {
		if (!vpnInfo.loading) {
			$("#vpn-setting .main-area").on("click", vpnInfo.getIframe);
			vpnInfo.loading = true;
		}
		vpnInfo.initValue();
	},
	initValue: function () {
		$.GetSetData.getJson("goform/GetVpnStatus?" + Math.random(), vpnInfo.setValue);
	},
	setValue: function (obj) {
		vpnInfo.data = obj;
		if (obj.server == "0") {
			$("#vpn_server .function-status").html(_("Disable"));
		} else {
			$("#vpn_server .function-status").html(_("Enable"));
		}
		if (obj.client == "0") {
			$("#vpn_client .function-status").html(_("Disable"));
		} else {
			$("#vpn_client .function-status").html(_("Enable"));
		}

	},
	getIframe: function () {
		var id = $(this).attr("id");
		switch (id) {
		case "vpn_server":
			showIframe(_("PPTP Server"), "pptp_server.html", 630, 510);
			break;
		case "vpn_client":
			showIframe(_("PPTP/L2TP Client"), "pptp_client.html", 500, 400);
			break;
		}
	}
};

advInfo = {
	loading: false,
	data: null,
	init: function () {
		if (!advInfo.loading) {
			$("#advance .main-area").on("click", advInfo.getIframe);

			advInfo.loading = true;
		}
		advInfo.initValue();
	},
	initValue: function () {
		$.GetSetData.getJson("goform/GetAdvanceStatus?" + Math.random(), advInfo.setValue);
	},
	setValue: function (obj) {
		advInfo.data = obj;

		if (obj.wl_mode == "apclient") {
			$("#adv_netcontrol, #adv_parental, #adv_remoteweb, #adv_ddns, #adv_upnp, #adv_virtualServer, #adv_dmz").addClass("disabled");
		} else {
			$("#adv_netcontrol, #adv_parental, #adv_remoteweb, #adv_ddns, #adv_upnp, #adv_virtualServer, #adv_dmz").removeClass("disabled");
		}

		if (obj.netControl == 0) {
			$("#adv_netcontrol .function-status").html(_("Disable"));
		} else {
			$("#adv_netcontrol .function-status").html(_("Enable"));
		}
		if (obj.led == 0) {
			$("#adv_led .function-status").html(_("Disable"));
		} else {
			$("#adv_led .function-status").html(_("Enable"));
		}

		if (obj.cloud == 0) {
			$("#adv_cloud .function-status").html(_("Disable"));
		} else {
			$("#adv_cloud .function-status").html(_("Enable"));
		}
		if (obj.remoteWeb == 0) {
			$("#adv_remoteweb .function-status").html(_("Disable"));
		} else {
			$("#adv_remoteweb .function-status").html(_("Enable"));
		}
		if (obj.ddns == 0) {
			$("#adv_ddns .function-status").html(_("Disable"));
		} else {
			$("#adv_ddns .function-status").html(_("Enable"));
		}
		if (obj.upnp == 0) {
			$("#adv_upnp .function-status").html(_("Disable"));
		} else {
			$("#adv_upnp .function-status").html(_("Enable"));
		}
		if (obj.iptv == 0) {
			$("#adv_iptv .function-status").html(_("Disable"));
		} else {
			$("#adv_iptv .function-status").html(_("Enable"));
		}
		
		if (obj.fastnatEn == 0) {
			$("#adv_fastNat .function-status").html(_("Disable"));
		} else {
			$("#adv_fastNat .function-status").html(_("Enable"));
		}
		
	},
	getIframe: function () {
		if ($(this).hasClass("disabled")) return;

		var id = $(this).attr("id");
		switch (id) {
		case "adv_parental":
			$(".fopare-ifmwrap-title").addClass("border-bottom");
			$("#head_title2").html(_("Clients in control")).removeClass("none");
			$("#head_title").html(_("Parental Control")).addClass("selected");
			showIframe(_("Parental Control"), "parental_control.html", 610, 200);
			break;
		case "adv_netcontrol":
			showIframe(_("Bandwidth Control"), "net_control.html", 720, 550);
			break;
		case "adv_led":
			showIframe(_("Smart LED"), "system_led.html", 560, 315);
			break;
		case "adv_cloud":
			showIframe(_("Tenda Cloud"), "cloud_managment.html", 620, 450);
			break;
		case "adv_remoteweb":
			showIframe(_("Remote Web Management"), "remote_web.html", 500, 475);
			break;
		case "adv_ddns":
			showIframe("DDNS", "ddns_config.html", 500, 410);
			break;
		case "adv_virtualServer":
			showIframe(_("Virtual Server"), "virtual_server.html", 630, 550);
			break;
		case "adv_dmz":
			showIframe(_("DMZ"), "dmz.html", 430, 350);
			break;
		case "adv_upnp":
			showIframe("UPnP", "upnp_config.html", 550, 300);
			break;
		case "adv_iptv":
			showIframe("IPTV", "iptv.html", 580, 510);
			break;
		case "adv_fastNat":
			showIframe(_("Fast Nat"), "fast_nat_switch.html", 630, 550);	
		}
		G.iframeFlag = true;
	}
};

sysInfo = {
	loading: false,
	data: null,
	init: function () {
		if (!sysInfo.loading) {
			$("#system .main-area").on("click", sysInfo.getIframe);
			var Msg = location.search.substring(1) || "0";
			if (Msg == "1") {
				showIframe(_("LAN IP Setting"), "lan.html", 400, 215);
			}
			sysInfo.loading = true;
		}
		sysInfo.initValue();
	},
	initValue: function () {
		$.GetSetData.getJson("goform/GetSysStatus?" + Math.random(), sysInfo.setValue);
	},
	setValue: function (obj) {

		$("#sys_lan_status .function-status").html(obj.lan);

		if (obj.firmware == "1") {
			$("#sys_upgrade .function-status").html(_("New version detected"));
		} else {
			$("#sys_upgrade .function-status").html(obj.firmware);
		}
		$("#sys_auto .function-status").html(obj.rebootEn == 1 ? _("Enable") : _("Disable"));

		if (obj.wl_mode == "apclient") {
			$("#sys_wan").addClass("disabled");
			if (obj.apClientConnect == "1") {
				$("#sys_lan_status").addClass("disabled");
			}
		}
	},
	getIframe: function () {
		if ($(this).hasClass("disabled")) return;

		var id = $(this).attr("id");
		var isMobile, u = navigator.userAgent;
		isMobile = !!u.match(/AppleWebKit.*Mobile.*/);
		//alert(isMobile);
		if (isMobile) { //判断是否为移动端
			$(".main-dailog").addClass("isMobile");
		} else {
			$(".main-dailog").removeClass("isMobile");
		}

		switch (id) {
		case "sys_status":
			showIframe(_("System Status"), "system_status.html", 530, 490);
			break;
		case "sys_pwd":
			showIframe(_("Login Password"), "system_password.html", 500, 310);
			break;
		case "sys_lan_status":
			showIframe(_("LAN IP Setting"), "lan.html", 580, 415);
			break;
		case "sys_wan":
			showIframe(_("WAN Config"), "mac_clone.html", 535, 450);
			break;
		case "sys_reboot":
			showIframe(_("Reboot the Router"), "system_reboot.html", 400, 205);
			break;
		case "sys_upgrade":
			showIframe(_("Firmware Upgrade"), "system_upgrade.html", 665, 556);
			break;
		case "sys_backup":
			showIframe(_("Backup"), "system_backup.html", 550, 240);
			break;
		case "sys_config":
			showIframe(_("Reset to Factory Default"), "system_config.html", 400, 205);
			break;
		case "sys_log":
			showIframe(_("Syslog"), "system_log.html", 650, 425);
			break;
		case "sys_auto":
			showIframe(_("Auto Maintenance"), "system_automaintain.html", 500, 205);
			break;
		case "sys_time":
			showIframe(_("Time & Date"), "system_time.html", 680, 415);
			break;
		}
	}
}