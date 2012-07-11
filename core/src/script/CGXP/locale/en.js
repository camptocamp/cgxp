/*
 * @requires GeoExt/Lang.js
 */

GeoExt.Lang.add("en", {
    
    "cgxp.plugins.AddKMLFile.prototype": {
        buttonText: "Add KML File",
        waitMsgText: "Loading..."
    },

    "cgxp.plugins.Measure.prototype": {
        pointMenuText: "Point",
        pointTooltip: "Measure point",
        lengthMenuText: "Length",
        areaMenuText: "Area",
        lengthTooltip: "Measure length",
        areaTooltip: "Measure area",
        measureTooltip: "Measure"
    },

    "cgxp.plugins.FullTextSearch.prototype": {
        tooltipTitle: "Search",
        emptyText: "Search...",
        loadingText: "Searching..."
    },
    
    "cgxp.plugins.ThemeFinder.prototype": {
        emptyText: "Find a theme or a layer"
    },

    "cgxp.plugins.ThemeSelector.prototype": {
        localTitle: "Local layers",
        externalTitle: "External layers",
        toolTitle: "Themes"
    },
    
    "cgxp.plugins.Permalink.prototype": {
        toolTitle: "Permalink",
        windowTitle: "Permalink",
        openlinkText: "Open Link",
        closeText: "Close"
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
        exportpngbuttonText: "Export in PNG",
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

    "cgxp.plugins.Help.prototype": {
        helpactiontooltipText: "Help"
    },

    "cgxp.plugins.Redlining.prototype": {
        redliningText: "Redlining"
    },

    "cgxp.MapOpacitySlider.prototype": {
        orthoText: "Orthophoto"
    },

    "cgxp.plugins.Legend.prototype": {
        legendbuttonText: "Legend",
        legendbuttonTooltip: "Display the map legend",
        legendwindowTitle: "Legend"
    },

    "cgxp.plugins.ScaleChooser.prototype": {
        labelText: "Zoom to: "
    },

    "cgxp.plugins.Editing.prototype": {
        helpText: "Click on the map to <b>edit existing features</b>, or",
        layerMenuText: "Choose a layer",
        createBtnText: "Create a new feature",
        forbiddenText: "You are not allowed to do this action!"
    },

    "cgxp.tree.LayerTree.prototype": {
        moveupText: "Raise",
        movedownText: "Move down",
        moreinfoText: "More information",
        deleteText: "Remove layer",
        opacityText: "Modify layer opacity",
        zoomtoscaleText: "This layer is not visible at this zoom level.",
        opacitylabelText: "Opacity",
        showhidelegendText: "Show/hide legend",
        themealreadyloadedText: "This theme is already loaded."
    },

    "cgxp.plugins.FeaturesWindow.prototype": {
        windowTitleText: 'Results',
        itemsText: "items",
        itemText: "item"
    },

    "cgxp.plugins.Profile.prototype": {
        helpText: "<h1>Elevation profile</h1>Draw a line on the map. Double-click to terminate and show the profile.",
        waitMsgText: "Loading elevation profile...",
        xLabelText: "Distance (m)",
        yLabelText: "Elevation (m)",
        errorMsg: "An error occured. Please try again."
    }
});

OpenLayers.Util.extend(OpenLayers.Lang.en, {
    "layertree": "Layer tree",
    "querier": "Querier",

    "Tools.maxextentactiontooltip": "Go back to initial extent", //deprecated?
    "Tools.measurelengthactiontooltip": "Measure a length", //deprecated?
    "Tools.measureareaactiontooltip": "Measure an area", //deprecated?
    "Tools.measurepositionactiontooltip": "Get point coordinates", //deprecated?

    // toolbar
    "Locator.easting": "Easting:", //deprecated?
    "Locator.northing": "Northing:", //deprecated?

    "Query.countertext": "Element {0} of {1}",
    "Query.actiontooltip": "Query the map",
    "Query.nolayerselectedmsg": "No layer selected"
});
