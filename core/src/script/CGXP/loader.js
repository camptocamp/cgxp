/**
 * Copyright (c) 2011 Camptocamp
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
        "widgets/MapPanel.js",
        "widgets/tree/LayerTree.js",
        "widgets/tree/TreeNodeComponent.js",
        "widgets/tree/TreeNodeLoading.js",
        "widgets/tree/TreeNodeTriStateUI.js",

        "plugins/AddKMLFile.js",
        "plugins/ContextualData.js",
        "plugins/Disclaimer.js",
        "plugins/Editing.js",
        "plugins/FeatureGrid.js",
        "plugins/FeaturesWindow.js",
        "plugins/FullTextSearch.js",
        "plugins/GoogleEarthView.js",
        "plugins/Help.js",
        "plugins/LayerTree.js",
        "plugins/Legend.js",
        "plugins/Login.js",
        "plugins/MapOpacitySlider.js",
        "plugins/MapQuery.js",
        "plugins/Measure.js",
        "plugins/MenuShortcut.js",
        "plugins/Permalink.js",
        "plugins/Print.js",
        "plugins/Profile.js",
        "plugins/QueryBuilder.js",
        "plugins/Redlining.js",
        "plugins/ScaleChooser.js",
        "plugins/StreetView.js",
        "plugins/SwitchableWMTSSource.js",
        "plugins/ThemeSelector.js",
        "plugins/ThemeFinder.js",
        "plugins/WFSGetFeature.js",
        "plugins/WFSPermalink.js",
        "plugins/WMSBrowser.js",
        "plugins/WMSGetFeatureInfo.js",

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
        "../../../../geoext.ux/ux/WMSBrowser/resources/lang/fr.js",
        // </wmsbrowser dependencies>
        "locale/en.js",
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

