/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 联系人只读数据模型类
 * @author lixinag(lixiang05@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var ReadModel = require('common/ReadModel');
        var Data = require('./Data');
        var util = require('er/util');
        var config = require('./config');
        var u = require('underscore');

        function ContactReadModel() {
            ReadModel.apply(this, arguments);
            this.data = new Data();
        }

        util.inherits(ContactReadModel, ReadModel);
        var datasource = require('er/datasource');

        ContactReadModel.prototype.datasource = [
            {                
                crumbPath: function (model) {
                    return [
                        { text: '联系人', href: '#/contact/list' },
                        { text: model.get('title') }
                    ];
                }
            },
            {
                // 导航栏权限
                canSubManagerView: datasource.permission('CLB_SUBMANAGER_VIEW'),
                canCompanyView: datasource.permission('CLB_COMPANY_VIEW'),
                canContactView: datasource.permission('CLB_CONTACTOR_VIEW'),
                canChannelView: datasource.permission('CLB_CHANNEL_VIEW')
            }
        ];

        var ajax = require('er/ajax');
        u.each(
            config.requests,
            function (config) {
                ajax.register(ContactReadModel, config.name, config);
            }
        );
        return ContactReadModel;
    }
);