/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 频道列表Action
 * @author wangyaqiong(wangyaqiong@baidu.com)
 * @date 2013/8/7
 */
define(
    function (require) {
        var util = require('er/util');
        var ListAction = require('common/ListAction');
        
        /**
         * 频道列表
         *
         * @constructor
         * @extends common/ListAction
         */
        function ChannelList() {
            ListAction.apply(this, arguments);
        }
        
        util.inherits(ChannelList, ListAction);

        /**
         * 当前Action的分组名称
         *
         * @type {string}
         * @override
         */
        ChannelList.prototype.group = 'setting';

        /**
         * 视图类型
         *
         * @type {function}
         * @override
         */
        ChannelList.prototype.viewType = require('./ListView');
        
        /**
         * action 对应的中文描述
         */
        ChannelList.prototype.entityDescription = '频道';
        
        /**
         * 数据模型类型
         *
         * @type {function}
         * @override
         */
        ChannelList.prototype.modelType = require('./ListModel');

        /**
         * 默认查询参数
         *
         * @param {Object}
         * @override
         */
        ChannelList.prototype.defaultArgs = {
            orderBy: 'displayOrder',
            order: 'asc',
            status: '1'
        };

        return ChannelList;
    }
);
