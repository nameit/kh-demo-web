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
