/**
 * Copyright (c) 2011-2013 by Camptocamp SA
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
 * @include OpenLayers/Format/GeoJSON.js
 * @include GeoExt/data/FeatureStore.js
 * @include Ext/ux/form/TwinTriggerComboBox.js
 * @include CGXP/data/FeatureReader.js
 */

/** api: (define)
 *  module = cgxp.plugins
 *  class = FullTextSearch
 */

Ext.namespace("cgxp.plugins");

/** api: example
 *  Sample code showing how to add a FullTextSearch plugin to a
 *  `gxp.Viewer`:
 *
 *  .. code-block:: javascript
 *
 *      new gxp.Viewer({
 *          ...
 *          tools: [{
 *              ptype: "cgxp_fulltextsearch",
 *              url: "${request.route_url('fulltextsearch', path='')}",
 *              actionTarget: "center.tbar"
 *          }]
 *          ...
 *      });
 */

/** api: constructor
 *  .. class:: FullTextSearch(config)
 *
 *  Plugin to add a text search field.
 */
cgxp.plugins.FullTextSearch = Ext.extend(gxp.plugins.Tool, {

    /** api: ptype = cgxp_fulltextsearch */
    ptype: "cgxp_fulltextsearch",

    /** api: config[tooltipTitle]
     *  ``String`` Text for the tooltip title (i18n). Only applies if
     *  :attr:`tooltip` is ``true``.
     */
    tooltipTitle: "Search",

    /** api: config[emptyText]
     *  ``String`` Text to use when the field is empty (i18n).
     */
    emptyText: "Search...",

    /** api: config[loadingText]
     *  ``String`` Text to display while loading results (i18n).
     */
    loadingText: "Searching...",

    /** api: config[tooltip]
     *  ``Boolean`` Whether to display a tooltip above the search box.
     *  Default is ``true``.
     */
    tooltip: true,

    /** api: config[url]
     *  ``String`` URL of the text search service. Typically set to
     *  ``"${request.route_url('fulltextsearch', path='')}"``.
     */
    url: null,

    /** api: config[widgetOptions]
     *  ``Object``
     *  Additional slider options.
     */
    widgetOptions: {},

    init: function() {
        cgxp.plugins.FullTextSearch.superclass.init.apply(this, arguments);
        this.target.addListener('ready', function() {
            var mapPanel = this.target.mapPanel;
            this.fullTextSearch = new cgxp.FullTextSearch(Ext.apply({
                url: this.url,
                mapPanel: mapPanel
            }, this.widgetOptions));
        }, this);
    }
});

Ext.preg(cgxp.plugins.FullTextSearch.prototype.ptype, cgxp.plugins.FullTextSearch);
