/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 创意表单视图类
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var FormView = require('common/FormView');
        var util = require('er/util');
        var u = require('underscore');

        // 2个基本肯定会用到的子Action作为依赖加载
        require('./XMLExtField');
        require('./FileField');

        // 通用模板
        require('tpl!./tpl/common.tpl.html');

        // 所有创意的表单视图继承此基类，并有如下限制：
        // 
        // - 所有加载文件上传或者XML扩展标签的`ActionPanel`，
        // 必须设`data-ui-group="child-action"`属性
        // - 上传主物料（如Flash的后备图片就*不是*主物料）的`ActionPanel`必须有：
        //     - `data-ui-name="file"`属性
        //     - `data-ui-id="file"`属性
        //     - `data-ui-action-options="@file"`属性
        // - XML扩展字段的`ActionPanel`必须有：
        //     - `data-ui-name="xmlExt"`属性
        //     - `data-ui-id="xml-ext"`属性
        //     - `data-ui-action-options="@xmlExt"`属性
        // 
        // 可以使用`./tpl/common.tpl.html`中的`target`来引入几个`ActionPanel`

        /**
         * 创意表单视图类
         *
         * @constructor
         * @extends common/FormView
         */
        function BaseFormView() {
            FormView.apply(this, arguments);
        }

        util.inherits(BaseFormView, FormView);

        /**
         * 从表单中获取实体数据
         *
         * @return {Object}
         */
        BaseFormView.prototype.getEntity = function () {
            var entity = FormView.prototype.getEntity.apply(this, arguments);

            if (entity.xmlExt) {
                u.extend(entity, entity.xmlExt);
            }

            if (entity.file) {
                u.extend(entity, entity.file);
            }

            return u.omit(entity, 'xmlExt', 'file');
        };

        var Action = require('er/Action');

        /**
         * 判断一个ActionPanel控件是否已经完成加载
         *
         * @param {ef/ActionPanel} panel 对应的`ActionPanel`控件实例
         * @return {boolean}
         */
        function isActionPanelLoaded(panel) {
            return panel.get('action') instanceof Action;
        }

        /**
         * 确认提交按钮是否可用
         */
        function checkSubmitAvailability() {
            var waitings = this.getGroup('child-action');
            var isAvailable = u.all(waitings, isActionPanelLoaded);
            if (isAvailable) {
                var submit = this.get('submit');
                if (submit) {
                    submit.enable();
                }
            }
        }

        /**
         * 绑定事件
         *
         * @protected
         * @override
         */
        BaseFormView.prototype.bindEvents = function () {
            FormView.prototype.bindEvents.apply(this, arguments);

            // 所有子Action全部加载完毕后才能启用提交按钮
            var enableSubmit = u.bind(checkSubmitAvailability, this);
            u.each(
                this.getGroup('child-action'),
                function (panel) {
                    panel.on('actionloaded', enableSubmit);
                }
            );
        };

        /**
         * 在文档准备完毕后触发
         *
         * @protected
         * @override
         */
        BaseFormView.prototype.enterDocument = function () {
            FormView.prototype.enterDocument.apply(this, arguments);

            // 如果有需要加载的子Action，则先禁用掉提交按钮
            var submit = this.get('submit');
            if (submit && this.getGroup('child-action').length) {
                submit.disable();
            }
        };

        BaseFormView.prototype.getInturnField = function () {
            return this.get('inturn');
        };
        
        return BaseFormView;
    }
);