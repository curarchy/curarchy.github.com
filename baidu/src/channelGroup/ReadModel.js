/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 频道组只读页数据模型类
 * @author lixiang(lixiang05@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var ReadModel = require('common/ReadModel');
        var Data = require('./Data');
        var ChannelData = require('channel/Data');
        var util = require('er/util');
        var u = require('underscore');

        function ChannelGroupReadModel() {
            ReadModel.apply(this, arguments);
            this.data = new Data();
            this.channelData = new ChannelData();
        }

        util.inherits(ChannelGroupReadModel, ReadModel);

        var datasource = require('er/datasource');
        ChannelGroupReadModel.prototype.datasource = [
            {
                channels: function (model) {
                    var channelIds = model.get('channelIds');
                    if (channelIds) {
                        return model.loadChannels();
                    }
                    return '未指定';
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
         * 获取频道列表
         *
         * @return {er.Promise}
         */
        ChannelGroupReadModel.prototype.loadChannels = function () {
            var query = {
                channelGroupIds: [this.get('id')],
                status: 1
            };
            return this.channelData.list(query)
                .then(
                    function (response) {
                        return u.pluck(response.results || [], 'name');
                    }
                );
        };

        return ChannelGroupReadModel;
    }
);
