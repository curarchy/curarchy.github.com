/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 历史查询工具列表视图类
 * @author wangyaqiong(wangyaqiong@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var ListView = require('common/ListView');
        var util = require('er/util');
        var moment = require('moment');
        require('tpl!./tpl/list.tpl.html');

        /**
         * 历史查询工具列表视图类
         *
         * @constructor
         * @extends common/ListView
         */
        function HistoryListView() {
            ListView.apply(this, arguments);
        }

        util.inherits(HistoryListView, ListView);

        /** 
         * 使用的模板名称
         *
         * @type {string}
         */
        HistoryListView.prototype.template = 'historyList';
        var opTypes = [{ text: '全部', value: '' }];
        var system = require('common/global/system');
        opTypes = opTypes.concat(system.opObjectType);

        var tableFields = [
            {
                title: '日期',
                field: 'opTime',
                width: 150,
                stable: true,
                sortable: false,
                resizable: true,
                content: 'opTime'
            },
            {
                title: '操作人',
                field: 'opUserName',
                width: 140,
                stable: true,
                sortable: false,
                resizable: true,
                content: 'opUserName'
            },
            {
                title: '操作对象',
                field: 'opObjectType',
                width: 100,
                stable: true,
                sortable: false,
                resizable: true,
                content: 'opObjectTypeText'
            },
            {
                title: '对象名称',
                field: 'opObject',
                width: 250,
                stable: true,
                sortable: false,
                resizable: true,
                content: 'opObject'
            },
            {
                title: '操作说明',
                field: 'opValue',
                sortable: false,
                resizable: true,
                content: function (item) {
                    var opValue = item.opValue;
                    var showValue = opValue.replace(/\u0000/g, '<br/>');
                    return showValue;
                }
            }
            
        ];

        /**
         * 获取查询参数
         *
         * @return {Object}
         */
        HistoryListView.prototype.getSearchArgs = function () {
            var form = this.get('filter');
            var args = form ? form.getData() : {};
            var rangeDate = args.rangeDate;
            if (rangeDate) {
                var beginDate = rangeDate.begin;
                var endDate = rangeDate.end;

                args.beginDate = moment(beginDate).format('YYYY-MM-DD');
                args.endDate = moment(endDate).format('YYYY-MM-DD');
            }

            delete args.rangeDate;
            return args;
        };

        /**
         * 控件额外属性
         *
         * @type {Object}
         */
        HistoryListView.prototype.uiProperties = {
            table: {
                fields: tableFields,
                select: ''
            }
        };

        /**
         * 控制元素展现
         *
         */
        HistoryListView.prototype.enterDocument = function () {
            ListView.prototype.enterDocument.apply(this, arguments);
            this.updateSelectStatus();
        };

        /**
         * 控制搜索关键字元素是否能输入
         *
         */
        HistoryListView.prototype.updateSelectStatus = function () {
            var opSelect = this.get('status');
            var keyword = this.get('keyword');
            keyword.set('disabled', !opSelect.getValue());
        };

        return HistoryListView;
    }
);