<!DOCTYPE html>
<html><head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta http-equiv="pragma" content="no-cache">
<meta http-equiv="cache-control" content="no-cache,must-revalidate">
<title>IP-COM | LOGIN</title>
<link type="text/css" rel="stylesheet" href="css/style.css">
<style>#top{ position: absolute; /*公共*/ top: 0;left: 0; width: 100%;height: 55px；}
#top_left{width:20%;height:24px;float:left;background:url(../images/LOGO.gif) no-repeat 0 0;_background:none;_filter: progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled=true, sizingMethod=crop, src='images/LOGO.gif');margin:20px 0px 0px 20px;display:inline;}
.loagin_title{height:30px; line-height:35px; font-size:16px; background:url(images/login_top.gif) repeat-x; color:#fff; font-weight:bold; text-align:center}
.tdbt_click
{
COLOR: red; FONT-SIZE: 12px; FONT-STYLE: normal; FONT-VARIANT: normal; FONT-WEIGHT: normal; HEIGHT: 20px; LINE-HEIGHT: normal; cursor:pointer; width:80px; background:url(images/bt_over_login.gif); border-style:none; border:0px; FONT-FAMILY:"Trebuchet MS";
}

.tdbt_over
{
COLOR: red; FONT-SIZE: 12px; FONT-STYLE: normal; FONT-VARIANT: normal; FONT-WEIGHT: normal; HEIGHT: 19px; LINE-HEIGHT: normal; cursor:pointer; width:80px; background: #999; border:1px solid #000;FONT-FAMILY:"Trebuchet MS";
}
.tdbt_out
{
COLOR: #000000; FONT-SIZE: 12px; FONT-STYLE: normal; FONT-VARIANT: normal; FONT-WEIGHT: normal; HEIGHT: 20px; LINE-HEIGHT: normal; cursor:pointer; width:80px; background: #CCC; border:1px solid; FONT-FAMILY:"Trebuchet MS";
}
body{ FONT-FAMILY:"Trebuchet MS";}
#massage_text{ height:20px;color:red;}</style>
 <!--[if IE 6]>
    	<script type="text/javascript"> 
        	var IE6_flag =1;
     	</script>
 <![endif]-->
<script type="text/javascript">var login_status = 0;

var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
function utf16to8(str) {
    var out, i, len, c;

    out = "";
    len = str.length;
    for(i = 0; i < len; i++) {
        c = str.charCodeAt(i);
        if ((c >= 0x0001) && (c <= 0x007F)) {
            out += str.charAt(i);
        } else if (c > 0x07FF) {
            out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
            out += String.fromCharCode(0x80 | ((c >>  6) & 0x3F));
            out += String.fromCharCode(0x80 | ((c >>  0) & 0x3F));
        } else {
            out += String.fromCharCode(0xC0 | ((c >>  6) & 0x1F));
            out += String.fromCharCode(0x80 | ((c >>  0) & 0x3F));
        }
    }
    return out;
}

function base64encode(str) {
    var out, i, len;
    var c1, c2, c3;


    len = str.length;
    i = 0;
    out = "";
    while(i < len) {
        c1 = str.charCodeAt(i++) & 0xff;
        if(i == len)
        {
            out += base64EncodeChars.charAt(c1 >> 2);
            out += base64EncodeChars.charAt((c1 & 0x3) << 4);
            out += "==";
            break;
        }
        c2 = str.charCodeAt(i++);
        if(i == len)
        {
            out += base64EncodeChars.charAt(c1 >> 2);
            out += base64EncodeChars.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
            out += base64EncodeChars.charAt((c2 & 0xF) << 2);
            out += "=";
            break;
        }
        c3 = str.charCodeAt(i++);
        out += base64EncodeChars.charAt(c1 >> 2);
        out += base64EncodeChars.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
        out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >>6));
        out += base64EncodeChars.charAt(c3 & 0x3F);
    }
    return out;
}

