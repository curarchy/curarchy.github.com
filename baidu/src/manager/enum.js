/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 常量枚举类
 * @author liyidong(srhb18@gmail.com)
 * @date $DATE$
 */
define(
    function () {
        var Enum = require('common/enum').Enum;

        var exports = {};

        /**
         * 广告位权限等级类型
         *
         * @enum
         */
        exports.AuthorityType = new Enum(
            { alias: 'CHANNEL', value: 1, text: '频道'},
            { alias: 'SLOT', value: 2, text: '广告位'},
            { alias: 'CHANNELGROUP', value: 3, text: '频道分组'}
        );

        return exports;
    }
);