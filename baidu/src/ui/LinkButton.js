/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file LinkButton控件
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var lib = require('esui/lib');
        var helper = require('esui/controlHelper');
        var Button = require('esui/Button');

        /**
         * LinkButton控件
         *
         * @param {Object=} options 初始化参数
         * @extends esui/Button
         * @constructor
         */
        function LinkButton(options) {
            Button.apply(this, arguments);
        }

        LinkButton.prototype.type = 'LinkButton';

        LinkButton.prototype.styleType = 'Button';

        /**
         * 创建主元素
         *
         * @return {HTMLElement}
         * @override
         * @protected
         */
        LinkButton.prototype.createMain = function () {
            return document.createElement('a');
        };

        /**
         * 初始化参数
         *
         * @param {Object=} options 构造函数传入的参数
         * @override
         * @protected
         */
        LinkButton.prototype.initOptions = function (options) {
            var properties = {};
            lib.extend(properties, options);

            if (!properties.hasOwnProperty('href')) {
                properties.href = this.main.getAttribute('href', 2);
            }
            if (!properties.hasOwnProperty('target')) {
                properties.target = lib.getAttribute(this.main, 'target');
            }

            this.setProperties(properties);
        };

        var paint = require('esui/painters');
        /**
         * 渲染自身
         *
         * @override
         * @protected
         */
        LinkButton.prototype.repaint = helper.createRepaint(
            Button.prototype.repaint,
            paint.attribute('href'),
            paint.attribute('target')
        );

        lib.inherits(LinkButton, Button);
        require('esui').register(LinkButton);
        return LinkButton;
    }
);
