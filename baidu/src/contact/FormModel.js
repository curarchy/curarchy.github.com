/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 联系人表单数据模型类
 * @author liyidong(undefined)
 * @date $DATE$
 */
define(
    function (require) {
        var FormModel = require('common/FormModel');
        var Data = require('./Data');
        var CompanyData = require('company/Data');
        var util = require('er/util');
        var config = require('./config');
        var u = require('underscore');
        var contactStatus = require('./enum').Status;
        var datasource = require('er/datasource');

        function ContactFormModel() {
            FormModel.apply(this, arguments);
            this.data = new Data();
            this.companyData = new CompanyData();
        }

        util.inherits(ContactFormModel, FormModel);

        /**
         * 数据源配置
         *
         * @type {Object}
         * @override
         */
        ContactFormModel.prototype.datasource = {
            companies: function (model) {
                return model.loadCompanies();
            },
            crumbPath: function (model) {
                return [
                    { text: '所有联系人', href:'#/contact/list' },
                    { text: model.get('title') }
                ];
            },
            rule: {
                retrieve: datasource.rule(
                    'defaultMaxLength',
                    'mailMaxLength',
                    'mailPattern',
                    'phonePattern',
                    'mobilePattern',
                    'descriptionMaxLength'
                ),
                dump: true
            },
            // 导航栏权限
            canSubManagerView: datasource.permission('CLB_SUBMANAGER_VIEW'),
            canCompanyView: datasource.permission('CLB_COMPANY_VIEW'),
            canContactView: datasource.permission('CLB_CONTACTOR_VIEW'),
            canChannelView: datasource.permission('CLB_CHANNEL_VIEW')
        };

        /**
         * 对数据源进行预处理
         */
        ContactFormModel.prototype.prepare = function () {
            // 如果有loginName字段，并且不为'-'，则有显示相应控件的权限
            var loginName = this.get('loginName');
            this.set('hasLoginName', loginName && loginName !== '-');

            // 根据status状态字段属性，来决定是否能够编辑邮件
            var status = this.get('status');
            if (status === contactStatus.UNINVITE
                || status === contactStatus.INACTIVE
                || status === contactStatus.EXPIRED) {
                this.set('canEditEmail', true);
            }

            // 新建时，所属公司控件默认选中默认公司
            var userInfo = require('common/global/user');
            var defaultCompany = userInfo.getDefaultCompany();
            if (this.get('formType') === 'create') {
                this.set('companyId', parseInt(defaultCompany.value, 10));
                this.set('companyName', defaultCompany.text);
            }

            if (this.get('formType') === 'update') {
                var entityCompanyId = this.get('companyId');
                var entityCompanyName = this.get('companyName');
                var hint = 
                    u.where(this.get('companies'), { id: entityCompanyId });
                if (hint.length === 0) {
                    var companies = this.get('companies');
                    companies = u.union(
                        { id: entityCompanyId, name: entityCompanyName }, 
                        companies
                    );
                    this.set('companies', companies);
                }
            }
        };

        /**
         * 获取公司列表
         *
         * @return {er/Promise}
         */
        ContactFormModel.prototype.loadCompanies = function () {
            return this.companyData.list({ status: 1 })
                .then(
                    function (response) {
                        var allCompanies = response.results || [];
                        return allCompanies;
                    }
                );
        };

        /**
         * 判断实体是否有变化
         *
         * @param {Object} entity 新的实体
         * @return {boolean}
         * @overide
         */
        ContactFormModel.prototype.isEntityChanged = function (entity) {
            // 如果是新建的话，要先建立一个空的original
            // 编辑时则以后端取回的数据为准
            var emptyEntity = {
                id: undefined,
                companyId: parseInt(this.get('companyId'), 10),
                name: '',
                mail: '',
                position: '',
                fax: '',
                mobile: '',
                phone: '',
                address: '',
                description: '',
                inviteFlag: 0,
                status: undefined
            };
            var original = this.get('formType') === 'create'
                ? emptyEntity
                : u.clone(this.get('entity'));

            // 补上`id`、`loginName`、`status`和`mail`
            // 所有original字段的操作之前要加判断，下同
            if (original) {
                entity.id = original.id;
                entity.status = original.status;
            }
            if (original.hasOwnProperty('loginName')) {
                entity.loginName = original.loginName;
            }
            if (!entity.hasOwnProperty('mail')) {
                entity.mail = original.mail;
            }

            // 提交数据没有companyName，original里的删掉
            if (original.hasOwnProperty('companyName')) {
                delete original.companyName;
            }

            // 如果展开了修改mail选项，则给original补上mailConfirm字段
            // 取original的mail的值
            if (original && entity.hasOwnProperty('mailConfirm')) {
                original.mailConfirm = original.mail;
            }

            return !u.isEqual(entity, original);
        };

        var ajax = require('er/ajax');
        u.each(
            config.requests,
            function (config) {
                ajax.register(ContactFormModel, config.name, config);
            }
        );

        return ContactFormModel;
    }
);