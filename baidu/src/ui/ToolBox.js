/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file ToolBox
 * @author Exodia(dengxinxin@baidu.com)
 * @date 13-10-14
 */
define(
    function (require) {
        var lib = require('esui/lib');
        var helper = require('esui/controlHelper');
        var Control = require('esui/Control');
        var u = require('underscore');

        var CLASSES = null;

        /**
         * 创建子项字符串
         *
         * @param {ToolBox} toolbox 工具箱控件实例
         * @return {String}
         */
        function createItemsHTML(toolbox) {
            var data = toolbox.items;
            var html = '<ul class="' + CLASSES.list + '">';
            var template = toolbox.itemTemplate;

            u.each(data, function (item, id) {
                var type = toolbox.helper.getPartClassName(item.type);
                html += lib.format(
                    template,
                    {
                        id: id,
                        text: item.text,
                        itemCls: CLASSES.item,
                        anchorCls: CLASSES.anchor,
                        typeCls: type
                    }
                );
            });

            return html + '</ul>';
        }

        /**
         * 创建控件实例的头部 html 字符串
         *
         * @param toolbox
         * @returns {string}
         */
        function createHeaderHTML(toolbox) {
            return '<h3 class="' + toolbox.helper.getPartClassName('title')
                + '">' + toolbox.title + '</h3>';
        }

        /**
         * 根据数据源设置控件实例的 items
         *
         * @param toolbox
         * @param datasource
         */
        function setItems(toolbox, datasource) {
            var items = {};
            u.each(datasource, function (item) {
                var id = helper.getId(toolbox, item.id);
                items[id] = lib.extend({}, item);
            });

            toolbox.items = items;
        }

        /**
         * 工具项点击处理函数
         *
         * @param {Event} e
         */
        function bodyClick(e) {
            e.preventDefault();

            var el = e.target;
            var cls = CLASSES.item;
            while (el !== e.currentTarget) {
                if (lib.hasClass(el, cls)) {
                    var ev = {
                        item: lib.extend({}, this.getItem(el.id))
                    };
                    this.fire('itemclick', ev);
                    return;
                }

                el = el.parentNode;
            }
        }

        /**
         * ToolBox 控件
         *
         * @extends esui/Control
         * @param {Object=} options 初始化参数
         * @constructor
         */
        function ToolBox(options) {
            Control.apply(this, arguments);
            if (!CLASSES) {
                CLASSES = {
                    list: this.helper.getPartClassName('item-list'),
                    item: this.helper.getPartClassName('item'),
                    anchor: this.helper.getPartClassName('item-anchor'),
                    head: this.helper.getPartClassName('hd'),
                    body: this.helper.getPartClassName('bd')
                };
            }
        }

        ToolBox.prototype.type = 'ToolBox';

        ToolBox.prototype.itemTemplate =
            '<li class="${itemCls}" id="${id}">' +
                '<a href="#" class="${anchorCls} ${typeCls}">${text}</a></li>';

        /**
         * 初始化参数
         *
         * @param {Object=} options 构造函数传入的参数
         * @override
         * @protected
         */
        ToolBox.prototype.initOptions = function (options) {
            options = lib.extend(
                { title: '', expanded: false, datasource: [], attaches: [] },
                options
            );

            setItems(this, options.datasource);
            this.setProperties(options);
        };

        /**
         * 初始化DOM结构
         *
         * @override
         * @protected
         */
        ToolBox.prototype.initStructure = function () {
            var main = this.main;

            main.innerHTML = '<div class="' + CLASSES.head + '">'
                + '</div><div class="' + CLASSES.body + '"></div>';

            var header = lib.dom.first(main);
            var body = lib.dom.last(main);

            header.innerHTML = createHeaderHTML(this);
            body.innerHTML = createItemsHTML(this);
            this.get('expanded') && this.addState('expanded');

            helper.addDOMEvent(this, header, 'click', this.toggle);
            helper.addDOMEvent(this, body, 'click', bodyClick);
        };

        ToolBox.prototype.repaint = helper.createRepaint(
            Control.prototype.repaint,
            {
                name: 'datasource',
                paint: function (toolbox, data) {
                    if (!helper.isInStage(toolbox, 'RENDERED')) {
                        return;
                    }
                    setItems(toolbox, data);
                    lib.last(toolbox.main).innerHTML = createItemsHTML(toolbox);
                }
            }
        );


        /**
         * 根据 id 获取对应的 item
         *
         * @param id
         * @returns {*|Object|null}
         */
        ToolBox.prototype.getItem = function (id) {
            return this.items[id] || null;
        };

        /**
         * 展开工具箱
         */
        ToolBox.prototype.expand = function () {
            this.addState('expanded');
        };

        /**
         * 折叠工具箱
         */
        ToolBox.prototype.collapse = function () {
            this.removeState('expanded');
        };

        /**
         * 根据工具箱的展开/折叠情况做反向操作
         */
        ToolBox.prototype.toggle = function () {
            this[this.hasState('expanded') ? 'collapse' : 'expand']();
        };


        ToolBox.prototype.attach = function (control) {
            this.attaches.push(control);
        };

        ToolBox.prototype.disposeAttach = function () {
            u.each(this.attaches, function (control) {
                control.destroy();
            });
            this.attaches.length = 0;
        };

        ToolBox.prototype.dispose = function () {
            this.disposeAttach();
            Control.prototype.dispose.apply(this, arguments);
        };

        lib.inherits(ToolBox, Control);
        require('esui').register(ToolBox);
        return ToolBox;
    }
);