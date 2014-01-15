/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 广告位排期表模块配置
 * @author exodia(dengxinxin@baidu.com)
 * @date $DATE$
 */
define(
    function () {
        var u = require('underscore');
        var actions = [
            {
                path: '/schedule',
                type: 'tool/schedule/List',
                title: '广告位排期表'
            }
        ];
        var controller = require('er/controller');
        u.each(actions, controller.registerAction);

        var controls = {
            ScheduleTable: 'tool/schedule/ui',
            ScheduleInfoLayer: 'tool/schedule/ui'
        };
        var tpl = require('tpl');
        u.each(controls, tpl.registerControl);

        return {
            name: 'schedule',
            description: '广告位排期表'
        };
    }
);        
