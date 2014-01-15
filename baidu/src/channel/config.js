/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 频道模块配置
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var u = require('underscore');

        var actions = [
            {
                path: '/channel/list',
                type: 'channel/List',
                title: '频道 - 列表',
                authority: ['CLB_CHANNEL_VIEW']
            },
            {
                path: '/channel/create',
                type: 'channel/Form',
                title: '新建频道',
                args: { formType: 'create' },
                authority: ['CLB_CHANNEL_NEW']
            },
            {
                path: '/channel/update',
                type: 'channel/Form',
                title: '修改频道',
                args: { formType: 'update' },
                authority: ['CLB_CHANNEL_MODIFY']
            },
            {
                path: '/channel/view',
                type: 'channel/Read',
                title: '查看频道信息',
                args: { formType: 'view' },
                authority: ['CLB_CHANNEL_VIEW']
            },
            {
                path: '/channel/batch',
                type: 'channel/BatchForm',
                title: '批量创建频道'
            },
            {
                path: '/channel/detail',
                type: 'channel/Detail',
                title: '频道详情',
                authority: ['CLB_ADPOSITION_VIEW']
            },
            {
                path: '/slot/all',
                type: 'channel/Detail',
                title: '所有广告位',
                authority: ['CLB_ADPOSITION_VIEW']
            }
        ];

        var controller = require('er/controller');
        u.each(actions, controller.registerAction);

        return {
            name: 'channel',
            description: '频道',
            requests: {
                search: {
                    name: 'channel/search',
                    scope: 'instance',
                    policy: 'auto'
                },
                list: {
                    name: 'channel/list',
                    scope: 'instance',
                    policy: 'auto'
                },
                save: {
                    name: 'channel/save',
                    scope: 'instance',
                    policy: 'auto'
                },
                update: {
                    name: 'channel/update',
                    scope: 'instance',
                    policy: 'auto'
                },
                remove: {
                    name: 'channel/remove',
                    scope: 'instance',
                    policy: 'auto'
                },
                restore: {
                    name: 'channel/restore',
                    scope: 'instance',
                    policy: 'auto'
                },
                findById: {
                    name: 'channel/findById',
                    scope: 'instance',
                    policy: 'auto'
                },
                tree: {
                    name: 'channel/tree',
                    scope: 'instance',
                    policy: 'auto'
                }
            }
        };
    }
);        
