/*
 * Copyright (c) <2011> <Ryan Petrello>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

Ext.namespace('Ext.ux');

Ext.ux.ColorField = Ext.extend(Ext.form.TriggerField, {

    /** private: attribute[menu]
     * ``Ext.ux.ColorMenu``
     */
    menu: null,

    invalidText: "Colors must be in a the hex format #FFFFFF.",
    regex: /^\#[0-9A-F]{6}$/i,
    allowBlank: false,

    initComponent: function() {
        Ext.ux.ColorField.superclass.initComponent.call(this);
        this.addEvents('select');
        this.on('change', function(c, v) {
            this.onSelect(c, v);
        }, this);
    },

    // private
    onDestroy: function() {
        Ext.destroy(this.menu);
        Ext.ux.ColorField.superclass.onDestroy.call(this);
    },

    // private
    afterRender: function() {
        Ext.ux.ColorField.superclass.afterRender.call(this);
        this.el.setStyle('background', this.value);
        this.detectFontColor();
    },

    /**
     * @method onTriggerClick
     * @hide
     */
    // private
    onTriggerClick: function() {
        if (this.disabled) {
            return;
        }
        if (this.menu === null) {
            this.menu = new Ext.ux.ColorMenu({
                hideOnClick: true
            });
        }
        this.onFocus();
        this.menu.show(this.el, "tl-bl?");
        this.menuEvents('on');
    },

    //private
    menuEvents: function(method) {
        this.menu[method]('select', this.onSelect, this);
        this.menu[method]('hide', this.onMenuHide, this);
        this.menu[method]('show', this.onFocus, this);
    },

    onSelect: function(m, d) {
        this.setValue(d);
        this.fireEvent('select', this, d);
        this.el.setStyle('background', d);
        this.detectFontColor();
    },

    // private
    // Detects whether the font color should be white or black, according to the
    // current color of the background
    detectFontColor: function() {
        var value;
        if (!this.menu || !this.menu.picker.rawValue) {
            if (!this.value) {
                value = 'FFFFFF';
            } else {
                var h2d = function(d) {
                    return parseInt(d, 16);
                };
                value = [
                    h2d(this.value.slice(1, 3)),
                    h2d(this.value.slice(3, 5)),
                    h2d(this.value.slice(5))
                ];
            }
        } else {
            value = this.menu.picker.rawValue;
        }
        var avg = (value[0] + value[1] + value[2]) / 3;
        this.el.setStyle('color', (avg > 128) ? '#000' : '#FFF');
    },

    onMenuHide: function() {
        this.focus(false, 60);
        this.menuEvents('un');
    }
});

Ext.ux.ColorMenu = Ext.extend(Ext.menu.Menu, {

   enableScrolling: false,

   initComponent: function() {
       Ext.apply(this, {
           plain: true,
           showSeparator: false,
           items: this.picker = new Ext.ux.ColorPicker(Ext.apply({
               internalRender: this.strict || !Ext.isIE
           }, this.initialConfig))
       });
       this.picker.purgeListeners();
       Ext.ux.ColorMenu.superclass.initComponent.call(this);
       this.relayEvents(this.picker, ["select"]);
       this.on('select', this.menuHide, this);
       if (this.handler) {
           this.on('select', this.handler, this.scope || this);
       }
   },

   menuHide: function() {
       if (this.hideOnClick) {
           this.hide(true);
       }
   },

   doLayout: function(shallow, force) {
       Ext.ux.ColorMenu.superclass.doLayout.call(this, shallow, force);
       this.getEl().setZIndex(30000);
   }

});

Ext.ux.ColorPicker = function(config) {
    Ext.ux.ColorPicker.superclass.constructor.call(this, config);
    this.addEvents(
        /**
         * @event select
         * Fires when a color is selected
         * @param {ColorPalette} this
         * @param {String} color The 6-digit color hex code (without the # symbol)
         */
        'select'
    );

    if (this.handler) {
        this.on("select", this.handler, this.scope, true);
    }
};

Ext.extend(Ext.ux.ColorPicker, Ext.ColorPalette, {

    select: function(e, t) {
        this.value = e;
        Ext.ux.ColorPicker.superclass.select.call(this, e);
        this.fireEvent('select', this, '#' + this.value);
    },

    getValue: function() {
        return this.value;
    },

    setValue: function(v) {
        this.value = v;
    }
});
Ext.reg('colorfield', Ext.ux.ColorField);
