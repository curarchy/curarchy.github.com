/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 整体报告数据模型类
 * @author wangyaqiong(wangyaqiong@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var BaseModel = require('./BaseModel');
        var Data = require('common/ReportData');
        var util = require('er/util');

        function DateModel() {
            BaseModel.apply(this, arguments);
            this.data = new Data('total/date');
        }

        util.inherits(DateModel, BaseModel);
        
        /**
         * 数据源配置
         *
         * @type {Object}
         * @override
         */
        DateModel.prototype.datasource = {
            activeMenuName: function () {
                return '分日报告';
            }
        };
        
        return DateModel;
    }
);