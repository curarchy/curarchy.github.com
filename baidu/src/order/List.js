/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 订单列表Action
 * @author lisijin(ibadplum@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var util = require('er/util');
        var ListAction = require('common/ListAction');
        var config = require('./config');

        /**
         * 频道列表
         *
         * @constructor
         * @extends common/ListAction
         */
        function OrderList() {
            ListAction.apply(this, arguments);
        }

        util.inherits(OrderList, ListAction);

        /**
         * 当前Action的分组名称
         *
         * @type {string}
         * @override
         */
        OrderList.prototype.group = 'order';

        /**
         * 当前Action负责的实体的描述名称
         *
         * @type {string}
         * @override
         */
        OrderList.prototype.entityDescription = config.description;

        /**
         * 视图类型
         *
         * @type {function}
         * @override
         */
        OrderList.prototype.viewType = require('./ListView');

        /**
         * 数据模型类型
         *
         * @type {function}
         * @override
         */
        OrderList.prototype.modelType = require('./ListModel');

        /**
         * 默认查询参数
         *
         * @param {Object}
         * @override
         */
        OrderList.prototype.defaultArgs = {
            orderBy: 'id',
            order: 'desc'
        };
        
        return OrderList;
    }
);
