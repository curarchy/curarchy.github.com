/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 联系人模块配置
 * @author liyidong(undefined)
 * @date $DATE$
 */
define(
    function (require) {
        var u = require('underscore');

        var actions = [
            {
                path: '/contact/list',
                type: 'contact/List',
                title: '联系人 - 列表',
                authority: ['CLB_CONTACTOR_VIEW'],
                noAuthorityLocation: '/409'
            },
            {
                path: '/contact/create',
                type: 'contact/Form',
                title: '新建联系人',
                args: { formType: 'create' },
                authority: ['CLB_CONTACTOR_NEW'],
                noAuthorityLocation: '/409'
            },
            {
                path: '/contact/update',
                type: 'contact/Form',
                title: '修改联系人',
                args: { formType: 'update' },
                authority: ['CLB_CONTACTOR_MODIFY'],
                noAuthorityLocation: '/409'
            },
            {
                path: '/contact/view',
                type: 'contact/Read',
                title: '查看联系人信息',
                authority: ['CLB_CONTACTOR_VIEW'],
                noAuthorityLocation: '/409'
            }
        ];

        var controller = require('er/controller');
        u.each(actions, controller.registerAction);

        return {
            name: 'contact',
            description: '联系人',
            requests: {
                search: {
                    name: 'contact/search',
                    scope: 'instance',
                    policy: 'auto'
                },
                list: {
                    name: 'contact/list',
                    scope: 'instance',
                    policy: 'auto'
                },
                save: {
                    name: 'contact/save',
                    scope: 'instance',
                    policy: 'auto'
                },
                update: {
                    name: 'contact/update',
                    scope: 'instance',
                    policy: 'auto'
                },
                remove: {
                    name: 'contact/remove',
                    scope: 'instance',
                    policy: 'auto'
                },
                restore: {
                    name: 'contact/restore',
                    scope: 'instance',
                    policy: 'auto'
                },
                stop: {
                    name: 'contact/stop',
                    scope: 'instance',
                    policy: 'auto'
                },
                findById: {
                    name: 'contact/findById',
                    scope: 'instance',
                    policy: 'auto'
                },
                invite: {
                    name: 'contact/invite',
                    scope: 'instance',
                    // 因为每一次邀请后有5分钟的CD时间，因此这里必须以最新的为准
                    policy: 'abort'
                }
                // TODO: 有其它请求在此配置
            }
        };
    }
);        
