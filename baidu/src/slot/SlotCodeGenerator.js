/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 获取代码Action
 * @author lixiang05(lixiang05@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var BaseAction = require('common/BaseAction');
        var util = require('er/util');

        /**
         * 获取代码Action
         *
         * @constructor
         * @extends er/BaseAction
         */
        function SlotCodeGenerator() {
            BaseAction.apply(this, arguments);
        }

        util.inherits(SlotCodeGenerator, BaseAction);

        /**
         * 视图类型
         *
         * @type {function}
         * @override
         */
        SlotCodeGenerator.prototype.viewType = 
            require('./SlotCodeGeneratorView');

        /**
         * 数据模型类型
         *
         * @type {function}
         * @override
         */
        SlotCodeGenerator.prototype.modelType = 
            require('./SlotCodeGeneratorModel');

        /**
         * 初始化交互行为
         *
         * @override
         */
        SlotCodeGenerator.prototype.initBehavior = function () {
            // 当`view`触发`cancel`事件时，自身也触发`cancel`事件
            require('mini-event').delegate(this.view, this, 'cancel');
        };

        return SlotCodeGenerator;
    }
);