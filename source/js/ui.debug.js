//获取颜色梯度方法
var ColorGrads = (function(){
    //获取颜色梯度数据
    function GetStep(start, end, step) {
        var colors = [], start = GetColor(start), end = GetColor(end),
            stepR = (end[0] - start[0]) / step,
            stepG = (end[1] - start[1]) / step,
            stepB = (end[2] - start[2]) / step;
        //生成颜色集合
        for(var i = 0, r = start[0], g = start[1], b = start[2]; i < step; i++){
            colors[i] = [r, g, b]; r += stepR; g += stepG; b += stepB;
        }
        colors[i] = end;
        var l = colors.length;
        for(var i = 0; i < l; i ++){
            var item = colors[i];
            for(var j = 0 ; j < 3 ; j++){
                item[j] = Math.floor(item[j]);
            }
            colors[i] = item;
        }

        return colors;
        //修正颜色值
//      return $.map(colors, function(x){ return $.map(x, function(x){
//          return Math.min(Math.max(0, Math.floor(x)), 255);
//      });});
    }
    //获取颜色数据
    var frag;
    function GetColor(color) {
        var ret = GetData(color);
        if (ret === undefined) {
            if (!frag) {
                frag = document.createElement("textarea");
                frag.style.display = "none";
                document.body.insertBefore(frag, document.body.childNodes[0]);
            };
            try { frag.style.color = color; } catch(e) { return [0, 0, 0]; }

            if (document.defaultView) {
                ret = GetData(document.defaultView.getComputedStyle(frag, null).color);
            } else {
                color = frag.createTextRange().queryCommandValue("ForeColor");
                ret = [ color & 0x0000ff, (color & 0x00ff00) >>> 8, (color & 0xff0000) >>> 16 ];
            }
        }
        return ret;
    }
    //获取颜色数组
    function GetData(color) {
        var re = RegExp;
        if (/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.test(color)) {
            //#rrggbb
            return $.map([ re.$1, re.$2, re.$3 ], function(x){
                    return parseInt(x, 16);
                });
        } else if (/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.test(color)) {
            //#rgb
            return $.map([ re.$1, re.$2, re.$3 ], function(x){
                    return parseInt(x + x, 16);
                });
        } else if (/^rgb\((.*),(.*),(.*)\)$/i.test(color)) {
            //rgb(n,n,n) or rgb(n%,n%,n%)
            return $.map([ re.$1, re.$2, re.$3 ], function(x){
                return x.indexOf("%") > 0 ? parseFloat(x, 10) * 2.55 : x | 0;
            });
        }
    }

    return function(colors, step){
        var ret = [], len = colors.length;
        if ( step === undefined ) { step = 20; }
        if ( len == 1 ) {
            ret = GetStep( colors[0], colors[0], step );
        } else if ( len > 1 ) {
            for(var i = 0, n = len - 1; i < n; i++){
                var steps = GetStep( colors[i], colors[i+1], step );
                i < n - 1 && steps.pop();
                ret = ret.concat(steps);
            }
        }
        return ret;
    }
})();

function colorTran(element, from, to, step, repeat) {
    var _colors = ColorGrads([from, to], step);
    var _index = 0;
    var times = 0;
    var _timer = null;

    function transIn() {
        times++;
        if( repeat%2==1 && times > _colors.length * repeat ) return;
        clearTimeout(_timer);
        _index++;
        setColor();
        if (_index < _colors.length - 1) {
            _timer = setTimeout(function() {transIn();}, step);
        } else {
            transOut();
        }
    }

    function transOut() {
        times++;
        if( repeat%2==0 && times > _colors.length * repeat ) return;
        clearTimeout(_timer);
        setColor();
        if ( 0 < _index ) {
            _index--;
            _timer = setTimeout(function() {transOut();}, step);
        }else{
            transIn();
        }
    }

    function setColor() {
        var color = _colors[Math.min(Math.max(0, _index), _colors.length - 1)];
        element.style["backgroundColor"] = "rgb(" + color.join(",") + ")";
    }

    transIn();
}

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

var B = (function(ua) {
	var b = {
		msie: /\b(?:msie |ie |trident)/.test(ua) && !/opera/.test(ua),
		opera: /opera/.test(ua),
		safari: /webkit/.test(ua) && !/chrome/.test(ua),
		firefox: /firefox/.test(ua),
		chrome: /chrome/.test(ua)
	};
	var vMark = "";
	for (var i in b) {
		if (b[i]) {
			vMark = "safari" == i ? "version" : i;
			break;
		}
	}
	b.version = vMark && RegExp("(?:" + vMark + ")[\\/: ]([\\d.]+)").test(ua) ? RegExp.$1 : "0";

	b.ie = b.msie;
	b.ie6 = b.msie && parseInt(b.version, 10) == 6;
	b.ie7 = b.msie && parseInt(b.version, 10) == 7;
	b.ie8 = b.msie && parseInt(b.version, 10) == 8;
	b.ie9 = b.msie && parseInt(b.version, 10) == 9;
	b.ie10 = b.msie && parseInt(b.version, 10) == 10;

	b.win2000 = ua.indexOf('windows nt 5.0') > 1 ? true : false;
	b.winxp = ua.indexOf('windows nt 5.1') > 1 ? true : false;
	b.win2003 = ua.indexOf('windows nt 5.2') > 1 ? true : false;
	b.winvista = ua.indexOf('windows nt 6.0') > 1 ? true : false;
	b.win7 = ua.indexOf('windows nt 6.1') > 1 ? true : false;
	b.win8 = ua.indexOf('windows nt 6.2') > 1 ? true : false;

	return b;
})(window.navigator.userAgent.toLowerCase());


// 定义 Dialog 类
var Dialog = function (element, options) {
	options = $.extend({}, $.fn.dialog.defaults, options);

	this.options = options;
    this.el = element;
	this.hasInit = false;

	this.setup();
};

