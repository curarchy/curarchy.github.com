/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 列表Action基类
 * @author zhanglili(otakustay@gmail.com), wangyaqiong(catkin2009@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var util = require('er/util');
        var u = require('underscore');
        var BaseAction = require('common/BaseAction');
        var URL = require('er/URL');

        /**
         * 频道列表
         *
         * @param {string=} entityName 负责的实体名称
         * @constructor
         * @extends common/BaseAction
         */
        function ListAction(entityName) {
            BaseAction.apply(this, arguments);
            this.entityName = entityName;
        }

        util.inherits(ListAction, BaseAction);

        ListAction.prototype.modelType = './ListModel';

        /**
         * 创建数据模型对象
         *
         * @param {Object=} args 模型的初始化数据
         * @return {common/ListModel}
         * @override
         */
        ListAction.prototype.createModel = function (args) {
            // 把默认参数补回去，不然像表格的`orderBy`字段没值表格就不能正确显示
            u.defaults(args, this.defaultArgs);

            return BaseAction.prototype.createModel.apply(this, arguments);
        };

        /**
         * 默认查询参数
         * 
         * 如果某个参数与这里的值相同，则不会加到URL中
         * 
         * 发给后端时，会自动加上这里的参数
         *
         * @type {Object}
         */
        ListAction.prototype.defaultArgs = {};

        /**
         * 进行查询
         *
         * @param {Object} args 查询参数
         */
        ListAction.prototype.performSearch = function (args) {
            // 去除默认参数值
            var defaultArgs = u.extend(
                {}, 
                this.defaultArgs
            );
            args = u.purify(args, defaultArgs);

            var event = this.fire('search', { args: args });
            if (!event.isDefaultPrevented()) {
                this.redirectForSearch(args);
            }
        };

        /**
         * 进行查询引起的重定向操作
         *
         * @param {Object} args 查询参数
         */
        ListAction.prototype.redirectForSearch = function (args) {
            var path = this.model.get('url').getPath();
            var url = URL.withQuery(path, args);
            this.redirect(url, { force: true });
        };

        /**
         * 查询的事件处理函数
         *
         * @param {this} {common/ListAction} Action实例
         * @param {Object} e 事件对象
         */
        function search(e) {
            this.performSearch(e.args);
        }

        /**
         * 带上查询参数重新加载第1页
         *
         * @param {this} {common/ListAction} Action实例
         */
        function reloadWithSearchArgs() {
            var args = this.view.getSearchArgs();
            this.performSearch(args);
        }

        /**
         * 更新每页显示条数
         *
         * @param {Object} 事件对象
         */
        function updatePageSize(e) {
            // 先请求后端更新每页显示条数，然后直接刷新当前页
            this.model.updatePageSize(e.pageSize)
                .then(u.bind(reloadWithSearchArgs, this));

            // TODO: 有空的话搞成silent刷新玩玩
        }

        /**
         * 批量修改事件处理
         *
         * @param {Object} 事件对象
         */
        function batchModifyStatus(e) {
            var status = e.status;
            var statusName = e.statusName;
            var items = this.view.getSelectedItems();
            var ids = u.pluck(items, 'id');
            var context = {
                items: items,
                ids: ids,
                status: status,
                statusName: e.statusName,
                command: e.command
            };

            if (this.requireAdviceFor(status, statusName)) {
                // 需要后端提示消息的，再额外加入用户确认的过程
                var action = e.statusName;
                action = action.charAt(0).toUpperCase() + action.substring(1);
                var adviceMethod = 'get' + action + 'Advice';

                this.model[adviceMethod](ids)
                    .then(u.bind(waitConfirmForAdvice, this, context))
                    .then(u.delegate(updateEntities, this, context));
            }
            else {
                updateEntities.call(this, context);
            }
        }

        function updateEntities(context) {
            this.model[context.statusName](context.ids)
                .then(
                    u.bind(updateListStatus, this, context),
                    u.bind(this.notifyBatchFail, this, context)
                );
        }

        /**
         * 根据批量删除前确认
         *
         * @param {Object} context 批量操作的上下文对象
         */
        function waitConfirmForAdvice(context, advice) {
            var options = {
                title: context.command + this.getEntityDescription(),
                content: advice.message
            };
            return this.view.waitConfirm(options);
        }

        /**
         * 通知批量操作失败
         *
         * @param {Object} context 批量操作的上下文对象
         */
        ListAction.prototype.notifyBatchFail = function (context) {
            var entityDescription = this.getEntityDescription();
            this.view.alert(
                '无法' + context.command + '部分或全部' + entityDescription,
                context.command + entityDescription
            );
        };

        /**
         * 根据批量删除、启用的状态更新当前Action的table的状态
         *
         * @param {Object} context 相关信息
         * @param {number} context.status 更新的状态的值
         * @param {Object[]} context.items 需要更新的数据
         * @param {string[]} context.ids 需要更新的数据的id集合
         * @param {string} context.command 更新命令
         */
        function updateListStatus(context) {
            var toastMessage = context.command + '成功';
            this.view.showToast(toastMessage);

            this.reload();
        }

        /**
         * 检查指定批量操作是否需要后端提示消息
         *
         * @param {number} status 目标状态
         * @param {string} action 操作类型
         * @return {boolean}
         */
        ListAction.prototype.requireAdviceFor = function (status, action) {
            return action === 'remove';
        };

        /**
         * 初始化交互行为
         *
         * @override
         */
        ListAction.prototype.initBehavior = function () {
            BaseAction.prototype.initBehavior.apply(this, arguments);
            this.view.on('search', u.bind(search, this));
            this.view.on('pagesizechange', u.bind(updatePageSize, this));
            this.view.on('batchmodify', u.bind(batchModifyStatus, this));
        };

        /**
         * 根据布局变化重新调整自身布局
         */
        ListAction.prototype.adjustLayout = function () {
            this.view.adjustLayout();
        };
        
        return ListAction;
    }
);
