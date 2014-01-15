/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 常量枚举类
 * @author wangyaqiong(catkin2009@gmail.com), zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function () {
        function Enum() {
            this.valueIndex = [];
            this.aliasIndex = {};
            this.textIndex = {};

            for (var i = 0; i < arguments.length; i++) {
                var element = arguments[i];
                if (element.value == null) {
                    element.value = i;
                }
                this.addElement(element);
            }
        }

        Enum.prototype.addElement = function (element) {
            if (this.hasOwnProperty(element.value)) {
                throw new Error(
                    'Already defined an element with value'
                    + element.value + ' in this enum type'
                );
            }

            if (this.hasOwnProperty(element.alias)) {
                throw new Error(
                    'Already defined an element with alias'
                    + '"' + element.value + '" in this enum type'
                );
            }

            this[element.value] = element.alias;
            this[element.alias] = element.value;

            this.valueIndex[element.value] = element;
            this.aliasIndex[element.alias] = element;
            this.textIndex[element.text] = element;
        };

        Enum.prototype.fromValue = function (value) {
            return this.valueIndex[value];
        };

        Enum.prototype.fromAlias = function (alias) {
            return this.aliasIndex[alias];
        };

        Enum.prototype.fromText = function (text) {
            return this.textIndex[text];
        };

        Enum.prototype.getTextFromValue = function (value) {
            return this.fromValue(value).text;
        };

        Enum.prototype.getTextFromAlias = function (alias) {
            return this.fromAlias(alias).text;
        };

        Enum.prototype.getValueFromAlias = function (alias) {
            return this.fromAlias(alias).value;
        };

        Enum.prototype.getValueFromText = function (text) {
            return this.fromText(text).value;
        };

        Enum.prototype.getAliasFromValue = function (value) {
            return this.fromValue(value).alias;
        };

        Enum.prototype.getAliasFromText = function (text) {
            return this.fromText(text).alias;
        };

        Enum.prototype.toArray = function () {
            return require('underscore').compact(this.valueIndex);
        };

        var exports = {};

        exports.Enum = Enum;

        exports.Status = new Enum(
            { alias: 'REMOVE', text: '删除' },
            { alias: 'RESTORE', text: '启用' },
            { alias: 'STOP', text: '停用' }
        );

        /**
         * 时间段类型
         *
         * @enum
         */
        exports.DateType = new Enum(
            { alias: 'RANGE', text: '连续' },
            { alias: 'RICH', text: '不连续' }
        );


        /**
         * 报告下载类型
         *
         * @enum
         */
        exports.ReportDownloadType = new Enum(
            { alias: 'CSV', text: 'csv' },
            { alias: 'PDF', text: 'pdf' }
        );

        return exports;
    }
);