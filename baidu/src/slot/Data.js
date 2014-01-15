/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file: 广告位Data
 * @author lixiang(lixiang05@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var BaseData = require('common/BaseData');
        var util = require('er/util');
        var u = require('underscore');

        function SlotData() {
            BaseData.call(this, 'slot', 'adPosition');
        }

        util.inherits(SlotData, BaseData);

        SlotData.prototype.size = function () {
            return this.request(
                '$entity/size',
                {},
                { 
                    method: 'GET',
                    url: '/$entity/size'
                }
            );
        };

        /**
         * 批量更新广告位
         *
         * @param {Object} data 更新的数据
         * @param {string[]} data.ids 需要更新的广告位id集合
         * @param {number} [data.displayOrder] 更新的显示顺序
         * @param {number} [data.channelId] 更新的所属频道id
         * @return {er.Promise}
         */
        SlotData.prototype.batchModify = function (data) {
            return this.request(
                'slot/batch',
                data,
                {
                    method: 'PUT',
                    url: '/adPositions/batch'
                }
            );
        };

        var requests = {
            search: {
                name: 'slot/size',
                scope: 'instance',
                policy: 'auto'
            },
            list: {
                name: 'slot/list',
                scope: 'instance',
                policy: 'auto'
            },
            save: {
                name: 'slot/save',
                scope: 'instance',
                policy: 'auto'
            },
            update: {
                name: 'slot/update',
                scope: 'instance',
                policy: 'auto'
            },
            remove: {
                name: 'slot/remove',
                scope: 'instance',
                policy: 'auto'
            },
            restore: {
                name: 'slot/restore',
                scope: 'instance',
                policy: 'auto'
            },
            findById: {
                name: 'slot/findById',
                scope: 'instance',
                policy: 'auto'
            },
            batch: {
                name: 'slot/batch',
                scope: 'instance',
                policy: 'auto'
            }
        };

        var ajax = require('er/ajax');
        u.each(
            requests,
            function (config) {
                ajax.register(SlotData, config.name, config);
            }
        );

        return SlotData;
    }
);
