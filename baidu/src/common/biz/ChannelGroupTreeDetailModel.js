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
        var DetailModel = require('common/DetailModel');

        /**
         * 左侧包含[频道分组-频道]导航树的详情页数据模型基类
         *
         * @constructor
         * @extends common/DetailModel
         */
        function ChannelGroupTreeDetailModel() {
            DetailModel.apply(this, arguments);
        }

        util.inherits(ChannelGroupTreeDetailModel, DetailModel);

        /**
         * 指定树数据源的**顶层**实体类型
         *
         * @type {string}
         */
        ChannelGroupTreeDetailModel.prototype.treeEntityType = 'channelGroup';

        /**
         * 构造树的数据源结构
         *
         * @param {Object} data 后端返回的列表数据
         * @return {Object} 符合树的数据源结构
         * @override
         */
        ChannelGroupTreeDetailModel.prototype.buildTreeDatasource = 
            function (data) {
                var buildChannelTree = require('./buildChannelGroupTree');
                return buildChannelTree(data.results);
            };

        var datasource = require('er/datasource');
        var defaultDatasource = [
            {
                canCreateChannel: datasource.permission('CLB_CHANNEL_NEW'),
                canViewChannel: datasource.permission('CLB_CHANNEL_VIEW'),
                // 下面所有TAB的权限都加上
                canCreateSlot: datasource.permission('CLB_ADPOSITION_NEW'),
                canViewSlot: datasource.permission('CLB_ADPOSITION_VIEW'),
                canCreateDelivery: datasource.permission('CLB_AD_NEW'),
                canViewDelivery: datasource.permission('CLB_AD_VIEW'),
                canCreateCreative: datasource.permission('CLB_AD_NEW'),
                canViewCreative: datasource.permission('CLB_AD_VIEW')
            },
            {
                widgets: function (model) {
                    var widgets = [];
                    if (model.get('canCreateChannel')) {
                        var config = {
                            name: 'add',
                            text: '添加频道'
                        };
                        widgets.push(config);
                    }
                    if (model.get('canViewChannel')) {
                        var config = {
                            name: 'manage',
                            text: '管理频道',
                            href: '#/channel/list'
                        };
                        widgets.push(config);
                    }

                    return widgets;
                }
            }
        ];

        ChannelGroupTreeDetailModel.prototype.defaultDatasource = [
            DetailModel.prototype.defaultDatasource,
            defaultDatasource
        ];

        return ChannelGroupTreeDetailModel;
    }
);        
