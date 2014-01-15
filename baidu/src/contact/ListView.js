/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 联系人列表视图类
 * @author liyidong(liyidong@baidu.com)
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
        function ContactListView() {
            ListView.apply(this, arguments);
        }

        util.inherits(ContactListView, ListView);

        /** 
         * 使用的模板名称
         *
         * @type {string}
         */
        ContactListView.prototype.template = 'contactList';

        var status = require('common/global/status');
        var statusHTMLMapping = {
            0: status.uninvite, // 未邀请
            1: status.inactive,  // 待激活
            2: status.expired,  // 已过期
            3: status.active,   // 已激活
            4: status.stop,    // 停用
            5: status.removed   // 删除
        };

        var tableFields = [
            {
                title: '联系人姓名',
                field: 'name',
                sortable: true,
                resizable: false,
                width: 120,
                stable: false,
                content: 'name'
            },
            {
                title: '用户名',
                field: 'loginName',
                sortable: false,
                resizable: false,
                width: 120,
                stable: false,
                content: 'loginName'
            },
            {
                title: '电子邮件',
                field: 'mail',
                sortable: true,
                resizable: false,
                width: 180,
                stable: false,
                content: 'mail'
            },
            {
                title: '状态',
                field: 'status',
                sortable: false,
                resizable: false,
                width: 120,
                stable: true,
                content: function (item) {
                    var status = statusHTMLMapping[item.status];
                    var Table = require('esui/Table');
                    var reinvite = '';
                    if (item.canReinvite) {
                        var config = {
                            command: 'reinvite',
                            args: item.id,
                            // TODO: 将manager-list-reinvite的样式通用化
                            className: 'link-like manager-list-reinvite',
                            text: '重新邀请'
                        };
                        reinvite = Table.command(config);
                    }
                    return Table.status(status) + reinvite;
                }
            },
            {
                title: '公司',
                field: 'companyName',
                sortable: true,
                resizable: false,
                width: 180,
                stable: false,
                content: 'companyName'
            },
            {
                title: '操作',
                field: 'operation',
                sortable: false,
                resizable: false,
                width: 50,
                stable: true,
                content: function (item) {
                    var config = [
                        {
                            text: '修改',
                            type: 'modify',
                            auth: item.canModify,
                            url: '#/contact/update~id=' + item.id
                        },
                        {
                            text: '查看',
                            type: 'read',
                            auth: !item.canModify,
                            url: '#/contact/view~id=' + item.id
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
        ContactListView.prototype.uiProperties = {
            table: {
                fields: tableFields
            },
            keyword: {
                placeholder: '请输入联系人姓名或电子邮件'
            }
        };

        /**
         * 控件事件配置
         *
         * @type {Object}
         * @override
         */
        ContactListView.prototype.uiEvents = {
            'table:command': reinvites
        };

        /**
         * 获取重新邀请状态
         * @param {Object} e 控件事件对象
         */ 
        function reinvites(e) {
            if (e.name === 'reinvite') {
                var inviteID = e.args;
                this.fire('reinvite', { id: inviteID });
            }
        }
        
        return ContactListView;
    }
);