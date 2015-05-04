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

    "cgxp.FullTextSearch.prototype": {
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
        toolTitle: "Permalink anzeigen",
        windowTitle: "Die aktuelle Seite kann mit folgender URL aufgerufen werden:",
        openlinkText: "Link in neuem Tab öffnen",
        closeText: "Schliessen",
        incompatibleWithIeText: "Achtung: diese URL ist zu lang für Microsoft Internet Explorer!",
        menuText: 'Permalink',
        shortText: "Senden",
        fieldsetText: "Teilen",
        emailText: "E-mail",
        emailSentTxt: "Der Link wurde versendet"
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
        totalSurfaceText: "Gesamtfläche: ",
        totalLengthText: "Gesamtlänge: ",
        totalResultText: "Resultat",
        totalResultsText: "Resultate",
        suggestionText: "Tipp",
        noLayerSelectedMessage: "Keine Ebene ausgewählt",
        totalNbOfFeaturesText: "Total Anzahl Resultate: ",
        countingText: "(lädt...)"
    },

    "cgxp.plugins.FeaturesWindow.prototype": {
        windowTitleText: 'Resultate',
        itemsText: "Objekte",
        itemText: "Objekt",
        noFeatureFound: "Kein Resultat",
        loadingResults: "Laden der Resultate...",
        suggestionText: "Tipp",
        noLayerSelectedMessage: "Keine Ebene ausgewählt"
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
        waitingText: "Dokument Generierung...",
        downloadText: 'Download',
        readyText: "Dokument ist bereit.",
        failureTitle: "Fehler beim Drucken",
        failureText: "Es ist ein Fehler aufgetreten beim Drucken. Bitte prüfen Sie die Parameter."
    },

    "cgxp.plugins.Login.prototype": {
        authenticationFailureText: "Benutzername oder Passwort fehlerhaft. Bitte geben Sie Ihre Daten erneut ein.",
        loggedAsText: "Angemeldet als <b>${user}</b>",
        logoutText: "Abmelden",
        loginText: "Anmelden",
        usernameText: "Benutzername",
        passwordText: "Passwort",
        loginMenuText: "Konto",
        changePasswordButtonText: "Senden",
        newPasswordText: "Neues Passwort",
        confirmNewPasswordText: "Neues Passwort bestätigen",
        changePasswordText: "Passwort ändern",
        actionButtonTooltip: "Anmelden / Abmelden",
        accountButtonTooltip: "Zugänge verwalten",
        pwdChangeOkTitle: "Passwort geändert",
        pwdChangeOkText: "Das neue Passwort wurde geändert.",
        pwdChangeKoTitle: "Die Passwortänderung ist fehlgeschlagen",
        pwdChangeForceTitle: "Passwort ändern",
        pwdChangeForceText: "Sie müssen Ihr Passwort ändern."
    },

    "cgxp.plugins.Help.prototype": {
        helpactiontooltipText: "Hilfe anzeigen",
        menuText: "Hilfe"
    },

    "cgxp.plugins.Redlining.prototype": {
        redliningText: "Zeichnen",
        redliningTooltip: "Elemente auf Karte zeichnen",
        attributesText: "Attribute"
    },

    "cgxp.MapOpacitySlider.prototype": {
        orthoText: "Orthofoto"
    },

    "cgxp.plugins.Legend.prototype": {
        legendbuttonText: "Legende",
        legendbuttonTooltip: "Legende anzeigen"
    },

    "cgxp.plugins.ScaleChooser.prototype": {
        labelText: "Massstab: "
    },

    "cgxp.plugins.LocationChooser.prototype": {
        labelText: "Sich bewegen nach",
        tooltipText: "Zentrieren Sie die Karte auf einer vordefinierten Stelle"
    },

    "cgxp.plugins.Editing.prototype": {
        helpText: "Klicken Sie auf die Karten um <b>ein bestehendes Element zu editieren</b>, oder",
        layerMenuText: "Wählen Sie eine Ebene",
        createBtnText: "Erstellen Sie ein neues Element",
        forbiddenText: "Diese Aktion ist nicht erlaubt!",
        titleText: "Editieren",
        saveServerErrorText: "Speichern nicht möglich wegen eines Serverfehlers.",
        queryServerErrorText: "Abfrage nicht möglich wegen eines Serverfehlers."
    },
    
    "cgxp.plugins.LayerTree.prototype": {
        restrictedContentWarning: "Ein Teil der Daten, auf welche Sie zugreifen möchten, ist nur für gewisse eingeloggte Nutzer freigegeben."
    },    

    "cgxp.tree.LayerTree.prototype": {
        moveupText: "Nach oben",
        movedownText: "Nach unten",
        moreinfoText: "Mehr Information",
        deleteText: "Layer löschen",
        opacityText: "Layeropazität anpassen",
        zoomtoscaleText: "Der Layer ist nicht sichtbar in diesem Massstab.",
        opacitylabelText: "Opazität",
        dateyearlabelText: "Y",
        datemonthlabelText: "m/Y",
        datelabelText: "d/m/Y",
        datetimelabelText: "d/m/Y H:i:s",
        datepickerrangeText: "Bitte Start- und End-Datum im Zeitraum <br>" +
            "von {from} bis {to} auswählen.",
        datepickersingleText: "Bitte Datum im Zeitraum " +
            "von {from} bis {to} auswählen.",
        showhidelegendText: "Legende anzeigen/verstecken",
        themealreadyloadedText: "Dieses Thema ist schon geladen.",
        showIn3dText: "Ansicht in 3D"
    },

    "cgxp.plugins.Routing.prototype": {
        routingTitle: "Route berechnen",
        routingwindowTitle: "Route berechnen",
        routingbuttonText: "Route",
        routingbuttonTooltip: "Route berechnen",
        sourcefieldLabelText: "Von",
        sourcefieldValueText: "Startadresse",
        sourceButtonLabel: "Auswahl in Karte",
        targetfieldLabelText: "Zu",
        targetfieldValueText: "Zieladresse",
        targetButtonLabel: "Auswahl in Karte",
        routeenginefieldLabel: "Mit",
        zoombuttonLabel: "Karte auf Route zentrieren",
        resetbuttonLabel: "Zurücksetzen",
        reversebuttonLabel: "Rückweg",
        routeDescriptionLabel: "Routenbeschreibung",
        totalDistanceLabel: "Gesamtstrecke",
        totalTimeLabel: "Gesamtzeit",
        directionsLabel: "Routenbeschreibung",
        loadingRouteLabel: "Ihre Route wird berechnet",
        noRouteFoundLabel: "Kein Routing möglich",
        routeErrorTitle: "Ein Fehler ist aufgetreten bei der Berechnung der Route."
    },

    "cgxp.plugins.WMSBrowser.prototype": {
        buttonText: "WMS hinzufügen",
        windowTitleText: "WMS-Layer hineinladen",
        menuText: "WMS hinzufügen",
        menuTooltip: "WMS zur Karte hinzufügen"
    },

    "cgxp.plugins.AddKMLFile.prototype": {
        buttonText: "KML hinzufügen",
        waitMsgText: "Lade Daten..."
    },

    "cgxp.plugins.ContextualData.prototype": {
        actionTooltipText: "Kontextinformationen anzeigen",
        menuText: "Kontextinformationen"
    },

    "cgxp.plugins.ContextualData.Control.prototype": {
        streetviewLabelText: "StreetView Link",
        userValueErrorText: "Der Rückgabewert der handleServerData Methode " +
            "muss ein Objekt sein. Siehe Beispiel im API.",
        userValueErrorTitleText: "Ein Fehler ist aufgetreten mit dem Kontextdaten-Tool."
    },

    "cgxp.plugins.ContextualData.Tooltip.prototype": {
        popupTitleText: "Location",
        defaultTpl: "Schweizer Koordinaten: {coord_x} {coord_y}<br />" +
            "WGS 84: {wgs_x} {wgs_y}<br />",
        defaultTplElevation: "Elevation (Terrain): {elevation_dtm} [m]<br />" +
            "Elevation (Surface): {elevation_dsm} [m]<br />" +
            "Height (Surface-Terrain): {elevation_dhm} [m]<br />"
    },

    "cgxp.plugins.ContextualData.ContextPopup.prototype": {
        popupTitleText: "Location",
        coordTpl: "<tr><td width=\"150\">Schweizer Koordinaten</td>" +
            "<td>{coord_x} {coord_y}</td></tr>" +
            "<tr><td>WGS 84</td><td>{wgs_x} {wgs_y}</td></tr>",
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
        errorMsg: "Ein Fehler ist aufgetreten mit dem Profil-Tool. Bitte versuchen Sie es erneut.",
        exportCsvText: "Export als CSV",
        menuText: "Höhenprofil"
    },

    "cgxp.plugins.GoogleEarthView.prototype": {
        tooltipText: "In Google Earth zeigen",
        menuText: "Google Earth",
        IE10warning: "GoogleEarth ist nicht mit IE10 und neuer kompatibel"
    },

    "cgxp.plugins.StreetView.prototype": {
        tooltipText: "In Google StreetView zeigen",
        menuText: "StreetView",
        helpMessage: "Klicken Sie auf eine Straße in der Karte um StreetView zu starten.",
    },

    "cgxp.plugins.QueryBuilder.prototype": {
        layerText: "Layer",
        querierText: "Attributabfrage",
        loadingText: "Lade Daten...",
        incompleteFormText: "Bitte alle erforderlichen Felder ausfüllen.",
        noResultText: "Es wurde kein Resultat gefunden.",
        queryButtonText: "Abfrage",
        errorText: "Ein Fehler ist aufgetreten mit dem Abfrage-Tool.",
        noGeomFieldError: "Es wurde kein Geometriefeld in dieser Ebene gefunden."
    },

    "cgxp.plugins.MapQuery.prototype": {
        actionTooltip: "Informationen in der Karte abfragen",
        menuText: "Informationen abfragen"
    },

    "cgxp.plugins.GetFeature.prototype": {
        tooltipText: "Informationen in der Karte abfragen",
        menuText: "Abfragen der Karte",
        unqueriedLayerTitle: "Diese Ebene kann nicht abgefragt werden.",
        unqueriedLayerText: "Diese Ebene unterstützt nur Punkt-Abfragen.",
        queryResultMessage: "Informationen in einem Rechteck können mit der " +
            "{key} Taste abgefragt werden."
    },

    "cgxp.plugins.MyPosition.prototype": {
        actionTooltip: "Auf meinen Standort zentrieren"
    },

    "GeoExt.ux.form.FeaturePanel.prototype": {
        pointRadiusFieldText: "Grösse",
        colorFieldText: "Farbe",
        strokeWidthFieldText: "Breite",
        labelFieldText: "Text",
        fontSizeFieldText: "Grösse",
        coordsFieldText: "Koordinaten anzeigen",
        lengthFieldText: "Distanz anzeigen",
        areaFieldText: "Fläche anzeigen"
    },

    "GeoExt.ux.FeatureEditorGrid.prototype": {
        deleteMsgTitle: "Dieses Objekt löschen?",
        deleteMsg: "Wollen Sie dieses Objekt wirklich löschen?",
        deleteButtonText: "Löschen",
        deleteButtonTooltip: "Dieses Objekt löschen",
        cancelMsgTitle: "Das Löschen abbrechen?",
        cancelMsg: "Es gibt ungesicherte Änderungen. Sind Sie sicher, dass Sie abbrechen wollen?",
        cancelButtonText: "Abbrechen",
        cancelButtonTooltip: "Die Edition abbrechen und die Änderungen nicht speichern",
        saveButtonText: "Speichern",
        saveButtonTooltip: "Die Änderungen speichern",
        nameHeader: "Name",
        valueHeader: "Wert"
    }
});
