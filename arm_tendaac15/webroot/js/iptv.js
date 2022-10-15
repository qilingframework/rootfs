var G = {};
var listMax = 0;
var initObj = {};
$(function () {
	getValue();
	$("#stbEn").on("click", function() {
		if (initObj.wl_mode == "ap")
		changeSTBEn();
	});

	$("#igmpEn").on("click", function() {
		if (initObj.wl_mode == "ap")
		changeIGMPEn();
	});

	$("#iptvType").on("change", changeType);
	$("#vlanList").delegate(".add", "click", addList);
	$("#vlanList").delegate(".del", "click", delList);

	checkData();
	$("#submit").on("click", function () {
		if (!this.disabled)
		G.validate.checkAll();
	});
	top.loginOut();
	top.$(".main-dailog").removeClass("none");
	top.$(".save-msg").addClass("none");
});

function addList() {
	var str = "";
	if ($("#vlanBody").children().length >= 8) {
		showErrMsg("msg-err", _("Up to %s VLANs can be added.",[8]));
		return;
	}
	str += "<tr>";
	str += "<td class='fixed'><input type='radio' name='selectVlan'>" + "</td>";
	str += "<td class='fixed'><input type='text' id='vlanId" + (listMax + 1) + "' class='input-small' maxlength='4'>" + "</td>";
	str += "<td class='fixed'><input type='button' class='btn del btn-small' value='"+_("Delete") +"'></td>";
	str += "</tr>";
	$("#vlanBody").append(str);
	$("#vlanId" + (listMax + 1)).inputCorrect("num");
	listMax++;
	top.initIframeHeight();
}

function delList() {
	$(this).parent().parent().remove();
	top.initIframeHeight();
}

function changeType() {
	if ($("#iptvType").val() == "none") {
		$("#vlanList").addClass("none");
		$("#area_set").addClass("none");
	} else if ($("#iptvType").val() == "manual") {
		$("#vlanList").removeClass("none");
		$("#area_set").addClass("none");
	} else {
		$("#vlanList").addClass("none");
		$("#area_set").removeClass("none");
	}
	top.initIframeHeight();
}

function changeIGMPEn() {
	var className = $("#igmpEn").attr("class");
	if (className == "btn-off") {
		$("#igmpEn").attr("class", "btn-on");
		$("#igmpEn").val(1);
	} else {
		$("#igmpEn").attr("class", "btn-off");
		$("#igmpEn").val(0);
	}
	top.initIframeHeight();
}

function changeSTBEn() {
	var className = $("#stbEn").attr("class");
	if (className == "btn-off") {
		$("#stbEn").attr("class", "btn-on");
		$("#stbEn").val(1);
		$("#vlan_set").removeClass("none");
	} else {
		$("#stbEn").attr("class", "btn-off");
		$("#stbEn").val(0);
		$("#vlan_set").addClass("none");
	}
	top.initIframeHeight();
}

