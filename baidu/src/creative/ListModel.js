/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 创意列表数据模型类
 * @author lisijin(ibadplum@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var ListModel = require('common/ListModel');
        var Data = require('./Data');
        var UnionData = require('common/global/UnionData');
        var util = require('er/util');
        var enums = require('./enum');
        var u = require('underscore');
        var ADPOSITION_ID = 791114;

        function CreativeListModel() {
            ListModel.apply(this, arguments);
            this.data = new Data();
            this.unionData = new UnionData();
        }

        util.inherits(CreativeListModel, ListModel);

        /**
         * 状态迁移表。
         *
         * @type {Object[]}
         * @override
         */

        var statuses = enums.Statuses.toArray();
        statuses.unshift({ text: '所有创意状态', value: '' });
        var creativeTypes = enums.Type.toArray();
        creativeTypes.unshift({ text: '所有创意类型', value: '' });

        var datasource = require('er/datasource');
        /**
         * 数据源配置
         *
         * @type {Object}
         * @override
         */
        CreativeListModel.prototype.datasource = {
            isUnionServiceOK: function (model) {
                var flag = model.unionData.getUnionService();
                return flag;
            },
            urlQuery: function (model) {
                return model.get('url').getQuery();
            },
            orderId: function (model) {
                return model.get('urlQuery').orderId;
            },
            deliveryId: function (model) {
                return model.get('urlQuery').deliveryId;
            },
            statuses: datasource.constant(statuses),
            creativeTypes: datasource.constant(creativeTypes),
            canModify: datasource.permission('CLB_AD_MODIFY'),
            canAdBatchModify: datasource.permission('CLB_AD_STATUS_MODIFY'),
            hasReport: datasource.permission('CLB_REPORT_ADPOSITION'),
            canBatchModify: function (model) {
                var canAdBatch = model.get('canAdBatchModify');
                var deliveryId = model.get('deliveryId');
                if (deliveryId && canAdBatch) {
                    return true;
                }
                return false;
            }
        };

        /**
         * 准备数据
         *
         * @override
         */
        CreativeListModel.prototype.prepare = function () {
            var list = this.get('results');
            var canModify = this.get('canModify');
            var isUnionServiceOK = this.get('isUnionServiceOK');
            var hasReport = this.get('hasReport');
            u.each(
                list,
                function (item) {
                    item.canModify = canModify
                        && (item.type != 10 || isUnionServiceOK);
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
        CreativeListModel.prototype.getQuery = function () {
            var query = ListModel.prototype.getQuery.apply(this, arguments);
            query.status = this.get('status');
            query.type = this.get('type');
            query.orderId = this.get('orderId');
            query.deliveryId = this.get('deliveryId');
            query.adownerId = this.get('companyId');
            query.withDeliveryInfo = 1;
            return query;
        };

        /**
         * 根据索引获取预览创意的相关数据
         *
         * @param {string} 创意的id
         * @returns {er/Promise}
         */
        CreativeListModel.prototype.getPreviewOption = function (id) {
            var creative = u.find(
                this.get('results'),
                function (item) {
                    return item.id == id;
                }
            );
            var total = this.get('results').length;
            return this.data.getPreviewUrl(id).done(
                function (res) {
                    var url = resolveURL(id, res.previewId);
                    return {
                        data: creative,
                        previewUrl: url,
                        total: total
                    };
                }
            );
        };

         /**
         * 获取创意预览 url
         *
         * @param mid 创意id
         * @param vcid 预览id
         * @returns {String}
         */
        function resolveURL(mid, vcid) {
            var search = require('er/URL').serialize(
                {
                    'baidu_dup_preview_sid': ADPOSITION_ID,
                    'baidu_dup_preview_mid': mid,
                    'baidu_dup_preview_vc': vcid,
                    'baidu_dup_preview_ts': (new Date()).getTime()
                }
            );

            var pathname = location.pathname;

            var path = pathname.substring(0, pathname.lastIndexOf('/') + 1);

            return '//' + location.host + path
                + 'creative-preview.html?' + search;
        }

        CreativeListModel.prototype.deleteCreative = function (ids) {
            var result = u.map(
                ids,
                function (item) {
                    return { id: item };
                }
            );
            var entity = {
                data: {
                    type: 0,
                    data: result
                },
                deliveryId: this.get('deliveryId')
            };
            return this.data.save(entity);
        };

        return CreativeListModel;
    }
);