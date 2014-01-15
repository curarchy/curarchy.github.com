/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file Sidebar控件
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    // 当前可用度：
    //
    // - 无HTML的情况下，直接通过js设置`items`等属性渲染未进行测试，项目用不上这些
    // - `searchBox`和`content`应该可用，但未经严格测试，设置模块不需要这些
    function (require) {
        var lib = require('esui/lib');
        var helper = require('esui/controlHelper');
        var ui = require('esui');
        var Control = require('esui/Control');

        require('esui/Panel');
        require('./SearchBox');

        /**
         * Sidebar控件
         *
         * @param {Object=} options 初始化参数
         * @extends esui/Control
         * @constructor
         * @public
         */
        function Sidebar(options) {
            Control.apply(this, arguments);
        }

        Sidebar.prototype.type = 'Sidebar';

        /**
         * 默认属性
         *
         * @type {Object}
         * @public
         */
        Sidebar.defaultProperties = {
            topMargin: 70,
            mode: 'normal' // normal为占位，overlay为不占位
        };

        /**
         * 创建主元素
         *
         * @return {HTMLElement}
         * @override
         * @protected
         */
        Sidebar.prototype.createMain = function () {
            return document.createElement('aside');
        };

        /**
         * 初始化参数
         *
         * @param {Object=} options 构造函数传入的参数
         * @override
         * @protected
         */
        Sidebar.prototype.initOptions = function (options) {
            var properties = {
                expanded: true,
                items: []
            };
            lib.extend(properties, Sidebar.defaultProperties, options);

            this.setProperties(properties);
        };

        /**
         * 修改隔壁的元素的样式，给侧边栏空出足够位置
         *
         * @param {Sidebar} sidebar 侧边栏控件实例
         */
        function adjustNeighbour(sidebar) {
            // 侧边栏收起时一定处在`overlay`模式，
            // 因此展开状态下仅在`normal`模式下计算，在收起状态下永远计算
            if (!sidebar.hasState('expanded') || sidebar.mode === 'normal') {
                var neighbour = lib.dom.next(sidebar.main);
                if (neighbour) {
                    // TODO: 如果有`transition`，这里取值是不正确的
                    neighbour.style.marginLeft = 
                        sidebar.main.offsetWidth + 'px';
                }
            }
        }

        /**
         * 收起或展开面板
         *
         * @param {Sidebar} this 面板控件实例
         */
        function toggleMode() {
            // 固定占位下没有收缩展开的逻辑
            if (this.hasState('fixed')) {
                return;
            }
            
            // 占位状态下，点按钮要缩小侧边栏，然后转为非占位模式；
            // 非占位模式下，能点到按钮一定是在展开状态下，则不缩小边栏，但转到占位模式
            if (this.mode === 'normal') {
                this.removeState('expanded');
                this.mode = 'overlay';
                this.addState('overlay');
            }
            else {
                this.removeState('overlay');
                this.mode = 'normal';
            }

            adjustNeighbour(this);
            this.fire('modechange');
        }

        /**
         * 控制收起和展开
         *
         * @param {Event} e DOM事件对象
         */
        function toggle(e) {
            // 固定占位下没有收缩展开的逻辑
            if (this.hasState('fixed')) {
                return;
            }

            var relatedTarget = e.relatedTarget;
            while (relatedTarget && relatedTarget !== this.main) {
                relatedTarget = relatedTarget.parentNode;
            }

            if (relatedTarget === this.main) {
                return;
            }

            // 仅悬浮状态下，才会根据鼠标移入和移出进行收缩展开操作
            if (this.mode === 'overlay') {
                var method = 
                    e.type === 'mouseover' ? 'addState' : 'removeState';
                this[method]('expanded');
            }
        }

        /**
         * 调整侧边栏位置，保持上边距并占满高度
         */
        function adjustPosition() {
            var scrollTop = lib.page.getScrollTop();
            this.main.style.top = 
                Math.max(this.topMargin - scrollTop, 0) + 'px';
        }

        /**
         * 创建搜索框
         *
         * @param {Sidebar} sidebar 侧边栏控件实例
         * @param {HTMLElement} main 创建控件的主元素
         * @param {HTMLElement=} placeholder 放置控件的位置，如果没有则直接渲染
         */
        function createSearchBox(sidebar, main, placeholder) {
            var options = {
                main: main,
                childName: 'searchBox',
                viewContext: sidebar.viewContext
            };
            var searchBox = ui.create('SearchBox', options);
            sidebar.addChild(searchBox);
            if (placeholder) {
                searchBox.insertBefore(placeholder);
            }
            else {
                searchBox.render();
            }
            helper.addPartClasses(sidebar, 'search-box', searchBox.main);
        }

        /**
         * 创建内容面板
         *
         * @param {Sidebar} sidebar 侧边栏控件实例
         * @param {HTMLElement} main 创建控件的主元素
         * @param {HTMLElement=} placeholder 放置控件的位置，如果没有则直接渲染
         */
        function createContentPanel(sidebar, main, placeholder) {
            var options = {
                main: main,
                childName: 'content',
                viewContext: sidebar.viewContext,
                renderOptions: sidebar.renderOptions
            };
            var contentPanel = ui.create('Panel', options);
            sidebar.addChild(contentPanel);
            if (placeholder) {
                contentPanel.insertBefore(placeholder);
            }
            else {
                contentPanel.render();
            }
            helper.addPartClasses(sidebar, 'content', contentPanel.main);
        }

        /**
         * 基于已有DOM结构构建控件
         *
         * @param {Sidebar} sidebar 侧边栏控件实例
         */
        function buildInplaceStructure(sidebar) {
            var items = [];

            var markActive = function (index) {
                var lastItem = items[index];
                if (lastItem) {
                    lastItem.active = true;
                }

                var titleElement = 
                    sidebar.main.getElementsByTagName('h3')[items.length - 1];
                helper.addPartClasses(
                    sidebar, 'item-title-active', titleElement);

                // 只用一次
                markActive = function () {};
            };

            var children = lib.getChildren(sidebar.main);
            // 规则：
            // 
            // - 每一个`<h3>`作为一个标题
            // - 搜索框和主内容通过`data-role`属性设置
            // - 如果标题有`data-active="active"`，则作为激活的
            // - 如果一个标题在搜索框或主内容前面，则该标题作为激活的
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                var nodeName = child.nodeName.toLowerCase();
                var role = lib.getAttribute(child, 'data-role');
                if (nodeName === 'h3') {
                    var link = child.getElementsByTagName('a')[0];
                    var item = {
                        text: lib.getText(child),
                        href: link ? link.getAttribute('href', 2) : ''
                    };
                    items.push(item);

                    // 加上对应的class
                    helper.addPartClasses(sidebar, 'item-title', child);
                    // 如果用户指定为激活的，则激活之
                    if (lib.getAttribute(child, 'data-active')) {
                        markActive(i);
                    }
                }
                else if (role === 'content') {
                    markActive(items.length - 1);
                    createContentPanel(sidebar, child);
                }
                else if (role === 'search-box') {
                    markActive(items.length - 1);
                    createSearchBox(sidebar, child);
                }
            }

            sidebar.items = items;
        }

        /**
         * 根据控件配置生成DOM结构
         *
         * @param {Sidebar} sidebar 侧边栏控件实例
         */
        function buildDOMStructure(sidebar) {
            var itemTemplate = '<h3 class="${classes}">${text}</h3>';
            var linkItemTemplate = '<h3 class="${classes}">'
                + '<a href="${href}">${text}</a>'
                + '</h2>';

            // 规则见上面那个函数
            var activeIndex = 0;
            var html = '';
            for (var i = 0; i < sidebar.items.length; i++) {
                var item = sidebar.items[i];

                if (item.active) {
                    activeIndex = i;
                }

                var data = {
                    text: lib.encodeHTML(item.text),
                    href: lib.encodeHTML(item.href),
                    classes: helper.getPartClasses(sidebar, 'item-title')
                };
                if (item.active) {
                    data.classes = data.classes.concat(
                        helper.getPartClasses(sidebar, 'item-title-active'));
                }
                data.classes = data.classes.join(' ');

                html += lib.format(
                    data.href ? linkItemTemplate : itemTemplate,
                    data
                );
            }

            sidebar.main.innerHTML = html;

            // 添加搜索框和内容面板
            var activeTitleElement = 
                sidebar.main.getElementsByTagName('h3')[activeIndex];
            if (activeTitleElement) {
                if (sidebar.searchBox) {
                    var searchBoxMain = document.createElement('div');
                    createSearchBox(sidebar, searchBoxMain, activeTitleElement);
                }

                var contentMain = document.createElement('div');
                createContentPanel(sidebar, contentMain, activeTitleElement);
            }
        }

        /**
         * 初始化DOM结构
         *
         * @override
         * @protected
         */
        Sidebar.prototype.initStructure = function () {
            // 只支持2种模式，要么全部从HTML中生成，要么全部从JS中生成，不支持混合
            var children = lib.getChildren(this.main);
            if (children.length) {
                buildInplaceStructure(this);
            }
            else {
                buildDOMStructure(this);
            }

            // 再给加上一个按钮用以控制收缩展开
            var button = document.createElement('span');
            button.id = helper.getId(this, 'button');
            button.className = 
                helper.getPartClasses(this, 'button').join(' ');
            this.main.appendChild(button);

            helper.addDOMEvent(
                this,
                lib.g(helper.getId(this, 'button')),
                'click',
                lib.bind(toggleMode, this)
            );
            helper.addDOMEvent(
                this,
                this.main,
                'mouseover',
                lib.bind(toggle, this)
            );
            helper.addDOMEvent(
                this,
                this.main,
                'mouseout',
                lib.bind(toggle, this)
            );

            this.adjustPosition = lib.bind(adjustPosition, this);
            // `helper`绑的`scroll`事件是有`debounce`效果的，
            // 这会影响滚动时侧边栏的位置调整，显得调整相对滞后，因此这里直接绑定事件
            lib.on(window, 'scroll', this.adjustPosition);
        };

        /**
         * 渲染自身
         *
         * @override
         * @protected
         */
        Sidebar.prototype.repaint = helper.createRepaint(
            Control.prototype.repaint,
            {
                // 展开状态
                name: 'expanded',
                paint: function (sidebar, expanded) {
                    var method = expanded ? 'addState' : 'removeState';
                    sidebar[method]('expanded');

                    adjustNeighbour(sidebar);
                }
            },
            {
                // 主内容，由一个`Panel`控件接手
                name: 'content',
                paint: function (sidebar, content) {
                    if (content != null) {
                        this.getChild('content').setContent(content);
                    }
                }
            },
            {
                // 上边距
                name: 'topMargin',
                paint: function (sidebar, topMargin) {
                    sidebar.adjustPosition();
                }
            },
            {
                // 是否固定占位，即无法收缩和展开
                name: 'fixed',
                paint: function (sidebar, fixed) {
                    var method = fixed ? 'addState' : 'removeState';
                    sidebar[method]('fixed');
                }
            }
        );

        Sidebar.prototype.dispose = function () {
            lib.un(window, 'scroll', this.adjustPosition);
            Control.prototype.dispose.apply(this, arguments);
        };

        lib.inherits(Sidebar, Control);
        ui.register(Sidebar);
        return Sidebar;
    }
);
