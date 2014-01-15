/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 广告位列表数据模型类
 * @author wangyaqiong(catkin2009@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var ListModel = require('common/ListModel');
        var Data = require('./Data');
        var util = require('er/util');
        var config = require('./config');
        var u = require('underscore');

        function SlotListModel() {
            ListModel.apply(this, arguments);
            this.data = new Data();
        }
        
        util.inherits(SlotListModel, ListModel);

        var statuses = [{ text: '全部', value: 'all' }];
        var sizeStatuses = [{ text: '全部尺寸', value: '' }];
        var system = require('common/global/system');
        statuses = statuses.concat(system.channelGroupStatus);

        var datasource = require('er/datasource');

        /**
         * 数据源配置
         *
         * @type {Object}
         * @override
         */
        SlotListModel.prototype.datasource = {
            statuses: datasource.constant(statuses),
            sizeStatuses: function (model) {
                return model.getSlotSizes();
            },
            priceModelWord: function (model) {
                var priceModel = model.get('priceModels');
                var priceResults = [];
                if (priceModel) {
                    var priceModelType = ['CPD', 'CPM', 'CPC'];
                    priceModel = priceModel.split(',');
                    if (priceModel instanceof Array) {
                        u.each(priceModel, function (index) {
                            priceResults = priceResults.concat(
                                priceModelType[index]
                            );
                        });
                    }
                    else {
                        priceResults = priceResults.concat(
                            priceModelType[priceModel]
                        );
                    }
                }
                return '筛选项: ' + priceResults.join(',');
            },
            //清除搜索选项的html
            listWithoutKeywordURL: function(model) {
                var url = model.get('url');
                var path = url.getPath();
                var query = url.getQuery();
                
                delete query.keyword;
                var template = '#' + require('er/URL').withQuery(path, query);
                return template;
            },
            listWithoutPriceModel: function (model) {
                var url = model.get('url');
                var path = url.getPath();
                var query = url.getQuery();

                delete query.priceModels;
                var template = '#' + require('er/URL').withQuery(path, query);
                return template;
            },
            canView: datasource.permission('CLB_ADPOSITION_VIEW'),
            canCreate: datasource.permission('CLB_ADPOSITION_NEW'),
            canModify: datasource.permission('CLB_ADPOSITION_MODIFY'),
            hasReport: datasource.permission('CLB_REPORT_ADPOSITION'),
            canBatchModify: 
                datasource.permission('CLB_ADPOSITION_STATUS_MODIFY'),
            canGetCode: datasource.permission('CLB_ADPOSITION_GET_CODE'),
            canViewDelivery: datasource.permission('CLB_AD_VIEW')
        };

        /**
         * 批量修改广告位（尺寸、频道、显示顺序）
         *
         * @return {er/Promise}
         */
        SlotListModel.prototype.batchModifySlot = function (entity) {
            return this.data.batchModify(entity);
        };

        /**
         * 获取广告位所有尺寸列表数据
         *
         * @return {er/Promise}
         */
        SlotListModel.prototype.getSlotSizes = function () {
            return this.data.size()
                .then(
                    function (response) {
                        var allSizeValues = u.map(
                            response.results || [],
                            function (item) {
                                var sizeText = item.width + '*' + item.height;
                                return {
                                    text: sizeText,
                                    value: sizeText
                                };
                            }
                        );
                        return sizeStatuses.concat(allSizeValues);
                    }
                );
        };

        /**
         * 批量启用广告位前确认
         *
         * @param {Array.<string>} idx id集合
         * @return {FakeXHR}
         */
        SlotListModel.prototype.getRestoreAdvice = function (idx) {
            var Deferred = require('er/Deferred');
            var selectedItems = this.get('selectedItems');
            var canBatchEnable = u.every(selectedItems, function (item) {
                return item.channelStatus === 1;
            });
            var advice = {};
            var message = '';
            if (canBatchEnable) {
                message = '您确定要启用已选择的' + idx.length + '个'
                    + this.get('entityDescription') + '吗？';
            }
            else {
                var hasChannelRemoveElementsIndex = [];
                u.each(selectedItems, function (item, index) {
                    if (item.channelStatus === 0) {
                        hasChannelRemoveElementsIndex.push(index);
                    }
                });
                var num = hasChannelRemoveElementsIndex.length;
                var slotMessage = '';
                var firstElement = hasChannelRemoveElementsIndex[0];
                if (num === 1) {
                    slotMessage = selectedItems[firstElement].name;
                }
                else {
                    var lastElement = hasChannelRemoveElementsIndex[num-1];
                    slotMessage = selectedItems[firstElement].name + ',...'
                        + selectedItems[lastElement].name;
                }
                message = '您勾选的' + selectedItems.length + '个广告位中，'
                    + '有' + num + '个广告位由于所属频道已删除不能被启用。'
                    + '不能启用的广告位如下：' + slotMessage + '。';
            }
            
            advice = {
                message: message
            };

            return Deferred.resolved(advice);
        };

        /**
         * 批量删除前确认
         *
         * @param {Array.<string>} idx id集合
         * @return {FakeXHR}
         */
        SlotListModel.prototype.getRemoveAdvice = function (idx) {
            var Deferred = require('er/Deferred');
            var selectedItems = this.get('selectedItems');
            var canBatchRemove = u.every(selectedItems, function (item) {
                return item.deliveryStatus === 0;
            });
            var advice = {};
            var message = '';
            if (canBatchRemove) {
                message = '您确定要删除已选择的' + idx.length + '个'
                    + this.get('entityDescription') + '吗？';
            }
            else {
                var hasDeliveryElementsIndex = [];
                u.each(selectedItems, function (item, index) {
                    if (item.deliveryStatus == 1) {
                        hasDeliveryElementsIndex.push(index);
                    }
                });
                var num = hasDeliveryElementsIndex.length;
                var slotMessage = '';
                var firstElement = hasDeliveryElementsIndex[0];
                if (num === 1) {
                    slotMessage = selectedItems[firstElement].name;
                }
                else {

                    var lastElement = hasDeliveryElementsIndex[num-1];
                    slotMessage = selectedItems[firstElement].name + ',...'
                        + selectedItems[lastElement].name;
                }
                message = '您勾选的' + selectedItems.length + '个广告位中，'
                    + '有' + num + '个广告位由于有广告投放不能被删除。'
                    + '不能删除的广告位如下：' + slotMessage + '。';
            }
            
            advice = {
                message: message
            };

            return Deferred.resolved(advice);
        };


        /**
         * 预处理数据
         *
         * @override
         */
        SlotListModel.prototype.prepare = function () {
            var status = this.get('status');
            if (!status) {
                this.set('status', '1');
            }

            var list = this.get('results');
            var canModify = this.get('canModify');
            var hasReport = this.get('hasReport');
            var canViewDelivery = this.get('canViewDelivery');
            u.each(
                list,
                function (item) {
                    item.canModify = canModify;
                    item.hasReport = hasReport;
                    item.hasDetail = canViewDelivery;
                }
            );
        };

        /**
         * 获取请求后端时的查询参数
         *
         * @return {Object}
         */
        SlotListModel.prototype.getQuery = function () {
            var query = ListModel.prototype.getQuery.apply(this, arguments);
            
            if (!query.status) {
                query.status = '1';
            }
            else if (query.status === 'all') {
                query.status = '';
            }
            var priceModels = this.get('priceModels');
            if (priceModels) {
                query.priceModels = priceModels;
            }

            var size = this.get('size');
            if (size) {
                if (size === 'all') {
                    query.size = '';
                }
                else {
                    var sizeElements = size.split('*');
                    query.width = sizeElements[0];
                    query.height = sizeElements[1];
                    delete query.size;
                }
                
            }

            // 左侧导航树可能的参数
            if (this.get('channelId')) {
                query.channelIds = this.get('channelId');
            }
            if (this.get('channelGroupId')) {
                query.channelGroupIds = this.get('channelGroupId');
            }
            return query;
        };

        var ajax = require('er/ajax');
        u.each(
            config.requests,
            function (config) {
                ajax.register(SlotListModel, config.name, config);
            }
        );

        return SlotListModel;
    }
);