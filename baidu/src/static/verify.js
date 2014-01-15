/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 二级账户激活
 *  二级帐号激活有三种结果：
 *      1. 成功
 *      2. 失败：token失效等
 *      3. 需用户填写注册信息：
 *          3.1 成功
 *          3.2 字段错误
 *          3.3 token失效
 * @author maoquan(maoquan@baidu.com)
 * @date $DATE$
 */

define(
    function(require) {
        var $ = require('jquery');
        var staticUtil = require('./static');
        var ui = require('esui');
        var ajax = require('er/ajax');

        require('esui/Form');
        require('esui/BoxGroup');
        require('esui/TextBox');
        require('esui/Button');
        require('esui/InputControl');


        require('esui/validator/Validity');
        require('esui/validator/ValidityState');

        require('esui/validator/PatternRule');
        require('esui/validator/MaxLengthRule');
        require('esui/validator/MinLengthRule');

        var getControl = staticUtil.getControl;

        // 激活验证url
        var VERIFY_URL = '/api/tool/subManagers/verify?token=';
        // 字段验证url
        var VALIDATE_URL = '/api/tool/user/validation';

        ui.init();

        // 显示验证提示信息
        staticUtil.initValidateInfo();

        // 从url中获取token值
        var token = staticUtil.getQueryValue(location.href, 'token');
        if (!token) {
            staticUtil.showMessage(
                {
                    content: '参数错误!'
                }
            );
        }

        ajax.getJSON(VERIFY_URL + token)
            .then(
                function(data) {
                    if (!data) {
                        // 需用户填写注册信息
                        enterActivateForm();
                    }
                    else {
                        // 显示成功信息
                        showSuccessMessage(data);
                    }
                },
                function(response) {
                    // 显示错误信息
                    var data = $.parseJSON(response.responseText);
                    staticUtil.showMessage(
                        {
                            title: data.errorMessage,
                            content: data.errorAdvice
                        }
                    );
                }
            );

        /**
         * 激活有三种情况：
         * 1. 成功，直接给出成功提示
         * 2. 失败，给出失败提示
         * 3. 进入激活表单，填写注册信息
         */

        /**
         * 显示激活成功信息
         * @param {Object} 后端返回的成功信息
         */
        function showSuccessMessage(data) {
            staticUtil.showMessage(
                {
                    title: '恭喜您，您的账户已激活。',
                    content: '您可以使用"<span>'
                        + data.logName + '</span>"或"<span>' 
                        + data.logMail + '</span>"来登录。',
                    footer: '<a class="message-button" href="/">立即登录</a>',
                    success: true
                }
            );
        }

        /**
         * 显示激活表单
         */
        function enterActivateForm() {
            var formWrapper = $('#form-wrapper');
            formWrapper.show().prev().hide();
            // hidden input
            getControl('token').setValue(token);
            var form = getControl('form');
            // 提交表单前需验证
            form.set('autoValidate', true);
            // 表单提交事件
            form.on('submit', onFormSubmit);

            // 控制确认密码控件是否显示
            getControl('active-type').on(
                'change',
                function() {
                    var type = parseInt(this.getValue(), 10);
                    $('#submit').html(
                        [
                            '确定&nbsp;&nbsp;并同意以下条款', 
                            '激活'
                        ][type]
                    );
                    $('#form').toggleClass('verify-already verify-new');
                    // 清除错误信息
                    staticUtil.clearALLFieldMessage();
                }
            );

            getControl('userName').on(
                'blur',
                function() {
                    // 使用已有账户激活，不用验证用户名
                    if (getActiveType() === '1') {
                        return;
                    }
                    var control = this;
                    ajax.getJSON(VALIDATE_URL + '?' + control.name 
                        + '=' + this.getValue()).then(
                            function(data) {
                                staticUtil.clearFieldMessage(control.name);
                            }, 
                            function(response) {
                                var data = $.parseJSON(response.responseText);
                                staticUtil.notifyErrors(data);
                            }
                        );
                }
            );
            // 添加验证码刷新的事件监听
            staticUtil.addChangeCaptchaListener();
        }

        function onFormSubmit() {
            // 检查密码是否一致
            if (!checkConfirmPassword()) {
                return false;
            }
            var formWrapper = $('#form-wrapper');
            ajax.post(this.action, this.getData())
                .then(
                    function(data) {
                        formWrapper.hide().prev().show();
                        showSuccessMessage(data);
                    },
                    function(response) {
                        /**
                         * 409存在两种情况：
                         * 1. 用户填写信息错误
                         * 2. token过期或已经激活过了
                         */
                        var data = $.parseJSON(response.responseText);
                        if (data.errorMessage) {
                            formWrapper.hide().prev().show();
                            staticUtil.showMessage({
                                title: data.errorMessage,
                                content: data.errorAdvice
                            });
                        }
                        else {
                            staticUtil.notifyErrors(data);
                        }
                    }
                );
        }

        /**
         * 检查两次输入的密码是否一致
         */
        function checkConfirmPassword() {
            // 使用已有账户激活，不用两次输入密码
            if (getActiveType() === '1') {
                return true;
            }
            return staticUtil.checkConfirmPassword();
        }

        /**
         * 获取激活类型
         */
        function getActiveType() {
            return getControl('active-type').getValue();
        }
    }
);
