/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 管理员模块数据类
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var BaseData = require('common/BaseData');
        var util = require('er/util');
        var u = require('underscore');

        /**
         * 管理员模块数据类
         *
         * @constructor
         * @extends common/BaseData
         */
        function ManagerData() {
            BaseData.call(this, 'manager', 'subManager');
        }

        util.inherits(ManagerData, BaseData);

        /**
         * 获取管理员的广告位权限信息
         *
         * @param {number} id 管理员id
         * @return {er.Promise}
         */
        ManagerData.prototype.getAuthorities = function (id) {
            var api = id ? id + '/authorities' : 'authorities';

            return this.request(
                'manager/authorities',
                {},
                {
                    method: 'GET',
                    url: '/$entity/' + api
                }
            );
        };

        /**
         * 重发邀请
         *
         * @param {number} reinviteID 重发邀请对应的ID
         * @return {er.Promise}
         */
        ManagerData.prototype.reinvite = function (reinviteID) {
            return this.request(
                'manager/invite',
                {},
                {
                    method: 'PUT',
                    url: '/$entity/' + reinviteID + '/invite'
                }
            );
        };

        ManagerData.prototype.getSalers = function () {
            return this.request('manager/salers');
        };

        var requests = {
            search: {
                name: 'manager/search',
                scope: 'instance',
                policy: 'auto'
            },
            list: {
                name: 'manager/list',
                scope: 'instance',
                policy: 'auto'
            },
            save: {
                name: 'manager/save',
                scope: 'instance',
                policy: 'auto'
            },
            update: {
                name: 'manager/update',
                scope: 'instance',
                policy: 'auto'
            },
            remove: {
                name: 'manager/remove',
                scope: 'instance',
                policy: 'auto'
            },
            restore: {
                name: 'manager/restore',
                scope: 'instance',
                policy: 'auto'
            },
            findById: {
                name: 'manager/findById',
                scope: 'instance',
                policy: 'auto'
            },
            tree: {
                name: 'manager/tree',
                scope: 'instance',
                policy: 'auto'
            },
            authorities: {
                name: 'manager/authorities',
                scope: 'instance',
                policy: 'auto'
            },
            reinvite: {
                name: 'manager/reinvite',
                scope: 'instance',
                policy: 'auto'
            },
            salers: {
                name: 'manager/salers',
                scope: 'instance',
                policy: 'auto',
                options: {
                    url: '/$entity/salers',
                    method: 'GET'
                }
            }
        };

        var ajax = require('er/ajax');
        u.each(
            requests,
            function (config) {
                ajax.register(ManagerData, config.name, config);
            }
        );

        return ManagerData;
    }
);        
