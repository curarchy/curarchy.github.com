/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file Session信息存储模块
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var session = {};

        return {
            /**
             * 获取对应值
             *
             * @param {string} key 键名
             * @return {Mixed}
             */
            get: function (key) {
                var result = session[key];

                if (!result) {
                    return undefined;
                }

                if (result.once) {
                    this.remove(key);
                }

                return result.value;
            },

            /**
             * 设置对应值
             *
             * @param {string} key 键名
             * @param {Mixed} value 对应的值
             */
            set: function (key, value) {
                session[key] = { value: value };
            },

            /**
             * 设置一个只能读取一次的值
             *
             * @param {string} key 键名
             * @param {Mixed} value 对应的值
             */
            once: function (key, value) {
                session[key] = {
                    value: value,
                    once: true
                };
            },

            /**
             * 删除对应值
             *
             * @param {string} key 键名
             * @return {boolean} 如果确实删除的内容则返回`true`
             */
            remove: function (key) {
                var result = session[key];
                session[key] = null;

                return !!result;
            }
        };
    }
);