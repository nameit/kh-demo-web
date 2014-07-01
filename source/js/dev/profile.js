/**
 * 基本资料
 * @requires <jQuery, pin, diySelect, overlay, validate>
 * @author wuwj@cairenhui.com
 */

$(function () {
	// select 初始化
	$('#depart').diySelect();
	$('#job').diySelect();
	$('#edu').diySelect();

	// 表单验证
	$('#content').validator({
	    items: [
	        {
	            selector: '#name',
	            explain: '6位数字',
	            required: true,
	            validate: function () {
	                var sName = $('#name').val();
	                return validateName($('#name').val());
	            },
	            params: function () {
	                return { name: "John", location: "Boston" };
	            },
	            remote: 'json/example.json',
	            ajaxCallback: function (data) {}
	        },
	        {
	            selector: '#cid',
	            explain: '7位数字',
	            required: true,
	            params: function () {
	                return { name: "John", location: "Boston" };
	            },
	            validate: function () {
	                var sCid = $('#cid').val();
	                return validateCID(sCid);
	            },
	            remote: 'json/example.json',
	            ajaxCallback: function (data) {}
	        },
	        {
	            selector: '#cidAddr',
	            explain: '7位数字',
	            required: true,
	            params: function () {
	                return { name: "John", location: "Boston" };
	            },
	            validate: function () {
	                var sCIDAddr = $('#cidAddr').val();
	                return validateCIDAddr(sCIDAddr);
	            },
	            remote: 'json/example.json',
	            ajaxCallback: function (data) {}
	        },
	        {
	            selector: '#address',
	            explain: '7位数字',
	            required: true,
	            params: function () {
	                return { name: "John", location: "Boston" };
	            },
	            validate: function () {
	                var sAddress = $('#address').val();
	                return validateAddress(sAddress);
	            },
	            remote: 'json/example.json',
	            ajaxCallback: function (data) {}
	        },
	        {
	            selector: '#postCode',
	            explain: '7位数字',
	            required: true,
	            params: function () {
	                return { name: "John", location: "Boston" };
	            },
	            validate: function () {
	                var sPostCode = $('#postCode').val();
	                return validatePostCode(sPostCode);
	            },
	            remote: 'json/example.json',
	            ajaxCallback: function (data) {}
	        },
	        {
	            selector: '#depart',
	            explain: '7位数字',
	            required: true,
	            params: function () {
	                return { name: "John", location: "Boston" };
	            },
	            validate: function () {
	                var sDepart = $('#depart').val();
	                return validateDepart(sDepart);
	            },
	            remote: 'json/example.json',
	            ajaxCallback: function (data) {}
	        },
	        {
	            selector: '#job',
	            explain: '7位数字',
	            required: true,
	            params: function () {
	                return { name: "John", location: "Boston" };
	            },
	            validate: function () {
	                var sJob = $('#job').val();
	                return validateJob(sJob);
	            },
	            remote: 'json/example.json',
	            ajaxCallback: function (data) {}
	        },
	        {
	            selector: '#edu',
	            explain: '7位数字',
	            required: true,
	            params: function () {
	                return { name: "John", location: "Boston" };
	            },
	            validate: function () {
	                var sEdu = $('#edu').val();
	                return validateEdu(sEdu);
	            },
	            remote: 'json/example.json',
	            ajaxCallback: function (data) {}
	        }
	    ],
	    submit: {
	        btn: $('#nextBtn'),
	        remote: 'json/example.json',
	        params: function () {
	            return { name: "John", location: "Boston" };
	        },
	        beforeAjax: function () {
	            return true;
	        },
	        ajaxSubmitCallback: function () {}
	    }
	});
});

/**
 * 手机号码校验
 * @param sMobile
 */
function validateMobile(sMobile) {
	//手机号码规则(11位)
	var regMobile = /^1\d{10}$/;
	if(!regMobile.test(sMobile)) {
		return "手机号码填写错误";
	} else {
		return "success";
	}
}

