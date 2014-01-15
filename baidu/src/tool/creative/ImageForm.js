/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 创意表单Action
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var FormAction = require('common/FormAction');
        var util = require('er/util');

        require('./FileField');
        require('./XMLExtField');

        /**
         * 创意表单
         *
         * @constructor
         * @extends common/FormAction
         */
        function ImageForm() {
            FormAction.apply(this, arguments);
        }

        util.inherits(ImageForm, FormAction);

        /**
         * 当前Action的分组名称
         *
         * @type {string}
         * @override
         */
        ImageForm.prototype.group = 'order';

        /**
         * 当前Action负责的实体的描述名称
         *
         * @type {string}
         * @override
         */
        ImageForm.prototype.entityDescription = '图片创意';

        /**
         * 视图类型
         *
         * @type {function}
         * @override
         */
        ImageForm.prototype.viewType = require('./ImageFormView');

        /**
         * 数据模型类型
         *
         * @type {function}
         * @override
         */
        ImageForm.prototype.modelType = require('./ImageFormModel');

        return ImageForm;
    }
);