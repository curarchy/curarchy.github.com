/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file Model基类
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */

define(
    function (require) {
        var u = require('underscore');
        var util = require('er/util');
        var UIModel = require('ef/UIModel');

        /**
         * 业务`Model`基类
         *
         * @param {string=} entityName 该`Model`管理的主要实体的类型名称
         * @param {string=} backendEntityName 后端的实体名称，默认与`entityName`相同
         * @param {Object=} context 初始化时的数据
         *
         * @constructor
         * @extends ef/UIModel
         */
        function BaseModel(entityName, backendEntityName, context) {
            // 4种重载：
            // 
            // 1. `new ()`
            // 2. `new (context)`
            // 3. `new (entityName, context)`
            // 4. `new (entityName, backendEntityName, context)`

            // `context`只可能出现在最后，且一定是对象
            var initialContext = arguments[arguments.length - 1];
            if (typeof initialContext !== 'object') {
                initialContext = null;
            }
            UIModel.call(this, initialContext);

            // 如果第1个参数是字符串，那么肯定是`entityName`
            entityName = typeof entityName === 'string'
                ? entityName
                : '';
            if (entityName) {
                this.entityName = entityName;
            }
                
            // 第2个参数是字符串，那么是`backendEntityName`
            backendEntityName = typeof backendEntityName === 'string'
                ? backendEntityName
                : this.entityName;
            if (backendEntityName) {
                this.backendEntityName = backendEntityName;
            }

            this.runningRequests = {};
        }

        util.inherits(BaseModel, UIModel);

        var ajax = require('er/ajax');

        var globalRequestConfig = {};
        var globalRunningRequests = {};

        function extendLastObjectTypeValue(array, extension) {
            var lastObject = array[array.length - 1];
            if (u.isArray(lastObject)) {
                extendLastObjectTypeValue(lastObject, extension);
            }
            else {
                // 这里也一样，必须变成一个新对象，以避免多次覆盖过来的影响
                array[array.length - 1] = u.defaults({}, extension, lastObject);
            }
        }

        /**
         * 合并默认数据源
         */
        BaseModel.prototype.mergeDefaultDatasource = function () {
            if (!this.datasource) {
                return;
            }

            // 管它有没有必要，先深复制一份，这样下面就不会为各种情况纠结，
            // `datasource`大不到哪里去，深复制不影响性能
            var datasource = u.deepClone(this.datasource) || {};
            var defaultDatasource = u.deepClone(this.defaultDatasource);

            // 默认数据源可能是对象或者数组，当前的数据源也可能是对象或数组，按以下规则：
            //
            // - 默认数组 + 当前数组：将当前数组连接到默认的最后
            // - 默认数组 + 当前对象：将当前对象和数组中最后一个是对象的东西合并
            // - 默认对象 + 当前数组：将默认放在数组第1个
            // - 默认对象 + 当前对象：做对象的合并
            if (u.isArray(defaultDatasource)) {
                // 默认数组 + 当前数组
                if (u.isArray(datasource)) {
                    datasource = defaultDatasource.concat(datasource);
                }
                // 默认数组 + 当前对象
                else {
                    extendLastObjectTypeValue(defaultDatasource, datasource);
                    datasource = defaultDatasource;
                }
            }
            else {
                // 默认对象 + 当前数组
                if (u.isArray(datasource)) {
                    if (!u.contains(datasource, defaultDatasource)) {
                        // 其它的数据项有可能会依赖这个属性，因此需要放在最前面
                        datasource.unshift(defaultDatasource);
                    }
                }
                // 默认对象 + 当前对象
                else {
                    u.defaults(datasource, defaultDatasource);
                }
            }

            this.datasource = datasource;
        };

        /**
         * 加载数据
         *
         * @return {er/Promise}
         */
        BaseModel.prototype.load = function () {
            this.mergeDefaultDatasource();

            return UIModel.prototype.load.apply(this, arguments);
        };

        /**
         * 注册一个请求配置
         *
         * @param {Model} 提供配置的`Model`类型对象
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
        ajax.register = function (Model, name, config) {
            var defaults = {
                name: name,
                scope: 'instance',
                policy: 'auto'
            };
            config = util.mix(defaults, config);

            if (config.scope === 'instance') {
                var configContainer = Model.prototype.requestConfig;
                if (!configContainer) {
                    configContainer = Model.prototype.requestConfig = {};
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
         * @param {BaseModel} model 实例
         * @param {string} name 请求名称
         * @return {Object | undefined}
         */ 
        function lookupRequestConfig(model, name) {
            if (!name) {
                return null;
            }
            return (model.requestConfig && model.requestConfig[name])
                || globalRequestConfig[name];
        }

        /**
         * 处理多个同名请求同时出现的情况
         *
         * @param {BaseModel} model 实例
         * @param {Object} config 请求预先注册的配置项
         * @param {Object} options 本次请求的相关参数
         * @return {FakeXHR | undefined}
         */
        function resolveConflict(model, config, options) {
            var runningRequest = model.runningRequests[config.name];
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
         * @param {BaseModel} model 实例
         * @param {string} name 请求名称
         * @param {FakeXHR} xhr 负责请求的`FakeXHR`对象
         */
        function detachRunningRequest(model, name, xhr) {
            if (model.runningRequests 
                && model.runningRequests[name]
                && model.runningRequests[name].xhr === xhr
            ) {
                model.runningRequests[name] = null;
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
        BaseModel.prototype.request = function (name, data, options) {
            if (typeof name !== 'string') {
                options = name;
                name = null;
            }

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

            // 所有前端接口，除登录用的几个外，全部以`/api/js`作为前缀，
            // 登录的几个接口不会使用`Model`发起，因此这边所有请求统一加前缀
            if (options.url && options.url.indexOf('/api/js' !== 0)) {
                options.url = '/api/js' + options.url;
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

        /**
         * 把一个单词复数化
         *
         * @param {string} word 单词
         * @return {string}
         * @inner
         */
        var pluralize = function (word) {
            return word.replace(/y$/, 'ie') + 's';
        };
        // 加层缓存
        pluralize = u.memoize(pluralize);

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
         * @param {string=} entityName 实体名，默认为当前Model管理的实体
         * @return {FakeXHR}
         */
        BaseModel.prototype.search = function (query, entityName) {
            if (this.data && !entityName) {
                return this.data.search(query);
            }

            entityName = entityName || this.entityName;
            return this.request(
                entityName + '/search', 
                query,
                {
                    method: 'GET',
                    url: '/' + pluralize(entityName)
                }
            );
        };

        /**
         * 获取一个实体列表（不分页）
         *
         * @param {Object} query 查询参数
         * @param {string=} entityName 实体名，默认为当前Model管理的实体
         * @return {FakeXHR}
         */
        BaseModel.prototype.list = function (query, entityName) {
            if (this.data && !entityName) {
                return this.data.list(query);
            }

            entityName = entityName || this.entityName;
            return this.request(
                entityName + '/list', 
                query,
                {
                    method: 'GET',
                    url: '/' + pluralize(entityName) + '/list'
                }
            );
        };

        /**
         * 保存一个实体
         *
         * @param {Object} entity 实体对象
         * @param {string=} entityName 实体名，默认为当前Model管理的实体
         * @return {FakeXHR}
         */
        BaseModel.prototype.save = function (entity, entityName) {
            if (this.data && !entityName) {
                return this.data.save(entity);
            }

            entityName = entityName || this.entityName;
            return this.request(
                entityName + '/save', 
                entity,
                {
                    method: 'POST',
                    url: '/' + pluralize(entityName)
                }
            );
        };

        /**
         * 更新一个实体
         *
         * @param {Object} entity 实体对象
         * @param {string=} entityName 实体名，默认为当前Model管理的实体
         * @return {FakeXHR}
         */
        BaseModel.prototype.update = function (entity, entityName) {
            if (this.data && !entityName) {
                return this.data.update(entity);
            }

            entityName = entityName || this.entityName;
            return this.request(
                entityName + '/update', 
                entity,
                {
                    method: 'PUT',
                    url: '/' + pluralize(entityName) + '/' + entity.id
                }
            );
        };

        /**
         * 批量更新一个或多个实体的状态
         *
         * @param {string} action 操作名称
         * @param {number} status 目标状态
         * @param {Array.<string>} idx id集合
         * @param {string=} entityName 实体名，默认为当前Model管理的实体
         * @return {FakeXHR}
         */
        BaseModel.prototype.updateStatus = 
            function (action, status, idx, entityName) {
                if (this.data && !entityName) {
                    return this.data.updateStatus(action, status, idx);
                }

                entityName = entityName || this.entityName;
                return this.request(
                    entityName + '/' + action, 
                    {
                        ids: idx,
                        status: status
                    },
                    {
                        method: 'POST',
                        url: '/' + pluralize(entityName) + '/status'
                    }
                );
            };

        /**
         * 删除一个或多个实体
         *
         * @param {Array.<string>} idx id集合
         * @param {string=} entityName 实体名，默认为当前Model管理的实体
         * @return {FakeXHR}
         */
        BaseModel.prototype.remove =
            u.partial(BaseModel.prototype.updateStatus, 'remove', 0);

        /**
         * 恢复一个或多个实体
         *
         * @param {Array.<string>} idx id集合
         * @param {string=} entityName 实体名，默认为当前Model管理的实体
         * @return {FakeXHR}
         */
        BaseModel.prototype.restore = 
            u.partial(BaseModel.prototype.updateStatus, 'restore', 1);

        /**
         * 获取批量操作前的确认
         *
         * @param {string} action 操作名称
         * @param {number} status 目标状态
         * @param {Array.<string>} idx id集合
         * @param {string=} entityName 实体名，默认为当前Model管理的实体
         * @return {FakeXHR}
         */
        BaseModel.prototype.getAdvice = 
            function (action, status, idx, entityName) {
                if (this.data && !entityName) {
                    return this.data.getAdvice(action, status, idx);
                }

                entityName = entityName || this.entityName;
                return this.request(
                    entityName + '/' + action + '/advice', 
                    {
                        ids: idx,
                        status: status
                    },
                    {
                        method: 'GET',
                        url: '/' + pluralize(entityName) + '/status/advice'
                    }
                );
            };
        
        /**
         * 批量删除前确认
         *
         * @param {Array.<string>} idx id集合
         * @param {string=} entityName 实体名，默认为当前Model管理的实体
         * @return {FakeXHR}
         */
        BaseModel.prototype.getRemoveAdvice = function (idx, entityName) {
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
         * @param {string=} entityName 实体名，默认为当前Model管理的实体
         * @return {FakeXHR}
         */
        BaseModel.prototype.getRestoreAdvice = 
            u.partial(BaseModel.prototype.getAdvice, 'restore', 1);
        
        /**
         * 根据id获取单个实体
         *
         * @param {String} id 实体的id
         * @param {string=} entityName 实体名，默认为当前Model管理的实体
         * @return {FakeXHR}
         */
        BaseModel.prototype.findById = function (id, entityName) {
            if (this.data && !entityName) {
                return this.data.findById(id);
            }

            entityName = entityName || this.entityName;
            return this.request(
                entityName + '/findById',
                null,
                {
                    method: 'GET',
                    url: '/' + pluralize(entityName) + '/' + id
                }
            );
        };

        /**
         * 销毁当前实例
         *
         * @override
         * @protected
         */
        BaseModel.prototype.dispose = function () {
            u.each(
                this.runningRequests,
                function (cache) { cache && cache.xhr.abort(); }
            );
            this.runningRequests = null;

            if (this.data) {
                this.data.dispose();
            }
            
            UIModel.prototype.dispose.apply(this, arguments);
        };

        return BaseModel;
    }
);
