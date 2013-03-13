/**
 * Copyright (c) 2012-2013 by Camptocamp SA
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

Ext.namespace("cgxp.plugins");

cgxp.plugins.ToolActivateMgr = (function() {
    var groups = {};

    function activateTool(tool) {
        if (!tool.autoActivate) {
            // deactivate all but "tool"
            var i, g = groups[tool.activateToggleGroup];
            for (i = 0; i < g.length; ++i) {
                if (g[i] != tool) {
                    g[i].deactivate();
                }
            }
        }
    }

    function deactivateTool(tool) {
        if (!tool.autoActivate) {
            // activate those that have "autoActivate" set
            var i, g = groups[tool.activateToggleGroup];
            for (i = 0; i < g.length; ++i) {
                if (g[i].autoActivate) {
                    g[i].activate();
                }
            }
        }
    }

    return {
        register: function(tool) {
            var g = groups[tool.activateToggleGroup];
            if (!g) {
                g = groups[tool.activateToggleGroup] = [];
            }
            g.push(tool);
            tool.on('activate', activateTool);
            tool.on('deactivate', deactivateTool);
        }
    };
})();
