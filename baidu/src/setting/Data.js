/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 设置模块数据类
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var BaseData = require('common/BaseData');
        var util = require('er/util');
        var u = require('underscore');

        /**
         * 设置模块数据类
         *
         * @extends common.BaseData
         * @constructor
         */
        function SettingData() {
            BaseData.call(this, 'setting', 'user');
        }

        util.inherits(SettingData, BaseData);

        /**
         * 更新电子邮件地址
         *
         * @param {number} id 用户id
         * @param {string} mailAddress 新的电子邮件地址
         * @return er.Promise
         */
        SettingData.prototype.modifyMail = function (id, mailAddress) {
            return this.request(
                'setting/modifyMail',
                { newEmail: mailAddress },
                {
                    method: 'PUT',
                    url: '/users/' + id + '/email'
                }
            );
        };

        /**
         * 修改帐户名
         *
         * @param {number} id 用户id
         * @param {string} accountName 新的帐户名
         * @return er.Promise
         */
        SettingData.prototype.modifyAccountName = function (id, accountName) {
            return this.request(
                'setting/modifyAccountName',
                { accountName: accountName },
                {
                    method: 'PUT',
                    url: '/users/' + id + '/accountName'
                }
            );
        };

        /**
         * 修改密码
         *
         * @param {number} id 用户id
         * @param {string} password 原密码
         * @param {string} newPassword 新密码
         * @return er.Promise
         */
        SettingData.prototype.modifyPassword = 
            function (id, password, newPassword) {
                return this.request(
                    'setting/modifyPassword',
                    {
                        password: password,
                        newPassword: newPassword
                    },
                    {
                        method: 'PUT',
                        url: '/users/' + id + '/password'
                    }
                );
            };

        var requests = {
            findById: {
                name: 'setting/findById',
                scope: 'instance',
                policy: 'auto'
            },
            modifyMail: {
                name: 'setting/modifyMail',
                scope: 'instance',
                policy: 'auto'
            },
            modifyAccountName: {
                name: 'setting/modifyAccountName',
                scope: 'instance',
                policy: 'auto'
            },
            modifyPassword: {
                name: 'setting/modifyPassword',
                scope: 'instance',
                policy: 'auto'
            }
        };

        var ajax = require('er/ajax');
        u.each(
            requests,
            function (config) {
                ajax.register(SettingData, config.name, config);
            }
        );

        return SettingData;
    }
);        
