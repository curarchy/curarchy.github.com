/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 广告位树控件
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var lib = require('esui/lib');
        var u = require('underscore');
        var Tree = require('esui/Tree');
        var TreeStrategy = require('esui/TreeStrategy');

        // `LinkTree`是业务上对`Tree`控件的封装，用于展现一个每个节点都是链接的树。
        // 
        // 本控件显示内容大致如下（以频道分组-频道为例）：
        // 
        //     + 默认频道
        //     + 频道分组1
        //     - 频道分组2
        //         + 频道21
        //         + 频道22
        //         + 频道23
        //         + ...频道分组下所有频道
        //     + 频道分组3
        //     + ...所有频道分组
        //     + 频道1
        //     + 频道2
        //     + 频道3
        //     + ...所有频道
        // 
        // 其中除“默认频道”外，其它所有节点均为一个`<a>`元素，点击跳转到对应类型详情页
        // 
        // `LinkTree`对数据结构有特殊要求，要求如下：
        // 
        // - 除根节点和“默认频道”节点外，所有节点要有`type`属性，
        // `type`将用于获取节点指向的链接地址，没有`type`将展现为文字节点，
        // - 对于有父对象的节点，要有`parent`属性，值为父对象的节点id（非业务id）
        // 
        // 一个典型的数据结构见本文件最后。

        /**
         * 广告位树，提供一个频道分组 - 频道 - 广告位的树型结构
         *
         * @param {Object=} options 初始化参数
         * @extends esui/Tree
         * @constructor
         * @public
         */
        function LinkTree(options) {
            Tree.apply(this, arguments);
        }

        lib.inherits(LinkTree, Tree);

        LinkTree.prototype.type = 'LinkTree';

        LinkTree.prototype.styleType = 'Tree';

        /**
         * 初始化参数
         *
         * @param {Object=} options 构造函数传入的参数
         * @override
         * @protected
         */
        LinkTree.prototype.initOptions = function (options) {
            var properties = {
                hideRoot: true,
                strategy: new TreeStrategy()
            };
            u.extend(properties, options);

            properties.strategy.isLeafNode = function (node) {
                return !!node.isLeafLevel;
            };

            Tree.prototype.initOptions.call(this, properties);
        };

        LinkTree.prototype.widgetTemplate = '<span data-widget="${name}" '
            + 'class="${classes}" title="${text}">${text}</span>';

        LinkTree.prototype.linkWidgetTemplate = '<a data-widget="${name}" '
            + 'class="${classes}" href="${href}" title="${text}">${text}</a>';

        LinkTree.prototype.getWidgetHTML = function (widget) {
            var classes = []
                .concat(this.helper.getPartClasses('widget'))
                .concat(this.helper.getPartClasses('widget-' + widget.name));
            var data = {
                name: u.escape(widget.name),
                text: u.escape(widget.text),
                classes: classes.join(' '),
                href: widget.href ? u.escape(widget.href) : ''
            };

            var template = widget.href
                ? this.linkWidgetTemplate
                : this.widgetTemplate;
            return lib.format(template, data);
        };

        function getWidgetContainerHTML(tree) {
            if (!tree.widgets || !tree.widgets.length) {
                return '';
            }

            var classes = tree.helper.getPartClassName('widget-container');
            var html = '<aside '
                + 'id="' 
                + tree.helper.getId('widget-container') + '" '
                + 'class="' + classes + '">';
            for (var i = 0; i < tree.widgets.length; i++) {
                html += tree.getWidgetHTML(tree.widgets[i]);
            }
            html += '</aside>';

            return html;
        }

        LinkTree.prototype.getItemHTML = function (node) {
            var keyword = this.get('keyword')
                ? u.escape(this.get('keyword'))
                : '';
            var text = u.escape(node.text);
            if (keyword) {
                text = text.replace(
                    new RegExp(keyword, 'g'),
                    function (word) {
                        return '<b>' + word + '</b>';
                    }
                );
            }

            var emptyClass = node.isLeafLevel
                ? ''
                : ((node.children && node.children.length) ? '' : 'empty-node');
            // `title`里的要用未高亮关键字的那份
            var html = '<span title="' + node.text + '"'
                + (emptyClass ? ' class="' + emptyClass + '"' : '')
                + '>'
                + text
                + '</span>';

            if (node.id === 'all') {
                html += getWidgetContainerHTML(this);
            }

            return html;
        };

        LinkTree.prototype.clickNode = function (e) {
            if (this.helper.isPart(e.target, 'widget')) {
                var widgetName = lib.getAttribute(e.target, 'data-widget');
                for (var i = 0; i < this.widgets.length; i++) {
                    var widget = this.widgets[i];
                    if (widget.name === widgetName) {
                        this.fire(
                            'runwidget',
                            { name: widgetName, widget: widget }
                        );
                    }
                }
            }
            else {
                Tree.prototype.clickNode.apply(this, arguments);
            }
        };

        /**
         * 渲染自身
         *
         * @override
         * @protected
         */
        LinkTree.prototype.repaint = require('esui/painters').createRepaint(
            Tree.prototype.repaint,
            {
                // 当前选中的节点id，
                // 不使用`selectedNode`是因为`Tree`有个属性叫`selectedNodes`
                name: 'activeNode',
                paint: function (tree, activeNode) {
                    tree.selectNode(activeNode);
                }
            },
            {
                // 有搜索词时展开全部一级节点
                name: 'keyword',
                paint: function (tree, keyword) {
                    if (keyword) {
                        u.each(
                            tree.datasource.children,
                            function (node) {
                                this.expandNode(node.id);
                            },
                            tree
                        );
                    }
                }
            }
        );

        LinkTree.prototype.selectNode = function (id) {
            var node = this.nodeIndex[id];

            if (!node) {
                return;
            }

            // 为了能显示出选中状态，需要从上到下展开所有父节点。
            // 最后一个节点是叶子，所以不需要把它的id加进路径中
            var path = [node.id];
            while (node.parent) {
                node = this.nodeIndex[node.parent];
                path.push(node.id);
            }

            while (path.length) {
                var currentId = path.pop();

                var currentNodeElement =
                    lib.g(this.helper.getId('node-' + currentId));
                if (!currentNodeElement 
                    || this.helper.isPart(currentNodeElement, 'node-expanded')
                ) {
                    break;
                }
                var currentNode = this.nodeIndex[currentId];
                this.expandNode(currentId, currentNode.children);
            }

            Tree.prototype.selectNode.call(this, id);
        };

        require('esui').register(LinkTree);
        return LinkTree;
    }
);

// 典型数据结构：
//     {
//         id: 'root',
//         text: '所有内容',
//         children: [
//             {
//                 id: 'channel-0',
//                 text: '默认频道'
//             },
//             {
//                 id: 'channel-group-1',
//                 text: '频道分组1',
//                 type: 'channelGroup',
//                 children: [
//                     {
//                         id: 'channel-11',
//                         text: '频道11',
//                         type: 'channel',
//                         parent: 'channel-group-1'
//                     },
//                     {
//                         id: 'channel-12',
//                         text: '频道12',
//                         type: 'channel',
//                         parent: 'channel-group-1'
//                     }
//                 ]
//             },
//             {
//                 id: 'channel-2',
//                 text: '频道2',
//                 type: 'channel'
//             }
//         ]
//     }
