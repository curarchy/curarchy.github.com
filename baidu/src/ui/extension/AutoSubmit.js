/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 让InputControl在特定事件下自动提交表单的扩展
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var Extension = require('esui/Extension');
        var lib = require('esui/lib');
        var ui = require('esui');
        var Form = require('esui/Form');

        /**
         * 让InputControl在特定事件下自动提交表单的扩展
         *
         * @param {Object=} options 配置项
         * @constructor
         * @extends esui/Extension
         */
        function AutoSubmit(options) {
            options = options || {};
            if (typeof options.events === 'string') {
                options.events = options.events.split(',');
                for (var i = 0; i < options.events.length; i++) {
                    options.events[i] = lib.trim(options.events[i]);
                }
            }

            Extension.apply(this, arguments);
        }

        AutoSubmit.prototype.type = 'AutoSubmit';

        /**
         * 指定对应的表单的id，不指定的话会进行自动查找
         *
         * @type {string|null}
         */
        AutoSubmit.prototype.form = null;

        /**
         * 指定用于提交表单的事件名称
         *
         * @type {Array}
         */
        AutoSubmit.prototype.events = ['click', 'change', 'search'];

        /**
         * 找到控件对应的`Form`控件
         *
         * @return {esui/Form}
         */
        AutoSubmit.prototype.resolveForm = function () {
            if (this.form) {
                return this.target.viewContext.get(this.form);
            }

            // 如果没指定表单，就沿DOM结构向上找一个表单控件
            var element = this.target 
                && this.target.main 
                && this.target.main.parentNode;
            while (element) {
                var control = ui.getControlByDOM(element);
                if (control && control instanceof Form) {
                    return control;
                }
                element = element.parentNode;
            }

            return null;
        };

        /**
         * 提交表单
         *
         * @param {esui/Control} this 触发事件的控件
         */
        function submit() {
            var form = this.resolveForm();
            if (form) {
                form.validateAndSubmit();
            }
        }

        /**
         * 激活扩展
         *
         * @override
         */
        AutoSubmit.prototype.activate = function () {
            this.submit = lib.bind(submit, this);

            for (var i = 0; i < this.events.length; i++) {
                var eventName = this.events[i];
                this.target.on(eventName, this.submit);
            }

            Extension.prototype.activate.apply(this, arguments);
        };

        /**
         * 取消激活
         *
         * @override
         */
        AutoSubmit.prototype.inactivate = function () {
            for (var i = 0; i < this.events.length; i++) {
                var eventName = this.events[i];
                this.target.un(eventName, this.submit);
            }

            this.submit = null;
            
            Extension.prototype.inactivate.apply(this, arguments);
        };

        lib.inherits(AutoSubmit, Extension);
        require('esui').registerExtension(AutoSubmit);
        return AutoSubmit;
    }
);