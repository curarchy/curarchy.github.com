/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 广告位列表Action
 * @author undefined(undefined)
 * @date $DATE$
 */
define(
    function (require) {
        var util = require('er/util');
        var ListAction = require('common/ListAction');
        var config = require('./config');
        var u = require('underscore');

        // 模块依赖预加载
        require('./SlotBatchOrderForm');
        require('./SlotBatchChannelForm');
        require('./SlotCodeGenerator');

        /**
         * 广告位列表
         *
         * @constructor
         * @extends common/ListAction
         */
        function SlotList() {
            ListAction.apply(this, arguments);
        }

        util.inherits(SlotList, ListAction);

        /**
         * 当前Action的分组名称
         *
         * @type {string}
         * @override
         */
        SlotList.prototype.group = 'slot';

        /**
         * 当前Action负责的实体的描述名称
         *
         * @type {string}
         * @override
         */
        SlotList.prototype.entityDescription = config.description;

        /**
         * 视图类型
         *
         * @type {function}
         * @override
         */
        SlotList.prototype.viewType = require('./ListView');

        /**
         * 数据模型类型
         *
         * @type {function}
         * @override
         */
        SlotList.prototype.modelType = require('./ListModel');

        /**
         * 默认查询参数
         *
         * @param {Object}
         * @override
         */
        SlotList.prototype.defaultArgs = {
            // TODO: 配置默认的查询参数，避免URL里有太多参数，
            // 这里参数默认值和“不把参数传给后端时后端使用的值”相同，
            // 如无需要就删除这一段
            orderBy: 'displayOrder',
            order: 'asc'
        };

        function batchModifySlot (e) {
            var entity = e.entity;
            var items = this.view.getSelectedItems();
            var ids = u.pluck(items, 'id');
            entity.ids = ids;
            this.model.batchModifySlot(entity)
                .then(
                    u.bind(this.reload, this),
                    u.bind(notifySlotBatchFail, this)
                );
        }

        /**
         * 通知批量操作广告位失败失败
         *
         * @param {Object} context 批量操作的上下文对象
         */
        function notifySlotBatchFail(context) {
            var title = '批量更新';
            this.view.alert('无法' + title, title);
        }

        /**
         * 检查指定批量操作是否需要后端提示消息
         *
         * @param {number} status 目标状态
         * @param {string} action 操作类型
         * @return {boolean}
         */
        SlotList.prototype.requireAdviceFor = function (status, action) {
            return true;
        };

        /**
         * 初始化交互行为
         *
         * @override
         */
        SlotList.prototype.initBehavior = function () {
            ListAction.prototype.initBehavior.apply(this, arguments);
            this.view.on('batchModifySlot', u.bind(batchModifySlot, this));
        };
        
        return SlotList;
    }
);
