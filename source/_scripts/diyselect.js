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

        this.$el.width(this.$choice.outerWidth());

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
