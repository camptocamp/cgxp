This file includes migration steps for each release of CGXP.


Version 1.3.1
=============

1. Add workaround for IE10 by considering IE10 as IE9 not IE6 ...
   To use it, in the ``jsbuild/app.cfg`` file, you should replace
   ``adapter/ext/ext-base.js`` by ``adapter/ext/ext-base-debug.js``.


Version 1.3
===========

1. For consistency reasons, plugins with action configuration have been modified
   to rename their ``options`` parameter to ``actionConfig``. Please make sure
   to update your plugins configurations accordingly.

2. Former CGXP plugin ``SwitchableWMTSSource`` has been removed and replaced by
   an OpenLayers addin, ``OpenLayers.Layer.SwitchableWMTS``, combined to a 
   standard ``OLSource``. Here is an example of the new syntax to use:

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

