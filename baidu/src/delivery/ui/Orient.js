/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file Orient控件
 * @author exodia(dengxinxin@baidu.com)
 * @date 13-11-19
 */
define(
    function (require) {
        var lib = require('esui/lib');
        var helper = require('esui/controlHelper');
        var InputControl = require('esui/InputControl');
        var u = require('underscore');
        require('ui/RichSelector');
        require('esui/Select');
        /**
         * Orient控件
         *
         * @param {Object=} options 初始化参数
         * @extends esui/control
         * @constructor
         * @public
         */
        function Orient(options) {
            InputControl.apply(this, arguments);
        }

        Orient.prototype.type = 'Orient';

        Orient.prototype.headTemplate = '<div class="${headCls}">'
            + '<span data-ui-type="Label">定向方式：</span>'
            + '<div class="${typeCls}" data-ui="type:Select;'
            + 'childName:orientSelect;emptyText:请选择"></div>'
            + '<div class="${equalCls}" '
            + 'data-ui="type:Select;childName:stateSelect"></div>'
            + '</div>';

        Orient.prototype.bodyTemplate = '<div class=${richCls} data-ui="'
            + 'type:RichSelector;childName:selectList;width:239;'
            + 'needBatchAction:true;tableType:list;multi:true;title:;"></div>'
            + '<div class=${richCls} data-ui="type:RichSelector;childName:'
            + 'selectInput;hasFoot:false;hasSearchBox:false;width:239;'
            + 'tableType:input;hidden:hidden;"></div>'
            + '<div class="${richCls}" data-ui="childName:selectedList;'
            + 'type:RichSelector;title:已选择定向方式;hasFoot:false;mode:delete;'
            + 'hasSearchBox:false;needBatchAction:true;tableType:group"></div>';

        Orient.prototype.getHTML = function () {
            var html = this.headTemplate + this.bodyTemplate;
            return lib.format(html, {
                headCls: this.helper.getPartClasses('head')[0],
                richCls: this.helper.getPartClasses('rich')[0],
                typeCls: this.helper.getPartClasses('type')[0],
                equalCls: this.helper.getPartClasses('equal')[0]
            });
        };

        Orient.prototype.createMain = function () {
            return document.createElement('div');
        };

        /**
         * 初始化参数
         *
         * @param {Object=} options 构造函数传入的参数
         * @override
         * @protected
         */
        Orient.prototype.initOptions = function (options) {
            var properties = {};
            lib.extend(properties, options);
            this.setProperties(properties);
        };

        function equalChange(e) {
            var orientSelect = this.getChild('orientSelect');
            var selectedList = this.getChild('selectedList');
            var group = orientSelect.getSelectedItem();
            var state = e.target.getValue();
            group.state = state;

            group = u.findWhere(
                selectedList.getSelectedItems(),
                { id: group.id }
            );
            if (group) {
                group.state = state;
                selectedList.modifyGroup(group);
            }
        }

        function orientChange(e) {
            var item = e.target.getSelectedItem();
            this.getChild('stateSelect').setValue(item.state);
            refreshToSelectList(this);
        }

        function listAdd(e) {
            var group = u.clone(this.getCurrentGroup());
            group.data = e.items;
            this.getChild('selectedList').modifyGroup(group);
        }

        function listDelete(e) {
            var group = this.getCurrentGroup();
            if (!group) {
                return;
            }

            var items = group.viewType !== 'input' ? e.items :
                    e.target.getSelectedItems();

            var newGroup = u.findWhere(items, { id: group.id }) || {};

            if (group.viewType === 'input') {
                this.getChild('selectInput').set(
                    'datasource',
                    { allData: newGroup.data }
                );
            }
            else {
                var list = this.getChild('selectList');
                list.selectItems(newGroup.data, false);
            }
        }

        /**
         * 初始化DOM结构
         *
         * @override
         * @protected
         */
        Orient.prototype.initStructure = function () {
            this.main.innerHTML = this.getHTML();
            this.initChildren();

            var stateSelect = this.getChild('stateSelect');
            stateSelect.setProperties({
                datasource: [
                    { value: 'equal', name: '等于', isSelected: true },
                    { value: 'unequal', name: '不等于' }
                ]
            });
            stateSelect.on('change', equalChange, this);

            this.getChild('orientSelect').on('change', orientChange, this);
            this.getChild('selectList').on('add', listAdd, this);
            this.getChild('selectInput').on('add', listAdd, this);
            this.getChild('selectedList').on('delete', listDelete, this);
        };

        /**
         * 刷新待选择列表
         */
        function refreshToSelectList(control) {
            var group = control.getCurrentGroup();
            if (!group) {
                return;
            }

            var selectedList = control.getChild('selectedList');
            var selectedData = selectedList.getSelectedItems();
            var groupSelected = u.findWhere(selectedData, { id: group.id });
            var selector = null;

            if (group.viewType == 'input') {
                group.data = groupSelected && groupSelected.data;
                selector = control.getChild('selectInput');
                control.getChild('selectList').hide();
            } else {
                selector = control.getChild('selectList');
                control.getChild('selectInput').hide();
            }

            selector.show();
            selector.setProperties({
                datasource: {
                    allData: group.data,
                    selectedData: groupSelected && groupSelected.data
                },
                title: (group.viewType == 'input' ? '' : '选择') + group.name,
                itemName: group.name
            });
        }

        /**
         * 刷新定向方式选择列表
         */
        function refreshOrientSelect(control, datasource) {
            var allData = datasource.allData;
            var selectedGroup = datasource.selectedGroup;

            u.each(allData, function (group) {
                group.value = group.id;
            });

            control.getChild('orientSelect').setProperties({
                datasource: allData,
                value: selectedGroup
            });
        }

        /**
         * 刷新已选择列表
         */
        function refreshSelectedList(control, datasource) {
            var selectedList = control.getChild('selectedList');
            selectedList.setProperties({
                datasource: {
                    allData: datasource.selectedData
                }
            });
        }

        /**
         * 根据数据源刷新视图
         *
         * 数据结构：
         *     {
         *         allData: [
         *             {
         *                 id: 1,
         *                 name: 'group',
         *                 state: 'unequal',
         *                 data: [
         *                     { id: 1, name: '111' }
         *                 ]
         *             }
         *         ],
         *         selectedData: [{}],
         *         selectedGroup: 'groupId'
         *     }
         *
         * @param control
         * @param datasource
         */

        function refresh(control, datasource) {
            refreshSelectedList(control, datasource);
            refreshOrientSelect(control, datasource);
            refreshToSelectList(control);
        }

        Orient.prototype.getSelectedItems = function () {
            return this.getChild('selectedList').getSelectedItems();
        };

        Orient.prototype.getRawValue = function () {
            return this.getSelectedItems();
        };

        Orient.prototype.getCurrentGroup = function () {
            return this.getChild('orientSelect').getSelectedItem();
        };

        /**
         * 渲染自身
         *
         * @override
         * @protected
         */
        Orient.prototype.repaint = helper.createRepaint(
            InputControl.prototype.repaint,
            {
                name: 'datasource',
                paint: function (control, datasource) {
                    datasource && refresh(control, datasource);
                }
            }
        );

        lib.inherits(Orient, InputControl);
        require('esui').register(Orient);
        return Orient;
    }
);
