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
        measureTooltip: "Mesurer"
    },

   "cgxp.FullTextSearch.prototype": {
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
        toolTitle: "Afficher le permalien courant",
        windowTitle: "Permalien",
        openlinkText: "Ouvrir le lien",
        closeText: "Fermer",
        incompatibleWithIeText: "Attention&nbsp;: cette URL est trop longue pour Microsoft Internet Explorer&nbsp;!",
        menuText: 'Permalien',
        shortText: "Envoyer",
        fieldsetText: "Partager",
        emailText: "E-mail",
        emailSentTxt: "Le lien a été envoyé"
    },

    "cgxp.plugins.FeaturesGrid.prototype": {
        clearAllText: "Tout effacer",
        selectText: "Sélectionner",
        selectAllText: "Tous",
        selectNoneText: "Aucun",
        selectToggleText: "Inverser la sélection",
        actionsText: "Actions sur la sélection",
        zoomToSelectionText: "Zoomer sur la sélection",
        csvSelectionExportText: "Exporter en CSV",
        maxFeaturesText: "Nombre maximum de résultats",
        totalSurfaceText: "Surface totale&nbsp;: ",
        totalLengthText: "Longueur totale&nbsp;: ",
        totalResultText: "résultat",
        totalResultsText: "résultats",
        suggestionText: "Suggestion",
        noLayerSelectedMessage: "Pas de couche sélectionnée",
        totalNbOfFeaturesText: "Nombre total de résultats&nbsp;: ",
        countingText: "(en cours de calcul...)"
    },

    "cgxp.plugins.FeaturesWindow.prototype": {
        windowTitleText: 'Résultats',
        itemsText: "éléments",
        itemText: "élément",
        suggestionText: "Suggestion",
        noFeatureFound: "Aucun résultat",
        loadingResults: "Chargement des résultats...",
        noLayerSelectedMessage: "Pas de couche sélectionnée"
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
        readyText: "Votre document est prêt.",
        failureTitle: "Echec de l'impression",
        failureText: "L'impression a échoué. Merci de vérifier les paramètres."
    },

    "cgxp.plugins.Login.prototype": {
        authenticationFailureText: "Impossible de se connecter.",
        loggedAsText: "Connecté en tant que ${user}",
        logoutText: "Déconnexion",
        loginText: "Connexion",
        usernameText: "Nom d'utilisateur",
        passwordText: "Mot de passe",
        loginMenuText: "Compte",
        changePasswordButtonText: "Envoyer",
        newPasswordText: "Nouveau mot de passe",
        confirmNewPasswordText: "Confirmation mot de passe",
        changePasswordText: "Changer le mot de passe",
        actionButtonTooltip: "Se connecter / Se déconnecter",
        accountButtonTooltip: "Gérer les accès",
        pwdChangeOkTitle: "Mot de passe modifié",
        pwdChangeOkText: "Le nouveau mot de passe a été enregistré.",
        pwdChangeKoTitle: "La modification du mot de passe a échoué",
        pwdChangeForceTitle: "Changer le mot de passe",
        pwdChangeForceText: "Vous devez modifier votre mot de passe."
    },

    "cgxp.plugins.Help.prototype": {
        helpactiontooltipText: "Afficher l'aide",
        menuText: "Aide"
    },

    "cgxp.plugins.Redlining.prototype": {
        redliningText: "Surlignage",
        redliningTooltip: "Dessiner des objets sur la carte",
        attributesText: "Attributs"
    },

    "cgxp.MapOpacitySlider.prototype": {
        orthoText: "Orthophoto"
    },

    "cgxp.plugins.Legend.prototype": {
        legendbuttonText: "Légende",
        legendbuttonTooltip: "Afficher la légende de la carte"
    },

    "cgxp.plugins.ScaleChooser.prototype": {
        labelText: "Échelle&nbsp;: "
    },

    "cgxp.plugins.LocationChooser.prototype": {
        labelText: "Se déplacer vers",
        tooltipText: "Centrer la carte sur un lieu prédéfini"
    },

    "cgxp.plugins.Editing.prototype": {
        helpText: "Cliquer sur la carte pour <b>éditer des objets</b>, ou",
        layerMenuText: "Choisir une couche",
        createBtnText: "Créer un nouvel objet",
        forbiddenText: "Vous n'êtes pas autorisé à réaliser cette action&nbsp;!",
        titleText: "Edition",
        saveServerErrorText: "L'enregistrement a échoué en raison d'une erreur du serveur.",
        queryServerErrorText: "L'interrogation a échoué en raison d'une erreur du serveur."
    },

    "cgxp.plugins.LayerTree.prototype": {
        restrictedContentWarning: "Une partie des données auxquelles vous souhaitez accéder n'est disponible qu'aux utilissateurs identifiés."
    },

    "cgxp.tree.LayerTree.prototype": {
        moveupText: "Monter",
        movedownText: "Descendre",
        moreinfoText: "Plus d'informations",
        deleteText: "Supprimer la couche",
        opacityText: "Modifier l'opacité de la couche",
        zoomtoscaleText: "Cette couche n'est pas visible à ce niveau de zoom.",
        opacitylabelText: "Opacité",
        dateyearlabelText: "Y",
        datemonthlabelText: "m/Y",
        datelabelText: "d/m/Y",
        datetimelabelText: "d/m/Y H:i:s",
        showhidelegendText: "Afficher/masquer la légende",
        themealreadyloadedText: "Ce thème est déjà chargé.",
        showIn3dText: "Afficher en 3D"
    },

    "cgxp.plugins.Routing.prototype": {
        routingTitle: "Recherche d'itinéraire",
        routingwindowTitle: "Itinéraire",
        routingbuttonText: "Itinéraire",
        routingbuttonTooltip: "Calculer un itinéraire",
        sourcefieldLabelText: "De",
        sourcefieldValueText: "Lieu de départ",
        sourceButtonLabel: "Via la carte",
        targetfieldLabelText: "À",
        targetfieldValueText: "Lieu d'arrivée",
        targetButtonLabel: "Via la carte",
        routeenginefieldLabel: "Trajet",
        zoombuttonLabel: "Zoom sur l'itinéraire",
        resetbuttonLabel: "Réinitialiser",
        reversebuttonLabel: "Sens inverse",
        routeDescriptionLabel: "Description de l'itinéraire",
        totalDistanceLabel: "Distance totale",
        totalTimeLabel: "Temps total",
        directionsLabel: "Directions",
        loadingRouteLabel: "Votre itinéraire est en cours de calcul",
        noRouteFoundLabel: "Pas d'itinéraire possible",
        routeErrorTitle: "Une erreur s'est produite avec l'outil de calcul d'itinéraire."
    },

    "cgxp.plugins.WMSBrowser.prototype": {
        buttonText: "Ajouter WMS",
        windowTitleText: "Ajouter des couches WMS",
        menuText: "Ajouter WMS",
        menuTooltip: "Ajouter des couches WMS à la carte"
    },

    "cgxp.plugins.AddKMLFile.prototype": {
        buttonText: "Ajouter KML",
        waitMsgText: "Chargement..."
    },

    "cgxp.plugins.ContextualData.prototype": {
        actionTooltipText: "Afficher des informations contextuelles",
        menuText: "Informations contextuel"
    },

    "cgxp.plugins.ContextualData.Control.prototype": {
        streetviewLabelText: "Lien StreetView",
        userValueErrorText: "La valeur retournée par la méthode handleServerData" +
            "methode doit être un objet. Voir l'exemple dans la documentation de l'API",
        userValueErrorTitleText: "Une erreur est survenue avec l'outil de données contextuelles."
    },

    "cgxp.plugins.ContextualData.Tooltip.prototype": {
        popupTitleText: "Position",
        defaultTpl: "Coordonnées suisses&nbsp;: {coord_x} {coord_y}<br />" +
            "WGS 84&nbsp;: {wgs_x} {wgs_y}<br />",
        defaultTplElevation: "Élevation (Terrain)&nbsp;: {elevation_dtm} [m]<br />" +
            "Élevation (Surface)&nbsp;: {elevation_dsm} [m]<br />" +
            "Hauteur (Surface-Terrain)&nbsp;: {elevation_dhm} [m]<br />"
    },

    "cgxp.plugins.ContextualData.ContextPopup.prototype": {
        popupTitleText: "Position",
        coordTpl: "<tr><td width=\"150\">Coordonnées suisses</td>" +
            "<td>{coord_x} {coord_y}</td></tr>" +
            "<tr><td>WGS 84</td><td>{wgs_x} {wgs_y}</td></tr>",
        elevationTpl: "<tr><td>Élevation (Terrain)</td><td>{elevation_dtm} [m]</td></tr>" +
            "<tr><td>Élevation (Surface)</td><td>{elevation_dsm} [m]</td></tr>" +
            "<tr><td>Hauteur (Surface-Terrain)</td><td>{elevation_dhm} [m]</td></tr>" +
            "<tr><td>Pente du terrain</td><td>{elevation_slope} [°]</td></tr>"
    },

    "cgxp.plugins.Profile.prototype": {
        helpText: "<h1>Profil altimétrique</h1>Dessinez une ligne sur la carte. Double-cliquez pour terminer et afficher le profil.",
        waitMsgText: "Chargement du profil altimétrique...",
        xLabelText: "Distance (m)",
        yLabelText: "Altitude (m)",
        errorMsg: "Une erreur s'est produite avec l'outil de profil. Veuillez recommencer.",
        exportCsvText: "Exporter en CSV",
        tooltipText: "Afficher le profil altimétrique",
        menuText: "Profil altimétrique"
    },

    "cgxp.plugins.GoogleEarthView.prototype": {
        tooltipText: "Visualiser dans GoogleEarth",
        menuText: "GoogleEarth",
        IE10warning: "GoogleEarth n'est pas compatible avec IE10 et plus récent"
    },

    "cgxp.plugins.StreetView.prototype": {
        tooltipText: "Visualiser dans StreetView",
        menuText: "StreetView",
        helpMessage: "Cliquer sur une route de la carte pour démarrer StreetView."
    },

    "cgxp.plugins.QueryBuilder.prototype": {
        layerText: "Couche",
        querierText: "Requêteur",
        loadingText: "Chargement...",
        incompleteFormText: "Formulaire incomplet.",
        noResultText: "Pas de résultat trouvé.",
        queryButtonText: "Effectuer la requête",
        errorText: "Une erreur est survenue avec le constructeur de requêtes.",
        noGeomFieldError: "Pas de champs géometrique trouvé."
    },

    "cgxp.plugins.MapQuery.prototype": {
        actionTooltip: "Interroger des objets sur la carte",
        menuText: "Interroger la carte"
    },

    "cgxp.plugins.GetFeature.prototype": {
        tooltipText: "Interroger des objets sur la carte",
        menuText: "Interroger la carte",
        unqueriedLayerTitle: "Impossible d'interroger cette couche",
        unqueriedLayerText: "Seules les interrogations par simple clic sont " +
            "possibles pour cette couche.",
        queryResultMessage: "Utilisez la touche {key} pour faire des sélections rectangulaires."
    },

    "cgxp.plugins.MyPosition.prototype": {
        actionTooltip: "Recentrer sur ma position"
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
        fontSizeFieldText: "Taille",
        radiusFieldText: "Rayon",
        coordsFieldText: "Afficher les coordonnées",
        lengthFieldText: "Afficher la longueur",
        areaFieldText: "Afficher la surface"
    },

    "GeoExt.ux.FeatureEditorGrid.prototype": {
        deleteMsgTitle: "Supprimer l'objet ?",
        deleteMsg: "Êtes-vous sûr de vouloir supprimer cet objet ?",
        deleteButtonText: "Supprimer",
        deleteButtonTooltip: "Supprimer cet objet",
        cancelMsgTitle: "Annuler la suppression ?",
        cancelMsg: "Il y a des modifications non-enregistrées. Êtes-vous sûr de vouloir annuler ?",
        cancelButtonText: "Annuler",
        cancelButtonTooltip: "Arrêter l'édition, ne pas enregistrer les modifications",
        saveButtonText: "Enregistrer",
        saveButtonTooltip: "Enregistrer les modifications",
        nameHeader: "Nom",
        valueHeader: "Valeur"
    }
});

