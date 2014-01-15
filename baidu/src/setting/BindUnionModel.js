/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 修改帐户名称表单的数据模型类
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var FormModel = require('common/FormModel');
        var util = require('er/util');
        var config = require('./config');
        var u = require('underscore');

        function BindUnionModel() {
            FormModel.call(this, 'setting');
        }

        util.inherits(BindUnionModel, FormModel);

        var user = require('common/global/user');
        var sysVariables = require('common/global/system').sysVariablesMap;
        var datasource = require('er/datasource');

        /**
         * 数据源配置
         *
         * @type {Object}
         * @override
         */
        BindUnionModel.prototype.datasource = {
            // 用来冲掉基类的默认`entity`配置
            entity: undefined,
            union: [
                {
                    user: datasource.constant(user.mainUserId),
                    name: datasource.constant(user.mainUserName),
                    unionURL: datasource.constant(sysVariables.unionUrl)
                },
                // 获取union信息依赖于用户id，为了方便测试，用户id得能从Model自身取到，
                // 这样以后测`getUnionInfo`方法只需要`set('id', xxx)`即可，
                // 不会依赖一个全局的`common/global/user`模块
                {
                    retrieve: datasource.invoke('getUnionInfo'),
                    dump: true
                }
            ]
        };

        /**
         * 判断实体是否有变化
         *
         * @param {Object} entity 新的实体
         * @return {boolean}
         */
        BindUnionModel.prototype.isEntityChanged = function (entity) {
            // 有填过东西就是有变化了
            return !!entity.unionUserName || !!entity.unionUserPassword;
        };

        /**
         * 保存实体
         *
         * @param {Object} entity 帐户名称实体
         * @param {string} entity.accountName 帐户名称
         * @return {Promise}
         * @override
         */
        BindUnionModel.prototype.save = function (entity) {
            var updating = this.request(
                'setting/bindUnion',
                entity,
                {
                    method: 'PUT',
                    url: '/users/' + this.get('user') + '/union'
                }
            );
            
            return updating.then(
                function (data) {
                    return user.init()
                        .then(function () { return data; });
                }
            );
        };

        BindUnionModel.prototype.getUnionInfo = function () {
            var requesting = this.request(
                'setting/getUnionInfo',
                null,
                {
                    method: 'GET',
                    url: '/users/' + this.get('user') + '/union'
                }
            );
            return requesting.then(
                function (data) {
                    return {
                        cproResult: data.unionStatus.cproResult,
                        canRegisterUnion: data.unionStatus.unionRegStatus,
                        registerSessionID: data.regUnionInfo.tempsessionid,
                        unionSessionID: data.unionInfo.tempsessionid
                    };
                }
            );
        };

        var ajax = require('er/ajax');
        u.each(
            config.requests,
            function (config) {
                ajax.register(BindUnionModel, config.name, config);
            }
        );

        return BindUnionModel;
    }
);