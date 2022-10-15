// JavaScript Document

$(function () {

	initHtml();

	top.loginOut();

	getDevice();

	top.$("#head_title").off("click").on("click", showParentDeviceWrap);
	top.$("#head_title2").off("click").on("click", showRuleList);

	$("table").on("click", ".set_parental", getParentControl);
	$("table").on("click", ".del", delMac);
	$("#parentcontrolEnable").on("click", changeParentcontrolEnable);
	$("#whiteEnable").on("click", changeWhiteEn);
	$("[name='timeType']").on("click", changeTimeType);
	$("#save").on("click", saveParentControlInfo);
	$("#cancel").on("click", cancelParentConrolInfo);

	$("#device_edit").on("click", editDevice);

	$('#parent_urls').addPlaceholder(_("Please enter the key words of websites.")).on("keyup blur", function() {
		if (/[A-Z]/.test(this.value)) {
			this.value = this.value.toLowerCase();
			showErrMsg("msg-err", _('No case-sensitive'));
		}
	});

	top.$(".main-dailog").removeClass("none");
	top.$(".save-msg").addClass("none");
});

function getDevice() {
	$.GetSetData.getJson("goform/GetParentCtrlList?" + Math.random(), initDeviceList);
}

function getParentControl() {
	var deviceId = $(this).parents("tr").find("td:eq(1)").attr("title");
	var deviceName = $(this).parents("tr").find("td:eq(0)").attr("title");

	$("#device_name").text(deviceName);
	$("#device_mac").html(deviceId.toUpperCase());
	//显示大写，传输数据小写
	var data = "mac=" + deviceId + "&random=" + Math.random();
	$.getJSON("goform/GetParentControlInfo?" + data, initParentControl);
}


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

function initParentControl(obj) {
	//{"enable":1,"mac":"aa:aa:aa:aa:aa:aa", "url_enable":1, "urls":"abcd,abcde", "time":"0:0-0:0", "day":"1,1,1,1,1,1,0"}
	//星期天开始
	if (typeof obj.enable == "undefined") {
		//说明现在没有这条规则
		obj.enable = 0;
		obj.url_enable = 0;
		obj.urls = "";
		obj.time = "19:00-21:00";
		obj.day = "1,1,1,1,1,1,1";
	}

	if (obj.enable == 1) {
		$("#parentcontrolEnable").attr("class", "btn-on").val(1);
		$("#parental_set").removeClass("none");
	} else {
		$("#parentcontrolEnable").attr("class", "btn-off").val(0);
		$("#parental_set").addClass("none");
	}


	if (obj.url_enable == 1) {
		$("#whiteEnable").attr("class", "btn-on").val(1);
		$("#web_limit").removeClass("none").val(obj.urls);
	} else {
		$("#whiteEnable").attr("class", "btn-off").val(0);
		$("#web_limit").addClass("none");
	}

	$("#parent_urls").val(obj.urls);
	$('#parent_urls').addPlaceholder(_("Please enter the key words of websites."));
	if (obj.time == "00:00-24:00") {
		obj.time = "00:00-00:00";
	}

	var start_time = obj.time.split("-")[0],
		end_time = obj.time.split("-")[1];
	$("#startHour").val(start_time.split(":")[0]);
	$("#startMin").val(start_time.split(":")[1]);
	$("#endHour").val(end_time.split(":")[0]);
	$("#endMin").val(end_time.split(":")[1]);

	if (obj.day == "1,1,1,1,1,1,1") {
		$("[name='timeType']")[0].checked = true;
	} else {
		$("[name='timeType']")[1].checked = true;
	}

	changeTimeType();
	var dayArr = obj.day.split(","),
		len = dayArr.length,
		i = 0,
		dayVal;

	for (i = 0; i < len; i++) {
		dayVal = dayArr[i];
		if (dayVal == 0) {
			$("#day" + (i)).attr("checked", false);
		} else {
			$("#day" + (i)).attr("checked", true);
		}
	}

	showParentalSet();
	top.initIframeHeight();
}

function initDeviceList(obj) {
	var str = "",
		type = "",
		len = obj.length,
		i = 0,
		color,
		isCtrl_btn_str;
	str = "";
	for (i = 0; i < len; i++) {
		isCtrl_btn_str = "";
		if (obj[i].block == 1) {
			continue;
		}
		if (obj[i].isControled == "1") {
			isCtrl_btn_str = "&nbsp;&nbsp;<input type='button' value='" + _("Controlled") + "' class='btn btn-mini'>";
		}
		str += "<tr class='tr-row'><td class='dev-name'>" + 
			"<span class='text-ellipsis dev-name-txt' style='width:100px'></span>" + isCtrl_btn_str + "</td>" +
			"<td title='" + obj[i].deviceId + "'>" + obj[i].ip + "</td>" +
			"<td><input type='button' value='"+_("Action ")+"' class='btn set_parental'></td></tr>";
	}

	$("#parental_list #list").html(str).find(".dev-name").each(function(i) {
		$(this).attr("title", obj[i].devName)
			.find(".dev-name-txt").text(obj[i].devName);

	});
	top.initIframeHeight();
}

