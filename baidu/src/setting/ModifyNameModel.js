/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 修改帐户名称表单的数据模型类
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var FormModel = require('common/FormModel');
        var Data = require('./Data');
        var util = require('er/util');
        var config = require('./config');
        var u = require('underscore');

        function ModifyNameModel() {
            FormModel.apply(this, arguments);
            this.data = new Data();
        }

        util.inherits(ModifyNameModel, FormModel);

        var user = require('common/global/user');
        var datasource = require('er/datasource');

        /**
         * 数据源配置
         *
         * @type {Object}
         * @override
         */
        ModifyNameModel.prototype.datasource = {
            // 用来冲掉基类的默认`entity`配置
            entity: undefined,
            id: datasource.constant(user.mainUserId)
        };

        /**
         * 判断实体是否有变化
         *
         * @param {Object} entity 新的实体
         * @return {boolean}
         */
        ModifyNameModel.prototype.isEntityChanged = function (entity) {
            // 有填过东西就是有变化了
            return !!entity.accountName;
        };

        /**
         * 保存实体
         *
         * @param {Object} entity 帐户名称实体
         * @param {string} entity.accountName 帐户名称
         * @return {Promise}
         * @override
         */
        ModifyNameModel.prototype.save = function (entity) {
            var id = this.get('id');
            var updating = this.data.modifyAccountName(id, entity.accountName);
            return updating.then(
                function (data) {
                    user.accountName = data.accountName;
                    return data;
                }
            );
        };

        var ajax = require('er/ajax');
        u.each(
            config.requests,
            function (config) {
                ajax.register(ModifyNameModel, config.name, config);
            }
        );

        return ModifyNameModel;
    }
);
