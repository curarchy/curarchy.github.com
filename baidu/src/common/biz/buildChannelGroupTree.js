/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 频道分组-频道侧边栏树数据组装模块
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var u = require('underscore');

        /**
         * 将频道信息转换为树节点对象
         *
         * @param {Object} options 配置项
         * @param {Object} channel 频道信息
         * @param {Object} parentNode 在树中的父节点
         * @return {Object}
         */
        function transformChannel(options, channel, parentNode) {
            var treeNode = {
                id: 'channel-' + channel.id,
                text: channel.name,
                type: 'channel',
                isLeafLevel: true
            };

            if (!options.channelIsLeaf) {
                treeNode.children = [];
            }

            if (parentNode) {
                treeNode.parent = parentNode.id;
            }

            return treeNode;
        }

        /**
         * 将频道分组信息转换为树节点对象
         *
         * @param {Object} options 配置项
         * @param {Object} channelGroup 频道分组信息
         * @return {Object}
         */
        function transformChannelGroup(options, channelGroup) {
            if (options.ignoreEmpty && 
                (!channelGroup.channels || !channelGroup.channels.length)
            ) {
                return null;
            }

            var treeNode = {
                id: 'channel-group-' + channelGroup.id,
                type: 'channelGroup',
                text: channelGroup.name
            };
            
            treeNode.children = u.map(
                channelGroup.channels, 
                function (channel) {
                    return transformChannel(options, channel, treeNode);
                }
            );

            return treeNode;
        }

        /**
         * 构建树数据源信息
         *
         * @param {Object} data 后端返回的数据
         * @param {Object} options 搭建配置
         * @return {Object} 树数据源对象
         */
        function buildTree(data, options) {
            var datasource = {
                id: 'root',
                text: '所有内容',
                children: []
            };

            var defaultOptions = {
                // 默认的排列顺序
                groupOrders: [
                    'all',
                    'defaultChannel',
                    'channelGroups',
                    'channelsWithoutGroup'
                ],
                // 频道是否就是叶子节点
                channelIsLeaf: false,
                ignoreEmpty: false
            };
            options = u.extend(defaultOptions, options);

            // 把各类数据都保存起来
            var orderGroups = {};

            // “未指定频道”如果存在的话，永远在第一个频道分组的第一个，
            // 每个频道有`defaultFlag`，为0表示默认频道，为1表示非默认频道
            var hasDefault = data[0].channels[0]
                && !data[0].channels[0].defaultFlag;

            // 1 “全部频道分组”
            var all = {
                id: 'all',
                text: '所有频道',
                href: '#/channel/detail',
                isLeafLevel: true
            };
            orderGroups.all = [all];

            // 2 “未指定频道”
            if (hasDefault) {
                var defaultChannel = transformChannel(
                    options, data[0].channels.shift(), null);
                orderGroups.defaultChannel = [defaultChannel];   
            }

            // 3 无分组的频道们
            var channelsWithoutGroup = data.shift().channels;
            orderGroups.channelsWithoutGroup = u.map(
                channelsWithoutGroup,
                function (channel) {
                    return transformChannel(options, channel, null);
                }
            );


            // 4 所有频道分组
            orderGroups.channelGroups = u.chain(data)
                .map(u.partial(transformChannelGroup, options))
                .compact()
                .value();

            // 按照顺序塞进去
            u.each(
                options.groupOrders,
                function (orderKey) {
                    // 未指定频道可能是没有的
                    if (orderGroups[orderKey]) {
                        datasource.children.push.apply(
                            datasource.children,
                            orderGroups[orderKey]
                        );
                    }
                }
            );

            return datasource;
        }

        return buildTree;
    }
);        
