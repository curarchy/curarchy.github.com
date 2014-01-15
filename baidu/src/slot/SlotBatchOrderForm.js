/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 批量修改显示顺序Action
 * @author wangyaqiong(catkin2009@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var FormAction = require('common/FormAction');
        var util = require('er/util');
        var config = require('./config');
        var Deferred = require('er/Deferred');

        /**
         * 频道表单
         *
         * @constructor
         * @extends common/FormAction
         */
        function SlotBatchOrderForm() {
            FormAction.apply(this, arguments);
        }

        util.inherits(SlotBatchOrderForm, FormAction);

        /**
         * 当前Action的分组名称
         *
         * @type {string}
         * @override
         */
        SlotBatchOrderForm.prototype.group = 'slot';

        /**
         * 当前Action负责的实体的描述名称
         *
         * @type {string}
         * @override
         */
        SlotBatchOrderForm.prototype.entityDescription = config.description;

        /**
         * 视图类型
         *
         * @type {function}
         * @override
         */
        SlotBatchOrderForm.prototype.viewType = 
            require('./SlotBatchOrderFormView');

        /**
         * 数据模型类型
         *
         * @type {function}
         * @override
         */
        SlotBatchOrderForm.prototype.modelType = 
            require('./SlotBatchOrderFormModel');

        /**
         * 数据提交后的提示信息
         *
         * @type {string}
         * @override
         */
        SlotBatchOrderForm.prototype.toastMessage = '已成功更新广告位的显示顺序';

        
        /**
         * 提交实体（新建或更新）
         *
         * @param {Object} entity 实体数据
         * @param {er/Promise}
         */
        SlotBatchOrderForm.prototype.submitEntity = function (entity) {
            entity = this.model.fillEntity(entity);
            
            var localValidationResult = this.model.validateEntity(entity);
            if (typeof localValidationResult === 'object') {
                var handleResult = 
                    this.handleLocalValidationErrors(localValidationResult);
                return Deferred.rejected(handleResult);
            }
            else {
                if (this.context.isChildAction) {
                    this.fire('entitysave', {entity: entity});
                }
                return Deferred.resolved();
            }
        };
        return SlotBatchOrderForm;
    }
);