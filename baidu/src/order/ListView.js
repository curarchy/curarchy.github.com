/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 订单列表视图类
 * @author lisijin(ibadplum@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var ListView = require('common/ListView');
        var util = require('er/util');
        var u = require('underscore');
        require('tpl!./tpl/list.tpl.html');

        /**
         * 频道分组列表视图类
         *
         * @constructor
         * @extends common/ListView
         */
        function OrderListView() {
            ListView.apply(this, arguments);
        }

        util.inherits(OrderListView, ListView);

        /** 
         * 使用的模板名称
         *
         * @type {string}
         */
        OrderListView.prototype.template = 'orderList';

        var tableFields = [
            {
                title: '名称',
                field: 'name',
                sortable: true,
                width: 100,
                content: function (item) {
                    var linkTemplate = '<a href="#/order/detail~id=${:id}" '
                        + 'data-redirect="global">${:name}</a>';
                    return u.template(linkTemplate, item);
                }
            },
            {
                title: 'ID',
                field: 'id',
                sortable: true,
                width: 80,
                stable: true,
                content: 'id'
            },
            {
                title: '广告状态',
                field: 'deliveries',
                sortable: false,
                // 最坏情况是3+3+4共10个字
                width: 150,
                stable: false,
                content: function (item) {
                    var deliveryIndex = 
                        u.toMap(item.deliveries, 'status', 'count');
                    var result = [];

                    var template = '<span class="order-list-devlivery '
                        + 'delivery-${alias}">${:text}(${count})</span>';
                    var DeliveryStatus = require('delivery/enum').Status;
                    u.each(
                        [
                            DeliveryStatus.SLOT, DeliveryStatus.WAIT,
                            DeliveryStatus.REQUEST, DeliveryStatus.PAUSE,
                            DeliveryStatus.STOP, DeliveryStatus.OVER
                        ],
                        function (status) {
                            if (!deliveryIndex[status]) {
                                return;
                            }

                            var html = '';
                            if (result.length % 3 === 0) {
                                html += '</div><div>';
                            }

                            var enumItem = DeliveryStatus.fromValue(status);
                            html += u.template(
                                template,
                                {
                                    alias: enumItem.alias.toLowerCase(),
                                    count: deliveryIndex[status],
                                    text: enumItem.text
                                }
                            );
                            result.push(html);
                        }
                    );

                    result.push();

                    return '<div>' + result.join('') + '</div>';
                }
            },
            {
                title: '广告客户',
                field: 'adownerName',
                sortable: true,
                width: 100,
                content: 'adownerName'
            },
            {
                title: '销售人员',
                field: 'salerName',
                sortable: true,
                width: 100,
                content: function (item) {
                    return item.salerName || '--';
                }
            },
            {
                title: '操作',
                field: 'operation',
                sortable: false,
                width: 80,
                stable: true,
                content: function (item) {
                    var config = [
                        {
                            text: '修改',
                            type: 'modify',
                            auth: item.canModify,
                            url: '#/order/update~id=' + item.id
                                + '&customer=' + item.adownerId
                        },
                        {
                            text: '查看',
                            type: 'read',
                            auth: !item.canModify,
                            url: '#/order/view~id=' + item.id
                                + '&customer=' + item.adownerId
                        },
                        {
                            text: '报告',
                            type: 'report',
                            auth: item.hasReport,
                            url: '#/report/order/date~id=' + item.id
                        }
                    ];

                    var Table = require('esui/Table');
                    return Table.operations(config);
                }
            }
        ];

        /**
         * 控件额外属性
         *
         * @type {Object}
         */
        OrderListView.prototype.getUIProperties = function () {
            var properties = {
                keyword: {
                    placeholder: '输入订单ID或名称'
                },
                table: {}
            };
            var fields = tableFields;
            // 如果查看某个销售人员下的订单，则表格不显示销售人员列
            if (!this.model.get('canFilterSaler')) {
                var salerField = u.findWhere(
                    tableFields,
                    { field: 'salerName'}
                );
                fields = u.without(tableFields, salerField);
            }
            if (this.model.get('companyId')) {
                var adownerName = u.findWhere(
                    tableFields, { field: 'adownerName'});
                fields =
                    u.without(tableFields, adownerName);
            }
            properties.table.fields = fields;
            return properties;
        };

        // OrderListView.prototype.render = function () {
        //     this.uiProperties = u.clone(this.uiProperties);
        //     var companyId = this.model.get('companyId');
        //     var adownerName = u.findWhere(
        //         tableFields, { field: 'adownerName'});
        //     if (companyId) {
        //         this.uiProperties.table.fields =
        //             u.without(tableFields, adownerName);
        //     }
        //     ListView.prototype.render.apply(this, arguments);
        // };
        
        return OrderListView;
    }
);