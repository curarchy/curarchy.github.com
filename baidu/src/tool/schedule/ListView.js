/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file Schedule列表视图类
 * @author exodia
 * @date 13-12-9
 */
define(
    function (require) {
        var ListView = require('common/ListView');
        var util = require('er/util');
        var PriceModel = require('slot/enum').PriceModel;
        var moment = require('moment');
        var u = require('underscore');

        require('tpl!./tpl/list.tpl.html');
        require('ui/MiddlePosLayer');

        /**
         * Schedule列表视图类
         *
         * @constructor
         * @extends common/ListView
         */
        function ScheduleListView() {
            ListView.apply(this, arguments);
        }

        util.inherits(ScheduleListView, ListView);

        /**
         * 使用的模板名称
         *
         * @type {string}
         */
        ScheduleListView.prototype.template = 'scheduleList';

        var tableFields = [
            {
                title: '广告位名称',
                field: 'name',
                resizable: true,
//                minWidth: 100,
                stable: false,
                content: function (item) {
                    var html = '<span title="' + item.name + '">' + item.name
                        + '</span>';

                    return html;
                }
            },
            {
                title: '尺寸',
                field: 'size',
                resizable: false,
                stable: true,
                width: 100,
                align: 'right',
                content: function (item) {
                    return item.width + '*' + item.height;
                }
            },
            {
                title: '售卖方式',
                field: 'priceModel',
                resizable: false,
                stable: true,

                width: 93,
                content: function (item) {
                    return PriceModel.getTextFromValue(item.priceModel);
                }
            }
        ];

        /**
         * 控件额外属性
         *
         * @type {Object}
         */
        ScheduleListView.prototype.uiProperties = {
            'table': {
                fields: tableFields,
                breakLine: false,
                followHead: false
            },
            'keyword': {
                width: 155,
                placeholder: '请输入ID或名称'
            }
        };

        ScheduleListView.prototype.uiEvents = {
            'panel:command': dateFilter,
            'month-select:change': function (e) {
                e.name = 'month-select';
                dateFilter.call(this, e);
            },
            'schedule-table:cellclick': function (e) {
                this.fire('info', { index: e.rowIndex, date: e.colIndex + 1 });
            }
        };

        function dateFilter(e) {
            var args = this.getSearchArgs();
            var start = moment(this.model.get('startTime'), 'YYYYMMDD');
            switch (e.name) {
                case 'prev-month':
                    start = start.subtract('months', 1);
                    break;
                case 'next-month':
                    start = start.add('months', 1);
                    break;
                case 'prev-year':
                    start = start.subtract('years', 1);
                    break;
                case 'next-year':
                    start = start.add('years', 1);
                    break;
                case 'month-select':
                    start = start.month(e.target.getValue() - 1);
                    break;
            }

            args.startTime = start.format('YYYYMMDD');
            args.endTime = start.endOf('month').format('YYYYMMDD');
            this.fire('search', { args: args });
        }

        /**
         * 显示广告位信息弹层
         * @param {Number} index 信息所在位置
         * @param {Number} date 信息的日期
         * @param {Object} info 广告位信息
         */
        ScheduleListView.prototype.showInfo = function (index, date, info) {
            var content = getContentHTML(info);
            this.get('schedule-table').showTip(index, date - 1, content);
        };

        function getContentHTML(info) {
            return getHeadHTML(info) + getBodyHTML(info);
        }

        var itemTemplate =
            '<p class="schedule-info-line">${text}' +
                '<span class="schedule-info-value">${value}</span></p>';
        var getItemHTML = u.template(itemTemplate);

        var linkTemplate = '<a data-redirect="global" '
            + 'href="#/delivery/detial~id=${id}">${text}</a>';
        var getLinkHTML = u.template(linkTemplate);

        var textTemplate = '<span>${text}</span>';
        var getTextHTML = u.template(textTemplate);

        function getHeadHTML(info) {
            var fields = {
                estimate: '库存资源总量(预估):',
                todayAmount: '广告占用量:',
                restFlag: '是否有广告位补余:'
            };

            var html = '<div class="schedule-info-head">';
            u.each(fields, function (text, key) {
                var value = info[key];

                if (key === 'restFlag') {
                    value = value ? '是' : '否';
                } else {
                    value = value === null ? 'N/A' : value + '次展现';
                }

                var itemHTML = getItemHTML({
                    text: text,
                    value: value
                });

                html += itemHTML;
            });

            return html + '</div>';
        }

        function getBodyHTML(info) {
            var fields = {
                name: '广告名称:',
                orderName: '所属订单:',
                adOwnerName: '广告客户:',
                salerName: '销售人员:',
                amount: '投放量:'
            };

            var slots = info.results;
            var html = '<div class="schedule-info-body">';

            u.each(slots, function (slot) {
                u.each(slot, function (value, key) {
                    if (key === 'id') {
                        return;
                    }

                    value = value === null ? 'N/A' : value;

                    if (key === 'amount' && value !== 'N/A') {
                        value += '次展现';
                    }

                    if (key === 'name') {
                        var getter = slot.hasAuthority ?
                            getLinkHTML : getTextHTML;

                        value = getter({ id: slot.id, text: value });
                    }

                    //CPD显示是否有定向条件
                    var CPD = PriceModel.getValueFromAlias('CPD');
                    if (slot.priceModel === CPD && key === 'isOriented') {
                        html += getItemHTML({
                            text: '是否有定向条件',
                            value: slot.isOriented ? '有' : '无'
                        });

                        return;
                    }

                    if (fields.hasOwnProperty(key)) {
                        html += getItemHTML({
                            text: fields[key],
                            value: value
                        });
                    }
                });
            });
            return html + '</div>';
        }

        return ScheduleListView;
    }
);