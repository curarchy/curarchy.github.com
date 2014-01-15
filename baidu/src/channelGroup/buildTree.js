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
         * @param {Object} channel 频道信息
         * @param {Object} parentNode 在树中的父节点
         * @return {Object}
         */
        function transformChannel(channel, parentNode) {
            var treeNode = {
                id: 'channel-' + channel.id,
                type: 'channel',
                text: channel.name,
                children: []
            };

            if (parentNode) {
                treeNode.parent = parentNode.id;
            }

            return treeNode;
        }

        /**
         * 将频道分组信息转换为树节点对象
         *
         * @param {Object} channelGroup 频道分组信息
         * @return {Object}
         */
        function transformChannelGroup(channelGroup) {
            var treeNode = {
                id: 'channel-group-' + channelGroup.id,
                type: 'channelGroup',
                text: channelGroup.name
            };
            
            treeNode.children = u.map(
                channelGroup.channels, 
                function (channel) {
                    return transformChannel(channel, treeNode);
                }
            );

            return treeNode;
        }

        /**
         * 构建树数据源信息
         *
         * @param {Object} data 后端返回的数据
         * @return {Object} 树数据源对象
         */
        function buildTree(data) {
            var datasource = {
                id: 'root',
                text: '所有内容',
                children: []
            };

            // 第一个肯定是“全部频道分组”
            var all = {
                id: 'all',
                text: '全部频道分组',
                href: '#/channel/detail'
            };
            datasource.children.push(all);

            // 放所有频道分组
            datasource.children.push.apply(
                datasource.children,
                u.map(data, transformChannelGroup)
            );

            // TODO: 要不要放“默认频道”

            // TODO: 无分组频道的数据结构未定
            // 放所有没有分组的频道
            // datasource.children.push.apply(
            //     datasource.children,
            //     u.map(data.channel, transformChannel)
            // );

            return datasource;
        }

        return buildTree;
    }
);        
