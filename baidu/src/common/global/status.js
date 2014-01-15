/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 定义各状态的模块
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        return {
            normal: {
                type: 'normal',
                text: '启用'
            },

            removed: {
                type: 'removed',
                text: '删除'
            },

            inactive: {
                type: 'unactivated',
                text: '待激活'
            },

            expired: {
                type: 'expired',
                text: '已过期'
            },

            active: {
                type: 'activated',
                text: '已激活'
            },

            stop: {
                type: 'stoped',
                text: '停用'
            },

            uninvite: {
                type: 'uninvited',
                text: '未邀请'
            }
        };
    }
);
