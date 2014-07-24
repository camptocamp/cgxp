/**
 * Copyright (c) 2011-2014 by Camptocamp SA
 *
 * CGXP is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * CGXP is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with CGXP.  If not, see <http://www.gnu.org/licenses/>.
 */

/*
 * @requires plugins/Tool.js
 * @include CGXP/widgets/MapOpacitySlider.js
 */

/** api: (define)
 *  module = cgxp.plugins
 *  class = MapOpacitySlider
 */

Ext.namespace("cgxp.plugins");

/** api: example
 *  Sample code showing how to add a MapOpacitySlider plugin to a
 *  `gxp.Viewer`:
 *
 *  .. code-block:: javascript
 *
 *      new gxp.Viewer({
 *          ...
 *          tools: [{
 *              ptype: "cgxp_mapopacityslider",
 *              layerTreeId: "layertree",
 *              defaultBaseLayerRef: "plan"
 *          }]
 *          ...
 *      });
 */

/** api: constructor
 *  .. class:: MapOpacitySlider(config)
 */
cgxp.plugins.MapOpacitySlider = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = cgxp_mapopacityslider */
    ptype: "cgxp_mapopacityslider",

    /** api: config[actionTarget]
     *  ``Object`` or ``String`` or ``Array`` Where to place the tool's actions
     *  (e.g. buttons or menus)?
     *  As opposed to CGXP.plugins.Tool, we don't want it to be set by default
     *  to the mapPanel top toolbar.
     */
    actionTarget: null,

    /** api: config[orthoRef]
     *  ``String``
     *  Reference to the ortho layer. If set to null or empty, no ortho layer
     *  will be added and the opacity slider will not be displayed.
     *  Default is "ortho".
     */
    orthoRef: 'ortho',

    /** api: config[defaultBaseLayerRef]
     *  ``String``
     *  Reference to the default base layer. Default is "plan".
     */
    defaultBaseLayerRef: 'plan',

    /** api: config[stateId]
     *  ``String``
     *  Used for the permalink. Default is "baselayer".
     */
    stateId: 'baselayer',

    /** api: config[layerTreeId]
     *  ``String``
     *  Reference to the layertree plugin, used for instance to change
     *  the basemap depending on the loaded theme.
     */
    layerTreeId: null,

    /** private: property[toolbar]
     *  ``Ext.Toolbar``
     *  The MapOpacitySlider widget.
     */
    toolbar: null,

    /** private: property[initialTheme]
     *  ``Object``
     *  Used to save the loaded theme when the MapOpacitySlider widget is not
     *  available yet.
     */
    initialTheme: null,

    /** private: method[init]
     */
    init: function() {
        cgxp.plugins.MapOpacitySlider.superclass.init.apply(this, arguments);
        this.target.on('ready', this.viewerReady, this);
    },  

    /** private: method[viewerReady]
     */
    viewerReady: function() {
        if (this.layerTreeId) {
            var layertree = this.target.tools[this.layerTreeId].tree;
            layertree.on('loadtheme', this.detectInitialTheme, this);
        }
    },

    /** private: method[detectInitialTheme]
     */
    detectInitialTheme: function(theme) {
        // save loaded theme if the MapOpacitySlider is not created yet
        if (!this.toolbar) {
            this.initialTheme = theme;
        }
    },

    /** private: method[createToolbar]
     *  Create the toolbar containing the opacity slider and
     *  the base layer combo.
     *
     *  :arg config: ``Object`` Some optional toolbar config.
     *  Returns:
     *  {Ext.Toolbar}
     */
    createToolbar: function(config) {
        this.toolbar = new cgxp.MapOpacitySlider(Ext.apply({
            cls: 'opacityToolbar',
            orthoRef: this.orthoRef,
            defaultBaseLayerRef: this.defaultBaseLayerRef,
            stateId: this.stateId,
            initialTheme: this.initialTheme,
            layertree: this.layerTreeId ?
                       this.target.tools[this.layerTreeId].tree : null,
            map: this.target.mapPanel.map
        }, config || {}));
        return this.toolbar;
    },

    /** public: method[addActions]
     *  :arg config: ``Object``
     */
    addActions: function(config) {
        if (!this.actionTarget) {
            this.target.addListener('ready', function() {
                var mapPanel = this.target.mapPanel;
                var mapbar = this.createToolbar();
                var container = Ext.DomHelper.append(mapPanel.bwrap, {
                    tag: 'div',
                    cls: 'baseLayersOpacitySlider'
                }, true /* returnElement */);
                mapbar.render(container);
                mapbar.doLayout();
                var totalWidth = 0;
                mapbar.items.each(function(item) {
                    totalWidth += item.getWidth() + 5;
                });
                container.setWidth(totalWidth);
                container.setStyle({'marginLeft': (-totalWidth / 2) + 'px'});
            }, this);
        } else {
            var containerId = Ext.id();
            var container = new Ext.Container({
                id: containerId,
                cls: 'baseLayersOpacitySlider-toolbar'
            });
            this.target.addListener('ready', function() {
                this.createToolbar({renderTo: containerId});
            }, this);
            return cgxp.plugins.MapOpacitySlider.superclass.addActions.apply(this, [container]);
        }
    }
});

Ext.preg(cgxp.plugins.MapOpacitySlider.prototype.ptype, cgxp.plugins.MapOpacitySlider);
