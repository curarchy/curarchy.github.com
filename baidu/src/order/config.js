/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 订单模块配置
 * @author undefined(undefined)
 * @date $DATE$
 */
define(
    function (require) {
        var u = require('underscore');

        var actions = [
            {
                path: '/order/list',
                type: 'order/List',
                title: '订单 - 列表',
                auth: ['CLB_ORDER_VIEW']
            },
            {
                path: '/order/create',
                type: 'order/Form',
                title: '新建订单',
                args: { formType: 'create' },
                auth: ['CLB_ORDER_MODIFY']
            },
            {
                path: '/order/update',
                type: 'order/Form',
                title: '修改订单',
                args: { formType: 'update' },
                auth: ['CLB_ORDER_MODIFY']
            },
            {
                path: '/order/view',
                type: 'order/Read',
                title: '查看订单信息',
                auth: ['CLB_ORDER_VIEW']
            },
            {
                path: '/order/all',
                type: 'order/Detail',
                title: '全部订单',
                auth: ['CLB_ORDER_VIEW']
            },
            {
                path: '/order/detail',
                type: 'order/Detail',
                title: '订单详情',
                auth: ['CLB_ORDER_VIEW']
            },
            {
                path: '/order/slots',
                type: 'order/SlotSection',
                title: '广告位资源',
                auth: ['CLB_ORDER_VIEW'],
                isChildAction: !!window.DEBUG
            }
        ];

        var controller = require('er/controller');
        u.each(actions, controller.registerAction);

        var controls = {
            OrderSwitchTab: 'order/ui'
        };
        var tpl = require('tpl');
        u.each(controls, tpl.registerControl);

        return {
            name: 'order',
            description: '订单'
        };
    }
);        
