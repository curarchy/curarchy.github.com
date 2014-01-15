/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 账户信息
 * @author lisijin(ibadplum@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var ajax = require('er/ajax');
        var ui = require('esui');
        var Model = require('er/Model');
        var template = require('er/template');
        var user = require('common/global/user');
        var u = require('underscore');
        var setCookie = require('saber-cookie').set;
        require('tpl!./tpl/accounts.tpl.html');

        var accounts = {};
        accounts.init = function () {
            ajax.getJSON('/api/js/users/current/accounts', null, true)
                .then(initizlize);
        };


        function initizlize(data) {
            var ROLE_NAMES = [
                '主帐户',
                '联系人',
                '数据监测员',
                '投放人员',
                '销售人员',
                '技术人员',
                '超级管理员',
                '广告代理商',
                '排期管理员',
                '销售经理',
                '自定义权限用户'
            ];

            var userDom = document.getElementById('accounts');
            var userInfo = {
                userName: user.name
            };
            var userInfoModel = new Model(userInfo);
            template.merge(userDom, 'accounts', userInfoModel);

            var users = [];
            var usersIndex = {};
            var accounts = data.accounts;
            var currentId = user.mainUserId;
            var currentRole = user.subRole;
            u.map(
                accounts,
                function (account) {
                    users.push(
                        {
                            text: account.accountName,
                            value: account.userId
                        }
                    );
                    usersIndex[account.userId] = account;
                }
            );

            var uiProperties = {
                users: {
                    datasource: users,
                    value: currentId
                }
            };
            ui.init(userDom, { properties: uiProperties });
            var selectForm = ui.get('user-select-form');

            ui.get('user-info').on(
                'command',
                u.bind(selectForm.toggle, selectForm)
            );
            ui.get('users').on('change', displayRoles);
            displayRoles(false);
            ui.get('roles').on('change', changeUser);

            function displayRoles(initOption) {
                var userId = ui.get('users').getValue();
                var user = usersIndex[userId];
                var roles = [];
                var roleIds = user.roleList.split(',');

                if (userId != currentId) {
                    roles.push({ text: '请选择', value: undefined});
                }
                for (var i = 0; i < roleIds.length; i++) {
                    roles.push(
                        {
                            text: ROLE_NAMES[roleIds[i]],
                            value: roleIds[i]
                        }
                    );
                }
                if (roleIds.length) {
                    ui.get('roles').set('datasource', roles);
                    if (userId == currentId) {
                        ui.get('roles').setValue(currentRole);
                    }
                }
            }

            function changeUser() {
                var user = ui.get('users').getValue();
                var role = ui.get('roles').getValue();
                setCookie('userId', user);
                setCookie('roleId', role);
                if (user && role &&
                    (user !== currentId || role !== currentRole)) {
                    var form = document.getElementById('user-select-form');
                    form.action = '/api/js/users/current/accounts/'
                        + user + '/' + role;
                    form.submit();
                }
            }
        }

        return accounts;
    }
);