/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 公司表单视图类
 * @author lisijin(ibadplum@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var FormView = require('common/FormView');
        var util = require('er/util');

        require('tpl!./tpl/common.tpl.html');
        require('tpl!./tpl/form.tpl.html');

        /**
         * 公司表单视图类
         *
         * @constructor
         * @extends common/FormView
         */
        function CompanyFormView() {
            FormView.apply(this, arguments);
        }

        util.inherits(CompanyFormView, FormView);

        /** 
         * 使用的模板名称
         *
         * @type {string}
         */
        CompanyFormView.prototype.template = 'companyForm';

        /**
         * 从表单中获取实体数据
         *
         * @return {Object}
         */
        CompanyFormView.prototype.getEntity = function () {
            var entity = FormView.prototype.getEntity.apply(this, arguments);
            return entity;
        };
        return CompanyFormView;
    }
);