/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 历史操作数据类
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var BaseData = require('common/BaseData');
        var util = require('er/util');
        var u = require('underscore');

        function HistoryData() {
            BaseData.call(this, 'history', 'userOpLog');
        }

        util.inherits(HistoryData, BaseData);

        var requests = {
            search: {
                name: 'history/search',
                scope: 'instance',
                policy: 'auto'
            }
        };

        var ajax = require('er/ajax');
        u.each(
            requests,
            function (config) {
                ajax.register(HistoryData, config.name, config);
            }
        );

        return HistoryData;
    }
);        
