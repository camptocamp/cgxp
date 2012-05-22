/*
 * @requires GeoExt/Lang.js
 */

GeoExt.Lang.add("de", {
    "cgxp.plugins.Measure.prototype": {
        pointMenuText: "Punkt",
        pointTooltip: "Punkt messen",
        lengthMenuText: "Länge",
        areaMenuText: "Fläche",
        lengthTooltip: "Länge messen",
        areaTooltip: "Fläche messen",
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
        closeText: "Schliessen"
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
        commentfieldText: "Kommentar",
        commentfieldvalueText: "Kommentar auf der Karte",
        dpifieldText: "Auflösung",
        scalefieldText: "Massstab",
        rotationfieldText: "Rotation",
        printbuttonText: "Drucken",
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
        forbiddenText: "Diese Aktion ist nicht erlaubt !"
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
    }
});


OpenLayers.Util.extend(OpenLayers.Lang.de, {
    "layertree": "Themen",
    "querier": "Attributabfrage Eigentümer",

    // query builder
    "QueryBuilder.loading": "Lade Daten...",
    "QueryBuilder.incomplete_form": "Bitte alle erforderlichen Felder ausfüllen.",
    "QueryBuilder.no_result": "Es wurde kein Resultat gefunden.",
    "QueryBuilder.query_btn_text": "Abfrage",
    "QueryBuilder.alert_no_geom_field": "Es wurde kein Geometriefeld in dieser Ebene gefunden.",
    "QueryBuilder.describefeaturetype_exception": "Es ist ein Fehler aufgetreten.",
    "QueryBuilder.getfeature_exception": "Es ist ein Fehler aufgetreten.",
    "QueryBuilder.match": "Trifft auf",
    "QueryBuilder.of": "die folgenden Bedingungen zu:",
     
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
