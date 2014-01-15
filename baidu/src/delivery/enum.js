/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 创意模块常量枚举类
 * @author lisijin(ibadplum@gmail.com)
 * @date $DATE$
 */
define(
    function () {
        var Enum = require('common/enum').Enum;

        var exports = {};

        /**
         * 广告状态
         *
         * @enum
         */
        exports.DeliveryType = new Enum(
            { alias: 'PAUSE', text: '暂停' },
            { alias: 'WAIT', text: '待投放' },
            { alias: 'SLOT', text: '投放中' },
            { alias: 'OVER', text: '投放完成' },
            { alias: 'STOP', text: '终止' },
            { alias: 'REQUEST', text: '待确认' }
        );

        /**
         * 广告状态
         *
         * @enum
         */
        exports.Status = new Enum(
            { alias: 'PAUSE', text: '暂停' },
            { alias: 'WAIT', text: '待投放' },
            { alias: 'SLOT', text: '投放中' },
            { alias: 'OVER', text: '投放完成' },
            { alias: 'STOP', text: '终止' },
            { alias: 'REQUEST', text: '待确认' }
        );

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
            { alias: 'CPD', text: '天' },
            { alias: 'CPM', text: '次展现' },
            { alias: 'CPC', text: '次点击' }
        );

        /**
         * 优先级别
         *
         * @enum
         */
        exports.Priority = new Enum(
            { alias: 'ONLY', text: '独占' },
            { alias: 'STANDARD', text: '标准' },
            { alias: 'STOCK', text: '库存收益' },
            { alias: 'INTERNAL', text: '内部' }
        );

        /**
         * 平台
         *
         * @enum
         */
        exports.Platform = new Enum(
            { alias: 'COMPUTER', text: '电脑' },
            { alias: 'MOBILE', text: '移动' }
        );

        return exports;
    }
);