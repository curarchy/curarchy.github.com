/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 公司表单数据模型类
 * @author lisijin(ibadplum@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var FormModel = require('common/FormModel');
        var Data = require('./Data');
        var util = require('er/util');
        var config = require('./config');
        var u = require('underscore');

        function CompanyFormModel() {
            FormModel.apply(this, arguments);
            this.data = new Data();
        }

        util.inherits(CompanyFormModel, FormModel);
        var datasource = require('er/datasource');
        /**
         * 数据源配置
         *
         * @type {Object}
         * @override
         */
        CompanyFormModel.prototype.datasource = {
            crumbPath: function (model) {
                var fromType = model.get('formType') === 'create'
                    ? '新建' : '修改';
                return [
                    { text: '公司', href: '#/company/list' },
                    { text: fromType + model.get('title') }
                ];
            },
            companyType: function (model) {
                return model.get('title');
            },
            // 导航栏权限
            canSubManagerView: datasource.permission('CLB_SUBMANAGER_VIEW'),
            canCompanyView: datasource.permission('CLB_COMPANY_VIEW'),
            canContactView: datasource.permission('CLB_CONTACTOR_VIEW'),
            canChannelView: datasource.permission('CLB_CHANNEL_VIEW')
        };

        /**
         * 补充一些视图无法提供的属性
         *
         * @param {Object} entity 实体数据
         * @return {Object} 补充完整的实体数据
         */
        CompanyFormModel.prototype.fillEntity = function (entity) {
            entity.type = this.get('type');
            return entity;
        };

        /**
         * 判断实体是否有变化
         *
         * @param {Object} entity 新的实体
         * @return {boolean}
         */
        CompanyFormModel.prototype.isEntityChanged = function (entity) {
            var emptyEntity = {
                id: undefined,
                name: '',
                flag: undefined,
                type: entity.type,
                description: '',
                status: undefined
            };
            var original = this.get('formType') === 'create'
                ? emptyEntity : u.clone(this.get('entity'));
            entity.id = original.id;
            entity.status = original.status;
            entity.flag = original.flag;
            return !u.isEqual(original, entity);
        };

        var ajax = require('er/ajax');
        u.each(
            config.requests,
            function (config) {
                ajax.register(CompanyFormModel, config.name, config);
            }
        );

        return CompanyFormModel;
    }
);