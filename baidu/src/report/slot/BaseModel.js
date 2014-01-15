/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 广告报告数据模型类
 * @author lixiang(lixiang05@baidu.com)
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
            keywordPlaceHolder: function () {
                return '支持广告位ID、广告位和频道名称搜索';
            },
            crumbConfigKey: function () {
                return 'slotReport';
            },
            topCategory: function () {
                return {
                    key: 'slot',
                    text: '广告位'
                };
            },
            crumbPath: function (model) {
                return model.buildCrumb();
            },
            submenus: function (model) {
                var path = '#/report/slot/';
                var param = model.buildCrumbParam('id');
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
            // 总信息
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
                            total.income.value ? 
                            '￥' + u.formatMoney(total.income.value)
                            : '--',
                        name: '总收入',
                        trend: total.income.trend
                    }
                ];
            },
            // tableData需要在这里要在处理下，把广告订单那信息传进来
            tableDataAll: function (model) {
                return model.mergeCrumbInfoToTable();
            },
            // 图表过滤下拉选项
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
        
        return BaseModel;
    }
);