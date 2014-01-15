/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file XML扩展标签表单区域视图
 * @author liyidong(srhb18@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var UIView = require('ef/UIView');
        var util = require('er/util');
        var u = require('underscore');

        require('tpl!./tpl/xmlExtField.tpl.html');

        /**
         * 上传文件的表单区域视图
         *
         * @constructor
         * @extends ef/UIView
         */
        function XMLExtFieldView() {
            UIView.apply(this, arguments);
        }

        util.inherits(XMLExtFieldView, UIView);

        /**
         * 模板目标名称
         *
         * @type {string}
         * @override
         */
        XMLExtFieldView.prototype.template = 'xmlExtField';

        /**
         * 隐藏或展开XML标签Panel
         *
         */
        function toggleXMLExtWarpper() {
            xmlExtPanel = this.get('warpper');
            xmlExtFlag = this.get('flag');
            xmlExtGroup = this.getGroup('xml-exts');
            if (xmlExtFlag.isChecked()) {
                xmlExtPanel.show();
                xmlExtGroup.enable();
            }
            else {
                xmlExtPanel.hide();
                xmlExtGroup.disable();
            }
        }

        /**
         * 获取实体
         *
         * @return {Object}
         */
        XMLExtFieldView.prototype.getEntity = function () {
            var entity = {};

            entity.cbExtFlag = this.get('flag').isChecked() ? 1 : 0;
            // 转化xml扩展标签flag格式
            if (entity.cbExtFlag) {
                // 获取扩展标签内容
                // for (var i = 0; i < 3; i++) {
                //     var currentValue = this.get('xml-ext' + i).getValue();
                //     entity['cbExt[' + i + ']'] = currentValue;
                // }
                u.each(
                    this.getGroup('xml-exts'),
                    function (input, index) { 
                        entity['cbExt[' + index + ']'] = input.getValue();
                    }
                );
            }

            // 如果上个标签栏一个都没填，把flag置0
            if (
                u.all([
                    !entity['cbExt[0]'], 
                    !entity['cbExt[1]'], 
                    !entity['cbExt[2]']
                ])
            ) {
                entity.cbExtFlag = 0;
            }

            return entity;
        };

        /**
         * 控件事件配置
         *
         * @type {Object}
         * @override
         */
        XMLExtFieldView.prototype.uiEvents = {
            'flag:change': toggleXMLExtWarpper
        };

        /**
         * 文档准备完毕时调用
         *
         * @override
         */
        XMLExtFieldView.prototype.enterDocument = function () {
            UIView.prototype.enterDocument.apply(this, arguments);

            var model = this.model;
            
            if (model.get('formType') === 'update') {
                // 设置XML标签的展开状态
                if (model.get('cbExtFlag')) {
                    this.get('flag').setChecked(true);
                    toggleXMLExtWarpper.call(this);
                }
            }

            toggleXMLExtWarpper.call(this);
        };

        /**
         * 获取视图名称
         *
         * @return {string}
         * @protected
         * @override
         */
        XMLExtFieldView.prototype.getViewName = function () {
            var name = UIView.prototype.getViewName.apply(this, arguments);

            var creativeType = this.model.get('creativeType');
            if (creativeType) {
                name = creativeType + '-' + name;
            }

            return name;
        };

        return XMLExtFieldView;
    }
);        
