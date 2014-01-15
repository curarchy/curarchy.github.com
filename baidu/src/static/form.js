/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file form表单相关交互
 * @author exodia(dengxinxin@baidu.com)
 * @date $DATE$
 */
define(['jquery'], function ($) {
    var CODE_URL = 'http://cas.baidu.com/?action=image&t=';
    var loginInput = ['entered_login', 'entered_password', 'entered_imagecode'];

    function focusInOut(e) {
        var $target = $(e.target);
        if (!$target.hasClass('input-field')) {
            return;
        }
        if (e.type === 'focusin') {
            $target.parent().addClass('status-focus').end().prev().hide();
        } else {
            $target.parent().removeClass('status-focus');
            if ($target.val() === '') {
                $target.prev().show();
            }
        }
    }

    function refreshCode() {
        $('#captcha-image').attr('src', CODE_URL + Math.random());
    }

    function submit() {
        var hasError = false;
        var errorText = null;
        if (this.entered_login.value == '') {
            hasError = true;
            errorText = '用户名不得为空！';
        } else if (this.entered_password.value == '') {
            hasError = true;
            errorText = '密码不得为空！';
        } else if (this.entered_imagecode.value == '') {
            hasError = true;
            errorText = '验证码不得为空！';
        }

        if (hasError) {
            $('#login-error').html(errorText).show();
        } else {
            login(this);
        }

        return false;
    }

    function login(form) {
        form.fromu.value += '?.stamp=' + (+new Date());

        setTimeout(function () { form.submit(); }, 200);
    }

    function formInit() {
        var search = location.search.substr(1).split('&');
        var query = {};
        for (var i = search.length - 1; i > -1; i--) {
            var kv = search[i].split('=');
            var key = decodeURIComponent(kv[0]);
            var val = decodeURIComponent(kv[1]);
            query[key] = val;
        }

        if (query.e) {
            $('#login-error').html(query.e).show();
            $('#page').addClass('status-expanded');
            $('#form-wrap').addClass('status-login');
        }
    }

    return {
        init: function () {
            $('#form-wrap').on('focusin focusout', focusInOut);
            $('#captcha-refresh').click(refreshCode);
            $('#login-form').on('submit', submit);
            formInit();
        },

        clear: function () {
            var $loginForm = $('#login-form');
            var elems = $loginForm[0].elements
            $.each(loginInput, function (i, v) {
                elems[v].value = '';
            });
            $loginForm.find('label').show();
        }
    };
});
