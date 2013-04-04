describe('plugins.ToolActivateMgr', function() {
    var t1, t2;

    beforeEach(function() {
        var target = {
            on: function() {
            },
            tools: {}
        };

        var Tool1 = Ext.extend(gxp.plugins.Tool, {
            autoActivate: true,
            activateToggleGroup: 'group',
            init: function() {
                if (this.activateToggleGroup) {
                    cgxp.plugins.ToolActivateMgr.register(this);
                }
                this.ctrl = new OpenLayers.Control({autoActivate: false});
                Tool1.superclass.init.apply(this, arguments);
            },
            activate: function() {
                if (!this.active) {
                    this.ctrl.activate();
                }
                return Tool1.superclass.activate.call(this);
            },
            deactivate: function() {
                if (this.active) {
                    this.ctrl.deactivate();
                }
                return Tool1.superclass.deactivate.call(this);
            }
        });

        var Tool2 = Ext.extend(gxp.plugins.Tool, {
            autoActivate: false,
            activateToggleGroup: 'group',
            init: function() {
                if (this.activateToggleGroup) {
                    cgxp.plugins.ToolActivateMgr.register(this);
                }
                this.ctrl = new OpenLayers.Control({
                    autoActivate: false,
                    eventListeners: {
                        activate: function() {
                            this.activate();
                        },
                        deactivate: function() {
                            this.deactivate();
                        },
                        scope: this
                    }
                });
                Tool2.superclass.init.apply(this, arguments);
            }
        });

        t1 = new Tool1();
        t1.init(target);
        t2 = new Tool2();
        t2.init(target);
        t3 = new Tool2();
        t3.init(target);
        t4 = new Tool1();
        t4.init(target);
    });

    it('works as expected', function() {
        expect(t1.active).toBeTruthy();
        expect(t1.ctrl.active).toBeTruthy();
        expect(t2.active).toBeFalsy();
        expect(t2.ctrl.active).toBeFalsy();
        expect(t3.active).toBeFalsy();
        expect(t3.ctrl.active).toBeFalsy();
        expect(t4.active).toBeTruthy();
        expect(t4.ctrl.active).toBeTruthy();
        t2.ctrl.activate();
        expect(t1.active).toBeFalsy();
        expect(t1.ctrl.active).toBeFalsy();
        expect(t2.active).toBeTruthy();
        expect(t2.ctrl.active).toBeTruthy();
        expect(t3.active).toBeFalsy();
        expect(t3.ctrl.active).toBeFalsy();
        expect(t4.active).toBeFalsy();
        expect(t4.ctrl.active).toBeFalsy();
        t2.ctrl.deactivate();
        expect(t1.active).toBeTruthy();
        expect(t1.ctrl.active).toBeTruthy();
        expect(t2.active).toBeFalsy();
        expect(t2.ctrl.active).toBeFalsy();
        expect(t3.active).toBeFalsy();
        expect(t3.ctrl.active).toBeFalsy();
        expect(t4.active).toBeTruthy();
        expect(t4.ctrl.active).toBeTruthy();
    });
});
