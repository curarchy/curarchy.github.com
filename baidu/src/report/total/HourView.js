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

        require('tpl!./tpl/date.tpl.html');

        /**
         * 整体每日报告视图类
         *
         * @constructor
         * @extends report/total/BaseView
         */
        function HourView() {
            BaseView.apply(this, arguments);
        }

        util.inherits(HourView, BaseView);

        var tableFields = u.union(
            [
                {
                    title: '小时',
                    field: 'time',
                    sortable: true,
                    resizable: true,
                    width: 100,
                    stable: true,
                    content: 'time'
                }
            ],
            BaseView.prototype.commonTableFields
        );

        HourView.prototype.uiProperties = u.extend(
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
        HourView.prototype.template = 'totalDate';
        
        return HourView;
    }
);