/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 数据类基类
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */

define(
    function (require) {
        var u = require('underscore');
        var util = require('er/util');

        /**
         * 数据类基类
         *
         * @param {string=} entityName 该数据类管理的主要实体的类型名称
         * @param {string=} backendEntityName 后端的实体名称，默认与`entityName`相同
         *
         * @constructor
         */
        function BaseData(entityName, backendEntityName) {
            this.entityName = entityName;
            this.backendEntityName = backendEntityName;

            this.runningRequests = {};
        }

        /**
         * 获取当前数据类负责的实体名称
         *
         * @return {string}
         */
        BaseData.prototype.getEntityName = function () {
            return this.entityName || '';
        };

        /**
         * 获取当前数据类负责的后端实体名称
         *
         * @return {string}
         */
        BaseData.prototype.getBackendEntityName = function () {
            return this.backendEntityName || this.getEntityName();
        };

        var ajax = require('er/ajax');

        var globalRequestConfig = {};
        var globalRunningRequests = {};

        /**
         * 注册一个请求配置
         *
         * @param {Data} 提供配置的`Data`类型对象
         * @param {string} name 配置名称
         * @param {Object} config 配置项
         * @param {string} config.scope 配置的作用域，
         * 可为`instance`或`global`，默认为`instance`
         * @param {string} config.policy 多个同名请求发生时的处理策略，
         * 可为`abort`、`reuse`、`parallel`或`auto`，默认为`auto`
         * @param {Object=} config.options 发起请求时使用的配置项，
         * 具体的内容参考`er/ajax.request`
         * @return {FakeXHR}
         */
        ajax.register = function (Data, name, config) {
            var defaults = {
                name: name,
                scope: 'instance',
                policy: 'auto'
            };
            config = util.mix(defaults, config);

            if (config.scope === 'instance') {
                var configContainer = Data.prototype.requestConfig;
                if (!configContainer) {
                    configContainer = Data.prototype.requestConfig = {};
                }

                if (configContainer.hasOwnProperty(name)) {
                    throw new Error(
                        'An instance request config "' + name + '" '
                        + 'has already registered'
                    );
                }
                configContainer[name] = config;
            }
            else {
                if (globalRequestConfig.hasOwnProperty(name)) {
                    throw new Error(
                        'A global request config "' + name + '" '
                        + 'has already registered'
                    );
                }

                globalRequestConfig[name] = config;
            }
        };

        /**
         * 查找请求对应的预注册的配置项
         *
         * @param {BaseData} data 实例
         * @param {string} name 请求名称
         * @return {Object | undefined}
         */ 
        function lookupRequestConfig(data, name) {
            if (!name) {
                return null;
            }
            return (data.requestConfig && data.requestConfig[name])
                || globalRequestConfig[name];
        }

        /**
         * 处理多个同名请求同时出现的情况
         *
         * @param {BaseData} data 实例
         * @param {Object} config 请求预先注册的配置项
         * @param {Object} options 本次请求的相关参数
         * @return {FakeXHR | undefined}
         */
        function resolveConflict(data, config, options) {
            var runningRequest = data.runningRequests[config.name];
            if (!runningRequest) {
                return;
            }

            var policy = config.policy;
            if (policy === 'auto') {
                // `auto`模式的策略：
                // 
                // 1. 如果请求的配置/参数均没有变化，则重用前一个请求
                // 2. 如果有变化：
                //     1. 如果是GET或PUT请求，则并行加载
                //     2. 如果是POST等非幂等的请求，则中断前一个
                var method = options.method.toUpperCase();
                policy = u.isEqual(options, runningRequest.options)
                    ? 'reuse'
                    : (
                        (method === 'GET' || method === 'PUT') 
                        ? 'parallel' 
                        : 'abort'
                    );
            }

            switch (policy) {
                case 'reuse':
                    return runningRequest.xhr;
                case 'abort':
                    runningRequest.xhr.abort();
                    return;
                default:
                    return;
            }
        }

        /**
         * 在XHR完成后，将之从当前运行的XHR列表中移除
         *
         * @param {BaseData} data 实例
         * @param {string} name 请求名称
         * @param {FakeXHR} xhr 负责请求的`FakeXHR`对象
         */
        function detachRunningRequest(data, name, xhr) {
            if (data.runningRequests 
                && data.runningRequests[name]
                && data.runningRequests[name].xhr === xhr
            ) {
                data.runningRequests[name] = null;
            }
            if (globalRunningRequests
                && globalRunningRequests[name]
                && globalRunningRequests[name].xhr === xhr
            ) {
                globalRunningRequests[name] = null;
            }
        }

        /**
         * 发起一个AJAX请求
         * 
         * 重载方式：
         * 
         * - `.request(name, data, options)`
         * - `.request(name, data)`
         * - `.request(name)`
         * - `.request(options, data)`
         * - `.request(options)`
         *
         * @param {string=} 请求名称
         * @param {Object=} data 请求数据
         * @param {Object=} options 请求配置项
         * @return {FakeXHR}
         */
        BaseData.prototype.request = function (name, data, options) {
            if (typeof name !== 'string') {
                options = name;
                name = null;
            }

            // 名称中可以有`$entity`作为占位，此时将其格式化
            name = name.replace(/\$entity/g, this.getEntityName());

            var config = lookupRequestConfig(this, name);

            options = util.mix({}, config && config.options, options);
            if (typeof data === 'function') {
                data = data(this, options);
            }
            if (typeof options.data === 'function') {
                options.data = options.data(this, options);
            }
            if (data) {
                options.data = util.mix({}, options.data, data);
            }

            if (!options.dataType) {
                options.dataType = 'json';
            }

            // URL中可以有`$entity`作为占位，此时将其格式化
            options.url = options.url.replace(
                /\$entity/g,
                u.pluralize(this.getBackendEntityName())
            );

            // 所有前端接口，除登录用的几个外，和几个静态资源外，
            // 除非特别设置urlPrefix值，否则全部以`/api/js`作为前缀，
            // 登录的几个接口不会使用`Data`发起，因此这边对所有未设置
            // urlPrefix的请求统一加前缀
            var defaultPrefix = options.urlPrefix || '/api/js';
            if (options.url && options.url.indexOf(defaultPrefix !== 0)) {
                options.url = defaultPrefix + options.url;
            }

            if (!config) {
                return ajax.request(options);
            }

            var xhr = resolveConflict(this, config, options);
            if (!xhr) {
                xhr = ajax.request(options);
                if (name) {
                    // 根据管理的级别，把未完成的请求放到合适的容器里保留
                    var runningRequests = config.scope === 'instance'
                        ? this.runningRequests
                        : globalRunningRequests;
                    // 由于`options`是在`auto`模式下决定策略用的，所以也要保留起来
                    runningRequests[name] = {
                        options: options,
                        xhr: xhr
                    };
                    // 有时候一个请求中带的数据会很大，因此要尽早让请求对象可回收，
                    // 所以无论请求失败还是成功，统一进行一次移除操作
                    xhr.ensure(
                        u.partial(detachRunningRequest, this, name, xhr)
                    );
                }
            }
            return xhr;
        };

        // 以下是常用数据操作方法，这些方法的前提是有按以下规则注册相关请求：
        // 
        // - 查询：/{entities}/search
        // - 列表：/{entities}/list
        // - 保存：/{entities}/save
        // - 更新：/{entities}/update
        // - 删除：/{entities}/remove
        // - 恢复：/{entities}/restore
        // 
        // 注册配置时可以不写明`url`和`method`，但依旧建议写上，当作文档看，
        // 如果没注册，也可正常使用，但无法使用AJAX管理机制

        /**
         * 检索一个实体列表
         *
         * @param {Object} query 查询参数
         * @return {FakeXHR}
         */
        BaseData.prototype.search = function (query) {
            return this.request(
                '$entity/search', 
                query,
                {
                    method: 'GET',
                    url: '/$entity'
                }
            );
        };

        /**
         * 获取一个实体列表（不分页）
         *
         * @param {Object} query 查询参数
         * @return {FakeXHR}
         */
        BaseData.prototype.list = function (query) {
            return this.request(
                '$entity/list', 
                query,
                {
                    method: 'GET',
                    url: '/$entity/list'
                }
            );
        };

        /**
         * 保存一个实体
         *
         * @param {Object} entity 实体对象
         * @return {FakeXHR}
         */
        BaseData.prototype.save = function (entity) {
            return this.request(
                '$entity/save', 
                entity,
                {
                    method: 'POST',
                    url: '/$entity'
                }
            );
        };

        /**
         * 更新一个实体
         *
         * @param {Object} entity 实体对象
         * @return {FakeXHR}
         */
        BaseData.prototype.update = function (entity) {
            return this.request(
                '$entity/update', 
                entity,
                {
                    method: 'PUT',
                    url: '/$entity/' + entity.id
                }
            );
        };

        /**
         * 批量更新一个或多个实体的状态
         *
         * @param {string} action 操作名称
         * @param {number} status 目标状态
         * @param {Array.<string>} idx id集合
         * @return {FakeXHR}
         */
        BaseData.prototype.updateStatus = function (action, status, idx) {
            return this.request(
                '$entity/' + action,
                {
                    ids: idx,
                    status: status
                },
                {
                    method: 'POST',
                    url: '/$entity/status'
                }
            );
        };

        /**
         * 删除一个或多个实体
         *
         * @param {Array.<string>} idx id集合
         * @return {FakeXHR}
         */
        BaseData.prototype.remove =
            u.partial(BaseData.prototype.updateStatus, 'remove', 0);

        /**
         * 恢复一个或多个实体
         *
         * @param {Array.<string>} idx id集合
         * @return {FakeXHR}
         */
        BaseData.prototype.restore = 
            u.partial(BaseData.prototype.updateStatus, 'restore', 1);

        /**
         * 获取批量操作前的确认
         *
         * @param {string} action 操作名称
         * @param {number} status 目标状态
         * @param {Array.<string>} idx id集合
         * @return {FakeXHR}
         */
        BaseData.prototype.getAdvice = function (action, status, idx) {
            return this.request(
                '$entity/' + action + '/advice', 
                {
                    ids: idx,
                    status: status
                },
                {
                    method: 'GET',
                    url: '/$entity/status/advice'
                }
            );
        };
        
        /**
         * 批量删除前确认
         *
         * @param {Array.<string>} idx id集合
         * @return {FakeXHR}
         */
        BaseData.prototype.getRemoveAdvice = function (idx) {
            // 默认仅本地提示，有需要的子类重写为从远程获取信息
            var Deferred = require('er/Deferred');
            var advice = {
                message: '您确定要删除已选择的' + idx.length + '个'
                    + this.get('entityDescription') + '吗？'
            };
            return Deferred.resolved(advice);
        };

        /**
         * 批量恢复前确认
         *
         * @param {Array.<string>} idx id集合
         * @return {FakeXHR}
         */
        BaseData.prototype.getRestoreAdvice = 
            u.partial(BaseData.prototype.getAdvice, 'restore', 1);
        
        /**
         * 根据id获取单个实体
         *
         * @param {String} id 实体的id
         * @return {FakeXHR}
         */
        BaseData.prototype.findById = function (id) {
            return this.request(
                '$entity/findById',
                null,
                {
                    method: 'GET',
                    url: '/$entity/' + id
                }
            );
        };

        /**
         * 销毁当前实例
         *
         * @override
         * @protected
         */
        BaseData.prototype.dispose = function () {
            u.each(
                this.runningRequests,
                function (cache) { cache && cache.xhr.abort(); }
            );
            this.runningRequests = null;
        };

        return BaseData;
    }
);
