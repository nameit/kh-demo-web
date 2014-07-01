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
