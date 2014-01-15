/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 频道表单数据模型类
 * @author zhanglili(otakustay@gmail.com), wangyaqiong(wangyaqiong@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var FormModel = require('common/FormModel');
        var Data = require('./Data');
        var ChannelGroupData = require('channelGroup/Data');
        var util = require('er/util');
        var config = require('./config');
        var u = require('underscore');

        function ChannelFormModel() {
            FormModel.apply(this, arguments);
            this.data = new Data();
            this.channelGroupData = new ChannelGroupData();
        }

        util.inherits(ChannelFormModel, FormModel);

        var datasource = require('er/datasource');
        ChannelFormModel.prototype.datasource = [
            {
                channelGroups: function (model) {
                    var id = model.get('channelGroupId');
                    if (id) {
                        return model.loadChannelGroups(id);
                    }
                    // 用null代替{}是为了区别已加载过数据和未加载过数据的区别
                    return null;
                },

                crumbPath: function (model) {
                    var path = [
                        { 
                            text: '频道', 
                            href: '#/channel/list'
                        },
                        { 
                            text: model.get('title')
                        }
                    ];
                    return path;
                },
                
                displayOrder: function (model) {
                    var displayOrder = model.get('displayOrder');
                    return displayOrder || 100;   
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
         * 获取频道组列表
         *
         * @return {er/Promise}
         */
        ChannelFormModel.prototype.loadChannelGroups = function (id) {
            return this.channelGroupData.list({ status: 1 })
                .then(
                    function (response) {
                        var allGroups = response.results || [];
                        return allGroups;
                    }
                );
        };

        /**
         * 判断实体是否有变化
         *
         * @param {Object} entity 新的实体
         * @return {boolean}
         */
        ChannelFormModel.prototype.isEntityChanged = function (entity) {
            var emptyEntity = {
                id: undefined,
                name: '',
                displayOrder: 100,
                channelGroupId: null,
                channelGroupName: '',
                description: '',
                status: undefined
            };
            var original = this.get('formType') === 'create' ? 
                emptyEntity
                : u.clone(this.get('entity'));
            entity.id = original.id;
            entity.status = original.status;
            entity.displayOrder = parseInt(entity.displayOrder, 10);
            delete entity.hasChannelGroup;
            delete original.channelGroupName;
            var entityExtend = {};
            u.extend(entityExtend, original, entity);
            return !u.isEqual(original, entityExtend);
        };

        var ajax = require('er/ajax');
        u.each(
            config.requests,
            function (config) {
                ajax.register(ChannelFormModel, config.name, config);
            }
        );

        return ChannelFormModel;
    }
);