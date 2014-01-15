/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 过滤树节点工具模块
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var u = require('underscore');
        var exports = {};

        function filterNode (filter, node) {
            // 过滤的条件是自身符合`filter`，或子节点有任意一个能通过过滤（递归）
            if (node.children) {
                node.children = u.filter(
                    node.children, 
                    u.partial(filterNode, filter)
                );
            }

            if ((node.children && node.children.length) || filter(node)) {
                return node;
            }

            return null;
        }

        exports.byFunction = function (tree, filter) {
            var result = filterNode(filter, tree);
            if (!result) {
                result = u.omit(tree, 'children');
                result.children = [];
            }
            return result;
        };

        exports.byKeyword = function (tree, keyword) {
            var filter = function (node) {
                return node.text.indexOf(keyword) >= 0;
            };
            return exports.byFunction(tree, filter);
        };

        return exports;
    }
);        
