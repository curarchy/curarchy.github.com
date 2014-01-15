/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 选择控件中所用到的列表形结构
 * @author lixiang(lixiang05@baidu.com)
 * @date $DATE$
 */

define(
    function (require) {
        require('esui/Label');
        require('esui/Panel');

        var lib = require('esui/lib');
        var helper = require('esui/controlHelper');
        var Control = require('esui/Control');
        var u = require('underscore');

        /**
         * 控件类
         *
         * @constructor
         * @param {Object} options 初始化参数
         */
        function ListForSelector(options) {
            Control.apply(this, arguments);
        }

        /**
         * 构建List可以使用的数据结构
         * 用户传入数据：
         * —— datasource
         * {
         *     allData: [{id: xxx, name: xxx}, {id: yyy, name: yyyy}...]
         *     selectedData: [{id: zz, name: zzzz}, {id: mm, name: mmmm}...]
         * }
         * 将allData和SelectedData映射转换后
         * —— mixedDatasource
         * [
         *    {id: xxx, name: xxx, isSelected: false},
         *    {id: yyy, name: yyyy, isSelected: false}
         *    ...
         * ]
         * —— indexData （就是一个以id为key，index做value的映射表）
         *
         * @param {ui.ListForSelector} listForSelector 类实例
         * @inner
         */
        function buildListData(listForSelector) {
            var datasource = listForSelector.datasource;
            var allData = datasource.allData || [];

            // 先构建indexData
            var indexData = {};
            var allLength = allData.length;
            for (var i = 0; i < allLength; i++) {
                var data = allData[i];
                indexData[data.id] = i;
            }

            // 构建mixedDatasource
            var selectedData = datasource.selectedData || [];
            var selectedLength = selectedData.length;
            for (var j = 0; j < selectedLength; j++) {
                var singleData = selectedData[j];
                var selectedIndex = indexData[singleData.id];
                allData[selectedIndex].isSelected = true;
                // 如果是单选模式，即便传了多个被选择数据，后面的也都不要了
                if (!listForSelector.multi) {
                    listForSelector.curSeleId = singleData.id;
                    break;
                }
            }

            listForSelector.mixedDatasource = allData;
            listForSelector.indexData = indexData;

        }

        /**
         * 节点很大一部分的结构是相同的，
         * 这里抽象出一个通用的方法，并格式化掉共同的部分。
         *
         * @param {ui.ListForSelector} listForSelector 类实例
         * @return {string} 统一格式化后的模板
         * @inner
         */
        function roughlyFormatItem(listForSelector) {
            var tpl = [
                '<div id="${itemId}" ',
                'class="${itemClass} ${additionalClasses}"',
                'index="${index}">',
                '<span class="${arrowClass}"></span>',
                '<span class="${textClass}" title="${text}">${text}</span>',
                '</div>'
            ].join(' ');

            var itemClasses = listForSelector.helper.getPartClassName('item');

            var arrowClass =
                listForSelector.hasIcon ?
                    listForSelector.helper.getPartClassName('item-action-icon')
                    : '';

            var textClass =
                listForSelector.helper.getPartClassName('item-text');

            return lib.format(
                tpl,
                {
                    itemClass: itemClasses,
                    additionalClasses: '${additionalClasses}',
                    index: '${index}',
                    itemId: '${itemId}',
                    arrowClass: arrowClass,
                    textClass: textClass,
                    text: '${text}'
                }
            );
        }

        /**
         * 创建结果列表
         * @param {ui.ListForSelector} listForSelector 类实例
         * @param {Array} queryData 结果数据可能是全集也可能是搜索结果
         * 支持多态，数组元素是对象或者索引数字
         * [{id: 11, name: xxx, isSelected: false}, {}, ...] | [1, 4, 6]
         * @inner
         */
        function generateTable(listForSelector, queryData) {
            var queryList = listForSelector.getChild('queryList');

            // 初始化模板的通用部分
            var itemTpl = roughlyFormatItem(listForSelector);
            var indexData = listForSelector.indexData;
            var mixedDatasource = listForSelector.mixedDatasource;
            var datas = queryData || mixedDatasource;
            var helper = listForSelector.helper;
            var len = datas.length;
            if (len === 0) {
                listForSelector.addState('empty');
            }
            else {
                listForSelector.removeState('empty');
            }

            var htmlArray = [];
            for (var i = 0; i < len; i++) {
                var item = datas[i];
                // 是个索引
                if (!isNaN(item)) {
                    item = mixedDatasource[item];
                }
                var itemId = item.id;
                var itemIndex = indexData[itemId];

                var additionalCls = '';
                // 删除模式的列表不需要有选择状态
                if (listForSelector.mode === 'add' && item.isSelected) {
                    additionalCls = helper.getPartClassName('item-selected');

                }

                htmlArray.push(lib.format(
                    itemTpl,
                    {
                        additionalClasses: additionalCls,
                        itemId: helper.getId('item-' + itemId),
                        index: itemIndex,
                        text: lib.encodeHTML(item.name)
                    }
                ));
            }

            var multi = listForSelector.multi;
            var curSeleId = listForSelector.curSeleId;
            var canSelectNone = listForSelector.canSelectNone;
            var isQueried = listForSelector.hasState('queried');
            //单选，可以撤销选择，且不在查询状态，则创建撤销节点
            if (!multi && canSelectNone && !isQueried) {
                var nullCls = helper.getPartClasses('null-item');
                //当前未选中，则默认选中撤销节点
                !curSeleId && nullCls.push(
                    helper.getPartClassName('item-selected')
                );
                htmlArray.unshift(lib.format(
                    itemTpl,
                    {
                        additionalClasses: nullCls.join(' '),
                        text: lib.encodeHTML(listForSelector.unselectText)
                    }
                ));
            }
            queryList.setContent(htmlArray.join(''));
        }

        /**
         * 点击行为分发器
         * @param {Event} 事件对象
         * @inner
         */
        function eventDistributor(e) {
            var tar = e.target || e.srcElement;
            var helper = this.helper;
            var actionClasses = helper.getPartClassName('item-action-icon');
            var itemClasses = helper.getPartClassName('item');
            var selectedClasses = helper.getPartClassName('item-selected');

            while (tar && tar != document.body) {
                var itemDOM;
                // 有图标的事件触发在图标上
                if (this.hasIcon
                    && this.fireOnIcon
                    && lib.hasClass(tar, actionClasses)) {
                    itemDOM = tar.parentNode;
                }
                else {
                    if (lib.hasClass(tar, itemClasses)) {
                        itemDOM = tar;
                    }
                }

                if (itemDOM) {
                    var index = parseInt(itemDOM.getAttribute('index'), 10);
                    var item = this.mixedDatasource[index];
                    if (!lib.hasClass(itemDOM, selectedClasses)) {
                        //无item，表示点击了 撤销选中的项
                        if (item) {
                            operateSelectedItem(this, item.id);
                        } else {
                            unselectCurrent(this);
                            selectNone(this, true);
                        }
                    }
                    return;
                }

                tar = tar.parentNode;
            }
        }

        /**
         * 单项点击处理器
         * @param {ui.ListForSelector} listForSelector 类实例
         * @param {Object} id 结点对象id
         * @inner
         */
        function operateSelectedItem(listForSelector, id) {
            // 添加型
            if (listForSelector.mode == 'add') {
                selectItem(listForSelector, id, true);
            }
            else if (listForSelector.mode == 'delete') {
                deleteSelectedItem(listForSelector, id);
            }
        }

        /**
         * 撤销当前的选择, 是单选且有撤销选择的节点，则选中撤销节点
         */
        function selectNone(listForSelector, isSelected, preventChange) {
            //有撤销选择的项，又是单选，则选中 「撤销选择的节点」
            if (listForSelector.canSelectNone && !listForSelector.multi) {
                var queryList = listForSelector.getChild('queryList');
                var none = lib.getChildren(queryList.main)[0];
                var selectedCls =
                    listForSelector.helper.getPartClassName('item-selected');
                lib[isSelected ? 'addClass' : 'removeClass'](none, selectedCls);
                !preventChange && listForSelector.fire('add');
            }
        }

        //撤销选择当前项
        function unselectCurrent(listForSelector) {
            var curId = listForSelector.curSeleId;
            //撤销当前选中项
            if (curId) {
                var index = listForSelector.indexData[curId];
                var item = listForSelector.mixedDatasource[index];
                updateSingleItemStatus(listForSelector, item, false);
                listForSelector.curSeleId = null;
            }
        }

        /**
         * 选择或取消选择
         *   如果控件是单选的，则将自己置灰且将其他节点恢复可选
         *   如果控件是多选的，则仅将自己置灰
         *
         * @param {ui.ListForSelector} listForSelector 类实例
         * @param {Object} id 结点对象id
         * @param {boolean} toBeSelected 置为选择还是取消选择
         * @param {boolean} preventChange 是否阻止触发change事件
         *
         * @inner
         */
        function selectItem(listForSelector, id, toBeSelected, preventChange) {
            // 完整数据
            var indexData = listForSelector.indexData;
            var datas = listForSelector.mixedDatasource;

            var index = indexData[id];
            var item = datas[index];

            //如果是单选，需要将其他的已选项置为未选
            if (!listForSelector.multi) {
                var newId = toBeSelected ? id : null;
                // 移除原有选项
                unselectCurrent(listForSelector);
                listForSelector.curSeleId = newId;
                // 撤销选中则选中「撤销选中节点」
                selectNone(listForSelector, !newId, true);
            }
            updateSingleItemStatus(
                listForSelector, item, toBeSelected
            );

            if (!preventChange) {
                listForSelector.fire('add');
            }
        }

        /**
         * 更新单个结点状态
         *
         * @param {ui.ListForSelector} listForSelector 类实例
         * @param {Object} item 结点数据对象
         * @param {boolean} toBeSelected 置为选择还是取消选择
         *
         * @inner
         */
        function updateSingleItemStatus(listForSelector, item, toBeSelected) {
            if (!item) {
                return;
            }
            item.isSelected = toBeSelected;
            var itemDOM = listForSelector.helper.getPart('item-' + item.id);
            var changeClass = toBeSelected ? lib.addClass : lib.removeClass;
            changeClass(
                itemDOM,
                listForSelector.helper.getPartClassName('item-selected')
            );
        }


        /**
         *  下面的方法专属delete型tree
         *
         */

        /**
         * 删除选择的节点
         *
         * @param {ui.ListForSelector} listForSelector 类实例
         * @param {number} id 结点数据id
         *
         * @inner
         */
        function deleteSelectedItem(listForSelector, id) {
            // 完整数据
            var indexData = listForSelector.indexData;
            var datas = listForSelector.mixedDatasource;

            var index = indexData[id];
            var item = datas[index];

            var newData = [].slice.call(datas, 0);
            newData.splice(index, 1);

            listForSelector.setProperties({
                datasource: { allData: newData }
            });

            // 外部需要知道什么数据被删除了
            listForSelector.fire('delete', {items: [item]});
        }


        ListForSelector.prototype.type = 'ListForSelector';

        ListForSelector.prototype.initOptions = function (options) {
            var properties = {
                hasIcon: true,
                // 是否触发在图标上
                firedOnIcon: false,
                // 数据源
                // {allData:[], selectedData:[]}
                datasource: {},
                // 搜索为空的提示
                emptyText: '没有相应的搜索结果',
                // 单选或多选
                multi: false,
                // 选择器类型 'add', 'delete'
                mode: 'add',
                //设置是否可以撤销选择，仅在单选下有效
                canSelectNone: false
            };
            if (options.multi === 'false') {
                options.multi = false;
            }

            if (options.hasIcon === 'false') {
                options.hasIcon = false;
            }

            if (options.firedOnIcon === 'false') {
                options.firedOnIcon = false;
            }

            if (options.canSelectNone === 'false') {
                options.canSelectNone = false;
            }

            lib.extend(properties, options);
            this.setProperties(properties);
        };


        ListForSelector.prototype.initStructure = function () {
            var tpl = [
                // 结果为空提示
                '<div data-ui="type:Label;childName:emptyText"',
                ' class="${emptyTextClass}">${emptyText}</div>',
                // 结果列表
                '<div data-ui="type:Panel;childName:queryList"',
                ' class="${queryListClass}">',
                '</div>'
            ];

            var getClass = helper.getPartClasses;
            this.main.innerHTML = lib.format(
                tpl.join('\n'),
                {
                    emptyTextClass: getClass(this, 'empty-text').join(' '),
                    emptyText: this.emptyText,
                    queryListClass: getClass(this, 'query-list').join(' ')
                }
            );

            this.initChildren();

            if (this.mode == 'add') {
                this.addState('add');
            }
            else {
                this.addState('del');
            }

            var listTable = this.getChild('queryList').main;
            helper.addDOMEvent(this, listTable, 'click', eventDistributor);
        };

        /**
         * 手动刷新
         *
         * @param {ui.ListForSelector} listForSelector 类实例
         * @inner
         */
        function refresh(listForSelector) {
            // 创建树可以使用的数据
            buildListData(listForSelector);
            // 清空query，这个逻辑了包含了重建table的逻辑
            if (listForSelector.hasState('queried')) {
                listForSelector.clearQuery(listForSelector);
            }
            else {
                // 重建table
                generateTable(listForSelector, listForSelector.mixedDatasource);
            }
        }

        /**
         * 重新渲染视图
         * 仅当生命周期处于RENDER时，该方法才重新渲染
         *
         * @param {Array=} 变更过的属性的集合
         * @override
         */
        ListForSelector.prototype.repaint = helper.createRepaint(
            Control.prototype.repaint,
            {
                name: 'datasource',
                paint: refresh
            }
        );

        /**
         * 撤销当前选择，并选中「撤销选择节点」
         */
        ListForSelector.prototype.selectNone = function () {
            unselectCurrent(this);
            selectNone(this, true, true);
        };

        /**
         * 选择全部
         * 如果当前处于搜索状态，那么只把搜索结果中未选择的选过去
         * @public
         */
        ListForSelector.prototype.selectAll = function () {
            var isQuery = this.hasState('queried');
            var allData = this.mixedDatasource;
            var data = isQuery ? this.queryData : allData;

            var length = data.length;
            for (var i = 0; i < length; i++) {
                var item = data[i];
                // 是个索引
                if (!isNaN(item)) {
                    item = allData[item];
                }
                // 更新状态，但不触发事件
                selectItem(this, item.id, true, true);
            }

            this.fire('add', { items: allData });
        };

        /**
         * 删除全部
         *
         * @public
         */
        ListForSelector.prototype.deleteAll = function () {
            var items = this.mixedDatasource;
            this.set('datasource', { allData: [], selectedData: [] });
            this.fire('delete', { items: items });
        };

        /**
         * 批量选择或取消选择
         * 这个的调用背景是外部的“全部添加”或“全部删除”的后续操作
         * 但是也可作单个的更新，只是selectedData的长度是1
         * 这个方法只会被作用在add型的列表中，因为delete型的因为有添加删除节点的
         * 操作，所以它的更新基本上就是用repaint了
         *
         * @param {Array} selectedData 需要更新状态的id数组
         * @param {boolean} toBeSelected 选择还是取消
         * @return {Object}
         * @public
         */
        ListForSelector.prototype.batchUpdateState =
            function (selectedData, toBeSelected) {
                var datas = this.mixedDatasource;
                var selectedLength = selectedData.length;
                var indexData = this.indexData;
                for (var i = 0; i < selectedLength; i++) {
                    var itemIndex = indexData[selectedData[i]];
                    if (itemIndex !== null && itemIndex !== undefined) {
                        var item = datas[itemIndex];
                        // 更新状态，但不触发事件
                        selectItem(this, item.id, toBeSelected, true);
                    }
                }
            };

        /**
         * 搜索含有关键字的结果
         *
         * @param {String} keyword 关键字
         * @public
         */
        ListForSelector.prototype.queryItem = function (keyword) {
            var datas = this.mixedDatasource;
            var datasLength = datas.length;
            var queryData = [];

            for (var i = 0; i < datasLength; i++) {
                var data = datas[i];
                if (data.name.indexOf(keyword) != -1) {
                    queryData.push(i);
                }
            }

            this.queryData = queryData;
            // 更新状态
            this.addState('queried');
            generateTable(this, queryData);
        };

        /**
         * 清空搜索的结果
         *
         */
        ListForSelector.prototype.clearQuery = function () {
            // 消除搜索状态
            this.removeState('queried');
            // 清空数据
            this.queryData = [];
            // 用全集数据生成table
            generateTable(this, this.mixedDatasource);
        };

        /**
         * 获取当前已选择的数据
         *
         * @return {Object}
         * @public
         */
        ListForSelector.prototype.getSelectedItems = function () {
            var datas = this.mixedDatasource;
            var mode = this.mode;
            var selectedData = u.filter(datas, function (item) {
                return mode === 'delete' || item.isSelected;
            });

            if (mode === 'add' && !selectedData.length && this.canSelectNone) {
                selectedData.push({ id: '', name: this.unselectText });
            }
            return selectedData;
        };

        /**
         * 获取当前列表的结果个数
         *
         * @return {number}
         * @public
         */
        ListForSelector.prototype.getFilteredItemsCount = function () {
            var isQuery = this.hasState('queried');
            var datas = isQuery ? this.queryData : this.mixedDatasource;
            return datas.length;
        };

        lib.inherits(ListForSelector, Control);
        require('esui').register(ListForSelector);

        return ListForSelector;
    }


);
