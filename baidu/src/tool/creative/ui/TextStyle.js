/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 文字样式控件
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var lib = require('esui/lib');
        var helper = require('esui/controlHelper');
        var InputControl = require('esui/InputControl');
        var u = require('underscore');
        var ui = require('esui');
        require('ui/CheckButton');
        require('ui/ColorPicker');
        require('ui/PaletteDialog');
        require('esui/Select');

        var DEFAULT_COLOR = '000000';

        /**
         * 文字样式控件
         *
         * @param {Object=} options 初始化参数
         * @extends esui/InputControl
         * @constructor
         * @public
         */
        function TextStyle(options) {
            InputControl.apply(this, arguments);
        }

        TextStyle.prototype.type = 'TextStyle';

        /**
         * 初始化参数
         *
         * @param {Object=} options 构造函数传入的参数
         * @override
         * @protected
         */
        TextStyle.prototype.initOptions = function (options) {
            var properties = {
                components: ['bold', 'italic', 'underline', 'size', 'color']
            };
            lib.extend(properties, options);

            if (this.main.nodeName.toLowerCase() === 'input') {
                if (!properties.name) {
                    properties.name = this.main.name;
                }

                if (!properties.value) {
                    properties.value = this.main.value;
                }
            }

            if (typeof properties.components === 'string') {
                properties.components = u.map(
                    properties.components.split(','), lib.trim);
            }

            this.setProperties(properties);
        };

        // 文字大小的数据要给定，因为是业务控件，就在这写死算了，
        // 如果需要扩展性，应该移到`defaultProperties`里去
        var fontSizes = [8, 10, 12, 14, 16, 18, 20, 24];
        fontSizes = u.map(
            fontSizes,
            function (item) {
                return { text: item + 'px', value: item };
            }
        );

        /**
         * 同步颜色
         *
         * @param {Object} e 事件对象
         */
        function syncColor(e) {
            var color = e.target.getRawValue();
            var label = lib.g(helper.getId(this, 'color-value'));
            label.style.backgroundColor = '#' + color;
        }

        function enterAdvancedColorMode() {
            var properties = {
                main: document.createElement('div'),
                value: this.getRawValue().color,
                viewContext: this.viewContext
            };
            document.body.appendChild(properties.main);
            var dialog = ui.create('PaletteDialog', properties);

            var close = function (e) {
                e.target.dispose();
            };
            var sync = function (e) {
                this.set('color', e.color);
                e.target.dispose();
            };

            dialog.on('submit', u.bind(sync, this));
            dialog.on('cancel', u.bind(close, this));
            dialog.render();
            dialog.show();
        }

        /**
         * 初始化DOM结构
         *
         * @override
         * @protected
         */
        TextStyle.prototype.initStructure = function () {
            if (this.main.nodeName.toLowerCase() === 'input') {
                helper.replaceMain(this);
            }

            var colorId = helper.getId(this, 'color');
            var colorClasses = helper.getPartClasses(this, 'color').join(' ');
            var html = [
                '<input type="checkbox" data-ui-type="CheckButton" ',
                    'data-ui-child-name="bold" data-ui-skin="bold" ',
                    'title="粗体" value="bold" ',
                '/>',
                '<input type="checkbox" data-ui-type="CheckButton" ',
                    'data-ui-child-name="italic" data-ui-skin="italic" ',
                    'title="粗体" value="italic" ',
                '/>',
                '<input type="checkbox" data-ui-type="CheckButton" ',
                    'data-ui-child-name="underline" data-ui-skin="underline" ',
                    'title="粗体" value="underline" ',
                '/>',
                '<div data-ui-type="Select" data-ui-child-name="size" ',
                    'data-ui-skin="font-size">',
                '</div>',
                '<div data-ui-type="ColorPicker" data-ui-child-name="color">',
                '</div>',
                '<div id="' + colorId + '" class="' + colorClasses + '">',
                    '<span id="' + helper.getId(this, 'color-value') + '">',
                    '</span>',
                '</div>'
            ];

            this.main.innerHTML = html.join('');
            this.initChildren();

            var fireChangeEvent = function () {
                this.fire('change');
            };
            fireChangeEvent = lib.bind(fireChangeEvent, this);

            var bold = this.getChild('bold');
            var italic = this.getChild('italic');
            var underline = this.getChild('underline');
            var fontSizeSelect = this.getChild('size');
            var colorPicker = this.getChild('color');

            bold.on('change', fireChangeEvent);
            italic.on('change', fireChangeEvent);
            underline.on('change', fireChangeEvent);

            fontSizeSelect.on('change', fireChangeEvent);
            fontSizeSelect.set('datasource', fontSizes);

            colorPicker.on('change', u.bind(syncColor, this));
            colorPicker.on('change', fireChangeEvent);
            colorPicker.on('more', u.bind(enterAdvancedColorMode, this));

            var components = {};
            for (var i = 0; i < this.components.length; i++) {
                components[this.components[i]] = true;
            }

            if (!components.hasOwnProperty('bold')) {
                bold.disable();
                bold.hide();
            }
            if (!components.hasOwnProperty('italic')) {
                italic.disable();
                italic.hide();
            }
            if (!components.hasOwnProperty('underline')) {
                underline.disable();
                underline.hide();
            }
            if (!components.hasOwnProperty('size')) {
                fontSizeSelect.disable();
                fontSizeSelect.hide();
            }
            if (!components.hasOwnProperty('color')) {
                colorPicker.disable();
                colorPicker.hide();
                lib.g(colorId).style.display = 'none';
            }
        };

        /**
         * 渲染自身
         *
         * @override
         * @protected
         */
        TextStyle.prototype.repaint = helper.createRepaint(
            InputControl.prototype.repaint,
            {
                name: 'rawValue',
                paint: function (textStyle, rawValue) {
                    // `TextStyle`的`rawValue`是一个对象，包含以下属性：
                    // 
                    // - `{boolean} bold`：是否粗体
                    // - `{boolean} italic`：是否斜体
                    // - `{boolean} underline`：是否带下划线
                    // - `{number} size`：字体大小
                    // - `{string} color`：字体颜色

                    var boldButton = textStyle.getChild('bold');
                    var italicButton = textStyle.getChild('italic');
                    var underlineButton = textStyle.getChild('underline');
                    var sizeSelect = textStyle.getChild('size');
                    var colorPicker = textStyle.getChild('color');

                    if (rawValue) {
                        if (!boldButton.isDisabled()) {
                            boldButton.setChecked(!!rawValue.bold);
                        }
                        if (!italicButton.isDisabled()) {
                            italicButton.setChecked(!!rawValue.italic);
                        }
                        if (!underlineButton.isDisabled()) {
                            underlineButton.setChecked(!!rawValue.underline);
                        }
                        if (!sizeSelect.isDisabled()) {
                            if (rawValue.size) {
                                sizeSelect.setRawValue(rawValue.size);
                            }
                            else {
                                sizeSelect.set('selectedIndex', 0);
                            }
                        }
                        if (!colorPicker.isDisabled()) {
                            if (rawValue.color) {
                                colorPicker.setRawValue(rawValue.color);
                            }
                            else {
                                colorPicker.setRawValue(DEFAULT_COLOR);
                            }
                        }
                    }
                    else {
                        if (!boldButton.isDisabled()) {
                            boldButton.setChecked(false);
                        }
                        if (!italicButton.isDisabled()) {
                            italicButton.setChecked(false);
                        }
                        if (!underlineButton.isDisabled()) {
                            underlineButton.setChecked(false);
                        }
                        if (!sizeSelect.isDisabled()) {
                            sizeSelect.set('selectedIndex', 0);
                        }
                        if (!colorPicker.isDisabled()) {
                            colorPicker.setRawValue(DEFAULT_COLOR);
                        }
                    }
                }
            },
            {
                name: 'bold',
                paint: function (textStyle, bold) {
                    if (bold == null) {
                        return;
                    }

                    var boldButton = textStyle.getChild('bold');

                    if (boldButton.isDisabled()) {
                        return;
                    }

                    bold = !!bold;

                    if (textStyle.rawValue) {
                        textStyle.rawValue.bold = bold;
                    }

                    boldButton.setChecked(bold);
                }
            },
            {
                name: 'italic',
                paint: function (textStyle, italic) {
                    if (italic == null) {
                        return;
                    }

                    var italicButton = textStyle.getChild('italic');

                    if (italicButton.isDisabled()) {
                        return;
                    }
                    
                    italic = !!italic;

                    if (textStyle.rawValue) {
                        textStyle.rawValue.italic = italic;
                    }

                    italicButton.setChecked(italic);
                }
            },
            {
                name: 'underline',
                paint: function (textStyle, underline) {
                    if (underline == null) {
                        return;
                    }

                    var underlineButton = textStyle.getChild('underline');

                    if (underlineButton.isDisabled()) {
                        return;
                    }
                    
                    underline = !!underline;

                    if (textStyle.rawValue) {
                        textStyle.rawValue.underline = underline;
                    }

                    underlineButton.setChecked(underline);
                }
            },
            {
                name: 'size',
                paint: function (textStyle, size) {
                    if (size == null) {
                        return;
                    }

                    var sizeSelect = textStyle.getChild('size');

                    if (sizeSelect.isDisabled()) {
                        return;
                    }
                    
                    size = +size;

                    if (textStyle.rawValue) {
                        textStyle.rawValue.size = size;
                    }

                    sizeSelect.setRawValue(size);
                }
            },
            {
                name: 'color',
                paint: function (textStyle, color) {
                    if (color == null) {
                        return;
                    }

                    var colorPicker = textStyle.getChild('color');

                    if (colorPicker.isDisabled()) {
                        return;
                    }

                    if (textStyle.rawValue) {
                        textStyle.rawValue.color = color;
                    }

                    colorPicker.setRawValue(color);
                }
            }
        );

        /**
         * 获取控件原始值
         *
         * @return {Object} 包含`bold`、`italic`、`underline`、`size`、`color`
         * @override
         */
        TextStyle.prototype.getRawValue = function () {
            if (!helper.isInStage(this, 'RENDERED')) {
                return this.rawValue;
            }

            var boldButton = this.getChild('bold');
            var italicButton = this.getChild('italic');
            var underlineButton = this.getChild('underline');
            var sizeSelect = this.getChild('size');
            var colorPicker = this.getChild('color');

            var value = {};

            if (!boldButton.isDisabled()) {
                value.bold = boldButton.isChecked();
            }
            if (!italicButton.isDisabled()) {
                value.italic = italicButton.isChecked();
            }
            if (!underlineButton.isDisabled()) {
                value.underline = underlineButton.isChecked();
            }
            if (!sizeSelect.isDisabled()) {
                value.size = sizeSelect.getRawValue();
            }
            if (!colorPicker.isDisabled()) {
                value.color = colorPicker.getRawValue();
            }

            return value;
        };

        /**
         * 获取用于更新时比较的原始值
         *
         * @return {Object}
         */
        TextStyle.prototype.getRawValueProperty = 
            TextStyle.prototype.getRawValue;

        /**
         * 批量设置属性值
         *
         * @override
         */
        TextStyle.prototype.setProperties = function () {
            var changes = 
                InputControl.prototype.setProperties.apply(this, arguments);

            if (changes.hasOwnProperty('rawValue')) {
                this.fire('change');
            }
        };

        /**
         * 将原始值转换为字符串
         *
         * @param {Object} rawValue 原始值
         * @return {string}
         * @override
         */
        TextStyle.prototype.stringifyValue = function (rawValue) {
            var value = [];
            if (rawValue.bold) {
                value.push('bold');
            }
            if (rawValue.italic) {
                value.push('italic');
            }
            if (rawValue.underline) {
                value.push('underline');
            }
            if (rawValue.size) {
                value.push('size=' + rawValue.size);
            }
            if (rawValue.color) {
                value.push('color=' + rawValue.color);
            }

            return value.join('&');
        };

        /**
         * 将字符串的值解析为原始值
         *
         * @param {Object} value 字符串形式的值
         * @return {Object}
         * @override
         */
        TextStyle.prototype.parseValue = function (value) {
            var rawValue = {
                bold: false,
                italic: false,
                underline: false,
                size: fontSizes[0].value,
                color: DEFAULT_COLOR
            };
            var parts = value.split('&');
            for (var i = 0; i < parts.length; i++) {
                var part = parts[i];
                if (part === 'bold') {
                    rawValue.bold = true;
                }
                else if (part === 'italic') {
                    rawValue.italic = true;
                }
                else if (part === 'underline') {
                    rawValue.underline = true;
                }
                else if (part.indexOf('size') === 0) {
                    rawValue.size = +part.split('=')[1];
                }
                else if (part === 'color') {
                    rawValue.color = +part.split('=')[1];
                }
                else {
                    throw new Error('Unknown property for TextStyle\' value');
                }
            }

            return rawValue;
        };

        lib.inherits(TextStyle, InputControl);
        require('esui').register(TextStyle);
        return TextStyle;
    }
);
