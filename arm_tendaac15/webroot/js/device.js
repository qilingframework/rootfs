var G = {};
$(function () {
	G.refreshValue = true;
	G.time = 0;
	initEvent();
	getValue();

	top.loginOut();

	top.$(".main-dailog").removeClass("none");
	top.$(".save-msg").addClass("none");

});

function initEvent() {
	$("#limitEn").on("click", changeLimitEn);
	$("#device_edit").on("click", editDevice);
	$("#add").on("click", addList);


	$("#addToBlack").on("click", addBlack);
}

function getValue() {
	var deviceId_str = location.search.substring(1);
	var deviceId = deviceId_str.split("_")[0];
	var device_block = deviceId_str.split("_")[1];

	/*if(device_block == 1) {
		$("#addToBlack").addClass("none");
	} else {
		$("#addToBlack").removeClass("none");	
	}*/

	var data = "deviceId=" + deviceId + "&random=" + Math.random();
	$.getJSON("goform/GetDeviceDetail?" + data, initValue);
}



function changeLimitEn() {
	var className = $("#limitEn").attr("class");
	if (className == "btn-off") {
		$("#limitEn").attr("class", "btn-on");
		$("#limitEn").val(1);
		$(".x-lables").removeClass("none");
		$("#speed_limit, #speed_limit_up").removeClass("none");

		//$("#downSpeedLimit .speed-limit").css("width","500px");
		var limit_speed = "";
		/*if(G.unit == 0) {
			limit_speed = "不限速";
		} else {
			limit_speed = "限速："+ 500*G.unit + "KB/s";
		}*/

		//if(G.unit != 0) {
		//limit_speed = "不限速";
		//} else {
		limit_speed = "限速：" + 500 * G.unit + "KB/s";
		//}

		$(".down-limit-msg").html(limit_speed);
		$("#speed_limit").css("left", $(".speed-limit").offset().left + 500);
		//TODO显示uplimit数据
		var limit_speed_up = "";
		//if(G.unit_up != 0) {
		//	limit_speed_up = "不限速";	
		//} else {
		limit_speed_up = "限速：" + 500 * G.unit_up + "KB/s";
		//}

		$(".up-limit-msg").html(limit_speed_up);
		$("#speed_limit_up").css("left", $(".speed-limit").offset().left + 500);


	} else {
		$("#limitEn").attr("class", "btn-off");
		$("#limitEn").val(0);
		$(".x-lables").addClass("none");
		$("#speed_limit, #speed_limit_up").addClass("none");
	}
	$("#limitEn").off("click", changeLimitEn);
	var data,
		limitSpeed = $(".down-limit-msg").html().slice(3),
		limitSpeedUp = $(".up-limit-msg").html().slice(3);

	if (limitSpeed == "") {
		limitSpeed = 0;
	}

	if (limitSpeedUp == "") {
		limitSpeedUp = 0;
	}

	//TODO需提交上传限速
	data = "limitSpeed=" + parseInt(limitSpeed, 10) + "&limitSpeedUp=" + parseInt(limitSpeedUp, 10) + "&deviceId=" + G.data.deviceId + "&limitEn=" + $("#limitEn").val();
	//$.post("apscan.txt",data,handlerLimit);
	$.post("goform/SetClientState", data, handlerLimit);
}


function addList() {
	var data = "deviceId=" + G.data.deviceId + "&deviceMac=" + $("#mac").html().toUpperCase();
	$.post("goform/addWifiMacFilter", data, callback);
	//$.post("apscan.txt",data, callback);
}

