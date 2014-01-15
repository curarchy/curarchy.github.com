/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 频道分组列表视图类
 * @author zhanglili(otakustay@gmail.com), wangyaqiong(catkin2009@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var ListView = require('common/ListView');
        var util = require('er/util');
 
        require('tpl!../channel/tpl/common.tpl.html');
        require('tpl!./tpl/list.tpl.html');

        /**
         * 频道分组列表视图类
         *
         * @constructor
         * @extends common/ListView
         */
        function ChannelGroupListView() {
            ListView.apply(this, arguments);
        }
        
        util.inherits(ChannelGroupListView, ListView);

        /** 
         * 使用的模板名称
         *
         * @type {string}
         */
        ChannelGroupListView.prototype.template = 'channelGroupList';

        var status = require('common/global/status');
        var statusHTMLMapping = [
            status.removed,
            status.normal
        ];

        var tableFields = [
            {
                title: '频道分组名称',
                field: 'name',
                sortable: true,
                resizable: true,
                content: 'name'
            },
            {
                title: '状态',
                field: 'status',
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
                title: '广告位数',
                field: 'usedAdPositionCount',
                resizable: false,
                width: 100,
                stable: true,
                content: function (item) {
                    var lib = require('esui/lib');
                    var slotLinkTemplate = '<a href="#/channelGroup/detail~'
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
                            url: '#/channelGroup/update~id=' + item.id,
                            auth: item.canModify
                        },
                        {
                            text: '查看',
                            type: 'read',
                            url: '#/channelGroup/view~id=' + item.id,
                            auth: !item.canModify
                        // },
                        // {
                        //     text: '报告',
                        //     type: 'report',
                        //     url: '#/reports/channelGroup/' + item.id,
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
        ChannelGroupListView.prototype.uiProperties = {
            table: {
                fields: tableFields
            },

            keyword: {
                placeholder: '请输入频道分组名称或说明'
            }
        };

        return ChannelGroupListView;
    }
);