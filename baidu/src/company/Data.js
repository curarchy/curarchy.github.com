/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 公司模块数据类
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
        function CompanyData() {
            BaseData.call(this, 'company');
        }

        util.inherits(CompanyData, BaseData);

        var requests = {
            search: {
                name: 'company/search',
                scope: 'instance',
                policy: 'auto'
            },
            list: {
                name: 'company/list',
                scope: 'instance',
                policy: 'auto'
            },
            save: {
                name: 'company/save',
                scope: 'instance',
                policy: 'auto'
            },
            update: {
                name: 'company/update',
                scope: 'instance',
                policy: 'auto'
            },
            remove: {
                name: 'company/remove',
                scope: 'instance',
                policy: 'auto'
            },
            restore: {
                name: 'company/restore',
                scope: 'instance',
                policy: 'auto'
            },
            findById: {
                name: 'company/findById',
                scope: 'instance',
                policy: 'auto'
            },
            tree: {
                name: 'company/tree',
                scope: 'instance',
                policy: 'auto'
            }
        };

        var ajax = require('er/ajax');
        u.each(
            requests,
            function (config) {
                ajax.register(CompanyData, config.name, config);
            }
        );

        return CompanyData;
    }
);        
