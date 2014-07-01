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
