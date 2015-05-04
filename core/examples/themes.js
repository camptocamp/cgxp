Ext.namespace('App');
var loc = window.location.href.split('/');
loc.pop();
App.themes = {
    "local": [{
        "children": [{
            "isExpanded": true,
            "name": "OSM function",
            "isBaseLayer": false,
            "id": 68,
            "isInternalWMS": true,
            "children": [{
                "name": "osm_time",
                "icon": "http://geomapfish.demo-camptocamp.com/1.6/wsgi/mapserv_proxy?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetLegendGraphic&LAYER=osm_time&FORMAT=image/png&TRANSPARENT=TRUE&RULE=Dans les temps",
                "type": "internal WMS",
                "public": true,
                "identifierAttribute": "name",
                "isChecked": true,
                "childLayers": [],
                "queryable": 1,
                "time": {
                    "interval": [1, 0, 0, 0],
                    "maxValue": "2013-12-31T00:00:00Z",
                    "minValue": "2006-01-01T00:00:00Z",
                    "maxDefValue": null,
                    "minDefValue": null,
                    "resolution": "month",
                    "mode": "range",
                    "widget": "datepicker"
                },
                "legend": true,
                "disclaimer": "\u00a9 les contributeurs d\u2019OpenStreetMap",
                "isLegendExpanded": false,
                "id": 67,
                "imageType": "image/jpeg",
                "metadata": {}
            }, {
                "minResolutionHint": 0.53,
                "name": "osm_scale",
                "icon": "http://geomapfish.demo-camptocamp.com/1.6/wsgi/mapserv_proxy?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetLegendGraphic&LAYER=osm_scale&FORMAT=image/png&TRANSPARENT=TRUE&RULE=OSM",
                "type": "internal WMS",
                "public": true,
                "identifierAttribute": "display_name",
                "isChecked": true,
                "childLayers": [],
                "queryable": 1,
                "maxResolutionHint": 1.41,
                "legend": true,
                "disclaimer": "\u00a9 les contributeurs d\u2019OpenStreetMap",
                "isLegendExpanded": false,
                "id": 74,
                "imageType": "image/jpeg",
                "metadata": {}
            }],
            "metadata": {}
        }, {
            "time": {
                "mode": "range",
                "interval": [0, 1, 0, 0],
                "resolution": "year",
                "maxValue": "2014-01-01T00:00:00Z",
                "minValue": "2006-01-01T00:00:00Z",
                "widget": "slider"
            },
            "isExpanded": false,
            "name": "Time",
            "isBaseLayer": false,
            "isInternalWMS": true,
            "children": [{
                "name": "level1",
                "children": [{

                    "name": "osm_time",
                    "isLegendExpanded": false,
                    "legend": true,
                    "identifierAttribute": "name",
                    "isChecked": true,
                    "childLayers": [],
                    "id": 67,
                    "type": "internal WMS",
                    "public": true,
                    "imageType": null,
                    "queryable": 1
                }]
            }]
        }],
        "name": "Theme 1",
        "icon": "http://sitn.ne.ch/mapfish/app/images/themes/environnement.png"
    }, {
        "children": [{
            "time": {
                "mode": "range",
                "interval": [0, 1, 0, 0],
                "resolution": "year",
                "maxValue": "2014-01-01T00:00:00Z",
                "minValue": "2006-01-01T00:00:00Z",
                "widget": "slider"
            },
            "isExpanded": false,
            "name": "Time 2",
            "isBaseLayer": false,
            "isInternalWMS": true,
            "children": [{
                "name": "osm_time",
                "isLegendExpanded": false,
                "legend": true,
                "identifierAttribute": "name",
                "isChecked": true,
                "childLayers": [],
                "id": 67,
                "type": "internal WMS",
                "public": true,
                "imageType": null,
                "queryable": 1
            }]
        }],
        "name": "Theme 2",
        "icon": "http://sitn.ne.ch/mapfish/app/images/themes/environnement.png"
    }]
};
App.default_themes = ["Theme external 1", "Theme 1"];
