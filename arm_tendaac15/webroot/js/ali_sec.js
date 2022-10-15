$(function () {
	$("#dnsEnable").on("click", changeDnsEn);
	getValue();
	top.loginOut();

	top.$(".main-dailog").removeClass("none");
	top.$(".save-msg").addClass("none");
});

function getValue() {
	$.getJSON("goform/initDnsCheck?" + Math.random(), initValue);
}

function initValue(obj) {
	//type: 1
	var en = obj.dnsEnable;
	var len = obj.dnsList.length,
		i = 0,
		str = "",
		type = "";
	top.$(".main-dailog").removeClass("none");
	top.$("iframe").removeClass("none");
	top.$(".loadding-page").addClass("none");

	if (en == 1) {
		$("#dnsEnable").attr("class", "btn-on");
		$("#table-list, #table_head").removeClass("hidden");
	} else {
		$("#dnsEnable").attr("class", "btn-off");
		$("#table-list, #table_head").addClass("hidden");
	}
	for (i = 0; i < len; i++) {
		if (obj.dnsList[len - i - 1].type == 1) {
			type = "用户许可";
		} else {
			type = "禁止访问";
		}
		str += "<tr class='row" + i % 2 + "'>";
		str += "<td>" + (i + 1) + "</td>";
		str += "<td class='notd'></td>";
		str += "<td>" + obj.dnsList[len - i - 1].date + "</td>";
		str += "<td class='notd'></td>";
		str += "<td>" + type + "</td>";
		str += "<td class='notd'></td>";
		str += "<td class='fixed' title='" + obj.dnsList[len - i - 1].url + "'>" + obj.dnsList[len - i - 1].url + "</td>";
		str += "<td class='notd'></td>";
		str += "<td>" + "钓鱼网站或恶意网站" + "</td>";
		str += "</tr>";
	}
	$("#list").html(str);
}

function changeDnsEn() {
	var className = $("#dnsEnable").attr("class"),
		data;
	if (className == "btn-off") {
		$("#dnsEnable").attr("class", "btn-on");
		$("#dnsEnable").val(1);
		$("#table-list, #table_head").removeClass("hidden");

	} else {
		$("#dnsEnable").attr("class", "btn-off");
		$("#dnsEnable").val(0);
		$("#table-list, #table_head").addClass("hidden");
	}
	data = "dnsEnable=" + $("#dnsEnable").val();
	$.post("goform/openDnsCheck", data, callback);
}

function callback(str) {
	if (!top.isTimeout(str)) {
		return;
	}
	var num = $.parseJSON(str).errCode;
	top.showSaveMsg(num, "", 2);
}