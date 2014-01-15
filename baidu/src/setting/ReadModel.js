/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 帐户设置数据模型类
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var BaseModel = require('common/BaseModel');
        var Data = require('./Data');
        var UnionData = require('common/global/UnionData');
        var util = require('er/util');
        var config = require('./config');
        var u = require('underscore');

        function SettingReadModel() {
            BaseModel.apply(this, arguments);
            this.data = new Data();
            this.unionData = new UnionData();
        }

        util.inherits(SettingReadModel, BaseModel);

        var user = require('common/global/user');
        var datasource = require('er/datasource');

        /**
         * 数据源配置
         *
         * @type {Object}
         * @override
         */
        SettingReadModel.prototype.datasource = {
            uesr: {
                retrieve: datasource.constant(user),
                dump: true
            },
            canModifyAccount: datasource.permission('CLB_ACCOUNTNAME_MODIFY'),
            canBindUnion: datasource.permission('CLB_ACCOUNT_BIND'),
            canModifyPassword: 
                datasource.permission('CLB_ACCOUNT_PASSWORD_MODIFY'),
            canModifyMail: datasource.permission('CLB_ACCOUNT_EMAIL_MODIFY'),
            isUnionSeriveOK: function (model) {
                var flag = model.unionData.getUnionService();
                return flag;
            },
            // 导航栏权限
            canSubManagerView: datasource.permission('CLB_SUBMANAGER_VIEW'),
            canCompanyView: datasource.permission('CLB_COMPANY_VIEW'),
            canContactView: datasource.permission('CLB_CONTACTOR_VIEW'),
            canChannelView: datasource.permission('CLB_CHANNEL_VIEW')
        };

        var ajax = require('er/ajax');
        u.each(
            config.requests,
            function (config) {
                ajax.register(SettingReadModel, config.name, config);
            }
        );

        return SettingReadModel;
    }
);