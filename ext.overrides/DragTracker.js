/**
 * Ext override to get sliders to work properly on IE9.
 * See http://www.sencha.com/forum/showthread.php?141254-Ext.Slider-not-working-properly-in-IE9
 */
Ext.override(Ext.dd.DragTracker, {
    onMouseMove: function (e, target) {
        var isIE9 = Ext.isIE && (/msie 9/.test(navigator.userAgent.toLowerCase())) && document.documentMode != 6;
        if (this.active && Ext.isIE && !isIE9 && !e.browserEvent.button) {
            e.preventDefault();
            this.onMouseUp(e);
            return;
        }
        e.preventDefault();
        var xy = e.getXY(), s = this.startXY;
        this.lastXY = xy;
        if (!this.active) {
            if (Math.abs(s[0] - xy[0]) > this.tolerance || Math.abs(s[1] - xy[1]) > this.tolerance) {
                this.triggerStart(e);
            } else {
                return;
            }
        }
        this.fireEvent('mousemove', this, e);
        this.onDrag(e);
        this.fireEvent('drag', this, e);
    }
});
