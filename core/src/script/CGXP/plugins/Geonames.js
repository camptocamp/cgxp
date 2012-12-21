/**
 * Copyright (c) 2012 Camptocamp
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
 * @requires plugins/Tool.js
 * @include OpenLayers/BaseTypes/LonLat.js
 * @include OpenLayers/Projection.js
 */

/** api: (define)
 *  module = cgxp.plugins
 *  class = Geonames
 */

Ext.namespace("cgxp.plugins");

/** api: example
 *  Sample code showing how to add a Geonames plugin to a
 *  `gxp.Viewer`:
 *
 *  .. code-block:: javascript
 *
 *      new gxp.Viewer({
 *          ...
 *          tools: [{
 *              ptype: "cgxp_geonames",
 *              actionTarget: "center.tbar",
 *              actionConfig: {
 *                  width: 100
 *              },
 *              recenterZoom: 12
 *          }]
 *          ...
 *      });
 */

/** api: constructor
 *  .. class:: Geonames(config)
 *
 *  Plugin to add a search field based on the geonames.org service.
 *  See http://www.geonames.org/export/geonames-search.html
 */
cgxp.plugins.Geonames = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = cgxp_geonames */
    ptype: "cgxp_geonames",

    /** api: config[url]
     *  ``String``
     *  URL of the geonames search service.
     */
    url: "http://ws.geonames.org/searchJSON?",

    /** api: config[recenterZoom]
     *  ``Integer``
     *  Zoomlevel used when recentering on a result.
     */
    recenterZoom: 14,

    /** api: config[emptyText]
     *  ``String``
     *  Text displayed by default in the ComboBox (i18n).
     */
    emptyText: "Recenter on...",

    /** api: config[emptyText]
     *  ``String``
     *  Text displayed when the search is triggered (i18n).
     */
    loadingText: "Searching...",

    /** api: config[actionConfig]
     *  ``Object``
     *  Optional configuration of the ComboBox.
     */
    actionConfig: null,

    /** private: method[createStore]
     */
    createStore: function() {
        var store = new Ext.data.Store({
            proxy: new Ext.data.ScriptTagProxy({
                url: this.url,
                method: "GET"
            }),
            baseParams: {
                maxRows: 20
            },
            reader: new Ext.data.JsonReader({
                idProperty: "geonameId",
                root: "geonames",
                totalProperty: "totalResultsCount",
                fields: [
                    { name: "geonameId" },
                    { name: "countryName" },
                    { name: "lng" },
                    { name: "lat" },
                    { name: "name" },
                    { name: "fcodeName" }
                ]
            })
        });
        return store;
    },

    /** private: method[addActions]
     */
    addActions: function() {
        var combo = new Ext.form.ComboBox(Ext.apply({
            minChars: 2,
            queryDelay: 50,
            hideTrigger: true,
            displayField: "name",
            forceSelection: true,
            emptyText: this.emptyText,
            loadingText: this.loadingText,
            queryParam: "name_startsWith",
            tpl: '<tpl for="."><div class="x-combo-list-item"><h1>{name}<br></h1>{countryName}</div></tpl>',
            store: this.createStore(),
            width: 200
        }, this.actionConfig));
        combo.on("select", function(combo, record, index) {
            var map = this.target.mapPanel.map;
            var position = new OpenLayers.LonLat(record.data.lng, record.data.lat);
            position.transform(new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject());
            map.setCenter(position, this.recenterZoom);
        }, this);
        return cgxp.plugins.Geonames.superclass.addActions.apply(this, [combo]);
    }
});

Ext.preg(cgxp.plugins.Geonames.prototype.ptype, cgxp.plugins.Geonames);
