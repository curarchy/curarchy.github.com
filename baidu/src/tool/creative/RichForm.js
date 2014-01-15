/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 富媒体创意表单Action
 * @author lixiang(lixiang05@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var FormAction = require('common/FormAction');
        var util = require('er/util');

        /**
         * 富媒体创意表单
         *
         * @constructor
         * @extends common/FormAction
         */
        function RichForm() {
            FormAction.apply(this, arguments);
        }

        util.inherits(RichForm, FormAction);

        /**
         * 当前Action负责的实体的描述名称
         *
         * @type {string}
         * @override
         */
        RichForm.prototype.entityDescription = '富媒体创意';

        /**
         * 视图类型
         *
         * @type {function}
         * @override
         */
        RichForm.prototype.viewType = require('./RichFormView');

        /**
         * 数据模型类型
         *
         * @type {function}
         * @override
         */
        RichForm.prototype.modelType = require('./RichFormModel');

        return RichForm;
    }
);