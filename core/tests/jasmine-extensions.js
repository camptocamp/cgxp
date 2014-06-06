beforeEach(function() {
    jasmine.addMatchers({
        toBeInstanceOf: function(util, customEqualityTesters) {
            return {
                compare: function(actual, expected) {
                    return {
                        pass: actual instanceof expected
                    };
                }
            };
        }
    });
});
