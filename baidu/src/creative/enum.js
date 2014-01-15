/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 创意模块常量枚举类
 * @author liyidong(liyidong@baidu.com), zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function () {
        var Enum = require('common/enum').Enum;

        var exports = {};

        /**
         * 创意类型
         *
         * @enum
         */
        exports.Type = new Enum(
            { alias: 'TEXT', text: '文字', value: 0 },
            { alias: 'IMAGE', text: '图片', value: 1 },
            { alias: 'FLASH', text: 'Flash', value: 2 },
            { alias: 'RICH', text: '富媒体', value: 3 },
            { alias: 'CPRO', text: '网盟创意', value: 10 }
        );


        exports.Statuses = new Enum(
            { alias: 'REMOVE', text: '删除' },
            { alias: 'VALID', text: '启用' }
        );

        exports.InturnType = new Enum(
            { alias: 'UNIFORM', text: '均匀' },
            { alias: 'MANUALLY', text: '权重' },
            { alias: 'ROTAITION', text: '轮换' },
            { alias: 'CAROUSEL', text: '微轮播' }
        );

        return exports;
    }
);