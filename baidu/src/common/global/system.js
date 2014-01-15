/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 全局系统常量模块
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var u = require('underscore');

        function toMap(list, inverted) {
            var map = {};
            u.each(
                list,
                function (item) {
                    if (inverted) {
                        map[item.text] = item.value;
                    }
                    else {
                        map[item.value] = item.text;
                    }
                }
            );
            return map;
        }

        var system =  {
            init: function (info) {
                u.each(
                    info,
                    function (value, key) {
                        system[key] = value;
                        // `sysVariables`是特殊的，表面上看`text`和`value`符合语义，
                        // 但实际上是以`text`为键，`value`为值，与其它的不一样
                        system[key + 'Map'] = 
                            toMap(value, key === 'sysVariables');
                    }
                );
            }
        };

        return system;
    }
);