/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 广告位一级报告Action
 * @author wangyaqiong(catkin2009@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var BaseAction = require('./BaseAction');
        var util = require('er/util');

        /**
         * 广告一级报告
         *
         * @constructor
         * @extends ./TotalBase
         */
        function GeneralReport() {
            BaseAction.apply(this, arguments);
        }

        util.inherits(GeneralReport, BaseAction);

        /**
         * 视图类型
         *
         * @type {function}
         * @override
         */
        GeneralReport.prototype.viewType = require('./GeneralView');

        /**
         * 数据模型类型
         *
         * @type {function}
         * @override
         */
        GeneralReport.prototype.modelType = require('./GeneralModel');

        return GeneralReport;
    }
);