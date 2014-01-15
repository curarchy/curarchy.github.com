/**
 * ESUI (Enterprise UI)
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 验证其他定向设置来源url
 * @author exodia(dengxinxin@baidu.com)
 */
define(
    function (require) {
        var Rule = require('esui/validator/Rule');
        var ValidityState = require('esui/validator/ValidityState');

        /**
         * OrientUrlRule类声明
         *
         * @constructor
         */
        function OrientUrlRule() {
            Rule.apply(this, arguments);
        }

        /**
         * 规则类型
         *
         * @type {string}
         */
        OrientUrlRule.prototype.type = 'orientUrl';

        OrientUrlRule.prototype.errorMessage = [
            'url超过100字符: 单个 url 不能超过100字符',
            'url条数超过100: url 最多配置100个'
        ];

        OrientUrlRule.prototype.getErrorMessage = function (control, type) {
            return this.errorMessage[type];
        };

        /**
         * 验证控件的验证状态
         *
         * @param {string} value 校验值
         * @param {Control} control 待校验控件
         *
         * @return {validator/ValidityState}
         */
        OrientUrlRule.prototype.check = function (value, control) {
            var targetValue = this.getLimitCondition(control);
            value = value.split('\n');
            var len = value.length;
            if (len > targetValue) {
                return new ValidityState(
                    false,
                    this.getErrorMessage(control, 1)
                );
            } else {
                while (--len > -1) {
                    if (value[len].length > targetValue) {
                        return new ValidityState(
                            false,
                            this.getErrorMessage(control, 0)
                        );
                    }
                    --len;
                }
            }

            return new ValidityState(true, this.getErrorMessage(control, 1));
        };

        require('esui/lib').inherits(OrientUrlRule, Rule);
        require('esui/main').registerRule(OrientUrlRule, 900);
        return OrientUrlRule;
    }
);