function editDevice() {
	var deviceName = $("#deviceName").text(),
		str,
		data;
	if ($(this).val() == "编辑") {
		str = "<input type='text' class='input-medium' id='devName'>";
		$("#deviceName").html(str);
		$("#devName").val(deviceName);
		$("#device_edit").val("完成");
		G.refreshValue = false;
	} else {
		data = "deviceName=" + encodeURIComponent($("#devName").val()) + "&deviceId=" + G.data.deviceId;
		//$.post("apscan.txt",data,init);
		deviceName = $("#devName").val();
		if (deviceName == "") {
			//top.$("#iframe-msg").removeClass("none");
			top.$("#iframe-msg").html("设备名不能为空");
			return;
		}
		if (deviceName.replace(/[ ]/g, "") == "") {
			//top.$("#iframe-msg").removeClass("none");
			top.$("#iframe-msg").html("设备名不能全为空格");
			return;
		}

		if ((null == deviceName.match(/[^ -~]/g) ? deviceName.length : deviceName.length + deviceName.match(/[^ -~]/g).length * 2) > 32) {
			//top.$("#iframe-msg").removeClass("none");
			top.$("#iframe-msg").html("设备名长度不能超过32个字节（一个中文字符占3个字节）");
			return;
		}
		/*if(/[^\x00-\x80]/.test(deviceName)) {
			top.$("#iframe-msg").html("设备名不能包含全角字符");
			return;	
		}*/
		$.post("goform/SetDeviceName", data, handDeviceName);
		G.refreshValue = true;
		$("#device_edit").val("编辑")
	}
}

function handDeviceName(str) {
	if (!top.isTimeout(str)) {
		return;
	}
	var num = $.parseJSON(str).errCode;
	if (num == 0) {
		$("#deviceName").html($("#devName").val());
		top.$("#iframe-msg").html("");
		top.showSaveMsg(num, "", 2);
	}
}

function callback(str) {
	if (!top.isTimeout(str)) {
		return;
	}
	var num = $.parseJSON(str).errCode;
	//num = 0;
	if (num == 3 || num == 1) {
		if (num == 3) {
			top.$("#iframe-msg").html("添加MAC地址重复");
		} else {
			top.$("#iframe-msg").html("操作失败");
		}
		setTimeout(function () {
			top.$("#iframe-msg").html("");
		}, 3000);
		return;
	}

	//在次函数中进行延迟1秒获取数据
	top.showSaveMsg(num, "", 3);

	if (num == 0) {
		clearTimeout(G.time);

	}
}


function initValue(obj) {
	G.data = obj;
	var downTotal,
		upTotal,
		speed_unit,
		downSpeed,
		upSpeed;

	if (obj.errCode == 1) {
		alert("当前设备已不在线");
		top.staInfo.closeIframe();
		return;
	} else {
		top.$("#iframe-msg").html("");
	}

	//top.$(".main-dailog").removeClass("none");
	//top.$("iframe").removeClass("none");
	//top.$(".loadding-page").addClass("none");
	if (G.refreshValue) {
		$("#deviceName").html(obj.deviceName);
		$("#device_edit").val("编辑");
	}
	if (obj.localDevice == 1) {
		//表示为本机，不允许加入黑名单
		$("#addToBlack").addClass("none");
	} else {
		$("#addToBlack").removeClass("none");
	}
	$("#connectTime").html(formatSeconds(obj.connectTime));
	if (obj.connectType == 0) {
		$("#connectType").html("有线接入");
		//$("#addMac").addClass("none");	
	} else if (obj.connectType == 1) {
		$("#connectType").html("2.4G接入");
		//$("#addMac").removeClass("none");	
	} else {
		$("#connectType").html("5G接入");
		//$("#addMac").removeClass("none");		
	}
	if (obj.limitEn == "1") {
		$("#limitEn").attr("class", "btn-on");
		$("#limitEn").val(1);
		$(".x-lables").removeClass("none");
		$("#speed_limit, #speed_limit_up").removeClass("none");
	} else {
		$("#limitEn").attr("class", "btn-off");
		$("#limitEn").val(0);
		$(".x-lables").addClass("none");
		$("#speed_limit, #speed_limit_up").addClass("none");
	}

	$("#ip").html(obj.ip);
	$("#mac").html(obj.mac.toUpperCase());

	$("#downLoadTotal").html(obj.downLoadTotal + "B");
	$("#upLoadTotal").html(obj.upLoadTotal + "B");

	downSpeed = obj.downLoadSpeed; //当数据大于10时取整，解决字符过长的问题
	speed_unit = downSpeed.slice(downSpeed.length - 1);
	if (parseInt(obj.downLoadSpeed, 10) < 10) {
		$("#downLoadSpeed").html(downSpeed + "B/s");
	} else {
		$("#downLoadSpeed").html(parseInt(downSpeed, 10) + " " + speed_unit + "B/s");
	}

	upSpeed = obj.upLoadSpeed;
	speed_unit = upSpeed.slice(upSpeed.length - 1);
	if (parseInt(upSpeed, 10) < 10) {
		$("#upLoadSpeed").html(upSpeed + "B/s");
	} else {
		$("#upLoadSpeed").html(parseInt(upSpeed, 10) + " " + speed_unit + "B/s");
	}

	initLine(obj);

	clearTimeout(G.time);
	G.time = setTimeout("getValue()", 5000);
}

