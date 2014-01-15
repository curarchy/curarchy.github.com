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
        function TableForSelector(options) {
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
         * —— tableData
         * [
         *    {id: xxx, name: xxx, isSelected: false},
         *    {id: yyy, name: yyyy, isSelected: false}
         *    ...
         * ]
         * —— indexData （就是一个以id为key，index做value的映射表）
         *
         * @param {ui.TableForSelector} control 类实例
         * @inner
         */
        function buildTableData(control) {
            // 先构建indexData
            var indexData = {};
            for (var i = 0; i < control.datasource.length; i ++) {
                var data = control.datasource[i];
                indexData[data.id] = i;
            }

            control.indexData = indexData;
        }

        /**
         * 创建结果列表
         * @param {ui.TableForSelector} control 类实例
         * @inner
         */
        function generateTable(control) {
            var isQuery = control.hasState('queried');
            var data = isQuery ? control.queryData : control.datasource;
            var queryList = control.getChild('queryList');
            var len = data.length;
            if (!len) {
                control.addState('empty');
            }
            else {
                control.removeState('empty');
            }

            var htmlArray = [];
            htmlArray.push(createTableHead(control));
            htmlArray.push(createTableContent(control));

            queryList.setContent(htmlArray.join(''));
        }


        TableForSelector.prototype.selectTpl = ''
            + '<div data-ui-type="Select" data-ui-child-name="${childName}"'
            + '></div>';


        /**
         * 创建表头
         * 
         * public
         * @return {string} 表头html
         */
        function createTableHead(control) {
            var tableClasses = 
                helper.getPartClasses(control, 'head-table').join(' ');
            var tpl = ['<table border=0 class="' + tableClasses + '"><tr>'];
            var colmNum = control.fields.length;
            //绘制表头th
            for(var i = 0; i < colmNum; i ++){
                var field = control.fields[i]; 
                tpl.push(''
                    + '<th class="th' + i + '"'
                    + ' style="width:' + field['width'] + 'px;">'
                    + field['title'] || ''
                    + '</th>'
                );
            }
            //最后一列用来装箭头
            tpl.push('<th style="width:30px;"></th>');
            tpl.push('</tr></table>');
            return tpl.join(' ');
        }

        TableForSelector.prototype.rowTpl = ''
            + '<tr id="${rowId}" class="${rowClass}" '
            + 'index="${index}">${content}</tr>';

        /**
         * 创建表格体
         * @param {ui.TableForSelector} control 类实例
         * @inner
         */
        function createTableContent(control) {
            var isQuery = control.hasState('queried');
            var datasource = isQuery ? control.queryData : control.datasource;
            var indexData = control.indexData;

            var tableClasses = 
                helper.getPartClasses(control, 'content-table').join(' ');
            var tpl = ['<table border=0 class="' + tableClasses + '">'];
            var rowClasses = helper.getPartClasses(control, 'item').join(' ');
            var selectedRowClasses = 
                helper.getPartClasses(control, 'item-selected').join(' ');

            //绘制内容
            for(var j = 0, len = datasource.length; j < len; j++ ) {
                var item = datasource[j];
                tpl.push(
                    lib.format(
                        control.rowTpl,
                        {
                            rowId: helper.getId(control, 'item-' + item.id),
                            rowClass: item.isSelected 
                                ? rowClasses + ' ' + selectedRowClasses 
                                : rowClasses,
                            index: indexData[item.id],
                            content: createRow(control, item, j)
                        }
                    )
                );
            }
            tpl.push('</table>');
            return tpl.join(' ');
        }

        /**
         * 创建Table的每行
         *
         * @param {ui.TableForSelector} control 类实例
         * @param {Object} item 每行的数据
         * @param {number} index 行索引
         * @param {HTMLElement} tr 容器节点
         * @inner
         */
        function createRow(control, item, index, tr){
            var fields = control.fields;
            var fieldLen = fields.length;
            var html = [];
            var arrowClasses = 
                helper.getPartClasses(control, 'row-arrow').join(' ');
            var fieldClasses = 
                helper.getPartClasses(control, 'row-field').join(' ');
            for (var i = 0; i < fieldLen; i++) {
                var field = fields[i];
                var content = field.content;
                var innerHTML = ('function' == typeof content
                    ? content.call(control, item, index, i)
                    : item[content]);

                //IE不支持tr.innerHTML，所以这里要使用insertCell
                if(tr) {
                    var td = tr.insertCell(i);
                    td.style.width = field.width + 'px';
                    td.title = innerHTML;
                    td.innerHTML = innerHTML;
                }
                else {
                    var contentHtml = ''
                        + '<td class="' + fieldClasses 
                        + '" title="' + innerHTML
                        + '" style="width:' + field.width + 'px;">'
                        + innerHTML
                        + '</td>';
                    html.push(contentHtml);
                }
            }
            //最后一列添加箭头
            var arrowHTML = '<span class="' + arrowClasses + '"></span>';
            if(tr) {
                var td = tr.insertCell(i);
                td.style.width = '30px';
                td.innerHTML = arrowHTML;
            }
            else {
                html.push('<td style="width:30px;">' + arrowHTML + '</td>');
                return html.join(' ');
            }
        }

        /**
         * 点击行为分发器
         * @param {Event} 事件对象
         * @inner
         */
        function eventDistributor(e) {
            var tar = e.target || e.srcElement; 
            var getClass = helper.getPartClasses;
            // 只取第一个，因为element.classList.contains方法只支持一个字符串
            var actionClasses = getClass(this, 'row-arrow')[0];
            var itemClasses = getClass(this, 'item')[0];
            var selectedClasses = getClass(this, 'item-selected')[0];

            while (tar && tar != document.body) {
                var itemDOM;
                // 有图标的事件触发在图标上
                if (this.fireOnIcon
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
                    var item = this.datasource[index];
                    if (!lib.hasClass(itemDOM, selectedClasses)) {
                        operateSelectedItem(this, item.id);
                    }
                    return;
                }

                tar = tar.parentNode;
            }
        }

        /**
         * 单项点击处理器
         * @param {ui.TableForSelector} tableForSelector 类实例
         * @param {Object} id 结点对象id
         * @inner
         */
        function operateSelectedItem(tableForSelector, id) {
            // 添加型
            selectItem(tableForSelector, id, true);
        }

        /**
         * 选择或取消选择
         *   如果控件是单选的，则将自己置灰且将其他节点恢复可选
         *   如果控件是多选的，则仅将自己置灰
         *
         * @param {ui.TableForSelector} tableForSelector 类实例
         * @param {Object} id 结点对象id
         * @param {boolean} toBeSelected 置为选择还是取消选择
         * @param {boolean} preventChange 是否阻止触发change事件
         *
         * @inner
         */
        function selectItem(tableForSelector, id, toBeSelected, preventChange) {
            // 完整数据
            var indexData =  tableForSelector.indexData;
            var data = tableForSelector.datasource;

            var index = indexData[id];
            var item = data[index];

            updateSingleItemStatus(
                tableForSelector, item, toBeSelected
            );

            if (!preventChange) {
                tableForSelector.fire('add');
            }
        }

        /**
         * 更新单个结点状态
         *
         * @param {ui.TableForSelector} tableForSelector 类实例
         * @param {Object} item 结点数据对象
         * @param {boolean} toBeSelected 置为选择还是取消选择
         *
         * @inner
         */
        function updateSingleItemStatus(tableForSelector, item, toBeSelected) {
            item.isSelected = toBeSelected;
            var itemDOM = lib.g(
                helper.getId(tableForSelector, 'item-' + item.id)
            );
            var changeClass = toBeSelected ? lib.addClasses : lib.removeClasses;
            changeClass(
                itemDOM,
                helper.getPartClasses(
                    tableForSelector, 'item-selected'
                )
            );
        }

        TableForSelector.prototype.type = 'TableForSelector';

        TableForSelector.prototype.initOptions = function (options) {
            var properties = {
                // 是否触发在图标上
                firedOnIcon: false,
                datasource: [],
                // 搜索为空的提示
                emptyText: '没有相应的搜索结果'
            };


            lib.extend(properties, options);
            this.setProperties(properties);
        };


        TableForSelector.prototype.initStructure = function () {
            var tpl =  [
                // 搜索筛选
                '<div data-ui="type:Panel;childName:filter"',
                ' class="${filterClass}"></div>',
                // 搜索结果概要
                '<div data-ui="type:Panel;',
                'childName:generalQueryResultArea"',
                ' class="${generalQueryResultClass}"',
                ' id="${queryResultId}">',
                '<span class="${linkClass}" id="${linkId}">清空</span>',
                '共找到<span id="${queryResultCountId}"></span>个',
                '</div>',
                // 结果为空提示
                '<div data-ui="type:Label;childName:emptyText"',
                ' class="${emptyTextClass}">${emptyText}</div>',
                // 结果列表
                '<div data-ui="type:Panel;childName:queryList"',
                ' class="${queryListClass}">',
                '</div>'
            ];

            var getClass = helper.getPartClasses;
            var getId = helper.getId;

            var clearQueryLinkClass = getClass(this, 'clear-query-link');
            var clearQueryLinkId = getId(this, 'clear-query');
            this.main.innerHTML = lib.format(
                tpl.join('\n'),
                {
                    filterClass: getClass(this, 'filter-panel').join(' '),
                    emptyTextClass: getClass(this, 'empty-text').join(' '),
                    emptyText: this.emptyText,
                    queryListClass: getClass(this, 'query-list').join(' '),
                    generalQueryResultClass: 
                        getClass(this, 'query-result-general').join(' '),
                    queryResultCountId: getId(this, 'result-count'),
                    linkClass: clearQueryLinkClass.join(' '),
                    linkId: clearQueryLinkId
                }
            );

            this.initChildren(this.main);

            var listTable = this.getChild('queryList').main;
            helper.addDOMEvent(this, listTable, 'click', eventDistributor);

            var clearQueryLink = lib.g(clearQueryLinkId);
            if (clearQueryLink) {
                helper.addDOMEvent(
                    this, clearQueryLink, 'click',
                    u.bind(this.clearQuery, this)
                );
            }
        };

        /**
         * 刷新表格
         * 
         * @param {ui.TableForSelector} control 类实例
         * @inner
         */
        function refreshTable(control) {
            // 创建树可以使用的数据
            buildTableData(control);
            // 清空query，这个逻辑了包含了重建table的逻辑
            if (control.hasState('queried')) {
                // 保持筛选不变
                control.queryItem();
            }
            else {
                // 重建table
                generateTable(control);
            }
        }

        /**
         * 刷新筛选区
         * 
         * @param {ui.TableForSelector} control 类实例
         * @inner
         */
        function refreshFilter(control) {
            var filterPanel = control.getChild('filter');
            var filterItems = control.filterItems;
            var tpl = u.map(filterItems, function (filterItem) {
                return lib.format(
                    control.selectTpl, 
                    { childName: filterItem.key }
                );
            });

            // 搜索框
            tpl.push(''
                + '<input data-ui-type="SearchBox" data-ui-height="19"'
                + ' data-ui-child-name="keyword" />'
            );
            filterPanel.setContent(tpl.join(' '));
            u.each(filterItems, function (filterItem) {
                var filterControl = filterPanel.getChild(filterItem.key);
                if (filterControl) {
                    filterControl.set('datasource', filterItem.datasource);
                }
                // 绑事件
                filterControl.on(
                    'change', 
                    function () {
                        control.queryItem();
                    }
                );
            });

            var searchBox = filterPanel.getChild('keyword');
            searchBox.on(
                'search', 
                function () {
                    control.queryItem();
                }
            );
        }

        /**
         * 重新渲染视图
         * 仅当生命周期处于RENDER时，该方法才重新渲染
         *
         * @param {Array=} 变更过的属性的集合
         * @override
         */
        TableForSelector.prototype.repaint = helper.createRepaint(
            Control.prototype.repaint,
            {
                name: 'datasource',
                paint: refreshTable
            },
            // 这个属性用来创建筛选去，比如‘尺寸’，‘平台’等，格式:
            // [{ key: 'size', datasource: [] } ... ]
            // 其中key的值要包含在表格fields中
            {
                name:　'filterItems',
                paint: refreshFilter
            }
        );


        /**
         * 选择全部
         * 如果当前处于搜索状态，那么只把搜索结果中未选择的选过去
         * @public
         */
        TableForSelector.prototype.selectAll = function () {
            var isQuery = this.hasState('queried');
            var allData = this.datasource;
            var data = isQuery ? this.queryData : allData;

            var length = data.length;
            for (var i = 0; i < length; i ++) {
                var item = data[i];
                // 是个索引
                if (!isNaN(item)) {
                    item = allData[item];
                }
                // 更新状态，但不触发事件
                selectItem(this, item.id, true, true);
            }

            this.fire('add', {items: allData});
        };

        /**
         * 删除全部
         *
         * @public
         */
        TableForSelector.prototype.deleteAll = function () {
            var items = this.datasource;
            this.set('datasource', []);
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
        TableForSelector.prototype.batchUpdateState = function (
            selectedData, toBeSelected) {
            var data = this.datasource;
            var selectedLength = selectedData.length;
            var indexData = this.indexData;
            for (var i = 0; i < selectedLength; i ++) {
                var itemIndex = indexData[selectedData[i]];
                if (itemIndex !== null && itemIndex !== undefined) {
                    var item = data[itemIndex];
                    // 更新状态，但不触发事件
                    selectItem(this, item.id, toBeSelected, true);
                }
            }

        };

        /**
         * 搜索含有关键字的结果
         * 
         * @param {String} keyword 外来关键字
         * @public
         */
        TableForSelector.prototype.queryItem = function (keyword) {
            var control = this;
            var filterPanel = control.getChild('filter');
            // 查找过滤
            var filters = [];
            u.each(control.filterItems, function (item) {
                var select = filterPanel.getChild(item.key);
                if (select.getValue() !== '') {
                    filters.push({ key: item.key, value: select.getValue() });
                }
            });
            // 查找关键词
            var searchBox = filterPanel.getChild('keyword');
            filters.push({ key: 'name', value: searchBox.getValue() });

            var queryData = [];
            u.each(this.datasource, function (data, index) {
                var hit = true;
                u.each(filters, function (filterItem) {
                    // 关键词支持部分搜索。。。
                    if (filterItem.key === 'name') {
                        if (data.name.indexOf(filterItem.value) === -1) {
                            hit = false;
                        }
                    }
                    else if (data[filterItem.key] !== filterItem.value) {
                        hit = false;
                    }
                });

                if (hit) {
                    queryData.push(data);
                }
            });

            this.queryData = queryData;

            // 更新状态
            this.addState('queried');
            generateTable(this);

            // 更新概要搜索结果区
            var count = this.getFilteredItemsCount();
            lib.g(helper.getId(this, 'result-count')).innerHTML = count;

            this.fire('query');
        };

        /**
         * 清空搜索的结果
         * 
         */
        TableForSelector.prototype.clearQuery = function() {
            var control = this;
            // 消除搜索状态
            control.removeState('queried');
            // 清空数据
            control.queryData = [];
            // 恢复筛选状态
            var filterPanel = control.getChild('filter');
            u.each(control.filterItems, function (filterItem) {
                var filterControl = filterPanel.getChild(filterItem.key);
                if (filterControl) {
                    // 先解绑事件
                    filterControl.un('change');
                    filterControl.set('selectedIndex', 0);
                    filterControl.on('change', function () {
                        control.queryItem();
                    });
                }
            });
            var searchBox = filterPanel.getChild('keyword');
            searchBox.set('value', '');
            // 用全集数据生成table
            generateTable(this);
            control.fire('clearquery');
        };

        /**
         * 获取当前已选择的数据
         *
         * @return {Object}
         * @public
         */
        TableForSelector.prototype.getSelectedItems = function () {
            var data = this.datasource;
            var selectedData = u.filter(data, function (item) {
                return item.isSelected;
            });

            return selectedData;
        };

        /**
         * 获取当前列表的结果个数
         *
         * @return {number}
         * @public
         */
        TableForSelector.prototype.getFilteredItemsCount = function () {
            var isQuery = this.hasState('queried');
            var data = isQuery ? this.queryData : this.datasource;
            return data.length || 0;
        };

        lib.inherits(TableForSelector, Control);
        require('esui').register(TableForSelector);

        return TableForSelector;
    }


);
