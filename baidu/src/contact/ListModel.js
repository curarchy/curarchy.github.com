/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 联系人列表数据模型类
 * @author liyidong(liyidong@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var ListModel = require('common/ListModel');
        var Data = require('./Data');
        var util = require('er/util');
        var config = require('./config');
        var u = require('underscore');

        function ContactListModel() {
            ListModel.apply(this, arguments);
            this.data = new Data();
        }

        util.inherits(ContactListModel, ListModel);

        /**
         * 状态迁移表。
         *
         * @type {Object[]}
         * @override
         */
        ContactListModel.prototype.statusTransitions = [
            { status: 0, accept: [0, 1, 2, 3, 4] },
            { status: 1, accept: [4, 5] },
            { status: 2, accept: [3] }
        ];

        var statuses = [{ text: '全部', value: 'all' }];
        var system = require('common/global/system');
        statuses = statuses.concat(system.contactorInfoStatus);

        var datasource = require('er/datasource');
        /**
         * 数据源配置
         *
         * @type {Object}
         * @override
         */
        ContactListModel.prototype.datasource = {
            statuses: datasource.constant(statuses),
            canModify: datasource.permission('CLB_CONTACTOR_MODIFY'),
            canCreate: datasource.permission('CLB_CONTACTOR_NEW'),
            canInvite: datasource.permission('CLB_CONTACTOR_INVITE'),
            canBatchModify:
                datasource.permission('CLB_CONTACTOR_STATUS_MODIFY'),
            // 导航栏权限
            canSubManagerView: datasource.permission('CLB_SUBMANAGER_VIEW'),
            canCompanyView: datasource.permission('CLB_COMPANY_VIEW'),
            canContactView: datasource.permission('CLB_CONTACTOR_VIEW'),
            canChannelView: datasource.permission('CLB_CHANNEL_VIEW')
        };

        /**
         * 准备数据
         *
         * @override
         */
        ContactListModel.prototype.prepare = function () {
            // 默认筛选项为“非删除” - 0,1,2,3,4
            var status = this.get('status');
            if (!status) {
                this.set('status', '0,1,2,3,4');
            }

            // 下面的代码为每一项添加操作列的权限
            var list = this.get('results');
            var canModify = this.get('canModify');
            var canInvite = this.get('canInvite');
            u.each(
                list,
                function (item) {
                    item.canReinvite =
                        canInvite && (item.status === 1 || item.status === 2);
                    item.canModify = canModify;
                }
            );
        };

        /**
         * 获取请求后端的参数
         *
         * @return {Object}
         * @override
         */
        ContactListModel.prototype.getQuery = function () {
            var query = ListModel.prototype.getQuery.apply(this, arguments);
            // 向用户屏蔽全部和非删除之间的参数显示
            if (!query.status) {
                query.status = '1,2,3';
            }
            if (query.status === 'all') {
                query.status = '';
            }
            if (this.get('companyId')) {
                query.companyId = this.get('companyId');
            }
            return query;
        };

        /**
         * 重发邀请
         *
         * @param {number} reinviteID 重发邀请对应的ID
         * @return {er/Promise}
         */
        ContactListModel.prototype.reinvite = function (reinviteID) {
            return this.data.reinvite(reinviteID);
        };

        /**
         * 停用一个或多个实体
         * TODO: 如果存在复用可能，则将其迁移至BaseModel中
         *
         * @param {Array.<string>} idx id集合
         * @return {FakeXHR}
         */
        ContactListModel.prototype.stop = 
            u.partial(ListModel.prototype.updateStatus, 'stop', 2);

        var ajax = require('er/ajax');
        u.each(
            config.requests,
            function (config) {
                ajax.register(ContactListModel, config.name, config);
            }
        );

        return ContactListModel;
    }
);