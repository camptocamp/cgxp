/**
* Get IE version from userAgent, Set Ext classes and variables if IE11 or
* greater is detected
*/
var detectIE = function() {
    if (!Ext.isIE) {
        var ua = navigator.userAgent;
        var re = new RegExp(".*(Trident|Edge).*rv:([0-9]{1,}[\.0-9]{0,})");
        if (re.exec(ua) === null) {
            return;
        }
        var engine = RegExp.$1;
        var rv = parseFloat(RegExp.$2);
        var newClasses = [];
        Ext.isIE = true;
        newClasses.push('ext-ie');
        if (engine == 'Trident' && rv > 10) {
            newClasses.push('ext-ie' + rv);
            Ext['isIE' + rv] = true;
        } else if (engine == 'Edge') {
            newClasses.push('ext-ie-edge' + rv);
            Ext['isIEEdge' + rv] = true;
        }
        for (var i=0, l=newClasses.length; i<l; i++) {
            Ext.getBody().addClass(newClasses[i]);
        }
    }
};

/**
* IE11 and greater are not detected anymore by ext 3.4
*/
detectIE();
