/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file AJAX模块扩展
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        // 配置各扩展开头
        var ajax = require('er/ajax');
        // ADM2.0前后端有缓存设计，因此默认开启GET请求的缓存
        ajax.config.cache = true;
        ajax.config.timeout = 15 * 1000;
        ajax.config.charset = 'utf-8';

        var CONTENT_TYPE_ALIAS = {
            json: 'application/json'
        };

        // 自动转换`contentType`
        ajax.hooks.beforeExecute = function (options) {
            if (options.contentType &&
                CONTENT_TYPE_ALIAS.hasOwnProperty(options.contentType)
            ) {
                options.contentType = CONTENT_TYPE_ALIAS[options.contentType];
            }
        };

        var user = require('common/global/user');
        ajax.hooks.beforeSend = function (xhr, options) {
            var method = options.method.toUpperCase();
            if (user.sessionToken && 
                (method === 'POST' || method === 'PUT')
            ) {
                xhr.setRequestHeader('X-Session-Token', user.sessionToken);
            }
        };

        var serializeAsForm = ajax.hooks.serializeData;
        // 支持JSON格式的提交
        ajax.hooks.serializeData = function (prefix, data, contentType) {
            if (!prefix && contentType === 'application/json') {
                return JSON.stringify(data);
            }
            else {
                return serializeAsForm.apply(ajax.hooks, arguments);
            }
        };
        // 有个`getKey`要弄回去
        ajax.hooks.serializeData.getKey = serializeAsForm.getKey;

        ajax.hooks.afterReceive = function (xhr) {
            var date = xhr.getResponseHeader('date');
            require('common/global/system').timeStamp = new Date(date);
        };

        var errorCodes = {
            '403': {
                name: 'not-authorized',
                title: '登录超时',
                message: '系统登录超时，请重新登录再试。',
                handler: function () {
                    var baseURL = window.DEBUG 
                        ? '/static/index-debug.html'
                        : '/static/index.html';
                    location.href = baseURL + location.hash;
                }
            },
            '500': {
                name: 'server-error',
                title: '系统错误',
                message: '系统发生错误，请稍后再试。'
            }
        };
        ajax.on(
            'fail',
            function globalAjaxFail(error) {
                var config = errorCodes[error.xhr.status];
                if (config) {
                    // 避免还没登录就依赖`esui/Dialog`拉一大堆东西
                    window.require(
                        ['esui/Dialog'],
                        function (Dialog) {
                            var options = {
                                title: config.title,
                                content: config.message
                            };
                            var dialog = Dialog.alert(options);
                            if (config.handler) {
                                dialog.on('ok', config.handler);
                            }
                        }
                    );
                }
            }
        );
    }
);