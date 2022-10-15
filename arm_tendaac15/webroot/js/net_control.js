var G = {},
	initDataList = [],
	editing = false,
	ajaxInterval = null;

$(function () {
	$("#netControlEn").on("click", changeControlEn);
	$("#submit").on("click", function () {
		G.validate.checkAll();
	});

	getValue();
	checkData();
	top.loginOut();
	top.initIframeHeight();
	top.$(".main-dailog").removeClass("none");
	top.$(".save-msg").addClass("none");
});

function getValue() {
	$.GetSetData.getJson("goform/GetNetControlList?" + Math.random(), function(list) { 
		initDataList[0] = list[0];
		updateData(list);

		ajaxInterval = new AjaxInterval({
			url: "goform/GetNetControlList",
			successFun: updateData,
			failFun: failUpdate,
			gapTime: 2000
		});

		$("#netControlEn").attr("class", (initDataList[0].netControlEn == "1"?"btn-off":"btn-on"));
		changeControlEn();

	});
}

function changeControlEn() {
	var className = $("#netControlEn").attr("class");
	if (className == "btn-off") {
		$("#netControlEn").attr("class", "btn-on");
		$("#netControlEn").val(1);
		$("#netList").removeClass("none");
		ajaxInterval.startUpdate();
	} else {
		$("#netControlEn").attr("class", "btn-off");
		$("#netControlEn").val(0);
		$("#netList").addClass("none");
		ajaxInterval.stopUpdate();

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


//更新数据
function updateData(dataList) {
	for(var i = 1; i < initDataList.length; i++){
		initDataList[i].offline = true;//先置为下线，要是更新的数据还有此mac的数据证明在线
		for (var j = dataList.length - 1; j >= 1; j--) {
			dataList[j].offline = false;
			if(dataList[j].mac == initDataList[i].mac){
				initDataList[i] = dataList[j];
				dataList.splice(j, 1);
				break;
			}	
		};
	}
	dataList.shift();
	initDataList = initDataList.concat(dataList);
	drawList(initDataList);
}

//更新数据失败
function failUpdate() {
	updateData([""]);
}

//用数据创建（更新）列表：table 
function drawList(dataList) {
	var rowData = null,
		upSpeed,
		downSpeed;

	$("#netBody tr").each(function() {
		var mac = $(this).attr('alt');
		for (var i = dataList.length-1; i >= 1; i--) {
			rowData = dataList[i];
			if (mac == rowData["mac"]) {
				//通过mac匹配对应行 更新该行数据

				//已经下线, 且数据未改变，且表不在编辑状态，删除html 删除该条记录
				//if (!editing && rowData.offline && $(this).find("[alt=limitUp]")[0].val == rowData.limitUp && $(this).find("[alt=limitDown]")[0].val == rowData.limitDown) {
				if (!editing && rowData.offline) {
					$(this).remove();
					dataList.splice(i, 1);
					return;
				}

				upSpeed = (parseFloat(rowData.upSpeed)/128).toFixed(2);//速度统一转换成Mbps
				downSpeed = (parseFloat(rowData.downSpeed)/128).toFixed(2);

				$(this).find('[alt=hostName]').html(rowData["hostName"]);
				$(this).find('[alt=netIp]').html(rowData["ip"]);
				$(this).find('[alt=netSpeed]').html(upSpeed + "Mbps<br>" + downSpeed + "Mbps");
				rowData.exist = true;
				return;
			}
		}
	});

	//新记录添加到表尾
	for (var i = 1; i < dataList.length; i++) {
		rowData = dataList[i];
		if (!rowData.exist) {
			addRow(rowData);
		}
	};
}


//添加一条记录
function addRow(obj) {
	var selectObj = {
		"initVal": "",
		"editable": "1",
		"seeAsTrans": true,
		"size": "small",
		"options": [{
			//"0": _("Denied"),
			"0": _("Unlimited"),
			"1": "1Mbps",
			"2": "2Mbps",
			"4": "4Mbps",
			".divider": ".divider",
			".hand-set": _("Manual")
		}]
	},
	upSpeed = (parseFloat(obj.upSpeed)/128).toFixed(2);//速度统一转换成Mbps
	downSpeed = (parseFloat(obj.downSpeed)/128).toFixed(2);
	limitUp = (parseFloat(obj.limitUp)/128).toFixed(2);
	limitDown = (parseFloat(obj.limitDown)/128).toFixed(2);
	str = "";


	str += "<tr alt='"+obj.mac+"'>";
	str += "<td alt='hostName' class='dev-name fixed' title='"+ obj.hostName +"'>" + obj.hostName + "</td>";
	str += "<td alt='netIp'>" + obj.ip + "</td>";
	str += "<td alt='netSpeed' class='net-speed-txt-td'>" +upSpeed + "Mbps<br>" + downSpeed + "Mbps</td>";
	str += "<td><span alt='limitUp' class='validatebox'> </span></td>";
	str += "<td><span alt='limitDown' class='validatebox'> </span></td>";
	$("#netBody").append(str);
	$("#netBody tr:last").find(".dev-name").attr("title", obj.hostName);
	$("#netBody tr:last").find("span[alt=limitUp]").toSelect(selectObj)[0].val(limitUp);
	$("#netBody tr:last").find("span[alt=limitDown]").toSelect(selectObj)[0].val(limitDown);
	$("#netBody tr:last input[type=text]").inputCorrect("float").on("focus", function() {
		this.value = this.value.replace(/[^\d\.]/g, "");
	}).on("blur", function() {
		setIptValue.call(this);
	}).each(function() {
		setIptValue.call(this);
	});

	function setIptValue() {
		var val = this.value.replace(/[^\d\.]/g, "");

		val = (val == ""?0:val);
		val = parseFloat(val > 2000 ? 2000 : parseFloat(val).toFixed(2));
		$(this).parent(".input-append").find("[type=hidden]").val(val);
		/*if (parseFloat(val, 10) >= 2000) {
			this.value = _("Unlimited");
		} else */
		if (parseFloat(val, 10) === 0) {
			this.value = _("Unlimited");
		} else {
			this.value = val + "Mbps";
		}		
	}

	top.initIframeHeight();
}

//删除一条记录
function delRow(macAddress) {

}

function preSubmit() {
	var data = "",
		ip = "",
		i = 0,
		str = "",
		$row = $("#netBody tr"),
		len = $("#netBody").children().length,
		limitUp = 0,
		limitDown = 0;

	data += "netControlEn=" + $("#netControlEn").val();
	str = "&list=";
	if ($("#netControlEn").val() == "1") {
		for (i = 0; i < len; i++) {
			limitUp = parseFloat($row.eq(i).find("[alt=limitUp]")[0].val().replace(/[^\d\.]/g, ""));
			limitDown = parseFloat($row.eq(i).find("[alt=limitDown]")[0].val().replace(/[^\d\.]/g, ""));

			str += ((limitUp >= 2000&&limitDown >= 2000)?"0":"1") + ";";
			str += $row.eq(i).attr("alt") + ";";
			str += limitUp*128 + ";";
			str += limitDown*128 + "~";
		}
	}
	str = str.replace(/[~]$/, "");
	data = data + str;
	$.post("goform/SetNetControlList", data, callback);
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