Dialog.prototype = {

	constructor: Dialog,

	init: function () {
		// 创建弹出层
		this.dialog = new Overlay(this.options.template, {
			className: this.options.dialogClass,
			width: this.options.width,
			height: this.options.height,
			zIndex: this.options.zIndex
		});

		if (this.options.hasMask) {
			var $mask = $('.' + this.options.maskClass);

			if ($mask.length === 0) {
				// 创建遮罩
				this.mask = new Overlay(document.createElement('div'), {
					className: this.options.maskClass,
					width: '100%',
					height: '100%',
					zIndex: this.options.zIndex - 1,
					style: {
						position: 'fixed',
						top: 0,
						left: 0
					}
				});
			} else {
				// 已有遮罩
				this.mask = $mask;
			}
		}

		// 内容填充
		this.render();

		// 先隐藏浮动层与遮罩
		this.dialog.hide();
		this.options.hasMask && this.mask.hide();

        var $dialog = $(this.dialog.overlay);
		// 关闭按钮事件绑定
		$dialog.on('click', '.js-dialog-close', $.proxy(this.hide, this));
		$dialog.on('click', '[data-role=cancel]', $.proxy(this.hide, this));

        // 其它按钮事件绑定
        if (this.options.confirm) {
            $dialog.on('click', '[data-role=confirm]', (function (_this) {
                return function () {
                    _this.options.confirm.call(_this);
                }
            })(this));
        }

		// 初始化完成标志
		this.hasInit = true;
	},

	setup: function (element) {
		var self = this;

		if (this.el) {
			// 触发绑定
			$(this.el).on('click.dialog', function (e) {
				e.preventDefault();

				self.trigger();
			});

            // 用于一些初始化的操作，只执行一次
            if (this.options.once) {
                $(this.el).one('click.dialog', function (e) {
                    e.preventDefault();
                    self.options.once();
                });
            }
		} else {
			this.trigger();
		}
	},

	trigger: function () {
		if (!this.hasInit) {
			this.init();
		}

		this.show();
	},

	show: function () {
		this.options.beforeShow && this.options.beforeShow.call(this);

		this.dialog.setPosition();
		this.dialog.show();
		this.options.hasMask && this.mask.show();

		this.options.afterShow && this.options.afterShow.call(this);
	},

	hide: function () {
		this.options.beforeHide && this.options.beforeHide.call(this);

		this.dialog.hide();
		this.options.hasMask && this.mask.hide();

		this.options.afterHide && this.options.afterHide.call(this);
        if (this.options.needDestroy) {
            this.destroy();
        }
	},

	render: function () {
		var $dialog = $(this.dialog.overlay),
            $head = $dialog.find('.js-dialog-hd'),
            $body = $dialog.find('.js-dialog-bd'),
            $close = $dialog.find('.js-dialog-close'),
            content;

		if (!this.options.hasTitle) {
			$head.remove();
		} else {
			$head.find('h2').text(this.options.title);
		}

		if (this.options.noClose) {
			$close.remove();
		}

		if (this.options.tipType) {
			content = '<p class="tip-wrap"><i class="icon-sprite icon icon-' + this.options.tipType + '-32"></i>' + this.options.message + '</p>'
		} else {
			content = this.options.content;
		}

        if (this.options.scrollHeight) {
            var sh = this.options.scrollHeight;

            if (typeof sh === 'number') {
                sh += 'px';
            }
            content = '<div class="js-scrollable" style="height: ' + sh + '">' + content + '</div>';
        }

		if (this.options.hasBtn) {
			var btnCls;
			content += '<div class="btn-wrap">';
			for (var i = 0; i < this.options.btnText.length; i++) {
                btnCls = this.options.btnCls[i];
				content += '<button type="button" data-role="' + this.options.btnRole[i] + '" class="btn-normal btn-dialog-' + btnCls + '">' + this.options.btnText[i] + '</button>'
			}
			content += '</div>';
		};

		$body.html(content).css('padding', this.options.padding);
	},

	closeDelay: function (millisecond) {
		setTimeout($.proxy(this.hide, this), millisecond);
	},

	destroy: function () {
        if (this.options.hasMask) {
            var $dialog = $('.' + this.options.dialogClass);
            if ($dialog.length > 1) {
                this.mask.hide();
            } else {
                this.mask.remove();
            }
        }
		this.dialog.remove();
        if (this.el) {
            $(this.el).off('click.dialog');
        }
    }
}

// 注册插件
$.fn.dialog = function (options) {
	return this.each(function () {
		new Dialog(this, options);
	});
};

// 默认设置
$.fn.dialog.defaults = {
	dialogClass: 'js-dialog',
	maskClass: 'js-mask',
	template: '<div><div class="js-dialog-hd"><h2>提示</h2></div><div class="js-dialog-bd"></div><div class="js-dialog-close">关闭</div></div>',
	width: 450,
	height: 'auto',
	zIndex: 999,
	hasMask: true,
	hasTitle: true,
	title: '提示',
	cotent: '',
	message: '',
    padding: '20px',
    hasBtn: false,
    btnText: ['确定', '取消'],
    btnRole: ['confirm', 'cancel'],
    btnCls: ['process', 'close'],
    confirm: function () {}
};

$.fn.dialog.Constructor = Dialog;

/**
 * @name        diyselect.js
 * @description 用 HTMLElement 模拟 select
 * @property    {}
 * @version     0.0.9
 * @dependency  jQuery => 1.7.2
 *              pin ~> 0.0.9
 * @author      RoshanWu
 */

var DiySelect = function (selector, options) {
	options = $.extend({}, $.fn.diySelect.defaults, options);

	this.options = options;
    this.$selector = $(selector);
	this.hasInit = false;

	this.init();
    this.bind_event();
};

