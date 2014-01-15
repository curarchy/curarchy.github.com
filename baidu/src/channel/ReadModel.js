/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 频道只读数据模型类
 * @author lixinag(lixiang05@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var ReadModel = require('common/ReadModel');
        var Data = require('./Data');
        var util = require('er/util');
        var config = require('./config');
        var u = require('underscore');

        function ChannelReadModel() {
            ReadModel.apply(this, arguments);
            this.data = new Data();
        }

        util.inherits(ChannelReadModel, ReadModel);

        var datasource = require('er/datasource');
        ChannelReadModel.prototype.datasource = [
            {
                channelGroup: function (model) {
                    var id = model.get('channelGroupId');
                    if (id) {
                        return model.get('channelGroupName');
                    }
                    return '未设定';
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

        var ajax = require('er/ajax');
        u.each(
            config.requests,
            function (config) {
                ajax.register(ChannelReadModel, config.name, config);
            }
        );
        return ChannelReadModel;
    }
);