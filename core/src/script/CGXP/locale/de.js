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
        incompatibleWithIeText: "Achtung: diese URL ist zu lang für Microsoft Internet Explorer!",
        menuText: 'Permalink'
    },

    "cgxp.plugins.FeaturesGrid.prototype": {
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
        resultsText: "Resultate",
        suggestionText: "Tipp"
    },

    "cgxp.plugins.FeaturesWindow.prototype": {
        suggestionText: "Tipp"
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
        helpactiontooltipText: "Hilfe",
        menuText: "Hilfe"
    },

    "cgxp.plugins.Redlining.prototype": {
        redliningText: "Zeichnen",
        attributesText: 'Attribute'
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
        themealreadyloadedText: "Dieses Thema ist schon geladen.",
        showIn3dText: 'Ansicht in 3D'
    },

    "cgxp.plugins.FeaturesWindow.prototype": {
        windowTitleText: 'Resultate',
        itemsText: "elemente",
        itemText: "element"
    },

    "cgxp.plugins.WMSBrowser.prototype": {
        buttonText: 'WMS hinzufügen',
        windowTitleText: 'WMS-Layer hineinladen',
        menuText: 'WMS hinzufügen'
    },

    "cgxp.plugins.AddKMLFile.prototype": {
        buttonText: "KML hinzufügen",
        waitMsgText: "Lade Daten..."
    },

    "cgxp.plugins.ContextualData.prototype": {
        actionTooltipText: "Contextual Informations Tooltips",
        menuText: 'Contextual Informations'
    },

    "cgxp.plugins.ContextualData.Control.prototype": {
        streetviewLabelText: 'StreetView Link',
        userValueErrorText: 'The value returned by the handleServerData methode ' +
        'must be an object. See the example in the API.',
        userValueErrorTitleText: 'Error'
    },

    "cgxp.plugins.ContextualData.Tooltip.prototype": {
        popupTitleText: "Location",
        defaultTpl: "Schweizer Koordinaten: {coord_x} {coord_y}<br />" +
            "WGS 84: {wsg_x} {wsg_y}<br />",
        defaultTplElevation: "Elevation (Terrain): {elevation_dtm} [m]<br />" +
            "Elevation (Surface): {elevation_dsm} [m]<br />" +
            "Height (Surface-Terrain): {elevation_dhm} [m]<br />"
    },

    "cgxp.plugins.ContextualData.ContextPopup.prototype": {
        popupTitleText: "Location",
        coordTpl: "<tr><td width=\"150\">Schweizer Koordinaten</td>" +
            "<td>{coord_x} {coord_y}</td></tr>" +
            "<tr><td>WGS 84</td><td>{wsg_x} {wsg_y}</td></tr>",
        elevationTpl: "<tr><td>Elevation (Terrain)</td><td>{elevation_dtm} [m]</td></tr>" +
            "<tr><td>Elevation (Surface)</td><td>{elevation_dsm} [m]</td></tr>" +
            "<tr><td>Height (Surface-Terrain)</td><td>{elevation_dhm} [m]</td></tr>" +
            "<tr><td>Slope</td><td>{elevation_slope} [°]</td></tr>"
    },

    "cgxp.plugins.Profile.prototype": {
        helpText: "<h1>Höhenprofil</h1>Zeichnen Sie eine Linie auf der Karte. Doppelklicken Sie um die Linie zu beenden und das Höhenprofil anzuzeigen.",
        waitMsgText: "Höhenprofil wird geladen...",
        xLabelText: "Abstand (m)",
        yLabelText: "Höhe (m)",
        errorMsg: "Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.",
        exportCsvText: "Export als CSV",
        menuText: 'Höhenprofil'
    },

    "cgxp.plugins.GoogleEarth.prototype": {
        tooltipText: 'GoogleEarth',
        menuText: 'GoogleEarth'
    },

    "cgxp.plugins.StreetView.prototype": {
        tooltipText: 'StreetView',
        menuText: 'StreetView'
    },

    "cgxp.plugins.QueryBuilder.prototype": {
        layerText: "Layer",
        querierText: "Attributabfrage",
        loadingText: 'Lade Daten...',
        incompleteFormText: 'Bitte alle erforderlichen Felder ausfüllen.',
        noResultText: 'Es wurde kein Resultat gefunden.',
        queryButtonText: 'Abfrage',
        errorText: 'Bitte alle erforderlichen Felder ausfüllen.',
        noGeomFieldError: 'Es wurde kein Geometriefeld in dieser Ebene gefunden.'
    },

    "cgxp.plugins.MapQuery.prototype": {
        actionTooltip: 'Informationen in der Karte abfragen',
        menuText: 'Informationen abfragen'
    },

    "cgxp.plugins.WFSGetFeature.prototype": {
        actionTooltip: 'Informationen in der Karte abfragen'
    },

    "cgxp.plugins.WMSGetFeatureInfo.prototype": {
        actionTooltip: 'Informationen in der Karte abfragen',
        noLayerSelectedMessage: 'Keine Ebene ausgewählt'
    },

    "cgxp.plugins.GetFeature.prototype": {
        actionTooltip: 'Informationen in der Karte abfragen',
        menuText: 'Abfragen der Karte',
        unqueriedLayerTitle: 'Diese Ebene kann nicht abgefragt werden.',
        unqueriedLayerText: "Diese Ebene unterstützt nur Punkt-Abfragen.",
        queryResultMessage: "Informationen in einem Rechteck können mit der " +
            "{key} Taste abgefragt werden."
    },

    "GeoExt.ux.form.FeaturePanel.prototype": {
        pointRadiusFieldText: "Grösse",
        colorFieldText: "Farbe",
        strokeWidthFieldText: "Breite",
        labelFieldText: "Text",
        fontSizeFieldText: "Grösse"
    },

    "GeoExt.ux.FeatureEditorGrid.prototype": {
        deleteMsgTitle: "Dieses Objekt löschen?",
        deleteMsg: "Wollen Sie dieses Objekt wirklich löschen?",
        deleteButtonText: "Löschen",
        deleteButtonTooltip: "Dieses Objekt löschen",
        cancelMsgTitle: "Das Löschen abbrechen?",
        cancelMsg: "Es gibt ungesicherte Änderungen. Sind Sie sicher dass Sie abbrechen wollen?",
        cancelButtonText: "Abbrechen",
        cancelButtonTooltip: "Die Edition abbrechen und die Änderungen nicht speichern",
        saveButtonText: "Speichern",
        saveButtonTooltip: "Die Änderungen speichern",
        nameHeader: "Name",
        valueHeader: "Wert"
    }

});
