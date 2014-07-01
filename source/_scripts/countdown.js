function Countdown(el, opts) {
    opts = $.extend({
        durtion: 5,
        template: '<span class="js-second"></span>秒后重发',
        newTemplate: null
    }, opts || {});

    this.opts = opts;
    this.timer = null;
    this.pause = false;
    this.setup(el);
}

Countdown.prototype.setup = function (el) {
    var $second, $el, $clone, cloneContent;

    $el = $(el);
    if ($el.hasClass('disabled')) {
        $el.removeClass('disabled');
    }

    $clone = $el.clone(true);
    cloneContent = this.opts.newTemplate;
    if (cloneContent) {
        $clone.html(cloneContent);
    }

    $el.html(this.opts.template);
    $second = $el.find('.js-second');
    this.counting(this.opts.durtion, (function (_this) {
        return function () {
            // console.log(arguments[0]);
            $el.addClass('disabled');
            $second.html(arguments[0]);
        }
    })(this), function () {
        $el.replaceWith($clone);
    });
};

Countdown.prototype.counting = function(t, callback, doneCallback) {
    var _arguments = arguments;
    if (this.pause) return;
    if (this.timer) clearInterval(this.timer);
    callback && callback(t);
    t--;
    if (t >= 0) {
        this.timer = setInterval((function (_this) {
            return function () {
                _this.counting.apply(_this, _arguments);
            }
        })(this), 1000);
    } else {
        doneCallback();
    }
};

Countdown.prototype.stop = function() {
    this.pause = true;
};

Countdown.prototype.start = function() {
    this.pause = false;
};
