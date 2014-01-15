/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file XML扩展标签表单区域
 * @author liyidong(srhb18@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var Action = require('er/Action');
        var util = require('er/util');

        /**
         * XML扩展标签表单区域
         *
         * @constructor
         * @extends er/Action
         */
        function XMLExtField() {
            Action.apply(this, arguments);
        }

        util.inherits(XMLExtField, Action);

        /**
         * 视图类型
         *
         * @type {function}
         * @override
         */
        XMLExtField.prototype.viewType = require('./XMLExtFieldView');

        /**
         * 数据模型类型
         *
         * @type {function}
         * @override
         */
        XMLExtField.prototype.modelType = require('./XMLExtFieldModel');

        /**
         * 获取原始值
         *
         * @return {Object}
         */
        XMLExtField.prototype.getRawValue = function () {
            return this.view.getEntity();
        };

        return XMLExtField;
    }
);        
