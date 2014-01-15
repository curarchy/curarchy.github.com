/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 修改密码表单的数据模型类
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

        function ModifyPasswordModel() {
            FormModel.apply(this, arguments);
            this.data = new Data();
        }

        util.inherits(ModifyPasswordModel, FormModel);

        var user = require('common/global/user');
        var datasource = require('er/datasource');

        /**
         * 数据源配置
         *
         * @type {Object}
         * @override
         */
        ModifyPasswordModel.prototype.datasource = {
            // 用来冲掉基类的默认`entity`配置
            entity: undefined,
            // 虽然改的是二级帐号的密码，但传的是主帐号id，后端统计用，
            // 后端会直接改与当前登录用户的密码，其实和这个id没关系
            id: datasource.constant(user.id)
        };

        /**
         * 判断实体是否有变化
         *
         * @param {Object} entity 新的实体
         * @return {boolean}
         */
        ModifyPasswordModel.prototype.isEntityChanged = function (entity) {
            // 有填过东西就是有变化了
            return !!entity.password || !!entity.newPassword;
        };

        /**
         * 保存实体
         *
         * @param {Object} entity 新密码实体
         * @param {string} entity.password 原密码
         * @param {string} entity.newPassword 新的密码地址
         * @return {Promise}
         * @override
         */
        ModifyPasswordModel.prototype.save = function (entity) {
            var id = this.get('id');
            return this.data.modifyPassword(
                id, entity.password, entity.newPassword);
        };

        var ajax = require('er/ajax');
        u.each(
            config.requests,
            function (config) {
                ajax.register(ModifyPasswordModel, config.name, config);
            }
        );

        return ModifyPasswordModel;
    }
);