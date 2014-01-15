/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 批量广告位表单Action
 * @author wangyaqiong(catkin2009@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var util = require('er/util');
        var u = require('underscore');
        var BaseAction = require('common/BaseAction');

        /**
         * 批量广告位表单
         *
         * @constructor
         * @extends common/FormAction
         */
        function BatchSlotForm() {
            BaseAction.apply(this, arguments);
        }

        util.inherits(BatchSlotForm, BaseAction);

        /**
         * 当前Action的分组名称
         *
         * @type {string}
         * @override
         */
        BatchSlotForm.prototype.group = 'slot';

        /**
         * 视图类型
         *
         * @type {function}
         * @override
         */
        BatchSlotForm.prototype.viewType = require('./BatchFormView');

        /**
         * 数据模型类型
         *
         * @type {function}
         * @override
         */
        BatchSlotForm.prototype.modelType = require('./BatchFormModel');

        function cancelEdit() {
            this.redirect('/slot/create');
        }

        /**
         * 处理提交数据成功后的返回
         *
         * @param {Object} entity 提交成功后返回的实体
         */
        function handleSubmitResult() {
            // 默认成功后跳转回Form页
            var toast = '您批量创建的广告位已经成功保存';
            var session = require('common/global/session');
            session.once('toast', toast);
            var listPath = '/slot/create';
            this.redirect(listPath);
        }

        BatchSlotForm.prototype.initBehavior = function () {
            BaseAction.prototype.initBehavior.apply(this, arguments);
            this.view.on('complete', u.bind(handleSubmitResult, this));
            this.view.on('cancel', u.bind(cancelEdit, this));
        };

        return BatchSlotForm;
    }
);