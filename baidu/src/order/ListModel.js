/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 订单列表数据模型类
 * @author lisijin(ibadplum@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var ListModel = require('common/ListModel');
        var Data = require('./Data');
        var util = require('er/util');
        var u = require('underscore');
        var datasource = require('er/datasource');
        var enums = require('./enum');

        function OrderListModel() {
            ListModel.apply(this, arguments);
            this.data = new Data();
        }

        util.inherits(OrderListModel, ListModel);

        var statusArray = [
            { text: '非终止', value: '' },
            { text: '全部广告状态', value: 'all' }
        ];
        var deliveryStatusList = require('delivery/enum').Status.toArray();
        deliveryStatusList = statusArray.concat(deliveryStatusList);
        var orderType = [{ text: '全部订单类型', value: '' }].concat(
            enums.Type.toArray());

        /**
         * 数据源配置
         *
         * @type {Object}
         * @override
         */
        OrderListModel.prototype.datasource = {
            statusList: datasource.constant(deliveryStatusList),
            orderType: datasource.constant(orderType),
            salerList: function (model) {
                return model.getSalerMap();
            },
            canModify: datasource.permission('CLB_ORDER_MODIFY'),
            hasReport: datasource.permission('CLB_REPORT_ORDER'),
            canBatchModify:
                datasource.permission('CLB_ORDER_STATUS_MODIFY'),
            canFilterSaler:
                datasource.permission('CLB_ORDER_FILTER_BY_SALER')
        };

        /**
         * 准备数据
         *
         * @override
         */
        OrderListModel.prototype.prepare = function () {
            var list = this.get('results');
            var canModify = this.get('canModify');
            u.each(
                list,
                function (item) {
                    item.canModify = canModify;
                }
            );
        };

        /**
         * 获取销售人员列表
         *
         * @return {er/Promise}
         */
        OrderListModel.prototype.getSalerMap = function () {
            var ManagerData = require('manager/Data');
            var data = new ManagerData();
            return data.request('manager/salers').then(
                function (response) {
                    var allSalers = response.results || [];
                    var allSalerValues = u.map(allSalers, function (item) {
                        return {
                            text: item.name,
                            value: item.id
                        };
                    });
                    allSalerValues.push({
                        text: '--',
                        value: '-1'
                    });
                    return [{ text: '全部销售人员', value: '' }].concat(
                        allSalerValues);
                }
            );
        };
        /**
         * 获取请求后端的参数
         *
         * @return {Object}
         * @override
         */
        OrderListModel.prototype.getQuery = function () {
            var query = ListModel.prototype.getQuery.apply(this, arguments);
            query.deliveryStatus = this.get('deliveryStatus');
            if (!query.deliveryStatus) {
                query.deliveryStatus = '0,1,2,3,5';
            }
            else if (query.deliveryStatus === 'all') {
                query.deliveryStatus = '';
            }
            query.salerId = this.get('salerId');
            query.type = this.get('type');
            query.adownerId = this.get('companyId');
            return query;
        };

        return OrderListModel;
    }
);