/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 广告列表视图类
 * @author lisijin(ibadplum@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var ListView = require('common/ListView');
        var util = require('er/util');
        var u = require('underscore');
        require('tpl!./tpl/list.tpl.html');
        require('esui/Tip');
        /**
         * 频道分组列表视图类
         *
         * @constructor
         * @extends common/ListView
         */
        function DeliveryListView() {
            ListView.apply(this, arguments);
        }

        util.inherits(DeliveryListView, ListView);

        /** 
         * 使用的模板名称
         *
         * @type {string}
         */
        DeliveryListView.prototype.template = 'deliveryList';

        var tableFields = [
            {
                title: function () {
                    var className = this.order === 'asc'
                        ? 'collect-unstar' : 'collect-star';
                    var html = '<div id="listStars">'
                        + '<div class="' + className + '"></div>'
                        + '</div>';
                    return html;
                },
                field: 'flag',
                sortable: true,
                resizable: false,
                width: 59,
                stable: true,
                content: function (item) {
                    var config = {
                        command: 'star',
                        args: item.id
                    };

                    if (item.flag) {
                        config.className = 'table-unstar';
                        config.text = '取消收藏';
                    }
                    else {
                        config.className = 'table-star';
                        config.text = '收藏';
                    }

                    var Table = require('esui/Table');
                    return Table.command(config);
                }
            },
            {
                title: '名称',
                field: 'deliveryName',
                sortable: true,
                resizable: false,
                width: 100,
                content: function (item) {
                    var linkTemplate = '<a href="#/delivery/detail~id=${:id}" '
                        + 'data-redirect="global">${:name}</a>';
                    return u.template(linkTemplate, item);
                }
            },
            {
                title: 'ID',
                field: 'id',
                sortable: true,
                resizable: false,
                width: 80,
                stable: true,
                content: 'id'
            },
            {
                title: '状态',
                field: 'status',
                sortable: false,
                resizable: false,
                width: 60,
                stable: true,
                content: function (item) {
                    var deliveryTypes = require('./enum').Status;
                    return deliveryTypes.getTextFromValue(item.status);
                }
            },
            {
                title: '订单',
                field: 'orderName',
                sortable: false,
                resizable: false,
                width: 100,
                content: 'orderName'
            },
            {
                title: '计费方式',
                field: 'priceModel',
                sortable: false,
                resizable: false,
                width: 70,
                stable: true,
                content: function (item) {
                    var priceModel = require('./enum').PriceModel;
                    return priceModel.getTextFromValue(item.priceType);
                }
            },
            {
                title: '优先级别',
                field: 'priority',
                sortable: false,
                resizable: false,
                width: 70,
                stable: true,
                content: function (item) {
                    var priority = require('./enum').Priority;
                    var value = item.priority;
                    var enumValue;
                    if (value === 1) {
                        enumValue = 0;
                    }
                    else if (value < 12) {
                        enumValue = 1;
                    }
                    else if (value < 22) {
                        enumValue = 2;
                    }
                    else {
                        enumValue = 3;
                    }
                    return priority.getTextFromValue(enumValue);
                }
            },
            // {
            //     title: '平台',
            //     field: 'priceModel',
            //     sortable: false,
            //     resizable: false,
            //     width: 100,
            //     content: function (item) {
            //         var platForm = require('./enum').Platform;
            //         return platForm.getTextFromValue(item.platForm);
            //     }
            // },
            {
                title: '开始时间',
                field: 'beginTime',
                sortable: true,
                resizable: false,
                width: 90,
                stable: true,
                content: function (item) {
                    return getTimeText(item.beginTime);
                }
            },
            {
                title: '结束时间',
                field: 'endTime',
                sortable: true,
                resizable: false,
                width: 90,
                stable: true,
                content: function (item) {
                    return getTimeText(item.endTime);
                }
            },
            {
                title: '进度',
                field: 'progess',
                tip: '进度条表示投放量进度，进度线表示时间进度',
                sortable: false,
                resizable: false,
                width: 120,
                stable: true,
                content: function (item) {
                    var progess;
                    var text;
                    if (item.planAmount !== null) {
                        progess = parseInt(
                            item.actualAmount / item.planAmount * 100,
                            10
                        );
                        text = [
                            '计划投放量为' + item.planAmount,
                            '实际投放量为' + item.actualAmount
                        ].join(',');
                    }
                    else {
                        progess = parseInt(item.timeProgess, 10);
                        text = [
                            '开始时间为' + getTimeText(item.beginTime),
                            '结束时间为' + getTimeText(item.endTime)
                        ].join(',');
                    }
                    var timeProgess = parseInt(item.timeProgess, 10) || 0;
                    var progessPercent = isNaN(progess)
                        ? '-' : progess + '%';           
                    var progessWidth = isNaN(progess) ? 0 : progess;
                    text +=  ',时间进度为' + timeProgess + '%';
                    var html = ''
                        + '<div class="progess-wrapper" title="' + text + '">'
                        +   '<div class="progess-time" style="width:'
                        +   timeProgess + '%">'
                        +   '</div>'
                        +   '<div class="progess">' + progessPercent
                        +   '</div>'
                        +   '<div class="progess-left" '
                        +     'style="width:' + progessWidth + '%"></div>'
                        +   '<div class="progess-right"></div>'
                        + '</div>';
                    return html;
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
                            auth: item.canModify && item.modifiable,
                            url: '#/delivery/update~id=' + item.id
                        },
                        {
                            text: '查看',
                            type: 'read',
                            auth: !item.canModify,
                            url: '#/delivery/view~id=' + item.id
                        },
                        {
                            text: '报告',
                            type: 'report',
                            url: '#/report/delivery/date~id=' + item.id,
                            auth: item.hasReport
                        }
                    ];

                    var Table = require('esui/Table');
                    return Table.operations(config);
                }
            }
        ];

        function getTimeText(time) {
            if (time) {
                return time.replace(/(\d{4})(\d{2})(\d{2})(\d+)/, '$1-$2-$3');
            }
            else {
                return '-';
            }
        }
        /**
         * 控件额外属性
         *
         * @type {Object}
         */
        DeliveryListView.prototype.uiProperties = {
            table: {
                fields: tableFields
            },
            keyword: {
                placeholder: '输入广告ID或名称'
            }
        };

         /**
         * 控件事件配置
         *
         * @type {Object}
         * @override
         */
        DeliveryListView.prototype.uiEvents = {
            'table:command': star
        };

        /**
         * 视图加星星
         *
         * @param {Object} item 更新后的创意信息
         */
        DeliveryListView.prototype.updateItem = function (item) {
            var index = u.indexOf(this.model.get('results'), item);

            if (index < 0) {
                throw new Error('No row found for updating delivery');
            }

            this.get('table').updateRowAt(index, item);
        };

        /**
         * 收藏
         * @param {Object} e 控件事件对象
         */ 
        function star(e) {
            if (e.name === 'star') {
                this.fire('togglestar', { id: e.args });
            }
        }

        DeliveryListView.prototype.render = function () {
            this.uiProperties = u.clone(this.uiProperties);
            var companyId = this.model.get('companyId');
            var orderId = this.model.get('orderId');
            var order = u.findWhere(
                tableFields, { field: 'orderName'});
            if (companyId || orderId) {
                this.uiProperties.table.fields =
                    u.without(tableFields, order);
            }
            ListView.prototype.render.apply(this, arguments);
        };

        return DeliveryListView;
    }
);