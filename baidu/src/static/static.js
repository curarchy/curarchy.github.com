/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 静态页面通用函数
 * @author maoquan(maoquan@baidu.com)
 * @date $DATE$
 */
define(
    function(require) {
        var ui = require('esui');
        var Validity = require('esui/validator/Validity');
        var ValidityState = require('esui/validator/ValidityState');
        var $ = require('jquery');

        /**
         * 显示消息
         * @param {Object} 消息
         */
        function showMessage(data) {
            var messageWrapper = $('#message-wrapper');
            var messageHeading = messageWrapper.find('.message-heading');
            messageHeading.html(data.title || '');
            messageWrapper.find('.message-body').html(data.content || '');
            messageWrapper.find('.message-footer').html(data.footer || '');
            messageWrapper.show();
            if (data.success) {
                messageHeading
                    .addClass('message-success')
                    .removeClass('message-warning');
            }
            else {
                messageHeading
                    .addClass('message-warning')
                    .removeClass('message-success');
            }
        }

        /**
         * 在指定控件上显示错误信息
         * @param {string} fieldName 控件名称
         * @param {string} message 错误信息
         */
        function showFieldMessage(fieldName, message) {
            var state = new ValidityState(false, message);
            var validity = new Validity();
            validity.addState('field', state);
            var control = getControl(fieldName);
            control.showValidity(validity);
        }

        /**
         * 清除指定控件的错误信息
         * @param {string} fieldName 控件名称
         */
        function clearFieldMessage(fieldName) {
            var validity = new Validity();
            var control = getControl(fieldName);
            control.showValidity(validity);
        }

        /**
         * 清除整个表单的错误信息
         * @param {string} formName 表单控件名称，默认为form
         */
        function clearALLFieldMessage(formName) {
            formName = formName || 'form';
            var controls = getControl(formName).getInputControls();
            for (var i = 0, len = controls.length; i < len; i++) {
                var control = controls[i];
                clearFieldMessage(control.get('id'));
            }
        }
        
        /**
         * 显示后端返回的字段级别提示信息
         * @param {Object} 后端返回的具体字段失败信息
         */
        function notifyErrors(errors) {
            for (var i = 0; i < errors.fields.length; i++) {
                var fail = errors.fields[i];
                if (fail.field === 'global') {
                    showToast(fail.message);
                }
                else {
                    showFieldMessage(fail.field, fail.message);
                }
            }
        }

        /**
         * 检查两次输入密码是否一致
         */
        function checkConfirmPassword() {
            var password = getControl('password').getValue();
            var confirmPassword =  getControl('confirm-password').getValue();

            if (password !== confirmPassword) {
                showFieldMessage(
                    'confirm-password', 
                    '两次输入的密码必须一致，请重新输入！'
                );
                return false;
            }
            else {
                clearFieldMessage('confirm-password');
            }
            return true;
        }

        /**
         * 检查表单所有控件，是否还有服务器返回的错误没有resolve
         */
        function checkServerValidity() {
            var controls = getControl('form').getInputControls();
            for (var i = 0, len = controls.length; i < len; i++) {
                var validityLabel = controls[i].getValidityLabel();
                var validity = validityLabel.get('validity');
                if (validity && !validity.isValid()) {
                    return false;
                }
            }
            return true;
        }

        /**
         * 获取指定id或name的控件
         * @param {string} name 控件的id或者name，优先尝试使用id获取
         */
        function getControl(name) {
            return ui.get(name) || ui.get('form').getInputControls(name)[0];
        }

        var queryCache = {};
        /**
         * 获取url指定参数值
         * @param {string} url 给定的url
         * @param {string} key 参数名
         * @return {string} 参数值
         */
        function getQueryValue(url, key) {
            if (arguments.length === 1) {
                key = url;
                url = location.href;
            }
            if (!queryCache[url]) {
                queryCache[url] = queryToJson(url);
            }
            return queryCache[url][key];
        }

        /**
         * 解析目标URL中的参数成json对象
         * 这里不考虑参数相同的情况，也不考虑解码
         * @param {string=} url 目标URL
         * @returns {Object} 解析后的参数对象
         */
        function queryToJson(url) {
            url = url || location.href;
            if (queryCache[url]) {
                return queryCache[url];
            }
            var query = url.substr(url.lastIndexOf('?') + 1);
            var params = query.split('&');
            var len = params.length;
            var result  = {};
            
            for (var i = 0, len = params.length; i < len; i++) {
                if(!params[i]){
                    continue;
                }
                param = params[i].split('=');
                result[param[0]] = param[1];
            }
            queryCache[url] = result;
            return result;
        }

        /**
         * 控件初始化以后显示验证提示信息
         */
        function initValidateInfo() {
            var controls = getControl('form').getInputControls();
            for (var i = 0, len = controls.length; i < len; i++) {
                var control = controls[i];
                // 如果html中配置了错误提示信息，就显示
                var validateInfo = control.get('validateInfo');
                if (validateInfo) {
                    var state = new ValidityState(false, validateInfo);
                    var validity = new Validity();
                    validity.addState('validate-info', state);
                    validity.setCustomValidState('info');
                    control.showValidity(validity);
                }
            }
        }

        /**
         * 添加对刷新验证码按钮的事件监听
         */
        function addChangeCaptchaListener() {
            $('#captcha-refresh-button').click(function() {
                var captchaElem = $('#' + $(this).attr('for'));
                var src = captchaElem.attr('src');
                var index = src.indexOf('?');
                if (index > -1) {
                    src = src.slice(0, index);
                }
                captchaElem.attr('src', src + '?_=' + Math.random());
                return false;
            });
        }

        var globalToast = null;

        /**
         * 显示toast提示信息，这个方法会控制一个单例，以免信息叠在一起
         * from: src/common/BaseView.js
         *
         * @parma {string} content 显示的内容
         * @param {Object=} options 配置
         * @param {string=} status 状态类型，可以使用**error**
         */
        function showToast(content, options) {
            if (!globalToast) {
                // 此处直接new控件出来，
                // 因为这个控件不能属于任何一个业务模块的ViewContext，
                // 不然会随着跳转被销毁，造成下次用不了
                var Toast = require('ui/Toast');
                var toastOptions = { disposeOnHide: false, autoShow: false };
                globalToast = new Toast(toastOptions);
                globalToast.on(
                    'hide', 
                    $.proxy(globalToast.detach, globalToast)
                );
                globalToast.render();
            }

            // 如果这个信息无比素正好显示着内容，又有新内容要显示，
            // 那么新内容也应该有个动画效果，以吸引用户眼球，
            // 所以要先`detach`一次，让`animation`生效
            globalToast.detach();
            var properties = {
                content: content,
                status: undefined
            };
            properties = $.extend(properties, options);
            globalToast.setProperties(properties);
            globalToast.show();
            return globalToast;
        }

        return {
            showMessage: showMessage,
            showFieldMessage: showFieldMessage,
            clearFieldMessage: clearFieldMessage,
            checkConfirmPassword: checkConfirmPassword,
            notifyErrors: notifyErrors,
            checkServerValidity: checkServerValidity,
            getControl: getControl,
            getQueryValue: getQueryValue,
            queryToJson: queryToJson,
            initValidateInfo: initValidateInfo,
            addChangeCaptchaListener: addChangeCaptchaListener,
            showToast: showToast,
            clearALLFieldMessage: clearALLFieldMessage
        };
    }
);