function str_encode(str){
    return base64encode(utf16to8(str));
}
function bt_mouse_click(e)
{
	e.className = "tdbt_click";
}

function bt_mouse_over(e)
{
	e.className = "tdbt_over";
}

function bt_mouse_out(e)
{
	e.className = "tdbt_out";
}
function init()
{
	var pathname_arr = window.location.toString().split('?');	
	if((typeof IE6_flag != 'undefined') &&  IE6_flag){
		document.getElementById('massage_text').innerHTML = ('您的IE浏览器版本过低，请升级到IE8以上!');
		document.getElementById("loginButton").disabled = true;
	}
	document.getElementById("username").focus();
	
	login_status = pathname_arr[1];
	if (login_status ==0){
		document.getElementById('massage_text').innerHTML = ('您输入的用户名或密码错误，请重新输入。');
	}
	if(parent.window!=window) { 
		parent.window.location = window.location.toString();
	}
	
}
function clearAll()
{
	document.getElementById("username").value="";
	document.getElementById("pass_word").value="";	
}
function preSubmit()
{
	if(document.getElementById("username").value=="")
	{
		document.getElementById('massage_text').innerHTML = ('请您输入用户名。');
		document.getElementById("username").focus();
		return false;	
	}	
	if(document.getElementById("pass_word").value=="")
	{
		document.getElementById('massage_text').innerHTML = ('请您输入密码。');
		document.getElementById("pass_word").focus();
		return false;	
	}
	
	document.getElementById("pwd").value = str_encode(document.getElementById("pass_word").value,document.getElementById("pass_word").value.length);
	document.forms[0].submit();
	
}
function keydown(evt)
{
	var keyCode = evt.keyCode ? evt.keyCode : evt.which ? evt.which : evt.charCode;
	if (keyCode==13) {
		preSubmit();
	}
}</script>
<script src="lang/b28n_async.js"></script>
<script>
B.setTextDomain(["translate"]);
</script>
</head>

<body onload="init()" onkeydown="keydown(event)">

<div id="top">
    <div id="top_left">
   </div>
</div>
<div style="text-align:center; margin-top:200px;">
    <form method="post" action="/login/Auth">
        <div id="mid_content" style="border:outset 2px #999; height:200px; width:400px; background-color: #e5e5e5; margin:auto">
            <div class="loagin_title">IP-COM &lt;%getcfm("sys.targets");%&gt; 路由器</div>
            <div style="border:outset 1px #999; background-color:#999; height:2px; font-size:1px; margin-bottom:10px;"></div>
            <div id="massage_text" style="height:20px;"></div>
            <div style="margin-bottom:10px;">
                <div style="height:25px; line-height:25px; display:inline-block; width:130px; float:left; text-align:right">用户名:</div><div style="width:260px; display:inline-block; position:relative; left:0px; text-align:left">
                <input type="text" style="width:200px" name="username" id="username" maxlength="20" autocomplete="off">
                </div>
                </div>
                
                <div style="margin-bottom:15px;">
                <div style="height:25px; line-height:25px; display:inline-block; width:130px; float:left; text-align:right">密码:</div><div style="width:260px; display:inline-block; position:relative; left:0px; text-align:left">
                <input type="password" style="width:200px" id="pass_word" maxlength="20" autocomplete="off">
                </div>
            </div>
            
            <div style="height:30px; padding-left:36px; text-align:center;">
            <input id="loginButton" type="button" value="登 录" class="tdbt_out" onmouseover="bt_mouse_over(this)" onmouseout="bt_mouse_out(this)" onmousedown="bt_mouse_click(this)" onmouseup="bt_mouse_over(this)" onclick="preSubmit()">
            <input type="button" value="取 消" class="tdbt_out" onmouseover="bt_mouse_over(this)" onmouseout="bt_mouse_out(this)" onmousedown="bt_mouse_click(this)" onmouseup="bt_mouse_over(this)" onclick="clearAll()">
            </div>
        </div>
		<input type="hidden" name="password" id="pwd">
    </form>
</div>






</body></html>