/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 频道列表视图类
 * @author wangyaqiong(wangyaqiong@baidu.com), zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var ListView = require('common/ListView');
        var util = require('er/util');

        require('tpl!./tpl/common.tpl.html');
        require('tpl!./tpl/list.tpl.html');

        /**
         * 频道分组列表视图类
         *
         * @constructor
         * @extends common/ListView
         */
        function ChannelListView() {
            ListView.apply(this, arguments);
        }
        
        util.inherits(ChannelListView, ListView);

        /** 
         * 使用的模板名称
         *
         * @type {string}
         */
        ChannelListView.prototype.template = 'channelList';

        var status = require('common/global/status');
        var statusHTMLMapping = [
            status.removed,
            status.normal
        ];

        var tableFields = [
            {
                title: '频道名称',
                field: 'name',
                sortable: true,
                resizable: true,
                content: 'name'
            },
            {
                title: '状态',
                field: 'status',
                sortable: false,
                resizable: false,
                width: 100,
                stable: true,
                content: function (item) {
                    var status = statusHTMLMapping[item.status];
                    var Table = require('esui/Table');
                    return Table.status(status);
                }
            },
            {
                title: '所属频道分组',
                field: 'channelGroupName',
                sortable: false,
                resizable: false,
                content: function (item) {
                    return item.channelGroupName || '--';
                }
            },
            {
                title: '广告位数',
                field: 'usedAdpositionCount',
                sortable: false,
                resizable: false,
                width: 100,
                stable: true,
                content: function (item) {
                    var lib = require('esui/lib');
                    var slotLinkTemplate = '<a href="#/channel/detail~'
                        + 'id=${id}&status=all">${text}</a>';
                    var data = {
                        id: item.id,
                        text: item.usedAdpositionCount
                    };
                    return lib.format(
                       slotLinkTemplate,
                       data
                    );         
                }
            },
            {
                title: '操作',
                field: 'operation',
                sortable: false,
                resizable: false,
                width: 80,
                stable: true,
                content: function (item) {
                    var config = [
                        {
                            text: '修改',
                            type: 'modify',
                            url: '#/channel/update~id=' + item.id,
                            auth: item.canModify
                        },
                        {
                            text: '查看',
                            type: 'read',
                            url: '#/channel/view~id=' + item.id,
                            auth: !item.canModify
                        // },
                        // {
                        //     text: '报告',
                        //     type: 'report',
                        //     url: '#/reports/channel/' + item.id,
                        //     auth: item.hasReport
                        }
                    ];

                    var Table = require('esui/Table');
                    return Table.operations(config);
                }
            }
        ];

        /**
         * 控件额外属性
         *
         * @type {Object}
         */
        ChannelListView.prototype.uiProperties = {
            table: {
                fields: tableFields
            },

            keyword: {
                placeholder: '请输入频道名称或说明'
            }
        };

        return ChannelListView;
    }
);