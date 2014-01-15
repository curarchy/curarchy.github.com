/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 广告相关的工具模块
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        // 某段时间用的“无结束日期”标记，后续可删
        var INFINITE_DATE = '99990101';

        var PriceModel = require('./enum').PriceModel;

        var exports = {};

        /**
         * 判断是否有结束日期
         *
         * @param {Object} delivery 广告信息
         * @return {boolean}
         */
        exports.hasEndTime = function (delivery) {
            var end = delivery.time[1];
            return end && end !== INFINITE_DATE;
        };

        /**
         * 判断一个广告是否拥有有效的投放量
         *
         * 广告为 **CPD** 且没有结束日期时，其投放量是没有意义的，因此会返回`false`
         *
         * @param {Object} delivery 广告信息
         * @return {boolean}
         */
        exports.hasValidAmount = function (delivery) {
            return delivery.priceModel !== PriceModel.CPD
                || exports.hasEndTime(delivery);
        };

        /**
         * 判断一个广告是否拥有有效的总价
         *
         * @param {Object} delivery 广告信息
         * @param {boolean}
         */
        exports.isTotalPriceAvailable = function (delivery) {
            return delivery.priceModel === delivery.slot.priceModel
                && (delivery.price != null && !isNaN(delivery.price))
                && (delivery.amount != null && !isNaN(delivery.amount))
                && (delivery.discount != null && !isNaN(delivery.discount));
        };

        /**
         * 获取一个广告的总价
         *
         * @param {Object} delivery 广告信息
         * @param {number} 可能返回`NaN`
         */
        exports.getTotalPrice = function (delivery) {
            if (exports.isTotalPriceAvailable(delivery)) {
                var totalPrice = delivery.price
                    * delivery.amount
                    * (delivery.discount / 100);
                if (delivery.priceModel === PriceModel.CPM) {
                    totalPrice /= 1000;
                }

                return parseFloat(totalPrice.toFixed(2));
            }
            else {
                return NaN;
            }
        };

        return exports;
    }
);        
