/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 修改电子邮件表单的数据模型类
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

        function ModifyMailModel() {
            FormModel.apply(this, arguments);
            this.data = new Data();
        }

        util.inherits(ModifyMailModel, FormModel);

        var user = require('common/global/user');
        var datasource = require('er/datasource');

        /**
         * 数据源配置
         *
         * @type {Object}
         * @override
         */
        ModifyMailModel.prototype.datasource = {
            // 用来冲掉基类的默认`entity`配置
            entity: undefined,
            id: datasource.constant(user.id),
            oldEmail: datasource.constant(user.mail)
        };

        /**
         * 判断实体是否有变化
         *
         * @param {Object} entity 新的实体
         * @return {boolean}
         */
        ModifyMailModel.prototype.isEntityChanged = function (entity) {
            // 有填过东西就是有变化了
            return !!entity.newEmail;
        };

        /**
         * 保存实体
         *
         * @param {Object} entity 新电子邮件地址实体
         * @param {string} entity.newEmail 新的电子邮件地址
         * @return {Promise}
         * @override
         */
        ModifyMailModel.prototype.save = function (entity) {
            var id = this.get('id');
            return this.data.modifyMail(id, entity.newEmail);
        };

        var ajax = require('er/ajax');
        u.each(
            config.requests,
            function (config) {
                ajax.register(ModifyMailModel, config.name, config);
            }
        );

        return ModifyMailModel;
    }
);
