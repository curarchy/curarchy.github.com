/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 排期表常量枚举类
 * @author Exodia(dengxinxin@baidu.com)
 * @date $DATE$
 */
define(
    function () {
        var Enum = require('common/enum').Enum;

        var exports = {};

        /**
         * 广告位资源状态
         *
         * @enum
         */
        exports.Statuses = new Enum(
            { alias: 'LEISURE', text: '空闲', value: 0 },
            { alias: 'PARTIAL_SOLD', text: '部分售出', value: 1 },
            { alias: 'SOLD', text: '已售出', value: 2 },
            { alias: 'RESERVED', text: '有预订', value: 4 },
            { alias: 'PARTIAL_SOLD_RESERVED', text: '部分售出并被预定', value: 5 },
            { alias: 'SOLD_RESERVED', text: '已售出并被预定', value: 6 }
        );

        return exports;
    }
);