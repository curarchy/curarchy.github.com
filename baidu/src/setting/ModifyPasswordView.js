/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 修改密码表单的视图类
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var FormView = require('common/FormView');
        var util = require('er/util');

        require('tpl!./tpl/modifyPassword.tpl.html');

        /**
         * setting表单视图类
         *
         * @constructor
         * @extends common/FormView
         */
        function ModifyPasswordView() {
            FormView.apply(this, arguments);
        }

        util.inherits(ModifyPasswordView, FormView);

        /** 
         * 使用的模板名称
         *
         * @type {string}
         */
        ModifyPasswordView.prototype.template = 'modifyPassword';

        /**
         * 从表单中获取实体数据
         *
         * @return {Object}
         */
        ModifyPasswordView.prototype.getEntity = function () {
            var entity = FormView.prototype.getEntity.apply(this, arguments);

            delete entity.confirmNewPassword;

            return entity;
        };
        
        return ModifyPasswordView;
    }
);