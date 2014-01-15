/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 频道详情页数据模型类
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var util = require('er/util');
        var ChannelGroupTreeDetailModel = 
            require('common/biz/ChannelGroupTreeDetailModel');
        var Data = require('./Data');
        var config = require('./config');
        var u = require('underscore');

        /**
         * 频道详情页数据模型类
         */
        function ChannelGroupDetailModel() {
            ChannelGroupTreeDetailModel.apply(this, arguments);
            this.data = new Data();
        }

        util.inherits(ChannelGroupDetailModel, ChannelGroupTreeDetailModel);

        ChannelGroupDetailModel.prototype.entityName = 'channelGroup';

        var datasource = require('er/datasource');
        var Status = require('common/enum').Status;

        /**
         * 数据源配置
         *
         * @type {Array}
         * @override
         */
        ChannelGroupDetailModel.prototype.datasource = {
            crumbPath: function (model) {
                return [
                    { 
                        text: '所有频道',
                        href: '#/slot/all'
                    },
                    {
                        text: model.get('name')
                    }
                ];
            },

            tabs: function (model) {
                var tabs = [];
                if (model.get('canViewSlot')) {
                    tabs.push({ title: '广告位', type: 'slot' });
                }
                if (model.get('canViewDelivery')) {
                    tabs.push({ title: '广告', type: 'delivery' });
                }
                return tabs;
            },

            statusText: datasource.enumText(Status, 'status'),

            canModify: datasource.permission('CLB_CHANNEL_MODIFY')
        };

        var ajax = require('er/ajax');
        u.each(
            config.requests,
            function (config) {
                ajax.register(ChannelGroupDetailModel, config.name, config);
            }
        );

        return ChannelGroupDetailModel;
    }
);        
