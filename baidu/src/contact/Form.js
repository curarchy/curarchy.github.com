/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 联系人表单Action
 * @author liyidong(undefined)
 * @date $DATE$
 */
define(
    function (require) {
        var FormAction = require('common/FormAction');
        var util = require('er/util');
        var config = require('./config');
        var u = require('underscore');

        // 把需要的公司表单全依赖上，免得加载太慢
        require('../company/Form');
        /**
         * 频道表单
         *
         * @constructor
         * @extends common/FormAction
         */
        function ContactForm() {
            FormAction.apply(this, arguments);
        }

        util.inherits(ContactForm, FormAction);

        /**
         * 当前Action的分组名称
         *
         * @type {string}
         * @override
         */
        ContactForm.prototype.group = 'setting';

        /**
         * 当前Action负责的实体的描述名称
         *
         * @type {string}
         * @override
         */
        ContactForm.prototype.entityDescription = config.description;

        /**
         * 视图类型
         *
         * @type {function}
         * @override
         */
        ContactForm.prototype.viewType = require('./FormView');

        /**
         * 数据模型类型
         *
         * @type {function}
         * @override
         */
        ContactForm.prototype.modelType = require('./FormModel');

        /** 
         * 刷新公司数据事件的句柄
         */
        function reloadCompany(args) {
            var model = this.model;
            var view = this.view;
            var newCompany = args.company;
            var companies = model.get('companies');

            // 按照默认公司在最前，新插入位于默认公司后，再老数据的顺序构建
            // u.union自带clone对象的功能，而用其它方法如push，splice方法
            // 因为引用不会变，给View的时候就没有更新效果，要再clone一把
            companies = u.union(companies.shift(), newCompany, companies);
            model.set('companies', companies);
            view.refreshCompany(newCompany);
        }

        /**
         * 初始化交互行为
         *
         * @override
         */
        ContactForm.prototype.initBehavior = function () {
            FormAction.prototype.initBehavior.apply(this, arguments);
            this.view.on('reloadCompany', u.bind(reloadCompany, this));
        };
        
        return ContactForm;
    }
);