DiySelect.prototype = {

	constructor: DiySelect,

	init: function () {

		if (this.hasInit) {
			return;
		}

		var id = this.$selector.attr('id');

        this.$el = $('<div class="js-select"><div class="js-select-choice"><span class="js-select-chosen"></span><span class="js-select-arrow"></span></div><ul class="js-select-list"></ul></div>');
        this.$choice = this.$el.find('.js-select-choice');
		this.$chosen = this.$el.find('.js-select-chosen');
		this.$list = this.$el.find('.js-select-list');
		this.$option = this.$selector.find('option');

        // DOM 操作：
        // 隐藏原 `select`，再其后加入 `this.$el`
        this.$selector.hide();
        this.$el.insertAfter(this.$selector);

        // 如果有 id
        id && this.$el.attr('id', id + '-select');

        if (this.options.width) {
            var chosenWidth = this.options.width -
                parseFloat(this.$choice.css('padding-left')) -
                parseFloat(this.$choice.css('padding-right')) -
                parseFloat(this.$choice.css('border-left-width')) -
                parseFloat(this.$choice.css('border-right-width'));

            this.$choice.width(chosenWidth);
        }

		// 初始化模拟组件
		this.renderChosen();
        this.renderList();

		// 初始化完成标记
		this.hasInit = true;

		/**
		 * 焦点位移
		 * @param  {float} step 位移步长
		 */
		function moveSelect(step) {
			var count = list.length;

			active += step;

			if (active < 0) {
				active =  0;
			} else if (active >= count) {
				active = count - 1;
			} else {
				list.removeClass('active');
				list.slice(active, active + 1).addClass('active');

				// 出现滚动条的情况
				if ( active >= (that.options.maxSize / 2) && count > that.options.maxSize) {
					that.optionDiv.scrollTop(list.height() * (active - (that.options.maxSize / 2)));
				}
			}
		}
	},

    bind_event: function () {
        var $li, $choice, $menu;

        $choice = this.$choice;
        $menu = this.$list;

        if ($menu.find('li').length === 0) return;

        $menu.on('mouseenter', 'li', function (e) {
            $menu.find('.active').removeClass('active');
            $(e.currentTarget).addClass('active');
        }).on('click', (function (_this) {
            return function (e) {
                e.preventDefault();
                _this.choose();
            }
        })(this));

        $choice.on('click', (function (_this) {
            return function (e) {
                e.preventDefault();
                $menu.find('.active').removeClass('active');
                $menu.find('li').each(function () {
                    if ($(this).text() === $choice.text()) {
                        $(this).addClass('active');
                        return false;
                    }
                });
                _this.options.beforeShow && _this.options.beforeShow();
                _this.show();
            }
        })(this));

        // 窗口变化时调整位置
        $(window).on('resize.diyselect', $.proxy(this.setPosition, this));

        // 模拟 `select` 失焦
        $(document).on('click', (function (_this) {
            return function (e) {
                if (!$choice.is(e.target) && $choice.has(e.target).length === 0) {
                    _this.hide();
                }
            }
        })(this));

        // 键盘事件
        // $(document).on('keydown', function (e) {
        //     if (that.optionDiv.is(':visible')) {
        //         switch (e.keyCode) {
        //             case 13: // enter
        //                 if (active !== -1) {
        //                     var text = list.slice(active, active + 1).text();
        //                     that.chooseOption(text);
        //                 }

        //                 that.hideOption();
        //                 $(select).trigger('change');
        //                 break;
        //             case 27: // esc
        //                 that.hideOption();
        //                 break;
        //             case 38: // up
        //                 e.preventDefault();
        //                 moveSelect(-1);
        //                 break;
        //             case 40: // down
        //                 e.preventDefault();
        //                 moveSelect(1);
        //                 break;
        //         }
        //     }
        // });
    },

    renderChosen: function () {
        var text;

        text = this.options.placeholder || this.$option.filter(':selected').text();
        this.$chosen.text(text);
    },

	renderList: function () {
		var fragment = document.createDocumentFragment(),
            len = this.$option.length,
            width = this.$choice.outerWidth() - parseFloat(this.$list.css('border-left-width')) - parseFloat(this.$list.css('border-right-width')),
            li, value, text;

		for (var i = 0; i < len; i++) {
			li = document.createElement('li');
			value = this.$option[i].value;
			text = this.$option[i].text;

			li.innerHTML = text;
            $(li).data('item-data', {value: value, text: text});

			if (value) {
				li.setAttribute('data-' + this.options.valueAttr, value);
			}

			fragment.appendChild(li);
		}

		this.$list[0].appendChild(fragment);
        this.$list.hide();
        this.$list.css({
            'min-width': width,
            'zIndex': this.options.zIndex
        });

        if (this.options.align) {
            this.$list.css('width', width);
        }
	},

	setPosition: function () {
		// 可视窗口顶部到 `this.$el` 的距离
		var top_height = this.$el.offset().top + this.$el.outerHeight() - $(window).scrollTop();

		// 可视窗口剩余空间与 `this.$list` 高度的差值
		var diff = $(window).height() - top_height - this.$list.height();

		// 差值大于零，说明剩余空间还可容纳 `this.$list`
		// `this.$list` 就位居 `this.$el` 正下方展示
		// 反之亦然
		if ( diff > 0 ) {
			this.$list.pin({
				baseEl: this.$el,
				baseXY: [0, '100%-' + this.options.offsetY + 'px']
			});
		} else {
			this.$list.pin({
				baseEl: this.$el,
				selfXY: [0, '100%-' + this.options.offsetY + 'px']
			});
		}
	},

	choose: function() {
		var $li, data;

        $li = this.$el.find('.active');
        this.$chosen.text($li.text());
        data = $li.data('item-data');
        this.$selector[0].value = data.value;
        this.$selector.trigger('change');

		if (this.options.afterChoose) {
			this.options.afterChoose(data);
		}

        this.hide();
	},

	show: function (selectedText) {
        if (!this.visible()) {
            this.$list.show();

            if (this.options.limit) {
                this.$list.height(Math.min(this.$list.height(),
                this.$list.find('li').height() * this.options.limit));
            }
        }

		this.setPosition();

        this.options.afterShow && this.options.afterShow();
	},

	hide: function () {
		if (this.visible()) {
            this.$list.hide();
        };
	},

    visible: function () {
        return this.$list.is(':visible');
    },

	destroy: function () {
		this.$el.remove();
		this.$selector.show();
	}
};

// 注册插件
$.fn.diySelect = function (options) {
	return this.each(function () {
		new DiySelect(this, options);
	});
};

// 默认设置
$.fn.diySelect.defaults = {
    placeholder: undefined,
	valueAttr: 'option-value',
	zIndex: '10000',
	offsetY: 1
};

$.fn.Constructor = DiySelect;

// 定义 Overlay 类
var Overlay = function (element, options) {
	options = $.extend({}, $.fn.overlay.defaults, options);

	this.options = options;
	this.overlay = $(element);

	this.init(options);
};

Overlay.prototype = {

	constructor: Overlay,

	init: function (options) {
		this.overlay.addClass(this.options.className);

		// 添加外部自定义的样式
		this.overlay.attr('style', this.options.style);

		// 基本 CSS
		this.overlay.css({
			width: this.options.width,
			height: this.options.height,
			zIndex: this.options.zIndex
		});

		// 将浮出层插入 DOM 并进行定位
		this.overlay.appendTo($(this.options.parent));
		this.setPosition();

		// 窗口变化重新定位
		$(window).on('resize', $.proxy(this.setPosition, this));
	},

	show: function () {
		this.overlay.show();
	},

	hide: function () {
		this.overlay.hide();
	},

	remove: function () {
		this.overlay.remove();
	},

	blurHide: function () {
		$(document).on('click', $.proxy(this.hide, this));
		this.overlay.on('click', function (e) {
			e.stopPropagation();
		});
	},

	setPosition: function () {
		this.overlay.pin({
			// 基准定位元素，默认为当前可视区域
			baseEl: this.options.align.baseEl,
			// element 的定位点，默认为中心
			selfXY: this.options.align.selfXY,
			// 基准定位元素的定位点，默认为中心
			baseXY: this.options.align.baseXY
		});
	}
};

// 注册插件
$.fn.overlay = function (options) {
	return this.each(function () {
		new Overlay(this, options);
	});
};

// 默认设置
$.fn.overlay.defaults = {
	className: '',
	style: '',
	width: 'auto',
	height: 'auto',
	zIndex: 999,
	parent: 'body',
	align: {
		baseEl: undefined,
		selfXY: ['50%', '50%'],
		baseXY: ['50%', '50%']
	}
};

$.fn.overlay.Constructor = Overlay;

/**
 * @name        pin.js
 * @description 通过两个对象分别描述定位元素及其定位点，然后将其定位点重合
 * @property    {}
 * @version     0.0.9
 * @dependency  jQuery => 1.7.2
 * @author      RoshanWu
 */

