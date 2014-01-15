/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 联系人模块数据类
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var BaseData = require('common/BaseData');
        var util = require('er/util');
        var u = require('underscore');

        /**
         * 公司模块数据类
         *
         * @constructor
         * @extends common/BaseData
         */
        function ContactData() {
            BaseData.call(this, 'contact', 'contactor');
        }

        util.inherits(ContactData, BaseData);

        /**
         * 重发邀请
         *
         * @param {number} reinviteID 重发邀请对应的ID
         * @return {er/Promise}
         */
        ContactData.prototype.reinvite = function (reinviteID) {
            var reinviting = this.request(
                'contact/invite',
                {},
                {
                    method: 'PUT',
                    url: '/$entity/' + reinviteID + '/invite'
                }
            );
            return reinviting;
        };

        var requests = {
            search: {
                name: 'contact/search',
                scope: 'instance',
                policy: 'auto'
            },
            list: {
                name: 'contact/list',
                scope: 'instance',
                policy: 'auto'
            },
            save: {
                name: 'contact/save',
                scope: 'instance',
                policy: 'auto'
            },
            update: {
                name: 'contact/update',
                scope: 'instance',
                policy: 'auto'
            },
            remove: {
                name: 'contact/remove',
                scope: 'instance',
                policy: 'auto'
            },
            restore: {
                name: 'contact/restore',
                scope: 'instance',
                policy: 'auto'
            },
            findById: {
                name: 'contact/findById',
                scope: 'instance',
                policy: 'auto'
            },
            tree: {
                name: 'contact/tree',
                scope: 'instance',
                policy: 'auto'
            }
        };

        var ajax = require('er/ajax');
        u.each(
            requests,
            function (config) {
                ajax.register(ContactData, config.name, config);
            }
        );

        return ContactData;
    }
);        
