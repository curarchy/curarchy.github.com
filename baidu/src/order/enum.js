/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 创意模块常量枚举类
 * @author wangyaqiong(catkin2009@gmail.com)
 * @date $DATE$
 */
define(
    function () {
        var Enum = require('common/enum').Enum;
        var exports = {};

        /**
         * 订单类型
         *
         * @enum
         */
        exports.Type = new Enum(
            { alias: 'DIRECT', text: '直销订单', value: 0},
            { alias: 'YIELD', text: '库存收益订单', value: 1},
            { alias: 'HOUSEAD', text: '内部订单', value: 2}
        );

        return exports;
    }
);