/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file ListModel列表数据模型类
 * @author exodia
 * @date 13-12-9
 */
define(
    function (require) {
        var ListModel = require('common/ListModel');
        var Data = require('./Data');
        var SlotData = require('slot/Data');
        var ChannelData = require('channel/Data');
        var datasource = require('er/datasource');
        var util = require('er/util');
        var u = require('underscore');
        var moment = require('moment');
        var DATE_FORMAT = 'YYYYMMDD';
        var systemTime = moment(require('common/global/system').timeStamp);

        var PriceModel = require('slot/enum').PriceModel.toArray();
        PriceModel.unshift({ value: '', text: '所有售卖方式' });


        function ScheduleListModel() {
            ListModel.call(this, 'schedule');
            this.data = new Data();
            this.slotData = new SlotData();
            this.channelData = new ChannelData();
        }

        util.inherits(ScheduleListModel, ListModel);

        /**
         * 数据源配置
         *
         * @type {Object}
         * @override
         */
        ScheduleListModel.prototype.datasource = {
            channels: function (model) {
                var loading = model.channelData.list();
                return loading.done(function (res) {
                    var channels = res.results || [];
                    u.each(
                        channels,
                        function (channel) {
                            channel.value = channel.id;
                        }
                    );
                    channels.unshift({ text: '所有频道', value: '' });
                    return channels;
                });
            },
            slotSizes: function (model) {
                var loading = model.slotData.size();
                return loading.done(function (res) {
                    var size = res.results || [];
                    u.each(size, function (v, i) {
                        var value = v.width + '*' + v.height;
                        size[i].value = size[i].text = value;
                    });
                    size.unshift({ text: '所有尺寸', value: '' });
                    return size;
                });
            },

            priceModels: datasource.constant(PriceModel)
        };


        function processDate(model) {
            var now = moment(model.get('startTime'), DATE_FORMAT);
            var year = now.year();
            var months = getMonths(year);
            var month = now.month();
            var prevYear = year - 1;
            var nextYear = year + 1;
            var endYear = systemTime.year() + 1;
            var end = moment([endYear, systemTime.month()]);
            model.fill({
                months: months,
                month: month + 1,
                isStartMonth: month === 0 && year == 2010,
                isEndMonth: moment([year, month]).isSame(end),
                year: year,
                isStartYear: year == 2010,
                isEndYear: year == endYear,
                prevYear: prevYear,
                nextYear: nextYear
            });
        }

        /**
         * 准备数据
         *
         * @override
         */
        ScheduleListModel.prototype.prepare = function () {
            processDate(this);
            var Statuses = require('./enum').Statuses.toArray();
            u.each(Statuses, function (status) {
                var alias = status.alias.toLowerCase().replace(/_/g, '-');
                status.cls = 'status-' + alias;
            });
            this.set('statuses', Statuses);
        };

        function getMonths(year) {
            var items = new Array(12);
            for (var i = 11; i > -1; --i) {
                items[i] = {
                    value: i + 1,
                    text: year + '-' + (i + 1)
                };
            }

            return items;
        }

        /**
         * 获取请求后端的参数
         *
         * @return {Object}
         * @override
         */
        ScheduleListModel.prototype.getQuery = function () {
            var query = ListModel.prototype.getQuery.apply(this, arguments);
            var startTime = this.get('startTime');
            var endTime = this.get('endTime');
            if (!startTime) {
                startTime = systemTime.startOf('month').format(DATE_FORMAT);
                endTime = systemTime.endOf('month').format(DATE_FORMAT);
                this.fill({
                    startTime: startTime,
                    endTime: endTime
                });
            }
            query.startTime = startTime;
            query.endTime = endTime ||
                moment(startTime).endOf('month').format(DATE_FORMAT);
            query.channelId = this.get('channelId');

            var size = this.get('size');
            if (size) {
                size = size.split('*');
                query.width = size[0];
                query.height = size[1];
            }

            query.priceModel = this.get('priceModel');

            return query;
        };

        /**
         * 获取广告位信息
         * @param {Number} index 数据索引位置
         * @param {Number} date 日期
         */
        ScheduleListModel.prototype.getSlotInfo = function (index, date) {
            var data = this.get('results')[index];
            date = moment([ this.get('year'), this.get('month') - 1, date ]);
            return this.data.getSlotInfo(data.id, date.format(DATE_FORMAT));
        };

        return ScheduleListModel;
    }
);