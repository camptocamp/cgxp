describe('plugins.Disclaimer', function() {
    var d;
    beforeEach(function() {
        d = new cgxp.plugins.Disclaimer();
    });
    afterEach(function() {
        // clean up the DOM, which must be Ext-free
        // after each run
        var cmp = d && d.output && d.output[0];
        while(cmp && cmp.ownerCt) {
            cmp = cmp.ownerCt;
        }
        if(cmp) {
            cmp.destroy();
        }
        d = null;
    });
    describe('when calling constructor', function() {
        it('creates a gxp tool', function() {
            expect(d).toBeInstanceOf(gxp.plugins.Tool);
        });
        it('creates a disclaimer', function() {
            expect(d).toBeInstanceOf(cgxp.plugins.Disclaimer);
        });
    });
    describe('when calling init', function() {
        var o = new Ext.util.Observable();
        var target;
        o.addEvents('add', 'remove');
        beforeEach(function() {
            target = {
                tools: {},
                mapPanel: {
                    layers: o
                },
                on: function(){}
            };
            spyOn(d, 'onAdd');
            spyOn(d, 'onRemove');
            d.init(target);
        });
        it('creates a disclaimers object', function() {
            expect(d.disclaimers).toEqual({});
        });
        describe('when add event is fired', function() {
            it('calls the onAdd method', function() {
                o.fireEvent('add', 'foo')
                expect(d.onAdd).toHaveBeenCalledWith('foo');
            });
        });
        describe('when remove event is fired', function() {
            it('calls the onRemove method', function() {
                o.fireEvent('remove', 'bar')
                expect(d.onRemove).toHaveBeenCalledWith('bar');
            });
        });
    });
    describe('when calling addOutput', function() {
        var output;
        beforeEach(function() {
            d.target = {
                mapPanel: {
                    map: new OpenLayers.Map('map')
                }
            };
            output = d.addOutput();
        });
        it('creates a container', function() {
            expect(output).toBeInstanceOf(Ext.Container);
        });
        it('sets z-index on the output container', function() {
            expect(output.getEl().getStyle('z-index')).toEqual('1000');
        });
        it('sets css class on the output container', function() {
            expect(output.getEl().hasClass('disclaimer-ct')).toBeTruthy();
        });
        describe('when onAdd is called', function() {
            var records;
            beforeEach(function() {
                d.disclaimers = {};
                records = [{
                    id: 'bar',
                    data: {layer: {name: 'foo'}},
                    get: function() {
                        return {'discl 1': true};
                    }
                }];
                spyOn(d, 'addDisclaimer').andCallThrough();
            });
            it('stores the disclaimer internally', function() {
                d.onAdd(null, records)
                expect(d.disclaimers['discl 1'].nb).toEqual(1);
                expect(d.disclaimers['discl 1'].elt).toBeInstanceOf(Ext.Element);
            });
            it('calls addDisclaimer method', function() {
                d.onAdd(null, records)
                expect(d.addDisclaimer).toHaveBeenCalled();
                expect(d.addDisclaimer.callCount).toEqual(1);
            });
            describe('when a disclaimer number already exist', function() {
                beforeEach(function() {
                    d.disclaimers['discl 1'] = {
                        elt: null,
                        nb: 1
                    };
                });
                it('does not update elt', function() {
                    d.onAdd(null, records)
                    expect(d.disclaimers['discl 1'].elt).toBeInstanceOf(Ext.Element);
                });
                it('increment the disclaimer nb', function() {
                    d.onAdd(null, records)
                    expect(d.disclaimers['discl 1'].nb).toEqual(2);
                });
                it('calls addDisclaimer method', function() {
                    d.onAdd(null, records)
                    expect(d.addDisclaimer).toHaveBeenCalled();
                    expect(d.addDisclaimer.callCount).toEqual(1);
                });
            });
            describe('when a disclaimer element already exist', function() {
                beforeEach(function() {
                    d.disclaimers['discl 1'] = {
                        elt: 'foo',
                        nb: 1
                    };
                });
                it('does not call addDisclaimer', function() {
                    d.onAdd(null, records)
                    expect(d.addDisclaimer).not.toHaveBeenCalled();
                });
                it('increment the disclaimer nb', function() {
                    d.onAdd(null, records)
                    expect(d.disclaimers['discl 1'].nb).toEqual(2);
                });
                it('does not update elt', function() {
                    d.onAdd(null, records)
                    expect(d.disclaimers['discl 1'].elt).toEqual('foo');
                });
            });
            describe('when two disclaimers', function() {
                beforeEach(function() {
                    records = [{
                        id: 'bar',
                        data: {layer: {name: 'foo'}},
                        get: function() {
                            return {'discl 1': true, 'discl 2': true};
                        }
                    }];
                });
                it('stores both disclaimers internally', function() {
                    d.onAdd(null, records)
                    expect(d.disclaimers['discl 1'].nb).toEqual(1);
                    expect(d.disclaimers['discl 1'].elt).toBeInstanceOf(Ext.Element);
                    expect(d.disclaimers['discl 2'].nb).toEqual(1);
                    expect(d.disclaimers['discl 2'].elt).toBeInstanceOf(Ext.Element);
                });
                it('calls addDisclaimer method twice', function() {
                    d.onAdd(null, records)
                    expect(d.addDisclaimer).toHaveBeenCalled();
                    expect(d.addDisclaimer.callCount).toEqual(2);
                });
            });
        });
        describe('when onRemove is called', function() {
            var record;
            beforeEach(function() {
                record = {
                    id: 'bar',
                    data: {layer: {name: 'foo'}},
                    get: function() {
                        return {'discl 1': true};
                    }
                };
                spyOn(d, 'removeDisclaimer');
            });
            describe('when nb equals to 1', function() {
                beforeEach(function() {
                    d.disclaimers = {'discl 1': {
                        'nb': 1
                    }};
                });
                it('decrements nb', function() {
                    d.onRemove(null, record)
                    expect(d.disclaimers['discl 1'].nb).toEqual(0);
                });
                it('calls removeDisclaimer', function() {
                    d.onRemove(null, record)
                    expect(d.removeDisclaimer).toHaveBeenCalled();
                    expect(d.removeDisclaimer.callCount).toEqual(1);
                });
            });
            describe('when nb is > 1', function() {
                beforeEach(function() {
                    d.disclaimers = {'discl 1': {
                        'nb': 2
                    }};
                });
                it('decrements nb', function() {
                    d.onRemove(null, record)
                    expect(d.disclaimers['discl 1'].nb).toEqual(1);
                });
                it('does not call removeDisclaimer', function() {
                    d.onRemove(null, record)
                    expect(d.removeDisclaimer).not.toHaveBeenCalled();
                });
            });
            describe('when two disclaimers', function() {
                beforeEach(function() {
                    record = {
                        id: 'bar',
                        data: {layer: {name: 'foo'}},
                        get: function() {
                            return {'discl 1': true, 'discl 2': true};
                        }
                    };
                    d.disclaimers = {
                        'discl 1': {
                            'nb': 1
                        },
                        'discl 2': {
                            'nb': 2
                        }
                    };
                });
                it('decrements nb', function() {
                    d.onRemove(null, record)
                    expect(d.disclaimers['discl 1'].nb).toEqual(0);
                    expect(d.disclaimers['discl 2'].nb).toEqual(1);
                });
                it('calls removeDisclaimer only when nb==0', function() {
                    d.onRemove(null, record)
                    expect(d.removeDisclaimer).toHaveBeenCalled();
                    expect(d.removeDisclaimer.callCount).toEqual(1);
                });
            });
        });
        describe('when addDisclaimer is called', function() {
            it('appends a disclaimer msg on the output container', function() {
                d.addDisclaimer('foo bar');
                var r = d.output[0].getEl().select('.disclaimer-item');
                expect(r.getCount(), 1);
                expect(r.elements[0].innerHTML).toContain('foo bar');
            });
        });
        describe('when removeDisclaimer is called', function() {
            beforeEach(function() {
                var elt = Ext.DomHelper.append(
                    d.output[0].getEl(),
                    {html: '<div>foo</div>'},
                    true);
                d.disclaimers = {
                    'foo': {
                        'nb': 1,
                        'elt': elt
                    }
                };
            });
            it('removes the disclaimer from the container', function() {
                d.removeDisclaimer('foo');
                var r = d.output[0].getEl().select('.disclaimer-item');
                expect(r.getCount(), 0);
            });
            it('sets the disclaimer elt property to null', function() {
                d.removeDisclaimer('foo');
                expect(d.disclaimers['foo'].elt).toBeNull();
            });
        });
    });
});

