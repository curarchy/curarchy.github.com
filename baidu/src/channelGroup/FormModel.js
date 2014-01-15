/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 频道列表表单数据模型类
 * @author wangyaqiong(catkin2009@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var FormModel = require('common/FormModel');
        var util = require('er/util');
        var Data = require('./Data');
        var ChannelData = require('channel/Data');
        var config = require('./config');
        var u = require('underscore');

        function ChannelGroupFormModel() {
            FormModel.apply(this, arguments);
            this.data = new Data();
            this.channelData = new ChannelData();
        }

        util.inherits(ChannelGroupFormModel, FormModel);

        var datasource = require('er/datasource');
        ChannelGroupFormModel.prototype.datasource = [
            {
                channels: function (model) {
                    var channelIds = model.get('channelIds');
                    if (channelIds) {
                        return model.loadChannels();
                    }

                    // 用null代替[]是为了区别已加载过数据和未加载过数据的区别
                    return null;
                },

                displayOrder: function (model) {
                    var displayOrder = model.get('displayOrder');
                    return displayOrder || 100;
                },

                crumbPath: function (model) {
                    var path = [
                        {
                            text: '频道分组', 
                            href: '#/channelGroup/list'
                        },
                        { 
                            text: model.get('title')
                        }
                    ];
                    return path;
                }
            },
            {
                // 导航栏权限
                canSubManagerView: datasource.permission('CLB_SUBMANAGER_VIEW'),
                canCompanyView: datasource.permission('CLB_COMPANY_VIEW'),
                canContactView: datasource.permission('CLB_CONTACTOR_VIEW'),
                canChannelView: datasource.permission('CLB_CHANNEL_VIEW')
            }
        ];

        /**
         * 坑爹，后端只返回id，没有name，所以这里要映射一下
         *
         * @response {Object} response 服务器返回的频道列表数据
         * @return {Object}
         */
        function mergeChannels(response) {
            var channelIds = this.get('channelIds');
            var selectedData = [];
            var allChannels = response.results || [];
            var allChannelsIndex = u.toMap(allChannels, 'id', ['id', 'name']);
            selectedData = u.map(
                channelIds, 
                function (id) { return allChannelsIndex[id]; }
            );

            var sourceData = {
                allData: allChannels, 
                selectedData: selectedData
            };
            var targetData = {
                allData: selectedData, 
                selectedData: []
            };
            return { sourceData: sourceData, targetData: targetData };
        }

        /**
         * 获取频道列表
         *
         * @return {er/Promise}
         */
        ChannelGroupFormModel.prototype.loadChannels = function () {
            var id = this.get('id');
            var query = {
                channelGroupIds: id ? [0, id] : [0],
                status: 1
            };
            return this.channelData.list(query)
                .then(u.bind(mergeChannels, this));
        };

        /**
         * 判断实体是否有变化
         *
         * @param {Object} entity 新的实体
         * @return {boolean}
         */
        ChannelGroupFormModel.prototype.isEntityChanged = function (entity) {
            var emptyEntity = {
                id: undefined,
                name: '',
                displayOrder: 100,
                channelIds: [],
                description: '',
                status: undefined
            };
            var original = this.get('formType') === 'create' ? 
                emptyEntity
                : u.clone(this.get('entity'));
            entity.id = original.id;
            entity.status = original.status;
            
            entity.displayOrder = parseInt(entity.displayOrder, 10);
            if (entity.channelIds.length > 0) {
                entity.channelIds = entity.channelIds.split(',');
                u.each(entity.channelIds, function (item, index) {
                    entity.channelIds[index] = parseInt(item, 10);
                });
            }
            else {
                if (this.get('formType') === 'create') {
                    entity.channelIds = original.channelIds;
                }
                else {
                    entity.channelIds = [entity.channelIds];
                }
                
            }
            delete entity.hasChannels;
            original.channelIds.sort();
            entity.channelIds.sort();
            return !u.isEqual(original, entity);
        };

        var ajax = require('er/ajax');
        u.each(
            config.requests,
            function (config) {
                ajax.register(ChannelGroupFormModel, config.name, config);
            }
        );

        return ChannelGroupFormModel;
    }
);