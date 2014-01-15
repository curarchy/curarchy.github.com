define(
    function (require) {
        var u = require('underscore');

        var actions = [
            {
                path: '/channelGroup/list',
                type: 'channelGroup/List',
                title: '频道分组 - 列表',
                authority: ['CLB_CHANNEL_VIEW']
            },
            {
                path: '/channelGroup/create',
                type: 'channelGroup/Form',
                title: '新建频道分组',
                args: { formType: 'create' },
                authority: ['CLB_CHANNEL_NEW'],
                noAuthorityLocation: '/409'
            },
            {
                path: '/channelGroup/update',
                type: 'channelGroup/Form',
                title: '修改频道分组',
                args: { formType: 'update' },
                authority: ['CLB_CHANNEL_MODIFY'],
                noAuthorityLocation: '/409'
            },
            {
                path: '/channelGroup/view',
                type: 'channelGroup/Read',
                title: '查看频道分组信息',
                args: { formType: 'view' },
                authority: ['CLB_CHANNEL_VIEW'],
                noAuthorityLocation: '/409'
            },
            {
                path: '/channelGroup/detail',
                type: 'channelGroup/Detail',
                title: '频道分组详情',
                authority: ['CLB_ADPOSITION_VIEW']
            }
        ];

        var controller = require('er/controller');
        u.each(actions, controller.registerAction);

        return {
            name: 'channelGroup',
            description: '频道分组',
            requests: {
                search: {
                    name: 'channelGroup/search',
                    scope: 'instance',
                    policy: 'auto'
                },
                list: {
                    name: 'channelGroup/list',
                    scope: 'instance',
                    policy: 'auto'
                },
                save: {
                    name: 'channelGroup/save',
                    scope: 'instance',
                    policy: 'auto'
                },
                update: {
                    name: 'channelGroup/update',
                    scope: 'instance',
                    policy: 'auto'
                },
                remove: {
                    name: 'channelGroup/remove',
                    scope: 'instance',
                    policy: 'auto'
                },
                restore: {
                    name: 'channelGroup/restore',
                    scope: 'instance',
                    policy: 'auto'
                },
                findById: {
                    name: 'channelGroup/findById',
                    scope: 'instance',
                    policy: 'auto'
                }
                // TODO: 有其它请求在此配置
            }
        };
    }
);        
