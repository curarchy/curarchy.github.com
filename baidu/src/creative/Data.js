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
        var ADPOSITION_ID = 791114;

        function CreativeData() {
            BaseData.call(this, 'creative');
        }

        util.inherits(CreativeData, BaseData);

        /**
         * 保存一个实体
         *
         * @param {Object} entity 实体对象
         * @return {FakeXHR}
         */
        CreativeData.prototype.save = function (entity) {
            return this.request(
                'creative/save',
                entity.data,
                {
                    method: 'POST',
                    url: '/deliveries/' + entity.deliveryId + '/creatives',
                    contentType: 'json',
                    dataType: 'json'
                }
            );
        };
        
        CreativeData.prototype.addStar = function (id) {
            return this.request(
                'creative/addStar',
                { flag: 1 },
                { url: '/creatives/' + id + '/flag' }
            );
        };

        CreativeData.prototype.removeStar = function (id) {
            return this.request(
                'creative/removeStar',
                { flag: 0 },
                { url: '/creatives/' + id + '/flag' }
            );
        };

        CreativeData.prototype.getPreviewUrl = function (id) {
            return this.request(
                'creative/previewId',
                {
                    adpositionId: ADPOSITION_ID,
                    mcId: id
                }
            );
        };

        CreativeData.prototype.modifyCreative = function (deliveryId, data) {
            return this.request(
                'creative/modifyCreative',
                data,
                { url: '/deliveries/' + deliveryId + '/creatives' }
            );
        };

        CreativeData.prototype.size = function () {
            return this.request(
                '$entity/size',
                {},
                { 
                    method: 'GET',
                    url: '/$entity/size'
                }
            );
        };

        var requests = {
            search: {
                name: 'creative/search',
                scope: 'instance',
                policy: 'auto'
            },
            list: {
                name: 'creative/list',
                scope: 'instance',
                policy: 'auto'
            },
            save: {
                name: 'creative/save',
                scope: 'instance',
                policy: 'auto'
            },
            update: {
                name: 'creative/update',
                scope: 'instance',
                policy: 'auto'
            },
            remove: {
                name: 'creative/remove',
                scope: 'instance',
                policy: 'auto'
            },
            restore: {
                name: 'creative/restore',
                scope: 'instance',
                policy: 'auto'
            },
            findById: {
                name: 'creative/findById',
                scope: 'instance',
                policy: 'auto'
            },
            tree: {
                name: 'creative/tree',
                scope: 'instance',
                policy: 'auto'
            },
            size: {
                name: 'creative/size',
                options: {
                    url: '/creatives/size',
                    method: 'GET'
                }
            },
            star: {
                name: 'creative/star',
                options: {
                    method: 'PUT'
                }
            },
            previewId: {
                name: 'creative/previewId',
                options: {
                    url: '/creatives/previewId',
                    method: 'GET'
                }
            },
            addStar: {
                name: 'creative/addStar',
                options: {
                    method: 'PUT'
                }
            },
            removeStar: {
                name: 'creative/removeStar',
                options: {
                    method: 'PUT'
                }
            },
            deleteCreative: {
                name: 'creative/modifyCreative',
                options: {
                    method: 'POST',
                    contentType: 'json',
                    dataType: 'json'
                }
            }
        };

        var ajax = require('er/ajax');
        u.each(
            requests,
            function (config) {
                ajax.register(CreativeData, config.name, config);
            }
        );

        return CreativeData;
    }
);        
