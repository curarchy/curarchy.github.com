/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 联系人模块常量枚举类
 * @author liyidong(liyidong@baidu.com), zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function () {
        var Enum = require('common/enum').Enum;

        var exports=  {};

        /**
         * 联系人状态
         *
         * @enum
         */
        exports.Status = new Enum(
            { alias: 'UNINVITE', text: '未邀请' },
            { alias: 'INACTIVE', text: '待激活' },
            { alias: 'EXPIRED', text: '已过期' },
            { alias: 'ACTIVE', text: '已激活' },
            { alias: 'STOP', text: '停用' },
            { alias: 'REMOVED', text: '删除' }
        );

        return exports;
    }
);