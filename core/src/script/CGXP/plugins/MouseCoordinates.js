/**
* Copyright (c) 2012 SITN, Canton et République de Neuchâtel, Camptocamp
*
* CGXP is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* CGXP is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with CGXP. If not, see <http://www.gnu.org/licenses/>.
*/

/**
 * @requires plugins/Tool.js
 * @include OpenLayers/Control/MousePosition.js
 */

/** api: (define)
 *  module = cgxp.plugins
 *  class = MouseCoordinates
 */
Ext.namespace("cgxp.plugins");

/** api: example
 *  Sample code showing how to add a MouseCoordinates plugin to a
 *  `gxp.Viewer`:
 *
 *  .. code-block:: javascript
 *
 *      new gxp.Viewer({
 *          ...
 *          tools: [{
 *              ptype: 'cgxp_mousecoordinates',
 *              actionTarget: 'center.bbar',
 *              controlConfig: {
 *                  numDigits: 6,
 *                  prefix: 'Lon: ',
 *                  separator: ', lat: ',
 *                  displayProjection: "EPSG:4326"
 *              }
 *          }]
 *          ...
 *      });
 */

/** api: constructor
 *  .. class:: MouseCoordinates(config)
 *
 *  Provides an action to show map coordinates in an Ext toolbar.
 */
cgxp.plugins.MouseCoordinates = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = cgxp_mousecoordinates */
    ptype: "cgxp_mousecoordinates",

    /** api: config[separator]
     *  ``String``
     *  Text shown between the coordinates (i18n).
     */
    separator: ", ",

    /** api: config[numDigits]
     *  ``Number``
     *  Number of digits shown after the decimal mark.
     */
    numDigits: 0,

    /** api: config[controlConfig]
     *  ``Object``
     *  Optional parameter containing an <OpenLayers.Control.MousePosition>
     *  config.
     */
    controlConfig: null,

    /** api: method[addActions]
     */
    addActions: function() {
        var statustext = new Ext.Toolbar.TextItem({
            cls: 'mouse-coordinates',
            listeners: {
                afterRender: function(cmp) {
                    var control = new OpenLayers.Control.MousePosition(Ext.apply({
                        div: cmp.getEl().dom,
                        numDigits: this.numDigits,
                        separator: this.separator
                    }, this.controlConfig));
                    this.target.mapPanel.map.addControl(control);
                },
                scope: this
            }
        });
        return cgxp.plugins.MouseCoordinates.superclass.addActions.apply(this, [statustext]);
    }
});

Ext.preg(cgxp.plugins.MouseCoordinates.prototype.ptype, cgxp.plugins.MouseCoordinates);