(function ($) {
    $.fn.pin = function (options, fixed) {
    	options = $.extend({
    		baseEl: null,
    		selfXY: [0, 0],
    		baseXY: [0, 0]
    	}, options || {});

    	// 是否相对于当前可视区域（Window）进行定位
    	var isViewport = !options.baseEl,

    		// 定位 fixed 元素的标志位，表示需要特殊处理
    		isPinFixed = false,

    		parent = this.offsetParent(),

    		// 基准元素根据定位点坐标 `baseXY` 分别获得纵横两个方向上的 size
    		baseX, baseY,

    		// 同上，根据定位点坐标 `selfXY` 获取的横纵两个方向上的 size
    		selfX, selfY,

    		// 定位元素位置
    		left, top;

    	// 设定目标元素的 position 为绝对定位
    	// 若元素的初始 position 不为 absolute，会影响元素的 display、宽高等属性
    	if (this.css('position') !== 'fixed') {
    		this.css('position', 'absolute');
    		isPinFixed = false;
    	} else {
    		isPinFixed = true;
    	}

        var parentOffset = getParentOffset(this);
        var baseOffset = calcOffset(options.baseEl);

    	selfX = calcXY(this, options.selfXY[0], 'outerWidth');
    	selfY = calcXY(this, options.selfXY[1], 'outerHeight');

        if (isViewport) {
            baseX = calcXY($(window), options.baseXY[0], 'outerWidth');
            baseY = calcXY($(window), options.baseXY[1], 'outerHeight');
        } else {
            baseX = calcXY(options.baseEl, options.baseXY[0], 'outerWidth');
            baseY = calcXY(options.baseEl, options.baseXY[1], 'outerHeight');
        }

    	// 计算定位元素位置
    	// 若定位 fixed 元素，则父元素的 offset 没有意义
    	top = baseOffset.top + baseY - selfY - parentOffset.top;
        left = baseOffset.left + baseX - selfX - parentOffset.left;

    	// 进行定位
    	this.css({ left: left, top: top });

        function calcOffset(obj) {
            // 若定位 fixed 元素，则父元素的 offset 没有意义
            if (isPinFixed) {
                return {
                    left: 0,
                    top: 0
                };
            }
            else if (isViewport) {
                return {
                    left: $(document).scrollLeft(),
                    top: $(document).scrollTop()
                };
            }
            else {
                return getOffset(obj[0]);
            }
        }
    };

    // 扩展：相对于当前可视区域页面上某一元素的居中定位
    $.fn.pinCenter = function (options) {
    	this.pin({
    		baseEl: (options) ? options.baseEl : null,
    		selfXY: ['50%', '50%'],
    		baseXY: ['50%', '50%']
    	});
    };

    /**
     * 根据坐标点获取对应尺寸值
     * @param  {jquery} object 被获取尺寸的元素
     * @param  {array}  coord  坐标点
     * @param  {string} type   尺寸类型
     * @return {number}
     */
    function calcXY(object, x, type) {
    	// 参考 `https://github.com/aralejs/position/blob/master/src/position.js`
    	// 中的 `xyConverter` 方法
    	// 先将坐标值转成字符串
    	var x = x + '';

    	// 处理 alias，此处正则表达式内的 `?:` 表示此括号为非捕获型括号
    	if (/\D/.test(x)) {
    		x = x.replace(/(?:top|left)/gi, '0%')
				.replace(/center/gi, '50%')
				.replace(/(?:bottom|right)/gi, '100%');
    	}

    	// 处理 `px`
    	if (x.indexOf('px') !== -1) {
    		x = x.replace(/px/gi, '');
    	}

    	// 将百分比转为像素值
    	if (x.indexOf('%') !== -1) {
    		// 支持小数
    		x = x.replace(/(\d+(?:\.\d+)?)%/gi, function (m, d) {
    			return object[type]() * (d / 100.0);
    		});
    	}

    	// 处理类似 100%+20px 的情况
    	if (/[+\-*\/]/.test(x)) {
    		try {
    			x = (new Function('return ' + x))();
    		} catch (e) {
    			throw new Error('Invalid position value: ' + x);
    		}
    	}

    	// 转换回数字
    	return parseFloat(x, 10) || 0;
    }



    // 获取 offsetParent 的位置
    function getParentOffset(element) {
        var parent = element.offsetParent();

        // IE7 下，body 子节点的 offsetParent 为 html 元素，其 offset 为
        // { top: 2, left: 2 }，会导致定位差 2 像素，所以这里将 parent
        // 转为 document.body
        if (parent[0] === document.documentElement) {
            parent = $(document.body);
        }

        // 获取 offsetParent 的 offset
        var offset;

        // 当 offsetParent 为 body，
        // 而且 body 的 position 是 static 时
        // 元素并不按照 body 来定位，而是按 document 定位
        // http://jsfiddle.net/afc163/hN9Tc/2/
        // 因此这里的偏移值直接设为 0 0
        if (parent[0] === document.body &&
            parent.css('position') === 'static') {
                offset = { top:0, left: 0 };
        } else {
            offset = getOffset(parent[0]);
        }

        // 根据基准元素 offsetParent 的 border 宽度，来修正 offsetParent 的基准位置
        // offset.top += numberize(parent.css('border-top-width'));
        // offset.left += numberize(parent.css('border-left-width'));

        return offset;
    }

    // fix jQuery 1.7.2 offset
    // document.body 的 position 是 absolute 或 relative 时
    // jQuery.offset 方法无法正确获取 body 的偏移值
    //   -> http://jsfiddle.net/afc163/gMAcp/
    // jQuery 1.9.1 已经修正了这个问题
    //   -> http://jsfiddle.net/afc163/gMAcp/1/
    // 这里先实现一份
    // 参照 kissy 和 jquery 1.9.1
    //   -> https://github.com/kissyteam/kissy/blob/master/src/dom/sub-modules/base/src/base/offset.js#L366
    //   -> https://github.com/jquery/jquery/blob/1.9.1/src/offset.js#L28
    function getOffset(element) {
        var box = element.getBoundingClientRect(),
            docElem = document.documentElement;

        // < ie8 不支持 win.pageXOffset, 则使用 docElem.scrollLeft
        return {
            left: box.left + (window.pageXOffset || docElem.scrollLeft) -
                  (docElem.clientLeft || document.body.clientLeft  || 0),
            top: box.top  + (window.pageYOffset || docElem.scrollTop) -
                 (docElem.clientTop || document.body.clientTop  || 0)
        };
    }
})(jQuery);

