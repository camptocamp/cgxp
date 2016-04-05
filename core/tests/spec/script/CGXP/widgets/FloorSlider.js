describe('widgets.FloorSlider', function() {
    var mockMap = {
        on: function() {},
        params: {},
        setParams: function () {},
        addListener: function() {}
    };
    describe('when calling generateFloorMap', function() {
        var slider;
        beforeEach(function() {
            slider = new cgxp.FloorSlider({minValue: -1, maxValue: 1, mapPanel: mockMap});
        });
        describe('with minValue and maxValue set', function() {
            var options = {minValue: -1, maxValue: 1};
            var floorMap;
            beforeEach(function() {
                floorMap = slider.generateFloorMap(options);
            });
            it("returns the correct floor map", function() {
                expect(floorMap).toEqual({"-1": "-1", 0: "0", 1: "1"});
            });
        });
        describe('with only the floors set', function() {
            var options = {floors: ["A", "B", "C"]};
            var floorMap;
            beforeEach(function() {
                floorMap = slider.generateFloorMap(options);
            });
            it("sets minValue and maxValue", function() {
                expect(options.minValue).toEqual(0);
                expect(options.maxValue).toEqual(2);
            });
            it("returns the correct floor map", function() {
                expect(floorMap).toEqual({0: "A", 1: "B", 2: "C"});
            });
        })
    });
    describe('when creating it with minValue and maxValue set', function() {
        var slider;
        beforeEach(function() {
            slider = new cgxp.FloorSlider({minValue: -1, maxValue: 1, maxIsSky: true,
                                           mapPanel: mockMap});
        });
        it('returns OK values for floor2pos', function() {
            expect(slider.floor2pos(-1)).toEqual(-1);
            expect(slider.floor2pos(0)).toEqual(0);
            expect(slider.floor2pos(null)).toEqual(1);
        });
        it('returns OK values for pos2floor', function() {
            expect(slider.pos2floor(-1)).toEqual(-1);
            expect(slider.pos2floor(0)).toEqual(0);
            expect(slider.pos2floor(1)).toEqual(null);
        });
    })
    describe('when creating it with only floors set', function() {
        var slider;
        beforeEach(function() {
            slider = new cgxp.FloorSlider({floors:['A', 'B', 'Sky'], maxIsSky: true,
                                           mapPanel: mockMap});
        });
        it('returns OK values for floor2pos', function() {
            expect(slider.floor2pos('A')).toEqual(0);
            expect(slider.floor2pos('B')).toEqual(1);
            expect(slider.floor2pos(null)).toEqual(2);
        });
        it('returns OK values for pos2floor', function() {
            expect(slider.pos2floor(0)).toEqual('A');
            expect(slider.pos2floor(1)).toEqual('B');
            expect(slider.pos2floor(2)).toEqual(null);
        });
    })
});
