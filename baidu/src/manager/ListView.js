/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 管理员列表视图类
 * @author liyidong(undefined)
 * @date $DATE$
 */
define(
    function (require) {
        var ListView = require('common/ListView');
        var util = require('er/util');

        require('tpl!./tpl/list.tpl.html');
        require('tpl!./tpl/common.tpl.html');

        /**
         * 频道分组列表视图类
         *
         * @constructor
         * @extends common/ListView
         */
        function ManagerListView() {
            ListView.apply(this, arguments);
        }
        
        util.inherits(ManagerListView, ListView);

        /**
         * 控件事件配置
         *
         * @type {Object}
         * @override
         */
        ManagerListView.prototype.uiEvents = {
            'table:command': reinvite
        };

        /**
         * 获取重新邀请状态
         * @param {Object} e 控件事件对象
         */ 
        function reinvite(e) {
            if (e.name === 'reinvite') {
                var inviteID = e.args;
                this.fire('reinvite', { id: inviteID });
            }
        }

        /** 
         * 使用的模板名称
         *
         * @type {string}
         */
        ManagerListView.prototype.template = 'managerList';

        var system = require('common/global/system');
        var roleMap = system.subManagerInfoRoleMap;
        var status = require('common/global/status');
        var statusHTMLMapping = {
            5: status.removed, // 删除
            1: status.inactive, // 未激活（重新邀请）
            3: status.active, // 已激活
            2: status.expired // 已过期（重新邀请）
        };

        var tableFields = [
            {
                title: '管理员姓名',
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
                            className: 'link-like manager-list-reinvite',
                            text: '重新邀请'
                        };
                        reinvite = Table.command(config);
                    }
                    return Table.status(status) + reinvite;
                }
            },
            {
                title: '角色',
                field: 'role',
                sortable: false,
                resizable: false,
                width: 280,
                stable: false,
                content: function (item) {
                    var roles = item.role.split(',');
                    var roleText = [];
                    for (var i = 0; i < roles.length; i++) {
                        roleText.push(roleMap[roles[i]]);
                    }
                    return roleText.join('，');
                }
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
                            url: '#/manager/update~id=' + item.id,
                            auth: item.canModify
                        },
                        {
                            text: '查看',
                            type: 'read',
                            url: '#/manager/view~id=' + item.id,
                            auth: !item.canModify
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
        ManagerListView.prototype.uiProperties = {
            table: {
                fields: tableFields
            },
            keyword: {
                placeholder: '请输入管理员姓名或电子邮件'
            }
        };

        return ManagerListView;
    }
);
