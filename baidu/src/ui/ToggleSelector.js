/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 可展开收起型选择控件
 * @author lixiang(lixiang05@baidu.com)
 * @date $DATE$
 */

define(
    function (require) {
        require('esui/Panel');
        require('esui/Button');
        require('ui/RichSelector');

        var lib = require('esui/lib');
        var helper = require('esui/controlHelper');
        var InputControl = require('esui/InputControl');
        var u = require('underscore');

        /**
         * 控件类
         *
         * @constructor
         * @param {Object} options 初始化参数
         */
        function ToggleSelector(options) {
            InputControl.apply(this, arguments);
        }


        lib.inherits(ToggleSelector, InputControl);

        ToggleSelector.prototype.type = 'ToggleSelector';

        ToggleSelector.prototype.initOptions = function (options) {
            var properties = {
                height: 340,
                width: 200,
                title: '请选择',
                datasource: [],
                emptyText: '没有相应的搜索结果',
                itemName: '结果', // 这个字段是对腿部信息的填充
                canSelectNone: false
            };

            if (options.value) {
                options.rawValue = {id: options.value};
            }

            lib.extend(properties, options);
            properties.width = Math.max(200, properties.width);

            this.setProperties(properties);
        };


        ToggleSelector.prototype.initStructure = function () {
            var selectorTpl = [
                // 展示
                '<div data-ui-type="Button" ',
                '   data-ui-skin="select" data-ui-width="${resultWidth}"',
                '   data-ui-child-name="result" title="${title}">',
                '   ${title}</div>',
                // 选择器
                '<div data-ui="type:RichSelector;childName:selector;" ',
                '    data-ui-mode="add" ',
                '    data-ui-height="${height}" data-ui-width="${width}" ',
                '    data-ui-empty-text="${emptyText}"',
                '    data-ui-has-search-box="true"',
                '    data-ui-has-icon="false"',
                '    data-ui-multi="false"',
                '    data-ui-has-head="false"',
                '    data-ui-item-name="${itemName}"',
                '    data-ui-unselect-text="${title}"',
                '    data-ui-can-select-none="${canSelectNone}"',
                '    data-ui-table-type="list"',
                '></div>'
            ].join('\n');

            var options = {
                emptyText: u.escape(this.emptyText),
                title: u.escape(this.title),
                itemName: u.escape(this.itemName),
                height: this.height,
                width: this.width,
                resultWidth: this.width - 32,
                canSelectNone: this.canSelectNone
            };

            var html = [];
            html.push(lib.format(selectorTpl, options));

            var paramValueTpl = [
                '<input type="hidden" id="${inputId}" name="${name}"',
                '   value="" />'
            ].join('');

            html.push(lib.format(
                paramValueTpl,
                {
                    name: this.name,
                    inputId: helper.getId(this, 'param-value')
                }
            ));

            this.main.innerHTML = html.join('\n');
            this.initChildren();

            // 初始化状态事件
            var result = this.getChild('result');
            result.on('click', lib.bind(this.toggle, this));

            var selector = this.getChild('selector');
            selector.on('add', lib.curry(refreshResult, this, true));

        };

        /**
         * 切换打开收起状态
         *
         * @inner
         */
        ToggleSelector.prototype.toggle = function () {
            if (this.hasState('expand')) {
                this.removeState('expand');
            }
            else {
                this.addState('expand');
            }
        };

        /**
         * 手动刷新
         *
         * @param {ui.ToggleSelector} toggleSelector 类实例
         * @inner
         */
        function refresh(toggleSelector) {
            var datasource = toggleSelector.datasource;
            if (!datasource) {
                return;
            }
            // 重建selector
            var selector = toggleSelector.getChild('selector');
            selector.set('datasource', {allData: datasource, selectedData: []});
            updateSelected(toggleSelector);
        }

        /**
         * 更新已选值
         *
         * @param {ui.ToggleSelector} toggleSelector 类实例
         * @inner
         */
        function updateSelected(toggleSelector) {
            var value = toggleSelector.rawValue;
            // 更新选择状态，但是如果datasource还是没传进来，就算了。。
            if (toggleSelector.datasource
                && toggleSelector.datasource.length > 0) {
                var selector = toggleSelector.getChild('selector');
                if (value) {
                    selector.selectItems([value], true);
                } else if(toggleSelector.canSelectNone) {
                    selector.selectNone();
                }
            }

            // 更新主显示
            refreshResult(toggleSelector);
        }

        /**
         * 重新渲染视图
         * 仅当生命周期处于RENDER时，该方法才重新渲染
         *
         * @param {Array=} 变更过的属性的集合
         * @override
         */
        ToggleSelector.prototype.repaint = helper.createRepaint(
            InputControl.prototype.repaint,
            {
                name: 'datasource',
                paint: refresh
            },
            {
                name: 'rawValue',
                paint: updateSelected
            },
            {
                name: 'disabled',
                paint: function (toggleSelector, state) {
                    var children = toggleSelector.children;
                    for (var i = children.length - 1; i > -1; i--) {
                        children[i].set('disabled', state);
                    }
                }
            }
        );

        /**
         * 获取已经选择的数据项
         *
         * @return {Array}
         */
        ToggleSelector.prototype.getRawValue = function () {
            // 重建selector
            var selector = this.getChild('selector');
            return selector.getSelectedItems()[0];
        };


        /**
         * 将value从原始格式转换成string
         *
         * @param {*} rawValue 原始值
         * @return {string}
         */
        ToggleSelector.prototype.stringifyValue = function (rawValue) {
            if (rawValue) {
                return rawValue.id;
            }
            return '';
        };


        /**
         * 刷新显示结果
         *
         * @param {ui.ToggleSelector} toggleSelector 类实例
         * @inner
         */
        function refreshResult(toggleSelector, needToggle) {
            var result = toggleSelector.getChild('result');
            var paramInput =
                lib.g(helper.getId(toggleSelector, 'param-value'));
            var selectedItem = toggleSelector.getRawValue();
            var text = toggleSelector.title;
            var value = '';
            if (selectedItem) {
                text = selectedItem.name;
                value = selectedItem.id;
            }

            result.set('content', u.escape(text));
            result.main.setAttribute('title', text);
            paramInput.value = value;

            if (needToggle) {
                toggleSelector.toggle();
            }

            toggleSelector.fire('change', { item: selectedItem });
        }

        require('esui').register(ToggleSelector);

        return ToggleSelector;
    }
);
