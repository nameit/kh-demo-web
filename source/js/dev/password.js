/**
 * 密码设置
 * @author wuwj@cairenhui.com
 */

$('#sync').on('change', function () {
    var $syncTarget = $('.password-group').not(':first');
    if (this.checked) {
        $syncTarget.hide();
    } else {
        $syncTarget.show();
    }
});
