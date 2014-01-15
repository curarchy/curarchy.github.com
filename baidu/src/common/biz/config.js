/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 通用业务模块配置
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var u = require('underscore');

        var actions = [
            {
                path: '/createChannelAndGroup',
                type: 'common/biz/CreateChannelAndGroup',
                title: '新建频道/频道分组',
                auth: ['CLB_CHANNEL_VIEW']
            }
        ];

        var controller = require('er/controller');
        u.each(actions, controller.registerAction);
    }
);        