//验证手机号码
function validateMphone(field) {
	$(field).val(field.value.replace(/\s/g, ''));
	if (/^1\d{10}$/.test(field.value)) {
		field.handleSuccess();
		$(field).data('localPass', true);
		if($('#getCode').find("#seconds").length == 0){
			if(null != $("#mobile").data("remotePass") && !$("#mobile").data("remotePass")){
				$('#getCode').prop('disabled', true);
			}else{
				$('#getCode').prop('disabled', false);
			}
		}
	} else {
		field.handleFail('手机号码填写错误');
		$(field).data('localPass', false);
		if($('#getCode').find("#seconds").length == 0){
			$('#getCode').prop('disabled', true);
		}
	}
}

//验证验证码
function validateCode(validateCode){
	if (/^\d{4}$/.test(validateCode)) {
		return "success";
	} else {
		return "验证码填写错误";
	}
}

/**
 * 姓名校验
 * @param sName
 */
function validateName(sName) {
	//姓名规则(2-20个字符)
	var sLength = getLength(sName);
	if (sLength <= 20 && sLength >= 2) {
		return "success";
	} else {
		return "姓名不符合规范";
	}
}

/**
 * 身份证号校验
 * @param cidStr
 */
function validateCID(cidStr) {
 	var iSum = 0;

	//身份证正则表达式(18位)
	//var regCID = /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{4}$/;
	cidStr = cidStr.replace(/x/g, "X");

	if (!/^\d{17}(\d|X)$/i.test(cidStr))
		return "身份证号码填写错误";//身份证号码位数有误
	//cidStr = cidStr.replace(/x$/i, "a");

	if (cidCity[parseInt(cidStr.substr(0,2))] == null)
		return "身份证号码填写错误";//地区编码有误

	try{
		var today = new Date();
		var delt = parseInt(today.getFullYear()) - parseInt(cidStr.substr(6,4));

		if (delt > 150)
			return "身份证号码填写错误";//你活得太久了，快去申请吉尼斯吧
		if (delt <= 0)
			return "身份证号码填写错误";//好有远见，这么快就在为后代申请身份证了啊，佩服！

		var sBirthday = cidStr.substr(6,4) + "-" + Number(cidStr.substr(10,2)) + "-" + Number(cidStr.substr(12,2));
		var d = new Date(sBirthday.replace(/-/g, "/"));
		if (sBirthday != (d.getFullYear() + "-" + (d.getMonth()+1) + "-" + d.getDate()))
			return "身份证号码填写错误";//生日有误

		if (calcAge(cidStr.substring(6, 14)) < 18)
			return "未满18周岁不能开户";

		var ai = cidStr.substr(0, 17);

		var totalMulAiWi = 0;
		for (var i = 0; i < 17; i++) {
			totalMulAiWi = totalMulAiWi + parseInt(ai.charAt(i)) * parseInt(wi[i]);
		}
		var modValue = totalMulAiWi % 11;
		var strVerifyCode = valCodeArr[modValue];
		ai = ai + strVerifyCode;

		if (ai != cidStr) {
			return "身份证号码填写错误";//校验位有误
		}
	} catch(e) {
		return "身份证号码填写错误";
	}

	return "success";
	//return cidCity[parseInt(cidStr.substr(0,2))] + "," + sBirthday + "," + (cidStr.substr(16,1)%2 ? "男":"女");
}

//身份证地区编码
var cidCity = {
	11:"北京",12:"天津",13:"河北",14:"山西",15:"内蒙古",21:"辽宁",22:"吉林",23:"黑龙江",31:"上海",32:"江苏",33:"浙江",34:"安徽",
	35:"福建",36:"江西",37:"山东",41:"河南",42:"湖北",43:"湖南",44:"广东",45:"广西",46:"海南",50:"重庆",51:"四川",52:"贵州",
	53:"云南",54:"西藏",61:"陕西",62:"甘肃",63:"青海",64:"宁夏",65:"新疆",71:"台湾",81:"香港",82:"澳门",91:"国外"
};
var valCodeArr = [ "1", "0", "X", "9", "8", "7", "6", "5", "4", "3", "2" ];
var wi = [ "7", "9", "10", "5", "8", "4", "2", "1", "6", "3", "7", "9", "10", "5", "8", "4", "2" ];

