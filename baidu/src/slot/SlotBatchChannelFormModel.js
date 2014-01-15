/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 批量修改频道表单数据模型类
 * @author wangyaqiong(catkin2009@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var FormModel = require('common/FormModel');
        var Data = require('./Data');
        var ChannelData = require('channel/Data');
        var util = require('er/util');
        var config = require('./config');
        var u = require('underscore');

        function SlotBatchChannelFormModel() {
            FormModel.apply(this, arguments);
            this.data = new Data();
            this.channelData = new ChannelData();
        }

        util.inherits(SlotBatchChannelFormModel, FormModel);

        /**
         * 数据源配置
         *
         * @type {Object}
         * @override
         */
        SlotBatchChannelFormModel.prototype.datasource = {
            channels: function (model) {
                return model.loadChannels();
            }
        };

        /**
         * 获取频道列表
         * @return {er/Promise}
         */
        SlotBatchChannelFormModel.prototype.loadChannels = function () {
            var query = {
                status: 1,
                withDefault: 1
            };
            return this.channelData.list(query)
                .then(
                    function (response) {
                        return response.results || [];
                    }
                );
        };

        /**
         * 判断实体是否有变化
         *
         * @param {Object} entity 新的实体
         * @return {boolean}
         */
        SlotBatchChannelFormModel.prototype.isEntityChanged = isEntityChanged;

        /**
         * 判断实体是否有变化
         *
         * @param {Object} entity 新的实体
         * @return {boolean}
         */
        function isEntityChanged (entity) {
            var emptyEntity = {
                channelId: undefined
            };
            return !u.isEqual(emptyEntity, entity);
        }

        var ajax = require('er/ajax');
        u.each(
            config.requests,
            function (config) {
                ajax.register(SlotBatchChannelFormModel, config.name, config);
            }
        );

        return SlotBatchChannelFormModel;
    }
);