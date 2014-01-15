/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 详情页视图基类
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var BaseView = require('common/BaseView');
        var util = require('er/util');
        var u = require('underscore');
        var ui = require('esui');

        // 使用基类视图，有以下要求：
        //
        // - 有id为`tab`的`Tab`控件
        // - 有id为`detail-list`的`ActionPanel`控件
        // - 有id为`create`的`Button`控件

        /**
         * 详情页视图基类
         *
         * @constructor
         * @extends common/BaseView
         */
        function DetailView() {
            BaseView.apply(this, arguments);
        }

        util.inherits(DetailView, BaseView);

        /**
         * 代理侧边栏导航树节点选择的行为
         *
         * @param {Object} e 事件对象
         */
        function delegateTreeNodeSelect(e) {
            this.fire('selectitem', { node: e.node });
        }

        /**
         * 代理侧边栏导航树关键字搜索行为
         *
         * @param {Object} e 事件对象
         */
        function delegateTreeSearch(e) {
            var keyword = u.trim(e.target.getValue());
            this.fire('searchtree', { keyword: keyword });
        }

        /**
         * 根据侧边栏状态调整整体布局
         */
        function adjustLayout() {
            var listActionPanel = this.get('detail-list');
            var listAction = listActionPanel && listActionPanel.get('action');
            if (listAction && typeof listAction.adjustLayout === 'function') {
                listAction.adjustLayout();
            }
        }

        /**
         * 绑定控件事件
         *
         * @override
         */
        DetailView.prototype.bindEvents = function () {
            var delegate = require('mini-event').delegate;

            // 子Action提交查询请求转发出去
            var listActionPanel = this.get('detail-list');
            if (listActionPanel) {
                delegate(
                    listActionPanel, 'action@search',
                    this, 'search',
                    { preserveData: true, syncState: true }
                );
            }

            var tree = this.get('tree');
            if (tree) {
                tree.on('selectnode', delegateTreeNodeSelect, this);
            }

            var treeSearch = this.get('search');
            if (treeSearch) {
                treeSearch.on('search', delegateTreeSearch, this);
            }

            var sidebar = this.get('sidebar');
            if (sidebar) {
                sidebar.on('modechange', adjustLayout, this);
            }

            require('er/events').on(
                'leaveaction',
                function (e) {
                    if (!e.action.context.isChildAction) {
                        var toolbox = ui.get('toolbox');
                        if (toolbox) {
                            toolbox.hide();
                            toolbox.disposeAttach();
                        }
                    }
                }
            );

            BaseView.prototype.bindEvents.apply(this, arguments);
        };

        /**
         * 刷新左侧导航树
         *
         * @protected
         */
        DetailView.prototype.refreshTree = function () {
            var tree = this.get('tree');
            if (tree) {
                var properties = {
                    datasource: this.model.get('filteredTreeDatasource'),
                    keyword: this.model.get('treeKeyword')
                };
                tree.setProperties(properties);
            }
        };

        /**
         * 激活对应的Tab
         *
         * @protected
         */
        DetailView.prototype.activateTab = function () {
            var tab = this.get('tab');
            if (tab) {
                var activeTab = u.findWhere(
                    tab.get('tabs'),
                    { type: this.model.get('tab') }
                );
                tab.activate(activeTab);
            }
        };

        DetailView.prototype.enterDocument = function () {
            BaseView.prototype.enterDocument.apply(this, arguments);
            this.activateTab();
            ui.getSafely('toolbox').show();
        };

        return DetailView;
    }
);        
