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
                    title: '广告',
                    field: 'name',
                    sortable: true,
                    resizable: true,
                    width: 80,
                    stable: true,
                    content: function (item) {
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
                    title: '所属广告客户',
                    field: 'adOwnerName',
                    sortable: true,
                    resizable: true,
                    width: 50,
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
                    width: 50,
                    stable: true,
                    content: function (item) {
                        return item['salerName'] || '--';
                    }   
                },
                {
                    title: '所属订单',
                    field: 'orderName',
                    sortable: true,
                    resizable: true,
                    width: 50,
                    stable: true,
                    content: function (item) {
                        return item['orderName'] || '--';
                    }      
                },
                {
                    title: '展现量',
                    field: 'deliveryView',
                    sortable: true,
                    resizable: false,
                    width: 80,
                    stable: true,
                    content: function (item) {
                        return u.formatInt(item.deliveryView, '--');
                    }
                }
            ],
            BaseView.prototype.commonTableFields
        );

        GeneralReportView.prototype.uiProperties = u.extend(
            {    
                // channels: {
                //     itemName: '频道',
                //     title: '选择频道',
                //     emptyText: '没有符合条件的频道',
                //     mode: 'add',
                //     skin: 'authority',
                //     height: 390,
                //     width: 200,
                //     multi: true,
                //     tableType: 'tree',
                //     getItemHTML: commonGetTreeItemHtml
                // },
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
        GeneralReportView.prototype.template = 'deliveryGeneral';
        
        GeneralReportView.prototype.getSearchArgs = function () {
            var args = BaseView.prototype.getSearchArgs.apply(this, arguments);
            // 获取flag
            var flag = this.model.get('flag');
            args.flag = flag;
            return args;
        };
        return GeneralReportView;
    }
);