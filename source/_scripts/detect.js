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
