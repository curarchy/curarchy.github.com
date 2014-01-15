/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 广告客户详情页数据模型类
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var OrderTreeDetailModel = require('common/biz/OrderTreeDetailModel');
        var Data = require('./Data');
        var util = require('er/util');

        /**
         * 广告客户详情页数据模型类
         *
         * @param {Object} [context] 初始数据
         * @constructor
         * @extends {common/biz/OrderTreeDetailModel}
         */
        function CompanyDetailModel(context) {
            OrderTreeDetailModel.apply(this, arguments);
            this.data = new Data();
        }

        util.inherits(CompanyDetailModel, OrderTreeDetailModel);

        CompanyDetailModel.prototype.entityName = 'company';

        /**
         * 获取当前详情页对应树节点的的实体名称
         *
         * 客户详情页对应的是`"customer"`而非`"company"`
         *
         * @return {string}
         * @override
         */
        CompanyDetailModel.prototype.getTreeNodeEntityName = function () {
            return 'customer';
        };

        var datasource = require('er/datasource');
        var PriceModel = require('delivery/enum').PriceModel;

        /**
         * 数据源配置
         *
         * @type {Array}
         * @override
         */
        CompanyDetailModel.prototype.datasource = [
            {
                crumbPath: function (model) {
                    return [
                        {
                            text: '所有订单',
                            href: '#/order/all'
                        }
                    ];
                },

                tabs: function (model) {
                    var tabs = [];
                    if (model.get('canViewOrder')) {
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

                canModify: datasource.permission('CLB_COMPANY_MODIFY'),

                priceModelText: datasource.enumText(PriceModel, 'priceModel'),

                beginTime: datasource.formatDate(),

                endTime: datasource.formatDate()
            }
        ];

        return CompanyDetailModel;
    }
);        
