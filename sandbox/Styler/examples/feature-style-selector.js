/**
 * Copyright (c) 2010 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See http://svn.geoext.org/core/trunk/geoext/license.txt for the full text
 * of the license.
 */

/** api: example[feature-style-selector]
 *  Style Selector
 *  --------------
 *  Use a ComboBox to select the style of a feature
 */

var mapPanel;

Ext.onReady(function() {

    var options, layer;
    var extent = new OpenLayers.Bounds(-5, 35, 15, 55);

    layer = new OpenLayers.Layer.WMS(
        "Global Imagery",
        "http://maps.opengeo.org/geowebcache/service/wms",
        {layers: "bluemarble"},
        {isBaseLayer: true}
    );

    var vectorLayer = new OpenLayers.Layer.Vector("Simple Geometry");

    // create a point feature
    var point = new OpenLayers.Geometry.Point(0, 45);
    var pointFeature = new OpenLayers.Feature.Vector(point,null);

    vectorLayer.addFeatures([pointFeature]);

    var map = new OpenLayers.Map(options);


    var styleStore = new Ext.data.SimpleStore( {
        fields: ['name', 'style'],
        data: [
            ['blue', {fillColor: 'blue', pointRadius: 6}],
            ['big red', {fillColor: 'red', pointRadius: 12}],
            ['tiny red', {fillColor: 'red', pointRadius: 5}],
            ['yellow', {fillColor: 'yellow', pointRadius: 6}]
              ]
    });

    var styler = new GeoExt.ux.LayerStyleManager(new GeoExt.ux.StyleSelectorComboBox({
            region: "west",
            store: styleStore,
            title: "Style selection",
            width: 220,
            split: true
        }), {});

    styler.setCurrentFeature(pointFeature);

    var layout = styler.createLayout({});

    new Ext.Viewport({
        layout: "border",
        items: [{
            region: "north",
            contentEl: "title",
            height: 50
        }, {
            region: "center",
            id: "mappanel",
            title: "Map",
            xtype: "gx_mappanel",
            map: map,
            layers: [layer, vectorLayer],
            extent: extent,
            split: true
        }, {
            region: "east",
            title: "Description",
            contentEl: "description",
            width: 400,
            split: true
                   }, layout]
    });

    mapPanel = Ext.getCmp("mappanel");

});
