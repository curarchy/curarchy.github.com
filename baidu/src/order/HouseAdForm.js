/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 订单表单Action
 * @author undefined(undefined)
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
        function HouseAdForm() {
            FormAction.apply(this, arguments);
        }

        util.inherits(HouseAdForm, FormAction);

        /**
         * 当前Action的分组名称
         *
         * @type {string}
         * @override
         */
        // TODO: 必须设置这个值，选择`slot | order | setting | report`
        HouseAdForm.prototype.group = 'order';

        /**
         * 当前Action负责的实体的描述名称
         *
         * @type {string}
         * @override
         */
        HouseAdForm.prototype.entityDescription = config.description;

        /**
         * 视图类型
         *
         * @type {function}
         * @override
         */
        HouseAdForm.prototype.viewType = require('./HouseAdFormView');

        /**
         * 数据模型类型
         *
         * @type {function}
         * @override
         */
        HouseAdForm.prototype.modelType = require('./HouseAdFormModel');

        /**
         * 数据提交后的提示信息
         *
         * @type {string}
         * @override
         */
        HouseAdForm.prototype.toastMessage = 
            '您创建的' + config.description + '[<em>${:name}</em>]已经成功保存';

        return HouseAdForm;
    }
);