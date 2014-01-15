/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 广告位列表视图类
 * @author wangyaqiong(catkin2009@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var ListView = require('common/ListView');
        var util = require('er/util');
        var u = require('underscore');
 
        require('tpl!../channel/tpl/common.tpl.html');
        require('tpl!./tpl/list.tpl.html');

        /**
         * 频道分组列表视图类
         *
         * @constructor
         * @extends common/ListView
         */
        function SlotListView() {
            ListView.apply(this, arguments);
        }
        
        util.inherits(SlotListView, ListView);

        /** 
         * 使用的模板名称
         *
         * @type {string}
         */
        SlotListView.prototype.template = 'slotList';

        var status = require('common/global/status');
        var statusHTMLMapping = [
            status.removed,
            status.normal
        ];

        var tableFields = [
            {
                title: '名称',
                field: 'name',
                sortable: true,
                resizable: true,
                content: function (item) {
                    if (item.hasDetail) {
                        var linkTemplate = '<a href="#/slot/detail~id=${:id}" '
                            + 'data-redirect="global">${:name}</a>';
                        return u.template(linkTemplate, item);
                    }
                    else {
                        return u.escape(item.name);
                    }
                }
            },
            {
                title: 'ID',
                field: 'adPositionId',
                sortable: true,
                resizable: true,
                width: 80,
                stable: true,
                content: 'id'
            },
            {
                title: '状态',
                field: 'status',
                resizable: false,
                width: 50,
                stable: true,
                content: function (item) {
                    var status = statusHTMLMapping[item.status];
                    var Table = require('esui/Table');
                    return Table.status(status);
                }
            },
            {
                title: '频道',
                field: 'channelName',
                resizable: false,
                sortable: true,
                content: function (item) {
                    var linkTemplate = '<a '
                        + 'href="#/channel/detail~id=${:channelId}" '
                        + 'data-redirect="global">${:channelName}</a>';
                    return u.template(linkTemplate, item);
                }
            },
            {
                title: '尺寸',
                field: 'size',
                sortable: true,
                resizable: true,
                width: 100,
                stable: true,
                content: function (item) {
                    return item.width + '*' + item.height;
                }
            },
            {
                title: '计费方式',
                field: 'priceModel',
                resizable: true,
                width: 70,
                stable: true,
                content: function(item) {
                    var priceModelTypes = ['CPD', 'CPM', 'CPC'];
                    return priceModelTypes[item.priceModel];
                }
            },
            {
                title: '百度流量交易服务',
                field: 'allowRest',
                resizable: true,
                width: 130,
                stable: true,
                content: function (item) {
                    if (item.allowRest) {
                        return '是';
                    }
                    else {
                        return '否';
                    }
                }
            },
            {
                title: '操作',
                field: 'operation',
                sortable: false,
                resizable: false,
                width: 80,
                stable: true,
                content: function (item) {
                    var config = [
                        {
                            text: '修改',
                            type: 'modify',
                            auth: item.canModify,
                            url: '#/slot/update~id=' + item.id
                        },
                        {
                            text: '查看',
                            type: 'read',
                            auth: !item.canModify,
                            url: '#/slot/view~id=' + item.id
                        },
                        {
                            text: '报告',
                            type: 'report',
                            auth: item.hasReport,
                            url: '#/report/slot/date~id=' + item.id
                        }
                    ];
                    var Table = require('esui/Table');
                    return Table.operations(config);
                }
            }
        ];

        SlotListView.prototype.getUIProperties = function () {
            var properties = {
                keyword: {
                    placeholder: '输入广告位ID、名称或说明'
                },
                'slot-batch-operations': {
                    datasource: [
                        { text: '显示顺序', url: '/slot/batchOrder' },
                        { text: '所属频道', url: '/slot/batchChannel'}
                    ]
                },
                table: {}
            };

            // 如果查看某个频道下的广告位，则表格不显示频道列
            if (this.model.get('channelId')) {
                var channelField = u.findWhere(
                    tableFields,
                    { field: 'channelName'}
                );
                properties.table.fields = u.without(tableFields, channelField);
            }
            else {
                properties.table.fields = tableFields;
            }

            return properties;
        };

        /**
         * 过展或者隐藏更多筛选项面板
         *
         */
        function toggleExtraSearchOptions(e) {
            var extraOptionsWrapper = this.get('extra-filter-options-wrapper');
            var isHiddenWrapper = extraOptionsWrapper.isHidden();
            if (isHiddenWrapper) {
                extraOptionsWrapper.show();
            }
            else {
                extraOptionsWrapper.hide();
            }
        }

        /**
         * 获取table已经选择的列的数据并保存在model中
         *
         * @return {Object[]} 当前table的已选择列对应的数据
         */
        ListView.prototype.getSelectedItems = function () {
            var table = this.get('table');
            var selectedItems = table ? table.getSelectedItems() : [];
            this.model.set('selectedItems', selectedItems);
            return selectedItems;
        };

        /**
         * 隐藏更多筛选项面板
         *
         */
        function cancelExtraSearchOptions(e) {
            var extraOptionsWrapper = this.get('extra-filter-options-wrapper');
            extraOptionsWrapper.hide();
        }

        /**
         * 添加更多筛选项中的参数
         * @private
         */
        function addExtraFilters () {
            var extraFilterForm = this.get('extra-filter');
            var extraData = extraFilterForm.getData();
            var args = this.getSearchArgs();
            var extraPriceModels = extraData.pricemodels;
            if (extraPriceModels instanceof Array) {
                args.priceModels = extraPriceModels.join(',');
            }
            else {
                args.priceModels = extraPriceModels;
            }
            

            this.fire('search', { args: args });
        }

        /**
         * 获取查询参数
         *
         * @return {Object}
         */
        SlotListView.prototype.getSearchArgs = function () {
            var args = ListView.prototype.getSearchArgs.apply(this, arguments);
            var priceModels = this.model.get('priceModels');
            if (priceModels) {
                args.priceModels = priceModels;
            }
            return args;
        };

        /**
         * 批量修改广告位的尺寸、所属频道以及显示顺序的事件
         *
         * @param {object} e 选择事件
         */
        function slotBatchOperations (e) {
            var item = e.item;
            var view = this;
            var selectItemsNum = this.getSelectedItems().length;
            var options = {
                url: item.url,
                title: '批量修改' + item.text,
                actionOptions: { number: selectItemsNum }
            };
            view.waitActionDialog(
                options
            ).then(
                function (e) {
                    var dialog = e.target;
                    var dialogAction = dialog.get('action');
                    dialogAction.on(
                        'entitysave',
                        function (e) {
                            view.fire('batchModifySlot', { entity: e.entity });
                            dialog.dispose();
                        }
                    );
                    dialogAction.on(
                        'submitcancel',
                        function () {
                            dialog.dispose();
                        }
                    );
                }
            );
        }

        /**
         * 控件事件属性
         *
         * @type {Object}
         */
        SlotListView.prototype.uiEvents = {
            'extra-options:click': toggleExtraSearchOptions,
            'extra-filter-cancel:click': cancelExtraSearchOptions,
            'extra-filter-submit:click': addExtraFilters,
            'price-all:change': togglePriceModelAll,
            'price-cpm:change': togglePriceModelSingle,
            'price-cpc:change': togglePriceModelSingle,
            'price-cpd:change': togglePriceModelSingle,
            'slot-batch-operations:select': slotBatchOperations,
            'slot-get-code:click': getCode
        };

        /**
         * 获取代码
         */
        function getCode(e) {
            var view = this;
            var selectItems = this.getSelectedItems();
            var options = {
                url: '/slot/generateCode',
                title: '获取代码',
                width: 880,
                actionOptions: { slots: selectItems }
            };
            view.waitActionDialog(options)
                .then(
                    function (e) {
                        var dialog = e.target;
                        var dialogAction = dialog.get('action');
                        dialogAction.on(
                            'cancel', dialog.dispose, dialog
                        );
                    }
                );
        }

        /**
         * 控制更多筛选属性选项的展现
         */
        SlotListView.prototype.updateExtraFilterOptions = function () {
            var model = this.model;
            var priceModel = model.get('priceModels');
            if (priceModel) {
                var priceModels = priceModel.split(',');
                // TODO: 用group重构
                var priceElements = [
                    this.get('price-cpd'),
                    this.get('price-cpm'),
                    this.get('price-cpc')
                ];
                u.each(priceModels, function (index) {
                    var selectedPrice = priceElements[index];
                    if (selectedPrice) {
                        selectedPrice.setChecked(true);
                    }
                });
            }
            else {
                var priceAll = this.get('price-all');
                priceAll.setChecked(true);
            }
        };

        /**
         * 选择或取消独立售卖方式
         */
        function togglePriceModelSingle() {
            var group = this.getGroup('search-price');
            function isChecked(checkbox) {
                return checkbox.isChecked();
            }

            // 任何一个选上就去掉“不限”，全部没选就把“不限”选上
            var shouldCheckAllPrice = !u.any(group, isChecked);
            this.get('price-all').setChecked(shouldCheckAllPrice);
        }

        /**
         * 选择或取消所有售卖方式
         */
        function togglePriceModelAll () {
            var priceAll = this.get('price-all');
            var priceCPM = this.get('price-cpm');
            var priceCPC = this.get('price-cpc');
            var priceCPD = this.get('price-cpd');
            // 如果只有不限已勾选，不能取消
            if (!priceAll.isChecked() && !priceCPM.isChecked()
                && !priceCPC.isChecked() && !priceCPD.isChecked()) {
                priceAll.setChecked(true);
            }
            else if (priceAll.isChecked()) {
                priceCPM.setChecked(false);
                priceCPC.setChecked(false);
                priceCPD.setChecked(false);
                priceAll.setChecked(true);
            }
        }

        SlotListView.prototype.updateBatchStatus = function () {
            ListView.prototype.updateBatchStatus.apply(this, arguments);
            var slotBatchOpertaions = this.get('slot-batch-operations');
            var items = this.getSelectedItems();
            var enabled = items && items.length;
            if (slotBatchOpertaions) {
                slotBatchOpertaions.set('disabled', !enabled);
            }
        };

        /**
         * 控制元素展现
         *
         * @override
         */
        SlotListView.prototype.enterDocument = function () {
            ListView.prototype.enterDocument.apply(this, arguments);
            this.updateExtraFilterOptions();
            updateGetCodeStatus.apply(this);
        };

        SlotListView.prototype.bindEvents = function () {
            ListView.prototype.bindEvents.apply(this, arguments);
            var table = this.get('table');
            if (table) {
                table.on('select', u.bind(updateGetCodeStatus, this));
            }
        };

        function updateGetCodeStatus() {
            var items = this.getSelectedItems();
            var button = this.getSafely('slot-get-code');
            var enabled = items && items.length;
            button.set('disabled', !enabled);
        }

        
        return SlotListView;
    }
);
