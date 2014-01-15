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
        var BizModel = require('./../BizModel');
        var util = require('er/util');
        var u = require('underscore');

        function BaseModel() {
            BizModel.apply(this, arguments);
        }

        util.inherits(BaseModel, BizModel);

        var defaultDatasource = [{
            topCategory: function () {
                return {
                    key: 'total',
                    text: '整体'
                };
            },
            crumbPath: function (model) {
                return [{ text: '整体报告' }];
            },
            submenus: function (model) {
                var path = '#/report/total/';
                var param = model.buildCrumbParam();
                return {
                    title: '选择报告维度',
                    menus: [
                        {
                            name: '分日报告',
                            url: path + 'date~' + param
                        },
                        {
                            name: '时段分布报告',
                            url: path + 'hour~' + param
                        }
                    ]
                };
            },
            comparable: function () {
                return true;
            },
            total: function (model) {
                var total = model.get('total');
                return [
                    {
                        value: u.formatInt(total.view.value, '--'),
                        name: '广告位总展现量',
                        trend: total.view.trend
                    },
                    {
                        value: u.formatInt(total.deliveryView.value, '--'),
                        name: '广告总展现量',
                        trend: total.deliveryView.trend
                    },
                    {
                        value: u.formatInt(total.click.value, '--'),
                        name: '总点击量',
                        trend: total.click.trend
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
            properties: function (model) {
                return [
                    {
                        value: 'click',
                        name: '点击量',
                        format: 'int'
                    },
                    {
                        value: 'deliveryView',
                        name: '广告展现量',
                        format: 'int'
                    },
                    {
                        value: 'view',
                        name: '广告位展现量',
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
                return 2;
            },
            rightSelectedIndex: function (model) {
                return 0;
            },
            ySeriesAll: function (model) {
                return model.buildChartYSeriesAll();
            },
            ySeries: function (model) {
                return model.buildChartYSeries('view', 'click');
            }
        }];


        /**
         * 默认数据源配置
         * 
         * @param {Object}
         * @override
         */
        BaseModel.prototype.defaultDatasource = [
            BizModel.prototype.defaultDatasource,
            defaultDatasource
        ];

        BaseModel.prototype.crumbConfigKey = 'websiteReport';
        
        return BaseModel;
    }
);