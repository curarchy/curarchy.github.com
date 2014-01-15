/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 广告模块配置
 * @author liyidong(srhb18@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var u = require('underscore');

        var actions = [
            {
                path: '/delivery/list',
                type: 'delivery/List',
                title: '广告 - 列表',
                auth: ['CLB_DELIVERY_VIEW']
            },
            {
                path: '/delivery/create',
                type: 'delivery/Form',
                title: '新建广告',
                args: { formType: 'create', deliveryType: 'direct' },
                auth: ['CLB_DELIVERY_MODIFY']
            },
            {
                path: '/delivery/update',
                type: 'delivery/Form',
                title: '修改广告',
                args: { formType: 'update', deliveryType: 'direct' },
                auth: ['CLB_DELIVERY_MODIFY']
            },
            {
                path: '/delivery/view',
                type: 'delivery/Read',
                title: '查看广告信息',
                auth: ['CLB_DELIVERY_VIEW']
            },
            {
                path: '/delivery/detail',
                type: 'delivery/Detail',
                title: '广告详情',
                auth: ['CLB_DELIVERY_VIEW']
            },
            {
                path: '/delivery/amount',
                type: 'delivery/AmountField',
                isChildOnly: !!window.DEBUG
            }
        ];

        var controller = require('er/controller');
        u.each(actions, controller.registerAction);

        var controls = {
            Orient: 'delivery/ui'
        };
        var tpl = require('tpl');
        u.each(controls, tpl.registerControl);

        return {
            name: 'delivery',
            description: '广告'
        };
    }
);
