/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 创意表单Action
 * @author liyidong(undefined)
 * @date $DATE$
 */
define(
    function (require) {
        var FormAction = require('common/FormAction');
        var util = require('er/util');

        require('./XMLExtField');

        /**
         * 创意表单
         *
         * @constructor
         * @extends common/FormAction
         */
        function TextForm() {
            FormAction.apply(this, arguments);
        }

        util.inherits(TextForm, FormAction);

        /**
         * 当前Action的分组名称
         *
         * @type {string}
         * @override
         */
        // TODO: 必须设置这个值，选择`slot | order | setting | report`
        TextForm.prototype.group = 'order';

        /**
         * 当前Action负责的实体的描述名称
         *
         * @type {string}
         * @override
         */
        TextForm.prototype.entityDescription = '文字创意';

        /**
         * 视图类型
         *
         * @type {function}
         * @override
         */
        TextForm.prototype.viewType = require('./TextFormView');

        /**
         * 数据模型类型
         *
         * @type {function}
         * @override
         */
        TextForm.prototype.modelType = require('./TextFormModel');

        return TextForm;
    }
);