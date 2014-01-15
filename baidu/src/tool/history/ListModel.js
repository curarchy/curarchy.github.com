/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 历史查询工具列表数据模型类
 * @author wangyaqiong(wangyaqiong@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var ListModel = require('common/ListModel');
        var Data = require('./Data');
        var util = require('er/util');
        var config = require('./config');
        var moment = require('moment');
        var u = require('underscore');

        function HistoryListModel() {
            ListModel.apply(this, arguments);
            this.data = new Data();
        }

        util.inherits(HistoryListModel, ListModel);

        var opTypes = [{ text: '全部', value: '' }];
        var system = require('common/global/system');
        opTypes = opTypes.concat(system.opObjectType);

        var opTypeIndex = system.opObjectTypeMap;
        var datasource = require('er/datasource');
        
        /**
         * 数据源配置
         *
         * @type {Object}
         * @override
         */
        HistoryListModel.prototype.datasource = {
            opTypes: datasource.constant(opTypes),
            
            keywordPlaceHolder: function (model) {
                var type = model.get('opObjectType');
                var opTypeText = opTypeIndex[type];

                return opTypeText
                    ? '请输入' + opTypeText + '的名称'
                    : '请先选择一个日志类型';
            },

            rangeDate: function (model) {
                var beginDate = model.get('beginDate');
                var endDate = model.get('endDate');
                if (!beginDate && !endDate) {
                    var begin = moment().subtract('d', 7);
                    var end = moment().subtract('d', 1);
                    
                    beginDate = begin.format('YYYY-MM-DD');
                    endDate = end.format('YYYY-MM-DD');
                    model.set('beginDate', beginDate);
                    model.set('endDate', endDate);
                }
                return beginDate  + ',' + endDate;
            }
        };

        HistoryListModel.prototype.prepare = function () {
            // 翻译操作对象字段为中文
            u.each(
                this.get('results'),
                function (item) {
                    item.opObjectTypeText = 
                        opTypeIndex[item.opObjectType] || item.opObjectType;
                }
            );
        };

        /**
         * 获取请求后端时的查询参数
         *
         * @return {Object}
         */
        HistoryListModel.prototype.getQuery = function () {
            var query = ListModel.prototype.getQuery.apply(this, arguments);
            var opObjectType = this.get('opObjectType');
            query.opObjectType = opObjectType || '';

            var beginDate = this.get('beginDate');
            var endDate = this.get('endDate');
            query.beginDate = moment(beginDate).format('YYYYMMDD');
            query.endDate = moment(endDate).format('YYYYMMDD');
            return query;
        };

        var ajax = require('er/ajax');
        u.each(
            config.requests,
            function (config) {
                ajax.register(HistoryListModel, config.name, config);
            }
        );

        return HistoryListModel;
    }
);