function initLine(obj) {
	var limitSpeed = obj.limitSpeed, //(obj.limitSpeed == 1 ? 0 : obj.limitSpeed),
		limitSpeedUp = obj.limitSpeedUp, //(obj.limitSpeedUp == 1 ? 0 : obj.limitSpeedUp),
		upSpeed = obj.upLoadSpeed,
		downSpeed = obj.downLoadSpeed;

	var maxSpeed = (parseFloat(limitSpeed, 10) > parseFloat(obj.maxSpeed, 10) && obj.maxSpeed != 0) ? limitSpeed : obj.maxSpeed,

		left = $(".speed-limit").offset().left;
	var maxSpeedUp = (parseFloat(limitSpeedUp, 10) > parseFloat(obj.maxSpeedUp, 10) && obj.maxSpeedUp != 0) ? limitSpeedUp : obj.maxSpeedUp;

	//当限制的速度比刻度的最大速度大，则刻度应该变为限制的速度



	//按照0.5M递增，即500
	var tmp_maxSpeed = parseInt(parseInt(maxSpeed, 10) / 512, 10);
	//按100kb递增
	var tmp_maxSpeedUp = parseInt(parseInt(maxSpeedUp, 10) / 100, 10);

	if (obj.maxSpeed == 0) {
		maxSpeed = 2;
	} else {
		if (tmp_maxSpeed == 0) {
			maxSpeed = 1;
		} else {
			//向上取整
			maxSpeed = Math.ceil(parseInt(maxSpeed, 10) / 512);
		}
	}

	if (obj.maxSpeedUp == 0) {
		//表示没有测速,用默认刻度
		maxSpeedUp = 2; //(200/100)
	} else {
		//已经测速，最小值,

		if (tmp_maxSpeedUp == 0) {
			maxSpeedUp = 1;
		} else {
			maxSpeedUp = Math.ceil(parseInt(maxSpeedUp, 10) / 100);
		}
	}

	var unit = parseFloat(maxSpeed, 10) * 500 / 500;
	//TODO还有上行
	//以200kb为一个单位的增加


	//图片有50个刻度，一共500px;
	var unit_up = parseFloat(maxSpeedUp, 10) * 100 / 500;


	G.unit = unit; //1px 多少KB
	G.unit_up = unit_up;

	if (G.refreshValue) {
		if (maxSpeed * 512 >= 1024) {
			//maxSpeed表示有几个512,一个512表示0.5

			//var tmpMaxSpeed = parseInt(maxSpeed * 512 / 1024, 10);
			var tmpMaxSpeed = maxSpeed * 0.5;
			$("#maxSpeed").html(tmpMaxSpeed + "MB/s");
		} else {
			$("#maxSpeed").html(parseInt(maxSpeed * 500, 10) + "KB/s");
		}

		if (maxSpeedUp * 100 >= 1024) {
			//var tmpMaxSpeedUp = parseInt(maxSpeedUp * 100 / 1024, 10);
			var tmpMaxSpeedUp = (maxSpeedUp * 100 / 1024).toFixed(1);
			$("#maxSpeedUp").html(tmpMaxSpeedUp + "MB/s");
		} else {
			$("#maxSpeedUp").html(parseInt(maxSpeedUp * 100, 10) + "KB/s");
		}



		if (parseFloat(limitSpeed, 10) <= maxSpeed * 512) {

			$(".down-limit-msg").html("限速：" + parseInt(limitSpeed, 10) + "KB/s");

			$("#speed_limit").css("left", parseInt(limitSpeed, 10) / G.unit + left);
		} else {

			$(".down-limit-msg").html("限速：" + maxSpeed * 500 + "KB/s");

			$("#speed_limit").css("left", 500 + left);
		}

		if (limitSpeed == "0") {
			$(".down-limit-msg").html("不限速");

			$("#speed_limit").css("left", left);
		}

		if (parseFloat(limitSpeedUp, 10) <= maxSpeedUp * 100) {

			$(".up-limit-msg").html("限速：" + parseInt(limitSpeedUp, 10) + "KB/s");
			//}
			$("#speed_limit_up").css("left", parseInt(limitSpeedUp, 10) / G.unit_up + left);
		} else {
			//$("#downSpeedLimit .speed-limit").css("width",500);
			//当限制的速度比刻度的最大速度大，则刻度应该变为限制的速度

			$(".up-limit-msg").html("限速：" + maxSpeedUp * 100 + "KB/s");

			$("#speed_limit_up").css("left", 500 + left);
		}

		if (limitSpeedUp == "0") {
			$(".up-limit-msg").html("不限速");

			$("#speed_limit_up").css("left", left);
		}

	}


	if (downSpeed.indexOf("M") != -1) { //显示在网速线
		if (parseInt(obj.downLoadSpeed, 10) * 1024 / G.unit >= 500) {
			$("#downSpeedLimit .speed-limit").css("width", 500);
		} else {
			$("#downSpeedLimit .speed-limit").css("width", (parseFloat(obj.downLoadSpeed) * 1024 / G.unit));
		}
	} else {
		if (parseInt(obj.downLoadSpeed, 10) / G.unit >= 500) {
			$("#downSpeedLimit .speed-limit").css("width", 500);
		} else {
			$("#downSpeedLimit .speed-limit").css("width", (parseInt(obj.downLoadSpeed, 10) / G.unit));
		}
	}
	if (upSpeed.indexOf("M") != -1) {

		if (parseInt(obj.upLoadSpeed, 10) * 1024 / G.unit_up >= 500) {
			$("#upSpeedLimit .speed-limit").css("width", 500);
		} else {
			$("#upSpeedLimit .speed-limit").css("width", (parseFloat(obj.upLoadSpeed) * 1024 / G.unit));
		}

	} else {
		/*if(parseInt(upSpeed,10)*500/200 >= 500) {
			$("#upSpeedLimit .speed-limit").css("width",500);	
		} else {
			$("#upSpeedLimit .speed-limit").css("width",(parseInt(upSpeed,10)*500/200));
		}*/

		if (parseInt(obj.upLoadSpeed, 10) / G.unit_up >= 500) {
			$("#upSpeedLimit .speed-limit").css("width", 500);
		} else {
			$("#upSpeedLimit .speed-limit").css("width", (parseInt(obj.upLoadSpeed, 10) / G.unit_up));
		}
	}
}
window.onload = function () {
	var left = $(".speed-limit").offset().left;
	rDrag.init(document.getElementById("speed_limit"), left);

	rDrag.init(document.getElementById("speed_limit_up"), left);
}

