/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 帐号配置模块配置
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var u = require('underscore');

        var actions = [
            {
                path: '/setting',
                type: 'setting/Read',
                title: '帐户设置'
            },
            {
                path: '/setting/modifyMail',
                type: 'setting/ModifyMail',
                title: '修改电子邮件',
                childActionOnly: !window.DEBUG
            },
            {
                path: '/setting/modifyPassword',
                type: 'setting/ModifyPassword',
                title: '修改密码',
                childActionOnly: !window.DEBUG
            },
            {
                path: '/setting/modifyName',
                type: 'setting/ModifyName',
                title: '修改帐户名称',
                auth: 'CLB_ACCOUNTNAME_MODIFY',
                childActionOnly: !window.DEBUG
            },
            {
                path: '/setting/bindUnion',
                type: 'setting/BindUnion',
                title: '绑定联盟帐户',
                auth: 'CLB_ACCOUNT_BIND',
                childActionOnly: !window.DEBUG
            }
        ];

        var controller = require('er/controller');
        u.each(actions, controller.registerAction);

        return {
            name: 'setting',
            description: '帐户设置',
            requests: {
                modifyEmail: {
                    name: 'setting/modifyEmail',
                    scope: 'instance',
                    policy: 'auto'
                },
                modifyPassword: {
                    name: 'setting/modifyPassword',
                    scope: 'instance',
                    policy: 'auto'
                },
                modifyName: {
                    name: 'setting/modifyAccountName',
                    scope: 'instance',
                    policy: 'auto'
                },
                getUnionInfo: {
                    name: 'setting/getUnionInfo',
                    scope: 'instance',
                    policy: 'auto'
                },
                bindUnion: {
                    name: 'setting/bindUnion',
                    scope: 'instance',
                    policy: 'auto'
                }
            }
        };
    }
);        
