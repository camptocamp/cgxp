/*
 * @requires GeoExt/Lang.js
 */

GeoExt.Lang.add("de", {
    "cgxp.plugins.Measure.prototype": {
        pointMenuText: "Punkt",
        pointTooltip: "Punkt messen",
        lengthMenuText: "Länge",
        areaMenuText: "Fläche",
        azimuthMenuText: "Azimut",
        coordinateText: "Koordinaten: ",
        easternText: "Östlich: ",
        northernText: "Nordlich: ",
        distanceText: "Distanz: ",
        azimuthText: "Azimut: ",
        lengthTooltip: "Länge messen",
        areaTooltip: "Fläche messen",
        azimuthTooltip: "Azimut messen",
        measureTooltip: "Messen"
    },

    "cgxp.plugins.FullTextSearch.prototype": {
        tooltipTitle: "Suchen",
        emptyText: "Suche Ort, Objekte...",
        loadingText: "Suchen..."
    },

    "cgxp.plugins.ThemeFinder.prototype": {
        emptyText: "Themen- oder Layername eingeben"
    },

    "cgxp.plugins.ThemeSelector.prototype": {
        localTitle: "Lokale Layer",
        externalTitle: "Externe Layer",
        toolTitle: "Themen"
    },

    "cgxp.plugins.Permalink.prototype": {
        toolTitle: "Permalink",
        windowTitle: "Die aktuelle Seite kann mit folgender URL aufgerufen werden:",
        openlinkText: "Link in neuem Tab öffnen",
        closeText: "Schliessen",
        incompatibleWithIeText: "Achtung: diese URL ist zu lang für Microsoft Internet Explorer!"
    },

    "cgxp.plugins.FeatureGrid.prototype": {
        clearAllText: "Resultate löschen",
        selectText: "Auswahl",
        selectAllText: "Alle",
        selectNoneText: "Keine",
        selectToggleText: "Umkehren",
        actionsText: "Auf Auswahl anwenden",
        zoomToSelectionText: "Zentrieren auf Ausdehnung",
        csvSelectionExportText: "Als CSV Datei exportieren",
        maxFeaturesText: "Maximale Anzahl Resultate erreicht",
        resultText: "Resultat",
        resultsText: "Resultate"
    },

    "cgxp.plugins.Print.prototype": {
        printTitle: "Drucken",
        titlefieldText: "Titel",
        titlefieldvalueText: "Kartentitel",
        includelegendText: "Legende anzeigen",
        layoutText: "Layout",
        commentfieldText: "Kommentar",
        commentfieldvalueText: "Kommentar auf der Karte",
        dpifieldText: "Auflösung",
        scalefieldText: "Massstab",
        rotationfieldText: "Rotation",
        printbuttonText: "Drucken",
        printbuttonTooltip: "Drucken",
        exportpngbuttonText: "Export in PNG",
        waitingText: "PDF Generierung...",
        downloadText: 'Download',
        readyText: "PDF ist bereit.",
        failureTitle: "Fehler beim Drucken",
        failureText: "Es ist ein Fehler aufgetreten beim Drucken. Bitte prüfen Sie die Parameter."
    },

    "cgxp.plugins.Login.prototype": {
        authenticationFailureText: "Benutzername oder Passwort fehlerhaft. Bitte geben Sie Ihre Daten erneut ein.",
        loggedAsText: "Angemeldet als <b>${user}</b>",
        logoutText: "Abmelden",
        loginText: "Anmelden",
        usernameText: "Benutzername",
        passwordText: "Passwort"
    },

    "cgxp.plugins.Help.prototype": {
        helpactiontooltipText: "Hilfe"
    },

    "cgxp.plugins.Redlining.prototype": {
        redliningText: "Zeichnen"
    },

    "cgxp.MapOpacitySlider.prototype": {
        orthoText: "Orthofoto"
    },

    "cgxp.plugins.Legend.prototype": {
        legendbuttonText: "Legende",
        legendbuttonTooltip: "Legende anzeigen",
        legendwindowTitle: "Legende"
    },

    "cgxp.plugins.ScaleChooser.prototype": {
        labelText: "Massstab: "
    },

    "cgxp.plugins.Editing.prototype": {
        helpText: "Klicken Sie auf die Karten um <b>ein bestehendes Element zu editieren</b>, oder",
        layerMenuText: "Wählen Sie eine Ebene",
        createBtnText: "Erstellen Sie ein neues Element",
        forbiddenText: "Diese Aktion ist nicht erlaubt!"
    },

    "cgxp.tree.LayerTree.prototype": {
        moveupText: "Nach oben",
        movedownText: "Nach unten",
        moreinfoText: "Mehr Information",
        deleteText: "Layer löschen",
        opacityText: "Layertransparenz anpassen",
        zoomtoscaleText: "Der Layer ist nicht sichtbar in diesem Massstab.",
        opacitylabelText: "Transparenz",
        showhidelegendText: "Legende anzeigen/verstecken",
        themealreadyloadedText: "Dieses Thema ist schon geladen."
    },

    "cgxp.plugins.FeaturesWindow.prototype": {
        windowTitleText: 'Resultate',
        itemsText: "elemente",
        itemText: "element"
    },

    "cgxp.plugins.ContextualData.prototype": {
        actionTooltipText: "Contextual Informations Tooltips"
    },

    "cgxp.plugins.ContextualData.Control.prototype": {
        streetviewLabelText: 'StreetView Link',
        userValueErrorText: 'The value returned by the handleServerData methode ' +
        'must be an object. See the example in the API.',
        userValueErrorTitleText: 'Error'
    },

    "cgxp.plugins.ContextualData.Tooltip.prototype": {
        popupTitleText: "Location",
        defaultTpl: "Lokal Coord.: {coord_x} {coord_y}<br />" +
            "WGS 84: {wsg_x} {wsg_y}<br />",
        defaultTplElevation: "Elevation (Terrain): {elevation_dtm} [m]<br />" +
            "Elevation (Surface): {elevation_dsm} [m]<br />" +
            "Height (Surface-Terrain): {elevation_dhm} [m]<br />"
    },

    "cgxp.plugins.ContextualData.ContextPopup.prototype": {
        popupTitleText: "Location",
        coordTpl: "<tr><td width=\"150\">Suisses  Coord.</td>" +
            "<td>{coord_x} {coord_y}</td></tr>" +
            "<tr><td>WGS 84</td><td>{wsg_x} {wsg_y}</td></tr>",
        elevationTpl: "<tr><td>Elevation (Terrain)</td><td>{elevation_dtm} [m]</td></tr>" +
        "<tr><td>Elevation (Surface)</td><td>{elevation_dsm} [m]</td></tr>" +
        "<tr><td>Height (Surface-Terrain)</td><td>{elevation_dhm} [m]</td></tr>" +
        "<tr><td>Slope</td><td>{elevation_slope} [° dég.]</td></tr>"
    },

    "cgxp.plugins.Profile.prototype": {
        helpText: "<h1>Höhenprofil</h1>Zeichnen Sie eine Linie auf der Karte. Doppelklicken Sie um die Linie zu beenden und das Höhenprofil anzuzeigen.",
        waitMsgText: "Höhenprofil wird geladen...",
        xLabelText: "Abstand (m)",
        yLabelText: "Höhe (m)",
        errorMsg: "Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.",
        exportCsvText: "Export als CSV"
    },

    "cgxp.plugins.QueryBuilder.prototype": {
        layerText: "Layer"
    },

    "GeoExt.ux.form.FeaturePanel.prototype": {
        pointRadiusFieldText: "Grösse",
        colorFieldText: "Farbe",
        strokeWidthFieldText: "Breite",
        labelFieldText: "Text",
        fontSizeFieldText: "Grösse"
    }
});

