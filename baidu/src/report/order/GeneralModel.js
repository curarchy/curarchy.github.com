/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 订单一级报告Model
 * @author wangyaqiong(catkin2009@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var BaseModel = require('./BaseModel');
        var Data = require('common/ReportData');
        var util = require('er/util');

        function GeneralReportModel() {
            BaseModel.apply(this, arguments);
            this.data = new Data('order/direct');
        }

        util.inherits(GeneralReportModel, BaseModel);

        /**
         * 数据源配置
         *
         * @type {Object}
         * @override
         */
        GeneralReportModel.prototype.datasource = {
            // tableData需要在这里要在处理下，把广告订单那信息传进来
            tableDataAll: function (model) {
                return model.mergeCrumbInfoToTable();
            },
            crumbPath: function (model) {
                var path = [];
                path[0] = { text: '订单报告' };
                return path;
            }
        };

        return GeneralReportModel;
    }
);