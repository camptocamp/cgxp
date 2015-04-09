Ext.namespace("GeoExt.ux.data");

GeoExt.ux.data.getFeatureEditingDefaultStyleStoreOptions = function() {
    return {
        fields: ['name', 'style'],
        data: [
            [OpenLayers.i18n('blue'), {fillColor: 'blue', strokeColor: 'blue'}],
            [OpenLayers.i18n('red'), {fillColor: 'red', strokeColor: 'red'}],
            [OpenLayers.i18n('green'), {fillColor: 'green', strokeColor: 'green'}],
            [OpenLayers.i18n('yellow'), {fillColor: 'yellow', strokeColor: 'yellow'}],
            [OpenLayers.i18n('orange'), {fillColor: '#FFA500', strokeColor: '#FFA500'}],
            [OpenLayers.i18n('purple'), {fillColor: 'purple', strokeColor: 'purple'}],
            [OpenLayers.i18n('white'), {fillColor: 'white', strokeColor: 'white'}],
            [OpenLayers.i18n('black'), {fillColor: 'black', strokeColor: 'black'}],
            [OpenLayers.i18n('gray'), {fillColor: 'gray', strokeColor: 'gray'}],
            [OpenLayers.i18n('pink'), {fillColor: '#FFC0CB', strokeColor: '#FFC0CB'}],
            [OpenLayers.i18n('brown'), {fillColor: '#A52A2A', strokeColor: '#A52A2A'}],
            [OpenLayers.i18n('cyan'), {fillColor: '#00FFFF', strokeColor: '#00FFFF'}],
            [OpenLayers.i18n('lime'), {fillColor: 'lime', strokeColor: 'lime'}],
            [OpenLayers.i18n('indigo'), {fillColor: '#4B0082', strokeColor: '#4B0082'}],
            [OpenLayers.i18n('magenta'), {fillColor: '#FF00FF', strokeColor: '#FF00FF'}],
            [OpenLayers.i18n('maroon'), {fillColor: 'maroon', strokeColor: 'maroon'}],
            [OpenLayers.i18n('olive'), {fillColor: 'olive', strokeColor: 'olive'}],
            [OpenLayers.i18n('plum'), {fillColor: '#DDA0DD', strokeColor: '#DDA0DD'}],
            [OpenLayers.i18n('salmon'), {fillColor: '#FA8072', strokeColor: '#FA8072'}],
            [OpenLayers.i18n('gold'), {fillColor: '#FFD700', strokeColor: '#FFD700'}],
            [OpenLayers.i18n('silver'), {fillColor: 'silver', strokeColor: 'silver'}]
        ]
    };
};
