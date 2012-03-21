describe('plugins.Editing', function() {
    var xsd1 = '<xsd:schema xmlns:gml="http://www.opengis.net/gml" xmlns:xsd="http://www.w3.org/2001/XMLSchema"><xsd:complexType name="npa"><xsd:complexContent><xsd:extension base="gml:AbstractFeatureType"><xsd:sequence><xsd:element minOccurs="0" name="localite" nillable="true"><xsd:simpleType><xsd:restriction base="xsd:string"><xsd:maxLength value="100" /></xsd:restriction></xsd:simpleType></xsd:element><xsd:element minOccurs="0" name="npa" nillable="true" type="xsd:integer" /><xsd:element minOccurs="0" name="npa_comp" nillable="true" type="xsd:integer" /><xsd:element minOccurs="0" name="geom" nillable="true" type="gml:PolygonPropertyType" /></xsd:sequence></xsd:extension></xsd:complexContent></xsd:complexType></xsd:schema>';

    var xsd2 = '<xsd:schema xmlns:gml="http://www.opengis.net/gml" xmlns:xsd="http://www.w3.org/2001/XMLSchema"><xsd:complexType name="npa"><xsd:complexContent><xsd:extension base="gml:AbstractFeatureType"><xsd:sequence><xsd:element minOccurs="0" name="localite" nillable="true"><xsd:simpleType><xsd:restriction base="xsd:string"><xsd:maxLength value="100" /></xsd:restriction></xsd:simpleType></xsd:element><xsd:element minOccurs="0" name="npa" nillable="true" type="xsd:integer" /><xsd:element minOccurs="0" name="npa_comp" nillable="true" type="xsd:integer" /><xsd:element minOccurs="0" name="geom" nillable="true" type="gml:MultiPolygonPropertyType" /></xsd:sequence></xsd:extension></xsd:complexContent></xsd:complexType></xsd:schema>';
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
});

