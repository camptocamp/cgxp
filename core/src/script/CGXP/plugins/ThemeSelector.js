/**
 * @requires plugins/Tool.js
 */

/** api: (define)
 *  module = cgxp.plugins
 *  class = ThemeSelector
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("cgxp.plugins");

/** api: constructor
 *  .. class:: ThemeSelector(config)
 *
 */   
cgxp.plugins.ThemeSelector = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = cgxp_themeselector */
    ptype: "cgxp_themeselector",
    
    addOutput: function(config) {
        var themeSelector = cgxp.plugins.ThemeSelector.superclass.addOutput.call(this, config);
        return themeSelector;
    }

});

Ext.preg(cgxp.plugins.ThemeSelector.prototype.ptype, cgxp.plugins.ThemeSelector);
