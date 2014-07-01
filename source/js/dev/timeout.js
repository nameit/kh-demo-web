setTimeout(function () {
    var $timeOutTip = $('<div id="timeOutAlert"><i class="arrow"></i> <div class="hd"><span class="close">关闭</span></div> <div class="bd"> <div class="fl"> <img src="/images/timeout/lamp.png" class="lamp" alt=""> </div> <div class="fl text"><p>您在此页面停留了较长时间，如果遇到困难，可点击上方的在线客服按钮</p> <p>或拨打<b>客服热线</b><em class="hotline">95553</em>，我们将尽快为您服务</p> </div> </div> </div>');
    var $target = $('.service a');
    var $close = $timeOutTip.find('.close');

    $timeOutTip.appendTo('body').pin({
        baseEl: $target,
        baseXY: ['100%', '100%'],
        selfXY: ['100%', '0-10px']
    });

    $close.on('click', function () {
        $timeOutTip.hide();
    });
}, 2000);
