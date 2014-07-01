
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
