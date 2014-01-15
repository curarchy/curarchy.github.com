/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 订单详情页数据模型类
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var u = require('underscore');
        var util = require('er/util');
        var OrderTreeDetailModel = require('common/biz/OrderTreeDetailModel');
        var Data = require('./Data');

        /**
         * 订单详情页数据模型类
         *
         * @param {Object} [context] 初始数据
         * @constructor
         * @extends {common/biz/OrderTreeDetailModel}
         */
        function OrderDetailModel(context) {
            OrderTreeDetailModel.apply(this, arguments);
            this.data = new Data();
        }

        util.inherits(OrderDetailModel, OrderTreeDetailModel);

        OrderDetailModel.prototype.entityName = 'order';

        var datasource = require('er/datasource');
        var Type = require('./enum').Type;

        /**
         * 数据源配置
         *
         * @type {Array}
         * @override
         */
        OrderDetailModel.prototype.datasource = [
            {
                crumbPath: function (model) {
                    if (!model.get('id')) {
                        return [
                            { 
                                text: '所有订单'
                            }
                        ];
                    }
                    else {
                        return [
                            {
                                text: '所有订单',
                                href: '#/order/all'
                            },
                            {
                                text: model.get('adowner').name,
                                href: '#/customer/detail~id='
                                    + model.get('adowner').id
                            }
                        ];
                    }
                },

                tabs: function (model) {
                    var tabs = [];
                    if (model.get('canViewOrder') && !model.get('id')) {
                        tabs.push({ title: '订单', type: 'order' });
                    }
                    if (model.get('canViewDelivery')) {
                        tabs.push({ title: '广告', type: 'delivery' });
                    }
                    if (model.get('canViewCreative')) {
                        tabs.push({ title: '创意', type: 'creative' });
                    }

                    return tabs;
                },
                
                typeText: datasource.enumText(Type, 'type'),

                canModify: datasource.permission('CLB_ORDER_MODIFY'),

                deliveries: function (model) {
                    if (!model.get('id')) {
                        return;
                    }
                    
                    var index = u.toMap(
                        model.get('deliveries'), 'status', 'count');

                    return u.map(
                        require('delivery/enum').Status.toArray(),
                        function (item) {
                            return {
                                text: item.text,
                                count: index[item.value] || 0
                            };
                        }
                    );
                }
            }
        ];

        /**
         * 获取数据源配置
         */
        OrderDetailModel.prototype.getDatasource = function () {
            // 订单是通过`orders/${id}/summary`加载信息的
            var datasource = u.deepClone(
                OrderTreeDetailModel.prototype.getDatasource.call(this));
            datasource[0].entity = function (model) {
                var id = model.get('id');
                if (id) {
                    return model.data.findSummaryById(id)
                        .then(
                            function (entity) {
                                model.fill(entity);
                                return entity;
                            }
                        );
                }
                else {
                    return {};
                }
            };

            return datasource;
        };

        return OrderDetailModel;
    }
);        
