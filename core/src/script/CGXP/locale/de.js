GeoExt.Lang.add("de", {
    "cgxp.plugins.Measure.prototype": {
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
        clearAllText: "Clear all",
        selectText: "Select",
        selectAllText: "All",
        selectNoneText: "None",
        selectToggleText: "Toggle",
        actionsText: "Actions on selected results",
        zoomToSelectionText: "Zoom on selection",
        csvSelectionExportText: "Export as CSV",
        maxFeaturesText: "Maximum of results",
        resultText: "Result",
        resultsText: "Results"
    },

    "cgxp.plugins.Print.prototype": {
        printTitle: "Printing",
        titlefieldText: "Title",
        titlefieldvalueText: "Map title",
        commentfieldText: "Comment",
        commentfieldvalueText: "Comment on the map",
        dpifieldText: "Resolution",
        scalefieldText: "Scale",
        rotationfieldText: "Rotation",
        printbuttonText: "Print",
        waitingText: "Printing...",
        downloadText: 'Download',
        readyText: 'Your PDF is ready.',
        failureTitle: "Printing Failure",
        failureText: "An error occured while printing. Please check the parameters."
    },

    "cgxp.plugins.Login.prototype": {
        authenticationFailureText: "Impossible to connect.",
        loggedAsText: "Logged in as ${user}",
        logoutText: "Logout",
        loginText: "Login",
        usernameText: "Username",
        passwordText: "Password"
    },

    "cgxp.plugins.Login.prototype": {
        helpactiontooltipText: "Help"
    },

    "cgxp.plugins.Redlining.prototype": {
        redliningText: "Redlining"
    },

    "cgxp.plugins.MapOpacitySlider.prototype": {
        orthoText: "Orthophoto"
    },

    "cgxp.plugins.Legend.prototype": {
        legendbuttonText: "Legend",
        legendbuttonTooltip: "Display the map legend",
        legendwindowTitle: "Legend"
    },

    "cgxp.tree.LayerTree.prototype": {
        moveupText: "Raise",
        movedownText: "Move down",
        moreinfoText: "More information",
        deleteText: "Remove layer",
        opacityText: "Modify layer opacity",
        zoomtoscaleText: "This layer is not visible at this zoom level.",
        opacitylabelText: "Opacity",
        showhidelegendText: "Show/hide legend"
    }
});


OpenLayers.Util.extend(OpenLayers.Lang.de, {
    "layertree": "Themen",
    "print": "Drucken",
    "querier": "Attributabfrage Eigentümer",
    "close": "Schliessen",

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
     
    'Search.ToolTip': 'In diesem Feld können Sie nach verschiedenen geografischen <br />Orten und Objekten suchen: <br /><b>Amtliche Vermessung:</b> Adressen, Parzellen, Assekuranznummern z.B. <b>wohlen 1716</b><br /><b>Werkplan Elektro:</b> Trafostationen, Verteilkabinen z.B. <b>ts 41</b><br /><b>Werkplan Wasser:</b> Hydranten, Reservoir z.B. <b>hydr 5612 102</b><br /><b>Werkplan Gas:</b> Druckreduzierstationen z.B. <b>drs 15</b><br /><b>Werkplan Abwasser:</b> KontrollschÃ¤chte z.B. <b>k 150</b>',

    "ResultsPanel.clearAll": "Resultate löschen",
    "ResultsPanel.select": "Auswahl",
    "ResultsPanel.select.all": "alle",
    "ResultsPanel.select.none": "keine",
    "ResultsPanel.select.toggle": "umkehren",
    "ResultsPanel.actions": "auf Auswahl anwenden",
    "ResultsPanel.actions.zoomToSelection": "zentrieren auf Ausdehnung",
    "ResultsPanel.actions.csvSelectionExport": "als CSV Datei exportieren",
    "ResultsPanel.max_features_msg": "maximale Anzahl Resultate erreicht",
    "ResultsPanel.result": "Resultat",
    "ResultsPanel.results": "Resultate",

    "Print.titlefieldlabel": "Titel",
    "Print.titlefieldvalue": "Kartentitel",
    "Print.commentfieldlabel": "Kommentar",
    "Print.commentfieldvalue": "Kommentar auf der Karte",
    "Print.dpifieldlabel": "Auflösung", 
    "Print.scalefieldlabel": "Massstab",
    "Print.rotationfieldlabel": "Rotation",
    "Print.printbuttonlabel": "Drucken",
    "Print.waitingmessage": "PDF Generierung...",
    'Print.Download': 'Download',
    'Print.Ready': 'PDF ist bereit.',
    "Print.failuretitle": "Fehler beim Drucken",
    "Print.failuremsg": "Es ist ein Fehler aufgetreten beim Drucken. Bitte prüfen Sie die Parameter.",
    
    "Tools.authenticationFailure": "Benutzername oder Passwort fehlerhaft. Bitte geben Sie Ihre Daten erneut ein.",
    "Tools.maxextentactiontooltip": "Gesamtübersicht",
    "Tools.measurelengthactiontooltip": "Strecke messen",
    "Tools.measureareaactiontooltip": "Fläche messen",
    "Tools.measurepositionactiontooltip": "Koordinaten eines Punktes abfragen",
    "Tools.ortholabel": "Orthofoto",
    "Tools.legendbuttontext": "Legende",
    "Tools.legendbuttontooltip": "Legende anzeigen",
    "Tools.legendwindowtitle": "Legende",
    "Tools.helpactiontooltip": "Hilfe",
    "Tools.redlining": "Zeichnen",
    "Tools.LoggedAs": "Angemeldet als <b>${user}</b>",
    "Tools.Logout": "Abmelden",
    "Tools.Login": "Anmelden",
    "Tools.username": "Benutzername",
    "Tools.password": "Passwort",

    // toolbar
    "Locator.easting": "Rechtswert:",
    "Locator.northing": "Hochwert:",

    "Query.countertext": "Element {0} von {1}",
    "Query.actiontooltip": "Informationen in der Karte abfragen",
    "Query.nolayerselectedmsg": "Keine Ebene ausgewählt",

    // tree
    "Tree.moveup": "nach oben",
    "Tree.movedown": "nach unten",
    "Tree.moreinfo": "mehr Information",
    "Tree.delete": "Layer löschen",
    "Tree.opacity": "Layertransparenz anpassen",
    "Tree.zoomtoscale": "Der Layer ist nicht sichtbar in diesem Massstab.",
    "Tree.opacitylabel": "Transparenz",
});