OpenLayers.Lang["fr"] = OpenLayers.Util.applyDefaults({
  "STATUS_0": "Successful",
  "STATUS_1": "Unknown server error",
  "STATUS_2": "Invalid parameter",
  "STATUS_3": "Parameter out of range",
  "STATUS_4": "Required parameter missing",
  "STATUS_5": "Service unavailable",
  "STATUS_202": "Route is blocked",
  "STATUS_205": "DB corrupted",
  "STATUS_206": "DB is not open",
  "STATUS_207": "No route",
  "STATUS_208": "Invalid start point",
  "STATUS_209": "Invalid end point",
  "STATUS_210": "Start and end points are equal",

  "ENGINE_0": "voiture (le plus rapide)",
  "N": "nord",
  "E": "est",
  "S": "sud",
  "W": "ouest",
  "NE": "nord-est",
  "SE": "sud-est",
  "SW": "sud-ouest",
  "NW": "nord-ouest",
  // driving directions
  // ${roadName}: road name
  // ${compassDirection}: compass direction
  // ${distance}: distance
  // ${duration}: duration
  // [*]: will only be printed when there actually is a road name
  "DIRECTION_0":"Instruction inconnue[ sur <b>${roadName}</b>]",
  "DIRECTION_1":"Continuez[ sur <b>${roadName}</b>]",
  "DIRECTION_2":"Tournez légèrement à droite[ sur <b>${roadName}</b>]",
  "DIRECTION_3":"Tournez à droite[ sur <b>${roadName}</b>]",
  "DIRECTION_4":"Tournez fortement à droite[ sur <b>${roadName}</b>]",
  "DIRECTION_5":"Faites demi-tour[ sur <b>${roadName}</b>]",
  "DIRECTION_6":"Tournez fortement à gauche[ sur <b>${roadName}</b>]",
  "DIRECTION_7":"Tournez à gauche[ sur <b>${roadName}</b>]",
  "DIRECTION_8":"Tournez légèrement à gauche[ sur <b>${roadName}</b>]",
  "DIRECTION_10":"Direction <b>${compassDirection}</b>[ sur <b>${roadName}</b>]",
  "DIRECTION_11-1":"Au rond-point, prenez la première sortie[ sur <b>${roadName}</b>]",
  "DIRECTION_11-2":"Au rond-point, prenez la deuxième sortie[ sur <b>${roadName}</b>]",
  "DIRECTION_11-3":"Au rond-point, prenez la troisième sortie[ sur <b>${roadName}</b>]",
  "DIRECTION_11-4":"Au rond-point, prenez la quatrième sortie[ sur <b>${roadName}</b>]",
  "DIRECTION_11-5":"Au rond-point, prenez la cinquième sortie[ sur <b>${roadName}</b>]",
  "DIRECTION_11-6":"Au rond-point, prenez la sixième sortie[ sur <b>${roadName}</b>]",
  "DIRECTION_11-7":"Au rond-point, prenez la septième sortie[ sur <b>${roadName}</b>]",
  "DIRECTION_11-8":"Au rond-point, prenez la huitième sortie[ sur <b>${roadName}</b>]",
  "DIRECTION_11-9":"Au rond-point, prenez la neuvième sortie[ sur <b>${roadName}</b>]",
  "DIRECTION_11-x":"Au rond-point, prenez l’une des trop nombreuses sorties[ sur <b>${roadName}</b>]",
  "DIRECTION_15":"Vous êtes arrivé"
});
