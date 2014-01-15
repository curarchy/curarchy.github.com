/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 整体时段报告Action
 * @author wangyaqiong(catkin2009@gmail.com)
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
        function HourReport() {
            BaseAction.apply(this, arguments);
        }

        util.inherits(HourReport, BaseAction);

        /**
         * 视图类型
         *
         * @type {function}
         * @override
         */
        HourReport.prototype.viewType = require('./HourView');

        /**
         * 数据模型类型
         *
         * @type {function}
         * @override
         */
        HourReport.prototype.modelType = require('./HourModel');

        return HourReport;
    }
);