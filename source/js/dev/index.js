/**
 * 首页交互
 * @requires [jQuery, dialog]
 * @author wuwj@cairenhui.com
 * @update 2014-4-23
 */

// 用来存储上一次提示对象
var _cache_ = {};

// 手机号码验证对象
var mobileObj = {
    element: $('.mobile:visible'),
    valid: function () {
        var sValue = this.element.val();
        return /^(13|15|18)[0-9]{9}$/.test(sValue);
    }
};

// 短信验证码验证对象
var codeObj = {
    element: $('.code:visible'),
    valid: function () {
        var sValue = this.element.val();
        return /^\d{4}$/.test(sValue);
    }
};

// 发送验证码
$('#login').on('click', '.getcode', function (e) {
    if ($(this).hasClass('disabled')) return;
    e.preventDefault();

    // 先要验证手机是否填写正确
    if (!mobileObj.valid()) {
        showError(mobileObj.element, '手机号码不正确！');
    } else {
        closeError();
        codeObj.element.focus();
        $(this).addClass('disabled');

        $.ajax({
            type: 'GET',
            url: '/json/example.json',
            dataType: 'json'
        })
        .done((function (_this) {
            return function (data) {
                // 倒计时：60秒后重新发送
                new Countdown(_this, {
                    durtion: 5,
                    newTemplate: '重新发送'
                });
            }
        })(this));
    }
});

// 提示层 `×` 的关闭事件绑定
$('#login').on('click', '.close', function () { closeError(); });

// 输入内容时关闭提示层
$(document.activeElement).on('keydown', function () { closeError(); });

// 按钮事件绑定
$('#login').on('click', '.btn', function (e) {
    e.preventDefault();

    if (!mobileObj.valid()) {
        showError(mobileObj.element, '手机号码不正确！');
    } else if (!codeObj.valid()) {
        showError(codeObj.element, '验证码不正确！');
    } else {
        closeError();

        var load = document.createElement('img');
        var parent = document.getElementById('login');

        load.src = 'images/gif/loading-32.gif';
        load.setAttribute('width', '32');
        load.setAttribute('height', '32');
        load.setAttribute('id', 'loadimg');
        parent.appendChild(load);

        $(load).pin({
            baseEl: $(this),
            baseXY: ['100%', '50%'],
            selfXY: [0, '50%']
        });

        $.ajax({
            type: 'GET',
            url: 'json/example.json',
            dataType: 'json'
        })
        .done(function (data) {
            var _data = data.resMap;

            if (_data.errorNo === 0) {
                window.location.href = '/collect.html';
            } else {
                // window.alert(_data.errorInfo);
                new Dialog(undefined, {});
            }
        })
        .always(function () {
            var load = document.getElementById('loadimg');
            var parent = load.parentNode;

            parent.removeChild(load);
        });
    }
});

// 回车触发按钮事件
$(document).on('keydown', function (e) {
    if (document.activeElement === mobileObj.element[0] || document.activeElement === codeObj.element[0]) {
        // e.preventDefault();
        if (e.keyCode === 13) {
            $('#login .btn').trigger('click');
        }
    }
});

// 开户转户 tab 切换
$('#login').on('click', '.tab', function () {
    var _class = $(this).attr('class');
    if (_class.indexOf('active') > 0) return;

    var newClass, index, $sibling, $panel, $curPanel;

    // tab 切换
    newClass = _class.replace(/(zh|kh)/g, '$1-active');
    $sibling = $(this).siblings();
    newSiblingClass = $sibling.attr('class').replace(/-active/g, '');
    $(this).attr('class', newClass);
    $sibling.attr('class', newSiblingClass);

    // tab 内容跟随切换
    index = $(this).index($('#login .tab'));
    $panel = $('.login-panel');
    $curPanel = $panel.eq(index);
    $panel.hide();
    $curPanel.show();

    // 刷新验证项目
    mobileObj.element = $curPanel.find('.mobile');
    codeObj.element = $curPanel.find('.code');

    // 额外操作：关闭错误提示层等
    closeError();
    $curPanel.find('input[type=text]')[0].focus();
});

/**
 * 显示报错提示层
 * @param  {Object}   obj      目标对象
 * @param  {String}   text     显示的错误信息文本
 * @param  {Function} callback 显示后的事件回调方法
 * @return {undefined}
 */
function showError(obj, text, callback) {
    var $layer = $('.ui-loginerr');
    $layer.show();
    $layer.find('p').text(text);
    obj.focus();

    if (_cache_.el !== obj) {
        $layer.pin({
            baseEl: obj,
            baseXY: [0, 0],
            selfXY: [0, '100%+5px']
        });
    }

    $layer.hide().fadeIn();
    _cache_.el = obj;

    // 回调方法
    callback && callback();
}

/**
 * 关闭报错提示层
 * @param  {Function} callback 关闭后的事件回调方法
 * @return {undefined}
 */
function closeError(callback) {
    var $layer = $('.ui-loginerr');
    $layer.fadeOut();

    // 回调方法
    callback && callback();
}