/**
 * 计算周岁
 * @param dateText '19880101'
 */
function calcAge(dateText) {
	var bir = new Date(dateText.substring(0, 4), parseInt(dateText.substring(4, 6))-1, dateText.substring(6, 8));
	var cur = new Date();
	var ageDate = new Date(cur.getTime() - bir.getTime());
	return ageDate.getFullYear()-1970;
}

/**
 * 发证机关校验
 * @param sCIDCert
 */
function validateCIDCert(sCIDCert) {
	//发证机关规则(6-30个字符)
	var sLength = getLength(sCIDCert);
	if (sLength < 6) {
		return "请按照身份证填写";
	} else if (sLength > 30) {
		return "发证机关填写错误";
	} else {
		return "success";
	}
}

/**
 * 证件地址校验
 * @param sCIDAddr
 */
function validateCIDAddr(sCIDAddr) {
	//证件地址规则(10-150个字符)
	var sLength = getLength(sCIDAddr);
	if (sLength < 10) {
		return "证件地址错误";
	} else if (sLength > 150) {
		return "证件地址错误";
	} else {
		return "success";
	}
}


Date.prototype.format = function(format){
	var o = {
			"M+" : this.getMonth()+1, //month
			"d+" : this.getDate(), //day
			"h+" : this.getHours(), //hour
			"m+" : this.getMinutes(), //minute
			"s+" : this.getSeconds(), //second
			"q+" : Math.floor((this.getMonth()+3)/3), //quarter
			"S" : this.getMilliseconds() //millisecond
	}
	if(/(y+)/.test(format)){
		format = format.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
	}
	for(var k in o){
		if(new RegExp("("+ k +")").test(format)){
			format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
		}
	}
	return format;
}


/**
 * 证件有效期限校验
 * @param sCIDAddr
 */
function validateCIDAble(sCIDAble) {
	var sLength = getLength(sCIDAble);
	if (sLength <= 4 && sCIDAble != '0') {
		return "请选择有效期";
	} else if(sCIDAble==0){
		return "success";
	}else {
		var date = new Date().format("yyyy.MM.dd");
		if(date>sCIDAble){
			return "该证件已经过期";
		}else{
			return "success";
		}
	}
}

/**
 * 联系地址校验：详细地址
 * @param sAddress
 */
function validateAddress(sAddress) {
	//联系地址规则
	var sLength = getLength(sAddress);
	if (sLength < 4) {
		return "请填写详细的联系地址";
	} else if (sLength > 150) {
		return "联系地址填写错误";
	} else {
		return "success";
	}
}

/**
 * 邮政编码校验
 * @param sPostCode
 */
function validatePostCode(sPostCode) {
	//邮政编码规则
	var regPostCode = /^\d{6}$/;
	if(!regPostCode.test(sPostCode)) {
		return "邮政编码填写错误";
	} else {
		return "success";
	}
}

/**
 * 固定电话校验
 * @param sTel
 */
function validateTel(sTel) {
	//固定电话规则
	var regTel = /^(\d{3,4}-)?\d{7,8}$/;
	if(!regTel.test(sTel)) {
		return "固定电话填写错误";
	} else {
		return "success";
	}
}

/**
 * 电子邮件校验
 * @param sEmail
 */
function validateEmail(sEmail) {
	//电子邮件规则
	var regEmail = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
	if(!(null == sEmail || sEmail == '' || regEmail.test(sEmail))) {
		return "电子邮件填写错误";
	} else {
		return "success";
	}
}

/**
 * 营业部校验
 * @param sDepart
 */
function validateDepart(sDepart) {
    //营业部规则
    if (sDepart == -1) {
        return "请选营业部";
    }
    return "success";
}

/**
 * 行业校验
 * @param sIdu
 */
function validateIndustry(sIdu) {
	//行业规则
	if (sIdu == -1) {
		return "请选择行业";
	}
	return "success";
}

/**
 * 职业校验
 * @param sJob
 */
