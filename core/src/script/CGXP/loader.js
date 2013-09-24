/**
 * Copyright (c) 2011-2013 by Camptocamp SA
 *
 * CGXP is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * CGXP is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with CGXP.  If not, see <http://www.gnu.org/licenses/>.
 */

(function() {

    var jsfiles = [
        "widgets/FullTextSearch.js",
        "widgets/MapPanel.js",
        "widgets/WMSLegend.js",
        "widgets/tree/LayerTree.js",
        "widgets/tree/TreeNodeComponent.js",
        "widgets/tree/TreeNodeLoading.js",
        "widgets/tree/TreeNodeTriStateUI.js",
        "widgets/tool/Button.js",
        "widgets/tool/Window.js",

        "plugins/AddKMLFile.js",
        "plugins/ContextualData.js",
        "plugins/Disclaimer.js",
        "plugins/ModalDisclaimer.js",
        "plugins/Editing.js",
        "plugins/FeaturesResult.js",
        "plugins/FeaturesGrid.js",
        "plugins/FeaturesWindow.js",
        "plugins/FullTextSearch.js",
        "plugins/GoogleEarthView.js",
        "plugins/Help.js",
        "plugins/LayerTree.js",
        "plugins/Legend.js",
        "plugins/Login.js",
        "widgets/MapOpacitySlider.js",
        "plugins/MapOpacitySlider.js",
        "plugins/MapQuery.js",
        "plugins/Measure.js",
        "plugins/Menu.js",
        "plugins/MenuShortcut.js",
        "plugins/Permalink.js",
        // <print dependencies>
        "../../../../geoext.ux/ux/SimplePrint/lib/GeoExt.ux/SimplePrint.js",
        // </print dependencies>
        "plugins/Print.js",
        "plugins/Profile.js",
        "plugins/QueryBuilder.js",

        // <redlining dependencies>
        "../../../../ext/Ext/examples/ux/Spinner.js",
        "../../../../ext/Ext/examples/ux/SpinnerField.js",
        "../../../../sandbox/LayerManager/ux/utils/flash.js",
        "../../../../sandbox/LayerManager/ux/data/FormatStore.js",
        "../../../../sandbox/LayerManager/ux/data/Import.js",
        "../../../../ext/Ext/examples/ux/fileuploadfield/FileUploadField.js",
        "../../../../sandbox/FeatureEditing/ux/widgets/form/FeaturePanel.js",
        "../../../../sandbox/FeatureEditing/ux/widgets/plugins/CloseFeatureDialog.js",
        "../../../../openlayers.addins/URLCompressed/lib/OpenLayers/Format/URLCompressed.js",
        "../../../../sandbox/FeatureEditing/ux/widgets/form/FeatureEditingPanel.js",
        "../../../../sandbox/FeatureEditing/ux/widgets/form/RedLiningPanel.js",
        "../../../../core/src/script/CGXP/widgets/RedLiningPanel.js",
        "../../../../sandbox/FeatureEditing/ux/widgets/FeatureEditingControler.js",
        "../../../../core/src/script/CGXP/plugins/Redlining.js",
        "../../../../sandbox/FeatureEditing/ux/data/FeatureEditingDefaultStyleStore.js",
        "../../../../core/src/script/CGXP/widgets/Ext.ux.ColorField.js",
        "../../../../sandbox/LayerManager/ux/widgets/LayerManagerImportPanel.js",
        "../../../../sandbox/LayerManager/ux/downloadify/js/downloadify.min.js",
        "../../../../sandbox/FeatureEditing/ux/widgets/plugins/ExportFeature.js",
        "../../../../sandbox/LayerManager/ux/data/Export.js",
        "../../../../sandbox/LayerManager/ux/widgets/LayerManagerExportWindow.js",
        "../../../../sandbox/FeatureEditing/resources/lang/fr.js",

        // </redlining dependencies>
        "plugins/Redlining.js",
        "plugins/ScaleChooser.js",
        "plugins/FloorSlider.js",
        "plugins/StreetView.js",
        "../../../../openlayers.addins/SwitchableWMTS/lib/OpenLayers/Layer/SwitchableWMTS.js",
        "plugins/ThemeSelector.js",
        "plugins/ThemeFinder.js",
        "plugins/WFSGetFeature.js",
        "plugins/WFSPermalink.js",
        "plugins/WMSBrowser.js",
        "plugins/WMSGetFeatureInfo.js",
        "plugins/Zoom.js",
        "plugins/ToolActivateMgr.js",

        "../../../../geoext.ux/ux/FeatureSelectionModel/lib/GeoExt.ux/Ext.ux.grid.GridMouseEvents.js",
        "../../../../ext/Ext/examples/ux/RowExpander.js",
        // <wmsbrowser dependencies>
        "../../../../geoext.ux/ux/WMSBrowser/lib/GeoExt.ux/data/Store.js",
        "../../../../geoext.ux/ux/WMSBrowser/lib/GeoExt.ux/data/WMSBrowserWMSCapabilitiesStore.js",
        "../../../../geoext.ux/ux/WMSBrowser/lib/GeoExt.ux/plugins/WMSBrowserAlerts.js",
        "../../../../geoext.ux/ux/WMSBrowser/lib/GeoExt.ux/widgets/WMSBrowser.js",
        "../../../../geoext.ux/ux/WMSBrowser/lib/GeoExt.ux/widgets/WMSBrowserStatusBar.js",
        "../../../../geoext.ux/ux/WMSBrowser/lib/GeoExt.ux/widgets/grid/WMSBrowserGridPanel.js",
        "../../../../geoext.ux/ux/WMSBrowser/lib/GeoExt.ux/widgets/tree/WMSBrowserRootNode.js",
        "../../../../geoext.ux/ux/WMSBrowser/lib/GeoExt.ux/widgets/tree/WMSBrowserTreePanel.js",
        "../../../../geoext.ux/ux/WMSBrowser/lib/GeoExt.ux/locale/WMSBrowser-fr.js",
        // </wmsbrowser dependencies>
        // <streetview dependencies>
        "../../../../geoext.ux/ux/StreetViewPanel/ux/control/StreetViewClick.js",
        "../../../../geoext.ux/ux/StreetViewPanel/ux/widgets/StreetViewPanel.js",
        // </streetview dependencies>
        // <googleearthview dependencies>
        "widgets/GoogleEarthPanel.js",
        "../../../../gxp/src/script/plugins/GoogleEarth.js",
        "../../../../openlayers.addins/GoogleEarthView/lib/OpenLayers/Control/GoogleEarthView.js",
        // </googleearthview dependencies>
        "locale/fr.js",
        "locale/de.js",
        "locale/it.js"
    ];

    var scripts = document.getElementsByTagName("script");
    var parts = scripts[scripts.length-1].src.split("/");
    parts.pop();
    var path = parts.join("/");

    var len = jsfiles.length;
    var pieces = new Array(len);

    for (var i=0; i<len; i++) {
        pieces[i] = "<script src='" + path + "/" + jsfiles[i] + "'></script>";
    }
    document.write(pieces.join(""));

    if (GeoExt.Lang) {
        GeoExt.Lang.set(OpenLayers.Util.getParameters()["lang"] || GeoExt.Lang.locale);
    }

})();

