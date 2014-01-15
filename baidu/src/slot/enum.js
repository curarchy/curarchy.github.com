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

        /**
         * 计费单位
         *
         * @enum
         */
        exports.PriceUnit = new Enum(
            { alias: 'CPD', text: '轮播' },
            { alias: 'CPM', text: '展现' },
            { alias: 'CPC', text: '点击' }
        );

        /**
         * 固定占位
         *
         * @enum
         */
        exports.FixPosition = new Enum(
            { alias: 'NO', text: '未启用' },
            { alias: 'YES', text: '启用' }
           
        );

        /**
         * 补余
         *
         * @enum
         */
        exports.AllowRest = new Enum(
            { alias: 'DISABLED', text: '未启用' },
            { alias: 'ENABLED', text: '启用'}
        );

        /**
         * 广告位平台
         *
         * @enum
         */
        exports.Platform = new Enum(
            { alias: 'PC', text: 'PC' },
            { alias: 'MOBILE', text: '移动设备' }
        );

        return exports;
    }
);        
