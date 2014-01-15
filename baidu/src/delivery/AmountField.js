/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 投放量表单区域
 * @author liyidong(srhb18@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var Action = require('er/Action');
        var util = require('er/util');

        /**
         * 投放量表单区域
         *
         * @constructor
         * @extends er/Action
         */
        function AmountField() {
            Action.apply(this, arguments);
        }

        util.inherits(AmountField, Action);

        /**
         * 视图类型
         *
         * @type {function}
         * @override
         */
        AmountField.prototype.viewType = require('./AmountFieldView');

        /**
         * 数据模型类型
         *
         * @type {function}
         * @override
         */
        AmountField.prototype.modelType = require('./AmountFieldModel');

        /**
         * 获取原始值
         *
         * @return {Object}
         */
        AmountField.prototype.getRawValue = function () {
            return this.view.getEntity();
        };

        return AmountField;
    }
);        
