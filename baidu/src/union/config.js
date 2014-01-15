/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file union模块配置
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var u = require('underscore');

        var actions = [
            {
                path: '/union/cproSetting',
                type: 'union/CproSetting',
                title: '网盟样式配置',
                args: { formType: 'update' }
            }
        ];

        var controller = require('er/controller');
        u.each(actions, controller.registerAction);

        return {
            name: 'union',
            description: 'union',
            requests: {
                updateCproSetting: {
                    name: 'cproSetting/update',
                    scope: 'instance',
                    policy: 'auto'
                }
            }
        };
    }
);        
