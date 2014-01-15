/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file Union模块常量枚举类
 * @author liyidong(liyidong@baidu.com)
 * @date $DATE$
 */
define(
    function () {
        var Enum = require('common/enum').Enum;

        var exports = {};

        /**
         * Union状态
         *
         * @enum
         */
        exports.CproResult = new Enum(
            { value: 1, alias: 'UNBOUND', text: '未绑定' },
            { value: 2, alias: 'SAME_WITH_MAIN_ACCOUNT', text: '与当前主账号相同' },
            { value: 3, alias: 'ABNORMAL', text: '绑定不正常' },
            { value: 4, alias: 'NOT_BIND_MAIN_ACCOUNT', text: '绑定账号非当前主账号' }
        );

        /**
         * Union账号注册状态
         *
         * @enum
         */
        exports.UnionRegStatus = new Enum(
            { alias: 'REGISTERED', text: '当前用户已注册联盟账号' },
            { alias: 'UNREGISTEED', text: '没有注册' }
        );

        return exports;
    }
);