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
 * @requires GeoExt/state/PermalinkProvider.js
 */

Ext.namespace("cgxp");

cgxp.PermalinkProvider = Ext.extend(GeoExt.state.PermalinkProvider, {

    /** api: method[getLink]
     *  :param base: ``String`` The base URL, optional.
     *  :return: ``String`` The permalink.
     *
     *  Override GeoExt PermalinkProvider to filter the parameters taken
     *  from the url so they dont collide with the state parameters
     */
    getLink: function(base) {
        base = base || document.location.href;

        var params = {};

        var id, k, state = this.state;
        for(id in state) {
            if(state.hasOwnProperty(id)) {
                for(k in state[id]) {
                    params[id + "_" + k] = this.encodeType ?
                        unescape(this.encodeValue(state[id][k])) : state[id][k];
                }
            }
        }

        // filtering out tree parameters from url
        var urlparams = OpenLayers.Util.getParameters(base);
        for (var i in urlparams) {
            if (i.indexOf('tree_') > -1) {
                delete urlparams[i];
            }
        }

        // merge params in the URL into the state params
        OpenLayers.Util.applyDefaults(params, urlparams);

        var paramsStr = OpenLayers.Util.getParameterString(params);

        var qMark = base.indexOf("?");
        if(qMark > 0) {
            base = base.substring(0, qMark);
        }

        return Ext.urlAppend(base, paramsStr);
    }

});

/** api: xtype = cgxp_mappanel */
Ext.reg('cgxp_permalinkprovider', cgxp.PermalinkProvider);