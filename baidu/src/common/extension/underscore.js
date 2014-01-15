/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file underscore扩展
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var u = require('underscore');
        // 一个空对象，减少每次生成空对象的损耗，注意别改这个对象
        var empty = {};

        // 模板配置
        u.templateSettings = {
            interpolate: /\$\{(.+?)\}/g, // `${name}`直接输出
            escape: /\$\{\:(.+?)\}/g // `${:name}`提供HTML转义
        };

        /**
         * 去前后空格
         *
         * @param {string} s 字符串
         * @return {string}
         */
        u.trim = function (s) {
            return s.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
        };

        /**
         * 深度复制一个对象
         *
         * @param {Mixed} obj 任何对象
         * @return {Mixed} 复制后的对象
         */
        u.deepClone = function (obj) {
            // 非对象以及函数就直接返回
            if (!u.isObject(obj) || u.isFunction(obj)) {
                return obj;
            }

            if (u.isArray(obj)) {
                return u.map(obj, u.deepClone);
            }

            var clone = {};
            u.each(
                obj,
                function (value, key) {
                    clone[key] = u.deepClone(value);
                }
            );
            return clone;
        };

        /**
         * 把一个单词复数化
         *
         * @param {string} word 单词
         * @return {string}
         * @inner
         */
        u.pluralize = function (word) {
            return word.replace(/y$/, 'ie') + 's';
        };
        u.pluralize = u.memoize(u.pluralize);

        /**
         * 去除掉对象中无值的键，并返回一个新的对象，不对原对象产生影响
         * 
         * 空字符串、`null`和`undefined`作为无值对待
         *
         * @param {Object} object 传入的对象
         * @parma {Object=} defaults 针对每个键，可设置当符合该值时去除
         * @param {boolean=} deep 是否递归调用，默认为`false`
         * @return {Object}
         */
        u.purify = function (object, defaults, deep) {
            defaults = defaults || empty;
            var purifiedObject = {};
            u.each(
                object,
                function (value, key) {
                    var isDefaultNull = 
                        value == null || value === '';
                    var isInDefaults = 
                        defaults.hasOwnProperty(key) && defaults[key] === value;
                    if (!isDefaultNull && !isInDefaults) {
                        if (deep && typeof value === 'object') {
                            purifiedObject[key] = 
                                u.purify(value, defaults[key], deep);
                        }
                        else {
                            purifiedObject[key] = value;
                        }
                    }
                }
            );
            return purifiedObject;
        };

        /**
         * 合并多个对象，返回合并后的对象
         *
         * @param {Object} source 源对象
         * @param {Object...} args 待合并的对象
         * @return {Object}
         */
        u.merge = function (source) {
            if (arguments.length === 2) {
                u.each(
                    arguments[1],
                    function (value, key) {
                        var original = source[key];
                        // 如果两边都是对象，就合并在一起
                        if (u.isObject(original) && u.isObject(value)) {
                            source[key] = u.merge(original, value);
                        }
                        else {
                            source[key] = value;
                        }
                    }
                );
            }
            else {
                for (var i = 1; i < arguments.length; i++) {
                    u.merge(source, arguments[i]);
                }
            }
            return source;
        };

        /**
         * 为数值加上千位分隔符
         * @param {number} money 需要格式化的金额
         * @return {string} 格式化后金额字符串
         */
        u.formatMoney = function (money, defaultSlash) {
            if (money == null && defaultSlash) {
                return defaultSlash;
            }
            money = money + '';
            money = money.replace(/^(-?\d*)$/, '$1.');
            money = (money + '00').replace(/(-?\d*\.\d{2})\d*/, '$1');
            money = money.replace('.', ',');
            var re = /(\d)(\d{3},)/;
            while (re.test(money)) {
                money = money.replace(re, '$1,$2');
            }
            money = money.replace(/,(\d{2})$/, '.$1');
            return money.replace(/^-?\./, '0.');
        };

        /**
         * 为数值加上千位分隔符, 保留整数，不要小数
         * @param {string} num 需要格式化的数字
         * @return {string} 格式化后数字符串
         */
        u.formatInt = function (num, defaultSlash) {
            num = this.formatMoney(num, defaultSlash);
            var re = /(\.00)$/;
            return num.replace(re, '');
        };


        /**
         * 为小数值转换为百分号格式, 保留整数，不要小数
         * @param {string} percent 目标数值，如 0.24
         * @param {number} precision 精度 转换为百分值后小数点保留多少位
         * @return {string} 格式化后数字符串
         */
        u.formatPercentage = function (percent, precision) {
            precision = precision || 0;
            var fixedPercent = (parseFloat(percent) * 100).toFixed(precision);
            return fixedPercent + '%';
        };

        /**
         * 为数字补零
         * @param {number} number 目标数值，如 1
         * @param {number} length 目标长度，如 4，则转换成0001
         * @return {string} 格式化后数字符串
         */
        u.addZero = function (number, length) {
            length = length || 2;
            // 先字符串化
            var str = number.toString();
            var gap = length - str.length;
            // 超了
            if (gap <= 0) {
                return str;
            }
            return new Array(length - str.length + 1).join('0') + str;
        };

        /**
         * 获取某天的星期数
         * @param {Date} date 某天
         * @return {string} 星期几
         */
        u.getDayOfWeek = function (date) {
            var daysOfWeek =[
                '星期日', '星期一', '星期二',
                '星期三', '星期四', '星期五', '星期六'
            ];
            var dayOfWeek = daysOfWeek[date.getDay()];
            return dayOfWeek;
        };

        /**
         * hex色值转换成rgba色值
         * @param {string} hex hex色值
         * @param {float} alpha 透明度
         * @return {string} rgba色值
         */
        u.colorRGB = function (hex, alpha) {
            alpha = alpha || 1;
            hex = hex.toLowerCase();
            var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
            if (hex && reg.test(hex)) {
                // 可能是形如“#FFF”的3位hex值，需要转成6位的
                if (hex.length === 4) {
                    var fullHex = '#';
                    for (var i = 1; i < 4; i++) {
                        var hexBit = fullHex.slice(i, i + 1);
                        fullHex += hexBit + hexBit; 
                    }
                    hex = fullHex;
                }
                var rgb = [];
                for (var i = 1; i < 7; i += 2) {
                    rgb.push(parseInt('0x' + hex.slice(i, i + 2), 16));
                }
                return 'rgba(' + rgb.join(',') + ',' + alpha + ')';
            }
            else {
                return hex;  
            }
        };

        /**
         * 返回一个代理函数，用于指定被代理函数调用时的`this`对象和参数。
         * 与`bind`不同，`delegate`不会将调用被代理函数时的参数传递给被代理函数。
         *
         * @param {function} fn 被代理的函数
         * @param {Object} thisObject 调用`fn`时的`this`对象
         * @param {Mixed...} args 调用`fn`时的参数
         * @return {function} 代理函数
         */
        u.delegate = function (fn, thisObject) {
            var args = [].slice.call(arguments, 2);

            return function () {
                return fn.apply(thisObject, args);
            };
        };

        /**
         * 将数组转为一个字典
         *
         * @param {Object[]} array 输入的数组
         * @param {string} keyPropertyName 作为字典的键的属性的名称
         * @param {string|string[]} [properties] 字典中值所包含的属性名或集合
         * @return {Object} 一个字典
         */
        u.toMap = function (array, keyPropertyName, properties) {
            var map = {};
            u.each(
                array,
                function (item) {
                    var key = item[keyPropertyName];
                    if (!properties) {
                        map[key] = item;
                    }
                    else if (u.isArray(properties)) {
                        var args = [item].concat(properties);
                        map[key] = u.pick.apply(u, args);
                    }
                    else {
                        map[key] = item[properties];
                    }
                }
            );
            return map;
        };

        /**
         * 解析日期范围数组
         *
         * @param {string[]} array 日期范围组
         * @return {string[][]}
         */
        u.parseDateRanges = function (array) {
            if (!array) {
                throw new Error('No date ranges given');
            }
            // 数组必须是偶数项
            if (array.length % 2 !== 0) {
                throw new Error('Invalid date range length');
            }

            var stop = array.length / 2;
            var result = [];
            for (var i = 0; i < stop; i++) {
                result.push([array[i * 2], array[i * 2 + 1]]);
            }

            return result;
        };

        /**
         * 字符串省略显示
         *
         * @param {string} str 目标字符串
         * @param {number} len 目标长度
         * @return {string} 截断后字符串
         */
        u.ellipsis = function (str, len) {
            //length属性读出来的汉字长度为1
            if (str.length * 2 <= len) {
                return str;
            }
            var strlen = 0;
            var s = '';
            for (var i = 0; i < str.length; i++) {
                if (str.charCodeAt(i) > 128) {
                    strlen = strlen + 2;
                    if (strlen > len) {
                        return s.substring(0, s.length - 1) + '...';
                    }
                }
                else {
                    strlen = strlen + 1;
                    if (strlen > len) {
                        return s.substring(0, s.length - 2) + '...';
                    }
                }
                s = s + str.charAt(i);
            }
            return s;
        };
    }
);