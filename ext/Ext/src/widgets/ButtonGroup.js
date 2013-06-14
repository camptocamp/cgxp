/*
This file is part of Ext JS 3.4

Copyright (c) 2011-2013 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as
published by the Free Software Foundation and appearing in the file LICENSE included in the
packaging of this file.

Please review the following information to ensure the GNU General Public License version 3.0
requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department
at http://www.sencha.com/contact.

Build date: 2013-04-03 15:07:25
*/
/**
 * @class Ext.ButtonGroup
 * @extends Ext.Panel
 * Container for a group of buttons. Example usage:
 * <pre><code>
var p = new Ext.Panel({
    title: 'Panel with Button Group',
    width: 300,
    height:200,
    renderTo: document.body,
    html: 'whatever',
    tbar: [{
        xtype: 'buttongroup',
        {@link #columns}: 3,
        title: 'Clipboard',
        items: [{
            text: 'Paste',
            scale: 'large',
            rowspan: 3, iconCls: 'add',
            iconAlign: 'top',
            cls: 'x-btn-as-arrow'
        },{
            xtype:'splitbutton',
            text: 'Menu Button',
            scale: 'large',
            rowspan: 3,
            iconCls: 'add',
            iconAlign: 'top',
            arrowAlign:'bottom',
            menu: [{text: 'Menu Item 1'}]
        },{
            xtype:'splitbutton', text: 'Cut', iconCls: 'add16', menu: [{text: 'Cut Menu Item'}]
        },{
            text: 'Copy', iconCls: 'add16'
        },{
            text: 'Format', iconCls: 'add16'
        }]
    }]
});
 * </code></pre>
 * @constructor
 * Create a new ButtonGroup.
 * @param {Object} config The config object
 * @xtype buttongroup
 */
Ext.ButtonGroup = Ext.extend(Ext.Panel, {
    /**
     * @cfg {Number} columns The <tt>columns</tt> configuration property passed to the
     * {@link #layout configured layout manager}. See {@link Ext.layout.TableLayout#columns}.
     */
    /**
     * @cfg {String} baseCls  Defaults to <tt>'x-btn-group'</tt>.  See {@link Ext.Panel#baseCls}.
     */
    baseCls: 'x-btn-group',
    /**
     * @cfg {String} layout  Defaults to <tt>'table'</tt>.  See {@link Ext.Container#layout}.
     */
    layout:'table',
    defaultType: 'button',
    /**
     * @cfg {Boolean} frame  Defaults to <tt>true</tt>.  See {@link Ext.Panel#frame}.
     */
    frame: true,
    internalDefaults: {removeMode: 'container', hideParent: true},

    initComponent : function(){
        this.layoutConfig = this.layoutConfig || {};
        Ext.applyIf(this.layoutConfig, {
            columns : this.columns
        });
        if(!this.title){
            this.addClass('x-btn-group-notitle');
        }
        this.on('afterlayout', this.onAfterLayout, this);
        Ext.ButtonGroup.superclass.initComponent.call(this);
    },

    applyDefaults : function(c){
        c = Ext.ButtonGroup.superclass.applyDefaults.call(this, c);
        var d = this.internalDefaults;
        if(c.events){
            Ext.applyIf(c.initialConfig, d);
            Ext.apply(c, d);
        }else{
            Ext.applyIf(c, d);
        }
        return c;
    },

    onAfterLayout : function(){
        var bodyWidth = this.body.getFrameWidth('lr') + this.body.dom.firstChild.offsetWidth;
        this.body.setWidth(bodyWidth);
        this.el.setWidth(bodyWidth + this.getFrameWidth());
    }
    /**
     * @cfg {Array} tools  @hide
     */
});

Ext.reg('buttongroup', Ext.ButtonGroup);
