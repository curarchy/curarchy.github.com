/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 整体每日报告Action
 * @author lixiang05(lixiang05@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var BaseAction = require('./BaseAction');
        var util = require('er/util');

        /**
         * 整体每日报告
         *
         * @constructor
         * @extends ./BaseAction
         */
        function DateReport() {
            BaseAction.apply(this, arguments);
        }

        util.inherits(DateReport, BaseAction);

        /**
         * 视图类型
         *
         * @type {function}
         * @override
         */
        DateReport.prototype.viewType = require('./DateView');

        /**
         * 数据模型类型
         *
         * @type {function}
         * @override
         */
        DateReport.prototype.modelType = require('./DateModel');

        return DateReport;
    }
);