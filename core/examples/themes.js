Ext.namespace('App');
App.themes = {
    "local": [{
        "children": [{
            "isExpanded": false,
            "isInternalWMS": true,
            "name": "Theme 1 - Group a",
            "isBaseLayer": false,
            "children": [{
                "name": "land_fn",
                "metadataUrl": "http://yahoo.fr",
                "icon": "http://sitn.ne.ch/mapfish/app/images/layers/npa.png",
                "minResolutionHint": 0.05,
                "maxResolutionHint": 0.1
            }, {
                "name": "park",
                "legend": true,
                "maxResolutionHint": 0.1
            }, {
                "name": "bathymetry",
                "icon": "http://sitn.ne.ch/mapfish/app/images/layers/communes.png"
            }, {
                "name": "group",
                "children": [{
                    "name": "drain_fn",
                    "legend": true
                }, {
                    "name": "drainage",
                    "legend": true,
                    "legendRule": "default"
                }]
            }]
        }],
        "name": "Theme 1",
        "icon": "http://sitn.ne.ch/mapfish/app/images/themes/environnement.png"
    }, {
        "children": [{
            "isExpanded": false,
            "isInternalWMS": true,
            "name": "Theme 2 - Group a",
            "isBaseLayer": false,
            "children": [{
                "name": "drainage"
            }, {
                "name": "drain_fn"
            }, {
                "name": "roads",
                "children": [{
                    "name": "rail"
                }, {
                    "name": "road"
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
            "isInternalWMS": true,
            "name": "Theme ext 1 - Group a",
            "isBaseLayer": false,
            "children": [{
                "name": "fedlimit"
            }]
        }],
        "name": "Theme external 1",
        "icon": "http://sitn.ne.ch/mapfish/app/images/themes/environnement.png"
    }]
};
App.default_themes = ["Theme 1", "Theme external 1"];