function initRuleList(obj) {
	var str = "",
		type = "",
		len = obj.length,
		i = 0,
		color,
		btn_str;
	str = "";
	for (i = 0; i < len; i++) {

		str += "<tr class='tr-row'><td title='" + obj[i].devName + "'>" + obj[i].devName + "</td>" +
			"<td title='" + obj[i].mac + "'>" + _("MAC address:") + obj[i].mac.toUpperCase() + "</td>";
		if (obj[i].enable == 1) {
			btn_str =_("Enable");
		} else {
			btn_str = _("Disable");
		}
		str += "<td>" + btn_str + "</td><td><input type='button' value='" + _("Delete") + "' class='btn btn-mini del'></td></tr>";
	}

	if (len == 0) {
		str = "<td colspan=4>"+_("The controlled device list is empty.")+"</td>";
	}

	$("#rule_list #list2").html(str);
}

function showParentDeviceWrap() {
	//top.$("#head_title").addClass("selected");
	//top.$("#head_title2").removeClass("selected");
	$("#parental_list").removeClass("none");
	$("#parental_wrap, #rule_list").addClass("none");
	top.initIframeHeight();
	getDevice();
}

function showRuleList() {
	top.$("#head_title").removeClass("selected");
	top.$("#head_title2").addClass("selected");
	$("#rule_list").removeClass("none");
	$("#parental_list, #parental_wrap").addClass("none");

	$.getJSON("goform/getParentalRuleList?" + Math.random(), initRuleList);
	top.initIframeHeight();
}


function showParentalSet() {
	$("#device_edit").val(_("Edit"));
	$("#parental_wrap").removeClass("none");
	$("#parental_list, #rule_list").addClass("none");
	top.initIframeHeight();
}

function changeTimeType() {
	if ($("#everyday")[0].checked) {
		$("[id^='day']").attr("disabled", true).prop("checked", true);
	} else {
		$("[id^='day']").removeAttr("disabled");
	}
}

function changeParentcontrolEnable() {
	var className = $("#parentcontrolEnable").attr("class");
	if (className == "btn-off") {
		$("#parentcontrolEnable").attr("class", "btn-on").val(1);
		$("#parental_set").removeClass("none");
	} else {
		$("#parentcontrolEnable").attr("class", "btn-off").val(0);
		$("#parental_set").addClass("none");
	}
	top.initIframeHeight();
}

function changeWhiteEn() {
	var className = $("#whiteEnable").attr("class");
	if (className == "btn-off") {
		$("#whiteEnable").attr("class", "btn-on").val(1);
		$("#web_limit").removeClass("none");
	} else {
		$("#whiteEnable").attr("class", "btn-off").val(0);
		$("#web_limit").addClass("none");
	}
	top.initIframeHeight();
}

function saveParentControlInfo() {
	var subObj = {},
		start_time = "",
		end_time = "",
		subStr = "",
		i = 0,
		dayList = "",
		index = 0,
		timeType;


	if ($("#parentcontrolEnable").val() == "1") {
		start_time = $("#startHour").val() + ":" + $("#startMin").val();
		end_time = $("#endHour").val() + ":" + $("#endMin").val();

		for (i = 0; i < 7; i++) {
			if ($("#day" + (i))[0].checked) {
				dayList += "1,";
				index++;
			} else {
				dayList += "0,";
			}
		}
		dayList = dayList.replace(/[,]$/, "");

		if (index == 0 && $("#thatday")[0].checked) {
			showErrMsg("msg-err", _("Select at least one day"));
			return;
		}

		var time = start_time + "-" + end_time;
		if (start_time.replace(/[:]/g, "") == end_time.replace(/[:]/g, "")) {
			showErrMsg("msg-err", _("The start time and end time should not be the same."));
			return;
		}

		var urls = "";
		if ($("#whiteEnable").val() == "1") {
			urls = $("#parent_urls").val();
			//TODO:验证URLS
			if (urls == "") {
				showErrMsg("msg-err", _("When enabled, the White List of websites cannot be empty."));
				return;
			}
			var arr = urls.split(","),
				len = arr.length,
				dic = {};

			if (len > 10) {
				showErrMsg("msg-err", _("Up to %s URLs can be configured!", [10]));
				return;
			}
			result = [];
			for (var i = 0; i < len; i++) {
				if (/^[-.a-z0-9]{2,31}$/ig.test(arr[i])) {
					if (typeof dic[arr[i]] == "undefined") {
						dic[arr[i]] = arr[i];
						result.push(arr[i]);
					}

				} else {

					showErrMsg("msg-err", _('2~31 characters(only digits, letters, hyphens"-", dots".") can be entered in one URL entry.'));
					return;
				}
			}

			urls = result.join(",").toLowerCase();
		}



		subObj = {
			"deviceId": $("#device_mac").html().toLowerCase(),
			"enable": $("#parentcontrolEnable").val(),
			"time": time,
			"url_enable": $("#whiteEnable").val(),
			"urls": urls,
			"day": dayList
		}

	} else {
		//禁用表示仅保存enable或disable和MAC地址
		subObj = {
			"deviceId": $("#device_mac").html().toLowerCase(),
			"enable": $("#parentcontrolEnable").val()
		}

	}

	subStr = objTostring(subObj);
	$.post("goform/saveParentControlInfo", subStr, parent_callback);
}



