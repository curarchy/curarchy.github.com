/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 广告位模块配置
 * @author wangyaqiong(catkin2009@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var u = require('underscore');

        var actions = [
            {
                path: '/slot/list',
                type: 'slot/List',
                title: '广告位 - 列表',
                authority: ['CLB_ADPOSITION_VIEW']
            },
            {
                path: '/slot/create',
                type: 'slot/Form',
                title: '新建广告位',
                args: { formType: 'create' },
                authority: ['CLB_ADPOSITION_NEW']
            },
            {
                path: '/slot/update',
                type: 'slot/Form',
                title: '修改广告位',
                args: { formType: 'update' },
                authority: ['CLB_ADPOSITION_MODIFY']
            },
            {
                path: '/slot/view',
                type: 'slot/Read',
                title: '查看广告位信息',
                authority: ['CLB_ADPOSITION_VIEW']
            },
            {
                path: '/slot/detail',
                type: 'slot/Detail',
                title: '广告位详情',
                 authority: ['CLB_ADPOSITION_VIEW']
            },
            {
                path: '/slot/batchOrder',
                type: 'slot/SlotBatchOrderForm',
                title: '批量修改显示顺序'
            },
            {
                path: '/slot/batchChannel',
                type: 'slot/SlotBatchChannelForm',
                title: '批量修改频道'
            },
            {
                path: '/slot/batch',
                type: 'slot/BatchForm',
                title: '批量创建广告位'
            },
            {
                path: '/slot/select',
                type: 'slot/Selector',
                title: '选择广告位'
            },
            {
                path: '/slot/generateCode',
                type: 'slot/SlotCodeGenerator',
                title: '获取代码'
            }
        ];

        var controller = require('er/controller');
        u.each(actions, controller.registerAction);

        return {
            name: 'slot',
            description: '广告位',
            requests: {
                search: {
                    name: 'slot/search',
                    scope: 'instance',
                    policy: 'auto'
                },
                list: {
                    name: 'slot/list',
                    scope: 'instance',
                    policy: 'auto'
                },
                save: {
                    name: 'slot/save',
                    scope: 'instance',
                    policy: 'auto'
                },
                update: {
                    name: 'slot/update',
                    scope: 'instance',
                    policy: 'auto'
                },
                remove: {
                    name: 'slot/remove',
                    scope: 'instance',
                    policy: 'auto'
                },
                restore: {
                    name: 'slot/restore',
                    scope: 'instance',
                    policy: 'auto'
                },
                findById: {
                    name: 'slot/findById',
                    scope: 'instance',
                    policy: 'auto'
                },
                tree: {
                    name: 'slot/tree',
                    scope: 'instance',
                    policy: 'auto'
                },
                size: {
                    name: 'slot/size',
                    scope: 'instance',
                    policy: 'auto'
                }
                // TODO: 有其它请求在此配置
            }
        };
    }
);        
