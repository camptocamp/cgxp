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
                    "name": "drain_fn",
                    "legend": true,
                    "isChecked": true
                }, {
                    "name": "drainage",
                    "legend": true,
                    "isChecked": true,
                    "legendRule": "Water"
                }, {
                    "name": "Others",
                    "children": [{
                        "name": "rail",
                        "legend": true,
                        "isChecked": true,
                        "minResolutionHint": 0.00005,
                        "maxResolutionHint": 0.002
                    }, {
                        "name": "road",
                        "isChecked": true,
                        "legend": true,
                        "legendRule": "Roads"
                    }]
                }]
            }, {
                "name": "fedlimit",
                "isChecked": true,
                "legend": true,
                "maxResolutionHint": 0.1
            }, {
                "name": "bathymetry",
                "isChecked": true,
                "metadataUrl": "http://yahoo.fr",
                "icon": "http://sitn.ne.ch/mapfish/app/images/layers/npa.png",
                "legend": true,
                "legendImage": "http://sitn.ne.ch/mapfish/app/images/layers/npa.png"
            }]
        }],
        "name": "Theme 1",
        "icon": "http://sitn.ne.ch/mapfish/app/images/themes/environnement.png"
    }, {
        "children": [{
            "name": "bathymetry",
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
                "name": "prov_bound"
            }, {
                "name": "roads",
                "children": [{
                    "name": "rail"
                }, {
                    "name": "roads"
                }]
            }]
        },{
            "isExpanded": false,
            "isInternalWMS": true,
            "name": "Theme 2 - Group b",
            "isBaseLayer": false,
            "children": [{
                "name": "popplace"
            }]
        }],
        "name": "Theme 2",
        "icon": "http://sitn.ne.ch/mapfish/app/images/themes/environnement.png"
    }],
    "external": [{
        "children": [{
            "isExpanded": false,
            "name": "Theme ext 1 - Group a",
            "isBaseLayer": false,
            "children": [{
                "name": "grid"
            }]
        }],
        "name": "Theme external 1",
        "icon": "http://sitn.ne.ch/mapfish/app/images/themes/environnement.png"
    }]
};
App.default_themes = ["Theme external 1", "Theme 1"];
