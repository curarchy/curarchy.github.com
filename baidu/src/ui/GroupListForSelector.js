/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file GroupListForSelector控件
 * @author exodia(dengxinxin@baidu.com)
 * @date 13-11-21
 */
define(
    function (require) {
        var lib = require('esui/lib');
        var helper = require('esui/controlHelper');
        var Control = require('esui/Control');
        var u = require('underscore');

        var CLASSES = null;

        /**
         * GroupListForSelector控件
         *
         * @param {Object=} options 初始化参数
         * @extends esui/control
         * @constructor
         * @public
         */
        function GroupListForSelector(options) {
            Control.apply(this, arguments);
            if (!CLASSES) {
                var getClasses = u.bind(
                    this.helper.getPartClasses,
                    this.helper
                );
                CLASSES = {
                    group: getClasses('group')[0],
                    groupTitle: getClasses('group-title')[0],
                    groupList: getClasses('group-list')[0],
                    item: getClasses('item')[0],
                    content: getClasses('content')[0]
                };
            }
        }

        GroupListForSelector.prototype.type = 'GroupListForSelector';

        GroupListForSelector.prototype.groupTemplate =
            '<div data-ui="type:Panel;states:${state}">'
                + '<h4 class="${groupTitle}">${groupName}</h4>'
                + '<ul class="${groupList}">${listHTML}</ul>'
                + '</div>';

        GroupListForSelector.prototype.itemTemplate =
            '<li class="${itemCls}" data-index="${index}" '
                + 'data-group-index="${groupIndex}">'
                + '<span class="${contentCls}">${itemName}</span>'
                + '</li>';

        GroupListForSelector.prototype.getGroupHTML = function (group, index) {
            var data = group.data;
            var listHTML = '';
            for (var i = 0, len = data.length; i < len; i++) {
                listHTML += this.getItemHTML(data[i], i, index);
            }

            return lib.format(this.groupTemplate, {
                groupId: u.escape(group.id),
                groupTitle: CLASSES.groupTitle,
                groupList: CLASSES.groupList,
                groupName: u.escape(group.name),
                state: group.state || '',
                listHTML: listHTML
            });
        };

        GroupListForSelector.prototype.getItemHTML =
            function (data, index, groupIndex) {
                return lib.format(this.itemTemplate, {
                    itemCls: CLASSES.item,
                    index: index,
                    groupIndex: groupIndex,
                    contentCls: CLASSES.content,
                    itemName: u.escape(data.name || data)
                });
            };

        /**
         * 数据结构
         * 用户传入数据：
         * selectedData等有需要了再加吧
         * —— datasource
         * 你问我为什么要叫 allData? 问享姐吧，因为她写的其他的 xxSelector 都这么叫的，为了统一。。
         * {
         *     allData: [
         *        {
         *          id: 'group1',
         *          name: '分组1',
         *          state: 'equal'/'unequal' //等于或者不等于,默认 equal
         *          data: [{id: xxx, name: xxx}]
         *       },
         *       {
         *          id: 'group2',
         *          name: '分组2',
         *          data: [{id: xxx, name: xxx}]
         *       },
         *       ...
         *    ]
         * }
         */
        GroupListForSelector.prototype.generateList = function (datasource) {
            var allData = datasource.allData;
            if (!allData) {
                return '';
            }

            var html = '';
            for (var i = 0, len = allData.length; i < len; i++) {
                html += this.getGroupHTML(allData[i], i);
            }

            return html;
        };

        /**
         * 初始化参数
         *
         * @param {Object=} options 构造函数传入的参数
         * @override
         * @protected
         */
        GroupListForSelector.prototype.initOptions = function (options) {
            var properties = {};
            u.extend(properties, options);
            this.setProperties(properties);
        };

        function deleteItem(e) {
            var target = e.target;
            if (this.helper.isPart(target, 'content')) {
                target = target.parentNode;
            }
            if (this.helper.isPart(target, 'item')) {
                var groupIndex = target.getAttribute('data-group-index');
                var index = target.getAttribute('data-index');
                var allData = this.datasource.allData;

                var group = allData[groupIndex];
                var item = group.data.splice(index, 1);
                //ListForSelector 组件会给 item 加上 isSelected 属性，因为是引用，
                //所以撤销选择时，一并的设置这个属性为 false
                item[0].isSelected && (item[0].isSelected = false);
                !group.data.length && allData.splice(groupIndex, 1);
                this.set('datasource', {
                    allData: allData
                });

                this.fire(
                    'delete',
                    {
                        items: [
                            {
                                id: group.id, name: group.name,
                                state: group.state, data: item
                            }
                        ]
                    }
                );
            }
        }

        /**
         * 初始化DOM结构
         *
         * @override
         * @protected
         */
        GroupListForSelector.prototype.initStructure = function () {
            this.helper.addDOMEvent(this.main, 'click', deleteItem);
        };

        GroupListForSelector.prototype.deleteAll = function () {
            var allData = this.datasource.allData;
            var items = allData.splice(0, allData.length);
            this.set('datasource', { allData: allData });
            //嗯，大坑，ListForSelector 会对每个数据附加 isSelected。。
            u.each(items, function (group) {
                u.each(group.data, function (item) {
                    item.isSelected && (item.isSelected = false);
                });
            });
            this.fire('delete', { items: items });
        };

        GroupListForSelector.prototype.getSelectedItems = function () {
            return this.datasource.allData;
        };

        GroupListForSelector.prototype.modifyGroup = function (group) {
            if (group) {
                var allData = this.datasource.allData || [];
                var old = null;
                for (var i = allData.length - 1; i >= 0; i--) {
                    if (allData[i].id === group.id) {
                        old = allData[i];
                        allData[i] = group;
                        break;
                    }
                }
                !old && allData.push(group);
                this.set('datasource', { allData: allData });
            }
        };

        /**
         * 渲染自身
         *
         * @override
         * @protected
         */
        GroupListForSelector.prototype.repaint = helper.createRepaint(
            Control.prototype.repaint,
            {
                name: 'datasource',
                paint: function (control, datasource) {
                    if (datasource) {
                        control.disposeChildren();
                        var html = control.generateList(datasource);
                        control.main.innerHTML = html;
                        control.initChildren();
                    }
                }
            }
        );

        lib.inherits(GroupListForSelector, Control);
        require('esui').register(GroupListForSelector);
        return GroupListForSelector;
    }
);
