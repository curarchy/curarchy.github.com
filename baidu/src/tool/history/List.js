/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 历史查询工具列表Action
 * @author wangyaqiong(wangyaqiong@baidu.com)
 * @date 2013/8/7
 */
define(
    function (require) {
        var util = require('er/util');
        var ListAction = require('common/ListAction');
        var config = require('./config');

        /**
         * 历史查询工具列表
         *
         * @constructor
         * @extends common/ListAction
         */
        function HistoryList() {
            ListAction.apply(this, arguments);
        }
        
        util.inherits(HistoryList, ListAction);

        /**
         * 视图类型
         *
         * @type {function}
         * @override
         */
        HistoryList.prototype.viewType = require('./ListView');
        
        /**
         * action 对应的中文描述
         */
        HistoryList.prototype.entityDescription = config.entityDescription;
        
        /**
         * 数据模型类型
         *
         * @type {function}
         * @override
         */
        HistoryList.prototype.modelType = require('./ListModel');

        return HistoryList;
    }
);
