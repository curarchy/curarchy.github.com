/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 计算文本框可输入字符的扩展
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var Extension = require('esui/Extension');
        var lib = require('esui/lib');
        var Validity = require('esui/validator/Validity');

        /**
         * 让InputControl在特定事件下自动提交表单的扩展
         *
         * @param {Object=} options 配置项
         * @constructor
         * @extends esui/Extension
         */
        function WordCount(options) {
            Extension.apply(this, arguments);
        }

        WordCount.prototype.type = 'WordCount';


        function checkLength() {
            var maxLength = this.get('maxLength');
            var currentLength = this.getValue().length;
            var availableLength = maxLength - currentLength;

            var message;
            var validState = 'hint';
            if (!currentLength) {
                message = '最多可输入' + availableLength + '个字符';
            }
            else if (availableLength >= 0) {
                message = '还可输入' + availableLength + '个字符';
            }
            else {
                message = '已超出' + (-availableLength) + '个字符';
                validState = 'error';
            }

            var validity = new Validity();
            validity.setCustomValidState(validState);
            validity.setCustomMessage(message);

            this.showValidity(validity);
        }

        /**
         * 激活扩展
         *
         * @override
         */
        WordCount.prototype.activate = function () {
            var maxLength = this.target.get('maxLength');

            if (maxLength) {
                var render = this.target.render;
                this.target.render = function () {
                    render.apply(this, arguments);

                    this.on('input', checkLength);
                    checkLength.call(this);
                };
            }

            Extension.prototype.activate.apply(this, arguments);
        };

        /**
         * 取消激活
         *
         * @override
         */
        WordCount.prototype.inactivate = function () {
            delete this.target.render;
            
            Extension.prototype.inactivate.apply(this, arguments);
        };

        lib.inherits(WordCount, Extension);
        require('esui').registerExtension(WordCount);
        return WordCount;
    }
);