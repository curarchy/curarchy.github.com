/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 广告表单Action
 * @author liyidong(srhb18@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var FormAction = require('common/FormAction');
        var util = require('er/util');
        var config = require('./config');
        var u = require('underscore');

        // 增加对投放量子模块的预加载
        require('./AmountField');
        /**
         * 广告表单
         *
         * @constructor
         * @extends common/FormAction
         */
        function DeliveryForm() {
            FormAction.apply(this, arguments);
        }

        util.inherits(DeliveryForm, FormAction);

        /**
         * 当前Action的分组名称
         *
         * @type {string}
         * @override
         */
        DeliveryForm.prototype.group = 'order';

        /**
         * 当前Action负责的实体的描述名称
         *
         * @type {string}
         * @override
         */
        DeliveryForm.prototype.entityDescription = config.description;

        /**
         * 视图类型
         *
         * @type {function}
         * @override
         */
        DeliveryForm.prototype.viewType = require('./FormView');

        /**
         * 数据模型类型
         *
         * @type {function}
         * @override
         */
        DeliveryForm.prototype.modelType = require('./FormModel');

        /**
         * 删除已选广告位
         *
         * @param {Object} 事件对象
         */
        function deleteSlot(e) {
            var slotId = e.id;
            var slots = e.slots;

            var newSlots = u.filter(
                slots,
                function (item) {
                    return item.id !== slotId;
                }
            );

            this.view.refleshSlots(newSlots);

            this.model.updataSlotsToModel(newSlots);
        }

        /**
         * 清空已选广告位
         *
         * @param {Object} 事件对象
         */
        function emptySlots(e) {
            var newSlots = [];
            this.view.refleshSlots(newSlots);
            this.model.updataSlotsToModel(newSlots);
        }

        /**
         * 添加广告位
         *
         * @param {Object} 事件对象
         */
        function addSlots(e) {
            var newSlots = e.slots;
            var slotsAmount = this.view.get('slot-amount');

            // 获取当前slotsAmount的内容，以便保留已输入的数据
            var originalSlots = slotsAmount.getRawValue().slots;
            
            // 合并相同广告位
            var filteredNewSlots = [];
            for (var i = 0; i < newSlots.length; i++) {
                var currentId = newSlots[i].id;
                var conflict = u.where(
                    originalSlots,
                    { id: currentId }
                );
                if (conflict.length === 0) {
                    filteredNewSlots.push(newSlots[i]);
                }
            }

            var unionedNewSlots = originalSlots.concat(filteredNewSlots);

            this.view.refleshSlots(unionedNewSlots);
            this.model.updataSlotsToModel(unionedNewSlots);
        }

        /**
         * 切换投放量控件模式
         *
         * @param {Object} 事件对象
         */
        function slotAmountPriceModelChange(e) {
            var slotsAmount = this.view.get('slot-amount');

            var originalSlots = [];

            // 如果原来有数据，取出来
            if (slotsAmount.getRawValue()) {
                var originalSlots = slotsAmount.getRawValue().slots;
            }

            // 用老数据去刷新投放量的视图，刷新函数有取售卖方式并存入的逻辑
            this.view.refleshSlots(originalSlots);
        }

        /**
         * 切换投放量控件模式
         *
         */
        function showSlotValidate(e) {
            this.view.showSlotValidate(e.data);
        }

        /**
         * 提交后的跳转
         *
         * @override
         */
        DeliveryForm.prototype.redirectAfterSubmit = function (entity) {
            var targetURL = '/delivery/detail~id=' + entity.id;
            if (this.view.redirectUrl) {
                targetURL = this.view.redirectUrl
                    + '~deliveryId=' + entity.id
                    + '&navType=create';
            }
            this.redirect(targetURL);
        };

        /**
         * 取消处理函数
         *
         * @override
         */
        FormAction.prototype.cancelEdit = function () {
            var entity = this.view.getEntity();
            entity = this.model.fillEntity(entity);
            originalEntity = this.model.get('entity');

            var redirectURL = '/delivery/detail~id=' + originalEntity.id;
            if (originalEntity) {
                redirectURL = '/order/detail~id=' + entity.orderId;
            }

            if (this.model.isEntityChanged(entity)) {
                var options = {
                    title: this.getCancelConfirmTitle(),
                    content: this.getCancelConfirmMessage()
                };
                this.view.waitConfirm(options)
                    .then(u.bind(this.redirectAfterCancel, this, redirectURL));
            }
            else {
                this.redirectAfterCancel(redirectURL);
            }
        };

        /**
         * 初始化交互行为
         *
         * @override
         */
        DeliveryForm.prototype.initBehavior = function () {
            FormAction.prototype.initBehavior.apply(this, arguments);
            this.view.on('deleteslot', deleteSlot, this); 
            this.view.on('emptyslots', emptySlots, this); 
            this.view.on('addslots', addSlots, this);
            this.view.on('pricemodelchange', slotAmountPriceModelChange, this);
            this.view.on('showslotvalidate', showSlotValidate, this);
        };

        return DeliveryForm;
    }
);