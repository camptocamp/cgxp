Ext.namespace('App');
App.themes = {
    "local": [{
        "children": [{
            "isExpanded": true,
            "isInternalWMS": true,
            "name": "Theme 1 - Physical",
            "isBaseLayer": false,
            "children": [{
                "name": "Features",
                "isExpanded": true,
                "children": [{
                    "name": "Rivers",
                    "legend": true,
                    "isChecked": true
                }, {
                    "name": "Waterbodies",
                    "legend": true,
                    "isChecked": true,
                    "legendRule": "default"
                }, {
                    "name": "Others",
                    "children": [{
                        "name": "Spot elevations",
                        "legend": true,
                        "isChecked": true,
                        "minResolutionHint": 0.00005,
                        "maxResolutionHint": 0.002
                    }, {
                        "name": "Streams",
                        "isChecked": true,
                        "legend": true
                    }]
                }]
            }, {
                "name": "Hillshading",
                "isChecked": true,
                "icon": "http://sitn.ne.ch/mapfish/app/images/layers/communes.png"
            }, {
                "name": "Topography",
                "isChecked": true,
                "legend": true,
                "maxResolutionHint": 0.1
            }, {
                "name": "Bathymetry",
                "isChecked": true,
                "metadataUrl": "http://yahoo.fr",
                "icon": "http://sitn.ne.ch/mapfish/app/images/layers/npa.png"
            }]
        }],
        "name": "Theme 1",
        "icon": "http://sitn.ne.ch/mapfish/app/images/themes/environnement.png"
    }, {
        "children": [{
            "name": "Bathymetry",
            "isChecked": true
        }],
        "name": "Group with only one level"
    }, {
        "children": [{
            "isExpanded": false,
            "isInternalWMS": true,
            "name": "Theme 2 - Group a - Cultural",
            "isBaseLayer": false,
            "children": [{
                "name": "Settlements"
            }, {
                "name": "Railroads"
            }, {
                "name": "roads",
                "children": [{
                    "name": "Highways"
                }, {
                    "name": "Roads"
                }]
            }]
        },{
            "isExpanded": false,
            "isInternalWMS": true,
            "name": "Theme 2 - Group b",
            "isBaseLayer": false,
            "children": [{
                "name": "Cities"
            }]
        }],
        "name": "Theme 2",
        "icon": "http://sitn.ne.ch/mapfish/app/images/themes/environnement.png"
    }],
    "external": [{
        "children": [{
            "isExpanded": false,
            "isInternalWMS": true,
            "name": "Theme ext 1 - Group a",
            "isBaseLayer": false,
            "children": [{
                "name": "Countries"
            }]
        }],
        "name": "Theme external 1",
        "icon": "http://sitn.ne.ch/mapfish/app/images/themes/environnement.png"
    }]
};
App.default_themes = ["Theme 1", "Theme external 1"];
