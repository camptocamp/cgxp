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

Ext.namespace("cgxp.data");

/**
 * @requires GeoExt/data/FeatureReader.js
 */

/**
 * Class: cgxp.data.FeatureReader
 * A FeatureReader that can be configured with a format.
 *
 * TODO: this code should be in GeoExt.
 */
cgxp.data.FeatureReader = Ext.extend(GeoExt.data.FeatureReader, {
    readRecords: function(features) {
        if (this.meta.format) {
            features = this.meta.format.read(features);
        }
        return GeoExt.data.FeatureReader.prototype.readRecords.call(
            this, features
        );
    }
});
