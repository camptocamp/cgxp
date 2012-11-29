/*
 * @requires GeoExt/Lang.js
 */

GeoExt.Lang.add("fr", {
    "Ext.layout.FormLayout.prototype": {
        labelSeparator: "&nbsp;:"
    },

    "cgxp.plugins.Measure.prototype": {
        pointMenuText: "Point",
        pointTooltip: "Mesure de point",
        lengthMenuText: "Longueur",
        areaMenuText: "Surface",
        azimuthMenuText: "Azimut",
        coordinateText: "Coordonnées&nbsp;: ",
        easternText: "Est&nbsp;: ",
        northernText: "Nord&nbsp;: ",
        distanceText: "Distance&nbsp;: ",
        azimuthText: "Azimut&nbsp;: ",
        lengthTooltip: "Mesure de longueur",
        areaTooltip: "Mesure de surface",
        azimuthTooltip: "Mesure d'azimut",
        measureTooltip: "Mesure"
    },

   "cgxp.plugins.FullTextSearch.prototype": {
        tooltipTitle: "Rechercher",
        emptyText: "Recherche...",
        loadingText: "Recherche en cours..."
    },
    
    "cgxp.plugins.ThemeFinder.prototype": {
        emptyText: "Rechercher un thème ou une couche"
    },

    "cgxp.plugins.ThemeSelector.prototype": {
        localTitle: "Couches locales",
        externalTitle: "Couches externes",
        toolTitle: "Thèmes"
    },
    
    "cgxp.plugins.Permalink.prototype": {
        toolTitle: "Permalien",
        windowTitle: "Permalien",
        openlinkText: "Ouvrir le lien",
        closeText: "Fermer",
        incompatibleWithIeText: "Attention&nbsp;: cette URL est trop longue pour Microsoft Internet Explorer%nbsp;!"
    },
    
    "cgxp.plugins.FeatureGrid.prototype": {
        clearAllText: "Tout effacer",
        selectText: "Sélectionner",
        selectAllText: "Tous",
        selectNoneText: "Aucun",
        selectToggleText: "Inverser la sélection",
        actionsText: "Actions sur la sélection",
        zoomToSelectionText: "Zoomer sur la sélection",
        csvSelectionExportText: "Exporter en CSV",
        maxFeaturesText: "Nombre maximum de résultats",
        resultText: "Résultat",
        resultsText: "Résultats"
    },

    "cgxp.plugins.Print.prototype": {
        printTitle: "Imprimer",
        titlefieldText: "Titre",
        titlefieldvalueText: "Titre de la carte",
        commentfieldText: "Commentaires",
        commentfieldvalueText: "Commentaires sur la carte",
        includelegendText: "Inclure la légende",
        layoutText: "Format",
        dpifieldText: "Résolution",
        scalefieldText: "Échelle",
        rotationfieldText: "Rotation",
        printbuttonText: "Imprimer",
        printbuttonTooltip: "Imprimer",
        exportpngbuttonText: "Exporter en PNG",
        waitingText: "Impression...",
        downloadText: "Télécharger",
        readyText: "Votre PDF est prêt.",
        failureTitle: "Echec de l'impression",
        failureText: "L'impression a échoué. Merci de vérifier les paramètres."
    },

    "cgxp.plugins.Login.prototype": {
        authenticationFailureText: "Impossible de se connecter.",
        loggedAsText: "Connecté en tant que ${user}",
        logoutText: "Déconnexion",
        loginText: "Connexion",
        usernameText: "Nom d'utilisateur",
        passwordText: "Mot de passe"
    },

    "cgxp.plugins.Help.prototype": {
        helpactiontooltipText: "Aide"
    },

    "cgxp.plugins.Redlining.prototype": {
        redliningText: "Surlignage",
        attributesText: 'Attributs'
    },

    "cgxp.MapOpacitySlider.prototype": {
        orthoText: "Orthophoto"
    },

    "cgxp.plugins.Legend.prototype": {
        legendbuttonText: "Légende",
        legendbuttonTooltip: "Afficher la légende de la carte",
        legendwindowTitle: "Légende"
    },

    "cgxp.plugins.ScaleChooser.prototype": {
        labelText: "Échelle&nbsp;: "
    },

    "cgxp.plugins.Editing.prototype": {
        helpText: "Cliquer sur la carte pour <b>éditer des objets</b>, ou",
        layerMenuText: "Choisir une couche",
        createBtnText: "Créer un nouvel objet",
        forbiddenText: "Vous n'êtes pas autorisé à réaliser cette action&nbsp;!"
    },

    "cgxp.tree.LayerTree.prototype": {
        moveupText: "Monter",
        movedownText: "Descendre",
        moreinfoText: "Plus d'informations",
        deleteText: "Supprimer la couche",
        opacityText: "Modifier l'opacité de la couche",
        zoomtoscaleText: "Cette couche n'est pas visible à ce niveau de zoom.",
        opacitylabelText: "Opacité",
        showhidelegendText: "Afficher/masquer la légende",
        themealreadyloadedText: "Ce thème est déjà chargé.",
        showIn3dText: 'Afficher en 3D'
    },

    "cgxp.plugins.FeaturesWindow.prototype": {
        windowTitleText: 'Résultats',
        itemsText: "éléments",
        itemText: "élément"
    },

    "cgxp.plugins.WMSBrowser.prototype": {
        buttonText: "+ WMS",
        windowTitleText: "Ajouter des couches WMS"
    },

    "cgxp.plugins.ContextualData.prototype": {
        actionTooltipText: "Tooltips d'informations contextuelles"
    },

    "cgxp.plugins.ContextualData.Control.prototype": {
        streetviewLabelText: 'Lien StreetView',
        userValueErrorText: "La valeur retournée par la méthode handleServerData" +
            "methode doit être un objet. Voir l'exemple dans la documentation de l'API",
        userValueErrorTitleText: 'Erreur'
    },

    "cgxp.plugins.ContextualData.Tooltip.prototype": {
        popupTitleText: "Position",
        defaultTpl: "Coordonnées locales&nbsp;: {coord_x} {coord_y}<br />" +
            "WGS 84&nbsp;: {wsg_x} {wsg_y}<br />",
        defaultTplElevation: "Élevation (Terrain)&nbsp;: {elevation_dtm} [m]<br />" +
            "Élevation (Surface)&nbsp;: {elevation_dsm} [m]<br />" +
            "Hauteur (Surface-Terrain)&nbsp;: {elevation_dhm} [m]<br />"
    },

    "cgxp.plugins.ContextualData.ContextPopup.prototype": {
        popupTitleText: "Position",
        coordTpl: "<tr><td width=\"150\">Coordonnées locales</td>" +
            "<td>{coord_x} {coord_y}</td></tr>" +
            "<tr><td>WGS 84</td><td>{wsg_x} {wsg_y}</td></tr>",
        elevationTpl: "<tr><td>Élevation (Terrain)</td><td>{elevation_dtm} [m]</td></tr>" +
        "<tr><td>Élevation (Surface)</td><td>{elevation_dsm} [m]</td></tr>" +
        "<tr><td>Hauteur (Surface-Terrain)</td><td>{elevation_dhm} [m]</td></tr>" +
        "<tr><td>Pente du terrain</td><td>{elevation_slope} [° dég.]</td></tr>"
    },

    "cgxp.plugins.Profile.prototype": {
        helpText: "<h1>Profil altimétrique</h1>Dessinez une ligne sur la carte. Double-cliquez pour terminer et afficher le profil.",
        waitMsgText: "Chargement du profil altimétrique...",
        xLabelText: "Distance (m)",
        yLabelText: "Altitude (m)",
        errorMsg: "Une erreur s'est produite. Veuillez recommencer.",
        exportCsvText: "Exporter en CSV"
    },

    "cgxp.plugins.QueryBuilder.prototype": {
        layerText: "Couche",
        querierText: "Requêteur",
        loadingText: 'Chargement...',
        incompleteFormText: 'Formulaire incomplet.',
        noResultText: 'Pas de résultat trouvé.',
        queryButtonText: 'Effectuer la requête',
        errorText: 'Une erreur est survenue.',
        noGeomFieldError: 'Pas de champs géometrique trouvé.'
    },

    "cgxp.plugins.MapQuery.prototype": {
        actionTooltip: 'Questionne la carte'
    },

    "cgxp.plugins.WFSGetFeature.prototype": {
        actionTooltip: 'Questionne la carte'
    },

    "cgxp.plugins.WMSGetFeatureInfo.prototype": {
        actionTooltip: 'Questionne la carte',
        noLayerSelectedMessage: 'Pas de couche sélectionnée'
    },

    "cgxp.FloorSlider.prototype": {
        skyText: "Ciel",
        floorText: "Étages"
    },

    "GeoExt.ux.form.FeaturePanel.prototype": {
        pointRadiusFieldText: "Taille",
        colorFieldText: "Couleur",
        strokeWidthFieldText: "Epaisseur du trait",
        labelFieldText: "Étiquette",
        fontSizeFieldText: "Taille"
    }
});
