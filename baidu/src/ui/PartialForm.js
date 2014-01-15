/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file PartialForm控件
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var lib = require('esui/lib');
        var ActionPanel = require('ef/ActionPanel');

        /**
         * 局部表单控件。
         *
         * 这控件本质上是个`ActionPanel`，但它表现得像是`InputControl`，
         * 因此可以用作表单的一部分，从而细粒度地切割表单的组成
         *
         * @param {Object=} options 初始化参数
         * @extends ef/ActionPanel
         * @constructor
         */
        function PartialForm(options) {
            ActionPanel.apply(this, arguments);
        }

        PartialForm.prototype.type = 'PartialForm';

        /**
         * 进行验证
         *
         * @return {boolean}
         */
        PartialForm.prototype.validate = function () {
            var action = this.get('action');

            if (!action) {
                return true;
            }

            if (typeof action.validate === 'function') {
                return action.validate();
            }

            // 标准的验证必须有`ViewContext`的协助
            var viewContext = action.view && action.view.viewContext;
            if (!viewContext) {
                return true;
            }

            var Validity = require('esui/validator/Validity');
            var validity = new Validity();
            var event = {
                validity: validity
            };
            this.fire('beforevalidate', event);

            // 拿子Action中的输入控件，看上去是一个hack，但工作的不错，
            // 就当是`Form`的特殊功能，把控件作为一种helper来用
            // TODO: 后续想想能不能整得更合理些
            var Form = require('esui/Form');
            var properties = {
                main: lib.g(action.view.container),
                viewContext: action.view.viewContext
            };
            var helperForm = new Form(properties);
            var inputs = helperForm.getInputControls();

            var isValid = true;
            for (var i = 0; i < inputs.length; i++) {
                var control = inputs[i];
                 // 不对disabled的控件进行验证
                if (control.isDisabled()) {
                    continue;
                }

                isValid &= control.validate();
            }

            if (!isValid) {
                this.fire('invalid', event);
            }

            this.fire('aftervalidate', event);

            return isValid;
        };

        /**
         * 获取值
         *
         * @return {Mixed}
         */
        PartialForm.prototype.getRawValue = function () {
            var action = this.get('action');

            if (!action) {
                return null;
            }

            if (typeof action.getRawValue === 'function') {
                return action.getRawValue();
            }

            if (typeof action.getValue === 'function') {
                return action.getValue();
            }
        };

        /**
         * 获取控件分类
         *
         * @return {string}
         */
        PartialForm.prototype.getCategory = function () {
            return 'input';
        };


        lib.inherits(PartialForm, ActionPanel);
        require('esui').register(PartialForm);
        return PartialForm;
    }
);
