/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 全局用户信息模块
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var u = require('underscore');

        function transformKey(key) {
            if (key.indexOf('current') === 0) {
                key = key.substring('current'.length);
            }
            if (key.indexOf('visitor') === 0) {
                key = key.substring('visitor'.length);
            }
            if (key.indexOf('User') === 0) {
                key = key.substring('User'.length);
            }

            return key.charAt(0).toLowerCase() + key.substring(1);
        }

        function initPermission(data) {
            var permission = require('er/permission');
            u.each(
                data,
                function (permissionName) {
                    var item = {};
                    item[permissionName] = true;
                    permission.add(item);
                }
            );
        }

        var user = {
            init: function (info) {
                if (!info) {
                    var ajax = require('er/ajax');
                    return ajax.getJSON('/api/js/users/current')
                        .then(u.bind(user.init, user));
                }

                u.each(
                    info,
                    function (value, key) {
                        key = transformKey(key);
                        // 权限特殊处理
                        if (key === 'authorityList') {
                            initPermission(value);
                        }
                        else {
                            user[key] = value;
                        }
                    }
                );

                return info;
            },

            isSubUser: function () {
                return user.subUserInfoId !== 0;
            },

            setPageSize: function (pageSize) {
                user.pageSize = pageSize;
            },

            getDefaultChannel: function () {
                var channel = this.defaultInfo.defaultChannel;
                return u.extend({ id: parseInt(channel.value, 10) }, channel);
            },

            getDefaultCompany: function () {
                var company = this.defaultInfo.defaultCompany;
                return u.extend({ id: parseInt(company.value, 10) }, company);
            }
        };

        return user;
    }
);