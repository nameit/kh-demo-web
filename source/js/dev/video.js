$('#orderBtn').dialog({
	title: '预约开户',
	hasBtn: true,
	btnText: ['保存并结束视频'],
	btnRole: ['confirm'],
	confirm: function () {
		var checkResult = checkHighlight();
		if (checkResult) {
			var order = $('.ui-subject input:checked');
			alert(order.val());
			this.destroy();
		}
	},
	content: '<p style="margin-bottom:10px;"><i class="icon icon-info"></i>请您选择预约时间，我们的客服人员会主动联系您！</p><div class="ui-subject" data-check="radio"> <ul style="margin-left:-20px;text-align:center;"> <li> <label><input type="radio" name="order" value="09:00-12:00">09:00-12:00</label> </li> <li> <label><input type="radio" name="order" value="12:00-14:00">12:00-14:00</label> </li> <li> <label><input type="radio" name="order" value="14:00-17:00">14:00-17:00</label> </li> <li> <label><input type="radio" name="order" value="18:00-22:00">18:00-22:00</label> </li> </ul> </div>'
});

$('#nextBtn').dialog({
	width: 700,
	height: 600,
	content: '<div class="cert-dialog"><a href="javascript:;" class="unslider-arrow prev"></a><a href="javascript:;" class="unslider-arrow next"></a><div class="banner"><ul><li><p>您的视频验证已经成功，下一步将为您安装数字证书，您需要对安全级别进行设置。请点击“设置安全级别”进行密码设置。</p><span  class="step1"></span></li><li><p>您需要输入密码，此密码作为您数字证书的使用凭证。</p><span  class="step2"></span></li><li><p>密码输入完成后，请点击“确定”按钮，进入正式安装页面。</p><span  class="step3"></span></li></ul></div><button type="button" class="btn-primary btn-large">我知道了</button></div></div>',
	afterShow: function () {
		var timeId;
		var unslider = $('.banner').unslider({
			loop: false,
			autoplay: false
		});
		$('.unslider-arrow').click(function() {
			var fn = this.className.split(' ')[1];

			//  Either do unslider.data('unslider').next() or .prev() depending on the className
			unslider.data('unslider')[fn]();

			if (timeId) {
				clearTimeout(timeId);
			}
			timeId = setTimeout(checkArrow, 600);
		});
		checkArrow();
		function checkArrow() {
			var ul = $('.banner ul')[0],
				len = ul.getElementsByTagName('li').length,
				left = parseInt(ul.style.left, 10),
				index = Math.abs(left)/100;

			if (index < (len - 1)) {
				$('.next').show();
			} else {
				$('.next').hide();
			}

			if (index > 0) {
				$('.prev').show();
			} else {
				$('.prev').hide();
			}
		}
	}
});

/**
 * 检查未填项目并高亮
 */
function checkHighlight() {
	var $container, type, length, originColor, changeColor;

	$container = $('[data-check]'); // 检查项容器
	originColor = '#ffffff';
	changeColor = '#ffede5';
	checkResult = true;

	$container.each(function() {
		var $self = $(this);
		type = $self.data('check');
		length = $self.find('input[type=' + type + ']').filter(':checked').length;

		if (!length) {
			// 目标未在当前视窗内，则滚动页面
			if ($self.offset().top < $(window).scrollTop()) {
				$('html, body').animate({
					scrollTop: $self.offset().top
				}, 200);
			}
			// 操作检查项恢复初始背景色
			$self.one('change', 'input[type=' + type + ']', function() {
				$self.css('background-color', originColor);
			});
			// 闪烁渐变目标背景色
			colorTran(this, originColor, changeColor, 10, 4);
			return checkResult = false;
		}
	});

	return checkResult;
}
