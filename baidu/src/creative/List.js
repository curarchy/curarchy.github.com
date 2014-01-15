/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 创意列表Action
 * @author lisijin(ibadplum@gmail.com)
 * @date $DATE$
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
        function CreativeList() {
            ListAction.apply(this, arguments);
        }

        util.inherits(CreativeList, ListAction);

        /**
         * 当前Action的分组名称
         *
         * @type {string}
         * @override
         */
        CreativeList.prototype.group = 'order';

        /**
         * 当前Action负责的实体的描述名称
         *
         * @type {string}
         * @override
         */
        CreativeList.prototype.entityDescription = config.description;

        /**
         * 视图类型
         *
         * @type {function}
         * @override
         */
        CreativeList.prototype.viewType = require('./ListView');

        /**
         * 数据模型类型
         *
         * @type {function}
         * @override
         */
        CreativeList.prototype.modelType = require('./ListModel');

        /**
         * 默认查询参数
         *
         * @param {Object}
         * @override
         */
        CreativeList.prototype.defaultArgs = {
            orderBy: 'adId',
            order: 'desc'
        };

        /**
         * 预览创意
         */
        function preview(e) {
            var lodingData = this.model.getPreviewOption(e.id);
            lodingData.then(
                u.bind(this.view.preview, this.view)
            );
        }

        /**
         * 通知批量操作广告位失败失败
         *
         * @param {Object} context 批量操作的上下文对象
         */
        ListAction.prototype.notifyBatchFail = function (context, errors) {
            var title = '批量删除创意';
            var response = util.parseJSON(errors.responseText);
            this.view.alert(response['fields'][0]['message'], title);
        };

        /**
        * 初始化交互行为
        *
        * @override
        */
        CreativeList.prototype.initBehavior = function () {
            this.view.on('preview', u.bind(preview, this));
            ListAction.prototype.initBehavior.apply(this, arguments);
        };

        return CreativeList;
    }
);
