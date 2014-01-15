/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 历史查询工具模块配置
 * @author wangyaqiong(wangyaqiong@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var u = require('underscore');

        var actions = [
            {
                path: '/history',
                type: 'tool/history/List',
                title: '历史查询工具-列表'
            }
        ];

        var controller = require('er/controller');
        u.each(actions, controller.registerAction);

        return {
            name: 'history',
            entityDescription: '历史查询工具',
            requests: {
                search: {
                    name: 'history/search',
                    scope: 'instance',
                    policy: 'auto'
                }
            }
        };
    }
);        
