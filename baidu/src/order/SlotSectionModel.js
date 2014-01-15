/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 订单表单广告位资源区块数据模型
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var u = require('underscore');
        var util = require('er/util');
        var Model = require('er/Model');

        /**
         * 订单表单广告位资源区块数据模型
         *
         * @extends er.Model
         * @constructor
         */
        function SlotSectionModel() {
            Model.apply(this, arguments);
        }

        util.inherits(SlotSectionModel, Model);

        SlotSectionModel.prototype.datasource = [
            {
                datasource: function (model) {
                    var result = u.map(
                        model.get('datasource'),
                        function (slot) {
                            slot = u.clone(slot);
                            slot.deliveries = u.map(
                                slot.deliveries,
                                function (delivery) {
                                    // 修正几个字段
                                    var slotId = delivery.adPositionId;
                                    var amount = delivery.mount;
                                    delivery = u.omit(
                                        delivery,
                                        'adPositionId', 'amount'
                                    );
                                    delivery.slotId = slotId;
                                    delivery.amount = amount;
                                    return delivery;
                                }
                            );
                            return slot;
                        }
                    );

                    return result;
                }
            },
            {
                canAddSlot: function (model) {
                    var deliveries = u.chain(model.get('datasource'))
                        .pluck('deliveries')
                        .flatten()
                        .value();
                    return deliveries.length < 100;
                }
            }
        ];

        return SlotSectionModel;
    }
);        
