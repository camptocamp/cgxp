[33mdiff --git a/core/examples/redlining.html b/core/examples/redlining.html[m
[33mindex 4a4b1f3..b3dfdbe 100644[m
[33m--- a/core/examples/redlining.html[m
[33m+++ b/core/examples/redlining.html[m
[1;35m@@ -22,7 +22,7 @@[m
         <script type="text/javascript" src="../../geoext/lib/GeoExt.js"></script>[m
         <script type="text/javascript" src="../../gxp/src/script/loader.js"></script>[m
         <script type="text/javascript" src="../src/script/CGXP/loader.js"></script>[m
[31m-        <script type="text/javascript" src="../src/script/CGXP/locale/en.js"></script>[m
[32m+[m[32m        <script type="text/javascript" src="../src/script/CGXP/locale/fr.js"></script>[m
 [m
         <script type="text/javascript" src="../../ext/Ext/examples/ux/Spinner.js"></script>[m
         <script type="text/javascript" src="../../ext/Ext/examples/ux/SpinnerField.js"></script>[m
[33mdiff --git a/core/examples/redlining.js b/core/examples/redlining.js[m
[33mindex 2bc3e06..3f01d41 100644[m
[33m--- a/core/examples/redlining.js[m
[33m+++ b/core/examples/redlining.js[m
[1;35m@@ -1,7 +1,7 @@[m
 var app;[m
 [m
 Ext.onReady(function() {[m
[31m-    GeoExt.Lang.set("en");[m
[32m+[m[32m    GeoExt.Lang.set("fr");[m
     [m
     var app = new gxp.Viewer({[m
         portalConfig: {[m
[33mdiff --git a/core/src/script/CGXP/locale/fr.js b/core/src/script/CGXP/locale/fr.js[m
[33mindex 306906b..42b5133 100644[m
[33m--- a/core/src/script/CGXP/locale/fr.js[m
[33m+++ b/core/src/script/CGXP/locale/fr.js[m
[1;35m@@ -185,6 +185,14 @@[m [mGeoExt.Lang.add("fr", {[m
     "cgxp.FloorSlider.prototype": {[m
         skyText: "Ciel",[m
         floorText: "Étages"[m
[32m+[m[32m    },[m
[32m+[m
[32m+[m[32m    "GeoExt.ux.form.FeaturePanel.prototype": {[m
[32m+[m[32m        pointRadiusFieldText: "Taille ",[m
[32m+[m[32m        colorFieldText: "Couleur ",[m
[32m+[m[32m        strokeWidthFieldText: "Epaisseur du trait ",[m
[32m+[m[32m        labelFieldText: "Étiquette ",[m
[32m+[m[32m        fontSizeFieldText: "Taille "[m
     }[m
 });[m
 [m
[33mdiff --git a/core/src/script/CGXP/widgets/RedliningColorPicker.js b/core/src/script/CGXP/widgets/RedliningColorPicker.js[m
[33mindex e90d6b3..071fba2 100644[m
[33m--- a/core/src/script/CGXP/widgets/RedliningColorPicker.js[m
[33m+++ b/core/src/script/CGXP/widgets/RedliningColorPicker.js[m
[1;35m@@ -22,6 +22,11 @@[m
  * @include Ext/examples/ux/Spinner.js[m
  * @include Ext/examples/ux/SpinnerField.js[m
  */[m
[32m+[m[32mGeoExt.ux.form.FeaturePanel.prototype.pointRadiusFieldText = "Point size";[m
[32m+[m[32mGeoExt.ux.form.FeaturePanel.prototype.labelFieldText = "Label";[m
[32m+[m[32mGeoExt.ux.form.FeaturePanel.prototype.colorFieldText = "Color";[m
[32m+[m[32mGeoExt.ux.form.FeaturePanel.prototype.strokeWidthFieldText = "Stroke width";[m
[32m+[m[32mGeoExt.ux.form.FeaturePanel.prototype.fontSizeFieldText = "Font size";[m
 [m
 // some more redlining patch[m
 GeoExt.ux.form.FeaturePanel.prototype.initMyItems = function() {[m
[1;35m@@ -32,10 +37,10 @@[m [mGeoExt.ux.form.FeaturePanel.prototype.initMyItems = function() {[m
         return;[m
     } else {[m
         feature = this.features[0];[m
[31m-    }   [m
[31m-    oItems = []; [m
[31m-    oGroupItems = []; [m
[31m-    oGroup = { [m
[32m+[m[32m    }[m
[32m+[m[32m    oItems = [];[m
[32m+[m[32m    oGroupItems = [];[m
[32m+[m[32m    oGroup = {[m
         id: this.attributeFieldSetId,[m
         xtype: 'fieldset',[m
         title: OpenLayers.i18n('Attributes'),[m
[1;35m@@ -45,7 +50,7 @@[m [mGeoExt.ux.form.FeaturePanel.prototype.initMyItems = function() {[m
         autoWidth: this.autoWidth,[m
         defaults: this.defaults,[m
         defaultType: this.defaultType[m
[31m-    };  [m
[32m+[m[32m    };[m
 [m
     if (feature.geometry.CLASS_NAME === "OpenLayers.Geometry.Point" ) {[m
         if (!feature.isLabel) {[m
[1;35m@@ -53,7 +58,7 @@[m [mGeoExt.ux.form.FeaturePanel.prototype.initMyItems = function() {[m
             oGroupItems.push({[m
                 xtype: 'spinnerfield',[m
                 name: 'pointRadius',[m
[31m-                fieldLabel: OpenLayers.i18n('Graphic size'),[m
[32m+[m[32m                fieldLabel: this.pointRadiusFieldText,[m
                 value: feature.style.pointRadius || 10,[m
                 width: 40,[m
                 minValue: 6,[m
[1;35m@@ -74,7 +79,7 @@[m [mGeoExt.ux.form.FeaturePanel.prototype.initMyItems = function() {[m
     if (feature.isLabel) {[m
         oGroupItems.push({[m
             name: 'name',[m
[31m-            fieldLabel: OpenLayers.i18n('name'),[m
[32m+[m[32m            fieldLabel: this.labelFieldText,[m
             id: 'name',[m
             value: feature.attributes['name'][m
         });[m
[1;35m@@ -84,7 +89,7 @@[m [mGeoExt.ux.form.FeaturePanel.prototype.initMyItems = function() {[m
     var colorpicker = new Ext.ux.ColorField({[m
         value: feature.style[(feature.isLabel ? 'fontColor' : 'fillColor')] ||[m
             '#ff0000',[m
[31m-        fieldLabel: OpenLayers.i18n('color'),[m
[32m+[m[32m        fieldLabel: this.colorFieldText,[m
         width: 100[m
     });[m
     colorpicker.on('select', function(cm, color) {[m
[1;35m@@ -104,7 +109,7 @@[m [mGeoExt.ux.form.FeaturePanel.prototype.initMyItems = function() {[m
     oGroupItems.push({[m
         xtype: 'spinnerfield',[m
         name: 'stroke',[m
[31m-        fieldLabel: OpenLayers.i18n('mymaps.' + attribute),[m
[32m+[m[32m        fieldLabel: this[attribute + 'FieldText'],[m
         value: feature.style[attribute] || ((feature.isLabel) ? 12 : 1),[m
         width: 40,[m
         minValue: feature.isLabel ? 10 : 1,[m
