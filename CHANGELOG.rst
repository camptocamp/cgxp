This file includes migration steps for each release of CGXP.

Version 1.4
===========

1. Rename ``CGXP/plugins/FeatureGrid.js`` to ``CGXP/plugins/FeaturesGris.js`` and
   his ptype ``cgxp_featuregrid`` to ``cgxp_featuresgrid`` for name consistency.

2. Add new ``themes`` argument to the plugin ``cgxp_featuresgrid`` to be able to 
   display the Identifier Attribute on the drawn features.

Version 1.3
===========

1. For consistency reasons, plugins with action configuration have been modified
   to rename their ``options`` parameter to ``actionConfig``. Please make sure
   to update your plugins configurations accordingly.

2. Former CGXP plugin ``SwitchableWMTSSource`` has been removed and replaced by
   an OpenLayers addin, ``OpenLayers.Layer.SwitchableWMTS``, combined to a 
   standard ``OLSource``. Here is an example of the new syntax to use:

   .. code:: javascript

       {
           source: "olsource",
           type: "OpenLayers.Layer.SwitchableWMTS",
           group: 'background',
           args: [Ext.applyIf({
               name: OpenLayers.i18n('relief'),
               mapserverLayers: 'relief_raster',
               queryLayers: [], 
               zoomThreshold: 11, 
               ref: 'relief',
               layer: 'dtm_av_relief_02m',
               params:  {'time': '200703'},
               group: 'background'
           }, WMTS_OPTIONS)]
       }
