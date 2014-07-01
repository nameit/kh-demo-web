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
