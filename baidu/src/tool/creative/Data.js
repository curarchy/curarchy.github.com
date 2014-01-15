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

        CreativeData.prototype.addStar = function (id) {
            return this.request(
                'creativeTool/addStar',
                { flag: 1 },
                { url: '/creatives/' + id + '/flag' }
            );
        };

        CreativeData.prototype.removeStar = function (id) {
            return this.request(
                'creativeTool/removeStar',
                { flag: 0 },
                { url: '/creatives/' + id + '/flag' }
            );
        };

        CreativeData.prototype.getPreviewID = function (slotId, mcId) {
            return this.request(
                'creativeTool/previewId',
                {
                    adpositionId: slotId,
                    mcId: mcId
                },
                {
                    url: '/creatives/previewId',
                    method: 'GET'
                }
            );
        };

        CreativeData.prototype.getPreviewUrl = function (id) {
            return this.request(
                'creativeTool/previewId',
                {
                    adpositionId: ADPOSITION_ID,
                    mcId: id
                }
            );
        };

        var requests = {
            search: {
                name: 'creativeTool/search',
                scope: 'instance',
                policy: 'auto'
            },
            list: {
                name: 'creativeTool/list',
                scope: 'instance',
                policy: 'auto'
            },
            save: {
                name: 'creativeTool/save',
                scope: 'instance',
                policy: 'auto'
            },
            update: {
                name: 'creativeTool/update',
                scope: 'instance',
                policy: 'auto'
            },
            remove: {
                name: 'creativeTool/remove',
                scope: 'instance',
                policy: 'auto'
            },
            restore: {
                name: 'creativeTool/restore',
                scope: 'instance',
                policy: 'auto'
            },
            findById: {
                name: 'creativeTool/findById',
                scope: 'instance',
                policy: 'auto'
            },
            tree: {
                name: 'creativeTool/tree',
                scope: 'instance',
                policy: 'auto'
            },
            star: {
                name: 'creativeTool/star',
                options: {
                    method: 'PUT'
                }
            },
            previewId: {
                name: 'creativeTool/previewId'
            },
            addStar: {
                name: 'creativeTool/addStar',
                options: {
                    method: 'PUT'
                }
            },
            removeStar: {
                name: 'creativeTool/removeStar',
                options: {
                    method: 'PUT'
                }
            },
            deleteCreative: {
                name: 'creativeTool/modifyCreative',
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
