/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 表单Action基类
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var util = require('er/util');
        var u = require('underscore');
        var BaseAction = require('common/BaseAction');
        var Deferred = require('er/Deferred');

        /**
         * 表单Action基类
         *
         * @param {string=} entityName 负责的实体名称
         * @constructor
         * @extends common/BaseAction
         */
        function FormAction(entityName) {
            this.entityName = entityName;
            BaseAction.apply(this, arguments);
        }

        util.inherits(FormAction, BaseAction);

        FormAction.prototype.modelType = require('./FormModel');

        FormAction.prototype.toastMessage = '';

        FormAction.prototype.getToastMessage = function (entity) {
            var message = this.toastMessage;
            if (message === false || message == null) {
                return '';
            }

            if (!message) {
                var actionType = this.context.formType === 'update'
                    ? '修改'
                    : '创建';
                message = '您' + actionType + '的'
                    + this.getEntityDescription()
                    + '[<strong>${:name}</strong>]已经成功保存';
            }
            
            return u.template(message, entity || {});
        };

        /**
         * 处理提交数据时发生的错误
         *
         * @param {FakeXHR} xhr `XMLHttpRequest`对象
         * @return {boolean} 返回`true`表示错误已经处理完毕
         */
        FormAction.prototype.handleSubmitError = function (xhr) {
            // 默认只处理409的验证失败，其它错误如果子类能处理则重写这个函数
            if (xhr.status === 409) {
                var errors = util.parseJSON(xhr.responseText);
                this.view.notifyErrors(errors);
                return true;
            }
            return false;
        };

        /**
         * 处理提交数据成功后的返回
         *
         * @param {Object} entity 提交成功后返回的实体
         */
        FormAction.prototype.handleSubmitResult = function (entity) {
            // 默认成功后跳转回列表页
            var toast = this.getToastMessage(entity);
            if (toast) {
                this.view.showToast(toast);
            }
            if (this.context.isChildAction) {
                this.fire('entitysave', { entity: entity });
                this.fire('handlefinish');
            }
            else {
                this.redirectAfterSubmit(entity);
            }
        };

        /**
         * 提交后的跳转
         */
        FormAction.prototype.redirectAfterSubmit = function (entity) {
            var targetURL =
                (this.context && this.context.referrer)
                || '/' + this.getEntityName() + '/list';
            this.redirect(targetURL);
        };

        /**
         * 处理错误
         *
         * @param {FakeXHR} xhr `XMLHttpRequest`对象
         */
        function handleError(xhr) {
            var handled = this.handleSubmitError(xhr);
            if (!handled) {
                require('er/events').notifyError(xhr.responseText);
            }
        }

        /**
         * 处理本地的验证错误
         *
         * @param {Object[]} errors 本地验证得到的错误集合，
         * 每个错误中有`field`和`message`两个字段
         * @return {Mixed} 处理完后的返回值
         */
        FormAction.prototype.handleLocalValidationErrors = function (errors) {
            var wrappedError = {
                fields: errors
            };
            this.view.notifyErrors(wrappedError);

            return wrappedError;
        };

        /**
         * 提交实体（新建或更新）
         *
         * @param {Object} entity 实体数据
         * @param {er/Promise}
         */
        FormAction.prototype.submitEntity = function (entity) {
            entity = this.model.fillEntity(entity);
            
            var localValidationResult = this.model.validateEntity(entity);
            if (typeof localValidationResult === 'object') {
                var handleResult =
                    this.handleLocalValidationErrors(localValidationResult);
                return Deferred.rejected(handleResult);
            }

            if (this.context.formType === 'update') {
                entity.id = this.model.get('id');
            }

            var method = this.context.formType === 'update' ? 'update' : 'save';
            return this.model[method](entity)
                .then(
                    u.bind(this.handleSubmitResult, this),
                    u.bind(handleError, this)
                );
        };

        FormAction.prototype.cancelConfirmTitle = '确认取消编辑';

        FormAction.prototype.getCancelConfirmTitle = function () {
            return this.cancelConfirmTitle;
        };

        FormAction.prototype.cancelConfirmMessage =
            '取消编辑将不保留已经填写的数据，确定继续吗？';

        FormAction.prototype.getCancelConfirmMessage = function () {
            return this.cancelConfirmMessage;
        };

        FormAction.prototype.cancelEdit = function () {
            var entity = this.view.getEntity();
            entity = this.model.fillEntity(entity);

            var redirectURL = this.context.referrer
                ? this.context.referrer + ''
                : '/' + this.getEntityName() + '/list';
            if (this.model.isEntityChanged(entity)) {
                var options = {
                    title: this.getCancelConfirmTitle(),
                    content: this.getCancelConfirmMessage()
                };
                this.view.waitConfirm(options)
                    .then(u.bind(this.redirectAfterCancel, this, redirectURL));
            }
            else {
                this.redirectAfterCancel(redirectURL);
            }
        };

        FormAction.prototype.redirectAfterCancel = function (redirectURL) {
            if (this.context.isChildAction) {
                this.fire('submitcancel');
                this.fire('handlefinish');
            }
            else {
                // 如果不需要提示用户保存信息，则直接返回前一页
                this.redirect(redirectURL);
            }
        };

        function submit() {
            var entity = this.view.getEntity();
            this.view.disableSubmit();

            require('er/Deferred').when(this.submitEntity(entity))
                .ensure(u.bind(this.view.enableSubmit, this.view));
        }

        /**
         * 初始化交互行为
         *
         * @override
         */
        FormAction.prototype.initBehavior = function () {
            BaseAction.prototype.initBehavior.apply(this, arguments);
            this.view.on('submit', u.bind(submit, this));
            this.view.on('cancel', u.bind(this.cancelEdit, this));
        };
        
        return FormAction;
    }
);
