/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 广告数据类
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var BaseData = require('common/BaseData');
        var util = require('er/util');

        /**
         * 广告数据类
         *
         * @constructor
         * @extends common/BaseData
         */
        function DeliveryData() {
            BaseData.call(this, 'delivery');
        }

        util.inherits(DeliveryData, BaseData);

        var requests = {
            search: {
                name: 'delivery/search',
                scope: 'instance',
                policy: 'auto'
            },
            list: {
                name: 'delivery/list',
                scope: 'instance',
                policy: 'auto'
            },
            save: {
                name: 'delivery/save',
                scope: 'instance',
                policy: 'auto',
                options: {
                    contentType: 'json'
                }
            },
            update: {
                name: 'delivery/update',
                scope: 'instance',
                policy: 'auto',
                options: {
                    contentType: 'json'
                }
            },
            remove: {
                name: 'delivery/remove',
                scope: 'instance',
                policy: 'auto'
            },
            restore: {
                name: 'delivery/restore',
                scope: 'instance',
                policy: 'auto'
            },
            findById: {
                name: 'delivery/findById',
                scope: 'instance',
                policy: 'auto'
            },
            tree: {
                name: 'delivery/tree',
                scope: 'instance',
                policy: 'auto'
            },
            addStar: {
                name: 'delivery/addStar',
                options: {
                    method: 'PUT'
                }
            },
            removeStar: {
                name: 'delivery/removeStar',
                options: {
                    method: 'PUT'
                }
            },
            getOrderById: {
                name: 'orderInfos',
                scope: 'instance',
                policy: 'auto'
            },
            getSlotSizes: {
                name: 'slotSizes',
                scope: 'instance',
                policy: 'auto'
            },
            getRegionInfo: {
                name: 'getRegionInfo',
                scope: 'instance',
                policy: 'auto',
                options: {
                    method: 'GET',
                    url: '/static/regionInfo',
                    urlPrefix: '/api/tool'
                }
            }
        };

        var ajax = require('er/ajax');
        require('underscore').each(
            requests,
            function (config) {
                ajax.register(DeliveryData, config.name, config);
            }
        );

        DeliveryData.prototype.addStar = function (id) {
            return this.request(
                'delivery/addStar',
                { flag: 1 },
                { url: '/deliveries/' + id + '/flag' }
            );
        };

        DeliveryData.prototype.removeStar = function (id) {
            return this.request(
                'delivery/removeStar',
                { flag: 0 },
                { url: '/deliveries/' + id + '/flag' }
            );
        };

        DeliveryData.prototype.getOrderById = function (id) {
            return this.request(
                'orderInfos',
                null,
                { 
                    url: '/orderInfos/' + id + '/summary',
                    method: 'GET' 
                }
            );
        };

        DeliveryData.prototype.getSlotSizes = function (id) {
            return this.request(
                'slotSizes',
                null,
                { 
                    url: '/adPositions/size/',
                    method: 'GET' 
                }
            );
        };

        DeliveryData.prototype.getRegionInfo = function () {
            return this.request(
                'regionInfo',
                null,
                { 
                    url: '/static/regionInfo',
                    urlPrefix: '/api/tool',
                    method: 'GET'
                }
            );
        };

        return DeliveryData;
    }
);        
