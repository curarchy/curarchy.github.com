/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 公司列表数据模型类
 * @author lisijin(ibadplum@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var ListModel = require('common/ListModel');
        var Data = require('./Data');
        var util = require('er/util');
        var config = require('./config');
        var u = require('underscore');

        function CompanyListModel() {
            ListModel.apply(this, arguments);
            this.data = new Data();
        }

        util.inherits(CompanyListModel, ListModel);

        var statuses = [ { text: '全部', value: 'all' } ];
        var system = require('common/global/system');
        statuses = statuses.concat(system.companyInfoStatus);

        var datasource = require('er/datasource');

        /**
         * 数据源配置
         *
         * @type {Object}
         * @override
         */
        CompanyListModel.prototype.datasource = {
            statuses: datasource.constant(statuses),
            canCreate: datasource.permission('CLB_COMPANY_NEW'),
            canModify: datasource.permission('CLB_COMPANY_MODIFY'),
            canBatchModify: datasource.permission('CLB_COMPANY_STATUS_MODIFY'),
            // 导航栏权限
            canSubManagerView: datasource.permission('CLB_SUBMANAGER_VIEW'),
            canCompanyView: datasource.permission('CLB_COMPANY_VIEW'),
            canContactView: datasource.permission('CLB_CONTACTOR_VIEW'),
            canChannelView: datasource.permission('CLB_CHANNEL_VIEW')
        };

         /**
         * 对数据源进行预处理
         */
        CompanyListModel.prototype.prepare = function () {
            /**
             * 根据权限写入列表每行的操作行为权限
             *
             * @param {Object} item 当前行的数据
             */
            
            // 默认筛选项为“启用”
            var status = this.get('status');
            if (!status) {
                this.set('status', '1');
            }

            u.each(
                this.get('results'), 
                function (item) {
                    item.canModify = this.get('canModify');
                }, 
                this
            );
        };

        /**
         * 获取请求后端的参数
         *
         * @return {Object}
         * @override
         */
        CompanyListModel.prototype.getQuery = function () {
            var query = ListModel.prototype.getQuery.apply(this, arguments);
            if (!query.status) {
                query.status = '1';
            }
            if (query.status === 'all') {
                query.status = '';
            }
            query.role = this.get('role');
            return query;
        };

        var ajax = require('er/ajax');
        u.each(
            config.requests,
            function (config) {
                ajax.register(CompanyListModel, config.name, config);
            }
        );

        return CompanyListModel;
    }
);