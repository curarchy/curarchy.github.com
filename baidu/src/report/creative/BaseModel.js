/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 创意报告数据模型类
 * @author lixiang(lixiang05@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var BizModel = require('./../BizModel');
        var util = require('er/util');
        var u = require('underscore');

        function BaseModel() {
            BizModel.call(this, 'report');
        }

        util.inherits(BaseModel, BizModel);

        var defaultDatasource = [{
            keywordPlaceHolder: function () {
                return '支持创意名称搜索';
            },
            topCategory: function () {
                return {
                    key: 'creative',
                    text: '创意'
                };
            },
            crumbPath: function (model) {
                return model.buildCrumb();
            },
            submenus: function (model) {
                var path = '#/report/creative/';
                var param = model.buildCrumbParam('id');
                return {
                    title: '选择报告维度',
                    menus: [
                        {
                            name: '分日报告',
                            url: path + 'date~' + param
                        },
                        // b1不做
                        // {
                        //     name: '地域分布报告',
                        //     url: '/report/channeGroup/location'
                        // },
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
            // 总信息
            total: function (model) {
                var total = model.get('total');
                return [
                    {
                        value: u.formatInt(total.creativeView.value, '--'),
                        name: '创意总展现量',
                        trend: total.creativeView.trend
                    },
                    {
                        value: u.formatInt(total.click.value, '--'),
                        name: '创意总点击量',
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
                        value: 'creativeView',
                        name: '创意展现量',
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
                return model.buildChartYSeries('creativeView', 'click');
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

        BaseModel.prototype.crumbConfigKey = 'deliveryReport';
        
        return BaseModel;
    }
);