/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 百度流量交易服务及网盟相关接口
 * @author liyidong(srhb18@gmail.com)
 * @date $DATE$
 */

 define(
    function (require) {
        var BaseModel = require('common/BaseModel');
        var datasource = require('er/datasource');
        var util = require('er/util');

        /**
         * Union接口数据模型类
         *
         * @param {Object=} context 用于初始化的数据
         * @constructor
         * @extends common/BaseModel
         */
        function UnionModel(context) {
            BaseModel.apply(this, arguments);
            if (!this.unionService) {
                this.datasource = {
                    unionInfo: datasource.constant({}),
                    unionService: datasource.constant(false)
                };
            }
        }

        util.inherits(UnionModel, BaseModel);

        /**
         * 获取后端Union开关状态
         *
         */
        function getUnionStatic() {
            var system = require('common/global/system');
            var useUnion = system.sysVariablesMap.useUnion;
            
            return useUnion === 'true';
        }

        // Union解耦开关
        UnionModel.prototype.unionService = getUnionStatic();

        /**
         * 数据源配置
         *
         * @type {Object}
         * @override
         */
        UnionModel.prototype.datasource = [
            {
                unionInfo: function (model) {
                    return model.init();
                },
                unionService: function (model) {
                    return model.unionService;
                }
            },
            {
                cname: function (model) {
                    return model.get('unionInfo').cproInfo.cname;
                },
                allowDomain: function (model) {
                    return model.get('unionInfo').cproInfo.joinedUrlList;
                },
                cproResult: function (model) {
                    return model.get('unionInfo').unionStatus.cproResult;
                },
                unionRegStatus: function (model) {
                    return model.get('unionInfo').unionStatus.unionRegStatus;
                }
                // 注销备用，暂不暴露
                // regUnionSessionId: function (model) {
                //     return model.get('unionInfo').regUnionInfo.tempsessionid;
                // }
            },
            {
                allowDomainViewURL: function (model) {
                    var allowDomainViewURL = model.getAllowDomainViewURL();
                    return allowDomainViewURL;
                },
                cproSettingIframeURL: function (model) {
                    var cproSettingIframeURL = model.getCproSettingURL();
                    return cproSettingIframeURL;
                }
            }
            

        ];

        /**
         * 获取当前主账号ID
         *
         * @return {Number}
         */
        function getUserId() {
            // 需要确认到底是主账号ID还是当前访问者账号的ID，接口上写的是前者
            return require('common/global/user').mainUserId;
        }

        /**
         * 获取Union数据
         *
         * @return {FakeXHR}
         */
        function requestUnionInfo() {
            var userId = getUserId();
            return this.request(
                'users/union', 
                null,
                {
                    method: 'GET',
                    url: '/users/' + userId + '/union'
                }
            );
        }

        /**
         * Union数据初始化接口
         *
         */
        UnionModel.prototype.init = function () {
            var loading = requestUnionInfo.call(this);
            return loading.then(
                function (unionInfo) {
                    unionInfo.cproInfo.cname = 
                        unionInfo.cproInfo.cname || [];
                    unionInfo.cproInfo.joinedUrlList = 
                        unionInfo.cproInfo.joinedUrlList || [];

                    return unionInfo;
                }
            );
        };

        /**
         * 单独获取UnionURL接口
         *
         */
        UnionModel.prototype.getUnionURL = function () {
            var system = require('common/global/system');
            var unionURL = system.sysVariablesMap.unionUrl;
            return unionURL;
        };

        /**
         * 单独获取查看可投放域名链接接口
         *
         */
        UnionModel.prototype.getAllowDomainViewURL = function () {
            var model = this;
            var allowDomainViewURL = model.getUnionURL()
                + 'client/'
                + '?tempsessionid='
                + model.get('unionInfo').unionInfo.tempsessionid
                + '#/account/media/websiteMg';
            return allowDomainViewURL;
        };

        /**
         * 单独获取UnionIframe接口
         *
         */
        UnionModel.prototype.getCproSettingURL = function () {
            var model = this;
            var cproConfigIframeURL = model.getUnionURL()
                + 'client/widget/cpro/index.html'
                + '?tempsessionid='
                + model.get('unionInfo').unionInfo.tempsessionid;
            return cproConfigIframeURL;
        };

        var ajax = require('er/ajax');
        var requestConfig = {
            name: 'users/union',
            scope: 'instance',
            policy: 'auto'
        };
        ajax.register(UnionModel, 'users/union', requestConfig);
        
        return UnionModel;
    }
);