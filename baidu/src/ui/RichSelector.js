/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 富选择单元控件
 * @author lixiang(lixiang05@baidu.com)
 * @date $DATE$
 */

define(
    function (require) {
        require('esui/Label');
        require('esui/Panel');
        require('ui/SearchBox');
        require('ui/TreeForSelector');
        require('ui/ListForSelector');
        require('ui/GroupListForSelector');
        require('ui/TableForSelector');
        require('ui/InputForSelector');

        var lib = require('esui/lib');
        var ui = require('esui/main');
        var helper = require('esui/controlHelper');
        var InputControl = require('esui/InputControl');
        var u = require('underscore');

        var TABLE_TYPES = {
            tree: 'TreeForSelector',
            list: 'ListForSelector',
            group: 'GroupListForSelector',
            table: 'TableForSelector',
            input: 'InputForSelector'
        };

        /**
         * 控件类
         *
         * @constructor
         * @param {Object} options 初始化参数
         */
        function RichSelector(options) {
            InputControl.apply(this, arguments);
        }

        lib.inherits(RichSelector, InputControl);

        /**
         * 根据关键词搜索结果
         * @param {event} SearchBox的点击事件对象
         * @inner
         */
        function queryItem(e) {
            var keyword = e.target.getValue();
            // 查询的操作在数据控件内部执行
            var resultContent = this.getResultContent();
            resultContent.queryItem(keyword);

            var count = resultContent.getFilteredItemsCount();
            // 更新概要搜索结果区
            this.helper.getPart('result-count').innerHTML = count;
            // 更新腿部总结果
            this.updateFootInfo();
            // 更新状态
            this.addState('queried');
            // 调整高度
            adjustHeight(this);
        }

        /**
         * 清除搜索结果
         * @param {ui.RichSelector} richSelector 类实例
         * @inner
         */
        function clearQuery(richSelector) {
            // 更新状态
            richSelector.removeState('queried');

            // 更新内部列表的状态
            var resultContent = richSelector.getResultContent();
            if (resultContent) {
                resultContent.clearQuery();
            }
            // 清空搜索框
            var searchBox = getSearchBox(richSelector);
            searchBox.set('text', '');

            // 更新状态
            richSelector.updateFootInfo();
            // 调整高度
            adjustHeight(richSelector);
        }

        /**
         * 获取结果列表承载容器控件，列表在它里面
         * @param {ui.RichSelector} richSelector 类实例
         * @return {ui.Panel}
         * @inner
         */
        function getDetailResultArea(richSelector) {
            var content = richSelector.getChild('content');
            if (content) {
                return content.getChild('detailQueryResultArea');
            }
            return null;
        }

        /**
         * 获取结果列表控件
         * @return {ui.TreeForSelector | ui.ListForSelector}
         * @inner
         */
        RichSelector.prototype.getResultContent = function () {
            var detailQueryResultArea = getDetailResultArea(this);
            if (detailQueryResultArea) {
                return detailQueryResultArea.getChild('resultContent');
            }
            return null;
        };

        /**
         * 获取搜索控件
         * @param {ui.RichSelector} richSelector 类实例
         * @return {ui.Panel}
         * @inner
         */
        function getSearchBox(richSelector) {
            var searchBoxArea =
                richSelector.getChild('content').getChild('searchBoxArea');
            if (searchBoxArea) {
                return searchBoxArea.getChild('itemSearch');
            }
        }

        /**
         * 获取腿部总个数容器
         * @param {ui.RichSelector} richSelector 类实例
         * @return {ui.Panel}
         * @inner
         */
        function getTotalCountPanel(richSelector) {
            var foot = richSelector.getChild('foot');
            if (!foot) {
                return null;
            }
            return foot.getChild('totalCount');
        }


        /**
         * 判断是否处于query状态
         * @param {ui.RichSelector} richSelector 类实例
         * @return {boolean}
         * @inner
         */
        function isQuery(richSelector) {
            return richSelector.hasState('queried');
        }

        /**
         * 批量操作事件处理
         *
         * @param {ui.RichSelector} richSelector 类实例
         * @inner
         */
        function batchAction(richSelector) {
            var resultContent = richSelector.getResultContent();
            if (richSelector.mode == 'delete') {
                // var items = resultContent.getSelectedItems();
                resultContent.deleteAll();
                // richSelector.fire('delete', {items: items});
            }
            else if (richSelector.mode == 'add') {
                resultContent.selectAll();
                // richSelector.fire('add');
            }
            return false;
        }

        RichSelector.prototype.type = 'RichSelector';

        RichSelector.prototype.initOptions = function (options) {
            var properties = {
                height: 340,
                width: 200,
                // 是否需要标题栏
                hasHead: true,
                // 这个名字出现在标题栏
                title: '标题名',
                // 是否需要批量操作
                needBatchAction: false,
                // 是否有搜索功能
                hasSearchBox: true,
                // 是否有腿部信息
                hasFoot: true,
                // 这个字段是对腿部信息的填充
                itemName: '结果',
                // 搜索为空的提示
                emptyText: '没有相应的搜索结果',
                // 单选或多选
                multi: false,
                // 选择器类型 'add', 'delete'
                mode: 'add',
                // 是否需要icon
                hasIcon: true,
                // 是否可以撤销选择
                canSelectNone: false,
                // 是否刷新数据时保持搜索状态
                holdState: false
            };

            if (options.multi === 'false') {
                options.multi = false;
            }

            if (options.hasHead === 'false') {
                options.hasHead = false;
            }

            if (options.hasSearchBox === 'false') {
                options.hasSearchBox = false;
            }

            if (options.hasIcon === 'false') {
                options.hasIcon = false;
            }

            if (options.hasFoot === 'false') {
                options.hasFoot = false;
            }

            if (options.canSelectNone === 'false') {
                options.canSelectNone = false;
            }

            if (options.holdState === 'false') {
                options.holdState = false;
            }

            lib.extend(properties, options);
            properties.width = Math.max(200, properties.width);
            // 保存一个属性字段，方便扩展
            // 但有些属性不包含在其中
            var blacklist = [
                'main', 'datasource', 'extensions', 'hasFoot', 'hasHead',
                'hasSearchBox', 'height', 'width', 'id', 'name', 'viewContext',
                'needBatchAction', 'renderOptions', 'tableType', 'title',
                'childName'
            ];

            this.uiProperties = u.omit(properties, blacklist);
            this.setProperties(properties);
        };


        RichSelector.prototype.initStructure = function () {
            var tpl = [
                // 表头
                '${head}',
                // 内容
                '<div data-ui="type:Panel;childName:content;"',
                ' class="${contentClass}">',
                '${searchInput}',
                // 搜索结果列表区
                '<div data-ui="type:Panel;childName:detailQueryResultArea"',
                ' class="${detailQueryResultClass}">',
                '</div>',
                '</div>',
                // 腿部概要信息
                '${footInfo}'
            ];

            var getClass = helper.getPartClasses;
            var getId = helper.getId;

            var head = '';
            if (this.hasHead) {
                var actionLink = '';
                if (this.needBatchAction) {
                    var linkClass = getClass(this, 'batch-action-link');
                    var linkId = getId(this, 'batch-action');
                    actionLink = ''
                        + '<span class="' + linkClass.join(' ')
                        + '" id="' + linkId + '" >';
                    if (this.mode == 'add') {
                        actionLink += '添加全部';
                    }
                    else if (this.mode == 'delete') {
                        actionLink += '删除全部';
                    }
                    actionLink += '</span>';
                }

                head = [
                    '<div data-ui="type:Panel;childName:head;"',
                    ' class="${headClass}">',
                    '<h3 data-ui="type:Label;childName:title;">',
                    '${title}</h3>',
                    // 可能是“删除全部”，可能是“增加全部”，也可能什么都没有
                    '${actionLink}',
                    '</div>'
                ].join('\n');

                head = lib.format(
                    head,
                    {
                        headClass: getClass(this, 'head').join(' '),
                        title: this.title,
                        actionLink: actionLink
                    }
                );
            }

            var searchInput = '';
            if (this.hasSearchBox) {
                var searchBoxWidth = this.width - 45;
                searchInput = [
                    // 搜索区
                    '<div data-ui="type:Panel;childName:searchBoxArea"',
                    ' class="${searchWrapperClass}">',
                    '<div data-ui="type:SearchBox;childName:itemSearch;"',
                    ' data-ui-skin="magnifier"',
                    ' data-ui-width="' + searchBoxWidth + '">',
                    '</div>',
                    '</div>',
                    // 搜索结果概要
                    '<div data-ui="type:Panel;',
                    'childName:generalQueryResultArea"',
                    ' class="${generalQueryResultClass}"',
                    ' id="${queryResultId}">',
                    '<span class="${linkClass}" id="${linkId}">清空</span>',
                    '共找到<span id="${queryResultCountId}"></span>个',
                    '</div>'
                ].join('\n');

                var clearQueryLinkClass = getClass(this, 'clear-query-link');
                var clearQueryLinkId = getId(this, 'clear-query');
                searchInput = lib.format(
                    searchInput,
                    {
                        searchWrapperClass: 
                            getClass(this, 'search-wrapper').join(' '),
                        generalQueryResultClass: 
                            getClass(this, 'query-result-general').join(' '),
                        queryResultCountId: getId(this, 'result-count'),
                        linkClass: clearQueryLinkClass.join(' '),
                        linkId: clearQueryLinkId
                    }
                );
            }
            var footInfo = '';
            if (this.hasFoot) {
                footInfo = [
                    '<div data-ui="type:Panel;childName:foot;"',
                    ' class="' + getClass(this, 'foot').join(' ') + '">',
                    '<span data-ui="type:Label;childName:totalCount">',
                    '</span>',
                    '</div>'
                ].join('\n');
            }


            var paramValueTpl = [
                '<input type="hidden" id="${inputId}" name="${name}"',
                ' value="" />'
            ].join('');

            tpl.push(lib.format(
                paramValueTpl,
                {
                    name: this.name,
                    inputId: helper.getId(this, 'param-value')
                }
            ));


            this.main.style.width = this.width + 'px';
            this.main.innerHTML = lib.format(
                tpl.join('\n'),
                {
                    head: head,
                    contentClass: getClass(this, 'content').join(' '),
                    searchInput: searchInput,
                    detailQueryResultClass: getClass(
                        this, 'query-result-detail-wrapper'
                    ).join(' '),
                    footInfo: footInfo
                }
            );

            this.initChildren();

            // 绑事件
            var batchActionLink = lib.g(getId(this, 'batch-action'));
            if (batchActionLink) {
                helper.addDOMEvent(
                    this, batchActionLink, 'click',
                    lib.bind(batchAction, null, this)
                );
            }

            var clearQueryLink = lib.g(getId(this, 'clear-query'));
            if (clearQueryLink) {
                helper.addDOMEvent(
                    this, clearQueryLink, 'click',
                    lib.bind(clearQuery, null, this)
                );
            }

            var searchBox = getSearchBox(this);
            if (searchBox) {
                searchBox.on('search', lib.bind(queryItem, this));
            }
        };

        /**
         * 调整高度。
         * 出现搜索信息时，结果区域的高度要变小，才能使整个控件高度不变
         *
         * @param {ui.RichSelector} richSelector 类实例
         * @inner
         */
        function adjustHeight(richSelector) {
            // 用户设置总高度
            var settingHeight = richSelector.height;

            // 头部高度 contentHeight + border
            var headHeight = 28;

            // 是否有搜索框
            var searchBoxHeight = richSelector.hasSearchBox ? 45 : 0;

            // 是否有腿部信息
            var footHeight = richSelector.hasFoot ? 25 : 0;

            // 结果区高度 = 总高度 - 头部高度 - 搜索框高度 - 腿部高度
            var contentHeight =
                settingHeight - headHeight - searchBoxHeight - footHeight;

            // 处于query状态时，会有一个30px的概要信息区
            if (isQuery(richSelector)) {
                contentHeight -= 30;
            }

            var detailQueryResultArea = getDetailResultArea(richSelector).main;
            detailQueryResultArea.style.height = contentHeight + 'px';
        }


        /**
         * 手动刷新
         *
         * @param {ui.RichSelector} richSelector 类实例
         * @inner
         */
        function refresh(richSelector) {
            var datasource = richSelector.datasource || {};

            if (richSelector.hasSearchBox 
                && isQuery(richSelector)
                && !richSelector.holdState) {
                // 清空搜索区
                clearQuery(richSelector);
            }
            // 重建table
            var tableType = richSelector.tableType || 'list';
            var uiType = TABLE_TYPES[tableType];
            var resultContent = richSelector.getResultContent();
            if (!resultContent) {
                var detailResultArea = getDetailResultArea(richSelector);
                var mainControl = ui.create(
                    uiType,
                    lib.extend(
                        { childName: 'resultContent' },
                        richSelector.uiProperties,
                        { hidden: false }
                    )
                );
                detailResultArea.addChild(mainControl);
                mainControl.appendTo(detailResultArea.main);
                resultContent = richSelector.getResultContent();
                if (richSelector.mode === 'delete') {
                    resultContent.on('delete', function (e) {
                        richSelector.updateFootInfo();
                        var items = e.items;
                        richSelector.fire('delete', {items: items});
                        refreshParamValue(richSelector);
                    });
                }
                else if (richSelector.mode === 'add') {
                    resultContent.on(
                        'add',
                        function () {
                            // 获取当前选择的items
                            var selectedItems = this.getSelectedItems();
                            richSelector.fire('add', { items: selectedItems });
                            refreshParamValue(richSelector);
                        }
                    );
                }
                else if (richSelector.mode === 'load') {
                    resultContent.on(
                        'load',
                        function (e) {
                            richSelector.fire('load', { item: e.item });
                        }
                    );
                }
                // 控件可能有自己的query逻辑
                resultContent.on(
                    'query',
                    function () {
                        richSelector.updateFootInfo();
                    }
                );
                resultContent.on(
                    'clearquery',
                    function () {
                        richSelector.updateFootInfo();
                    }
                );
            }
            resultContent.setProperties({
                datasource: datasource
            });
            richSelector.updateFootInfo();
            adjustHeight(richSelector);
        }

        /**
         * 更新腿部信息
         *
         * @param {ui.RichSelector} richSelector 类实例
         * @inner
         */
        RichSelector.prototype.updateFootInfo = function () {
            if (!this.hasFoot) {
                return;
            }
            var resultContent = this.getResultContent();
            var count = resultContent.getFilteredItemsCount();

            // 更新腿部总结果
            var totalCountPanel = getTotalCountPanel(this);
            if (totalCountPanel) {
                var itemName = u.escape(this.itemName);
                totalCountPanel.setText('共 ' + count + ' 个' + itemName);
            }
        };

        /**
         * 重新渲染视图
         * 仅当生命周期处于RENDER时，该方法才重新渲染
         *
         * @param {Array=} 变更过的属性的集合
         * @override
         */
        RichSelector.prototype.repaint = helper.createRepaint(
            InputControl.prototype.repaint,
            {
                name: 'datasource',
                paint: refresh
            },
            {
                name: 'title',
                paint: function (control, title) {
                    var head = control.getChild('head');
                    var titleLabel = head && head.getChild('title');
                    titleLabel && titleLabel.setText(title);
                }
            }
        );

        /**
         * 获取已经选择的数据项
         * 就是一个代理，最后从结果列表控件里获取
         * @return {Array}
         * @public
         */
        RichSelector.prototype.getSelectedItems = function () {
            var resultContent = this.getResultContent();
            if (resultContent) {
                return resultContent.getSelectedItems();
            }
            return [];
        };

        /**
         * 批量更新状态
         * @param {Array} items 需要更新的对象集合
         * @param {boolean} toBeSelected 要选择还是取消选择
         * @public
         */
        RichSelector.prototype.selectItems = function (items, toBeSelected) {
            var resultContent = this.getResultContent();
            var selectedDatas = [];
            u.each(items, function (item, key) {
                selectedDatas.push(
                    typeof item.id !== 'undefined' ? item.id : item
                );
            });
            resultContent.batchUpdateState(selectedDatas, toBeSelected);
        };

        /**
         * 设置元数据
         *
         * @param {Array} selectedItems 置为选择的项.
         */
        RichSelector.prototype.setRawValue = function (selectedItems) {
            this.rawValue = selectedItems;
            this.selectItems(selectedItems, true);
        };

        /**
         * 获取已经选择的数据项
         *
         * @return {Array}
         */
        RichSelector.prototype.getRawValue = function () {
            return this.getSelectedItems();
        };


        /**
         * 将value从原始格式转换成string
         *
         * @param {*} rawValue 原始值
         * @return {string}
         */
        RichSelector.prototype.stringifyValue = function (rawValue) {
            var selectedIds = [];
            u.each(rawValue, function (item) {
                selectedIds.push(item.id);
            });
            return selectedIds.join(',');
        };

        /**
         * 修改分组
         * @param group
         */
        RichSelector.prototype.modifyGroup = function (group) {
            this.getResultContent().modifyGroup(group);
        };

        RichSelector.prototype.selectNone = function () {
            this.getResultContent().selectNone();
        };

        function refreshParamValue(richSelector) {
            var paramInput = richSelector.helper.getPart('param-value');
            if (paramInput) {
                paramInput.value = richSelector.getValue();
            }
        }

        require('esui').register(RichSelector);

        return RichSelector;
    }
);
