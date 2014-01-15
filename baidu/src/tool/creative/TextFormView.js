/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 创意表单视图类
 * @author liyidong(srhb18@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var BaseFormView = require('./BaseFormView');
        var util = require('er/util');
        var u = require('underscore');

        require('tpl!./tpl/textForm.tpl.html');

        /**
         * 创意表单视图类
         *
         * @constructor
         * @extends common/FormView
         */
        function TextFormView() {
            BaseFormView.apply(this, arguments);
        }

        util.inherits(TextFormView, BaseFormView);

        /** 
         * 使用的模板名称
         *
         * @type {string}
         */
        TextFormView.prototype.template = 'textForm';

        /**
         * 从表单中获取实体数据
         *
         * @return {Object}
         */
        TextFormView.prototype.getEntity = function () {
            var entity =
                BaseFormView.prototype.getEntity.apply(this, arguments);
            
            defaultStyleValue = entity.defaultStyle;
            entity.defaultBold = defaultStyleValue.bold ? 1 : 0;
            entity.defaultItalic = defaultStyleValue.italic ? 1 : 0;
            entity.defaultUnderline = defaultStyleValue.underline ? 1 : 0;
            entity.fontSize = defaultStyleValue.size;
            entity.defaultColor = defaultStyleValue.color;
            delete entity.defaultStyle;

            // 获取悬浮样式数据
            hoverStyleValue = entity.hoverStyle;
            entity.hoverBold = hoverStyleValue.bold ? 1 : 0;
            entity.hoverItalic = hoverStyleValue.italic ? 1 : 0;
            entity.hoverUnderline = hoverStyleValue.underline ? 1 : 0;
            entity.hoverColor = hoverStyleValue.color;
            delete entity.hoverStyle;

            // 转换目标窗口数据格式
            entity.targetWindow = parseInt(entity.targetWindow[0], 10);

            // 展开XML扩展标签数据
            if (entity.xmlExt) {
                u.extend(entity, entity.xmlExt);
            }
            
            return u.omit(entity, 'xmlExt', 'defaultStyle', 'hoverStyle');
        };

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

        /**
         * 更新预览
         *
         */
        function updatePreview() {
            var defaultStyle = this.get('default-style');
            var hoverStyle = this.get('hover-style');
            var words = this.get('text-words');
            var wordsValue = words.getValue();

            var defaultStyleValue = defaultStyle.getRawValue();
            var style = {};
            defaultStyleValue.bold 
                ? style['font-weight'] = 'bolder'
                : style['font-weight'] = 'normal';
            defaultStyleValue.italic
                ? style['font-style'] = 'italic'
                : style['font-style'] = '';
            defaultStyleValue.underline
                ? style['text-decoration'] = 'underline'
                : style['text-decoration'] = 'none';
            style['font-size'] = defaultStyleValue.size + 'px';
            style['color'] = '#' + defaultStyleValue.color;
            var styleString = '';
            u.each(
                style,
                function (value, key) {
                    styleString = styleString + key + ':' + value + ';';
                }
            );
            var styleCode = '';
            u.each(
                style,
                function (value, key) {
                    styleCode = styleCode 
                        + 'this.style.' + normalizeStyleName(key) + '=\''
                        + value + '\';';
                }
            );

            var hoverStyleValue = hoverStyle.getRawValue();
            var hover = {};
            hoverStyleValue.bold 
                ? hover['fontWeight'] = 'bolder'
                : hover['fontWeight'] = 'normal';
            hoverStyleValue.italic
                ? hover['fontStyle'] = 'italic'
                : hover['fontStyle'] = '';
            hoverStyleValue.underline
                ? hover['textDecoration'] = 'underline'
                : hover['textDecoration'] = 'none';
            hover['fontSize'] = hoverStyleValue.size + 'px';
            hover['color'] = '#' + hoverStyleValue.color;
            var hoverCode = '';
            u.each(
                hover,
                function (value, key) {
                    hoverCode = hoverCode 
                        + 'this.style.' + key + '=\'' + value + '\';';
                }
            );

            var previewHTMLTpl = ''
                + '<span style="' + styleString + '" '
                +     'onmouseover="' + hoverCode + '"'
                +     'onmouseout="' + styleCode + '">'
                +     wordsValue
                + '</span>';

            this.get('text-preview-content').setContent(previewHTMLTpl);
        }

        /**
         * 控件事件配置
         *
         * @type {Object}
         * @override
         */
        TextFormView.prototype.uiEvents = {
            'default-style:change': updatePreview,
            'text-words:input': updatePreview,
            'hover-style:change': updatePreview

        };

        /**
         * 渲染
         *
         * @override
         */
        TextFormView.prototype.enterDocument = function () {
            BaseFormView.prototype.enterDocument.apply(this, arguments);

            var model = this.model;
            
            if (model.get('formType') === 'update') {
                // 刷新一次预览
                updatePreview.call(this);
            }
            
        };
        
        return TextFormView;
    }
);