OpenLayers.Util.extend(OpenLayers.Lang.de, {
    "layertree": "Themen",
    "querier": "Attributabfrage",

    // query builder
    "QueryBuilder.loading": "Lade Daten...",
    "QueryBuilder.incomplete_form": "Bitte alle erforderlichen Felder ausfüllen.",
    "QueryBuilder.no_result": "Es wurde kein Resultat gefunden.",
    "QueryBuilder.query_btn_text": "Abfrage",
    "QueryBuilder.alert_no_geom_field": "Es wurde kein Geometriefeld in dieser Ebene gefunden.",
    "QueryBuilder.describefeaturetype_exception": "Es ist ein Fehler aufgetreten.",
    "QueryBuilder.getfeature_exception": "Es ist ein Fehler aufgetreten.",

    'Search.ToolTip': 'In diesem Feld können Sie nach verschiedenen geografischen <br />Orten und Objekten suchen: <br /><b>Amtliche Vermessung:</b> Adressen, Parzellen, Assekuranznummern z.B. <b>wohlen 1716</b><br /><b>Werkplan Elektro:</b> Trafostationen, Verteilkabinen z.B. <b>ts 41</b><br /><b>Werkplan Wasser:</b> Hydranten, Reservoir z.B. <b>hydr 5612 102</b><br /><b>Werkplan Gas:</b> Druckreduzierstationen z.B. <b>drs 15</b><br /><b>Werkplan Abwasser:</b> KontrollschÃ¤chte z.B. <b>k 150</b>', //deprecated?
    
    "Tools.maxextentactiontooltip": "Gesamtübersicht", //deprecated?
    "Tools.measurelengthactiontooltip": "Strecke messen", //deprecated?
    "Tools.measureareaactiontooltip": "Fläche messen", //deprecated?
    "Tools.measurepositionactiontooltip": "Koordinaten eines Punktes abfragen", //deprecated?

    // toolbar
    "Locator.easting": "Rechtswert:", //deprecated?
    "Locator.northing": "Hochwert:", //deprecated?

    "Query.countertext": "Element {0} von {1}",
    "Query.actiontooltip": "Informationen in der Karte abfragen",
    "Query.nolayerselectedmsg": "Keine Ebene ausgewählt"
});
