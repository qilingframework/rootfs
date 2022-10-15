var G = {};
var initObj = null;

$(function () {
	initHtml();
	getValue();
	$("[name='ledType']").on("click", changeLedType);
	$("#submit").on("click", function () {
		G.validate.checkAll();
	});
	checkData();
	top.loginOut();
	top.$(".main-dailog").removeClass("none");
	top.$(".save-msg").addClass("none");
});

function initHtml() {
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
}

function changeLedType() {
	if ($("[name='ledType'][value='time']")[0].checked) {
		$("#time_set").removeClass("none");
	} else {
		$("#time_set").addClass("none");
	}
	top.initIframeHeight();
}

function checkData() {
	G.validate = $.validate({
		custom: function () {
			var startHour = $("#startHour").val(),
				startMin = $("#startMin").val(),
				endHour = $("#endHour").val(),
				endMin = $("#endMin").val(),
				time = startHour + ":" + startMin + "-" + endHour + ":" + endMin;

			
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
	$.getJSON("goform/GetLEDCfg?" + Math.random(), initValue);
}

function initValue(obj) {
	initObj = obj;
	(obj.timeUp == "1"?$("#timeUpTip").addClass("none"):$("#timeUpTip").removeClass("none"));
	$("[name='ledType'][value='" + obj.ledType + "']")[0].checked = true;
	changeLedType();
	var time = obj.time;

	$("#startHour").val(time.split("-")[0].split(":")[0]);
	$("#startMin").val(time.split("-")[0].split(":")[1]);
	$("#endHour").val(time.split("-")[1].split(":")[0]);
	$("#endMin").val(time.split("-")[1].split(":")[1]);

	top.initIframeHeight();
}

function preSubmit() {

	var data = "",
		ledType = $("[name='ledType']:checked").val(),
		startHour = $("#startHour").val(),
		startMin = $("#startMin").val(),
		endHour = $("#endHour").val(),
		endMin = $("#endMin").val(),
		time = startHour + ":" + startMin + "-" + endHour + ":" + endMin;

	if (ledType == "time") {
		//开始时间不能和结束时间相等
		if(startHour == endHour && startMin == endMin) {
			showErrMsg("msg-err",  _("The start time and end time should not be the same."));
			return false;
		}
		//判断时间是否与智能省电冲突
		if (initObj.powerSaveTime) {
			var powerSaveTimeStart = parseInt(initObj.powerSaveTime.split("-")[0].replace(/[^\d]/g, ""), 10),
				powerSaveTimeEnd = parseInt(initObj.powerSaveTime.split("-")[1].replace(/[^\d]/g, ""), 10);
			if (isTimeOverlaping(powerSaveTimeStart, powerSaveTimeEnd, parseInt(startHour+""+startMin, 10), parseInt(endHour+""+endMin, 10))) {
				//重叠
				if (!window.confirm(_("The time period you set up in Power Saving(%s) overlaps with that in Smart LED(%s).During the overlapping time, the settings in Smart LED will be ineffective. Are you sure to save the settings?", [initObj.powerSaveTime, time]))) {
					return false;
				}
			}
		}
	} else {
		time = initObj.time;
	}


	data = "ledType=" + $("[name='ledType']:checked").val() + "&time=" + time;

	/*if (initObj.timeUp == "0" && $("[name='ledType']:checked").val() == "time") {
		if (!confirm(_("The Timed OFF takes effect when the system time synchronizes the Internet time."))) {
			return false;
		}
	}*/
	$.post("goform/SetLEDCfg", data, callback);
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