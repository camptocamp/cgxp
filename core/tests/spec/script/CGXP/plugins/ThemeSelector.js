describe('plugins.ThemeSelector', function() {
    var ts;
    afterEach(function() {
        // clean up the DOM, which must be Ext-free
        // after each run
        var cmp = ts && ts.output && ts.output[0];
        while(cmp && cmp.ownerCt) {
            cmp = cmp.ownerCt;
        }
        if(cmp) {
            cmp.destroy();
        }
        ts = null;
    });
    describe('when calling constructor', function() {
        beforeEach(function() {
            ts = new cgxp.plugins.ThemeSelector();
        });
        it('creates a gxp tool', function() {
            expect(ts).toBeInstanceOf(gxp.plugins.Tool);
        });
        it('creates a theme selector', function() {
            expect(ts).toBeInstanceOf(cgxp.plugins.ThemeSelector);
        });
    });
    describe('when calling addOutput', function() {
        var output, tabPanel;
        beforeEach(function() {
            var themes = {
                local: [{
                    name: 'localname1',
                    icon: 'localicon1',
                    children: []
                }, {
                    name: 'localname2',
                    icon: 'localicon2',
                    children: []
                }],
                external: [{
                    name: 'externalname1',
                    icon: 'externalicon1',
                    children: []
                }, {
                    name: 'externalname2',
                    icon: 'externalicon2',
                    children: []
                }]
            };
            ts = new cgxp.plugins.ThemeSelector({themes: themes});
            output = ts.addOutput({extra: 'extra'});
        });
        it('creates a button', function() {
            expect(output).toBeInstanceOf(Ext.Button);
        });
        it('creates a button with an extra property', function() {
            expect(output.extra).toEqual('extra');
        });
        it('creates a menu', function() {
            expect(output.menu).toBeInstanceOf(Ext.menu.Menu);
        });
        it('creates a menu with one item', function() {
            expect(output.menu.items.length).toEqual(1);
        });
        it('creates a tab panel', function() {
            expect(output.menu.getComponent(0)).toBeInstanceOf(Ext.TabPanel);
        });
        beforeEach(function() {
            tabPanel = output.menu.getComponent(0);
        });
        it('creates a tab panel with two tabs', function() {
            expect(tabPanel.items.length).toEqual(2);
        });
        it('creates a data view', function() {
            expect(tabPanel.getComponent(0)).toBeInstanceOf(Ext.DataView);
        });
        it('creates a store with 2 records', function() {
            expect(tabPanel.getComponent(0).getStore().getCount()).toEqual(2);
        });
        it('creates expected data in store', function() {
            expect(tabPanel.getComponent(0).getStore().getAt(0).get('name')).toEqual('localname1');
        });
        it('creates a another data view', function() {
            expect(tabPanel.getComponent(1)).toBeInstanceOf(Ext.DataView);
        });
        it('creates a store with 2 records', function() {
            expect(tabPanel.getComponent(1).getStore().getCount()).toEqual(2);
        });
        it('creates expected data in store', function() {
            expect(tabPanel.getComponent(1).getStore().getAt(0).get('name')).toEqual('externalname1');
        });
    });
});
