/**
 * Copyright (c) 2011 Camptocamp
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
 *              ptype: 'cgxp_mapopacityslider'
 *          }]
 *          ...
 *      });
 */

/** api: constructor
 *  .. class:: MapOpacitySlider(config)
 *
 */   
cgxp.plugins.MapOpacitySlider = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = cgxp_mapopacityslider */
    ptype: "cgxp_mapopacityslider",

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

    /** private: method[createToolbar]
     *  Create the toolbar containing the opacity slider and
     *  the base layer combo.
     *
     *  :arg config: ``Object`` Some optional toolbar config.
     *  Returns:
     *  {Ext.Toolbar}
     */
    createToolbar: function(config) {
        return new cgxp.MapOpacitySlider(Ext.apply({
            cls: 'opacityToolbar',
            orthoRef: this.orthoRef,
            defaultBaseLayerRef: this.defaultBaseLayerRef,
            stateId: this.stateId,
            map: this.target.mapPanel.map
        }, config || {}));
    },

    /** public: method[addActions]
     *  :arg config: ``Object``
     */
    addActions: function(config) {
        // If actionTarget is not provided in the plugin's config,
        // it defaults to "map.tbar".
        if (this.actionTarget.substring(0, 4) == 'map.') {
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
            var container = {html: '<div id="baseLayersOpacitySlider"></div>'};
            this.target.addListener('ready', function() {
                this.createToolbar({renderTo: 'baseLayersOpacitySlider'});
            }, this);
            return cgxp.plugins.MapOpacitySlider.superclass.addActions.apply(this, [container]);
        }
    }
});

Ext.preg(cgxp.plugins.MapOpacitySlider.prototype.ptype, cgxp.plugins.MapOpacitySlider);
