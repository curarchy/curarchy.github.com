/**
 * ESUI (Enterprise Simple UI)
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 数量控件
 * @author curarchy
 */

define(
    function (require) {
        var u = require('underscore');
        var lib = require('./lib');
        var ui = require('./main');
        var TextBox = require('./InputBox');
        var InputControl = require('./InputControl');
    
        /**
         * 输入数字的控件
         *
         * @extends InputControl
         * @requires TextBox
         * @constructor
         */
        function NumberBox(options){
            InputControl.apply(this, arguments);
        }

        /**
         * 控件类型，始终为`"NumberBox"`
         * 
         * @type {string}
         * @readonly
         * @override
         */
        NumberBox.prototype.type = 'NumberBox';

        /**
         * @cfg defaultProperties
         *
         * 默认属性值
         *
         * @cfg {number} [defaultProperties.width=200] 默认宽度
         * @cfg {number} [defaultProperties.height=30] 默认高度
         * @cfg {number} [defaultProperties.value=1] 默认值
         * @static
         */
        NumberBox.defaultProperties = {
            width: 150,
            height: 30,
            value: 1
        };

        /**
         * 创建主元素，默认使用`<div>`元素
         *
         * @return {HTMLElement} 主元素
         * @protected
         * @override
         */
        NumberBox.prototype.createMain = function(){
            document.createElement('div');
        };

        /**
         * 获取主体的HTML
         *
         * @ignore
         */
        function getMainHTML() {
            var number = [
                '<input ',
                    'data-ui-type="TextBox" ',
                    'data-ui-child-name="text" ',
                '/>'
            ];
            return number.join('');
        }

        /**
         * 初始化参数
         *
         * @param {Object} [options] 构造函数传入的参数
         * @protected
         * @override
         */
        NumberBox.prototype.initOptions = function (options) {
            // 默认选项配置
            var properties = this.defaultProperties;
            if (lib.isInput(this.main)) {
                this.helper.extractOptionsFromInput(this.main, properties);
            }
            u.extend(properties, options);
            this.setProperties(properties);
        };

        /**
         * 初始化DOM结构
         *
         * @protected
         * @override
         */
        NumberBox.prototype.initStructure = function(){
            // 如果主元素是输入元素，替换成`<div>`
            // 如果输入了非块级元素，则不负责
            if (lib.isInput(this.main)) {
                this.helper.replaceMain();
            }
            this.main.innerHTML = getMainHTML(this);
            // 创建控件树
            this.helper.initChildren();

            // 输入区变化监听
            var numberArea = this.getChild('text');
            numberArea.on('keypress', refreshValue, this);
        };

        /**
         * 将特殊的按键分发为事件
         *
         * @param {TextBox} this 控件实例
         * @param {Event} e DOM事件对象
         * @ignore
         */
        function refreshValue(e){
            var keyCode = e.which || e.keyCode;

            var args = {
                keyCode: keyCode,
                key: String.fromCharCode(keyCode),
                ctrlKey: e.ctrlKey,
                altKey: e.altKey
            };

            var event = require('mini-event').fromDOMEvent(e, 'keypress', args);
            /**
             * @event keypress
             *
             * 在控件上按键时触发
             *
             * @param {number} keyCode 按键的编码
             * @param {string} key 按键对应的单字
             * @param {boolean} ctrlKey CTRL键是否按下
             * @param {boolean} altKey ALT键是否按下
             * @member TextBox
             */
            this.fire('keypress', event);
        }
    }
);