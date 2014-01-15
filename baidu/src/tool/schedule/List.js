/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file Schedule列表Action
 * @author exodia
 * @date 13-12-9
 */
define(
    function (require) {
        var util = require('er/util');
        var ListAction = require('common/ListAction');
        var config = require('./config');
        var u = require('underscore');

        /**
         * 频道列表
         *
         * @constructor
         * @extends common/ListAction
         */
        function ScheduleList() {
            ListAction.apply(this, arguments);
        }

        util.inherits(ScheduleList, ListAction);

        /**
         * 当前Action的分组名称
         *
         * @type {string}
         * @override
         */
            // TODO: 必须设置这个值，选择`slot | order | setting | report`
        ScheduleList.prototype.group = 'slot';

        /**
         * 当前Action负责的实体的描述名称
         *
         * @type {string}
         * @override
         */
        ScheduleList.prototype.entityDescription = config.description;

        /**
         * 视图类型
         *
         * @type {function}
         * @override
         */
        ScheduleList.prototype.viewType = require('./ListView');

        /**
         * 数据模型类型
         *
         * @type {function}
         * @override
         */
        ScheduleList.prototype.modelType = require('./ListModel');

        ScheduleList.prototype.initBehavior = function () {
            ListAction.prototype.initBehavior.apply(this, arguments);
            this.view.on('info', getSlotInfo, this);
        };

        function getSlotInfo(e) {
            var index = e.index;
            var date = e.date;
            var loading = this.model.getSlotInfo(index, date);
            loading.done(
                u.bind(this.view.showInfo, this.view, index, date)
            );
        }

        return ScheduleList;
    }
);
