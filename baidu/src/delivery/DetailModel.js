/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 广告详情页数据模型类
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var util = require('er/util');
        var OrderTreeDetailModel = require('common/biz/OrderTreeDetailModel');
        var Data = require('./Data');

        /**
         * 广告详情页数据模型类
         *
         * @constructor
         * @extends {common/biz/OrderTreeDetailModel}
         */
        function DeliveryDetailModel(context) {
            OrderTreeDetailModel.apply(this, arguments);
            this.data = new Data();
        }

        util.inherits(DeliveryDetailModel, OrderTreeDetailModel);

        DeliveryDetailModel.prototype.entityName = 'delivery';

        var datasource = require('er/datasource');
        var PriceModel = require('./enum').PriceModel;

        /**
         * 数据源配置
         *
         * @type {Array}
         * @override
         */
        DeliveryDetailModel.prototype.datasource = [
            {
                crumbPath: function (model) {
                    var owner = {
                        id: model.get('adownerId'),
                        name: model.get('adownerName')
                    };

                    return [
                        {
                            text: '所有订单',
                            href: '#/order/all'
                        },
                        {
                            text: owner.name,
                            href: '#/customer/detail~id=' + owner.id
                        },
                        {
                            text: model.get('orderName'),
                            href: '#/order/detail~id=' + model.get('orderId')
                        }
                    ];
                },

                tabs: function (model) {
                    var tabs = [];
                    if (model.get('canViewCreative')) {
                        tabs.push({ title: '创意', type: 'creative' });
                    }

                    return tabs;
                },

                priceModelText: datasource.enumText(PriceModel, 'priceModel'),

                canModify: datasource.permission('CLB_AD_MODIFY'),

                beginTime: datasource.formatDate(),

                endTime: datasource.formatDate()
            }
        ];

        return DeliveryDetailModel;
    }
);        