/* 
 * The MIT License
 *
 * Copyright (c) 2012 James Allardice
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

// Defines the global Placeholders object along with various utility methods
(function(global) {

    "use strict";

    // Cross-browser DOM event binding
    function addEventListener(elem, event, fn) {
        if (elem.addEventListener) {
            return elem.addEventListener(event, fn, false);
        }
        if (elem.attachEvent) {
            return elem.attachEvent("on" + event, fn);
        }
    }

    // Check whether an item is in an array (we don't use Array.prototype.indexOf so we don't clobber any existing polyfills - this is a really simple alternative)
    function inArray(arr, item) {
        var i, len;
        for (i = 0, len = arr.length; i < len; i++) {
            if (arr[i] === item) {
                return true;
            }
        }
        return false;
    }

    // Move the caret to the index position specified. Assumes that the element has focus
    function moveCaret(elem, index) {
        var range;
        if (elem.createTextRange) {
            range = elem.createTextRange();
            range.move("character", index);
            range.select();
        } else if (elem.selectionStart) {
            elem.focus();
            elem.setSelectionRange(index, index);
        }
    }

    // Attempt to change the type property of an input element
    function changeType(elem, type) {
        try {
            elem.type = type;
            return true;
        } catch (e) {
            // You can't change input type in IE8 and below
            return false;
        }
    }

    // Expose public methods
    global.Placeholders = {
        Utils: {
            addEventListener: addEventListener,
            inArray: inArray,
            moveCaret: moveCaret,
            changeType: changeType
        }
    };

}(this));

(function(global) {

    "use strict";

    var validTypes = ["text", "search", "url", "tel", "email", "password", "number", "textarea"],

        // The list of keycodes that are not allowed when the polyfill is configured to hide-on-input
        badKeys = [

        // The following keys all cause the caret to jump to the end of the input value
        27, // Escape
        33, // Page up
        34, // Page down
        35, // End
        36, // Home

        // Arrow keys allow you to move the caret manually, which should be prevented when the placeholder is visible
        37, // Left
        38, // Up
        39, // Right
        40, // Down

        // The following keys allow you to modify the placeholder text by removing characters, which should be prevented when the placeholder is visible
        8, // Backspace
        46 // Delete
        ],

        // Styling variables
        placeholderStyleColor = "#ccc",
        placeholderClassName = "placeholdersjs",
        classNameRegExp = new RegExp("(?:^|\\s)" + placeholderClassName + "(?!\\S)"),

        // These will hold references to all elements that can be affected. NodeList objects are live, so we only need to get those references once
        inputs, textareas,

        // The various data-* attributes used by the polyfill
        ATTR_CURRENT_VAL = "data-placeholder-value",
        ATTR_ACTIVE = "data-placeholder-active",
        ATTR_INPUT_TYPE = "data-placeholder-type",
        ATTR_FORM_HANDLED = "data-placeholder-submit",
        ATTR_EVENTS_BOUND = "data-placeholder-bound",
        ATTR_OPTION_FOCUS = "data-placeholder-focus",
        ATTR_OPTION_LIVE = "data-placeholder-live",
        ATTR_MAXLENGTH = "data-placeholder-maxlength",

        // Various other variables used throughout the rest of the script
        test = document.createElement("input"),
        head = document.getElementsByTagName("head")[0],
        root = document.documentElement,
        Placeholders = global.Placeholders,
        Utils = Placeholders.Utils,
        hideOnInput, liveUpdates, keydownVal, styleElem, styleRules, placeholder, timer, form, elem, len, i;

    // No-op (used in place of public methods when native support is detected)
    function noop() {}

    // Avoid IE9 activeElement of death when an iframe is used.
    // More info:
    // http://bugs.jquery.com/ticket/13393
    // https://github.com/jquery/jquery/commit/85fc5878b3c6af73f42d61eedf73013e7faae408
    function safeActiveElement() {
        try {
            return document.activeElement;
        } catch (err) {}
    }

    // Hide the placeholder value on a single element. Returns true if the placeholder was hidden and false if it was not (because it wasn't visible in the first place)
    function hidePlaceholder(elem, keydownValue) {
        var type,
        maxLength,
        valueChanged = ( !! keydownValue && elem.value !== keydownValue),
            isPlaceholderValue = (elem.value === elem.getAttribute(ATTR_CURRENT_VAL));

        if ((valueChanged || isPlaceholderValue) && elem.getAttribute(ATTR_ACTIVE) === "true") {
            elem.removeAttribute(ATTR_ACTIVE);
            elem.value = elem.value.replace(elem.getAttribute(ATTR_CURRENT_VAL), "");
            elem.className = elem.className.replace(classNameRegExp, "");

            // Restore the maxlength value
            maxLength = elem.getAttribute(ATTR_MAXLENGTH);
            if (parseInt(maxLength, 10) >= 0) { // Old FF returns -1 if attribute not set (see GH-56)
                elem.setAttribute("maxLength", maxLength);
                elem.removeAttribute(ATTR_MAXLENGTH);
            }

            // If the polyfill has changed the type of the element we need to change it back
            type = elem.getAttribute(ATTR_INPUT_TYPE);
            if (type) {
                elem.type = type;
            }
            return true;
        }
        return false;
    }

    // Show the placeholder value on a single element. Returns true if the placeholder was shown and false if it was not (because it was already visible)
    function showPlaceholder(elem) {
        var type,
        maxLength,
        val = elem.getAttribute(ATTR_CURRENT_VAL);
        if (elem.value === "" && val) {
            elem.setAttribute(ATTR_ACTIVE, "true");
            elem.value = val;
            elem.className += " " + placeholderClassName;

            // Store and remove the maxlength value
            maxLength = elem.getAttribute(ATTR_MAXLENGTH);
            if (!maxLength) {
                elem.setAttribute(ATTR_MAXLENGTH, elem.maxLength);
                elem.removeAttribute("maxLength");
            }

            // If the type of element needs to change, change it (e.g. password inputs)
            type = elem.getAttribute(ATTR_INPUT_TYPE);
            if (type) {
                elem.type = "text";
            } else if (elem.type === "password") {
                if (Utils.changeType(elem, "text")) {
                    elem.setAttribute(ATTR_INPUT_TYPE, "password");
                }
            }
            return true;
        }
        return false;
    }

    function handleElem(node, callback) {

        var handleInputsLength, handleTextareasLength, handleInputs, handleTextareas, elem, len, i;

        // Check if the passed in node is an input/textarea (in which case it can't have any affected descendants)
        if (node && node.getAttribute(ATTR_CURRENT_VAL)) {
            callback(node);
        } else {

            // If an element was passed in, get all affected descendants. Otherwise, get all affected elements in document
            handleInputs = node ? node.getElementsByTagName("input") : inputs;
            handleTextareas = node ? node.getElementsByTagName("textarea") : textareas;

            handleInputsLength = handleInputs ? handleInputs.length : 0;
            handleTextareasLength = handleTextareas ? handleTextareas.length : 0;

            // Run the callback for each element
            for (i = 0, len = handleInputsLength + handleTextareasLength; i < len; i++) {
                elem = i < handleInputsLength ? handleInputs[i] : handleTextareas[i - handleInputsLength];
                callback(elem);
            }
        }
    }

    // Return all affected elements to their normal state (remove placeholder value if present)
    function disablePlaceholders(node) {
        handleElem(node, hidePlaceholder);
    }

    // Show the placeholder value on all appropriate elements
    function enablePlaceholders(node) {
        handleElem(node, showPlaceholder);
    }

    // Returns a function that is used as a focus event handler
    function makeFocusHandler(elem) {
        return function() {

            // Only hide the placeholder value if the (default) hide-on-focus behaviour is enabled
            if (hideOnInput && elem.value === elem.getAttribute(ATTR_CURRENT_VAL) && elem.getAttribute(ATTR_ACTIVE) === "true") {

                // Move the caret to the start of the input (this mimics the behaviour of all browsers that do not hide the placeholder on focus)
                Utils.moveCaret(elem, 0);

            } else {

                // Remove the placeholder
                hidePlaceholder(elem);
            }
        };
    }

    // Returns a function that is used as a blur event handler
    function makeBlurHandler(elem) {
        return function() {
            showPlaceholder(elem);
        };
    }

    // Functions that are used as a event handlers when the hide-on-input behaviour has been activated - very basic implementation of the "input" event
    function makeKeydownHandler(elem) {
        return function(e) {
            keydownVal = elem.value;

            //Prevent the use of the arrow keys (try to keep the cursor before the placeholder)
            if (elem.getAttribute(ATTR_ACTIVE) === "true") {
                if (keydownVal === elem.getAttribute(ATTR_CURRENT_VAL) && Utils.inArray(badKeys, e.keyCode)) {
                    if (e.preventDefault) {
                        e.preventDefault();
                    }
                    return false;
                }
            }
        };
    }

    function makeKeyupHandler(elem) {
        return function() {
            hidePlaceholder(elem, keydownVal);

            // If the element is now empty we need to show the placeholder
            if (elem.value === "") {
                elem.blur();
                Utils.moveCaret(elem, 0);
            }
        };
    }

    function makeClickHandler(elem) {
        return function() {
            if (elem === safeActiveElement() && elem.value === elem.getAttribute(ATTR_CURRENT_VAL) && elem.getAttribute(ATTR_ACTIVE) === "true") {
                Utils.moveCaret(elem, 0);
            }
        };
    }

    // Returns a function that is used as a submit event handler on form elements that have children affected by this polyfill
    function makeSubmitHandler(form) {
        return function() {

            // Turn off placeholders on all appropriate descendant elements
            disablePlaceholders(form);
        };
    }

    // Bind event handlers to an element that we need to affect with the polyfill
    function newElement(elem) {

        // If the element is part of a form, make sure the placeholder string is not submitted as a value
        if (elem.form) {
            form = elem.form;

            // If the type of the property is a string then we have a "form" attribute and need to get the real form
            if (typeof form === "string") {
                form = document.getElementById(form);
            }

            // Set a flag on the form so we know it's been handled (forms can contain multiple inputs)
            if (!form.getAttribute(ATTR_FORM_HANDLED)) {
                Utils.addEventListener(form, "submit", makeSubmitHandler(form));
                form.setAttribute(ATTR_FORM_HANDLED, "true");
            }
        }

        // Bind event handlers to the element so we can hide/show the placeholder as appropriate
        Utils.addEventListener(elem, "focus", makeFocusHandler(elem));
        Utils.addEventListener(elem, "blur", makeBlurHandler(elem));

        // If the placeholder should hide on input rather than on focus we need additional event handlers
        if (hideOnInput) {
            Utils.addEventListener(elem, "keydown", makeKeydownHandler(elem));
            Utils.addEventListener(elem, "keyup", makeKeyupHandler(elem));
            Utils.addEventListener(elem, "click", makeClickHandler(elem));
        }

        // Remember that we've bound event handlers to this element
        elem.setAttribute(ATTR_EVENTS_BOUND, "true");
        elem.setAttribute(ATTR_CURRENT_VAL, placeholder);

        // If the element doesn't have a value and is not focussed, set it to the placeholder string
        if (hideOnInput || elem !== safeActiveElement()) {
            showPlaceholder(elem);
        }
    }

    Placeholders.nativeSupport = test.placeholder !== void 0;

    if (!Placeholders.nativeSupport) {

        // Get references to all the input and textarea elements currently in the DOM (live NodeList objects to we only need to do this once)
        inputs = document.getElementsByTagName("input");
        textareas = document.getElementsByTagName("textarea");

        // Get any settings declared as data-* attributes on the root element (currently the only options are whether to hide the placeholder on focus or input and whether to auto-update)
        hideOnInput = root.getAttribute(ATTR_OPTION_FOCUS) === "false";
        liveUpdates = root.getAttribute(ATTR_OPTION_LIVE) !== "false";

        // Create style element for placeholder styles (instead of directly setting style properties on elements - allows for better flexibility alongside user-defined styles)
        styleElem = document.createElement("style");
        styleElem.type = "text/css";

        // Create style rules as text node
        styleRules = document.createTextNode("." + placeholderClassName + " { color:" + placeholderStyleColor + "; }");

        // Append style rules to newly created stylesheet
        if (styleElem.styleSheet) {
            styleElem.styleSheet.cssText = styleRules.nodeValue;
        } else {
            styleElem.appendChild(styleRules);
        }

        // Prepend new style element to the head (before any existing stylesheets, so user-defined rules take precedence)
        head.insertBefore(styleElem, head.firstChild);

        // Set up the placeholders
        for (i = 0, len = inputs.length + textareas.length; i < len; i++) {
            elem = i < inputs.length ? inputs[i] : textareas[i - inputs.length];

            // Get the value of the placeholder attribute, if any. IE10 emulating IE7 fails with getAttribute, hence the use of the attributes node
            placeholder = elem.attributes.placeholder;
            if (placeholder) {

                // IE returns an empty object instead of undefined if the attribute is not present
                placeholder = placeholder.nodeValue;

                // Only apply the polyfill if this element is of a type that supports placeholders, and has a placeholder attribute with a non-empty value
                if (placeholder && Utils.inArray(validTypes, elem.type)) {
                    newElement(elem);
                }
            }
        }

        // If enabled, the polyfill will repeatedly check for changed/added elements and apply to those as well
        timer = setInterval(function() {
            for (i = 0, len = inputs.length + textareas.length; i < len; i++) {
                elem = i < inputs.length ? inputs[i] : textareas[i - inputs.length];

                // Only apply the polyfill if this element is of a type that supports placeholders, and has a placeholder attribute with a non-empty value
                placeholder = elem.attributes.placeholder;
                if (placeholder) {
                    placeholder = placeholder.nodeValue;
                    if (placeholder && Utils.inArray(validTypes, elem.type)) {

                        // If the element hasn't had event handlers bound to it then add them
                        if (!elem.getAttribute(ATTR_EVENTS_BOUND)) {
                            newElement(elem);
                        }

                        // If the placeholder value has changed or not been initialised yet we need to update the display
                        if (placeholder !== elem.getAttribute(ATTR_CURRENT_VAL) || (elem.type === "password" && !elem.getAttribute(ATTR_INPUT_TYPE))) {

                            // Attempt to change the type of password inputs (fails in IE < 9)
                            if (elem.type === "password" && !elem.getAttribute(ATTR_INPUT_TYPE) && Utils.changeType(elem, "text")) {
                                elem.setAttribute(ATTR_INPUT_TYPE, "password");
                            }

                            // If the placeholder value has changed and the placeholder is currently on display we need to change it
                            if (elem.value === elem.getAttribute(ATTR_CURRENT_VAL)) {
                                elem.value = placeholder;
                            }

                            // Keep a reference to the current placeholder value in case it changes via another script
                            elem.setAttribute(ATTR_CURRENT_VAL, placeholder);
                        }
                    }
                } else if (elem.getAttribute(ATTR_ACTIVE)) {
                    hidePlaceholder(elem);
                    elem.removeAttribute(ATTR_CURRENT_VAL);
                }
            }

            // If live updates are not enabled cancel the timer
            if (!liveUpdates) {
                clearInterval(timer);
            }
        }, 100);
    }

    Utils.addEventListener(global, "beforeunload", function() {
        Placeholders.disable();
    });

    // Expose public methods
    Placeholders.disable = Placeholders.nativeSupport ? noop : disablePlaceholders;
    Placeholders.enable = Placeholders.nativeSupport ? noop : enablePlaceholders;

}(this));

(function($) {

    "use strict";

    var originalValFn = $.fn.val,
        originalPropFn = $.fn.prop;

    if (!Placeholders.nativeSupport) {

        $.fn.val = function(val) {
            var originalValue = originalValFn.apply(this, arguments),
                placeholder = this.eq(0).data("placeholder-value");
            if (val === undefined && this.eq(0).data("placeholder-active") && originalValue === placeholder) {
                return "";
            }
            return originalValue;
        };

        $.fn.prop = function(name, val) {
            if (val === undefined && this.eq(0).data("placeholder-active") && name === "value") {
                return "";
            }
            return originalPropFn.apply(this, arguments);
        };
    }

}(jQuery));
/**
 *   Unslider by @idiot and @damirfoy
 *   Contributors:
 *   - @ShamoX
 *
 */

