describe('plugins.ThemeFinder', function() {
    var tf;
    afterEach(function() {
        // clean up the DOM, which must be Ext-free
        // after each run
        var cmp = tf && tf.output && tf.output[0];
        while(cmp && cmp.ownerCt) {
            cmp = cmp.ownerCt;
        }
        if(cmp) {
            cmp.destroy();
        }
        tf = null;
    });
    describe('when calling constructor', function() {
        beforeEach(function() {
            tf = new cgxp.plugins.ThemeFinder();
        });
        it('creates a gxp tool', function() {
            expect(tf).toBeInstanceOf(gxp.plugins.Tool);
        });
        it('creates a theme finder', function() {
            expect(tf).toBeInstanceOf(cgxp.plugins.ThemeFinder);
        });
    });
    describe('when calling addOutput', function() {
        var output;
        beforeEach(function() {
            var themes = {
                local: [{
                    name: 'name1',
                    displayName: 'display1',
                    children: []
                }, {
                    name: 'localname2',
                    displayName: 'localname2',
                    children: [{
                        name: 'localname2',
                        displayName: 'localname2',
                        children: [{
                            name: 'node1',
                            displayName: 'node1',
                            children: [{
                                name: 'layer1',
                                displayName: 'layer1'
                            }]
                        }]
                    }]
                }],
                external: [{
                    name: 'externalname',
                    displayName: 'externalname',
                    children: []
                }]
            };

            tf = new cgxp.plugins.ThemeFinder({
                themes: themes
            });
            output = tf.addOutput();
        });
        it('creates a ComboBox', function() {
            expect(output).toBeInstanceOf(Ext.form.ComboBox);
            expect(output.getStore().getCount()).toEqual(0);
        });
        it('search external', function() {
            output.doQuery('externalname');
            expect(output.getStore().getCount()).toEqual(1);
        });
        it('search name', function() {
            output.doQuery('name1');
            expect(output.getStore().getCount()).toEqual(1);
        });
        it('search display name', function() {
            output.doQuery('display1');
            expect(output.getStore().getCount()).toEqual(1);
        });
        it('search same theme ans main layer group', function() {
            output.doQuery('localname2');
            expect(output.getStore().getCount()).toEqual(1);
        });
        it('search intermediate layer group', function() {
            output.doQuery('node1');
            expect(output.getStore().getCount()).toEqual(1);
        });
        it('search layer', function() {
            output.doQuery('layer1');
            expect(output.getStore().getCount()).toEqual(1);
        });
    });
});

