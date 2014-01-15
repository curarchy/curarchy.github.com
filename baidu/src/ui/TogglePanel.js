/**
 * ESUI (Enterprise Simple UI)
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 折叠控件
 * @author wangyaqiong
 */

define(
    function (require) {
        require('esui/Panel');
        var Control = require('esui/Control');
        var lib = require('esui/lib');
        var helper = require('esui/controlHelper');
        var ui = require('esui/main');

        require('esui/Panel');

        /**
         * 折叠控件
         */
        function TogglePanel() {
            Control.apply(this, arguments);
        }

        TogglePanel.prototype.type = 'TogglePanel';

        /**
         * 创建主元素
         *
         * @return {HTMLElement}
         * @override
         */
        TogglePanel.prototype.createMain = function () {
            return document.createElement('section');
        };

        /**
         * 初始化参数
         *
         * @param {Object} options 构造函数传入的参数
         * @override
         * @protected
         */
        TogglePanel.prototype.initOptions = function (options) {
            var defaults = {
                title: '',
                content: '',
                expanded: false
            };
            var properties = lib.extend(defaults, options);

            var titleElement = lib.dom.first(this.main);
            if (!options.hasOwnProperty('title') && titleElement) {
                properties.title = titleElement.innerHTML;
                this.titleElement = titleElement;
            }

            this.setProperties(properties);
        };

        /**
         * 初始化DOM结构
         *
         * @override
         * @protected
         */
        TogglePanel.prototype.initStructure = function () {
            var titleId = helper.getId(this, 'title');

            var titleElement = this.titleElement;
            if (titleElement) {
                this.titleElement = null;
            }
            else {
                titleElement = document.createElement('h3');
                this.main.insertBefore(titleElement, this.main.firstChild);
            }

            titleElement.id = titleId;
            helper.addPartClasses(this, 'title', titleElement);
            helper.addDOMEvent(this, titleElement, 'click', this.toggle);

            var contentElement = lib.getChildren(this.main).pop();
            // 最后一个元素不是`title`的话就认为是主面板了，否则就要创建一个
            if (!contentElement || contentElement.id === titleId) {
                contentElement = document.createElement('div');
                this.main.appendChild(contentElement);
            }
            helper.addPartClasses(this, 'content', contentElement);

            var options = {
                main: contentElement,
                childName: 'content',
                viewContext: this.viewContext,
                renderOptions: this.renderOptions
            };
            var contentPanel = ui.create('Panel', options);
            contentPanel.render();
            this.addChild(contentPanel);
        };

        /**
         * 重绘
         *
         * @override
         * @protected
         */
        TogglePanel .prototype.repaint = helper.createRepaint(
            Control.prototype.repaint,
            {
                name: 'title',
                paint: function (panel, title) {
                    var titleElement = lib.g(helper.getId(panel, 'title'));
                    titleElement.innerHTML = title;
                }
            },
            {
                name: 'content',
                paint: function (panel, content) {
                    // 如果初次渲染时外部没有给内容，则不对内容面板进行任何动作，
                    // 以便从HTML生成时，本身就放在内容面板中的控件可以正常初始化
                    if (content || helper.isInStage(panel, 'RENDERED')) {
                        var contentPanel = panel.getChild('content');
                        contentPanel.set('content', content);
                    }
                }
            },
            {
                name: 'expanded',
                paint: function (panel, expanded) {
                    var method = expanded ? 'addState' : 'removeState';
                    panel[method]('expanded');
                }
            }
        );

        /**
         * 获取是否展开状态
         *
         * @return {boolean}
         */
        TogglePanel.prototype.getExpanded = function () {
            return this.hasState('expanded');
        };

        /**
         * 切换展开/收起状态
         */
        TogglePanel.prototype.toggle = function () {
            this.toggleState('expanded');
            this.fire('change');
        };
       
        ui.register(TogglePanel);
        lib.inherits(TogglePanel, Control);
        return TogglePanel;
    }
);
