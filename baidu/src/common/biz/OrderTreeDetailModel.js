/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 左侧有客户-订单树的数据模型基类
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var util = require('er/util');
        var DetailModel = require('common/DetailModel');
        var u = require('underscore');

        /**
         * 左侧包含[频道分组-频道]导航树的详情页数据模型基类
         *
         * @constructor
         * @extends common/DetailModel
         */
        function OrderTreeDetailModel() {
            DetailModel.apply(this, arguments);
        }

        util.inherits(OrderTreeDetailModel, DetailModel);

        /**
         * 指定树数据源的**顶层**实体类型
         *
         * @type {string}
         */
        OrderTreeDetailModel.prototype.treeEntityType = 'orderInfo';

        /**
         * 构造树的数据源结构
         *
         * @param {Object} data 后端返回的列表数据
         * @return {Object} 符合树的数据源结构
         * @override
         */
        OrderTreeDetailModel.prototype.buildTreeDatasource = 
            function (data) {
                var buildChannelTree = require('./buildOrderTree');
                return buildChannelTree(data.results);
            };

        var datasource = require('er/datasource');
        var defaultDatasource = {
            canCreateOrder: datasource.permission('CLB_ORDER_NEW'),
            canViewOrder: datasource.permission('CLB_ORDER_VIEW'),
            // 下面所有TAB的权限都加上
            canCreateDelivery: datasource.permission('CLB_AD_NEW'),
            canViewDelivery: datasource.permission('CLB_AD_VIEW'),
            canCreateCreative: datasource.permission('CLB_AD_NEW'),
            canViewCreative: datasource.permission('CLB_AD_VIEW')
        };

        OrderTreeDetailModel.prototype.defaultDatasource = u.extend(
            defaultDatasource,
            DetailModel.prototype.defaultDatasource
        );

        return OrderTreeDetailModel;
    }
);        
