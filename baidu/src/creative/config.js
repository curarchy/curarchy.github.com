/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 创意模块配置
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var u = require('underscore');

        var actions = [
            {
                path: '/creative/list',
                type: 'creative/List',
                documentTitle: '创意 - 列表',
                auth: ['CLB_AD_VIEW']
            },
            {
                path: '/creative/create',
                type: 'creative/Form',
                documentTitle: '新建创意',
                args: { formType: 'create' },
                auth: ['CLB_AD_MODIFY']
            },
            {
                path: '/creative/update',
                type: 'creative/Form',
                documentTitle: '修改创意',
                args: { formType: 'update' },
                auth: ['CLB_AD_MODIFY']
            },
            {
                path: '/creative/view',
                type: 'creative/Read',
                documentTitle: '查看创意信息',
                auth: ['CLB_AD_VIEW']
            }
        ];

        var controller = require('er/controller');
        u.each(actions, controller.registerAction);

        return {
            name: 'creative',
            description: '创意'
        };
    }
);        
