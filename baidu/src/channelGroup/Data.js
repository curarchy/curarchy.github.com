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

        function ChannelGroupData() {
            BaseData.call(this, 'channelGroup');
        }

        ChannelGroupData.prototype.tree = function () {
            return this.request(
                '$entity/tree',
                {},
                { 
                    method: 'GET',
                    url: '/$entity/tree' 
                }
            );
        };

        util.inherits(ChannelGroupData, BaseData);

        var requests = {
            search: {
                name: 'channelGroup/search',
                scope: 'instance',
                policy: 'auto'
            },
            list: {
                name: 'channelGroup/list',
                scope: 'instance',
                policy: 'auto'
            },
            save: {
                name: 'channelGroup/save',
                scope: 'instance',
                policy: 'auto'
            },
            update: {
                name: 'channelGroup/update',
                scope: 'instance',
                policy: 'auto'
            },
            remove: {
                name: 'channelGroup/remove',
                scope: 'instance',
                policy: 'auto'
            },
            restore: {
                name: 'channelGroup/restore',
                scope: 'instance',
                policy: 'auto'
            },
            findById: {
                name: 'channelGroup/findById',
                scope: 'instance',
                policy: 'auto'
            },
            tree: {
                name: 'channelGroup/tree',
                scope: 'instance',
                policy: 'auto'
            }
        };

        var ajax = require('er/ajax');
        u.each(
            requests,
            function (config) {
                ajax.register(ChannelGroupData, config.name, config);
            }
        );

        return ChannelGroupData;
    }
);        
