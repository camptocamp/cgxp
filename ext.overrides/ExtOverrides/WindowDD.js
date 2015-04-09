/*
    Solves a problem with Ext windows and IE, where the mouse cursor is not
    reinitialized after dragging the window.
    cf: https://github.com/camptocamp/cgxp/issues/802
    cf: http://www.sencha.com/forum/showthread.php?264999-Ext-JS-3.4.x-IE10-Move-cursor-remains-after-dragging-Window
    HACK by http://www.sencha.com/forum/member.php?18080-Rocco
*/
if (Ext.isIE) {
    Ext.override(Ext.Window.DD, {
        endDrag : function(e){
            Ext.defer(this.win.unghost, 1, this.win); // HACK
            this.win.saveState();
        }
    });
}
