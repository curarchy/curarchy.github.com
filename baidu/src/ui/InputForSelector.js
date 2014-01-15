/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file InputForSelector控件
 * @author exodia(dengxinxin@baidu.com)
 * @date 13-11-26
 */
define(
    function (require) {
        var lib = require('esui/lib');
        var helper = require('esui/controlHelper');
        var InputControl = require('esui/InputControl');
        require('esui/TextLine');

        /**
         * InputForSelector控件
         *
         * @param {Object=} options 初始化参数
         * @extends esui/control
         * @constructor
         * @public
         */
        function InputForSelector(options) {
            InputControl.apply(this, arguments);
        }

        InputForSelector.prototype.type = 'InputForSelector';

        InputForSelector.prototype.template =
            '<h4 class="${title}">每行输入一个值，以回车换行</h4>'
                + '<textarea class="${input}" data-ui="type:TextLine;title:URL;'
                + 'height:205;width:216;childName:input;orientUrl:100">'
                + '</textarea><div class="${add}" '
                + 'data-ui="type:Button;childName:add;width:30">添加</div>';

        InputForSelector.prototype.getHTML = function () {
            return lib.format(this.template, {
                title: this.helper.getPartClasses('title')[0],
                input: this.helper.getPartClasses('input')[0],
                add: this.helper.getPartClasses('add')[0]
            });
        };

        /**
         * 创建主元素
         *
         * @return {HTMLElement}
         * @override
         * @protected
         */
        InputForSelector.prototype.createMain = function () {
            // 如果不需要自行移除
            return document.createElement('div');
        };

        /**
         * 初始化参数
         *
         * @param {Object=} options 构造函数传入的参数
         * @override
         * @protected
         */
        InputForSelector.prototype.initOptions = function (options) {
            var properties = {};
            lib.extend(properties, options);
            this.setProperties(properties);
        };


        function addValue() {
            if (this.validate()) {
                var value = this.getValue().split('\n');
                this.fire('add', { items: value });
            }
        }

        /**
         * 初始化DOM结构
         *
         * @override
         * @protected
         */
        InputForSelector.prototype.initStructure = function () {
            this.main.innerHTML = this.getHTML();
            this.initChildren();
            this.getChild('add').on('click', addValue, this);
        };

        InputForSelector.prototype.validate = function () {
            return this.getChild('input').validate();
        };

        InputForSelector.prototype.getRawValue = function () {
            return this.getChild('input').getRawValue();
        };

        InputForSelector.prototype.setRawValue = function (value) {
            return this.getChild('input').setRawValue(value);
        };

        InputForSelector.prototype.getValue = function () {
            return this.getChild('input').getValue();
        };

        InputForSelector.prototype.setValue = function (value) {
            return this.getChild('input').setValue(value);
        };

        InputForSelector.prototype.getSelectedItems = function () {
            return this.getValue().split(/\r?\n/);
        };

        /**
         * 渲染自身
         *
         * @override
         * @protected
         */
        InputForSelector.prototype.repaint = helper.createRepaint(
            InputControl.prototype.repaint,
            {
                name: 'datasource',
                paint: function (control, datasource) {
                    if (datasource) {
                        var data = datasource.allData || [];
                        //强行重刷
                        control.setRawValue(data.slice(0));
                    }
                }
            }
        );

        lib.inherits(InputForSelector, InputControl);
        require('esui').register(InputForSelector);
        return InputForSelector;
    }
);
