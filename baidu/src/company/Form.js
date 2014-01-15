/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 公司表单Action
 * @author lisijin(ibadplum@gmail.com)
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
        function CompanyForm() {
            FormAction.apply(this, arguments);
        }

        util.inherits(CompanyForm, FormAction);

        /**
         * 当前Action的分组名称
         *
         * @type {string}
         * @override
         */
        CompanyForm.prototype.group = 'setting';

        var companyTypeMapping = [
            '广告客户',
            '代理机构'
        ];

        /**
         * 当前Action负责的实体的描述名称
         *
         * @type {string}
         * @override
         */
        CompanyForm.prototype.entityDescription = config.description;

        /**
         * 获取实体的简介名称
         *
         * @return {string}
         */
        CompanyForm.prototype.getEntityDescription = function () {
            return companyTypeMapping[this.context.type] || '';
        };
        /**
         * 视图类型
         *
         * @type {function}
         * @override
         */
        CompanyForm.prototype.viewType = require('./FormView');

        /**
         * 数据模型类型
         *
         * @type {function}
         * @override
         */
        CompanyForm.prototype.modelType = require('./FormModel');

        return CompanyForm;
    }
);