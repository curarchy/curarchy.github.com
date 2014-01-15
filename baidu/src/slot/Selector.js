/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 广告位选择Action
 * @author lixiang(lixiang05@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var BaseAction = require('common/BaseAction');
        var util = require('er/util');
        var config = require('./config');
        var u = require('underscore');

        /**
         * 广告位选择Action
         *
         * @constructor
         * @extends common/FormAction
         */
        function Selector(entityName) {
            BaseAction.apply(this, arguments);
            this.entityName = entityName;
        }

        util.inherits(Selector, BaseAction);


        /**
         * 当前Action负责的实体的描述名称
         *
         * @type {string}
         * @override
         */
        Selector.prototype.entityDescription = config.description;

        
        /**
         * 视图类型
         *
         * @type {function}
         * @override
         */
        Selector.prototype.viewType = require('./SelectorView');

        /**
         * 数据模型类型
         *
         * @type {function}
         * @override
         */
        Selector.prototype.modelType = require('./SelectorModel');
        
        /**
         * 初始化交互行为
         *
         * @override
         */
        Selector.prototype.initBehavior = function () {
            BaseAction.prototype.initBehavior.apply(this, arguments);
            this.view.on('loadslots', loadSlots, this);
            this.view.on('addslots', addSlots, this);
            this.view.on('deleteslots', deleteSlots, this);
            this.view.on('select', select, this);
            this.view.on('cancel', cancel, this);
        };

        function select(e) {
            this.fire('select');
        }

        function cancel(e) {
            this.fire('cancel');
        }

        /**
         * 获取选中的广告位
         *
         * @param {Array} 
         */
        Selector.prototype.getSelectedSlots = function () {
            return this.view.getSelectedSlots();
        };

        /**
         * 根据频道加载广告位
         *
         * @param {Event} e DOM事件对象
         * @inner
         */
        function addSlots(e) {
            this.model.addSlots(e.slots);
            this.view.refreshSelectedSlots();
        }

        function deleteSlots(e) {
            this.model.deleteSlots(e.slots);
            this.view.refreshSelectedSlots();
            this.view.updateSlotsStates(e.slots);
        }

        /**
         * 根据频道加载广告位
         *
         * @param {Event} e DOM事件对象
         * @inner
         */
        function loadSlots(e) {
            this.model.loadSlots(e.channel)
                .then(u.bind(this.view.refreshSlotsArea, this.view));
        }

        return Selector;
    }
);
