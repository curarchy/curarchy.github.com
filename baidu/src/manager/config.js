/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 管理员模块配置
 * @author liyidong(undefined)
 * @date $DATE$
 */
define(
    function (require) {
        var u = require('underscore');

        var actions = [
            {
                path: '/manager/list',
                type: 'manager/List',
                title: '管理员 - 列表',
                authority: ['CLB_SUBMANAGER_VIEW']
            },
            {
                path: '/manager/create',
                type: 'manager/Form',
                title: '新建管理员',
                args: { formType: 'create' },
                authority: ['CLB_SUBMANAGER_NEW'],
                noAuthorityLocation: '/409'
            },
            {
                path: '/manager/update',
                type: 'manager/Form',
                title: '修改管理员',
                args: { formType: 'update' },
                authority: ['CLB_SUBMANAGER_MODIFY'],
                noAuthorityLocation: '/409'
            },
            {
                path: '/manager/view',
                type: 'manager/Read',
                title: '查看管理员信息',
                authority: ['CLB_SUBMANAGER_VIEW']
            }
        ];

        var controller = require('er/controller');
        u.each(actions, controller.registerAction);

        return {
            name: 'manager',
            description: '管理员',
            requests: {
                search: {
                    name: 'manager/search',
                    scope: 'instance',
                    policy: 'auto'
                },
                list: {
                    name: 'manager/list',
                    scope: 'instance',
                    policy: 'auto'
                },
                save: {
                    name: 'manager/save',
                    scope: 'instance',
                    policy: 'auto'
                },
                update: {
                    name: 'manager/update',
                    scope: 'instance',
                    policy: 'auto'
                },
                remove: {
                    name: 'manager/remove',
                    scope: 'instance',
                    policy: 'auto'
                },
                restore: {
                    name: 'manager/restore',
                    scope: 'instance',
                    policy: 'auto'
                },
                findById: {
                    name: 'manager/findById',
                    scope: 'instance',
                    policy: 'auto'
                },
                authority: {
                    name: 'manager/authorities',
                    scope: 'instance',
                    policy: 'auto'
                },
                invite: {
                    name: 'manager/invite',
                    scope: 'instance',
                    // 参见contact/invite
                    policy: 'abort'
                }
                // TODO: 有其它请求在此配置
            }
        };
    }
);        
