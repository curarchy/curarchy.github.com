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
        var m = require('moment');

        require('tpl!./tpl/date.tpl.html');

        /**
         * 整体每日报告视图类
         *
         * @constructor
         * @extends report/adPosition/BaseView
         */
        function DateView() {
            BaseView.apply(this, arguments);
        }

        util.inherits(DateView, BaseView);

        var tableFields = u.union(
            [{
                title: '日期',
                field: 'time',
                sortable: true,
                resizable: true,
                width: 100,
                stable: true,
                content: function (item) {
                    return m(item.time, 'YYYYMMDD').format('YYYY-MM-DD');
                }
            }],
            BaseView.prototype.commonTableFields
        );

        DateView.prototype.uiProperties = u.extend(
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
        DateView.prototype.template = 'creativeDate';
        
        return DateView;
    }
);