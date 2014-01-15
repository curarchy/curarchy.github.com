/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 创意库模板列表Action
 * @author exodia(dengxinxin@baidu.com)
 * @date 2013/8/7
 */
define(
    function (require) {
        var u = require('underscore');
        var util = require('er/util');
        var ListAction = require('common/ListAction');
        var config = require('./config');

        /**
         * 错误处理函数
         *
         * @param {Object} err
         * @param {String} err.message
         */
        function error(err) {
            this.view.alert({
                title: '操作失败',
                content: err.message
            });
        }

        /**
         * 创意加星
         */
        function starCreative(e) {
            var view = e.target;
            var id = e.args;

            var req = this.model.toggleStar(id);

            req.then(
                u.bind(view.toggleStar, view),
                function () {
                    view.alert(
                        {
                            title: '收藏失败！',
                            content: '文案待定'
                        }
                    );
                }
            );
        }

        /**
         * 预览创意
         */
        function preview(e) {
            var lodingData = this.model.getPreviewOption(e.id);

            lodingData.then(
                u.bind(this.view.preview, this.view),
                u.bind(error, this)
            );
        }

        /**
         * 跳转链接
         */
        function redirect(e) {
            this.redirect(e.url, e.options);
        }

        /*function addToSlot() {
            var results = this.model.get('addList');
            this.fire('addCreative', { results: results });
        }*/

        /**
         * 创意库模板列表
         *
         * @constructor
         * @extends common/ListAction
         */
        function CreativeList() {
            ListAction.apply(this, arguments);
        }

        util.inherits(CreativeList, ListAction);


        CreativeList.prototype.defaultArgs = {
            orderBy: 'adId',
            order: 'desc',
            type: '0,1,2,3,10'
        };
        /**
         * 视图类型
         *
         * @type {function}
         * @override
         */
        CreativeList.prototype.viewType = require('./ListView');

        /**
         * action 对应的中文描述
         */
        CreativeList.prototype.entityDescription = config.entityDescription;

        /**
         * 数据模型类型
         *
         * @type {function}
         * @override
         */
        CreativeList.prototype.modelType = require('./ListModel');

        CreativeList.prototype.initBehavior = function () {
            this.view.on('star', starCreative, this);
            this.view.on('unstar', starCreative, this);
            this.view.on('preview', preview, this);
            this.view.on('redirect', redirect, this);
//            this.view.on('addToSlot', addToSlot, this);
            ListAction.prototype.initBehavior.apply(this, arguments);
        };

        return CreativeList;
    }
);