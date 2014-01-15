/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file投放量表单区域数据模型类
 * @author liyidong(srhb18@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var Model = require('er/Model');
        var util = require('er/util');
        var u = require('underscore');

        /**
         * 投放量表单区域数据模型类
         *
         * @constructor
         * @extends er/Model
         */
        function AmountFieldModel () {
            Model.apply(this, arguments);
        }

        util.inherits(AmountFieldModel, Model);

        /**
         * 对数据源进行预处理
         */
        AmountFieldModel.prototype.prepare = function () {
            var slots = u.clone(this.get('selectedSlots'));
            this.set('slots', slots);

            var priceModel = parseInt(this.get('priceModel'), 10);
            var PriceModel = require('./enum').PriceModel;
            if (priceModel === PriceModel.CPM) { 
                this.set('amountUnit', '次展现');
                u.each(
                    slots,
                    function (slot) {
                        if (slot.amount) {
                            if (slot.amount.type === null) {
                                slot.amount.type = 0;
                            }
                        }
                        else {
                            slot.amount = {
                                type: 0,
                                total: 0,
                                data: null
                            };
                        }
                    }
                );
                
            }
            else if (priceModel === PriceModel.CPC) {
                this.set('amountUnit', '次点击');
                u.each(
                    slots,
                    function (slot) {
                        if (!slot.amount) {
                            slot.amount = {
                                type: null,
                                total: 0,
                                data: null
                            };
                        }
                        else {
                            slot.amount.type = null;
                        }
                    }
                );
            }
        };

        return AmountFieldModel;
    }
);        
