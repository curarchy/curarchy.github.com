/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 新建订单切换控件
 * @author wangyaqiong(catkin2009@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var lib = require('esui/lib');
        var helper = require('esui/controlHelper');
        var Tab = require('esui/Tab');

        /**
         * OrderSwitchTab控件
         *
         * @param {Object=} options 初始化参数
         * @extends esui/Tab
         * @constructor
         */
        function OrderSwitchTab(options) {
            Tab.apply(this, arguments);
        }

        OrderSwitchTab.prototype.type = 'OrderSwitchTab';

        //OrderSwitchTab.prototype.styleType = 'Tab';

        /**
         * 初始化参数
         *
         * @param {Object} options 构造函数传入的参数
         * @protected
         */
        OrderSwitchTab.prototype.initOptions = function (options) {
            var properties = {
                tabs: [],
                activeIndex: 0,
                allowClose: false,
                hidenav: '',
                orientation: 'horizontal'
            };

            lib.extend(properties, options);

            var children = lib.getChildren(this.main);
            if (children.length) {
                var tabs = [];
                for (var i = 0; i < children.length; i++) {
                    var element = children[i];
                    if (element.getAttribute('data-role') === 'navigator') {
                        properties.tabs = [];
                        this.navigatorElement = element;
                        var children = lib.getChildren(element);
                        for (var i = 0; i < children.length; i++) {
                            var tab = children[i];
                            var config = {
                                title: lib.getText(tab),
                                panel: tab.getAttribute('data-for'),
                                description: tab.getAttribute('description')
                            };
                            properties.tabs.push(config);
                        }
                        break;
                    }
                    else {
                        var config = {
                            title: element.getAttribute('title'),
                            panel: element.id,
                            description: element.getAttribute('description')
                        };
                        tabs.push(config);
                    }
                }
                if (!properties.tabs.length) {
                    properties.tabs = tabs;
                }
            }
            this.setProperties(properties);
        };

        /**
         * 标签页内容的模板
         *
         * @type {string}
         * @public
         */
        OrderSwitchTab.prototype.contentTemplate = 
            '<div class="${tabClasses}">'
            +	'<span class="${titleClasses}">${title}</span>'
            +	'<span class="${desClasses}">${description}</span>'
            +   '<div class="${bottomClasses}"></div>'
            + '</div>';

        /**
         * 获取标签页内容的HTML
         *
         * @param {Object} config 标签页数据项
         * @return {string}
         * @public
         */
        OrderSwitchTab.prototype.getContentHTML = function (config) {
            var getClasses = helper.getPartClasses;
            var tabClasses = getClasses(this, 'order-tab').join(' ');
            var panelClasses = getClasses(this, config.panel).join(' ');
            var titleClasses = getClasses(this, 'order-title').join(' ');
            var desClasses = getClasses(this, 'order-description').join(' ');
            var bottomClasses = getClasses(this, 'order-bottom').join(' ');
            var html = lib.format(
                this.contentTemplate,
                {
                    tabClasses: tabClasses + ' ' + panelClasses,
                    titleClasses: titleClasses,
                    desClasses: desClasses,
                    bottomClasses: bottomClasses,
                    title: lib.encodeHTML(config.title),
                    description: lib.encodeHTML(config.description)
                }
            );
            return html;
        };

        OrderSwitchTab.prototype.initStructure = function () {
            Tab.prototype.initStructure.apply(this, arguments);
            var navigator = this.helper.getPart('navigator');
            if (this.hidenav == 'hidden') {
                navigator.style.display = 'none';
            }
        };

        lib.inherits(OrderSwitchTab, Tab);
        require('esui').register(OrderSwitchTab);
        return OrderSwitchTab;
    }
 );