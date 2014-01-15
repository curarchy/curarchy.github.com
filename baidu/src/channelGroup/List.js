/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 频道分组列表Action
 * @author wangyaqiong(catkin2009@gmail.com)
 * @date $DATE$
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
        function ChannelGroupList() {
            ListAction.apply(this, arguments);
        }
        
        util.inherits(ChannelGroupList, ListAction);

        /**
         * 当前Action的分组名称
         *
         * @type {string}
         * @override
         */
        ChannelGroupList.prototype.group = 'setting';

        /**
         * 当前Action负责的实体的描述名称
         *
         * @type {string}
         * @override
         */
        ChannelGroupList.prototype.entityDescription = '频道分组';

        /**
         * 视图类型
         *
         * @type {function}
         * @override
         */
        ChannelGroupList.prototype.viewType = require('./ListView');
 
        /**
         * 数据模型类型
         *
         * @type {function}
         * @override
         */
        ChannelGroupList.prototype.modelType = require('./ListModel');

        /**
         * 默认查询参数
         *
         * @param {Object}
         * @override
         */
        ChannelGroupList.prototype.defaultArgs = {
            orderBy: 'displayOrder',
            order: 'asc',
            status: '1'
        };

        return ChannelGroupList;
    }
);
