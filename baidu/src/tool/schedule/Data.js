/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file Schedule数据类
 * @author exodia
 * @date 13-12-9
 */
define(
    function (require) {
        var BaseData = require('common/BaseData');
        var util = require('er/util');
        var u = require('underscore');

        /**
         * Schedule数据类
         *
         * @constructor
         * @extends common/BaseData
         */
        function ScheduleData() {
            BaseData.call(this, 'schedule');
        }

        util.inherits(ScheduleData, BaseData);

        /**
         * 检索一个实体列表
         *
         * @param {Object} query 查询参数
         * @return {FakeXHR}
         */
        ScheduleData.prototype.search = function (query) {
            return this.request(
                '$entity/search',
                query,
                {
                    method: 'GET',
                    url: '/adPositions/schedule'
                }
            );
        };

        ScheduleData.prototype.getSlotInfo = function (id, date) {
            return  this.request('schedule/slotInfo', {}, {
                method: 'GET',
                url: '/adPositions/schedule/' + id + '/' + date
            });
        };

        var requests = {
            search: {
                name: 'schedule/search',
                scope: 'instance',
                policy: 'auto'
            },
            list: {
                name: 'schedule/list',
                scope: 'instance',
                policy: 'auto'
            },
            save: {
                name: 'schedule/save',
                scope: 'instance',
                policy: 'auto'
            },
            update: {
                name: 'schedule/update',
                scope: 'instance',
                policy: 'auto'
            },
            remove: {
                name: 'schedule/remove',
                scope: 'instance',
                policy: 'auto'
            },
            restore: {
                name: 'schedule/restore',
                scope: 'instance',
                policy: 'auto'
            },
            findById: {
                name: 'schedule/findById',
                scope: 'instance',
                policy: 'auto'
            },
            tree: {
                name: 'schedule/tree',
                scope: 'instance',
                policy: 'auto'
            },
            info: {
                name: 'schedule/slotInfo',
                scope: 'instance',
                policy: 'auto'
            }
            // TODO: 有其它请求在此配置
        };

        var ajax = require('er/ajax');
        u.each(
            requests,
            function (config) {
                ajax.register(ScheduleData, config.name, config);
            }
        );

        return ScheduleData;
    }
);        
