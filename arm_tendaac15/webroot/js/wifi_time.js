var initObj = null;

$(function () {
	$("#submit").on("click", function() {
		if (initObj.wl_mode == "ap")
		preSubmit();
	});
	$("#schedWifiEnable").on("click", function() {
		if (initObj.wl_mode == "ap")
		changeWifiTimeEn();
	});
	$("[name='timeType']").on("click", changeTimeType);
	initHtml();
	getValue();
	top.loginOut();

	top.$("#head_title").off("click").on("click", showTimeWifi);
	top.$("#head_title2").off("click").on("click", showAliWifi);
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

function changeTimeType() {
	if ($("#everyday")[0].checked) {
		$("[id^='day']").attr("disabled", true).prop("checked", true);

	} else {
		$("[id^='day']").removeAttr("disabled").prop("checked", true);
		$("#day6, #day7").prop("checked", false);
	}
	top.initIframeHeight();
}

function changeWifiTimeEn() {
	var className = $("#schedWifiEnable").attr("class");
	if (className == "btn-off") {
		$("#schedWifiEnable").attr("class", "btn-on");
		$("#schedWifiEnable").val(1);
		$("#time_set").removeClass("none");
	} else {
		$("#schedWifiEnable").attr("class", "btn-off");
		$("#schedWifiEnable").val(0);
		$("#time_set").addClass("none");
	}
	top.initIframeHeight();
}

function getValue() {
	$.getJSON("goform/initSchedWifi?" + Math.random(), initValue);
}

function initValue(obj) {
	initObj = obj;

	(obj.timeUp == "1"?$("#timeUpTip").addClass("none"):$("#timeUpTip").removeClass("none"));

	$("#schedWifiEnable").attr("class", obj.schedWifiEnable == "1"?"btn-off":"btn-on");
	changeWifiTimeEn();

	if (obj.wl_mode != "ap") {
		showErrMsg("msg-err",_("The Wireless Reapter is enabled. Please go to Wireless settings to disable Wireless Reapter first."),true);
		$("#submit")[0].disabled = true;
	}

	if (obj.schedStartTime == "0" && obj.schedEndTime == "0") {
		obj.schedStartTime = "00:00";
		obj.schedEndTime = "07:00";
	}
	$("#startHour").val((obj.schedStartTime).split(":")[0]);
	$("#startMin").val((obj.schedStartTime).split(":")[1]);
	$("#endHour").val((obj.schedEndTime).split(":")[0]);
	$("#endMin").val((obj.schedEndTime).split(":")[1]);
	if (obj.timeType == "0") {
		$("[name='timeType']")[0].checked = true;
	} else {
		$("[name='timeType']")[1].checked = true;
	}

	var dayArr = obj.day.split(","),
		len = dayArr.length,
		i = 0,
		dayVal;

	for (i = 0; i < len; i++) {
		dayVal = dayArr[i];
		if (dayVal == 0) {
			$("#day" + (i + 1)).attr("checked", false);
		} else {
			$("#day" + (i + 1)).attr("checked", true);
		}
	}

	if ($("#everyday")[0].checked) {
		$("[id^='day']").attr("disabled", true);

	} else {
		$("[id^='day']").removeAttr("disabled");
	}
	top.initIframeHeight();
}

function preSubmit() {
	var subObj = {},
		schedWifiEnable = $("#schedWifiEnable").val(),
		start_time = "",
		end_time = "",
		subStr = "",
		i = 0,
		dayList = "",
		index = 0,
		timeType;

	if (schedWifiEnable == 1) {
		start_time = $("#startHour").val() + ":" + $("#startMin").val();
		end_time = $("#endHour").val() + ":" + $("#endMin").val();

		for (i = 0; i < 7; i++) {
			if ($("#day" + (i + 1))[0].checked) {
				dayList += "1,";
				index++;
			} else {
				dayList += "0,";
			}
		}
		dayList = dayList.replace(/[,]$/, "");


		if ($("#schedWifiEnable").val() == "1") {
			if (index == 0 && $("#thatday")[0].checked) {
				showErrMsg("msg-err", _("Please select at least one day"));
				return;
			}

			if (start_time.replace(/[:]/g, "") == end_time.replace(/[:]/g, "")) {
				//top.mainPageLogic.validate._error("开始时间必须小于结束时间");		
				showErrMsg("msg-err", _("The start time and end time should not be the same."));
				return;
			}
		}
		if ($("#everyday")[0].checked) {
			timeType = "0";
		} else {
			timeType = "1";
		}


		/***************判断时间是否与智能省电冲突 add by zzc*****************/
		var startHour = $("#startHour").val(),
			startMin = $("#startMin").val(),
			endHour = $("#endHour").val(),
			endMin = $("#endMin").val(),
			time = startHour + ":" + startMin + "-" + endHour + ":" + endMin;

		if (initObj.powerSaveTime) {
			var powerSaveTimeStart = parseInt(initObj.powerSaveTime.split("-")[0].replace(/[^\d]/g, ""), 10),
				powerSaveTimeEnd = parseInt(initObj.powerSaveTime.split("-")[1].replace(/[^\d]/g, ""), 10);
			if (isTimeOverlaping(powerSaveTimeStart, powerSaveTimeEnd, parseInt(startHour+""+startMin, 10), parseInt(endHour+""+endMin, 10))) {
				//重叠
				if (!window.confirm(_("The time period you set up in Power Saving(%s) overlaps with that in WiFi Schedule(%s). During the overlapping time, the settings in WiFi Schedule will be ineffective. Are you sure to save the settings?", [initObj.powerSaveTime, time]))) {
					return false;
				}
			}
		}
		/***************判断时间是否与智能省电冲突 over*****************/

	} else {
		start_time = initObj.schedStartTime;
		end_time = initObj.schedEndTime;
		timeType = initObj.timeType;
		dayList = initObj.day;
	}

	subObj = {
		"schedWifiEnable": $("#schedWifiEnable").val(),
		"schedStartTime": start_time,
		"schedEndTime": end_time,
		"timeType": timeType,
		"day": dayList
	}
	subStr = objTostring(subObj);

	/*if($("#schedWifiEnable").val() == "1" && start_time == "00:00" && end_time == "00:00") {
		//top.$("#iframe-msg").removeClass("none");
		top.$("#iframe-msg").html("时间为：00:00-00:00表示全天关闭wifi");	
		$("#submit").attr("disabled", true);
		setTimeout(function(){
			
			$.post("goform/openSchedWifi",subStr,callback);	
		},900);	
		return;
	}*/



	$.post("goform/openSchedWifi", subStr, callback);
}

function callback(str) {
	$("#submit").attr("disabled", false);
	if (!top.isTimeout(str)) {
		return;
	}
	top.$("#iframe-msg").html("");
	//top.$("#iframe-msg").addClass("none");

	var num = $.parseJSON(str).errCode;
	top.showSaveMsg(num);
	if (num == 0) {
		//getValue();	
		top.wrlInfo.initValue();
	}
}


function showTimeWifi() {
	$("#wifi_set_wrap").removeClass("none");
	$("#ali_wifi_wrap").addClass("none");

	top.$("#head_title").addClass("selected");
	top.$("#head_title2").removeClass("selected");

	//获取wifi定时数据
	getValue();

}

function showAliWifi() {

	$("#wifi_set_wrap").addClass("none");
	$("#ali_wifi_wrap").removeClass("none");

	top.$("#head_title").removeClass("selected");
	top.$("#head_title2").addClass("selected");
	//获取aliwifi数据	
	$.getJSON("goform/getAliWifiScheduled", initAliWifi);
	//var obj = {"enabled":"1", "offTime":["UTC+08:00 0 0 22 * * 1-7","UTC+08:00 0 0 23 * * 6-7"],"onTime":["UTC+08:00 0 0 8 * * 1-7","UTC+08:00 0 0 10 * * 6-7"]};
	//initAliWifi(obj);

	top.initIframeHeight();
}

function initAliWifi(obj) {

	if (obj.enable == "1") {
		$("#ali_wifi_enable").html(_("Enable"));
	} else {
		$("#ali_wifi_enable").html(_("Disable"));
	}

	var off_rule = obj.offTime,
		off_len = off_rule.length,
		on_rule = obj.onTime,
		on_len = on_rule.length,
		i = 0,
		html = "",
		time_on = "",
		time_off
	week_on = "", //显示开启的重复时间
		time_match_on = "",
		time_match_off = "";
	//关闭时间-开启时间，表示关闭的时间段
	//["UTC+08:00 0 1 8 * * 1-5", "1", "8", "1-5"]: 1:min, 8:hour，1-5:week
	for (; i < off_len; i++) {
		time_match_off = off_rule[i].match(/^[\w\d+:]+\s[\d]{1,2}\s([\d]{1,2})\s([\d]{1,2})\s[*?]\s[*?]\s([\d,-]{1,})$/);

		time_off = time_match_off[2].replace(/^([0-9])$/g, "0$1") + ":" + time_match_off[1].replace(/^([0-9])$/g, "0$1");
		week_off = transformWeek(time_match_off[3]);
		if (on_rule[i]) {
			time_match_on = on_rule[i].match(/^[\w\d+:]+\s[\d]{1,2}\s([\d]{1,2})\s([\d]{1,2})\s[*?]\s[*?]\s([\d,-]{1,})$/);
			time_on = time_match_on[2].replace(/^([0-9])$/g, "0$1") + ":" + time_match_on[1].replace(/^([0-9])$/g, "0$1");
			//week_on = transformWeek(time_match_on[3]);
		} else {
			time_on = "";
			//week_on = "";	
		}
		time = time_off + "-" + time_on;

		html += "<tr class='row" + i % 2 + "'>";
		html += "<td>" + (i + 1) + "</td>";

		html += "<td class='notd'></td>";
		html += "<td>" + time + "</td>";
		html += "<td class='notd'></td>";
		html += "<td class='fixed'>" + week_off + "</td>";

		html += "</tr>";
	}


	$("#list").html(html);
}

function transformWeek(week) {
	var week_arr = week.split(","),
		len = week_arr.length,
		result = [],
		result_str = "",
		example_arr = ["", _("Sun."), _("Mon."), _("Feb."), _("Wed."), _("Thu."), _("Fri."), _("Sat.")];
		tmp = [],
		range_len = "",
		j = 0;
	//1,表示星期天
	for (var i = 0; i < len; i++) {
		tmp = week_arr[i].split("-");
		if (tmp.length == 1) {
			result.push(example_arr[tmp[0]]);
		} else {

			for (j = tmp[0]; j <= tmp[1]; j++) {
				result.push(example_arr[j]);
			}
		}
	}

	return result.join(",");
}