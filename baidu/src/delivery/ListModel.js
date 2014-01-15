/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 广告列表数据模型类
 * @author lisijin(ibadplum@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var ListModel = require('common/ListModel');
        var Data = require('./Data');
        var util = require('er/util');
        var u = require('underscore');
        var enums = require('./enum');

        function DeliveryListModel() {
            ListModel.apply(this, arguments);
            this.data = new Data();
        }

        util.inherits(DeliveryListModel, ListModel);

        var statusArray = [
            { text: '非终止', value: '' },
            { text: '全部广告状态', value: 'all' }
        ];
        var deliveryTypes = enums.Status.toArray();
        deliveryTypes = statusArray.concat(deliveryTypes);
        var priceModels = enums.PriceModel.toArray();
        priceModels.unshift({ text: '计费类型', value: ''});
        var platforms = enums.Platform.toArray();
        platforms.unshift({ text: '所有平台', value: ''});
        var datasource = require('er/datasource');
        /**
         * 状态迁移表。
         *
         * @type {Object[]}
         * @override
         */
        DeliveryListModel.prototype.statusTransitions = [
            { status: 0, accept: [1, 2] },
            { status: 4, accept: [0, 1, 2, 5] },
            { status: 2, accept: [0] }
        ];

        /**
         * 数据源配置
         *
         * @type {Object}
         * @override
         */
        DeliveryListModel.prototype.datasource = {
            orderId: function(model) {
                var url = model.get('url');
                var query = url.getQuery();
                return query.orderId;
            },
            statuses: datasource.constant(deliveryTypes),
            priceModels: datasource.constant(priceModels),
            platforms: datasource.constant(platforms),
            canModify: datasource.permission('CLB_DELIVERY_MODIFY'),
            hasReport: datasource.permission('CLB_REPORT_DELIVERY'),
            canBatchModify:
                datasource.permission('CLB_DELIVERY_STATUS_MODIFY')
        };

        /**
         * 准备数据
         *
         * @override
         */
        DeliveryListModel.prototype.prepare = function () {
            var list = this.get('results');
            var canModify = this.get('canModify');
            var hasReport = this.get('hasReport');
            u.each(
                list,
                function (item) {
                    item.canModify = canModify;
                    item.hasReport = hasReport;
                }
            );
        };

        /**
         * 获取请求后端的参数
         *
         * @return {Object}
         * @override
         */
        DeliveryListModel.prototype.getQuery = function () {
            var query = ListModel.prototype.getQuery.apply(this, arguments);
            if (!query.status) {
                query.status = '0,1,2,3,5';
            }
            else if (query.status === 'all') {
                query.status = '';
            }
            query.priceType = this.get('priceModel');
            query.platform = this.get('platForm');
            query.orderType = this.get('orderType');
            query.orderId = this.get('orderId');
            query.adownerId = this.get('companyId');
            query.adPositionId = this.get('slotId');
            query.channelId = this.get('channelId');
            query.channelGroupId = this.get('channelGroupId');
            return query;
        };

        DeliveryListModel.prototype.toggleStar = function (item) {
            if (!item) {
                var error = new Error('No delivery widh id "' + id + '" found');
                return Deferred.rejected(error);
            }

            var requesting = item.flag
                ? this.data.removeStar(item.id)
                : this.data.addStar(item.id);

            return requesting.done(function () { item.flag = !item.flag; });
        };

        DeliveryListModel.prototype.pause =
            u.partial(ListModel.prototype.updateStatus, 'pause', 0);

        DeliveryListModel.prototype.stop =
            u.partial(ListModel.prototype.updateStatus, 'stop', 1);

        DeliveryListModel.prototype.restore =
            u.partial(ListModel.prototype.updateStatus, 'restore', 2);

        return DeliveryListModel;
    }
);