/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 串联选择控件
 * @author lixiang(lixiang05@baidu.com)
 * @date $DATE$
 */

define(
    function (require) {
        require('esui/Panel');

        var lib = require('esui/lib');
        var helper = require('esui/controlHelper');
        var InputControl = require('esui/InputControl');
        var u = require('underscore');

        require('./RichSelector');

        /**
         * 控件类
         * 
         * @constructor
         * @param {Object} options 初始化参数
         */
        function CascadingSelector(options) {
            InputControl.apply(this, arguments);
        }


        lib.inherits(CascadingSelector, InputControl);

        CascadingSelector.prototype.type = 'CascadingSelector';

        CascadingSelector.prototype.initOptions = function (options) {
            var properties = {
                height: 340,
                width: 200,
                datasource: {
                    sourceData: { allData: [], selectedData: [] },
                    targetData: { allData: [], selectedData: [] }
                },
                tableType: 'list',
                sourceTitle: '源表标题名',
                targetTitle: '目标表标题名',
                sourceEmptyText: '没有相应的搜索结果',
                targetEmptyText: '请从左侧选择',
                itemName: '结果' // 这个字段是对腿部信息的填充
            };

            lib.extend(properties, options);
            properties.width = Math.max(200, properties.width);

            this.setProperties(properties);
        };


        CascadingSelector.prototype.initStructure = function () {
            var selectorTpl = [
                // 内容
                '<div data-ui="type:RichSelector;childName:${childName};" ',
                '    data-ui-title="${title}" data-ui-mode="${mode}" ',
                '    data-ui-height="${height}" data-ui-width="${width}" ',
                '    data-ui-empty-text="${emptyText}" class="${className}"',
                '    data-ui-has-search-box="${hasSearchBox}"',
                '    data-ui-multi="${multi}" data-ui-need-batch-action="true"',
                '    data-ui-item-name="${itemName}"',
                '    data-ui-table-type="${type}"',
                '    data-ui-fire-on-icon="${fireOnIcon}"',
                '></div>'
            ].join('\n');

            var commonOption = {
                multi: true,
                itemName: this.itemName,
                type: this.tableType,
                height: this.height,
                width: this.width
            };

            var sourceOption = {
                childName: 'source',
                title: this.sourceTitle,
                emptyText: this.sourceEmptyText,
                mode: 'add',
                className: helper.getPartClasses(this, 'source').join(' '),
                hasSearchBox: true
            };

            var targetOption = {
                childName: 'target',
                title: this.targetTitle,
                emptyText: this.targetEmptyText,
                mode: 'delete',
                className: helper.getPartClasses(this, 'target').join(' '),
                hasSearchBox: false,
                fireOnIcon: true
            };

            var html = [];
            html.push(lib.format(
                selectorTpl,
                u.extend(sourceOption, commonOption)
            ));

            html.push(lib.format(
                selectorTpl,
                u.extend(targetOption, commonOption)
            ));

            var paramValueTpl = [
                '<input type="hidden" id="${inputId}" name="${name}"',
                ' value="" />'
            ].join('');

            html.push(lib.format(
                paramValueTpl,
                {
                    name: this.name,
                    inputId: helper.getId(this, 'param-value')
                }
            ));

            this.main.innerHTML = html.join('\n');
            this.initChildren(this.main);

            var source = this.getChild('source');
            var target = this.getChild('target');

            var selector = this;
            source.on('add', function(){
                var newdata = this.getSelectedItems();
                target.setProperties({
                    datasource: {
                        allData: newdata
                    }
                });
                refreshParamValue(selector);
            });

            target.on('delete', function(arg){
                var items = arg.items;
                source.selectItems(items, false);
                refreshParamValue(selector);
            });

        };

        /**
         * 手动刷新
         * 
         * @param {ui.CascadingSelector} cascadingSelector 类实例
         * @inner
         */
        function refresh(cascadingSelector) {
            var datasource = cascadingSelector.datasource;
            if (!datasource) {
                return;
            }
            // 重建selector
            var selectorsName = ['source', 'target'];
            for (var i = 0; i < 2; i++) {
                var selectorName = selectorsName[i];
                var data = datasource[selectorName + 'Data'];
                var selector = cascadingSelector.getChild(selectorName);
                selector.set('datasource', data);
            }
        }

        /**
         * 重新渲染视图
         * 仅当生命周期处于RENDER时，该方法才重新渲染
         *
         * @param {Array=} 变更过的属性的集合
         * @override
         */
        CascadingSelector.prototype.repaint = helper.createRepaint(
            InputControl.prototype.repaint,
            {
                name: 'datasource',
                paint: refresh
            }
        );

        /**
         * 获取已经选择的数据项
         * 就是一个代理，最后从结果列表控件里获取
         * @return {Array}
         * @public
         */
        CascadingSelector.prototype.getSelectedItems = function () {
            var source = this.getChild('source');
            return source.getSelectedItems();
        };

        /**
         * 设置元数据
         *
         * @param {Array} selectedItems 置为选择的项.
         */
        CascadingSelector.prototype.setRawValue = function (selectedItems) {
            this.set('rawValue', selectedItems);
        };

        /**
         * 获取已经选择的数据项
         * 
         * @return {Array} 
         */
        CascadingSelector.prototype.getRawValue = function () {
            return this.getSelectedItems();
        };


        /**
         * 将value从原始格式转换成string
         * 
         * @param {*} rawValue 原始值
         * @return {string}
         */
        CascadingSelector.prototype.stringifyValue = function (rawValue) {
            var selectedIds = [];
            u.each(rawValue, function (item) {
                selectedIds.push(item.id);
            });
            return selectedIds.join(',');
        };


        function refreshParamValue(cascadingSelector) {
            var paramInput = 
                lib.g(helper.getId(cascadingSelector, 'param-value'));
            if (paramInput) {
                paramInput.value = cascadingSelector.getValue();
            }
        }

        require('esui').register(CascadingSelector);

        return CascadingSelector;
    }
);
