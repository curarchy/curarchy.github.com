/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 频道分组列表视图类
 * @author zhanglili(otakustay@gmail.com), wangyaqiong(catkin2009@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var BaseView = require('common/BaseView');
        var util = require('er/util');
        var u = require('underscore');

        // 使用列表视图，有以下要求：
        //
        // - 有id为`filter`的`Form`控件
        // - 有id为`table`的`Table`控件
        // - 所有触发查询的条件控件，会触发`filter`的`submit`事件（可使用`AutoSubmit`）
        // 
        // 扩展点：
        // 
        // - `setTableFields`用于配置表格列，该方法用于直接使用`ListView`基类作为视图，
        // 如果使用自定义类继承自`ListView`，建议写`prototype.uiProperties`
        // - `addSearchTrigger`用于添加触发查询的事件，一般来说不使用，应当触发表单提交，
        // 子类可在构造函数中调用该方法添加一些触发事件
        // - `getSearchArgs`用于收集查询参数，默认是取`filter`表单的所有数据，加上排序、
        // 页码、每页条目数

        /**
         * 列表视图基类
         *
         * @constructor
         * @extends common/BaseView
         */
        function ListView() {
            BaseView.apply(this, arguments);

            // 从`prototype`上复制2个属性，方便运行时修改
            this.uiProperties = u.clone(this.uiProperties) || {};
            this.uiEvents = u.clone(this.uiEvents) || {};

            // 默认的查询事件
            this.addSearchTrigger('filter', 'submit');
            this.addSearchTrigger('table', 'sort');
        }

        util.inherits(ListView, BaseView);

        /**
         * 更新批量控件的状态
         *
         * 若有添加可由子类继承
         */
        ListView.prototype.updateBatchStatus = function () {
            var items = this.getSelectedItems();
            var batchButtons = this.getGroup('batch');

            for (var i = 0; i < batchButtons.length; i++) {
                var button = batchButtons[i];
                var status = +button.getData('status');
                var enabled = items
                    && items.length
                    && this.model.canUpdateToStatus(items, status);
                button.set('disabled', !enabled);
            }
        };

        /**
         * 获取批量操作状态
         * @param {Object} e 控件事件对象
         */ 
        function batchModify(e) {
            var statusName = e.target.id.toUpperCase();
            var status = require('./enum').Status[statusName];
            var args = { 
                // `status`是`number`类型
                status: status,
                // `statusName`是一个camelCase的格式
                statusName: e.target.id.replace(
                    /-[a-z]/g, 
                    function (w) { return w.charAt(1).toUpperCase(); }
                ),
                // `command`是操作的中文说明
                command: e.target.get('text')
            };

            this.fire('batchmodify', args);
        }

        /**
         * 获取table已经选择的列的数据
         *
         * @return {Object[]} 当前table的已选择列对应的数据
         */ 
        ListView.prototype.getSelectedItems = function () {
            var table = this.get('table');
            return table ? table.getSelectedItems() : [];
        };

        /**
         * 收集检索数据
         *
         * @param {ListView} this 当前视图实例
         * @param {Object} e 控件事件对象
         */
        function search (e) {
            var args = this.getSearchArgs();

            // 如果是表格排序引发的，把新的排序放进去
            if (e.type === 'sort') {
                args.orderBy = e.field.field;
                args.order = e.order;
            }

            this.fire('search', { args: args });
        }

        /**
         * 设置表格配置
         *
         * @param {Array} fields 表格各列的配置
         */
        ListView.prototype.setTableFields = function (fields) {
            if (!this.uiProperties) {
                this.uiProperties = {};
            }

            if (!this.uiProperties.table) {
                this.uiProperties.table = {};
            }

            this.uiProperties.table.fields = tableFields;
        };

        /**
         * 添加触发查询的事件
         *
         * @param {string} id 对应控件的id
         * @param {string} eventName 触发事件的名称
         */ 
        ListView.prototype.addSearchTrigger = function (id, eventName) {
            var trigger = id + ':' + eventName;
            this.uiEvents[trigger] = search;
        };

        /**
         * 获取查询参数
         *
         * @return {Object}
         */
        ListView.prototype.getSearchArgs = function () {
            // 获取表单的字段
            var form = this.get('filter');
            var args = form ? form.getData() : {};
            // 加上原本的排序方向和排序字段名
            args.order = this.model.get('order');
            args.orderBy = this.model.get('orderBy');

            // 关键词去空格
            if (args.keyword) {
                args.keyword = u.trim(args.keyword);
            }
            
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

        /**
         * 绑定控件事件
         *
         * @override
         */
        ListView.prototype.bindEvents = function () {
            var pager = this.get('pager');
            if (pager) {
                pager.on('pagesizechange', u.bind(updatePageSize, this));
            }

            var table = this.get('table');
            if (table) {
                table.on('select', u.bind(this.updateBatchStatus, this));
            }

            var addBatchModifyEvent = function (button) {
                var button = this.get(button.id);
                if (button) {
                    button.on('click', u.bind(batchModify, this));
                }
            };
            addBatchModifyEvent = u.bind(addBatchModifyEvent, this);
            u.each(this.getGroup('batch'), addBatchModifyEvent);

            BaseView.prototype.bindEvents.apply(this, arguments);
        };

        /**
         * 控制元素展现
         *
         * @override
         */
        ListView.prototype.enterDocument = function () {
            BaseView.prototype.enterDocument.apply(this, arguments);
            this.updateBatchStatus();
        };

        /**
         * 根据布局变化重新调整自身布局
         */
        ListView.prototype.adjustLayout = function () {
            var table = this.get('table');
            if (table) {
                table.adjustWidth();
            }
        };

        return ListView;
    }
);