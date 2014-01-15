/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 报告视图类
 * @author lixiang(lixiang05@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var UIView = require('ef/UIView');
        var util = require('er/util');
        var u = require('underscore');
        var lib = require('esui/lib');


        // 使用报告视图，有以下要求：
        //
        // - 有id为`range`的`RangeCalendar`控件
        // - 有id为`filter`的`Form`控件，里面包含属性选择和关键词选择
        // 这两个控件都会触发查询事件
        //
        // - 有id为`line-chart`的线状图
        // - 有id为`stack-chart`的堆状图
        // - 有id为`bar-chart`的柱状图
        //
        // - 有id为`left-property-select`和`right-property-select`的`Select`控件
        // - 或id为`property-select`的`Select`控件
        // 这两个控件都会触发图表刷新事件
        // 
        // - 有id为`table`的`Table`控件
        // - 有id为`pager`的`Pager`控件
        // 这两个控件对应的操作会触发表格的刷新事件
        // 
        // 扩展点：
        // 
        // - `addSearchTrigger`用于添加触发查询的事件，一般来说不使用，应当触发表单提交，
        // 子类可在构造函数中调用该方法添加一些触发事件
        // - `getSearchArgs`用于收集查询参数，默认是取`filter`表单的所有数据，加上排序、
        // 页码、每页条目数

        /**
         * 列表视图基类
         *
         * @constructor
         * @extends ef/UIView
         */
        function ReportView() {
            UIView.apply(this, arguments);
            // 默认的查询事件
            this.addSearchTrigger('range', 'change');
            this.addSearchTrigger('filter', 'submit');
            // 图表刷新事件
            this.addChartRefreshTrigger('left-property-select', 'change');
            this.addChartRefreshTrigger('right-property-select', 'change');
            this.addChartRefreshTrigger('property-select', 'change');
            // 表格刷新事件
            this.addTableRefreshTrigger('table', 'sort');
            this.addTableRefreshTrigger('pager', 'pagechange');

        }


        /**
         * 刷新表格
         */
        function refreshTable(e) {
            var table = this.get('table');
            var pager = this.get('pager');
            var options = {};
            var tableProperties = {};
            var pagerProperties = {};
            // 排序会刷新页码到第一页
            if (e.type === 'sort') {
                options.orderBy = e.field.field;
                options.order = e.order;
                options.pageNo = 1;
                // 控件属性
                pagerProperties.page = 1;
            }
            else if (e.type === 'pagechange') {
                options.pageNo = pager.getPageIndex() + 1;
                // 要保存排序状态
                if (table.order && table.orderBy) {
                    options.orderBy = table.orderBy;
                    options.order = table.order;
                }
            }
            this.fire('refreshtable', options);
            // 刷新table（pager改变触发）
            tableProperties.datasource = this.model.get('tableData');
            table.setProperties(tableProperties);
            // 刷新pager（table排序触发）
            if (pager) {
                pager.setProperties(pagerProperties);
            }

        }

        /**
         * 刷新图表
         */
        function refreshChart() {
            var leftKey;
            var rightKey;
            var leftSelect = this.get('left-property-select');
            var rightSelect = this.get('right-property-select');
            if (leftSelect && rightSelect) {
                leftKey = leftSelect.getValue();
                rightKey = rightSelect.getValue();
            }

            var select = this.get('property-select');
            if (select) {
                leftKey = select.getValue();
            }

            // 重构数据
            this.fire(
                'refreshchart', 
                { leftKey: leftKey, rightKey: rightKey }
            );

            this.repaintChart();
        }

        ReportView.prototype.repaintChart = function () {
            // 重绘图表
            var chart = this.get('line-chart');
            if (chart) {
                var ySeries = this.model.get('ySeries');
                chart.set('ySeries', ySeries);
            }
        };

        /**
         * 收集检索数据
         *
         * @param {ReportView} this 当前视图实例
         * @param {Object} e 控件事件对象
         */
        function search(e) {
            var args = this.getSearchArgs();
            args = u.purify(args, { page: 1 });
            this.fire('search', { args: args });
        }

        /**
         * 添加触发查询的事件
         *
         * @param {string} id 对应控件的id
         * @param {string} eventName 触发事件的名称
         */ 
        ReportView.prototype.addSearchTrigger = function (id, eventName) {
            var trigger = id + ':' + eventName;
            this.uiEvents[trigger] = search;
        };

        /**
         * 添加触发表格刷新的事件
         *
         * @param {string} id 对应控件的id
         * @param {string} eventName 触发事件的名称
         */ 
        ReportView.prototype.addTableRefreshTrigger = function (id, eventName) {
            var trigger = id + ':' + eventName;
            this.uiEvents[trigger] = refreshTable;
        };

        /**
         * 添加触发图标刷新的事件
         *
         * @param {string} id 对应控件的id
         * @param {string} eventName 触发事件的名称
         */ 
        ReportView.prototype.addChartRefreshTrigger = function (id, eventName) {
            var trigger = id + ':' + eventName;
            this.uiEvents[trigger] = refreshChart;
        };

        /**
         * 获取查询参数，
         * 这个方法是日历选择所触发的查询操作调用的方法，用来从控件里抽取参数
         * 如果还有其它的参数，可以重写这个方法
         *
         * @return {Object}
         */
        ReportView.prototype.getSearchArgs = function () {
            var moment = require('moment');
            var args = {};
            var id = this.model.get('id');
            if (id) {
                args.id = id;
            }
            // 获取表单的字段
            var form = this.get('filter');
            // 不是所有的报告都有这东西
            args = form ? u.extend(args, form.getData()) : args;
            // 日期是独立的
            var range = this.get('range').getValue().split(',');
            args.startTime = moment(range[0]).format('YYYYMMDD');
            args.endTime = moment(range[1]).format('YYYYMMDD');
            return args;
        };

        /**
         * 更新每页显示数
         *
         * @param {Object} e 事件对象
         */
        function updatePageSize(e) {
            var pageSize = e.target.get('pageSize');
            this.fire('pagesizechange', { pageSize: pageSize });
        }

        ReportView.prototype.uiEvents = {
            'pager:pagesizechange': updatePageSize
        };

        function getSelectDisplayHTML(item) {
            var template = ''
                + '<span class="ui-select-legend-block" '
                + 'style="border-left: 15px solid ${bgColor};" >${text}</span>';

            if (!item) {
                return u.escape(this.emptyText || '');
            }

            var data = {
                text: u.escape(item.name || item.text),
                bgColor: this.legendColor
            };
            return lib.format(template, data);
        }

        /**
         * 声明当前视图关联的控件的额外属性，参考`uiProperties`属性
         *
         * @override
         */
        ReportView.prototype.getUIProperties = function () {
            var defaults = {
                'left-property-select': {
                    getDisplayHTML: getSelectDisplayHTML
                },
                'right-property-select': {
                    getDisplayHTML: getSelectDisplayHTML
                },
                'property-select': {
                    getDisplayHTML: getSelectDisplayHTML
                }
            };
            return u.extend(defaults, this.uiProperties);
        };


        /**
         * 渲染
         *
         * @override
         */
        ReportView.prototype.enterDocument = function () {
            UIView.prototype.enterDocument.apply(this, arguments);
            var model = this.model;
            var revisedQuery = model.get('revisedQuery');
            if (revisedQuery) {
                this.alert(revisedQuery.message, '提示');
            }
            else if (this.model.get('isTimeout')) {
                this.alert(
                    '由于查询数据量过大，图表无法正常显示。'
                        + '建议您下载数据或缩小查询范围。', 
                    '提示'
                );
            }
        };

        util.inherits(ReportView, UIView);
        return ReportView;
    }
);