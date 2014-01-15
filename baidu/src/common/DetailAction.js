/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 详情页Action基类
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var util = require('er/util');
        var u = require('underscore');
        var BaseAction = require('common/BaseAction');

        /**
         * 频道列表
         *
         * @param {string=} entityName 负责的实体名称
         * @constructor
         * @extends common/BaseAction
         */
        function DetailAction(entityName) {
            BaseAction.apply(this, arguments);
            this.entityName = entityName;
        }

        util.inherits(DetailAction, BaseAction);

        DetailAction.prototype.modelType = './DetailModel';

        /**
         * 列表搜索
         */
        function search(e) {
            // 禁止子Action自己跳转
            e.preventDefault();

            var args = {
                tab: this.model.get('tab'),
                id: this.model.get('id')
            };
            // 所有列表参数加上`list.`前缀
            u.each(
                e.args,
                function (value, key) {
                    args['list.' + key] = value;
                }
            );
            args = u.purify(args);
            var path = this.model.get('url').getPath();
            var URL = require('er/URL');
            var url = URL.withQuery(path, args);
            this.redirect(url, { force: true });
        }

        /**
         * 根据侧边栏导航树选中的项目进行跳转
         *
         * @param {Object} e 事件对象
         * @parma {Object} e.node 选中的节点
         */
        function redirectToItem(e) {
            var node = e.node;
            var id = node.id.split('-').pop();
            var url = node.href
                ? node.href
                : '/' + node.type + '/detail~id=' + id;
            this.redirect(url);
        }

        /**
         * 对左侧导航树进行检索
         *
         * @param {Object} e 事件对象
         * @param {string} e.keyword 检索的关键词
         */
        function searchTree(e) {
            var filterTree = require('common/util/filterTree');
            var tree = this.model.get('treeDatasource');
            if (e.keyword) {
                tree = u.deepClone(tree);
                // 保留第1个“全部xxx”
                var all = tree.children[0];
                tree = filterTree.byKeyword(tree, e.keyword);
                if (all && all.id === 'all') {
                    tree.children.unshift(all);
                }
            }

            this.model.set('treeKeyword', e.keyword);
            this.model.set('filteredTreeDatasource', tree);
            this.view.refreshTree();
        }

        /**
         * 初始化交互行为
         *
         * @override
         */
        DetailAction.prototype.initBehavior = function () {
            BaseAction.prototype.initBehavior.apply(this, arguments);

            this.view.on('search', search, this);
            this.view.on('selectitem', redirectToItem, this);
            this.view.on('searchtree', searchTree, this);
        };
        
        return DetailAction;
    }
);
