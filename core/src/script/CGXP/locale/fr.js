GeoExt.Lang.add("fr", {
    "cgxp.plugins.Measure.prototype": {
        pointMenuText: "Point",
        pointTooltip: "Mesure de point",
        lengthMenuText: "Longueur",
        areaMenuText: "Surface",
        lengthTooltip: "Mesure de longueur",
        areaTooltip: "Mesure de surface",
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
        closeText: "Fermer"
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
        dpifieldText: "Résolution",
        scalefieldText: "Échelle",
        rotationfieldText: "Rotation",
        printbuttonText: "Imprimer",
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
        buttonText: "Connexion",
        usernameText: "Nom d'utilisateur",
        passwordText: "Mot de passe"
    },

    "cgxp.plugins.Help.prototype": {
        helpactiontooltipText: "Aide"
    },

    "cgxp.plugins.Redlining.prototype": {
        buttonText: "Surlignage"
    },

    "cgxp.plugins.MapOpacitySlider.prototype": {
        orthoText: "Orthophoto"
    },

    "cgxp.plugins.Legend.prototype": {
        buttonText: "Légende",
        tooltipText: "Afficher la légende de la carte",
        titleText: "Légende"
    },

    "cgxp.plugins.ScaleChooser.prototype": {
        labelText: "Échelle : "
    },

    "cgxp.tree.LayerTree.prototype": {
        moveupText: "Monter",
        movedownText: "Descendre",
        moreinfoText: "Plus d'informations",
        deleteText: "Supprimer la couche",
        opacityText: "Modifier l'opacité de la couche",
        zoomtoscaleText: "Cette couche n'est pas visible à ce niveau de zoom.",
        opacitylabelText: "Opacité",
        showhidelegendText: "Afficher/masquer la légende"
    }
});

OpenLayers.Util.extend(OpenLayers.Lang.fr, {
    "layertree": "Thèmes",
    "querier": "Requêteur",

    // query builder
    "QueryBuilder.loading": "Chargement...",
    "QueryBuilder.incomplete_form": "Formulaire incomplet.",
    "QueryBuilder.no_result": "Pas de résultat.",
    "QueryBuilder.query_btn_text": "Effectuer la requête",
    "QueryBuilder.alert_no_geom_field": "Pas de résultat trouvé",
    "QueryBuilder.describefeaturetype_exception": "Une erreur est survenue.",
    "QueryBuilder.getfeature_exception": "Une erreur est survenue.",
    "QueryBuilder.match": "Correspond à",
    "QueryBuilder.of": "avec :",
     
    "Tools.maxextentactiontooltip": "Aller à la couverture initiale", //deprecated?
    "Tools.measurelengthactiontooltip": "Mesure une distance", //deprecated?
    "Tools.measureareaactiontooltip": "Mesure une surface", //deprecated?
    "Tools.measurepositionactiontooltip": "Obtenir les coordonnées d'un point", //deprecated?

    // toolbar
    "Locator.easting": "Abscisse :", //deprecated?
    "Locator.northing": "Ordonnée :", //deprecated?

    "Query.countertext": "Élément {0} sur {1}",
    "Query.actiontooltip": "Questionne la carte",
    "Query.nolayerselectedmsg": "Pas de couche sélectionnée"
});
