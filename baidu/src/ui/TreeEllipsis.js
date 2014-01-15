/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 树形省略显示
 * 自吐槽：这个控件有一个坑爹的限制，就是树的各节点的深度都是一致的，
 * 因为需求要求把最后一级的节点都横向展示，以'、'分割
 * @author lixiang(lixiang05@baidu.com)
 * @date $DATE$
 */

define(
    function (require) {
        var u = require('underscore');
        var lib = require('esui/lib');
        var helper = require('esui/controlHelper');

        var Ellipsis = require('ui/Ellipsis');

        /**
         * 控件类
         * 
         * @constructor
         * @param {Object} options 初始化参数
         */
        function TreeEllipsis(options) {
            Ellipsis.apply(this, arguments);
        }

        lib.inherits(TreeEllipsis, Ellipsis);

        TreeEllipsis.prototype.type = 'TreeEllipsis';
        TreeEllipsis.prototype.styleType = 'Ellipsis';

        TreeEllipsis.prototype.initStructure = function () {
            Ellipsis.prototype.initStructure.apply(this);
            lib.addClass(this.main, 'ui-treeellipsis');
        };

        /**
         * 重新渲染视图
         * 仅当生命周期处于RENDER时，该方法才重新渲染
         *
         * @param {Array=} 变更过的属性的集合
         * @override
         */
        TreeEllipsis.prototype.repaint = helper.createRepaint(
            {
                name: 'datasource',
                paint: ellipse
            }
        );

        /**
         * 判断是不是叶子节点
         *
         * @param {Object=} node 节点数据对象
         * @inner
         * @return {boolean}
         */
        function isLeaf(node) {
            return !node.children || !node.children.length;
        }

        /**
         * 获取所有的叶子节点
         *
         * @param {Object=} node 节点数据对象
         * @inner
         * @return {Array=}
         */
        function getLeaves(node) {
            var leaves = [];

            if (isLeaf(node)) {
                leaves.push(node);
            }
            else {
                u.each(node.children, function (child, index) {
                    leaves = leaves.concat(getLeaves(child));
                });
            }
            return leaves;
        }

        /**
         * 构建树
         *
         * @param {ui.TreeEllipsis} treeEllipsis 类实例
         * @param {Array=} 节点集合
         * @inner
         * @return {Object}
         *   html: 树html
         *   contentClass: 节点的样式，分为叶子节点和非叶子节点
         */
        function generateTree(treeEllipsis, children) {
            var html = [];
            var contentClass;
            u.each(children, function (node, index) {
                var isLastNode = (index === children.length - 1);
                var nodeResult = generateNode(treeEllipsis, node, isLastNode);
                html.push(nodeResult.html);
                contentClass = nodeResult.contentClass;
            });
            return {
                html: html.join('\n'),
                contentClass: contentClass
            };
        }

        /**
         * 每个节点显示的内容的模板
         *
         * @type {string}
         * @public
         */
        TreeEllipsis.prototype.nodeTpl = [
            '<div class="${nodeClassName}">',
                '<div class="${titleClassName}">${title}</div>',
                '<div class="${contentClassName}">${content}</div>',
            '</div>'
        ].join('\n');

        /**
         * 生成节点
         *
         * @param {ui.TreeEllipsis} treeEllipsis 类实例
         * @param {Object} node 节点数据
         * @param {boolean} isLastNode 是否是最后一个节点
         * @return {Object}
         *   html: 树html
         *   contentClass: 节点的样式，分为叶子节点和非叶子节点
         * @inner
         */
        function generateNode(treeEllipsis, node, isLastNode) {
            if (isLeaf(node)) {
                return {
                    html: lib.encodeHTML(node.text) + (isLastNode ? '' : '、'),
                    contentClass: 'leaf-node-content'
                };
            }
            var treeResult = generateTree(treeEllipsis, node.children);
            var contentClassName =
                helper.getPartClasses(treeEllipsis, treeResult.contentClass);
            var html = lib.format(
                treeEllipsis.nodeTpl,
                {   
                    nodeClassName: helper.getPartClasses(treeEllipsis, 'node'),
                    titleClassName:
                        helper.getPartClasses(treeEllipsis, 'node-title'),
                    title: lib.encodeHTML(node.text) + '：',
                    contentClassName: contentClassName,
                    content: treeResult.html
                }
            );
            return { html: html, contentClass: 'node-content' };
        }

        /**
         * 树截断
         * 
         * @param {ui.TreeEllipsis} treeEllipsis 控件实例
         * @param {Array} datasource 数据源
         * @inner
         */
        function ellipse(treeEllipsis, datasource) {
            // 先清空下状态
            treeEllipsis.removeState('static');

            if (!datasource) {
                return;
            }

            var generalInfo = lib.g(helper.getId(treeEllipsis, 'general-info'));
            var dataLength = datasource.length;
            // 没有数据，只展示空提示
            if (!dataLength) {
                treeEllipsis.addState('static');
                generalInfo.innerHTML = lib.encodeHTML(treeEllipsis.emptyText);
                return;
            }

            // 叶子节点才是有效计数单位
            var leaves = [];
            u.each(datasource, function (node) {
                leaves = leaves.concat(getLeaves(node));
            });

            var soOn = '等' + leaves.length + '个' + treeEllipsis.tail;

            // 实际长度比规定长度小，没有“等”
            if (treeEllipsis.maxLength > leaves.length) {
                soOn = '';
            }
            
            var detailInfo = lib.g(helper.getId(treeEllipsis, 'detail-info'));
            var tree = generateTree(treeEllipsis, datasource);
            detailInfo.innerHTML = tree.html;

            var ellipsisLeaves = leaves.slice(0, treeEllipsis.maxLength);
            ellipsisLeaves = u.map(ellipsisLeaves, function (leaf) {
                return leaf.text;
            });
            generalInfo.innerHTML =
                lib.encodeHTML(ellipsisLeaves.join('、')) + soOn;
        }

        require('esui').register(TreeEllipsis);
        return TreeEllipsis;
    }
);
