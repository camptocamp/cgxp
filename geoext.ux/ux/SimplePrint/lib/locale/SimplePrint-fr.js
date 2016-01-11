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

GeoExt.Lang.add("fr", {
    "GeoExt.ux.SimplePrint.prototype": {
        layoutText: "Disposition",
        dpiText: "PPP",
        scaleText: "Échelle",
        rotationText: "Rotation",
        printText: "Imprimer",
        creatingPdfText: "Création du PDF...",
        downloadPdfText: "Téléchargement",
        statusErrorText: "Erreur",
        includelegendText: "Inclure la légende",
        createPrintJobText: '<tpl for="."><img class="print-load" src="{loading_icon}" />Crée un nouveau travail d\'impression...</tpl>',
        printWaitingStatusText: '<tpl for="."><img class="print-load" src="{loading_icon}" />Votre impression démarrera dans ' +
            '<tpl if="waitingTimeMin == 0">moins d\'une minute</tpl>' +
            '<tpl if="waitingTimeMin == 1">environ 1 minute</tpl>' +
            '<tpl if="waitingTimeMin &gt; 1">environ {waitingTimeMin} minutes</tpl></tpl>',
        printRunningStatusText: '<tpl for="."><img class="print-load" src="{loading_icon}" />Votre impression est en cours...</tpl>'
    }
});
