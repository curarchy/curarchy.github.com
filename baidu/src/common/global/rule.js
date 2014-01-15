/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 定义各中常用的验证规则常量
 * @author liyidong(srhb18@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var u = require('underscore');

        var ruleMap = {
            /**
             * 默认的inputText最大长度
             */
            defaultMaxLength: 100,

            /**
             * 默认的mail字段最大长度
             */
            mailMaxLength: 64,

            /**
             * 默认的description说明字段最大长度
             */
            descriptionMaxLength: 4000,

            /**
             * 电子邮件地址正则
             */
            mailPattern: /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/,

            /**
             * 电话号码，可为空，区号和分机号可选
             * 格式{3到4位区号}-{7到8位号码}-{3到5位分机号}
             */
            phonePattern: /^((0\d{2,3})-)(\d{7,8})(-(\d{3,}))?$/,

            /**
             * 手机号码，以13、14、15、18开头的11位数字
             */
            mobilePattern: /^(1(3|4|5|8)\d{9})?$/,

            /**
             * url网址
             */
            /* jshint maxlen: 120 */
            urlPattern: /^(?:https?|ftp|wap):\/\/.+$|^(?!(?:https?|ftp|wap):\/\/).+$/,

            /**
             * url网址
             */
            urlLength: 1000
        };

        /*
         * 对ruleMap做适配
         * 将所有value转换成字符串
         */
        function adapte(ruleMap) {
            var adaptedRuleMap = {};
            u.each(
                ruleMap, 
                function (value, key) {
                    if (u.isRegExp(value)) {
                        adaptedRuleMap[key] = 
                            value.toString().replace(/\//g, '');
                    }
                    else {
                        adaptedRuleMap[key] = value.toString();
                    }
                }
            );
            return adaptedRuleMap;
        }

        var adaptedRuleMap = adapte(ruleMap);
        /*
         * 对外暴露的模块接口
         *
         * @parma {string}* rule 使用的规则，为空使用全部规则
         */
        function use() { 
            var rules = u.toArray(arguments);
            rules.unshift(adaptedRuleMap);
            if (arguments) {
                // 有选择返回
                return u.pick.apply(u, rules);
            }
            else {
                // 返回全部
                return u.clone(adaptedRuleMap);
            }
        }

        return {
            use: use
        };
    }
);