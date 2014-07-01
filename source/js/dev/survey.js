var nextPage = 'audit.html';

// 下一步
$('#nextBtn').on('click', function (e) {
    e.preventDefault();

    var checkResult = checkHighlight();
    if (!checkResult) return;

    var anserChecked = {};

    $('.answer').each(function (index) {
        var $radio = $(this).find('input:radio');
        var checked = $radio[0].checked;
        anserChecked = {
            checked: checked,
            errNo: index + 1
        };
        return checked;
    });

    if (!anserChecked.checked) {
        new Dialog(null, {
            tipType: 'warn',
            message: '提示信息：第' + anserChecked.errNo + '条信息有误',
            needDestroy: true
        });

        return;
    }

    var $parent = $(this).parent();
    var $loading = $parent.find('.loading');
    $loading.css('visibility', 'visible');

    $.ajax({
        type: 'GET',
        url: 'json/example.json',
        dataType: 'json'
    })
    .done(function (data) {
        var _data = data.resMap;

        if (_data.errorNo === 0) {
            window.location.href = nextPage;
        } else {
            window.alert(_data.errorInfo);
        }
    })
    .always(function () {
        $loading.css('visibility', 'hidden');
    });
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

    $container.each(function () {
        var $self = $(this);
        type = $self.data('check');
        length = $self.find('input[type=' + type + ']').filter(':checked').length;

        if (!length) {
            // 目标未在当前视窗内，则滚动页面
            if ($self.offset().top < $(window).scrollTop()) {
                $('html, body').animate({scrollTop: $self.offset().top}, 200);
            }
            // 操作检查项恢复初始背景色
            $self.one('change', 'input[type=' + type + ']', function () {
                $self.css('background-color', originColor);
            });
            // 闪烁渐变目标背景色
            colorTran(this, originColor, changeColor, 10, 4);
            return checkResult = false;
        }
    });

    return checkResult;
}
