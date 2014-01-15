/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 订单报告视图基类
 * @author wangyaqiong(catkin2009@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var ReportView = require('common/ReportView');
        var util = require('er/util');
        var u = require('underscore');
        require('tpl!./tpl/common.tpl.html');

        /**
         * 广告报告视图类
         *
         * @constructor
         * @extends common/ReportView
         */
        function BaseView() {
            ReportView.apply(this, arguments);
        }
        
        util.inherits(BaseView, ReportView);

        // 这个报告里每个报告都会展示的那几个field
        BaseView.prototype.commonTableFields = [
            {
                title: '广告展现量',
                field: 'deliveryView',
                sortable: true,
                resizable: true,
                width: 80,
                stable: true,
                content: function (item) {
                    return u.formatInt(item.deliveryView, '--');
                }
            },
            {
                title: '点击量',
                field: 'click',
                sortable: true,
                resizable: false,
                width: 80,
                stable: true,
                content: function (item) {
                    return u.formatInt(item.click, '--');
                }
            },
            {
                title: '点击率',
                field: 'ctr',
                sortable: true,
                resizable: false,
                width: 80,
                stable: true,
                content: function (item) {
                    return item.ctr ? (item.ctr + '%') : '--';
                }
            },
            {
                title: '每千次展现收入',
                field: 'cpm',
                sortable: true,
                resizable: false,
                width: 80,
                stable: true,
                content: function (item) {
                    var unit = item.cpm ? '&yen;' : '';
                    return unit + u.formatMoney(item.cpm, '--');
                }
            },
            {
                title: '收入',
                field: 'income',
                sortable: true,
                resizable: false,
                width: 80,
                stable: true,
                content: function (item) {
                    var unit = item.income ? '&yen;' : '';
                    return unit + u.formatMoney(item.income, '--');
                }
            }
        ];

        /**
         * 声明当前视图关联的控件的额外属性，参考`uiProperties`属性
         *
         * @override
         */
        BaseView.prototype.uiProperties = 
            ReportView.prototype.getUIProperties();

        return BaseView;
    }
);