function checkData() {
	G.validate = $.validate({
		custom: function () {
			var vlanId,
				vlanArry = $("#vlanBody").children(),
				len = vlanArry.length,
				i = 0;

			if ($("#stbEn").val() == "1" && $("#iptvType").val() == "manual") {
				var tVlanArr = [];
				for (i = 0; i < len; i++) {
					vlanId = $(vlanArry[i]).children().eq(1).find("input").val();
					if (!(/^[0-9]{1,}$/).test(vlanId)) {
						$(vlanArry[i]).children().eq(1).find("input").focus();
						return _("The VLAN port must be a digit.");
					} else if (parseInt(vlanId, 10) > 4094 || parseInt(vlanId, 10) < 3) {
						$(vlanArry[i]).children().eq(1).find("input").focus();
						return _("VLAN port range: %s",["3-4094"]);
					} else if ($.inArray(vlanId, tVlanArr) != -1) {
						$(vlanArry[i]).children().eq(1).find("input").focus();
						return _("VLAN port cannot be the same");						
					}
					tVlanArr.push(vlanId);
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
	$.GetSetData.getJson("goform/GetIPTVCfg?" + Math.random(), initValue);
}

function initValue(obj) {
	initObj = obj;

	if (obj.wl_mode != "ap") {
		showErrMsg("msg-err", _("The Universal Reapter is enabled. Please go to Wireless Settings to disable Universal Reapter first."),true);
		$("#submit")[0].disabled = true;
	}

	$("#stbEn").attr("class", (obj.stbEn == "1" ? "btn-off" : "btn-on"));
	changeSTBEn();

	$("#igmpEn").attr("class", (obj.igmpEn == "1" ? "btn-off" : "btn-on"));
	changeIGMPEn();


	$("#iptvType").val(obj.iptvType);
	if ($("#iptvType").val() == "shanghai") {
		$("[name='areaVlan'][value='" + obj.vlanId + "']")[0].checked = true;
	}
	changeType();
	var vlanStr = "",
		vlanArry = obj.list.split(",") || "",
		checked = '',
		len = vlanArry.length,
		i = 0;
	if (len < 1) {
		len = 1;
	}
	for (i = 0; i < len; i++) {
		vlanStr += "<tr>";
		if (obj.vlanId == vlanArry[i]) {
			checked = "checked=true";
		} else {
			checked = "";
		}
		vlanStr += "<td class='fixed'><input type='radio' name='selectVlan' " + checked + ">" + "</td>";
		vlanStr += "<td class='fixed'><input alt='vlanIpt' type='text' id='vlanId" + i + "' class='input-small' maxlength='4' value='" + vlanArry[i] + "'>" + "</td>";
		if (i == 0) {
			vlanStr += "<td class='fixed'><input type='button' class='btn add btn-small' value='" + _("Add") + "'></td>";
		} else {
			vlanStr += "<td class='fixed'><input type='button' class='btn del btn-small' value='" + _("Delete") + "'></td>";
		}
		vlanStr += "</tr>";
	}
	$("#vlanBody").html(vlanStr);
	$("#vlanBody input[alt=vlanIpt]").inputCorrect("num");
	listMax = len;

	top.initIframeHeight();
}

function preSubmit() {
	var data,
		subObj = {},
		list = "",
		vlanId,
		vlanArry = $("#vlanBody").children(),
		len = vlanArry.length,
		i = 0;
	for (i = 0; i < len; i++) {
		list += $(vlanArry[i]).children().eq(1).find("input").val() + ",";
	}

	list = list.replace(/[,]$/, "");
	var $selectVlan = $("[name='selectVlan']:checked");
	if ($("#iptvType").val() == "none") {
		vlanId = "";
	} else if ($("#iptvType").val() == "manual") {
		vlanId = $selectVlan.parent().next().find("input").val();
	} else {
		list = "85,51";
		vlanId = $("[name='areaVlan']:checked").val();
	}

	if ($("#stbEn").val() == "1" && $("#iptvEn").val() == "1" && $("#iptvType").val() == "manual") {
		if (!vlanId) {
			showErrMsg("#msg-err", _("Please select a VLAN ID."));
			return;
		}
	}
	subObj = {
		//"iptvEn": $("#iptvEn").val(),
		"stbEn": $("#stbEn").val(),
		"igmpEn": $("#igmpEn").val(),
		"iptvType": $("#iptvType").val(),
		"vlanId": vlanId,
		"list": list
	}
	if (subObj.stbEn == "0") {
		$.extend(subObj, {
			"iptvType": initObj.iptvType,
			"vlanId": initObj.vlanId,
			"list": initObj.list	
		});
	}

	//是否要重启,只要stb相关数据改变了就重启
	var reboot = false; 

	if (initObj.stbEn != subObj.stbEn) {
		reboot = true;
	} else {
		if (initObj.iptvType!=subObj.iptvType||initObj.vlanId!=subObj.vlanId||initObj.list!=subObj.list) {
			reboot = true;
		} else {
			reboot = false;
		}
	}


	data = objTostring(subObj);

	if (reboot && !confirm(_("Please reboot the device if you do any change to the STB. Are you sure to reboot the device?"))) {
		return false;
	}

	$.post("goform/SetIPTVCfg", data, function(str) {
		callback(str, reboot);
	});
}

function callback(str, reboot) {
	if (!top.isTimeout(str)) {
		return;
	}
	var num = $.parseJSON(str).errCode;

	//top.showSaveMsg(num);
	if (num == 0) {
		//getValue();
		if (reboot) {
			//window.location.href = "redirect.html?3";	
			top.$.progress.showPro("reboot");
			$.get("goform/SysToolReboot?"+Math.random(), function(str) {
				//top.closeIframe(num);
				if (!top.isTimeout(str)) {
					return;
				}
			});
		} else {
			top.advInfo.initValue();
			top.showSaveMsg(num);
		}
		
	}
}