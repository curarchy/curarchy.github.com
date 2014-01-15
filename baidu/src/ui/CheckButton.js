/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 勾选性按钮控件
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var lib = require('esui/lib');
        var helper = require('esui/controlHelper');
        var CheckBox = require('esui/CheckBox');

        /**
         * 勾选性按钮控件
         *
         * @param {Object=} options 初始化参数
         * @extends esui/CheckBox
         * @constructor
         */
        function CheckButton(options) {
            CheckBox.apply(this, arguments);
        }

        CheckButton.prototype.type = 'CheckButton';

        // 这货是个纯功能性控件，只管一个`checked`状态，不用`skin`就没有任何样式

        /**
         * 创建主元素
         *
         * @protected
         * @override
         */
        CheckButton.prototype.createMain = function () {
            return document.createElement('div');
        };

        /**
         * 初始化DOM结构
         *
         * @override
         * @protected
         */
        CheckButton.prototype.initStructure = function () {
            // 如果用的是一个`<input>`，替换成`<div>`
            if (this.main.nodeName.toLowerCase() === 'input') {
                this.boxId = this.main.id || helper.getId(this, 'box');
                helper.replaceMain(this);
            }
            else {
                this.boxId = helper.getId(this, 'box');
            }

            // 内部只放一个复选框
            var html = '<input type="checkbox" name="${name}" id="${id}" />';
            this.main.innerHTML = lib.format(
                html,
                {
                    name: this.name,
                    id: this.boxId
                }
            );

            helper.addDOMEvent(this, this.main, 'click', this.toggleChecked);
        };

        /**
         * 更新标题
         *
         * @param {string} title 标题
         * @override
         */
        CheckButton.prototype.updateTitle = function (title) {
            lib.setAttribute(this.main, 'title', title);
        };

        /**
         * 渲染自身
         *
         * @override
         * @protected
         */
        CheckButton.prototype.repaint = helper.createRepaint(
            CheckBox.prototype.repaint,
            {
                name: 'checked',
                paint: function (button, checked) {
                    if (checked) {
                        button.addState('checked');
                    }
                    else {
                        button.removeState('checked');
                    }
                }
            }
        );

        /**
         * 获取焦点元素
         *
         * @override
         */
        CheckButton.prototype.getFocusTarget = function () {
            // 不能直接聚焦，因此不返回任何元素
            return null;
        };

        /**
         * 切换选中状态
         */
        CheckButton.prototype.toggleChecked = function () {
            var checked = this.isChecked();
            this.setChecked(!checked);
        };

        lib.inherits(CheckButton, CheckBox);
        require('esui').register(CheckButton);
        return CheckButton;
    }
);
