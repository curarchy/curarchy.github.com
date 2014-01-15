/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 面积堆积图封装控件
 * @author lixiang(lixiang05@baidu.com)
 * @date $DATE$
 */

define(
    function (require) {
        var lib = require('esui/lib');
        var u = require('underscore');
        var helper = require('esui/controlHelper');
        var LineChart = require('ui/LineChart');
        /**
         * 控件类
         * 
         * @constructor
         * @param {Object} options 初始化参数
         */
        function StackChart(options) {
            LineChart.apply(this, arguments);
        }

        lib.inherits(StackChart, LineChart);

        StackChart.prototype.type = 'StackChart';
        StackChart.prototype.styleType = 'Chart';


        /**
         * 格式化y轴显示数据
         * 
         * @param {Object} serie y轴数据
         * @param {number} index 当前需要格式化的数据元素
         * @return {Object} 返回格式化后的y轴显示所需数据对象
         */
        StackChart.prototype.formatYSeriesData = function (serie, index) {
            // 把serie的数据都乘以100
            for (var i = 0; i < serie.data.length; i++) {
                serie.data[i] = serie.data[i];
            }
            return {
                name: serie.label,
                type: 'line',
                stack: '总量',
                symbol: 'emptyCircle',
                itemStyle: {
                    normal: {
                        color: serie.color,
                        areaStyle: {
                            color: u.colorRGB(serie.areaStyleColor, 0.3)
                        },
                        lineStyle: {        // 系列级个性化折线样式
                            width: 2
                        }
                    },
                    emphasis: {
                        color: serie.color,
                        areaStyle: {
                            color: u.colorRGB(serie.areaStyleColor, 0.3)
                        },
                        lineStyle: {        // 系列级个性化折线样式
                            width: 2
                        }

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
        StackChart.prototype.repaint = helper.createRepaint(
            LineChart.prototype.repaint
        );


        StackChart.prototype.buildYAxis = function () {
            return [
                {
                    type: 'value',
                    axisLabel: {
                        formatter: function (value) {
                            if (value === 0) {
                                return '';
                            }
                            else {
                                return value + '%';
                            }
                        },
                        textStyle: { color: '#bebcbd' }
                    },
                    min: 0,
                    max: 100,
                    power: 5,
                    splitNumber: 4,
                    scale: true,
                    axisLine: {
                        show: true,
                        lineStyle: {
                            color: '#333',
                            width: 1,
                            style: 'solid'
                        }
                    },
                    splitLine: {
                        show: true,
                        lineStyle: {
                            width: 1
                        }
                    }
                }
            ];
        };

        require('esui').register(StackChart);

        return StackChart;

    }
);
