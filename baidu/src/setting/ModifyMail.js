/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 修改电子邮件表单Action
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
        function ModifyMail() {
            FormAction.apply(this, arguments);
        }

        util.inherits(ModifyMail, FormAction);

        /**
         * 当前Action的分组名称
         *
         * @type {string}
         * @override
         */
        ModifyMail.prototype.group = 'setting';

        /**
         * 当前Action负责的实体的描述名称
         *
         * @type {string}
         * @override
         */
        ModifyMail.prototype.entityDescription = config.description;

        /**
         * 视图类型
         *
         * @type {function}
         * @override
         */
        ModifyMail.prototype.viewType = require('./ModifyMailView');

        /**
         * 数据模型类型
         *
         * @type {function}
         * @override
         */
        ModifyMail.prototype.modelType = require('./ModifyMailModel');

        /**
         * 数据提交后的提示信息
         *
         * @type {string}
         * @override
         */
        ModifyMail.prototype.toastMessage = '已成功修改电子邮件';

        return ModifyMail;
    }
);