(function($, f) {
	var Unslider = function() {
		//  Object clone
		var _ = this;

		//  Set some options
		_.o = {
			speed: 500,     // animation speed, false for no transition (integer or boolean)
			delay: 3000,    // delay between slides, false for no autoplay (integer or boolean)
			init: 0,        // init delay, false for no delay (integer or boolean)
			pause: !f,      // pause on hover (boolean)
			loop: !f,       // infinitely looping (boolean)
			keys: f,        // keyboard shortcuts (boolean)
			dots: f,        // display ••••o• pagination (boolean)
			arrows: f,      // display prev/next arrows (boolean)
			prev: '←',      // text or html inside prev button (string)
			next: '→',      // same as for prev option
			fluid: f,       // is it a percentage width? (boolean)
			starting: f,    // invoke before animation (function with argument)
			complete: f,    // invoke after animation (function with argument)
			items: '>ul',   // slides container selector
			item: '>li',    // slidable items selector
			easing: 'swing',// easing function to use for animation
			autoplay: true  // enable autoplay on initialisation
		};

		_.init = function(el, o) {
			//  Check whether we're passing any options in to Unslider
			_.o = $.extend(_.o, o);

			_.el = el;
			_.ul = el.find(_.o.items);
			_.max = [el.outerWidth() | 0, el.outerHeight() | 0];
			_.li = _.ul.find(_.o.item).each(function(index) {
				var me = $(this),
					width = me.outerWidth(),
					height = me.outerHeight();

				//  Set the max values
				if (width > _.max[0]) _.max[0] = width;
				if (height > _.max[1]) _.max[1] = height;
			});


			//  Cached vars
			var o = _.o,
				ul = _.ul,
				li = _.li,
				len = li.length;

			//  Current indeed
			_.i = 0;

			//  Set the main element
			el.css({width: _.max[0], height: li.first().outerHeight(), overflow: 'hidden'});

			//  Set the relative widths
			ul.css({position: 'relative', left: 0, width: (len * 100) + '%'});
			li.css({'float': 'left', width: (100 / len) + '%'});

			//  Autoslide
			o.autoplay && setTimeout(function() {
				if (o.delay | 0) {
					_.play();

					if (o.pause) {
						el.on('mouseover mouseout', function(e) {
							_.stop();
							e.type == 'mouseout' && _.play();
						});
					};
				};
			}, o.init | 0);

			//  Keypresses
			if (o.keys) {
				$(document).keydown(function(e) {
					var key = e.which;

					if (key == 37)
						_.prev(); // Left
					else if (key == 39)
						_.next(); // Right
					else if (key == 27)
						_.stop(); // Esc
				});
			};

			//  Dot pagination
			o.dots && nav('dot');

			//  Arrows support
			o.arrows && nav('arrow');

			//  Patch for fluid-width sliders. Screw those guys.
			if (o.fluid) {
				$(window).resize(function() {
					_.r && clearTimeout(_.r);

					_.r = setTimeout(function() {
						var styl = {height: li.eq(_.i).outerHeight()},
							width = el.outerWidth();

						ul.css(styl);
						styl['width'] = Math.min(Math.round((width / el.parent().width()) * 100), 100) + '%';
						el.css(styl);
					}, 50);
				}).resize();
			};

			//  Swipe support
			if ($.event.special['swipe'] || $.Event('swipe')) {
				el.on('swipeleft swiperight swipeLeft swipeRight', function(e) {
					e.type.toLowerCase() == 'swipeleft' ? _.next() : _.prev();
				});
			};

			return _;
		};

		//  Move Unslider to a slide index
		_.to = function(index, callback) {
			if (_.t) {
				_.stop();
				_.play();
	                }
			var o = _.o,
				el = _.el,
				ul = _.ul,
				li = _.li,
				current = _.i,
				target = li.eq(index);

			$.isFunction(o.starting) && !callback && o.starting(el, li.eq(current));

			//  To slide or not to slide
			if ((!target.length || index < 0) && o.loop == f) return;

			//  Check if it's out of bounds
			if (!target.length) index = 0;
			if (index < 0) index = li.length - 1;
			target = li.eq(index);

			var speed = callback ? 5 : o.speed | 0,
				easing = o.easing,
				obj = {height: target.outerHeight()};

			if (!ul.queue('fx').length) {
				//  Handle those pesky dots
				el.find('.dot').eq(index).addClass('active').siblings().removeClass('active');

				el.animate(obj, speed, easing) && ul.animate($.extend({left: '-' + index + '00%'}, obj), speed, easing, function(data) {
					_.i = index;

					$.isFunction(o.complete) && !callback && o.complete(el, target);
				});
			};
		};

		//  Autoplay functionality
		_.play = function() {
			_.t = setInterval(function() {
				_.to(_.i + 1);
			}, _.o.delay | 0);
		};

		//  Stop autoplay
		_.stop = function() {
			_.t = clearInterval(_.t);
			return _;
		};

		//  Move to previous/next slide
		_.next = function() {
			return _.stop().to(_.i + 1);
		};

		_.prev = function() {
			return _.stop().to(_.i - 1);
		};

		//  Create dots and arrows
		function nav(name, html) {
			if (name == 'dot') {
				html = '<ol class="dots">';
					$.each(_.li, function(index) {
						html += '<li class="' + (index == _.i ? name + ' active' : name) + '">' + ++index + '</li>';
					});
				html += '</ol>';
			} else {
				html = '<div class="';
				html = html + name + 's">' + html + name + ' prev">' + _.o.prev + '</div>' + html + name + ' next">' + _.o.next + '</div></div>';
			};

			_.el.addClass('has-' + name + 's').append(html).find('.' + name).click(function() {
				var me = $(this);
				me.hasClass('dot') ? _.stop().to(me.index()) : me.hasClass('prev') ? _.prev() : _.next();
			});
		};
	};

	//  Create a jQuery plugin
	$.fn.unslider = function(o) {
		var len = this.length;

		//  Enable multiple-slider support
		return this.each(function(index) {
			//  Cache a copy of $(this), so it
			var me = $(this),
				key = 'unslider' + (len > 1 ? '-' + ++index : ''),
				instance = (new Unslider).init(me, o);

			//  Invoke an Unslider instance
			me.data(key, instance).data('key', key);
		});
	};

	Unslider.version = "1.0.0";
})(jQuery, false);
// 定义 Validator 类
var Validator = function (el, options) {
	options = $.extend({}, $.fn.validator.defaults, options);

    var items = [];
    var cache = new Cache();

    this.items = items;
    this.cache = cache;
	this.options = options;

	this.setup();
};

