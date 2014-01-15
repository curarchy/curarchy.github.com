/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 创意报告枚举类型模块
 * @author wangyaqiong(catkin2009@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var Enum = require('common/enum').Enum;

        var exports = {};

        /**
         * 创意类型
         *
         * @enum
         */
        exports.AdType = new Enum(
            { alias: 'TEXT', text: '文字', value: 0 },
            { alias: 'IMAGE', text: '图片', value: 1 },
            { alias: 'FLASH', text: 'Flash', value: 2 },
            { alias: 'RICH', text: '富媒体', value: 3 },
            { alias: 'CPRO', text: '百度剩余流量变现创意', value: 10 }
        );
        
        /**
         * 标记类型
         *
         * @enum
         */
        exports.Flag = new Enum(
            { alias: 'UNMARK', text: '未标记'},
            { alias: 'IMPORTANT', text: '重要'}
        );
        return exports;
    }
);        
