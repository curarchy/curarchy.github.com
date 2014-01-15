/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 广告位枚举类型模块
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var Enum = require('common/enum').Enum;

        var exports = {};

        /**
         * 计费类型
         *
         * @enum
         */
        exports.PriceModel = new Enum(
            { alias: 'CPD', text: 'CPD' },
            { alias: 'CPM', text: 'CPM' },
            { alias: 'CPC', text: 'CPC' }
        );
        
        return exports;
    }
);        
