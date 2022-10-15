var G = {};
var listMax = 0;
var lanIp = "";
$(function () {
	getValue();
	$("#submit").on("click", function () {
		preSubmit();
	});


	selectObj.initVal = "21";
	$("#inPort").toSelect(selectObj);

	$("#ip").inputCorrect("ip");
	$("#inPort input, #outPort").inputCorrect("num");
	$("#inPort input").attr("maxlength", 5);
	checkData();
	top.loginOut();
	top.initIframeHeight();
	$(".add").on("click", function () {
		G.validate.checkAll();
	});
	$("#portList").delegate(".del", "click", delList);
	$(".input-append ul").on("click", function (e) {
		$("#outPort")[0].value = ($(this).parents(".input-append").find("input")[0].value || "");
	});
	top.$(".main-dailog").removeClass("none");
	top.$(".save-msg").addClass("none");
});

function addList() {
	var str = "";

	if ($("#portBody").children().length >= 16) {
		$("#msg-err").html(_("Up to %s rules is allowed.",[16]));
		return;
	}

	str += "<tr>";
	str += "<td id='ip" + (listMax + 1) + "'>" + $("#ip").val() + "</td>";
	str += "<td id='inPort" + (listMax + 1) + "'>" + $("#inPort")[0].val() + "</td>";
	str += "<td  alt='outPort' id='outPort" + (listMax + 1) + "'>" + $("#outPort").val() + "</td>";
	str += "<td><input type='button' value='" + _("Delete") + "' class='btn del btn-small'></td></tr>";

	$("#portBody").append(str);
	$("#ip").val("");
	$("#inPort").val("");
	$("#outPort").val("");
	listMax++;
	top.initIframeHeight();
};

function delList() {
	var data;
	$(this).parent().parent().remove();
	top.initIframeHeight();
}

function checkData() {
	G.validate = $.validate({
		custom: function () {
			var inPort = "",
				outPort = "",
				ip = "",
				str = "",
				i = 0;

			ip = $("#ip").val();
			inPort = $("#inPort")[0].val();
			outPort = $("#outPort").val();
			if (!(/^([1-9]|[1-9]\d|1\d\d|2[0-1]\d|22[0-3])\.(([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){2}([1-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])$/).test(ip)) {
				$("#ip").focus();
				return _("Please enter a legal IP address.");
			}

			if (ip.replace(/\.[^\.]*$/, "") !== lanIp.replace(/\.[^\.]*$/, "")) {
				$("#ip").focus();
				return _("The internal IP and the login IP(%s) must be in the same network segment.", [lanIp]);
			}

			if (ip === lanIp) {
				$("#ip").focus();
				return _("The internal IP should not be the same with the login IP(%s)", [lanIp]);
			}

			if (!(/^[0-9]{1,}$/).test(inPort)) {
				$("#inPort").find(".input-box").focus();
				return _("Internal port must be a digit.");
			} else {
				if (parseInt(inPort, 10) > 65535 || parseInt(inPort, 10) < 1) {
					$("#inPort").find(".input-box").focus();
					return _("Internal Port Range: 1-65535");
				}
			}

			if (!(/^[0-9]{1,}$/).test(outPort)) {
				$("#outPort").focus();
				return _("External port must be a digit.");
			} else {
				if (parseInt(outPort, 10) > 65535 || parseInt(outPort, 10) < 1) {
					$("#outPort").focus();
					return _("External Port Range: 1-65535");

				}
			}


			/*判断外网端口是否重复*/
			var outPort = $("#outPort").val(),
				outPortRepeat = false;
			$("#portBody tr").each(function() {
				var rowOutPort = $(this).find("td[alt=outPort]").html();
				if (outPort == rowOutPort) {
					outPortRepeat = true;
					return false;
				}
			});
			if (outPortRepeat) {
				return _("WAN port repeats! One WAN port can only be used for one mapping.")
			}
		},

		success: function () {
			addList();
		},

		error: function (msg) {
			if (msg) {
				$("#msg-err").html(msg);
				setTimeout(function () {
					$("#msg-err").html("&nbsp;");
				}, 3000);
			}
			return;
		}
	});
}

function getValue() {
	$.GetSetData.getJson("goform/GetVirtualServerCfg?" + Math.random(), initValue);
}

var selectObj = {
	"initVal": "",
	"editable": "1",
	"size": "small",
	"options": [{
		"21": "21 (FTP)",
		"23": "23 (TELNET)",
		"25": "25 (SMTP)",
		"53": "53 (DNS)",
		"80": "80 (HTTP)",
		"110": "110 (pop3)",
		"1723": "1723 (PPTP)",
		"3389": _("3389(Remote desktop)"),
		"9000": "9000",
		".divider": ".divider",
		".hand-set": _("Manual")
	}]
};

function initValue(obj) {
	var list = obj.virtualList,
		i = 0,
		str = "";

	lanIp = obj.lanIp;

	for (i = 0; i < list.length; i++) {
		str += "<tr>";
		str += "<td id='ip" + (i + 1) + "'>" + (list[i].ip || "") + "</td>";
		str += "<td id='inPort" + (i + 1) + "'>" + (list[i].inPort || "") + "</td>";
		str += "<td alt='outPort' id='outPort" + (i + 1) + "'>" + (list[i].outPort || "") + "</td>";
		str += "<td><input type='button' value='" + _("Delete") + "' class='btn del btn-small'></td></tr>";

	}
	listMax = list.length;
	$("#portBody").html(str);
	top.initIframeHeight();
}

function preSubmit() {
	$("#msg-err").html("&nbsp;");
	var trArry = $("#portBody").children(),
		len = trArry.length,
		i = 0,
		data = "list=";
	for (i = 0; i < len; i++) {
		data += $(trArry[i]).children().eq(0).html() + ",";
		data += $(trArry[i]).children().eq(1).html() + ",";
		data += $(trArry[i]).children().eq(2).html();
		data += "~";
	}
	data = data.replace(/[~]$/, "");
	$.post("goform/SetVirtualServerCfg", data, callback);

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