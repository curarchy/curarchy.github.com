/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 线状图封装控件
 * @author lixiang(lixiang05@baidu.com)
 * @date $DATE$
 */

define(
    function (require) {
        var lib = require('esui/lib');
        var u = require('underscore');
        var m = require('moment');
        var helper = require('esui/controlHelper');
        var BaseChart = require('ui/BaseChart');

        /**
         * 控件类
         * 
         * @constructor
         * @param {Object} options 初始化参数
         */
        function LineChart(options) {
            BaseChart.apply(this, arguments);
        }

        lib.inherits(LineChart, BaseChart);


        LineChart.prototype.type = 'LineChart';
        LineChart.prototype.styleType = 'Chart';

        /**
         * 获得提示层的title
         */
        LineChart.prototype.getTipTitleHtml = function (params) {
            // 如果是日期，则需要显示星期几
            // 取一个数据做抽取就可以
            var title = params[0][1];
            var week = '';
            var date = m(title, 'YYYY-MM-DD');
            if (date.isValid()) {
                week = u.getDayOfWeek(date.toDate());
            }
            title = title + ' ' + week;
            return title;
        };

        /**
         * 格式化y轴某条连续数据
         * 
         * @param {LineChart} chart 类实例
         * @param {Object} serie y轴数据
         * @param {number} index y轴数据索引
         * @return {Object} 返回格式化后的y轴显示所需数据对象
         */
        LineChart.prototype.formatYSeriesData = function (serie, index) {
            return {
                name: serie.label,
                type: 'line',
                symbol: 'emptyCircle',
                yAxisIndex: index,
                itemStyle: {
                    normal: {
                        color: serie.color,
                        lineStyle: {        // 系列级个性化折线样式
                            width: 2
                        }
                    },
                    emphasis: {
                        // color: serie.color,
                        // lineStyle: {        // 系列级个性化折线样式
                        //     width: 2
                        // }

                    }
                },
                data: serie.data
            };
        };

        /**
         * 重新渲染视图
         * 仅当生命周期处于RENDER时，该方法才重新渲染
         *
         * @param {Array=} 变更过的属性的集合
         * @override
         */
        LineChart.prototype.repaint = helper.createRepaint(
            BaseChart.prototype.repaint
        );
        
        /**
         * 创建Y轴数据
         *
         * @param {Array} ySeries 序列数据
         *
         * @return {Array} 坐标集合
         * @override
         */
        LineChart.prototype.buildYAxis = function (ySeries) {
            var yAxis = [];
            for (var i = 0; i < ySeries.length; i ++) {
                var serie = ySeries[i];
                // 格式化y轴刻度数据
                var formattedYAxisData = this.formatYAxisData(serie);
                yAxis.push(formattedYAxisData);
            }

            return yAxis;
        };

       /**
         * 初始化图表数据
         *
         * @override
         */
        LineChart.prototype.initChartOptions = function () {
            return {         
                tooltip: {
                    trigger: 'axis',
                    formatter: lib.bind(this.tipFormatter, this)
                },
                xAxis: [
                    {
                        type: 'category',
                        boundaryGap: false,
                        axisLine: {
                            show: true,
                            lineStyle: {
                                color: '#333',
                                width: 1,
                                style: 'solid'
                            }
                        }
                    }
                ]
            };
        };

 
        require('esui').register(LineChart);

        return LineChart;

    }
);
