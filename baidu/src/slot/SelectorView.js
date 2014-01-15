/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 广告位选择视图类
 * @author lixiang(lixiang05@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var UIView = require('ef/UIView');
        var util = require('er/util');
        var lib = require('esui/lib');
        var u = require('underscore');

        require('tpl!./tpl/slotsSelector.tpl.html');

        /**
         * 广告位选择视图类
         *
         * @constructor
         * @extends ef/UIView
         */
        function SelectorView() {
            UIView.apply(this, arguments);
        }

        util.inherits(SelectorView, UIView);

        /** 
         * 使用的模板名称
         *
         * @type {string}
         */
        SelectorView.prototype.template = 'slotsSelector';

        var slotTableFields = [
            {
                title: '广告位名称',
                field: 'name',
                content: 'name',
                width: 100
            },
            {
                title: '尺寸',
                field: 'size',
                width: 100,
                content: 'size'
            }
        ];

        /**
         * 控件事件配置
         *
         * @type {Object}
         * @override
         */
        SelectorView.prototype.uiEvents = {
            'channels:load': loadSlots,
            'slots:add': addSlots,
            'selected-slots:delete': unselectSlot,
            'submit:click': select,
            'cancel:click': cancel
        };

        function commonGetTreeItemHtml (node) {
            var text = lib.encodeHTML(node.text);
            var keyword = this.keyword;
            var displayText = text;
            if (keyword) {
                displayText = displayText.replace(
                    new RegExp(keyword, 'g'),
                    function (word) {
                        return '<b>' + word + '</b>';
                    }
                );
            }

            var itemTemplate = ''
                    + '<span class="item-text" title="${text}">'
                    + '${displayText}</span>';

            // 普通节点文字
            var data = {
                text: text,
                displayText: displayText
            };

            return lib.format(itemTemplate, data);
        }

        /**
         * 控件额外属性
         *
         * @type {Object}
         */
        SelectorView.prototype.uiProperties = {
            'channels': {
                itemName: '频道',
                title: '选择频道',
                emptyText: '没有符合条件的频道',
                mode: 'load',
                skin: 'authority',
                multi: true,
                height: 390,
                width: 200,
                tableType: 'tree',
                getItemHTML: commonGetTreeItemHtml
            },
            'slots': {
                itemName: '广告位',
                title: '选择广告位',
                emptyText: '请从左侧选择你要的频道或没有符合条件的广告位',
                mode: 'add',
                skin: 'authority',
                height: 390,
                width: 400,
                needBatchAction: true,
                hasSearchBox: false,
                tableType: 'table',
                fields: slotTableFields
            },
            'selected-slots': {
                itemName: '广告位',
                title: '已选择广告位',
                emptyText: '请从左侧选择你要的广告位',
                mode: 'delete',
                skin: 'authority',
                height: 390,
                width: 200,
                needBatchAction: true,
                hasSearchBox: false,
                tableType: 'tree',
                getItemHTML: commonGetTreeItemHtml
            }
        };

        /**
         * 刷新广告位已选区
         *
         * @inner
         */
        SelectorView.prototype.refreshSelectedSlots = function () {
            var selectedSlotTree = this.model.get('selectedSlotTree');
            var selectedSelector = this.get('selected-slots');
            selectedSelector.set('datasource', selectedSlotTree);
        };

        /**
         * 刷新广告位备选区
         *
         * @inner
         */
        SelectorView.prototype.refreshSlotsArea = function () {
            var slots = this.model.get('slots');
            var slotSelector = this.get('slots');
            slotSelector.set('datasource', u.clone(slots));
            var selectedSlots = this.model.get('selectedSlots');
            slotSelector.selectItems(selectedSlots, true);
        };

        /**
         * 刷新广告位备选区选择状态
         *
         * @param {Array} slots 目标广告位集合
         * @inner
         */
        SelectorView.prototype.updateSlotsStates = function (slots) {
            var slotsTable = this.get('slots');
            slotsTable.selectItems(slots, false);
        };

        /**
         * 刷新广告位筛选区（还没用上呢。。。）
         *
         * @inner
         */
        SelectorView.prototype.refreshSlotsFilter = function () {
            var slotSelector = this.get('slots');
            slotSelector.setProperties({
                filterItems: [
                    {
                        datasource: sizes,
                        key: 'size'
                    }
                ]
            });
        };

        /**
         * 增加广告位
         *
         * @param {Event} e DOM事件对象
         * @inner
         */
        function addSlots(e) {
            var slotsTable = this.get('slots');
            var selectedItems = slotsTable.getSelectedItems();
            this.fire('addslots', { slots: selectedItems });
        }

        /**
         * 取消广告位选择
         *
         * @param {Event} e DOM事件对象
         * @inner
         */
        function unselectSlot(e) {
            var selectedSelector = this.get('selected-slots');
            var tree = selectedSelector.getResultContent();
            var slots = tree.getLeafItems(e.items);
            this.fire('deleteslots', { slots: slots });
        }


        /**
         * 根据频道加载广告位
         *
         * @param {Event} e DOM事件对象
         * @inner
         */
        function loadSlots(e) {
            var item = e.item;
            this.fire('loadslots', {channel: item});
        }

        /**
         * 保存
         *
         * @inner
         */
        function select() {
            this.fire('select');
        }

        /**
         * 取消
         *
         * @inner
         */
        function cancel() {
            this.fire('cancel');
        }


        /**
         * 获取选中的广告位
         *
         * @param {Array} 
         */
        SelectorView.prototype.getSelectedSlots = function () {
            var selectedSelector = this.get('selected-slots');
            var slots = selectedSelector.getSelectedItems();
            return slots;
        };

        return SelectorView;
    }
);