/*************弹出框拖动***********************/
var rDrag = {
	o: null,
	moveReastX: 0,
	moveStep: 0,
	min: null,
	xLable: function () {
		var i = 0,
			arry = [];
		for (i = 0; i < 51; i++) {
			arry.push(i * 10);
		}
		return arry;
	},
	init: function (o, left, initLeft) {
		o.onmousedown = this.start;
		o.style.left = $(o).offset().left + "px";
		rDrag.min = left;
	},
	start: function (e) {
		var o,
			$rDrag;
		G.refreshValue = false;
		e = rDrag.fixEvent(e);
		e.preventDefault && e.preventDefault();
		rDrag.o = o = this;
		o.x = parseInt(o.style.left, 10);
		rDrag.moveReastX = e.clientX;
		document.onmousemove = rDrag.move;
		document.onmouseup = rDrag.end;
	},

	moveStep: function (targetLeft, time) {
		$(rDrag.o).stop().animate({
			"left": targetLeft
		}, time);
		rDrag.o.x = targetLeft;
		//$("#downSpeedLimit .speed-limit").stop().animate({"width": targetLeft - rDrag.min}, time);
	},

	move: function (e) {
		var oLeft, oTop;

		e = rDrag.fixEvent(e);
		oLeft = rDrag.o.x + (e.clientX - rDrag.moveReastX);

		if (oLeft <= rDrag.min) {
			oLeft = rDrag.min;
		}
		if (oLeft > (rDrag.min + 500)) {
			oLeft = rDrag.min + 500;
		}

		if ((oLeft - rDrag.min) % 10 == 0) {

			//TODO:要区分上下行
			if (rDrag.o.id == "speed_limit") {
				if ((oLeft - rDrag.min) * G.unit == 0) {
					$(".down-limit-msg").html("不限速");
				} else {
					$(".down-limit-msg").html("限速：" + parseInt((oLeft - rDrag.min) * G.unit, 10) + "KB/s");
				}
				//$("#downSpeedLimit .speed-limit").css("width", (oLeft - rDrag.min) + "px");
				//rDrag.o.style.left = oLeft + 'px';
			} else {
				if ((oLeft - rDrag.min) * G.unit_up == 0) {
					$(".up-limit-msg").html("不限速");
				} else {
					$(".up-limit-msg").html("限速：" + parseInt((oLeft - rDrag.min) * G.unit_up, 10) + "KB/s");
				}
			}
			rDrag.moveStep(oLeft, 50);
			rDrag.moveReastX = e.clientX + (oLeft - rDrag.min) % 10;

			//rDrag.moveReastX = e.clientX - parseInt(o.style.left, 10);
		}

	},
	end: function (e) {
		e = rDrag.fixEvent(e);

		rDrag.o = document.onmousemove = document.onmouseup = null;

		var data,
			limitSpeed = $(".down-limit-msg").html().slice(3),
			limitSpeedUp = $(".up-limit-msg").html().slice(3);


		if (limitSpeed == "") {
			limitSpeed = 0;
		}

		if (limitSpeedUp == "") {
			limitSpeedUp = 0;
		}

		//fTODO:要发送上行限速
		data = "limitSpeed=" + parseInt(limitSpeed, 10) + "&limitSpeedUp=" + parseInt(limitSpeedUp, 10) + "&deviceId=" + G.data.deviceId + "&limitEn=" + $("#limitEn").val();
		//$.post("apscan.txt",data,handlerLimit);
		$.post("goform/SetClientState", data, handlerLimit);
	},
	fixEvent: function (e) {
		if (!e) {
			e = window.event;
			e.target = e.srcElement;
			if (!e.preventDefault) {
				e.preventDefault = function () {
					this.returnValue = false;
				}
			}
		}
		return e;
	}
}

