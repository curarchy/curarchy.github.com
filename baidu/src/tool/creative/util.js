/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 创意库工具函数
 * @author lisijin(ibadplum@gmail.com)
 *
 */
define(
    function () {
        var u = require('underscore');
        var util = {};
        util.getTextPreviewHtml = function (textInfo) {
            var style = {};
            style['font-weight'] = textInfo.defaultBold ? 'bolder' : 'normal';
            style['font-style'] = textInfo.defaultItalic ? 'italic' : '';
            style['text-decoration'] = textInfo.defaultUnderline
                ? 'underline' : 'none';
            style['color'] = '#' + textInfo.defaultColor;
            var styleString = '';
            u.each(
                style,
                function (value, key) {
                    styleString = styleString + key + ':' + value + ';';
                }
            );
            var text = textInfo.words || '';
            var html = ''
                + '<span style="' + styleString + '">'
                +     text
                + '</span>';
            return html;
        }

        /**
         * 统一化样式名
         *
         * @param {string} name 样式名称
         * @return {string} 统一化后camelCase的样式名称
         */
        function normalizeStyleName(name) {
            if (name.indexOf('-') >= 0) {
                name = name.replace(
                    /-\w/g,
                    function (word) {
                        return word.charAt(1).toUpperCase();
                    }
                );
            }

            return name;
        }

        return util;
    }
)