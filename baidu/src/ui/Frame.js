/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file Frame控件
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var lib = require('esui/lib');
        var helper = require('esui/controlHelper');
        var Control = require('esui/Control');

        /**
         * Frame控件
         *
         * @param {Object=} options 初始化参数
         * @extends esui/Control
         * @constructor
         * @public
         */
        function Frame(options) {
            Control.apply(this, arguments);
        }

        Frame.prototype.type = 'Frame';

        /**
         * 创建主元素
         *
         * @return {HTMLElement}
         * @override
         * @protected
         */
        Frame.prototype.createMain = function () {
            return document.createElement('iframe');
        };

        /**
         * 初始化参数
         *
         * @param {Object=} options 构造函数传入的参数
         * @override
         * @protected
         */
        Frame.prototype.initOptions = function (options) {
            var properties = {};
            lib.extend(properties, options);

            if (!properties.src) {
                properties.src = this.main.src;
            }

            this.setProperties(properties);
        };

        /**
         * 初始化DOM结构
         *
         * @override
         * @protected
         */
        Frame.prototype.initStructure = function () {
            this.main.frameborder = 'no';
            this.main.marginHeight = '0';
            this.main.marginWeight = '0';
        };

        var paint = require('esui/painters');

        /**
         * 渲染自身
         *
         * @override
         * @protected
         */
        Frame.prototype.repaint = helper.createRepaint(
            Control.prototype.repaint,
            {
                name: 'src',
                paint: function (frame, src) {
                    // 避免重复加载`<iframe>`的地址，第一次渲染时没有比对功能
                    if (frame.main.src === src) {
                        return;
                    }

                    frame.main.src = src;
                }
            },
            paint.style('height'),
            paint.style('width')
        );

        /**
         * 调用iframe内容窗口的方法
         *
         * @param {string} methodName 方法名称
         * @param {Mixed...} 调用时的参数
         * @return {Mixed}
         */
        Frame.prototype.callContentMethod = function (methodName) {
            var args = [].slice.call(arguments, 1);
            var contentWindow = this.main.contentWindow;

            if (!contentWindow) {
                throw new Error('No content window on this iframe');
            }

            return contentWindow[methodName].apply(contentWindow, args);
        };

        lib.inherits(Frame, Control);
        require('esui').register(Frame);
        return Frame;
    }
);
