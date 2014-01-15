/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 广告报告数据模型类
 * @author wangyaqiong(wangyaqiong@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var BaseModel = require('./BaseModel');
        var Data = require('common/ReportData');
        var util = require('er/util');
        var u = require('underscore');

        function DateModel() {
            BaseModel.apply(this, arguments);
            this.data = new Data('delivery/date');
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
            },
            // 总信息
            total: function (model) {
                var total = model.get('total');
                return [
                    {
                        value: u.formatInt(total.deliveryView.value, '--'),
                        name: '广告总展现量',
                        trend: total.deliveryView.trend
                    },
                    {
                        value: u.formatInt(total.click.value, '--'),
                        name: '广告总点击量',
                        trend: total.click.trend
                    },
                    {
                        value: total.ctr.value ? total.ctr.value + '%' : '--',
                        name: '点击率',
                        trend: total.ctr.trend
                    },
                    {
                        value: 
                            total.cpm.value ? 
                            '￥' + u.formatMoney(total.cpm.value)
                            : '--',
                        name: '每千次展现收入',
                        trend: total.cpm.trend
                    },
                    {
                        value: 
                            total.income.value ? 
                            '￥' + u.formatMoney(total.income.value)
                            : '--',
                        name: '总收入',
                        trend: total.income.trend
                    }
                ];
            },
            // 图表过滤下拉选项
            properties: function (model) {
                return [
                    {
                        value: 'deliveryView',
                        name: '广告展现量',
                        format: 'int'
                    },
                    {
                        value: 'click',
                        name: '点击量',
                        format: 'int'
                    },
                    {
                        value: 'income',
                        name: '收入',
                        format: 'money'
                    }
                ];
            },
            leftSelectedIndex: function (model) {
                return 0;
            },
            rightSelectedIndex: function (model) {
                return 1;
            },
            ySeriesAll: function (model) {
                return model.buildChartYSeriesAll();
            },
            ySeries: function (model) {
                return model.buildChartYSeries('deliveryView', 'click');
            }
        };
        
        return DateModel;
    }
);