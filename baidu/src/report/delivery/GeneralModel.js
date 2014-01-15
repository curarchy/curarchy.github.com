/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 广告一级报告模型类
 * @author wangyaqiong(wangyaqiong@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var BaseModel = require('./BaseModel');
        var Data = require('common/ReportData');
        var util = require('er/util');
        var u = require('underscore');
        var deliveryEnums = require('delivery/enum');

        function GeneralReportModel() {
            BaseModel.apply(this, arguments);
            this.data = new Data('delivery');
        }

        util.inherits(GeneralReportModel, BaseModel);

        // 状态
        var deliveryTypes = deliveryEnums.Status.toArray();
        deliveryTypes.unshift({ text: '所有广告状态', value: ''});

        /**
         * 数据源配置
         *
         * @type {Object}
         * @override
         */
        GeneralReportModel.prototype.datasource = {
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
            // tableData需要在这里要在处理下，把广告订单那信息传进来
            tableDataAll: function (model) {
                return model.mergeCrumbInfoToTable();
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
                    // {
                    //     value: 'ctr',
                    //     name: '点击率',
                    //     format: 'percent'
                    // },
                    // {
                    //     value: 'cpm',
                    //     name: '每千次展现收入',
                    //     format: 'money'
                    // },
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
            },
            deliveryTypes: function (model) {
                return deliveryTypes;
            },
            crumbPath: function (model) {
                var path = [];
                path[0] = { text: '广告报告' };
                return path;
            }
        };

        GeneralReportModel.prototype.prepare = function () {
            var url = this.get('url');
            var query = url.getQuery();
            var favorSkin = 'unfavored';

            if (this.get('flag') == 1) {
                favorSkin = 'favored';
                delete query.flag;
            } else {
                query.flag = 1;
            }

            var link = require('er/URL').withQuery(url.getPath(), query);

            this.set('favorSkin', favorSkin);
            this.set('favorFilterLink', '#' + link);
        };

        /**
         * 获取请求后端时的查询参数
         *
         * @return {Object}
         */
        GeneralReportModel.prototype.getQuery = function () {
            var query = BaseModel.prototype.getQuery.apply(this, arguments);
            query.flag = this.get('flag');
            query.status = this.get('status');
            return query;
        };

        return GeneralReportModel;
    }
);