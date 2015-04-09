/*
    Solves a problem with plugins GoogleEarth and StreetView causing a
    duplicated splitbar, due to the forced "rendered = false". The latter
    configuration is required otherwise the panels contents are not rendered
    correctly when the panels are re-opened.
*/
Ext.layout.BorderLayout.SplitRegion.override({

    render : function(ct, p){

        Ext.layout.BorderLayout.SplitRegion.superclass.render.call(this, ct, p);

        var ps = this.position;

        // start override
        var elId = this.panel.id + '-xsplit';
        var el = Ext.get(elId);
        if (!el)  {
            this.splitEl = ct.createChild({
                cls: "x-layout-split x-layout-split-"+ps, html: "&#160;",
                id: elId
            });
        } else {
            this.splitEl = el;
        }
        // end override

        if(this.collapseMode == 'mini'){
            this.miniSplitEl = this.splitEl.createChild({
                cls: "x-layout-mini x-layout-mini-"+ps, html: "&#160;"
            });
            this.miniSplitEl.addClassOnOver('x-layout-mini-over');
            this.miniSplitEl.on('click', this.onCollapseClick, this, {stopEvent:true});
        }

        var s = this.splitSettings[ps];

        this.split = new Ext.SplitBar(this.splitEl.dom, p.el, s.orientation);
        this.split.tickSize = this.tickSize;
        this.split.placement = s.placement;
        this.split.getMaximumSize = this[s.maxFn].createDelegate(this);
        this.split.minSize = this.minSize || this[s.minProp];
        this.split.on("beforeapply", this.onSplitMove, this);
        this.split.useShim = this.useShim === true;
        this.maxSize = this.maxSize || this[s.maxProp];

        if(p.hidden){
            this.splitEl.hide();
        }

        if(this.useSplitTips){
            this.splitEl.dom.title = this.collapsible ? this.collapsibleSplitTip : this.splitTip;
        }
        if(this.collapsible){
            this.splitEl.on("dblclick", this.onCollapseClick,  this);
        }
    }
});