Validator.prototype = {

	constructor: Validator,

	setup: function () {
		var $btn = this.options.submit.btn;

        if ($btn) {
            $btn.data('clicking', false);
            $btn.on('click.validate', (function (_this) {
                return function (e) {
                    e.preventDefault();
                    setTimeout(function () {
                        _this.submit.call(_this, $btn);
                    }, 100);
                }
            })(this));
        }

        $.each(this.options.items, (function (_this) {
            return function () {
                _this.process(this);
            }
        })(this));
	},

	process: function (opts) {
        var self = this,
            $item = $(opts.selector),
            eventType;

		this.items.push($item);

        $item.on('validate', function () {
            self.validateItem.apply(self, [this, opts]);
        });

        if ($item.is('input')) {
            eventType = 'blur';
        } else if ($item.is('select')) {
            eventType = 'change';
        }

        $item.on(eventType, function () {
            $(this).trigger('validate');
        });
	},

    validateItem: function (item, opts) {
        var self = this,
            client_ret = opts.validate(),
            $loading, $parent;

        if (client_ret !== 'success') {
            self.handleTip(item, {type: 'error', info: client_ret});
            return false;
        }

        if (opts.remote) {

            // 请求数据在缓存内，则不发送请求
            if (item.value in self.cache._storage) {
                var _data = self.cache.load(item.value);

                if (_data.errorNo !== 0) {
                    self.handleTip(item, {type: 'error', info: _data.errorInfo});
                } else {
                    self.handleTip(item, {type: 'success', info: _data.successInfo});
                }

                if (opts.ajaxCallback) {
                    opts.ajaxCallback.apply(_data);
                }

                return;
            }

            // $(this.tiper).hide();
            $parent = $(item).parent();
            $parent.find('.js-valid-tip').hide();
            $loading = $('<img class="js-valid-loading" src="/images/gif/loading.gif">');
            $parent.append($loading);

            $.ajax({
                type: 'POST',
                url: opts.remote,
                data: opts.params(),
                dataType: 'json'
            }).done((function (_this) {
                return function (data) {
                    var _data = data.resMap;

                    if (_data.errorNo !== 0) {
                        self.handleTip(_this, {type: 'error', info: _data.errorInfo});
                    } else {
                        self.handleTip(_this, {type: 'success', info: _data.successInfo});
                    }

                    if (opts.ajaxCallback) {
                        opts.ajaxCallback.apply(_data);
                    }

                    // 将发送的数据加入缓存中
                    self.cache.add(item.value, _data);
                }
            })(item))
            .always(function () {
                $loading.remove();
            });
        } else {
            self.handleTip(item, {type: 'success'});
        }
    },

    initTip: function (el) {
        var tip, parent;

        tip = document.createElement('span');
        tip.setAttribute('class', 'js-valid-tip');
        parent = el.parentNode;
        parent.appendChild(tip);
        $(el).data('tiped', true);

        if (typeof Object.create === 'undefined') {
            $(tip).css('font-size', '12px');
        }

        return tip;
    },

    handleTip: function (el, data) {
        var itemData, tiper;

        itemData = {
            type: data.type || 'success',
            info: data.info || ''
        };

        // this.tiper = $(el).data('tiped') ?
        //     $(el.parentNode).find('.js-valid-tip')[0] : 
        //     this.initTip(el);

        if ($(el).data('tiped')) {
            tiper = $(el.parentNode).find('.js-valid-tip')[0];
        } else {
            tiper = this.initTip(el);
        }

        this.renderTip(tiper, itemData);
        $(tiper).show();

        return $(el).data('item-data', itemData);
    },

    renderTip: function (tiper, data) {
        // $(el).parent().find('.js-valid-tip').html('<i class="icon icon-' + data.type + '"></i>' + data.info);
        if (tiper) {
            tiper.innerHTML = '<i class="icon icon-' + data.type + '"></i>' + data.info;
        }
    },

    submit: function ($btn) {
        var self = this,
            client_rets = [];

        $.each(this.items, function () {
            this.trigger('validate');
            if (this.data('item-data').type === 'error') {
                self.handleTip(this.get(0), this.data('item-data'));
                client_rets.push(this);
            }
        });

        if (!client_rets.length) { // 本地验证通过

            // submit 事件之前的事件
            if (this.options.submit.beforeAjax) {
                $btn.data('go', this.options.submit.beforeAjax());
                if (!$btn.data('go')) return;
            }

            if (!this.options.submit.remote) {
                // 如果是 `form`，采用默认的表单提交
                if ($el.is('form')) {
                    $el.trigger('submit');
                }
                return;
            }

            var $loading;

            $loading = $btn.parent().find('.loading');
            if ($loading) {
                $loading.css('visibility', 'visible');
            }

            // 防止重复点击多次请求
            if ($btn.data('clicking')) return;
            $btn.data('clicking', true);

            $.ajax({
                type: 'POST',
                url: this.options.submit.remote,
                data: this.options.submit.params(),
                dataType: 'json'
            }).done(function (data) {
                var _data = data.resMap;

                if (_data.errorNo !== 0) { // 失败处理
                    if (_data.errorItem) {
                        for (var i = 0, l = _data.errorItem.length; i < l; i++) {
                            var errorItem = document.getElementById(_data.errorItem[i]);
                            if (errorItem) {
                                self.handleTip(errorItem, {type: 'error', info: _data.errorInfo});
                            }
                        }
                    } else {
                        // TODO: 不固定位置提示
                    }
                }

                if (self.options.submit.ajaxSubmitCallback) {
                    self.options.submit.ajaxSubmitCallback(_data);
                };

                $btn.data('clicking', false);
            }).always(function () {
                $loading.css('visibility', 'hidden');
            });
        }

    }
};

// 注册插件
$.fn.validator = function (options) {
	return this.each(function () {
		new Validator(this, options);
	});
};

// 默认设置
$.fn.validator.defaults = {
    submit: {}
};

$.fn.Constructor = Validator;

var Cache = function () {
    this._storage = {};
}

Cache.prototype.add = function(q, v) {
    if (!this._storage[q]) {
        this._storage[q] = v;
    }
};

Cache.prototype.load = function(q) {
    if (this._storage[q]) {
        return this._storage[q];
    }
};

Cache.prototype.clear = function() {
    this._storage = {};
    this._storage.length = 0;
};
