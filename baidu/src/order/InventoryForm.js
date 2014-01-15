/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 订单表单Action
 * @author liyidong(srhb18@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var FormAction = require('common/FormAction');
        var util = require('er/util');
        var config = require('./config');

        /**
         * 订单表单
         *
         * @constructor
         * @extends common/FormAction
         */
        function InventoryForm() {
            FormAction.apply(this, arguments);
        }

        util.inherits(InventoryForm, FormAction);

        /**
         * 当前Action的分组名称
         *
         * @type {string}
         * @override
         */
        // TODO: 必须设置这个值，选择`slot | order | setting | report`
        InventoryForm.prototype.group = 'order';

        /**
         * 当前Action负责的实体的描述名称
         *
         * @type {string}
         * @override
         */
        InventoryForm.prototype.entityDescription = config.description;

        /**
         * 视图类型
         *
         * @type {function}
         * @override
         */
        InventoryForm.prototype.viewType = require('./InventoryFormView');

        /**
         * 数据模型类型
         *
         * @type {function}
         * @override
         */
        InventoryForm.prototype.modelType = require('./InventoryFormModel');

        /**
         * 数据提交后的提示信息
         *
         * @type {string}
         * @override
         */
        InventoryForm.prototype.toastMessage = 
            '您创建的' + config.description + '[<em>${:name}</em>]已经成功保存';

        return InventoryForm;
    }
);