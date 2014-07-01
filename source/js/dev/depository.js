$(function () {
	$('.ui-bank').on('change', '.bank-radio', function () {
	    var bankInfo = $(this).data('bankinfo');

	    $('#extra').show();
	    $('.ui-bank').find('.active').removeClass('active');
	    $(this).parent().addClass('active');

	    $('#holder').removeAttr('class').addClass('bank-logo bank-' + bankInfo.name);
	    if (bankInfo.type === '1') {
	        $('#extraFiller').hide();
	    } else {
	        $('#extraFiller').show();
	    }
	});

	$('#nextBtn').on('click', function (e) {
	    e.preventDefault();

	    var length = $('.ui-bank').find('input[type=radio]').filter(':checked').length;
	    if (!length) {
	        new Dialog(undefined, {
	            needDestroy: true,
	            confirmType: 'warn',
	            message: '请选择存管银行'
	        });
	    }
	})

	// tab 切换
	$('.ui-tab').on('mouseenter', 'span', function () {
	    var index = $('.tab').index(this);
	    $('.ui-tab').find('.active').removeClass('active');
	    $(this).addClass('active');
	    $('.ui-tab-content').hide();
	    $('.ui-tab-content').eq(index).show();
	});

	$('#cardNo').on('focus', function () {
		var value = $.trim($(this).val());
		if (value.length == 0) return;
		$('#zoomIn').show();
	}).on('blur', function () {
		$('#zoomIn').hide();
	}).on('keydown', function (e) {
		if (e.keyCode > 48 && e.keyCode < 57
			|| e.keyCode == 8 // backspace
			|| e.keyCode == 9 // tab
			|| e.keyCode == 27) // esc
		{
			return;
		} else {
			e.preventDefault();
		}
	});

	$('#cardNo').on('input propertychange', function () {
		var value = $.trim($(this).val());
		if (value) {
			$('#zoomIn').show();
		} else {
			$('#zoomIn').hide();
		}

		var format = function (v) {
			var _v = '';

			while (v.length > 4) {
				_v += (' ' + v.slice(0, 4));
				v = v.slice(4);
			}

			_v += (' ' + v);

			return _v.replace(/^\s/, '');
		}

		$('#zoomIn').html(format(value));
	});
});
