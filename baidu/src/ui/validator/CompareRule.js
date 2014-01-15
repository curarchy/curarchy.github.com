/**
 * ESUI (Enterprise UI)
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 字段与另一个字段值相同的验证规则
 * @author otakustay(otakustay@gmail.com)
 */
define(
    function (require) {
        var Rule = require('esui/validator/Rule');
        var ValidityState = require('esui/validator/ValidityState');

        /**
         * CompareRule类声明
         *
         * @constructor
         */
        function CompareRule() {
            Rule.apply(this, arguments);
        }

        /**
         * 规则类型
         * 
         * @type {string}
         */
        CompareRule.prototype.type = 'compare';


        /**
         * 错误提示信息
         *
         * @type {string}
         */
        CompareRule.prototype.errorMessage = 
            '您两次输入的${title}不一致，请重新输入';

        /**
         * 获取验证对应的错误提示信息。
         *
         * @param {Control} control 待校验控件
         * @return {string}
         */
        CompareRule.prototype.getErrorMessage = function (control) {
            var lib = require('esui/lib');
            var errorMessage =
                control.get(this.type + 'ErrorMessage') || this.errorMessage;
            var target = this.getLimitCondition(control);
            target = control.viewContext.get(target);
            return lib.format(errorMessage, target);
        };

        /**
         * 验证控件的验证状态
         *
         * @param {string} value 校验值
         * @param {Control} control 待校验控件
         *
         * @return {validator/ValidityState}
         */
        CompareRule.prototype.check = function (value, control) {
            var target = this.getLimitCondition(control);
            var targetValue = control.viewContext.get(target).getValue();

            return new ValidityState(
                value === targetValue,
                this.getErrorMessage(control)
            );
        };

        require('esui/lib').inherits(CompareRule, Rule);
        require('esui/main').registerRule(CompareRule, 900);
        return CompareRule;
    }
);