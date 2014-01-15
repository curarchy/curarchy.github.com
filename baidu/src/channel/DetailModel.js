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

        /**
         * 频道详情页数据模型类
         */
        function ChannelDetailModel() {
            ChannelGroupTreeDetailModel.apply(this, arguments);
            this.data = new Data();
        }

        util.inherits(ChannelDetailModel, ChannelGroupTreeDetailModel);

        ChannelDetailModel.prototype.entityName = 'channel';

        var datasource = require('er/datasource');
        var Status = require('common/enum').Status;

        /**
         * 数据源配置
         *
         * @type {Array}
         * @override
         */
        ChannelDetailModel.prototype.datasource = {
            crumbPath: function (model) {
                if (!model.get('id')) {
                    return [
                        { 
                            text: '所有频道'
                        }
                    ];
                }
                else if (model.get('channelGroupId')) {
                    return [
                        { 
                            text: '所有频道',
                            href: '#/slot/all'
                        },
                        {
                            text: model.get('channelGroupName'),
                            href: '#/channelGroup/detail~id='
                                + model.get('channelGroupId')
                        }
                    ];
                }
                else {
                    return [
                        { 
                            text: '所有频道',
                            href: '#/slot/all'
                        }
                    ];
                }
            },

            tabs: function (model) {
                var tabs = [];
                if (model.get('canViewSlot')) {
                    tabs.push({ title: '广告位', type: 'slot' });
                }
                if (model.get('id') && model.get('canViewDelivery')) {
                    tabs.push({ title: '广告', type: 'delivery' });
                }
                return tabs;
            },
            
            statusText: datasource.enumText(Status, 'status'),

            canModify: datasource.permission('CLB_CHANNEL_MODIFY')
        };

        /**
         * 准备数据
         *
         * @protected
         * @override
         */
        ChannelDetailModel.prototype.prepare = function () {
            var defaultChannel = 
                require('common/global/user').getDefaultChannel();

            // 默认频道不能修改
            if ((this.get('id') + '') === defaultChannel.value) {
                this.set('canModify', false);
            }
        };

        var ajax = require('er/ajax');
        u.each(
            config.requests,
            function (config) {
                ajax.register(ChannelDetailModel, config.name, config);
            }
        );

        return ChannelDetailModel;
    }
);        
