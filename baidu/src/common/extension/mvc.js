/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file MVC体系扩展
 * @author zhanglili(otakustay@gmail.com), liyidong(srhb18@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var datasource = require('er/datasource');
        datasource.invoke = function (methodName) {
            var args = [].slice.call(arguments, 1);

            return function (model) {
                return model[methodName].apply(model, args);
            };
        };

        datasource.session = function (key) {
            return function () {
                var session = require('common/global/session');
                return session.get(key);
            };
        };

        datasource.rule = function () {
            var rules = arguments;
            return function () {
                var rule = require('common/global/rule');
                return rule.use.apply(rule, rules);
            };
        };

        /**
         * 设定默认值
         *
         * @param {string} name 当前属性名
         * @param {Mixed} defaultValue 默认值
         * @return {function}
         */
        datasource.defaultValue = function (name, defaultValue) {
            return function (model) {
                return model.get(name) == null
                    ? defaultValue
                    : model.get(name);
            };
        };

        /**
         * 从枚举中获取对应文字
         *
         * @param {common/enum.Enum} 对应的枚举类型
         * @param {string=} propertyName 对应值的字段名，默认与当前字段名相同
         * @return {function}
         */
        datasource.enumText = function (enumType, propertyName) {
            return function (model, options) {
                var value = model.get(propertyName || options.name);

                if (value == null) {
                    return undefined;
                }
                
                // 布尔型枚举的值可能是`boolean`型，直接转为数字对应
                return enumType.getTextFromValue(+value);
            };
        };

        datasource.formatDate = function (format, propertyName) {
            format = format || 'YYYY-MM-DD';
            return function (model, options) {
                var value = model.get(propertyName || options.name);

                if (!value) {
                    return '';
                }

                var moment = require('moment');
                return moment(value, 'YYYYMMDD').format(format);
            };
        };
    }
);