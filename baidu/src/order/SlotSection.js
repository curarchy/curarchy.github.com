/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 订单表单广告位资源区块Action
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var u = require('underscore');
        var util = require('er/util');
        var Action = require('er/Action');

        // 预加载广告位选择子Action
        require('../slot/Selector');
        
        /**
         * 订单表单广告位资源区块Action
         *
         * @extends er.Action
         * @requires order.SlotSectionModel
         * @requires order.SlotSectionView
         * @constructor
         */
        function SlotSection() {
            Action.apply(this, arguments);
        }

        util.inherits(SlotSection, Action);

        SlotSection.prototype.modelType = require('./SlotSectionModel');

        SlotSection.prototype.viewType = require('./SlotSectionView');

        SlotSection.prototype.initBehavior = function () {
            this.view.on(
                'addslots',
                function (e) {
                    this.addSlots(e.slots);
                },
                this
            );

            var datasource = this.model.get('datasource');
            if (datasource) {
                this.view.addSlots(datasource);
            }
        };

        SlotSection.prototype.addSlots = function (slots) {
            // 为空的广告位加上一个新广告行
            u.chain(slots)
                .filter(
                    function (slot) {
                        return !slot.deliveries || !slot.deliveries.length;
                    }
                )
                .each(
                    function (slot) {
                        slot.deliveries = [{}];
                    }
                );

            // TODO: 要不要同步到Model，如何同步？
            this.view.addSlots(slots);
        };

        function adjustDeliveryProperties(delivery) {
            // 只读的情况下，只返回固定的几个属性
            if (delivery.id) {
                // 没权限的不提交
                if (!delivery.authority) {
                    return null;
                }

                return {
                    deliveryId: delivery.id,
                    adPositionId: delivery.slotId,
                    discount: delivery.discount
                };
            }

            // 后端有3个接口字段和前端定义不同，这里做转换
            var slotId = delivery.slotId;
            var amount = delivery.amount;
            delivery = u.omit(delivery, 'slotId', 'amount');
            delivery.mount = amount;
            delivery.adPositionId = slotId;
            return delivery;
        }

        SlotSection.prototype.getRawValue = function () {
            var slots = this.view.getSlots();
            return u.chain(slots)
                .pluck('deliveries')
                .flatten()
                .map(adjustDeliveryProperties)
                .compact()
                .value();
        };

        SlotSection.prototype.validate = function () {
            return this.view.validate();
        };

        SlotSection.prototype.showValidationErrors = function (errors) {
            var fieldErrors = [];
            u.each(
                errors,
                function (error) {
                    var segments = error.field.split('.');
                    if (segments.length > 1) {
                        var fieldError = {
                            index: segments[1],
                            field: segments[2],
                            message: error.message
                        };
                        fieldErrors.push(fieldError);
                    }
                    else {
                        this.view.showGlobalError(error);
                    }
                },
                this
            );

            this.view.notifyErrors(fieldErrors);
        };

        return SlotSection;
    }
);        
