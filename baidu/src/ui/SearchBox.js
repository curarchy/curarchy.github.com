/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file SearchBox控件
 * @author undefined(undefined)
 * @date $DATE$
 */
define(
    function (require) {
        var lib = require('esui/lib');
        var helper = require('esui/controlHelper');
        var ui = require('esui');
        var Control = require('esui/Control');

        require('esui/TextBox');
        require('esui/Button');

        /**
         * SearchBox控件
         *
         * @param {Object=} options 初始化参数
         * @extends esui/Control
         * @constructor
         * @public
         */
        function SearchBox(options) {
            Control.apply(this, arguments);
        }

        SearchBox.prototype.type = 'SearchBox';

        /**
         * 初始化参数
         *
         * @param {Object=} options 构造函数传入的参数
         * @override
         * @protected
         */
        SearchBox.prototype.initOptions = function (options) {
            var properties = {};
            lib.extend(properties, options);

            if (properties.disabled === 'false') {
                properties.disabled = false;
            }

            if (lib.isInput(this.main)) {
                if (!properties.placeholder) {
                    properties.placeholder = 
                        lib.getAttribute(this.main, 'placeholder');
                }

                if (!properties.text) {
                    properties.text = this.main.value;
                }

                if (!properties.maxLength
                    && (
                        lib.hasAttribute(this.main, 'maxlength')
                        || this.main.maxLength > 0
                    )
                ) {
                    properties.maxLength = this.main.maxLength;
                }
            }
            else {
                if (!properties.text) {
                    properties.text = lib.getText(this.main);
                }
            }

            if (!properties.title) {
                properties.title = this.main.title;
            }

            this.setProperties(properties);
        };

        /**
         * 初始化DOM结构
         *
         * @override
         * @protected
         */
        SearchBox.prototype.initStructure = function () {
            // 一个搜索框由一个文本框和一个按钮组成
            var textboxOptions = {
                mode: 'text', 
                skin: 'search', 
                childName: 'text',
                height: this.height,
                viewContext: this.viewContext
            };

            if (lib.isInput(this.main)) {
                textboxOptions.main = helper.replaceMain(this);
            }

            var textbox = ui.create('TextBox', textboxOptions);
            textbox.appendTo(this.main);
            this.addChild(textbox);
            textbox.on('input', lib.bind(this.fire, this, 'input'));
            textbox.on('enter', lib.bind(this.fire, this, 'search'));
            textbox.on(
                'keypress',
                function (e) {
                    if (e.keyCode === 13) {
                        e.preventDefault();
                    }
                }
            );
            textbox.on('focus', lib.bind(this.addState, this, 'focus'));
            textbox.on('blur', lib.bind(this.removeState, this, 'focus'));

            var buttonOptions = {
                main: document.createElement('span'),
                skin: 'search',
                childName: 'button',
                content: '搜索',
                viewContext: this.viewContext
            };
            var button = ui.create('Button', buttonOptions);
            button.appendTo(this.main);
            this.addChild(button);
            button.on('click', lib.bind(this.fire, this, 'search'));
        };

        /**
         * 获取输入值
         *
         * @public
         */
        SearchBox.prototype.getValue = function () {
            var text = this.getChild('text');
            return text.getValue();
        };

        var paint = require('esui/painters');

        /**
         * 渲染自身
         *
         * @override
         * @protected
         */
        SearchBox.prototype.repaint = helper.createRepaint(
            Control.prototype.repaint,
            paint.attribute('title'),
            {
                name: [
                    'maxLength', 'placeholder', 'text',
                    'width', 'disabled', 'readOnly'
                ],
                paint: function (box, maxLength, placeholder,
                    text, width, disabled, readOnly
                ) {
                    var properties = {
                        maxLength: maxLength,
                        placeholder: placeholder,
                        value: text,
                        width: width,
                        disabled: disabled,
                        readOnly: readOnly
                    };
                    box.getChild('text').setProperties(properties);
                }
            },
            {
                name: 'disabled',
                paint: function (box, disabled) {
                    if (disabled === 'false') {
                        disabled = false;
                    }

                    var button = box.getChild('button');
                    button.set('disabled', disabled);
                }
            },
            {
                // 是否独占一行
                name: 'fitWidth',
                paint: function (box, fitWidth) {
                    var method = fitWidth ? 'addState' : 'removeState';
                    box[method]('fit-width');
                }
            }
        );

        lib.inherits(SearchBox, Control);
        require('esui').register(SearchBox);
        return SearchBox;
    }
);
