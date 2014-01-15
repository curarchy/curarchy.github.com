/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 公司模块配置
 * @author lisijin(ibadplum@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var u = require('underscore');

        var actions = [
            {
                path: '/company/list',
                type: 'company/List',
                title: '公司 - 列表',
                authority: ['CLB_COMPANY_VIEW']
            },
            {
                path: '/agent/list',
                movedTo: '/company/list',
                authority: ['CLB_COMPANY_VIEW']
            },
            {
                path: '/company/create',
                type: 'company/Form',
                title: '广告客户',
                args: { formType: 'create', type: 0 },
                authority: ['CLB_COMPANY_NEW']
            },
            {
                path: '/agent/create',
                type: 'company/Form',
                title: '代理机构',
                args: { formType: 'create', type: 1 },
                authority: ['CLB_COMPANY_NEW']
            },
            {
                path: '/company/update',
                type: 'company/Form',
                title: '广告客户',
                args: { formType: 'update', type: 0 },
                authority: ['CLB_COMPANY_MODIFY']
            },
            {
                path: '/agent/update',
                type: 'company/Form',
                title: '代理机构',
                args: { formType: 'update', type: 1 },
                authority: ['CLB_COMPANY_MODIFY']
            },
            {
                path: '/company/view',
                type: 'company/Read',
                title: '广告客户',
                args: { formType: 'view' },
                authority: ['CLB_COMPANY_VIEW']
            },
            {
                path: '/agent/view',
                type: 'company/Read',
                title: '代理机构',
                args: { formType: 'view' },
                authority: ['CLB_COMPANY_VIEW']
            },
            {
                path: '/company/detail',
                type: 'company/Detail',
                title: '广告客户详情',
                authority: ['CLB_COMPANY_VIEW']
            },
            {
                path: '/agent/detail',
                type: 'company/Detail',
                title: '广告客户详情',
                authority: ['CLB_COMPANY_VIEW']
            },
            {
                path: '/customer/detail',
                type: 'company/Detail',
                title: '广告客户详情',
                authority: ['CLB_COMPANY_VIEW']
            }
        ];

        var controller = require('er/controller');
        u.each(actions, controller.registerAction);

        return {
            name: 'company',
            description: '公司',
            requests: {
                search: {
                    name: 'company/search',
                    scope: 'instance',
                    policy: 'auto'
                },
                list: {
                    name: 'company/list',
                    scope: 'instance',
                    policy: 'auto'
                },
                save: {
                    name: 'company/save',
                    scope: 'instance',
                    policy: 'auto'
                },
                update: {
                    name: 'company/update',
                    scope: 'instance',
                    policy: 'auto'
                },
                remove: {
                    name: 'company/remove',
                    scope: 'instance',
                    policy: 'auto'
                },
                restore: {
                    name: 'company/restore',
                    scope: 'instance',
                    policy: 'auto'
                },
                findById: {
                    name: 'company/findById',
                    scope: 'instance',
                    policy: 'auto'
                }
            }
        };
    }
);        
