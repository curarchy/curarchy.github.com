/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 广告列表Action
 * @author lisijin(ibadplum@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var util = require('er/util');
        var ListAction = require('common/ListAction');
        var config = require('./config');
        var u = require('underscore');

        /**
         * 频道列表
         *
         * @constructor
         * @extends common/ListAction
         */
        function DeliveryList() {
            ListAction.apply(this, arguments);
        }

        util.inherits(DeliveryList, ListAction);

        /**
         * 当前Action的分组名称
         *
         * @type {string}
         * @override
         */
        DeliveryList.prototype.group = 'order';

        /**
         * 当前Action负责的实体的描述名称
         *
         * @type {string}
         * @override
         */
        DeliveryList.prototype.entityDescription = config.description;

        /**
         * 视图类型
         *
         * @type {function}
         * @override
         */
        DeliveryList.prototype.viewType = require('./ListView');

        /**
         * 数据模型类型
         *
         * @type {function}
         * @override
         */
        DeliveryList.prototype.modelType = require('./ListModel');

        /**
         * 默认查询参数
         *
         * @param {Object}
         * @override
         */
        DeliveryList.prototype.defaultArgs = {
            orderBy: 'id',
            order: 'desc'
        };
        
        /**
         * 收藏
         *
         * @param {Object} 事件对象
         */
        /**
         * 创意加星
         */
        function toggleDeliveryStar(e) {
            var item = u.findWhere(this.model.get('results'), { id: e.id });

            this.model.toggleStar(item)
                .done(u.bind(this.view.updateItem, this.view, item));
        }

        /**
        * 初始化交互行为
        *
        * @override
        */
        DeliveryList.prototype.initBehavior = function () {
            this.view.on('togglestar', toggleDeliveryStar, this);
            ListAction.prototype.initBehavior.apply(this, arguments);
        };

        return DeliveryList;
    }
);
