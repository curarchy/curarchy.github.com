/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file TODO: 添加文件说明
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var BaseData = require('common/BaseData');
        var util = require('er/util');
        var u = require('underscore');

        function ChannelData() {
            BaseData.call(this, 'channel');
        }

        util.inherits(ChannelData, BaseData);

        var requests = {
            search: {
                name: 'channel/search',
                scope: 'instance',
                policy: 'auto'
            },
            list: {
                name: 'channel/list',
                scope: 'instance',
                policy: 'auto'
            },
            save: {
                name: 'channel/save',
                scope: 'instance',
                policy: 'auto'
            },
            update: {
                name: 'channel/update',
                scope: 'instance',
                policy: 'auto'
            },
            remove: {
                name: 'channel/remove',
                scope: 'instance',
                policy: 'auto'
            },
            restore: {
                name: 'channel/restore',
                scope: 'instance',
                policy: 'auto'
            },
            findById: {
                name: 'channel/findById',
                scope: 'instance',
                policy: 'auto'
            },
            tree: {
                name: 'channel/tree',
                scope: 'instance',
                policy: 'auto'
            }
        };

        var ajax = require('er/ajax');
        u.each(
            requests,
            function (config) {
                ajax.register(ChannelData, config.name, config);
            }
        );

        return ChannelData;
    }
);        