function delMac() {
	var mac = $(this).parents("tr").find("td:eq(1)").attr("title");

	$.post("goform/delParentalRule", "mac=" + mac, delMac_callback);
}

function cancelParentConrolInfo() {
	//clear set

	$("#parentcontrolEnable").attr("class", "btn-off").val(0);
	$("#parental_set").addClass("none");


	$("#whiteEnable").attr("class", "btn-off").val(0);
	//$("#parent_urls").attr("disabled", "disabled");	


	$("#startHour,#startMin,#endHour,#endMin").val("00");


	$("[name='timeType']")[0].checked = true;

	$("#device_name").html("");
	$("#device_mac").html("");
	$("#device_edit").val(_("Edit"));
	changeTimeType();
	$("input[type='checkbox']").prop("checked", true).attr("disabled", true);
	showParentDeviceWrap();
}

function parent_callback(str) {
	if (!top.isTimeout(str)) {
		return;
	}



	var num = $.parseJSON(str).errCode;
	top.$("#iframe-msg").removeClass("text-success red");
	//top.$("#iframe-msg").removeClass("none");
	if (num == 0) {
		top.$("#iframe-msg").addClass("text-success").html(_("Configured Successfully!"));
	} else if (num == 1) {
		top.$("#iframe-msg").addClass("red").html(_("The total devices in Blacklist and controlled by Parental Controls should be within %s.", [30]));
	} else {
		top.$("#iframe-msg").addClass("red").html(_("Configured Failure!"));
	}
	setTimeout(function () {
		top.$("#iframe-msg").html("");
		top.$("#iframe-msg").removeClass("text-success").addClass("red");
		//top.$("#iframe-msg").addClass("none");
		//showParentDeviceWrap();
		cancelParentConrolInfo();
	}, 800);



	/*if(num != 0) {
		top.location.reload(true);
	}*/
}

function delMac_callback(str) {
	if (!top.isTimeout(str)) {
		return;
	}
	var num = $.parseJSON(str).errCode;

	//top.$("#iframe-msg").removeClass("none");
	if (num == "0") {
		top.$("#iframe-msg").html(_("Delete"));
	} else {
		top.$("#iframe-msg").html(_("Fail to delete it!"));
	}
	setTimeout(function () {
		top.$("#iframe-msg").html("");
		//top.$("#iframe-msg").addClass("none");
		showRuleList();
	}, 800);



	/*if(num != 0) {
		top.location.reload(true);
	}*/
}

function editDevice() {
	var deviceName = $("#device_name").text(),
		str,
		data;
	if ($(this).val() == _("Edit")) {
		str = "<input type='text' class='input-medium' id='devName'>";
		$("#device_name").html(str);
		$("#devName").val(deviceName);
		$("#device_edit").val(_("Complete"));

	} else {
		data = "devName=" + encodeURIComponent($("#devName").val()) + "&mac=" + $("#device_mac").html().toLowerCase();

		deviceName = $("#devName").val();
		if (deviceName == "") {
			//top.$("#iframe-msg").removeClass("none");
			showErrMsg("msg-err", _("Please enter a device name."));
			return;
		}
		if (deviceName.replace(/\s/g, "") == "") {
			showErrMsg("msg-err", _("The device name should not consist of spaces."));
			return;
		}

		if (getStrByteNum(deviceName) > 32) {
			showErrMsg("msg-err", _("Up to %s characters are allowed.",[32]));
			return false;
		}

		$.post("goform/SetOnlineDevName", data, handDeviceName);

		$("#device_edit").val(_("Edit"));
	}
}



function handDeviceName(data) {


	var num = $.parseJSON(data).errCode;

	//top.$("#iframe-msg").removeClass("none");
	top.$("#iframe-msg").removeClass("text-success red");
	if (num == 0) {
		$("#device_name").text($("#devName").val());
		top.$("#iframe-msg").addClass("text-success").html(_("Configured Successfully!"));

	} else {
		top.$("#iframe-msg").addClass("red").html(_("Configured Failure!"));
	}
	setTimeout(function () {
		top.$("#iframe-msg").removeClass("text-success").addClass("red");
		top.$("#iframe-msg").html("");

	}, 800);
}