$(function () {
	getValue();
	top.loginOut();
	top.$(".main-dailog").removeClass("none");
	top.$(".save-msg").addClass("none");
});

function getValue() {
	$.GetSetData.getJson("goform/GetSystemStatus?" + Math.random(), initValue);
}


function initValue(obj) {
	for (var prop in obj) {
		$("#" + prop).text(obj[prop]);
	}
	top.$(".main-dailog").removeClass("none");
	top.$("iframe").removeClass("none");
	top.$(".loadding-page").addClass("none");

	$("#adv_mac").text(obj.adv_mac.toUpperCase());
	$("#adv_run_time").html(formatSeconds(obj["adv_run_time"]));
	$("#adv_connect_time").html(formatSeconds(obj["adv_connect_time"]));
	if (obj["adv_connect_type"] == "0") {
		$("#adv_connect_type").html(_("DHCP"));
	} else if (obj["adv_connect_type"] == "1") {
		$("#adv_connect_type").html(_("Static IP"));
	} else {
		$("#adv_connect_type").html(_("Internet Connection"));
	}

	if (obj["adv_connect_type"] == "apclient") {
		$("#wanStatusWrap").addClass("none");
	} else {
		$("#wanStatusWrap").removeClass("none");
	}

	if (obj["adv_connect_status"] == 0) {
		$("#adv_connect_status").html(_("No Ethernet cable"));
	} else if (obj["adv_connect_status"] == 1) {
		$("#adv_connect_status").html(_("Disconnected"));
	} else if (obj["adv_connect_status"] == 2) {
		$("#adv_connect_status").html(_("Connecting"));
	} else if (obj["adv_connect_status"] == 3) {
		$("#adv_connect_status").html(_("Connected"));
	} else {
		$("#adv_connect_status").html(_("Disconnected"));
	}

	if (obj.wifi_enable == 0) {
		//表示wifi 2.4G关闭
		$("#adv_wrl_en").html(_("Disabled"));
		$(".wifi-enable").addClass("none");
	} else {
		$(".wifi-enable").removeClass("none");

		if (obj["adv_wrl_en"] == 1) {
			$("#adv_wrl_en").html(_("Invisible"));
		} else {
			$("#adv_wrl_en").html(_("Visible"));
		}
		if (obj["adv_wrl_band"] == "auto") {
			$("#adv_wrl_band").html(_("20/40"));
		}

		if (obj["adv_wrl_sec"] == "none") {
			$("#adv_wrl_sec").html(_("Unencrypted"));
		} else {
			$("#adv_wrl_sec").html(_("WPA/WPA2-PSK"));
		}

	}

	if (obj.wifi_enable_5g == 0) {
		//表示wifi关闭了	

		$("#adv_wrl_en_5g").html(_("Disabled"));

		$(".wifi-enable_5g").addClass("none");
	} else {
		$(".wifi-enable_5g").removeClass("none");

		if (obj["adv_wrl_en_5g"] == 1) {
			$("#adv_wrl_en_5g").html(_("Invisible"));
		} else {
			$("#adv_wrl_en_5g").html(_("Visible"));
		}


		if (obj["adv_wrl_sec_5g"] == "none") {
			$("#adv_wrl_sec_5g").html(_("Unencrypted"));
		} else {
			$("#adv_wrl_sec_5g").html(_("WPA/WPA2-PSK"));
		}
	}

	//top.initIframeHeight();
}