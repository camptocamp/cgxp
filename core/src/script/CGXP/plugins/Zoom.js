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

/**
 * @requires plugins/Zoom.js
 * @include GeoExt/widgets/Action.js
 */

/** api: (define)
 *  module = cgxp.plugins
 *  class = Zoom
 */

/** api: (extends)
 *  plugins/Zoom.js
 */
Ext.namespace("cgxp.plugins");

/** api: constructor
 *  .. class:: Zoom(config)
 *
 *    Provides two actions for zooming in and out.
 */
cgxp.plugins.Zoom = Ext.extend(gxp.plugins.Zoom, {

    /** api: ptype = cgxp_zoom */
    ptype: "cgxp_zoom",

    /** api: config[toggleGroup]
     *  The group theses toggle buttons are members of.
     */
    toggleGroup: null,

    /** api: method[addActions]
     */
    addActions: function() {
        var actions = [new GeoExt.Action({
            menuText: this.zoomInMenuText,
            iconCls: "gxp-icon-zoom-in",
            tooltip: this.zoomInTooltip,
            control: new OpenLayers.Control.ZoomBox(),
            map: this.target.mapPanel.map,
            enableToggle: true,
            toggleGroup: this.toggleGroup,
            allowDepress: true
        }), {
            menuText: this.zoomOutMenuText,
            iconCls: "gxp-icon-zoom-out",
            tooltip: this.zoomOutTooltip,
            handler: function() {
                this.target.mapPanel.map.zoomOut();
            },
            scope: this
        }];
        return gxp.plugins.Zoom.superclass.addActions.apply(this, [actions]);
    }
});

Ext.preg(cgxp.plugins.Zoom.prototype.ptype, cgxp.plugins.Zoom);
