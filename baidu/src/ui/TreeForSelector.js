/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 选择控件中所用到的树形结构
 * @author lixiang(lixiang05@baidu.com)
 * @date $DATE$
 */

define(
    function (require) {
        require('esui/Label');
        require('esui/Panel');
        require('esui/Tree');
        var TreeStrategy = require('ui/SelectorTreeStrategy');

        var ui = require('esui/main');
        var lib = require('esui/lib');
        var helper = require('esui/controlHelper');
        var Control = require('esui/Control');
        var u = require('underscore');


        /**
         * 控件类
         * 
         * @constructor
         * @param {Object} options 初始化参数
         */
        function TreeForSelector(options) {
            Control.apply(this, arguments);
        }

        lib.inherits(TreeForSelector, Control);

        /**
         * 创建结果列表
         * @param {ui.TreeForSelector} treeForSelector 类实例
         * @param {Array} queryData 结果数据，可能是全集也可能是搜索结果
         * 其中，children中是子item在subDatasource中的索引
         * @inner
         */
        function generateTable(treeForSelector, queryData) {
            var treeData = queryData || treeForSelector.treeData;
            if (!treeData.children || !treeData.children.length) {
                treeForSelector.addState('empty');
            }
            else {
                treeForSelector.removeState('empty');
            }

            var queryList = treeForSelector.getChild('queryList');
            var treeList = queryList.getChild('treeList');
            if (!treeList) {
                var skin = 'rich-selector-add';
                if (treeForSelector.mode === 'delete') {
                    skin = 'rich-selector-delete';
                }

                var options = {
                    childName: 'treeList',
                    datasource: treeData,
                    skin: 'flat',
                    allowUnselectNode: false,
                    strategy:
                        new TreeStrategy(
                            {
                                mode: treeForSelector.mode,
                                orientExpand: treeForSelector.orientExpand
                            }
                        ),
                    wideToggleArea: false,
                    hideRoot: true,
                    selectMode: 
                        treeForSelector.multi ? 'multiple' : 'single'
                };
                if (treeForSelector.getItemHTML) {
                    options.getItemHTML = treeForSelector.getItemHTML;
                }
                treeList = ui.create('Tree', options);
                queryList.addChild(treeList);
                treeList.appendTo(queryList.main);

                treeList.on(
                    'selectnode',
                    function (e) {
                        var node = e.node;
                        selectOrDeleteItem(treeForSelector, node);
                    }
                );

                treeList.on(
                    'unselectnode',
                    function (e) {
                        var node = e.node;
                        node.isSelected = false;
                    }
                );
            }
            else {
                treeList.setProperties({
                    'datasource': treeData,
                    'keyword': treeForSelector.currentKeyword
                });
            }

            if (treeForSelector.mode === 'add'
                || treeForSelector.mode === 'load') {
                updateSelectedState(treeList, treeData.children);
            }
        }

        /**
         * 手动触发，选择或删除节点
         * @param {ui.TreeForSelector} treeForSelector 类实例
         * @param {Object} node 节点对象
         * @inner
         */
        function selectOrDeleteItem(treeForSelector, item) {
            // 这个item不一定是源数据元，为了连锁同步，再取一遍
            var item = treeForSelector.dataIndex[item.id];
            item.isSelected = true;
            if (treeForSelector.mode === 'load') {
                item.isActive = true;
                // 虽然是多选模式，但是这个多选是替代“disable”出现的
                // 处于非“disable”状态的item还是只能单选
                // TODO 这里要做修改，不应该这么用
                if (treeForSelector.multi === true) {
                    // 已经选了一个，则先取消选择
                    if (treeForSelector.curSelectedId) {
                        var queryList = treeForSelector.getChild('queryList');
                        var treeList = queryList.getChild('treeList');
                        treeList.unselectNode(treeForSelector.curSelectedId);
                    }
                    treeForSelector.curSelectedId = item.id;
                }
                treeForSelector.fire('load', {item: item});
            }
            else if (treeForSelector.mode === 'add') {
                // 单选
                if (treeForSelector.multi === false) {
                    treeForSelector.curSelectedId = item.id;
                }
                treeForSelector.fire('add', { items: [item] });
            }
            else {
                treeForSelector.fire('delete', { items: [item] });
            }
        }

        TreeForSelector.prototype.type = 'TreeForSelector';

        TreeForSelector.prototype.initOptions = function (options) {
            var properties = {
                hasIcon: true,
                // 数据源 [{ name: xxx, id: xxx }] 
                datasource: {},
                // 搜索为空的提示
                emptyText: '没有相应的搜索结果',
                // 单选或多选
                multi: false,
                // 选择器类型 'load', 'add', 'delete'
                // load: 点击某个节点，加载  出一堆别的数据，主要用于样式区分
                // add: 点击一个节点，把这个节点加到另一个容器里
                // delete: 点击一个节点，删
                mode: 'add',
                orientExpand: false,
                holdState: false
            };

            if (options.multi === 'false') {
                options.multi = false;
            }

            if (options.holdState === 'false') {
                options.holdState = false;
            }

            lib.extend(properties, options);
            this.setProperties(properties);
        };


        TreeForSelector.prototype.initStructure = function () {
            var tpl =  [
                // 结果为空提示
                '<div data-ui="type:Label;childName:emptyText"',
                ' class="${emptyTextClass}">${emptyText}</div>',
                // 结果列表
                '<div data-ui="type:Panel;childName:queryList"',
                ' class="${queryListClass}">',
                '</div>'
            ];

            var getClass = helper.getPartClasses;
            this.main.innerHTML = lib.format(
                tpl.join('\n'),
                {
                    emptyTextClass: getClass(this, 'empty-text').join(' '),
                    emptyText: this.emptyText,
                    queryListClass: getClass(this, 'query-list').join(' ')
                }
            );

            this.initChildren(this.main);

            if (this.mode === 'load') {
                this.addState('load');
            }
            else if (this.mode === 'add') {
                this.addState('add');
            }
            else {
                this.addState('del');
            }
        };

        /**
         * 手动刷新
         * 
         * @param {ui.TreeForSelector} treeForSelector 类实例
         * @inner
         */
        function refresh(treeForSelector) {
            // 创建树可以使用的数据
            treeForSelector.treeData = treeForSelector.datasource;
            // 创建一个全集扁平索引
            buildFullDataIndex(treeForSelector);
            // 有的时候需要保留搜索状态
            var isQuery = treeForSelector.hasState('queried');
            if (treeForSelector.holdState && isQuery) {
                // 获取关键字
                treeForSelector.queryItem(treeForSelector.currentKeyword);
            }
            else {
                // 重建table
                generateTable(treeForSelector, treeForSelector.treeData);
            }
        }

        function buildFullDataIndex(control) {
            var datasource = control.datasource;
            var dataIndex = {};
            walkTree(datasource.children, function (child) {
                dataIndex[child.id] = child;
            });
            control.dataIndex = dataIndex;
        }

        /**
         * 重新渲染视图
         * 仅当生命周期处于RENDER时，该方法才重新渲染
         *
         * @param {Array=} 变更过的属性的集合
         * @override
         */
        TreeForSelector.prototype.repaint = helper.createRepaint(
            Control.prototype.repaint,
            {
                name: 'datasource',
                paint: refresh
            }
        );

        /**
         * 获取指定状态的叶子节点，递归
         * 
         * @param {ui.TreeForSelector} treeForSelector 类实例
         * @param {Array=} data 检测的数据源
         * @param {boolean} isSelected 选择状态还是未选状态
         * @inner
         */
        TreeForSelector.prototype.getLeafItems = function (data, isSelected) {
            var leafItems = [];
            var me = this;
            u.each(data, function (item) {
                if (isLeaf(item)) {
                    var valid = (isSelected === item.isSelected);
                    if (me.mode === 'delete' || valid) {
                        leafItems.push(item);
                    }
                }
                else {
                    leafItems = u.union(
                        leafItems,
                        me.getLeafItems(item.children, isSelected)
                    );
                }
            });

            return leafItems;
        };

        /**
         * 或许当前已选择的数据
         *
         * @return {Object}
         * @public
         */
        TreeForSelector.prototype.getSelectedItems = function () {
            var data = this.treeData.children;
            return this.getLeafItems(data, true);
        };

        /**
         * 清空搜索的结果
         * 
         */
        TreeForSelector.prototype.clearQuery = function() {
            // 消除搜索状态
            this.removeState('queried');
            // 清空数据
            this.filteredTreeData = {};
            this.currentKeyword = null;
            // 用全集数据生成table
            generateTable(this, this.treeData);
        };

        /**
         * 搜索含有关键字的结果
         * 
         * @param {ui.TreeForSelector} treeForSelector 类实例
         * @param {String} keyword 关键字
         * @return {Array} 结果集
         */
        TreeForSelector.prototype.queryItem = function (keyword) {
            // 保留一下关键字，用在之后刷新列表数据状态，但是保留搜索状态时使用
            this.currentKeyword = keyword;
            var filteredTreeData = [];
            filteredTreeData = queryFromNode(keyword, this.treeData);
            // 更新状态
            this.filteredTreeData = {
                id: '-1', text: '符合条件的结果', children: filteredTreeData
            };
            this.addState('queried');
            generateTable(this, this.filteredTreeData);
        };

        /**
         * 供递归调用的搜索方法
         * 
         * @param {String} keyword 关键字
         * @param {Object} node 节点对象
         * @return {Array} 结果集
         */
        function queryFromNode(keyword, node) {
            var filteredTreeData = [];
            var treeData = node.children;
            u.each(
                treeData,
                function (data, key) {
                    var filteredData;
                    // 命中，先保存副本
                    if (data.text.indexOf(keyword) !== -1) {
                        filteredData = u.clone(data);
                    }
                    // 如果子节点也有符合条件的，那么只把符合条件的子结点放进去
                    if (data.children && data.children.length) {
                        var filteredChildren = queryFromNode(keyword, data);
                        if (filteredChildren.length > 0) {
                            if (!filteredData) {
                                filteredData = u.clone(data);
                            }
                            filteredData.children = filteredChildren;
                        }
                    }

                    if (filteredData) {
                        filteredTreeData.push(filteredData);
                    }
                }
            );
            return filteredTreeData;
        }

        /**
         * 一个遍历树的方法
         * 
         * @param {Array} children 需要遍历的树的孩子节点
         * @param {Function} callback 遍历时执行的函数
         * @inner
         */
        function walkTree(children, callback) {
            u.each(
                children,
                function (child, key) {
                    callback(child);
                    walkTree(child.children, callback);
                }
            );
        }

        /**
         * 选择状态更新
         * 
         * @param {ui.Tree} tree 类实例
         * @param {Array} nodes 待选节点
         * @inner
         */
        function updateSelectedState(tree, nodes) {
            walkTree(nodes, function (child) {
                if (child.isSelected) {
                    tree.selectNode(child.id, true);
                }
            });
        }

        function isLeaf(node) {
            return !node.children;
        }

        function getLeavesCount(node) {
            // 是叶子节点，但不是root节点
            if (isLeaf(node)) {
                // FIXME: 这里感觉不应该hardcode，后期想想办法
                if (!node.id || node.id === '-1' || node.id === '0' ) {
                    return 0;
                }
                return 1;
            }
            var count = u.reduce(
                node.children,
                function (sum, child) {
                    return sum + getLeavesCount(child);
                },
                0
            );
            return count;
        }

        /**
         * 获取当前列表的结果个数
         *
         * @return {number}
         * @public
         */
        TreeForSelector.prototype.getFilteredItemsCount = function () {
            var isQuery = this.hasState('queried');
            var node = isQuery ? this.filteredTreeData : this.treeData;
            var count = getLeavesCount(node);
            return count;
        };

        /**
         * 批量选择或取消选择
         *
         * @param {Array} nodes 要改变状态的节点集合
         * @param {boolean} isSelect 目标状态 true是选择，false是取消
         * @public
         */
        TreeForSelector.prototype.batchUpdateState =
            function (nodes, isSelected) {
                var tree = this.getChild('queryList').getChild('treeList'); 
                u.each(
                    nodes,
                    function (node) {
                        var nodeObj = tree.nodeIndex[node];
                        if (isSelected) {
                            nodeObj.isSelected = true;
                            tree.selectNode(node, true);
                        }
                        else {
                            nodeObj.isSelected = false;
                            tree.unselectNode(node, true);
                        }
                    }
                );
            };

        /**
         * 删除全部
         *
         * @public
         */
        TreeForSelector.prototype.deleteAll = function () {
            this.fire('delete', { items: this.treeData.children });
        };

        /**
         * 添加全部
         *
         * @public
         */
        TreeForSelector.prototype.selectAll = function () {
            var data = this.treeData.children;
            var items = this.getLeafItems(data, false);
            u.each(
                items,
                function (item) {
                    item.isSelected = true;
                }
            );
            this.fire('add', { items: items });
        };

        require('esui').register(TreeForSelector);
        return TreeForSelector;
    }
);