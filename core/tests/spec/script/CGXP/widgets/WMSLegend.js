describe('cgxp.WMSLegend', function() {
    var legend,
        updateSpy,
        clock;

    beforeEach(function() {
        clock = sinon.useFakeTimers();
        updateSpy = spyOn(GeoExt.WMSLegend.prototype, 'update');

        var layerRecord = new GeoExt.data.LayerRecord({
            layer: new OpenLayers.Layer('')
        }, 1);
        legend = new cgxp.WMSLegend({
            layerRecord: layerRecord,
            updateDelay: 10
        });
    });

    afterEach(function() {
        clock.restore();
    });

    describe('update legend', function() {

        it('defers legend update', function() {
            legend.update();

            clock.tick(9);
            expect(updateSpy).not.toHaveBeenCalled();

            clock.tick(1);
            expect(updateSpy).toHaveBeenCalled();
        });
    });

    describe('destroy', function() {

        it('clears the update legend timeout', function() {
            legend.update();
            legend.destroy();
            clock.tick(10);
            expect(updateSpy).not.toHaveBeenCalled();
        });
    });

    describe('print', function() {
        var print;

        beforeEach(function() {
            print = new GeoExt.data.PrintProvider({url: ''});
        });

        it('updates the legends first', function() {
            print.encoders.legends.cgxp_wmslegend.apply(
                print, [legend, 1000]);
            expect(updateSpy).toHaveBeenCalled();
            expect(updateSpy.calls.length).toEqual(1);
            expect(updateSpy.calls[0].object).toBe(legend);
        });

    });
});
