/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 管理员列表数据模型类
 * @author liyidong(undefined)
 * @date $DATE$
 */
define(
    function (require) {
        var ListModel = require('common/ListModel');
        var Data = require('./Data');
        var util = require('er/util');
        var config = require('./config');
        var u = require('underscore');

        function ManagerListModel() {
            ListModel.apply(this, arguments);
            this.data = new Data();
        }
        
        util.inherits(ManagerListModel, ListModel);

        /**
         * 状态迁移表。
         *
         * @type {Object[]}
         * @override
         */
        ManagerListModel.prototype.statusTransitions = [
            { status: 0, accept: [1, 2, 3] },
            { status: 1, accept: [5] }
        ];

        // TODO: 如果没有状态属性，移除下面代码
        var statuses = [
            { text: '全部', value: 'all' }
        ];
        var roles = [
            { text: '所有角色', value: '' }
        ];
        var system = require('common/global/system');
        statuses = statuses.concat(system.subManagerInfoStatus);
        roles = roles.concat(system.subManagerInfoRole);

        var datasource = require('er/datasource');
        /**
         * 数据源配置
         *
         * @type {Object}
         * @override
         */
        ManagerListModel.prototype.datasource = {
            statuses: datasource.constant(statuses),
            roles: datasource.constant(roles),
            canModify: datasource.permission('CLB_SUBMANAGER_MODIFY'),
            canNew: datasource.permission('CLB_SUBMANAGER_NEW'),
            canInvite: datasource.permission('CLB_SUBMANAGER_INVITE'),
            canBatchModify: 
                datasource.permission('CLB_SUBMANAGER_STATUS_MODIFY'),
            // 导航栏权限
            canSubManagerView: datasource.permission('CLB_SUBMANAGER_VIEW'),
            canCompanyView: datasource.permission('CLB_COMPANY_VIEW'),
            canContactView: datasource.permission('CLB_CONTACTOR_VIEW'),
            canChannelView: datasource.permission('CLB_CHANNEL_VIEW')
        };

        /**
         * 对数据源进行预处理
         */
        ManagerListModel.prototype.prepare = function () {
            /**
             * 根据权限写入列表每行的操作行为权限
             *
             * @param {Object} item 当前行的数据
             */
            
            // 默认筛选项为“非删除” - 1,2,3
            var status = this.get('status');
            if (!status) {
                this.set('status', '1,2,3');
            }

            // 处理每一行内容的重新邀请显示
            u.each(
                this.get('results'), 
                function (item) {
                    if (this.get('canInvite')) {
                        if (item.status === 1 || item.status === 2) {
                            item.canReinvite = true;
                        }
                    }
                    var user = require('common/global/user');
                    var subUserId = user.subUserInfoId;
                    if (item.id !== subUserId) {
                        item.canModify = this.get('canModify');
                    }
                    else {
                        item.canModify = false;
                    }
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
        ManagerListModel.prototype.getQuery = function () {
            var query = ListModel.prototype.getQuery.apply(this, arguments);
            // TODO: 添加参数，如无额外参数删掉这个方法
            if (!query.status) {
                query.status = '1,2,3';
            }
            if (query.status === 'all') {
                query.status = '';
            }
            query.role = this.get('role');
            return query;
        };

        /**
         * 重发邀请
         *
         * @param {number} reinviteID 重发邀请对应的ID
         * @return {er/Promise}
         */
        ManagerListModel.prototype.reinvite = function (reinviteID) {
            return this.data.reinvite(reinviteID);
        };

        var ajax = require('er/ajax');
        u.each(
            config.requests,
            function (config) {
                ajax.register(ManagerListModel, config.name, config);
            }
        );

        return ManagerListModel;
    }
);
