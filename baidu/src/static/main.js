/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 入口页主文件
 * @author exodia(dengxinxin@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var $ = require('jquery');
        var form = require('static/form');

        function doClick(e) {
            var $wrap = $('#form-wrap');
            var $page = $('#page');
            switch (e.target.id) {
                case 'login-button':
                    $page.toggleClass('status-expanded');
                    $wrap.toggleClass('status-login');
                    form.clear();
                /* case 'login-button':
                 if ($wrap.hasClass('status-login')) {
                 $page.removeClass('status-expanded');
                 $wrap.removeClass('status-login');
                 } else {
                 $page.addClass('status-expanded');
                 $wrap.removeClass('status-register').addClass('status-login');
                 }
                 break;
                 case 'register-button':
                 if ($wrap.hasClass('status-register')) {
                 $page.removeClass('status-expanded');
                 $wrap.removeClass('status-register');
                 } else {
                 $page.addClass('status-expanded');
                 $wrap.removeClass('status-login').addClass('status-register');
                 }
                 break;*/
            }
        }

        return {
            init: function () {
                form.init();
                $(document).click(doClick);
            }
        };
    }
);