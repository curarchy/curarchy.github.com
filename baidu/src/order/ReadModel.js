/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 直投订单Model
 * @author exodia(dengxinxin@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var ReadModel = require('common/ReadModel');
        var Data = require('./Data');
        var util = require('er/util');
        var u = require('underscore');
        var moment = require('moment');

        var DATE_FORMAT = 'YYYYMMDD';
        var DATE_TEXT_FORMAT = 'YYYY-MM-DD';

        function DirectReadModel() {
            ReadModel.apply(this, arguments);
            this.data = new Data();
        }

        util.inherits(DirectReadModel, ReadModel);

        DirectReadModel.prototype.datasource = {
            crumbPath: function (model) {
                var path = [
                    {
                        text: '所有订单',
                        href: '#/order/all'
                    }
                ];
                if (model.hasNonEmptyValue('customerName')) {
                    var customerId = model.get('customer');
                    var cusHref = '#/customer/detail~id=' + customerId;
                    path.push({
                        text: model.get('customerName'),
                        href: cusHref
                    });
                }
                path.push({ text: model.get('title') });
                return path;
            }
        };

        function formatDeliveryTime(delivery) {
            delivery.time = u.map(
                u.parseDateRanges(delivery.time || []),
                function (range) {
                    var begin = moment(range[0], DATE_FORMAT);
                    var end = moment(range[1], DATE_FORMAT);

                    if (range[1]) {
                        return {
                            begin: begin.format(DATE_TEXT_FORMAT),
                            // 这里擅自决定改成end，原来是begin，
                            // 欣欣觉着不对可以改回来。。。--- 李享
                            end: end.format(DATE_TEXT_FORMAT)
                        };
                    }
                    else {
                        return {
                            begin: begin.format(DATE_TEXT_FORMAT)
                        };
                    }
                }
            );
            if (!delivery.time.length) {
                var today = moment().format(DATE_TEXT_FORMAT);
                delivery.time = [{ begin: today, end: today }];
            }
        }

        DirectReadModel.prototype.prepare = function () {
            var Status = require('common/enum').Status;
            var PriceModel = require('delivery/enum').PriceModel;
            var deliveryUtil = require('delivery/util');

            var summary = {
                cpd: 0, cpm: 0, cpc: 0, price: 0
            };

            u.each(
                this.get('adpositions'),
                function (slot) {
                    slot.status = Status.getTextFromValue(slot.status);
                    slot.size = slot.width + '*' + slot.height;

                    u.each(
                        slot.deliveries,
                        function (delivery) {
                            var priceModel = parseInt(delivery.priceModel, 10);
                            var amountUnit = '天';
                            if (priceModel === PriceModel.CPM) { 
                                amountUnit = '次展现';
                            }
                            else if (priceModel === PriceModel.CPC) {
                                amountUnit = '次点击';
                            }
                            delivery.slot = slot;
                            delivery.amount = delivery.mount;
                            delivery.price = slot.rate;
                            
                            var total = deliveryUtil.getTotalPrice(delivery);

                            // 算总量
                            summary.price += total;
                            var priceModelText = 
                                PriceModel[delivery.priceModel].toLowerCase();
                            summary[priceModelText] += delivery.amount;

                            if (delivery.priceModel === slot.priceModel) {
                                delivery.total = isNaN(total)
                                    ? '--'
                                    : '￥' + total.toFixed(2);
                                delivery.price = delivery.price
                                    ? '￥' + delivery.price
                                    : '--';
                            }
                            else {
                                delivery.total = '--';
                                delivery.price = '--';
                            }

                            if (delivery.amount) {
                                delivery.amount = delivery.mount + amountUnit;
                            }
                            else {
                                delivery.amount = '--';
                            }

                            delivery.discount = delivery.discount + '%';
                            
                            var priceModel = delivery.priceModel;
                            delivery.priceModel = 
                                PriceModel.getTextFromValue(priceModel);
                            formatDeliveryTime(delivery);
                        }
                    );
                }
            );

            if (isNaN(summary.price)) {
                summary.price = '--';
            }
            else {
                summary.price = '￥' + summary.price;
            }

            this.set('summary', summary);
        };

        return DirectReadModel;
    }
);