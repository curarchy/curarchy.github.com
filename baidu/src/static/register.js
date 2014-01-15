/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 用户注册
 * @author maoquan(maoquan@baidu.com)
 * @date $DATE$
 */
define(
    function(require) {
        var $ = require('jquery');
        var staticUtil = require('./static');
        var ui = require('esui');
        var ajax = require('er/ajax');
        
        var Dialog = require('esui/Dialog');
        
        require('esui/validator/Validity');
        require('esui/validator/ValidityState');

        require('esui/validator/PatternRule');
        require('esui/validator/MaxLengthRule');
        require('esui/validator/MinLengthRule');
        require('esui/Form');
        require('esui/TextBox');
        require('esui/Button');
        require('esui/InputControl');

        var getControl = staticUtil.getControl;

        // 后端验证url
        var VALIDATE_URL = '/api/tool/user/validation';
        // 重新发送验证邮件的后端url
        var RESEND_EMAIL_URL = '/api/tool/user/register/email/sender';
        // 修改注册email的后端url
        var MODIFY_EMAIL_URL = '/api/tool/user/register/email';

        // 用户注册信息，注册成功后由后端返回
        // 部分场景会用到，比如修改邮箱
        var registerInfo = {};
        
        // 添加重新发送验证邮件用户事件
        $('#resend-button').click(onResendEmail);
        $('#modify-button').click(onModifyEmail);

        // url中有email字段，用户在未激活状态下登录系统
        // 跳转到这个页面的, so直接显示激活信息
        var email = staticUtil.getQueryValue('email');
        var emailRule = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
        if (email && emailRule.test(email)) {
            registerInfo.email = email;
            showSuccessMessage();
            return;
        }

        ui.init();
        // 为避免页面抖动，这里先将form隐藏，esui.init后再显示
        $('#form').show();

        // 显示验证提示信息
        staticUtil.initValidateInfo();
        // 添加验证码刷新的事件监听
        staticUtil.addChangeCaptchaListener();

        var form = getControl('form');
        // 提交表单前需验证
        form.set('autoValidate', true);
        // 表单提交事件
        form.on('submit', onFormSubmit);
        // 需要提交到服务器验证的控件
        $.each(
            ['email', 'username'],
            function(index, name) {
                getControl(name).on(
                    'blur',
                    function() {
                        var control = this;
                        ajax.getJSON(VALIDATE_URL + '?' + this.name 
                                + '=' + this.getValue())
                            .then(
                                function(data) {
                                    staticUtil.clearFieldMessage(control.name);
                                }, 
                                function(response) {
                                    var data = 
                                        $.parseJSON(response.responseText);
                                    staticUtil.notifyErrors(data);
                                }
                            );
                    }
                );
            }
        );

        /**
         * 表单提交
         */
        function onFormSubmit() {
            // 检查密码格式
            if (!checkPassword()) {
                return false;
            }
            // 检查密码是否一致
            if (!staticUtil.checkConfirmPassword()) {
                return false;
            }
            /**
             * 服务器返回的错误还没有resolve，不能提交
             */
            if (!staticUtil.checkServerValidity()) {
                return false;
            }

            ajax.post(this.action, this.getData())
                .then(
                    function(data) {
                        $('#form').hide();
                        registerInfo = data;
                        showSuccessMessage();
                    },
                    function(response) {
                        var data = $.parseJSON(response.responseText);
                        staticUtil.notifyErrors(data);
                    }
                );
        }
        
        /**
         * 检查密码格式，单个正则不好写,就特殊处理了
         */
        function checkPassword() {
            var password = getControl('password').getValue();
            if(!(/[a-z]/.test(password)) || !(/[A-Z]/.test(password)) 
                || !(/[0-9]/.test(password))
            ) {
                staticUtil.showFieldMessage(
                    'password', '您输入的密码不合法，请按照提示输入');
                return false;
            }
            else {
                staticUtil.clearFieldMessage('password');
            }
            return true;
        }

        /**
         * 重新发送验证邮件
         */
        function onResendEmail() {
            ajax.post(RESEND_EMAIL_URL)
                .then(
                    function(data) {
                        staticUtil.showToast('发送成功！');
                    },
                    function(response) {
                        var data = $.parseJSON(response.responseText);
                        staticUtil.notifyErrors(data);
                    }
                );
            return false;
        }

        /**
         * 修改注册邮箱
         */
        function onModifyEmail() {
            if (!registerInfo) {
                staticUtil.showToast('非法请求！');
            }
            var main = document.createElement('div');
            document.body.appendChild(main);
            var dialog = new Dialog({
                title: '更改邮箱',
                /* jshint maxlen: 100 */
                content: [
                    '<div class="dialog-modify-email">',
                        '<div class="dialog-modify-email-old">',
                            '<label>原邮箱:</label>',
                            '<span>' + registerInfo.email + '</span>',
                        '</div>',
                        '<div class="dialog-modify-email-new">',
                        '<label class="dialog-modify-email-new-label">新邮箱:</label>',
                        '<input id="new-email" name="email" autocomplete="off" ',
                            'data-ui-type="TextBox" data-ui-id="new-email"',
                            'data-ui-required="required" data-ui-max-length="100"',
                            'data-ui-pattern="\\w+([-+.]\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*"',
                            'data-ui-pattern-error-message="请输入正确的电子邮件地址"/>',
                            '</div>',
                    '</div>'
                ].join(''),
                main: main
            });
            dialog.show();
            // email的控件用到esui了
            ui.init(main);
            var btnOk = dialog.getFoot().getChild('btnOk');
            var btnCancel = dialog.getFoot().getChild('btnCancel');
            btnOk.on(
                'click', 
                function(){
                    var emailControl = ui.get('new-email');
                    if (!emailControl.validate()) {
                        return false;
                    }
                    ajax.post(
                        MODIFY_EMAIL_URL,
                        {
                            newEmail: emailControl.getValue()
                        }
                    ).then(
                            function(data) {
                                registerInfo = data;
                                dialog.dispose();
                                staticUtil.showToast('发送成功！');
                                showSuccessMessage();
                            },
                            function(response) {
                                var data = $.parseJSON(response.responseText);
                                staticUtil.notifyErrors(data);
                            }
                        );
                }
            );
            btnCancel.on(
                'click',
                function(){
                    dialog.dispose();
                }
            );
            return false;
        }

        /**
         * 显示成功消息，在注册成功或者成功修改邮箱后调用
         */
        function showSuccessMessage() {
            var email = registerInfo.email;
            var url = 'http://www.' + email.slice(email.indexOf('@') + 1);
            staticUtil.showMessage({
                title: '就差一步了，快去激活您的账户吧！',
                content: '激活邮件已经发送到您的“<span>'
                    + email + '</span>”邮箱，请前往注册激活',
                footer: '<a class="message-button" href="'
                    + url + '" target="_blank">登录邮箱</a>',
                success: true
            });
        }
    }
);
