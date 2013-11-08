describe('plugins.Editing', function() {

    var xsd1 =
'<?xml version="1.0"?>' +
'<xsd:schema xmlns:gml="http://www.opengis.net/gml" xmlns:xsd="http://www.w3.org/2001/XMLSchema">' +
  '<xsd:complexType name="npa">' +
    '<xsd:complexContent>' +
      '<xsd:extension base="gml:AbstractFeatureType">' +
        '<xsd:sequence>' +
          '<xsd:element minOccurs="0" name="localite" nillable="true">' +
            '<xsd:simpleType>' +
              '<xsd:restriction base="xsd:string">' +
                '<xsd:maxLength value="100"/>' +
              '</xsd:restriction>' +
            '</xsd:simpleType>' +
          '</xsd:element>' +
          '<xsd:element minOccurs="0" name="npa" nillable="true" type="xsd:integer"/>' +
          '<xsd:element minOccurs="0" name="npa_comp" nillable="true" type="xsd:integer"/>' +
          '<xsd:element minOccurs="0" name="geom" nillable="true" type="gml:PolygonPropertyType"/>' +
        '</xsd:sequence>' +
      '</xsd:extension>' +
    '</xsd:complexContent>' +
  '</xsd:complexType>' +
'</xsd:schema>';

    var xsd2 =
'<?xml version="1.0"?>' +
'<xsd:schema xmlns:gml="http://www.opengis.net/gml" xmlns:xsd="http://www.w3.org/2001/XMLSchema">' +
  '<xsd:complexType name="npa">' +
    '<xsd:complexContent>' +
      '<xsd:extension base="gml:AbstractFeatureType">' +
        '<xsd:sequence>' +
          '<xsd:element minOccurs="0" name="localite" nillable="true">' +
            '<xsd:simpleType>' +
              '<xsd:restriction base="xsd:string">' +
                '<xsd:maxLength value="100"/>' +
              '</xsd:restriction>' +
            '</xsd:simpleType>' +
          '</xsd:element>' +
          '<xsd:element minOccurs="0" name="npa" nillable="true" type="xsd:integer"/>' +
          '<xsd:element minOccurs="0" name="npa_comp" nillable="true" type="xsd:integer"/>' +
          '<xsd:element minOccurs="0" name="geom" nillable="true" type="gml:MultiPolygonPropertyType"/>' +
        '</xsd:sequence>' +
      '</xsd:extension>' +
    '</xsd:complexContent>' +
  '</xsd:complexType>' +
'</xsd:schema>';

    var e;
    describe('when calling constructor', function() {
        beforeEach(function() {
            e = new cgxp.plugins.Editing();
        });
        it('creates a gxp tool', function() {
            expect(e).toBeInstanceOf(gxp.plugins.Tool);
        });
        it('creates an editing plugin', function() {
            expect(e).toBeInstanceOf(cgxp.plugins.Editing);
        });
    });
    describe('when creating a menu item', function() {
        var server,
            clock;
        beforeEach(function() {
            server = sinon.fakeServer.create();
            clock = sinon.useFakeTimers();
            e = new cgxp.plugins.Editing({
                layersURL: '/layers/',
                map: new OpenLayers.Map()
            });
            e.addEditingLayer();
        });
        afterEach(function() {
            server.restore();
            clock.restore();
        });
        it('creates appropriate draw control and handler', function() {
            var cb, feature, item;
            server.respondWith(
                'GET', '/layers/l1/md.xsd',
                [200, {"Content-Type": "application/xml; charset=UTF-8"},
                 xsd1]);

            cb = jasmine.createSpy();
            feature = new OpenLayers.Feature.Vector();
            store = e.getAttributesStore('l1', feature, cb);
            server.respond();
            clock.tick(100000); // we need to tick here, because
                                // Ext delays XHR callbacks
            expect(cb).toHaveBeenCalledWith(store, 'Polygon');
            item = e.createMenuItem({attributes: {text: ''}}, 'Polygon');
            expect(item.control.handler.multi).toBeFalsy();


            server.respondWith(
                'GET', '/layers/l2/md.xsd',
                [200, {"Content-Type": "application/xml; charset=UTF-8"},
                 xsd2]);
            cb = jasmine.createSpy();
            feature = new OpenLayers.Feature.Vector();
            store = e.getAttributesStore('l2', feature, cb);
            server.respond();
            clock.tick(100000); // we need to tick here, because
                                // Ext delays XHR callbacks
            expect(cb).toHaveBeenCalledWith(store, 'MultiPolygon');
            item = e.createMenuItem({attributes: {text: ''}}, 'MultiPolygon');
            expect(item.control.handler.multi).toBeTruthy();
        });
    });
    describe('when calling init', function() {
        beforeEach(function() {
            var map = new OpenLayers.Map();
            e = new cgxp.plugins.Editing({
                layersURL: '/layers/',
                map: map
            });
            e.init({
                tools: {},
                on: function() {},
                mapPanel: {
                    on: function() {},
                    map: map
                }
            });
        });
        it('sets the editing plugin window to disabled', function() {
            expect(e.win.disabled).toBeTruthy();
        });
    });
    describe('when list of editable layers changes', function() {
        var server,
            clock,
            map = new OpenLayers.Map();
        beforeEach(function() {
            server = sinon.fakeServer.create();
            clock = sinon.useFakeTimers();
            e = new cgxp.plugins.Editing({
                layersURL: '/layers/',
                map: map
            });
            e.init({
                tools: {},
                on: function() {},
                mapPanel: {
                    on: function() {},
                    map: map
                }
            });
            e.getEditableLayers = function() {
                return layers;
            };
            e.getAttributesStore = function() {};
        });
        afterEach(function() {
            server.restore();
            clock.restore();
        });
        var layers;
        it('sets the editing plugin window to enabled', function() {
            layers = {
                'l3': {
                    attributes: 'bar'
                }
            };

            // don't use timeout to directly gets the result
            // as I see the current setTimeout function never
            // call the argument ...
            oldSTO = window.setTimeout;
            window.setTimeout = function(f) {
                f();
            };
            e.manageLayers();
            window.setTimeout = oldSTO;

            expect(e.win.disabled).toBeFalsy();
        });

        it('sends requests with getFeature control', function() {
            var oldRead = OpenLayers.Protocol.HTTP.prototype.read;
            var foo = false;
            OpenLayers.Protocol.HTTP.prototype.read = function() {
                foo = true;
            };

            map.getControlsByClass('OpenLayers.Control.GetFeature')[0].request();
            OpenLayers.Protocol.HTTP.prototype.read = oldRead;
            expect(foo).toBeTruthy();
        });

        it('sets the editing plugin window to disabled', function() {
            layers = {};
            e.manageLayers();
            expect(e.win.disabled).toBeTruthy();
        });
        it('prevents requests with getFeature control to be sent', function() {
            var oldRead = OpenLayers.Protocol.HTTP.prototype.read;
            var foo = false;
            OpenLayers.Protocol.HTTP.prototype.read = function() {
                foo = true;
            };

            map.getControlsByClass('OpenLayers.Control.GetFeature')[0].request();
            OpenLayers.Protocol.HTTP.prototype.read = oldRead;
            expect(foo).toBeFalsy();
        });
    });
});
