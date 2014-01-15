/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 批量频道表单Action
 * @author lixiang(lixiang05@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var util = require('er/util');
        var u = require('underscore');
        var BaseAction = require('common/BaseAction');

        /**
         * 批量频道表单
         *
         * @constructor
         * @extends common/FormAction
         */
        function BatchChannelForm() {
            BaseAction.apply(this, arguments);
        }

        util.inherits(BatchChannelForm, BaseAction);

        /**
         * 当前Action的分组名称
         *
         * @type {string}
         * @override
         */
        BatchChannelForm.prototype.group = 'setting';

        /**
         * 视图类型
         *
         * @type {function}
         * @override
         */
        BatchChannelForm.prototype.viewType = require('./BatchFormView');

        /**
         * 数据模型类型
         *
         * @type {function}
         * @override
         */
        BatchChannelForm.prototype.modelType = require('./BatchFormModel');

        function cancelEdit() {
            this.redirect('/channel/create');
        }

        /**
         * 处理提交数据成功后的返回
         *
         * @param {Object} entity 提交成功后返回的实体
         */
        function handleSubmitResult() {
            // 默认成功后跳转回Form页
            var toast = '您批量创建的频道已经成功保存';
            var session = require('common/global/session');
            session.once('toast', toast);
            var listPath = '/channel/create';
            this.redirect(listPath);
        }

        BatchChannelForm.prototype.initBehavior = function () {
            BaseAction.prototype.initBehavior.apply(this, arguments);
            this.view.on('complete', u.bind(handleSubmitResult, this));
            this.view.on('cancel', u.bind(cancelEdit, this));
        };

        return BatchChannelForm;
    }
);