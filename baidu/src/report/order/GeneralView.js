/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 订单一级报告View
 * @author wangyaqiong(catkin2009@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var BaseView = require('./BaseView');
        var util = require('er/util');
        var u = require('underscore');

        require('tpl!./tpl/general.tpl.html');

        /**
         * 整体每日报告视图类
         *
         * @constructor
         * @extends report/slot/BaseView
         */
        function GeneralReportView() {
            BaseView.apply(this, arguments);
        }

        util.inherits(GeneralReportView, BaseView);

        var tableFields = u.union(
            [
                {
                    title: '订单',
                    field: 'name',
                    sortable: true,
                    resizable: true,
                    width: 100,
                    stable: true,
                    content: function (item) {
                        var lib = require('esui/lib');
                        var nameLink = ''
                            + '<a href="#/report/order/date~id=${id}'
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
                    title: '所属广告客户',
                    field: 'adOwnerName',
                    sortable: true,
                    resizable: true,
                    width: 80,
                    stable: true,
                    content: function (item) {
                        return item['adOwnerName'] || '--';
                    }
                },
                {
                    title: '所属销售人员',
                    field: 'salerName',
                    sortable: true,
                    resizable: true,
                    width: 80,
                    stable: true,
                    content: function (item) {
                        return item['salerName'] || '--';
                    }
                }
            ],
            BaseView.prototype.commonTableFields
        );

        GeneralReportView.prototype.uiProperties = u.extend(
            {    
                table: {
                    fields: tableFields,
                    select: false,
                    selectMode: 'line',
                    sortable: true,
                    columnResizable: true
                }
            },
            BaseView.prototype.getUIProperties()
        );

        /** 
         * 使用的模板名称
         *
         * @type {string}
         */
        GeneralReportView.prototype.template = 'orderGeneral';
        
        return GeneralReportView;
    }
);