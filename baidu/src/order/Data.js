/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 订单数据类
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var BaseData = require('common/BaseData');
        var util = require('er/util');
        var u = require('underscore');

        /**
         * 订单数据类
         *
         * @constructor
         * @extends common/BaseData
         */
        function OrderData() {
            BaseData.call(this, 'order', 'orderInfo');
        }

        util.inherits(OrderData, BaseData);

        OrderData.prototype.getSalers = function () {
            return this.request(
                'order/getSalers'
            );
        };

        OrderData.prototype.findSummaryById = function (id) {
            return this.request(
                '$entity/findSummaryById',
                null,
                {
                    method: 'GET',
                    url: '/$entity/' + id + '/summary'
                }
            );
        };

        var requests = {
            search: {
                name: 'order/search',
                scope: 'instance',
                policy: 'auto'
            },
            list: {
                name: 'order/list',
                scope: 'instance',
                policy: 'auto'
            },
            save: {
                name: 'order/save',
                scope: 'instance',
                policy: 'auto',
                options: {
                    contentType: 'json'
                }
            },
            update: {
                name: 'order/update',
                scope: 'instance',
                policy: 'auto',
                options: {
                    contentType: 'json'
                }
            },
            remove: {
                name: 'order/remove',
                scope: 'instance',
                policy: 'auto'
            },
            restore: {
                name: 'order/restore',
                scope: 'instance',
                policy: 'auto'
            },
            findById: {
                name: 'order/findById',
                scope: 'instance',
                policy: 'auto'
            },
            tree: {
                name: 'order/tree',
                scope: 'instance',
                policy: 'auto'
            },
            findSummaryById: {
                name: 'order/findSummaryById',
                scope: 'instance',
                policy: 'auto'
            }
        };

        var ajax = require('er/ajax');
        u.each(
            requests,
            function (config) {
                ajax.register(OrderData, config.name, config);
            }
        );

        return OrderData;
    }
);        
