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
        var u = require('underscore');
        // var creativeEnums = require('creative/enum');


        function CreativeModel() {
            BaseModel.apply(this, arguments);
            this.data = new Data('delivery/creative');
        }

        util.inherits(CreativeModel, BaseModel);
        
        // 标记
        // var creativeFlags = [
        //     { text: '全部标记', value: '' },
        //     { text: '未标记', value: 0 },
        //     { text: '重要', value: 1 }
        // ];
        // // 类型
        // var creativeTypes = creativeEnums.Type.toArray();
        // creativeTypes.unshift({ text: '所有类型', value: ''});

        /**
         * 数据源配置
         *
         * @type {Object}
         * @override
         */
        CreativeModel.prototype.datasource = {  
            comparable: function () {
                return false;
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
            selectedIndex: function (model) {
                return 0;
            },
            // tableData需要在这里要在处理下，把广告订单那信息传进来
            tableDataAll: function (model) {
                return model.mergeCrumbInfoToTable('deliveryId');
            },
            // 这部分数据要串行
            chartData: [
                {
                    ySeriesAll: function (model) {
                        return model.buildChartYSeriesAll();
                    }
                },
                {
                    ySeries: function (model) {
                        return model.buildChartYSeries('creativeView');
                    }
                },
                {
                    xSeries: function (model) {
                        return model.getXSeries('creativeView');
                    }
                }
            ],
            // creativeTypes: function (model) {
            //     return creativeTypes;
            // },
            // creativeFlags: function (model) {
            //     return creativeFlags;
            // },
            activeMenuName: function () {
                return '分创意报告';
            }
        };


        /**
         * 获取图表所需数据
         *
         * @return {Array} 数据list
         */
        CreativeModel.prototype.getChartData = function () {
            // 前十
            var results = this.get('top');
            return results;
        };

        /**
         * 创建图表y轴数据全集
         * 柱状图重写
         *
         * @return {Array} 数据list
         */
        CreativeModel.prototype.buildChartYSeriesAll = function () {
            var properties = this.get('properties');
            var keys = u.map(properties, function (property) {
                return {
                    name: property.value,
                    label: property.name,
                    format: property.format
                };
            });
            var chartData = this.get('chartData');
            var ySeriesAll = {};
            u.each(keys, function (key) {
                var top10 = chartData[key.name];
                key.data = u.map(top10, function (data) {
                    return data.value;
                });
                ySeriesAll[key.name] = key;
            });
            return ySeriesAll;
        };


        /**
         * 刷新图表, 柱状图的刷新还要包括横轴
         *
         * @param {string} key 选框的选值 
         */
        CreativeModel.prototype.refreshChartData = function (key) {
            var ySeries = this.buildChartYSeries(key);
            this.set('ySeries', ySeries);

            var xAxis = this.getXSeries(key);
            this.set('xSeries', xAxis);
        };

        /**
         * 获取x轴数据
         *
         * @return {Array} 
         */
        CreativeModel.prototype.getXSeries = function (key) {
            if (!key) {
                return ['异常数据'];
            }
            // 不同数据的x轴不同
            var chartData = this.get('chartData');
            if (!chartData) {
                return ['异常数据'];
            }
            var top10 = chartData[key] || [];
            var length = top10.length;
            var existedText = {};
            function ellipsis(text, targetLength) {
                var ellipsisText = u.ellipsis(text, targetLength);
                if (!existedText[ellipsisText]) {
                    existedText[ellipsisText] = 1;
                    return ellipsisText;
                }
                else {
                    return ellipsis(text, targetLength + 1);
                }
            }
            var creativeNames = u.map(top10, function (data) {
                return {
                    text: ellipsis(data.name, 100 / length),
                    value: data.name
                };
            });
            return creativeNames;
        };

        /**
         * 获取请求后端时的查询参数
         *
         * @return {Object}
         */
        // CreativeModel.prototype.getQuery = function () {
        //     var query = BaseModel.prototype.getQuery.apply(this, arguments);
        //     query.flag = this.get('flag');
        //     query.type = this.get('type');

        //     // var size = this.get('size');
        //     // if (size) {
        //     //     var widthAndHieght = size.split('*');
        //     //     var width = widthAndHieght[0];
        //     //     var height = widthAndHieght[1];
        //     //     if (width != null && height != null) {
        //     //         query.width = width;
        //     //         query.height = height;
        //     //     }
        //     // }
        //     return query;
        // };

        return CreativeModel;
    }
);