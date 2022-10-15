var G = {},
	initObj = null,
	pagination =- null;
$(function () {
	getValue();
	$("#export").on("click", exportLog);
	top.loginOut();
	top.$(".main-dailog").removeClass("none");
	top.$(".save-msg").addClass("none");
});


function exportLog() {
	window.location = "cgi-bin/DownloadLog/syslog.txt";
}

function getValue() {
	$.getJSON("goform/GetSySLogCfg?" + Math.random(), function(obj) {
		initObj = obj;
		obj.sort(function(a, b) {
			if (parseInt(a.index,10) < parseInt(b.index, 10)) {
				return 1;
			} else {
				return -1;
			}
		});
		$.each(obj, function(i, item){item.index = i+1;});
		pagination = new Pagination({
			pageEleWrapId: "logPagination",
			dataArr: initObj, 
			pageItemCount: 10,
			getDataUrl: "",
			handle: initValue,//每一页数据用户的处理函数
			getAll: true,
			param: ""
		});
		top.initIframeHeight();

	});
}

function initValue(obj) {
	var len = obj.length,
		i = 0,
		str = "";
	for (i = 0; i < len; i++) {
		str += "<tr>";
		str += "<td>" + obj[i].index + "</td>";
		str += "<td>" + obj[i].time + "</td>";
		str += "<td>" + obj[i].type + "</td>";
		str += "<td class='sys-log-txt fixed' title='" + obj[i].log + "'>" + obj[i].log + "</td>";
		str += "</tr>";
	}
	$("#logBody").html(str).find(".sys-log-txt").each(function(i) {$(this).attr("title", obj[i].log);});
	top.initIframeHeight();
}