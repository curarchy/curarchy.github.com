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
        function BindUnion() {
            FormAction.apply(this, arguments);
        }

        util.inherits(BindUnion, FormAction);

        /**
         * 当前Action的分组名称
         *
         * @type {string}
         * @override
         */
        BindUnion.prototype.group = 'setting';

        /**
         * 当前Action负责的实体的描述名称
         *
         * @type {string}
         * @override
         */
        BindUnion.prototype.entityDescription = config.description;

        /**
         * 视图类型
         *
         * @type {function}
         * @override
         */
        BindUnion.prototype.viewType = require('./BindUnionView');

        /**
         * 数据模型类型
         *
         * @type {function}
         * @override
         */
        BindUnion.prototype.modelType = require('./BindUnionModel');

        /**
         * 数据提交后的提示信息
         *
         * @type {string}
         * @override
         */
        BindUnion.prototype.toastMessage = '已成功绑定联盟帐号';

        BindUnion.prototype.cancelEdit = function (e) {
            if (e.skipConfirm) {
                this.fire('submitcancel');
                return;
            }

            FormAction.prototype.cancelEdit.apply(this, arguments);
        };

        return BindUnion;
    }
);