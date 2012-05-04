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

/** api: constructor
 *  .. class:: MapOpacitySlider(config)
 *
 */   
cgxp.plugins.MapOpacitySlider = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = cgxp_mapopacityslider */
    ptype: "cgxp_mapopacityslider",

    /** api: config[orthoRef]
     *  ``String``
     *  Referance of the ortho layer.
     */
    orthoRef: 'ortho',

    /** api: config[defaultBaseLayerRef]
     *  ``String``
     *  Referance of the default base layer.
     */
    defaultBaseLayerRef: 'plan',

    /** api: config[stateId]
     * ``String``
     * Used for the permalink.
     */
    stateId: 'baselayer',

    /** public: method[addActions]
     *  :arg config: ``Object``
     */
    addActions: function(config) {
        this.target.addListener('ready', function() {
            var mapPanel = this.target.mapPanel;
            var map = mapPanel.map;
            var mapbar = new cgxp.MapOpacitySlider({
                cls: 'opacityToolbar',
                orthoRef: this.orthoRef,
                defaultBaseLayerRef: this.defaultBaseLayerRef,
                stateId: this.stateId,
                map: map
            });
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
    }
});

Ext.preg(cgxp.plugins.MapOpacitySlider.prototype.ptype, cgxp.plugins.MapOpacitySlider);
