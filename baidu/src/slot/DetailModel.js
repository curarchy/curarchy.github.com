/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 频道分组详情页数据模型类
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
        var Data = require('./Data');

        /**
         * 频道详情页数据模型类
         */
        function SlotDetailModel() {
            ChannelGroupTreeDetailModel.apply(this, arguments);
            this.data = new Data();
        }

        util.inherits(SlotDetailModel, ChannelGroupTreeDetailModel);

        SlotDetailModel.prototype.entityName = 'slot';

        var datasource = require('er/datasource');
        var PriceModel = require('./enum').PriceModel;
        var Platform = require('./enum').Platform;
        var Status = require('common/enum').Status;
        /**
         * 数据源配置
         *
         * @type {Array}
         * @override
         */
        SlotDetailModel.prototype.datasource = {
            crumbPath: function (model) {
                var path = [
                    { 
                        text: '所有频道',
                        href: '#/slot/all'
                    },
                    {
                        text: model.get('channelName'),
                        href: 
                            '#/channel/detail~id=' + model.get('channelId')
                    }
                ];

                if (model.get('channelGroupId')) {
                    var channelGroupNode = {
                        text: model.get('channelGroupName'),
                        href: '#/channelGroup/detail~id='
                            + model.get('channelGroupId')
                    };
                    path.splice(1, 0, channelGroupNode);
                }

                return path;
            },

            tabs: function (model) {
                var tabs = [];
                if (model.get('canViewDelivery')) {
                    tabs.push({ title: '广告', type: 'delivery' });
                }
                return tabs;
            },

            statusText: datasource.enumText(Status, 'status'),
            
            platformText: datasource.enumText(Platform, 'platform'),

            priceModelText: datasource.enumText(PriceModel, 'priceModel'),

            canModify: datasource.permission('CLB_ADPOSITION_MODIFY'),

            canGetCode: datasource.permission('CLB_ADPOSITION_GET_CODE')
            
            // TODO: “百度流量交易服务”的交互不知道
        };

        var ajax = require('er/ajax');
        u.each(
            config.requests,
            function (config) {
                ajax.register(SlotDetailModel, config.name, config);
            }
        );

        return SlotDetailModel;
    }
);        
