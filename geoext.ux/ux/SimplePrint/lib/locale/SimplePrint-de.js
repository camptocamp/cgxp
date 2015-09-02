/**
 * Copyright (c) 2008-2010 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See http://svn.geoext.org/core/trunk/geoext/license.txt for the full text
 * of the license.
 */

/**
 * @requires GeoExt/Lang.js
 */

GeoExt.Lang.add("de", {
    "GeoExt.ux.SimplePrint.prototype": {
        layoutText: "Layout",
        dpiText: "DPI",
        scaleText: "Skalieren",
        rotationText: "Drehen",
        printText: "Drucken",
        creatingPdfText: "PDF erstellen ...",
        downloadPdfText: "Herunterladen",
        statusErrorText: "Fehler",
        includelegendText: "Legende anzeigen",
        createPrintJobText: '<tpl for="."><img class="print-load" src="{loading_icon}" />erstelle neuen Druckauftrag...</tpl>',
        printWaitingStatusText: '<tpl for="."><img class="print-load" src="{loading_icon}" />Ihr Druckauftrag startet in ' +
            '<tpl if="waitingTimeMin == 0">weniger als 1 Minute</tpl>' +
            '<tpl if="waitingTimeMin == 1">etwa  1 Minute</tpl>' +
            '<tpl if="waitingTimeMin &gt; 1">etwa {waitingTimeMin} Minuten</tpl></tpl>',
        printRunningStatusText: '<tpl for="."><img class="print-load" src="{loading_icon}" />Ihr Druckauftrag wird bearbeitet...</tpl>'
    }
});
