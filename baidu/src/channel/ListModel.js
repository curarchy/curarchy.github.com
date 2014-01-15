/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 频道列表数据模型类
 * @author wangyaqiong(wangyaqiong@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var ListModel = require('common/ListModel');
        var Data = require('./Data');
        var util = require('er/util');
        var config = require('./config');
        var u = require('underscore');

        function ChannelListModel() {
            ListModel.apply(this, arguments);
            this.data = new Data();
        }

        util.inherits(ChannelListModel, ListModel);

        var statuses = [{ text: '全部', value: 'all' }];
        var system = require('common/global/system');
        statuses = statuses.concat(system.channelStatus);

        var datasource = require('er/datasource');
        
        /**
         * 数据源配置
         *
         * @type {Object}
         * @override
         */
        ChannelListModel.prototype.datasource = {
            statuses: datasource.constant(statuses),
            canCreate: datasource.permission('CLB_CHANNEL_NEW'),
            canModify: datasource.permission('CLB_CHANNEL_MODIFY'),
            hasReport: datasource.permission('CLB_REPORT_CHANNEL'),
            canBatchModify: datasource.permission('CLB_CHANNEL_STATUS_MODIFY'),
            // 导航栏权限
            canSubManagerView: datasource.permission('CLB_SUBMANAGER_VIEW'),
            canCompanyView: datasource.permission('CLB_COMPANY_VIEW'),
            canContactView: datasource.permission('CLB_CONTACTOR_VIEW'),
            canChannelView: datasource.permission('CLB_CHANNEL_VIEW')
        };
        
        /**
         * 预处理数据
         *
         * @override
         */
        ChannelListModel.prototype.prepare = function () {
            var status = this.get('status');
            if (!status) {
                this.set('status', '1');
            }
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
         * 获取请求后端时的查询参数
         *
         * @return {Object}
         */
        ChannelListModel.prototype.getQuery = function () {
            var query = ListModel.prototype.getQuery.apply(this, arguments);
            if (!query.status) {
                query.status = '1';
            }
            else if (query.status === 'all') {
                query.status = '';
            }
            return query;
        };

        /**
         * 判断是否可以批量更新状态
         *
         * @param {Object[]} items 需要批量更新的对象
         * @param {number} status 目标状态
         * @return boolean
         * @protected
         * @override
         */
        ChannelListModel.prototype.canUpdateToStatus = function (items) {
            // 只要有一个没有启用的广告位，就能删除/启用
            var noEnabledSlots = u.any(
                items,
                function (channel) {
                    return channel.usedAdpositionCount === 0;
                }
            );

            return noEnabledSlots
                && ListModel.prototype.canUpdateToStatus.apply(this, arguments);
        };

        var ajax = require('er/ajax');
        u.each(
            config.requests,
            function (config) {
                ajax.register(ChannelListModel, config.name, config);
            }
        );

        return ChannelListModel;
    }
);