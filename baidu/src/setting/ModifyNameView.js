/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 修改帐户名称表单的视图类
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var FormView = require('common/FormView');
        var util = require('er/util');

        require('tpl!./tpl/modifyName.tpl.html');

        /**
         * setting表单视图类
         *
         * @constructor
         * @extends common/FormView
         */
        function ModifyNameView() {
            FormView.apply(this, arguments);
        }

        util.inherits(ModifyNameView, FormView);

        /** 
         * 使用的模板名称
         *
         * @type {string}
         */
        ModifyNameView.prototype.template = 'modifyName';
        
        return ModifyNameView;
    }
);