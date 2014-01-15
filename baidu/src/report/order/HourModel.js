/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 广告位分日报告数据模型类
 * @author wangyaqiong(wangyaqiong@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var BaseModel = require('./BaseModel');
        var Data = require('common/ReportData');
        var util = require('er/util');

        function HourModel() {
            BaseModel.apply(this, arguments);
            this.data = new Data('order/direct/hour');
        }

        util.inherits(HourModel, BaseModel);
        
        /**
         * 数据源配置
         *
         * @type {Object}
         * @override
         */
        HourModel.prototype.datasource = {
            activeMenuName: function () {
                return '时段分布报告';
            }
        };
        
        // 时段报告不用分页
        HourModel.prototype.pageNo = null;

        /**
         * 定义是否需要翻页
         *
         * @return {boolean}  
         */
        HourModel.prototype.checkNeedPager = function () {
            return false;
        };

        return HourModel;
    }
);