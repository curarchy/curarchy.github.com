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
                    title: '广告位',
                    field: 'name',
                    sortable: true,
                    resizable: true,
                    width: 80,
                    stable: true,
                    content: function (item) {
                        var lib = require('esui/lib');
                        var nameLink = ''
                            + '<a href="#/report/slot/date~id=${id}'
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
                    title: '所属频道分组',
                    field: 'channelGroupName',
                    sortable: true,
                    resizable: true,
                    width: 80,
                    stable: true,
                    content: function (item) {
                        return item.channelGroupName || '--';
                    }
                },
                {
                    title: '所属频道',
                    field: 'channelName',
                    sortable: true,
                    resizable: true,
                    width: 80,
                    stable: true,
                    content: function (item) {
                        return item.channelName || '--';
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

        GeneralReportView.prototype.getSearchArgs = function () {
            var args = BaseView.prototype.getSearchArgs.apply(this, arguments);
            if (args.size) {
                var sizeAttrs = args.size.split('*');
                if (sizeAttrs.length > 0) {
                    args.width = sizeAttrs[0];
                    args.height = sizeAttrs[1];
                    delete args.size;
                }
            }
            return args;
        };

        /** 
         * 使用的模板名称
         *
         * @type {string}
         */
        GeneralReportView.prototype.template = 'slotGeneral';
        
        return GeneralReportView;
    }
);