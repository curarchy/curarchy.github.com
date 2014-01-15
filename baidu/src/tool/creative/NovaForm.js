/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 网盟创意表单Action
 * @author liyidong(srhb18@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var FormAction = require('common/FormAction');
        var util = require('er/util');

        /**
         * 创意表单
         *
         * @constructor
         * @extends common/FormAction
         */
        function NovaForm() {
            FormAction.apply(this, arguments);
        }

        util.inherits(NovaForm, FormAction);

        /**
         * 当前Action的分组名称
         *
         * @type {string}
         * @override
         */
        // TODO: 必须设置这个值，选择`slot | order | setting | report`
        NovaForm.prototype.group = 'order';

        /**
         * 当前Action负责的实体的描述名称
         *
         * @type {string}
         * @override
         */
        NovaForm.prototype.entityDescription = '网盟创意';

        /**
         * 视图类型
         *
         * @type {function}
         * @override
         */
        NovaForm.prototype.viewType = require('./NovaFormView');

        /**
         * 数据模型类型
         *
         * @type {function}
         * @override
         */
        NovaForm.prototype.modelType = require('./NovaFormModel');

        return NovaForm;
    }
);