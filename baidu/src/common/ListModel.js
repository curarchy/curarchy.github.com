/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 列表数据模型基类
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var BaseModel = require('common/BaseModel');
        var util = require('er/util');
        var u = require('underscore');

        /**
         * 频道列表数据模型类
         *
         * @param {string} entityName 负责的实体名称
         * @param {Object=} context 用于初始化的数据
         * @constructor
         * @extends common/BaseModel
         */
        function ListModel(entityName, context) {
            BaseModel.apply(this, arguments);
        }

        util.inherits(ListModel, BaseModel);

        /**
         * 状态迁移表。
         * 
         * 状态迁移每一项饱含以下3个属性：
         * 
         * - `status`表示目标状态
         * - `deny`表示不能从其指定的状态进行迁移
         * - `accept`表示仅能从其指定的状态进行迁移
         *
         * 如果`accept`和`deny`同时存在，则使用`accept`与`deny`的差集
         *
         * @type {Object[]}
         */
        ListModel.prototype.statusTransitions = [
            { status: 0, deny: [0] },
            { status: 1, deny: [1] }
        ];

        var user = require('common/global/user');
        ListModel.prototype.defaultDatasource = {
            list: [
                {
                    retrieve: function (model) {
                        var query = model.getQuery();
                        query = u.purify(query, null, true);

                        return model.search(query);
                    },
                    dump: true
                },
                {
                    name: 'hasResult',
                    retrieve: function (model) {
                        // 有返回内容，或者有查询参数的情况下，认为是有内容的
                        return model.get('results').length
                            || !u.isEmpty(model.get('url').getQuery());
                    }
                }
            ],

            pageSize: function () {
                return user.pageSize;
            },
            
            // 分页URL模板，就是当前URL中把`page`字段替换掉
            urlTemplate: function (model) {
                var url = model.get('url');
                var path = url.getPath();
                // 由于`withQuery`会做URL编码，因此不能直接`query.page = '${page}'`，
                // 会被编码成`%24%7Bpage%7D`，此处只能直接操作字符串
                var query = url.getQuery();
                delete query.page;
                var template = '#' + require('er/URL').withQuery(path, query);
                var delimiter = u.isEmpty(query) ? '~' : '&';
                template += delimiter + 'page=${page}';
                return template;
            },

            //清除搜索选项的html
            listWithoutKeywordURL: function(model) {
                var url = model.get('url');
                var path = url.getPath();
                var query = url.getQuery();
                query = u.omit(query, 'keyword');
                var template = '#' + require('er/URL').withQuery(path, query);
                return template;
            }
        };

        /**
         * 处理后续和UI有关的数据
         */
        function processUIData() {
            var canBatchModify = this.get('canBatchModify');
            this.set('selectMode', canBatchModify ? 'multi' : '');
        }

        /**
         * 加载数据
         *
         * @return {er/Promise}
         * @override
         */
        ListModel.prototype.load = function () {
            return BaseModel.prototype.load.apply(this, arguments)
                .then(u.bind(processUIData, this));
        };
        
        /**
         * 获取请求后端时的查询参数
         *
         * @return {Object}
         */
        ListModel.prototype.getQuery = function () {
            var query = {
                keyword: this.get('keyword'),
                status: this.get('status'),
                order: this.get('order'),
                orderBy: this.get('orderBy'),
                pageNo: this.get('page') || 1
            };
            return query;
        };

        /**
         * 检查单个实体是否可以切换至目标状态
         *
         * @param {number} targetStatus 目标状态
         * @param {Object} entity 单个实体
         * @param {number} entity.status 实体的当前状态
         * @return boolean
         */
        function checkStatusTransition(targetStatus, entity) {
            var config = u.findWhere(
                this.statusTransitions,
                { status: targetStatus }
            );

            if (config.accept) {
                var accept = u.difference(config.accept, config.deny || []);
                return u.contains(accept, entity.status);
            }
            else if (config.deny) {
                return !u.contains(config.deny, entity.status);
            }
            else {
                return true;
            }
        }

        /**
         * 判断已经选择数据判断可以启用批量控件
         *
         * @param {Object[]} items table已经选择列的数据
         * @param {number} status 修改的目标状态
         */
        ListModel.prototype.canUpdateToStatus = function (items, status) {
            return u.any(items, u.bind(checkStatusTransition, this, status));
        };

        require('er/ajax').register(
            ListModel,
            'global/pageSize',
            {
                scope: 'global',
                policy: 'abort'
            }
        );

        /**
         * 更新全局每页显示条数
         *
         * @param {number} pageSize 每页显示条数
         * @return {er/Promise}
         */
        ListModel.prototype.updatePageSize = function (pageSize) {
            // TODO: 不仅仅`ListModel`需要修改页大小，考虑一下如何复用
            var updating = this.data.request(
                'global/pageSize',
                { pageSize: pageSize },
                {
                    method: 'PUT',
                    url: '/users/current/pageSize'
                }
            );
            return updating.then(function () { user.setPageSize(pageSize); });
        };

        /**
         * 根据id获取列表中的对象
         *
         * @param {string | number} id 元素的id
         * @return {Object | null}
         */
        ListModel.prototype.getItemById = function (id) {
            var list = this.get('results');

            return list ? u.findWhere(list, { id: id }) : null;
        };

        /**
         * 获取元素（或指定id的元素）在列表中的下标
         *
         * @param {Object | string | number} item 要查找的元素或其id
         * @return {number} 无查找结果则返回`-1`
         */
        ListModel.prototype.findIndex = function (item) {
            var list = this.get('results');

            if (!list) {
                return -1;
            }

            if (typeof item === 'object') {
                return u.indexOf(list, item);
            }
            else {
                for (var i = 0; i < list.length; i++) {
                    if (list[i].id === item) {
                        return i;
                    }
                }
            }
        };
        
        return ListModel;
    }
);
