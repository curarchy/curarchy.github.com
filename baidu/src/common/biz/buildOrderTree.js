/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 客户-订单侧边栏树数据组装模块
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var u = require('underscore');

        /**
         * 将频道信息转换为树节点对象
         *
         * @param {Object} order 频道信息
         * @param {Object} parentNode 在树中的父节点
         * @return {Object}
         */
        function transformOrder(order, parentNode) {
            var treeNode = {
                id: 'order-' + order.id,
                text: order.name,
                type: 'order',
                isLeafLevel: true,
                children: []
            };

            if (parentNode) {
                treeNode.parent = parentNode.id;
            }

            return treeNode;
        }

        /**
         * 将频道分组信息转换为树节点对象
         *
         * @param {Object} customer 频道分组信息
         * @return {Object}
         */
        function transformCustomer(customer) {
            var treeNode = {
                id: 'customer-' + customer.id,
                type: 'customer',
                text: customer.name
            };
            
            treeNode.children = u.map(
                customer.orderInfos, 
                function (order) {
                    return transformOrder(order, treeNode);
                }
            );

            return treeNode;
        }

        /**
         * 构建树数据源信息
         *
         * @param {Object} data 后端返回的数据
         * @return {Object} 树数据源对象
         */
        function buildTree(data) {
            var datasource = {
                id: 'root',
                text: '所有内容',
                children: []
            };

            // 第一个肯定是“全部频道分组”
            var all = {
                id: 'all',
                text: '所有客户',
                href: '#/order/all',
                isLeafLevel: true
            };
            datasource.children.push(all);

            // 放所有客户
            datasource.children.push.apply(
                datasource.children,
                u.map(data, transformCustomer)
            );

            return datasource;
        }

        return buildTree;
    }
);        
