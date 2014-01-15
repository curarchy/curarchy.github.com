/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 管理员列表Action
 * @author liyidong(undefined)
 * @date $DATE$
 */
define(
    function (require) {
        var util = require('er/util');
        var ListAction = require('common/ListAction');
        var u = require('underscore');

        /**
         * 频道列表
         *
         * @constructor
         * @extends common/ListAction
         */
        function ManagerList() {
            ListAction.apply(this, arguments);
        }
        
        util.inherits(ManagerList, ListAction);

        /**
         * 当前Action的分组名称
         *
         * @type {string}
         * @override
         */
        ManagerList.prototype.group = 'setting';

        /**
         * 当前Action负责的实体的描述名称
         *
         * @type {string}
         * @override
         */
        ManagerList.prototype.entityDescription = '管理员';
        
        /**
         * 视图类型
         *
         * @type {function}
         * @override
         */
        ManagerList.prototype.viewType = require('./ListView');

        /**
         * 数据模型类型
         *
         * @type {function}
         * @override
         */
        ManagerList.prototype.modelType = require('./ListModel');

        /**
         * 默认查询参数
         *
         * @param {Object}
         * @override
         */
        ManagerList.prototype.defaultArgs = {
            orderBy: 'subUserInfoId',
            order: 'desc',
            status: '1,2,3'
        };

        /**
         * 处理重新邀请成功后的返回
         *
         * @param {Object} entity 提交成功后返回的实体
         */
        function handleSubmitResult (entity) {
            // 默认成功后跳转回列表页
            var toastMessage = '已成功向 '
                + '<strong>'
                + entity.name
                + '['
                + entity.mail
                + ']'
                + '</strong>'
                + ' 发送邀请';
            this.view.showToast(toastMessage);
        }

        /**
         * 处理重新邀请时发生的错误
         *
         * @param {FakeXHR} xhr `XMLHttpRequest`对象
         * @return {boolean} 返回`true`表示错误已经处理完毕
         */
        function handleSubmitError (action, xhr) {
            if (xhr.status === 409) {
                var errors = util.parseJSON(xhr.responseText).fields;
                // 这是一个尝试，如果确认后端只返回一条error，就改掉
                // TODO: 将该异步执行绑定在一个变量数组中，并在leave时清除掉
                for (var i = 0; i < errors.length; i++) {
                    setTimeout(
                        u.bind(
                            action.view.showToast,
                            this,
                            errors[i].message,
                            { status: 'error' }
                        ),
                        2000 * i
                    );
                }
                return true;
            }
            return false;
        }

        /**
         * 重新邀请处理错误
         *
         * @param {FakeXHR} xhr `XMLHttpRequest`对象
         */
        function handleError (xhr) {
            var handled = handleSubmitError(this, xhr);
            if (!handled) {
                require('er/events').notiryError(xhr.responseText);
            }
        }
        /**
         * 重新邀请
         *
         * @param {Object} 事件对象
         */
        function reinvite (e) {
            this.model.reinvite(e.id)
                .then(
                    u.bind(handleSubmitResult, this),
                    u.bind(handleError, this)
                );
        }

        /**
         * 初始化交互行为
         *
         * @override
         */
        ManagerList.prototype.initBehavior = function () {
            ListAction.prototype.initBehavior.apply(this, arguments);
            this.view.on('reinvite', u.bind(reinvite, this)); 
        };


        return ManagerList;
    }
);
