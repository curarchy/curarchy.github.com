/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 报告的业务数据模型类
 * @author lixiang(lixiang05@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var ReportModel = require('common/ReportModel');
        var util = require('er/util');
        var u = require('underscore');
        var m = require('moment');

        function BizModel() {
            ReportModel.call(this, 'report');
        }

        util.inherits(BizModel, ReportModel);

        var datasource = require('er/datasource');
        var defaultDatasource = [{
            // 先做下适配
            total: function (model) {
                var total = model.get('total');
                for (var key in total) {
                    if (total[key] == null) {
                        total[key] = { value: null, trend: null };
                    }
                }
                return total;
            },
            // 权限
            hasTotal: datasource.permission('CLB_REPORT_TOTAL'),
            hasSlot: datasource.permission('CLB_REPORT_ADPOSITION'),
            hasOrder: datasource.permission('CLB_REPORT_ORDER'),
            hasDelivery: datasource.permission('CLB_REPORT_DELIVERY'),
            hasCreative: datasource.permission('CLB_REPORT_CREATIVE')
        }];

        /**
         * 默认数据源配置
         * 
         * @param {Object}
         * @override
         */
        BizModel.prototype.defaultDatasource = [
            ReportModel.prototype.defaultDatasource,
            defaultDatasource
        ];

        /**
         * 获取表格所需数据
         *
         * @return {Array} 数据list
         */
        BizModel.prototype.getTableDataAll = function () {
            // 用于table展示的数据有三种可能：
            // 名称粒度，日期粒度，小时力度
            var results = this.get('results');
            var dateResults = this.get('dateResults');
            var hourResults = this.get('hourResults');
            // 有results存在，那么就用results作为表格数据
            if (results) {
                return results;
            }
            else if (dateResults) {
                return dateResults;
            }
            else if (hourResults) {
                return hourResults;
            }

            return [];
        };

        /**
         * 获取图表所需数据
         * 可重写，比如地域报告
         *
         * @return {Array} 数据list
         */
        BizModel.prototype.getChartData = function () {
            // 用于chart展示的数据有三种可能：
            // 日期粒度，小时力度
            var dateResults = this.get('dateResults');
            var hourResults = this.get('hourResults');
            // 有results存在，那么就用results作为表格数据
            if (hourResults) {
                return hourResults;
            }
            else if (dateResults) {
                return dateResults;
            }

            return [];
        };

        /**
         * 获取x轴数据
         * 这个方法也可以重写，柱状图的x轴就不是日期
         *
         * @return {Array} 
         */
        BizModel.prototype.getXSeries = function () {
            var model = this;
            var chartData = this.get('chartData');
            if (!chartData.length) {
                return ['异常数据'];
            }
            var dates = u.map(chartData, function (data) {
                return model.formatToTableDate(data.time);
            });
            return dates;
        };


        /**
         * 获取日历可选范围
         * 
         *
         * @return {Object} 
         */
        BizModel.prototype.getSelectableRange = function () {
            // 今天之后的日子不能选
            return {
                end: m().startOf('day').toDate()
            };
        };

        /**
         * 获取图表默认显示区间
         *
         * @param {string} beginTime 开始时间
         * @param {string} endTime 结束时间
         * @return {Object} 
         */
        BizModel.prototype.getDisplayDuration = function (beginTime, endTime) {
            if (beginTime && endTime) {
                return {
                    begin: m(beginTime, 'YYYYMMDD').toDate(),
                    end: m(endTime, 'YYYYMMDD').toDate()
                };
            }

            var now = m().startOf('day');
            // 默认最近七天
            // var begin = now.clone().subtract('days', 7).toDate();
            // var end = now.clone().subtract('day', 1).toDate();

            // 默认昨天
            var begin = now.clone().subtract('days', 1).toDate();
            var end = now.clone().subtract('day', 1).toDate();

            return {
                begin: begin,
                end: end
            };
        };


        /**
         * 默认起始页码，可重写
         * 
         * @type {string} 
         */
        BizModel.prototype.pageNo = 1;

        /**
         * 发往后端的日期格式
         * 
         * @type {string} 
         */
        BizModel.prototype.paramDateFormat = 'YYYYMMDD';

        /**
         * 表格中的日期格式
         * 
         * @type {string} 
         */
        BizModel.prototype.tableDateFormat = 'YYYY-MM-DD';

        /**
         * 面包屑配置
         * 
         * @type {Object} 
         */
        BizModel.prototype.crumbConfig = {
            // 广告位报告
            'slotReport':
            [
                {
                    text: '频道分组',
                    key: 'channelGroup'
                },
                {
                    text: '频道',
                    key: 'channel'
                }
            ],
            'deliveryReport': [   
                {
                    text: '销售人员',
                    key: 'saler'
                },
                {
                    text: '广告客户',
                    key: 'adOwner'
                },
                {
                    text: '订单',
                    key: 'order'
                },
                {
                    text: '广告',
                    key: 'delivery'
                },
                {
                    text: '创意',
                    key: 'creative'
                }
            ],
            // 站点报告
            'websiteReport': [
                {
                    text: '订单',
                    key: 'order'
                },
                {
                    text: '广告',
                    key: 'delivery'
                }
            ]
        };

        /**
         * 允许的最大报告时间跨度
         * 
         * @type {number} 
         */
        BizModel.prototype.maxScope = 750;

        /**
         * 图表图例颜色
         * 
         * @type {Array} 
         */
        BizModel.prototype.chartColors = ['#6baa27', '#f4754a'];

        /**
         * 默认进入的模块
         * 
         * @type {string} 
         */
        BizModel.prototype.defaultModule = 'date';

       
        /**
         * 请求参数修正，时间跨度判断在这里进行
         * 
         * @param {Object} query
         * @return {Object} 修正后的结果，包含错误信息
         */ 
        BizModel.prototype.reviseQuery = function (query) {
            var begin = query.startTime;
            var end = query.endTime;
            var isRevised = false;
            if (begin && end) {
                begin = m(begin, this.paramDateFormat);
                end = m(end, this.paramDateFormat);
                // 1. 开始时间不能大于结束时间，否则交换。。。
                if (begin.isAfter(end)) {
                    var temp = begin.clone();
                    begin = end.clone();
                    end = temp;
                    isRevised = true;
                }

                var validEnd = m().endOf('day');
                // 2. 结束时间不能是未来
                if (end.toDate() > validEnd.toDate()) {
                    end = validEnd;
                    isRevised = true;
                }
                // 3. 查询日期间隔不能超过maxScope
                var validBegin = end.clone().subtract('d', this.maxScope - 1);
                // 超了
                if (validBegin.toDate() > begin.toDate()) {
                    begin = validBegin;
                    isRevised = true;
                }
            }

            if (isRevised) {
                query.startTime = begin.format(this.paramDateFormat);
                query.endTime = end.format(this.paramDateFormat);
                var displayBeginTime = begin.format(this.tableDateFormat);
                var displayEndTime = end.format(this.tableDateFormat);
                return {
                    message: 
                        '日期输入有误：报告查询跨度不能超过' 
                        + this.maxScope + '天；'
                        + '不能选择未来日期；起始时间不能在结束时间以后。'
                        + '现修正显示允许时间区间：'
                        + displayBeginTime + '至' + displayEndTime + '的数据。',
                    query: query
                };
            }
            return isRevised;
        };

        /**
         * 将20111103型字符串格式日期转换成2011-11-03型
         *
         * @return {string}
         */
        BizModel.prototype.formatToTableDate = function (dateStr) {
            // 得先看看是不是日期，可能是01:00这种时间
            if (dateStr.indexOf(':') >= 0) {
                return dateStr;
            }
            if (dateStr) {
                return m(dateStr, this.paramDateFormat)
                    .format(this.tableDateFormat);
            }
            else {
                return null;
            }
        };

        /**
         * 比较算法
         *
         * @param {string | number} a 原数据源第j个数据
         * @param {string | number} b 原数据源第j-1个数据
         * @param {string} order desc | asc
         * @return {number}
         */
        function compare (a, b, order) {
            var symbol = 1;

            if (order === 'asc') {
                symbol = -1;
            }

            // 相等，返回0
            if (a === b) {
                return 0;
            }

            if (a == null && b == null) {
                return 0;
            }

            // b是null，desc时排在最后
            if (b == null) {
                return symbol * 1;
            }
            else if (a == null) {
                return symbol * (-1);
            }

            // 文字对比
            if (typeof a === 'string' && isNaN(parseFloat(a))) {
                return symbol * a.localeCompare(b);
            }

            return symbol * (parseFloat(a) - parseFloat(b));
        }

        /**
         * 冒泡排序
         *
         * @param {array} array 待排序数组 
         * @param {string} order desc | asc
         * @param {string} orderBy 排序字段
         */
        function bubbleSort(array, order, orderBy) {
            var length = array.length;
            for (i = 0; i <= length - 2; i ++) {
                for (j = length - 1; j >= 1; j --) {
                    //对两个元素进行交换
                    var compareResult = 
                        compare(
                            array[j][orderBy], array[j - 1][orderBy], order
                        );
                    if (compareResult > 0) {
                        temp = array[j];
                        array[j] = array[j - 1];
                        array[j - 1] = temp;
                    }
                }
            }   
        }

        /**
         * 定义是否需要翻页
         *
         * @return {boolean}  
         */
        BizModel.prototype.checkNeedPager = function () {
            return true;
        };

        /**
         * 刷新表格
         *
         * @param {object} options 表格配置 
         *     { orderBy: 'xxx', order: 'asc', pageNo: 2 }
         * @return {object} 表格数据源 
         */
        BizModel.prototype.refreshTableData = function (options) {
            var tableData = u.clone(this.get('tableDataAll'));

            // 先排序
            if (options.orderBy) {
                if (options.orderBy === 'size') {
                    // 要排两次。。。
                    bubbleSort(tableData, options.order, 'width');
                    var tempTableDataIndex = {};
                    var tempTableData = [];
                    var widthIndex = [];
                    u.each(tableData, function (data) {
                        if (!tempTableDataIndex[data.width]) {
                            tempTableDataIndex[data.width] = [];
                            widthIndex.push(data.width);
                        }
                        tempTableDataIndex[data.width].push(data);
                    });
                    u.each(widthIndex, function (width) {
                        bubbleSort(
                            tempTableDataIndex[width], 
                            options.order, 
                            'height'
                        );
                        tempTableData = 
                            u.union(tempTableData, tempTableDataIndex[width]);
                    });
                    tableData = tempTableData;
                }
                else {
                    bubbleSort(tableData, options.order, options.orderBy);
                }
            }

            // 再截断
            if (options.pageNo && this.get('needPager')) {
                var pageSize = this.get('pageSize');
                // 0代表起始
                var start =  (options.pageNo - 1) * pageSize;
                var end = Math.min(start + pageSize, tableData.length);
                tableData = tableData.slice(start, end);
            }

            this.set('tableData', tableData);
            return tableData;
        };
        return BizModel;
    }
);