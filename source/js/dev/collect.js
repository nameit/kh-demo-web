/**
 * 证件上传
 * @requires [jQuery]
 * @author   wuwj@cairenhui.com
 * @update   2014-4-25
 */

var nextPage = 'profile.html';

// 上传文件
$('.file-input').on('change', function () {
    var $uploading = $(this).parent().find('.upload-gif');
    $uploading.show();
});
