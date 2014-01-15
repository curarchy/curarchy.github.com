/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 整体每日报告视图类
 * @author lixiang(lixiang05@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var BaseView = require('./BaseView');
        var util = require('er/util');
        var u = require('underscore');

        require('tpl!./tpl/delivery.tpl.html');

        /**
         * 整体每日报告视图类
         *
         * @constructor
         * @extends report/adPosition/BaseView
         */
        function DeliveryView() {
            BaseView.apply(this, arguments);
        }

        util.inherits(DeliveryView, BaseView);

        var tableFields = u.union(
            [
                {
                    title: '广告',
                    field: 'name',
                    sortable: true,
                    resizable: true,
                    width: 80,
                    stable: true,
                    content: function (item) {
                        // 要把上级crumb信息打散到参数里
                        var lib = require('esui/lib');
                        var nameLink = ''
                            + '<a href="#/report/delivery/date~id=${id}'
                            + '&${crumbInfo}">${text}</a>';
                        var data = {
                            id: item.id,
                            text: item.name,
                            crumbInfo: item.crumbInfo
                        };
                        return lib.format(nameLink, data);
                    }   
                },
                {
                title: '独立访客',
                field: 'cookie',
                sortable: true,
                resizable: false,
                width: 80,
                stable: true,
                content: function (item) {
                    return u.formatInt(item.cookie, '--');
                }
                },
                {
                    title: '独立IP',
                    field: 'ip',
                    sortable: true,
                    resizable: false,
                    width: 80,
                    stable: true,
                    content: function (item) {
                        return u.formatInt(item.ip, '--');
                    }
                }
            ],
            BaseView.prototype.commonTableFields
        );

        DeliveryView.prototype.uiProperties = u.extend(
            {
                // 表格
                table: {
                    fields: tableFields,
                    select: false,
                    selectMode: 'line',
                    sortable: true,
                    columnResizable: true
                }
            },
            BaseView.prototype.uiProperties
        );
        /** 
         * 使用的模板名称
         *
         * @type {string}
         */
        DeliveryView.prototype.template = 'orderDelivery';

        /** 
         * 重绘图表
         *
         * @override
         */
        DeliveryView.prototype.repaintChart = function () {
            // 重绘图表
            var chart = this.get('bar-chart');
            if (chart) {
                var ySeries = this.model.get('ySeries');
                var xSeries = this.model.get('xSeries');
                chart.setProperties({
                    ySeries: ySeries,
                    xSeries: xSeries
                });
            }
        };

        return DeliveryView;
    }
);