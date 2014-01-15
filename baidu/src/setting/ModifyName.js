/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 修改帐户名称表单Action
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var FormAction = require('common/FormAction');
        var util = require('er/util');
        var config = require('./config');

        /**
         * 频道表单
         *
         * @constructor
         * @extends common/FormAction
         */
        function ModifyName() {
            FormAction.apply(this, arguments);
        }

        util.inherits(ModifyName, FormAction);

        /**
         * 当前Action的分组名称
         *
         * @type {string}
         * @override
         */
        ModifyName.prototype.group = 'setting';

        /**
         * 当前Action负责的实体的描述名称
         *
         * @type {string}
         * @override
         */
        ModifyName.prototype.entityDescription = config.description;

        /**
         * 视图类型
         *
         * @type {function}
         * @override
         */
        ModifyName.prototype.viewType = require('./ModifyNameView');

        /**
         * 数据模型类型
         *
         * @type {function}
         * @override
         */
        ModifyName.prototype.modelType = require('./ModifyNameModel');

        /**
         * 数据提交后的提示信息
         *
         * @type {string}
         * @override
         */
        ModifyName.prototype.toastMessage = '已成功修改帐户名称';

        return ModifyName;
    }
);