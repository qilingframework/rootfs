var G = {};
$(function() {
	getValue();
	$("#submit").on("click",function() {
		G.validate.checkAll();	
	});
	$("#cloneType").on("change",changeType);
	checkData();

	$("#wanMTU").inputCorrect("num");
	$("#mac").inputCorrect("mac");
	top.$(".main-dailog").removeClass("none");
	top.$(".save-msg").addClass("none");
});

function checkData() {
	G.validate = $.validate({
		custom: function() {
		},
		
		success: function () {
			preSubmit();
		},
		
		error: function (msg) {
			return;
		}
	});	
}

function changeType() {
	if($("#cloneType").val() == "0" || $("#cloneType").val() == "1") {
		$("#other-mac").addClass("none");
		$("#macaddress").removeClass("none");
		if($("#cloneType").val() == "0") {
			$("#mac-address").html(_("Default MAC Address:") + G.data.defMac.toUpperCase());	
		} else {
			$("#mac-address").html(_("Local Host MAC Address:") + G.data.deviceMac.toUpperCase());	
		}
	} else {
		$("#other-mac").removeClass("none");
		$("#macaddress").addClass("none");
	}
	top.initIframeHeight();
}

function getValue() {
	$.GetSetData.getJson("goform/AdvGetMacMtuWan?"+Math.random(),initValue);
}

function initValue(obj) {
	top.$(".main-dailog").removeClass("none");
	top.$("iframe").removeClass("none");
	top.$(".loadding-page").addClass("none");
	/*obj = {
		wanType: "2",
		wanMTU:"1492",
		wanSpeed: "2",
		cloneType: "2",
		defMac: "22:22:22:22:22:22",
		deviceMac: "33:33:33:33:33:33",
		mac: "44:44:44:44:44:44"
	};*/
	if(obj.wanType == "2") {
		$("#wanMTU").attr("data-options",'{"type": "num", "args":[576,1492]}');	
	} else {
		$("#wanMTU").attr("data-options",'{"type": "num", "args":[576,1500]}');	
	}
	G.data = obj;
	$("#wanMTU").val(obj["wanMTU"]);
	$("#wanSpeed").val(obj["wanSpeed"]);
	$("#cloneType").val(obj["cloneType"]);
	$("#mac").val(obj.mac).addPlaceholder(_("Format: XX:XX:XX:XX:XX:XX"));
	changeType();	
}

function preSubmit() {
	var data,
		mac;
	if($("#cloneType").val() == "0") {
		mac = G.data.defMac.toUpperCase();
	} else if($("#cloneType").val() == "1") {
		mac = G.data.deviceMac.toUpperCase();
	} else {
		mac = $("#mac").val().toUpperCase();
	}
	data = "wanMTU=" + parseInt($("#wanMTU").val(), 10) + "&wanSpeed=" + $("#wanSpeed").val() + "&cloneType=" + $("#cloneType").val() + "&mac="+mac;
	$.post("goform/AdvSetMacMtuWan",data,callback);
}

function callback(str) {
	if(!top.isTimeout(str)) {
		return;	
	}
	var num = $.parseJSON(str).errCode;
	top.showSaveMsg(num);
	if(num == 0) {
		//getValue();
		top.advInfo.initValue();
	}
}