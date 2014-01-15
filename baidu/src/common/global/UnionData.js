/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file Union模块数据类
 * @author liyidong(srhb18@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var BaseData = require('common/BaseData');
        var util = require('er/util');
        var u = require('underscore');
        var user = require('common/global/user');

        /**
         * Union模块数据类
         *
         * @constructor
         * @extends common/BaseData
         */
        function UnionData() {
            BaseData.call(this, 'union', 'union');
            this.dataCache = null;
        }

        util.inherits(UnionData, BaseData);

        /**
         * 获取Union数据，并存入Cache
         *
         * @return {FakeXHR}
         */
        UnionData.prototype.requestUnionInfo = function () {
            var userId = user.mainUserId;
            var requesting = this.requestingUnion(userId);
            var unionData = this;
            return requesting.then(
                function (unionInfo) {
                    return user.init().then(
                        function () {
                            unionInfo.cproInfo.cname = 
                                unionInfo.cproInfo.cname || [];
                            unionInfo.cproInfo.joinedUrlList = 
                                unionInfo.cproInfo.joinedUrlList || [];
                            
                            unionData.dataCache = unionInfo;
                            var dumpInfo = {
                                unionService: unionData.getUnionService(),
                                cname: unionData.getCname(),
                                allowDomain: unionData.getAllowDomain(),
                                cproResult: unionData.getCproResult(),
                                unionRegStatus: unionData.getUnionRegStatus()
                            };
                            unionData.dataCache = u.extend(unionInfo, dumpInfo);
                            return unionData.dataCache;
                        }
                    );
                }
            );
        };

        /**
         * 获取Union数据
         *
         * @return {FakeXHR}
         */
        UnionData.prototype.requestingUnion = function (userId) {
            return this.request(
                'users/union', 
                null,
                {
                    method: 'GET',
                    url: '/users/' + userId + '/union'
                }
            );
        };

        /**
         * 单独获取UnionURL接口
         *
         */
        function getUnionURL() {
            var system = require('common/global/system');
            var unionURL = system.sysVariablesMap.unionUrl;
            return unionURL;
        }

        /**
         * 单独获取查看可投放域名链接接口
         *
         */
        function getAllowDomainViewURL() {
            var allowDomainViewURL = getUnionURL.call(this)
                + 'client/'
                + '?tempsessionid='
                + this.dataCache.unionInfo.tempsessionid
                + '#/account/media/websiteMg';
            return allowDomainViewURL;
        }

        /**
         * 单独获取UnionIframe接口
         *
         */
        function getCproSettingURL() {
            var cproConfigIframeURL = getUnionURL.call(this)
                + 'client/widget/cpro/index.html'
                + '?tempsessionid='
                + this.dataCache.unionInfo.tempsessionid;
            return cproConfigIframeURL;
        }

        /**
         * 获取后端Union开关状态
         *
         * @return {Bool}
         */
        function getUnionStatic() {
            var system = require('common/global/system');
            var useUnion = system.sysVariablesMap.useUnion;
            
            return useUnion === 'true';
        }

        /**
         * 获取后端Union开关状态，如需关闭Union，直接改此处为false
         */
        UnionData.prototype.getUnionService = function () {
            return getUnionStatic.call(this);
        };

        /**
         * Union接口完整数据
         */
        UnionData.prototype.getUnionInfo = function () {
            return this.dataCache;
        };

        /**
         * Union计费名
         */
        UnionData.prototype.getCname = function () {
            return this.dataCache.cproInfo.cname;
        };

        /**
         * Union可投放域名
         */
        UnionData.prototype.getAllowDomain = function () {
            return this.dataCache.cproInfo.joinedUrlList;
        };

        /**
         * Union登录TOKEN
         */
        UnionData.prototype.getCproResult = function () {
            return this.dataCache.unionStatus.cproResult;
        };

        /**
         * Union注册状态
         */
        UnionData.prototype.getUnionRegStatus = function () {
            return this.dataCache.unionStatus.unionRegStatus;
        };

        /**
         * Union注册用SessionID
         */
        UnionData.prototype.getRegUnionSessionId = function () {
            return this.dataCache.regUnionInfo.regUnionSessionId;
        };

        /**
         * Union可投放域名URL
         */
        UnionData.prototype.getAllowDomainViewURL = function () {
            return getAllowDomainViewURL.call(this);
        };

        /**
         * Union表单Iframe页面URL
         */
        UnionData.prototype.getCproSettingIframeURL = function () {
            return getCproSettingURL.call(this);
        };




        var requests = {
            unionInfo: {
                name: 'union/info',
                scope: 'instance',
                policy: 'auto'
            },
            unionService: {
                name: 'union/service',
                scope: 'instance',
                policy: 'auto'
            },
            cname: {
                name: 'union/cname',
                scope: 'instance',
                policy: 'auto'
            },
            allowDomain: {
                name: 'union/allowDomain',
                scope: 'instance',
                policy: 'auto'
            },
            cproResult: {
                name: 'union/cproResult',
                scope: 'instance',
                policy: 'auto'
            },
            unionRegStatus: {
                name: 'union/unionRegStatus',
                scope: 'instance',
                policy: 'auto'
            },
            regUnionSessionId: {
                name: 'union/regUnionSessionId',
                scope: 'instance',
                policy: 'auto'
            },
            allowDomainViewURL: {
                name: 'union/allowDomainViewURL',
                scope: 'instance',
                policy: 'auto'
            },
            cproSettingIframeURL: {
                name: 'union/cproSettingIframeURL',
                scope: 'instance',
                policy: 'auto'
            }
        };

        var ajax = require('er/ajax');
        u.each(
            requests,
            function (config) {
                ajax.register(UnionData, config.name, config);
            }
        );

        return UnionData;
    }
);        