function validateJob(sJob) {
	//职业规则
	if (sJob == -1) {
		return "请选择职业";
	}
	return "success";
}

/**
 * 学历校验
 * @param sEdu
 */
function validateEdu(sEdu) {
	//学历规则
	if (sEdu >= 1){
		return "success";
	} else if (sEdu == -1) {
		return "请选择学历";
	} else {
		return "学历选择错误";
	}
}

/**
 * 计算字符串长度
 * @param str
 * @return
 */
function getLength(str) {
	if(!str) return 0;
	//计算
	var tempStr = str.replace(/[^\x00-\xff]/g, '**').replace(/\s+/g, '*');
	var len = Math.ceil(tempStr.length/2);
	return len;
}
function validatePwd(field) {
       var pwd= field.value;
       if (/^\d{6}$/.test(pwd)) {

         var pass123456 = "01234567890";
         var pass654321 = "9876543210";
         if(pass123456.indexOf(pwd)>=0){
             field.handleFail('密码不能为连续的数字，如123456');
			 $(field).data('localPass', false);
             return;
         }

         if(pass654321.indexOf(pwd)>=0){
             field.handleFail('密码不能为连续的数字，如654321');
			 $(field).data('localPass', false);
             return;
         }




		  var sub5_1 = pwd.substring(0,4);
		  var n6 =  parseInt(sub5_1,10);

		  var sub5_2 = pwd.substring(1,5);
		  var n7 =  parseInt(sub5_2,10);

		  var sub5_3 = pwd.substring(2,6);
		  var n8 =  parseInt(sub5_3,10);
		  if(n6%1111==0 || n7%1111==0  || n8%1111==0  ){
		      field.handleFail('相同数字不得连续出现4次，如11112');
			  $(field).data('localPass', false);
			  return;
		  }



         var  sub3=pwd.substring(0,3);
         var  _sub3=pwd.replace(new RegExp(sub3,"gm"),"");
         if(_sub3=='' || _sub3.length==0){
              field.handleFail('密码不能过于简单，如123123');
			  $(field).data('localPass', false);
              return;
         }

          var  sub2=pwd.substring(0,2);
          var  _sub2=pwd.replace(new RegExp(sub2,"gm"),"");
          if(_sub2=='' || _sub2.length==0){
               field.handleFail('密码不能过于简单，如121212');
			   $(field).data('localPass', false);
			   return;
          }


          var sub2_1 = pwd.substring(0,2);
          var sub2_2 = pwd.substring(2,4);
          var sub2_3 = pwd.substring(4,6);
          var n1 = parseInt(sub2_1,10);
          var n2 = parseInt(sub2_2,10);
          var n3 = parseInt(sub2_3,10);

          if(n1%11==0 && n2%11==0 && n3%11==0){
			  field.handleFail('密码不能过于简单，如112233');
			  $(field).data('localPass', false);
			  return;
		  }


		  var sub3_1 = pwd.substring(0,3);
          var sub3_2 = pwd.substring(3,6);
          var n4 = parseInt(sub3_1,10);
          var n5 = parseInt(sub3_2,10);
          if(n4%111==0 && n5%111==0 ){
			  field.handleFail('密码不能过于简单，如111222');
			  $(field).data('localPass', false);
			  return;
		  }


		    field.handleSuccess();
		  $(field).data('localPass', true);


      }else{
            field.handleFail('密码为6位数字');
			$(field).data('localPass', false);

      }
}

//检测浏览器是否禁用cookie
function testCookie(){
	try{
		document.cookie="testcookie=1; ";
		if(document.cookie.indexOf("testcookie")!=-1){
			return true;
		}
	}catch(e){}

	showDialog("请在浏览器中激活cookie功能")

	return false;
}

//显示弹出框
function showDialog(content, type){
	if(typeof type == 'undefined' || null == type || type == ''){
		type = 'alert';
	}
	var dialog = new Dialog(undefined, {
		title: '提示',
		confirmType: type,
		noClose: true,
		message: content,
		hasBtn: true,
		btnText: ['确定'],
		needDestroy: true,
		btnRole: ['cancel']
	});
	//dialog.show();
}