function handlerLimit(str) {
	if (!top.isTimeout(str)) {
		return;
	}
	var num = $.parseJSON(str).errCode;
	$("#limitEn").off("click", changeLimitEn);
	$("#limitEn").on("click", changeLimitEn);
	if (num == 1) {
		top.$("#iframe-msg").html("最多同时限速30个设备");

	} else if (num == 0) {
		top.$("#iframe-msg").html("设置成功");
	}


	//top.$("#iframe-msg").removeClass("none");

	setTimeout(function () {
		top.$("#iframe-msg").html("");
		//top.$("#iframe-msg").addClass("none");
	}, 1500);
	G.refreshValue = true;
	if (num != 0 && num != 1) {
		top.location.reload(true);
	}
}


function addBlack() {
	var subObj = {};
	var type = $("#connectType").html();
	if (type == "有线接入") {
		type = 0;
	} else {
		type = 1;
	}
	subObj = {
		"deviceId": $("#mac").html().toLowerCase(),
		"block": 1,
		"connectType": type
	}
	subStr = objTostring(subObj);
	$.post("goform/saveParentControlInfo", subStr, callback);
}



function showErrMsg(str) {
	//top.$("#iframe-msg").removeClass("none");
	top.$("#iframe-msg").html(str);
	setTimeout(function () {
		top.$("#iframe-msg").html("");
		//top.$("#iframe-msg").addClass("none");
	}, 3000);
}