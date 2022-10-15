var G = {};
var initObj = null;
$(function () {
	getValue();
	$("#premitEn").on("click", changeDmzEn);
	//$(".edit").on("click", editPort);
	$("#ftpLink").on("click", function () {
		var net = $(this).html();
		window.open(net, "");
	});

	//if (flashChecke()) {

	/*setTimeout(function() {
		$("#localLinkCopyBtn").zclip({
			path: 'js/libs/ZeroClipboard.swf',
			copy: function(){
				return $("#localLink").html();
			},
			afterCopy: function(){ //alert(1123)
				showErrMsg("copyMsg", _("Copy successfully"));
			}
		});
	}, 500);*/
	//} else {
	//	$("#localLinkCopyBtn").addClass("none");
	//}

	$("#internetPort").inputCorrect("num");
	$("#internetLink").on("click", function () {
		var internetPort = parseInt($("#internetPort").val(), 10);
		if (internetPort > 0 && internetPort < 65536) {
			var net = $(this).html() + ":" + internetPort;
			window.open(net, "");			
		}
	});

	$("#usbList").delegate(".btn", "click", breakSamba);
	$("#submit").on("click", function () {
		G.validate.checkAll();
	});
	top.initIframeHeight();
	checkData();
	top.loginOut();
	top.$(".main-dailog").removeClass("none");
	top.$(".save-msg").addClass("none");
});

function breakSamba() {
	var data,
		usbName;
	usbName = $(this).parent().parent().find(".control-label span").html();
	data = "action=del&usbName=" + usbName;
	$.post("goform/SetSambaCfg", data, function (str) {
		var num = $.parseJSON(str).errCode;
		if (num == 0) {
			window.location.reload(true);
		}
	});
}

// function editPort() {
// 	$("#internetPort").parent().removeClass("none");
// 	$("#outPort").addClass("none");
// 	$("#internetPort").val($("#outPort").html());
// }

function changeDmzEn() {
	var className = $("#premitEn").attr("class");
	if (className == "btn-off") {
		$("#premitEn").attr("class", "btn-on");
		$("#premitEn").val(1);
		if (initObj.internetLink != "") {
			$("#internet_set").removeClass("none");
		} else {
			$("#internet_set").addClass("none");
			if (initObj.wl_mode != "apclient")
			showErrMsg("msg-err", _("Fail to access the Internet. Please check the WAN connection."), true);
		}
	} else {
		$("#premitEn").attr("class", "btn-off");
		$("#premitEn").val(0);
		showErrMsg("msg-err", " ", true);
		$("#internet_set").addClass("none");
	}
	top.initIframeHeight();
}

function checkData() {
	G.validate = $.validate({
		custom: function () {},

		success: function () {
			preSubmit();
		},

		error: function (msg) {
			return;
		}
	});
}

function getValue() {
	$.GetSetData.getJson("goform/GetSambaCfg?" + Math.random(), initValue);
}

function initValue(obj) {
	var str = "";
	var list = obj.list,
		len = (list.length > 3 ? 3 : list.length),
		i = 0;

	initObj = obj;
	for (i = 0; i < len; i++) {
		var usbProgressHTML = "",
			$usbProgress = null;
		usbProgressHTML += '<div class="control-group">';
		usbProgressHTML += '<label class="control-label text-ellipsis"><span>' + list[i].name + '</span>'+_(":")+'</label>';
		usbProgressHTML += '<div class="controls">';
		usbProgressHTML += '<span class="usb-progress"></span>'
		/*str += '<div class="area-percent">';
		str += '<div class="percent" style="width:' + list[i].memory + '">';
		str += '<div class="percent-text">' + list[i].memory + '</div>';
		str += '</div>';
		str += '</div>';*/
		usbProgressHTML += '<input type="button" value="'+_("Safely Eject") + '" class="btn btn-small" style="height: 32px;margin-left: 10px;">';
		usbProgressHTML += '</div>';
		usbProgressHTML += '</div>';
		$usbProgress = $(usbProgressHTML);
		$usbProgress.find(".usb-progress").
			toProgress(parseFloat(list[i].memory.replace(/[^\d\.]/g, ""), 10), 160, _("(Free Space) %s",[getSpaceSpecify(list[i].memoryUnUse)])).
			css("verticalAlign", "top");
		$(usbList).append($usbProgress);
	}
	//$("#usbList").html(str);
	$("#password").val(obj.password);
	if (obj.ftpLink == "") {
		$("#ftpLink").parent().parent().parent().addClass("none");
		$("#localLink").parent().parent().parent().addClass("none");
	}
	$("#ftpLink").html("ftp://" + obj.ftpLink + ":21");
	$("#localLink").html("\\\\" + obj.ftpLink);

	if (obj.internetLink != "") {
		$("#internetLink").html("ftp://" + obj.internetLink);
	} else {
		$("#internet_set").addClass("none");
	}
	$("#premitEn").attr("class", (obj.premitEn == "1" ? "btn-off": "btn-on"));
	changeDmzEn();

	if (obj.wl_mode && obj.wl_mode == "apclient") {
		$("#internet_set_wrap").addClass("none");
	}
	//$("#outPort").html(obj.outPort);
	$("#internetPort").val(obj.internetPort);
	top.initIframeHeight();
}

//小于1G转换成M，大于1T 转成T做单位
function getSpaceSpecify(spaceG) {
	var space = parseFloat(spaceG, 10),
		unitStr = "G";

	if (space < 1) {
		space = space * 1000;
		unitStr = "M";
	} else if (space > 1000) {
		space = space / 1000;
		unitStr = "T";
	}
	return (parseInt(space*100, 10)/100 + unitStr);
}


function preSubmit() {
	var data,
		subObj = {},
		internetPort = ($("#premitEn").val() == 1?$("#internetPort").val():initObj.internetPort);

	subObj = {
		"password": $("#password").val(),
		"premitEn": $("#premitEn").val(),
		"internetPort": internetPort
	};
	data = objTostring(subObj);
	$.post("goform/SetSambaCfg", data, callback);
}

function callback(str) {
	if (!top.isTimeout(str)) {
		return;
	}
	var num = $.parseJSON(str).errCode;


	top.showSaveMsg(num);
	if (num == 0) {
		//getValue();
		top.usbInfo.initValue();
	}
}

function flashChecke() {
    var hasFlash = 0; //是否安装了flash
    var flashVersion = 0; //flash版本
    try {
	    if (document.all) {
	      var swf = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
	      if (swf) {
	        hasFlash = 1;
	        VSwf = swf.GetVariable("$version");
	        flashVersion = parseInt(VSwf.split(" ")[1].split(",")[0]);
	      }
	    } else {
	      if (navigator.plugins && navigator.plugins.length > 0) {
	        var swf = navigator.plugins["Shockwave Flash"];
	        if (swf) {
	          hasFlash = 1;
	          var words = swf.description.split(" ");
	          for (var i = 0; i < words.length; ++i) {
	            if (isNaN(parseInt(words[i]))) continue;
	            flashVersion = parseInt(words[i]);
	          }
	        }
	      }
	    }
    } catch (e) {
	    hasFlash = 1; //是否安装了flash
	    flashVersion = 1; //flash版本
    }

    return (hasFlash==1);
}