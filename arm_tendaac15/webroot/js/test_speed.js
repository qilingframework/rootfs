

$(function(){
	
	

	$("#test_speed").on("click", function(){
		//var data = $("#confirm-tip").attr("data-val");
		top.staInfo.getCloudInfo();
	});
	$("#cancel_speed").on("click", cancelSpeed);
	
	top.$(".save-msg").addClass("none");
	top.$(".main-dailog").removeClass("none");
})


function cancelSpeed() {
		
	top.staInfo.closeIframe();
	
}