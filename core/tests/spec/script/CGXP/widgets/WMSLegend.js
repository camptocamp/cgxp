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
});
