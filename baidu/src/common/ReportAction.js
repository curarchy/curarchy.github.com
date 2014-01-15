/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 报表Action基类
 * @author lixiang(lixiang05@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var util = require('er/util');
        var u = require('underscore');
        var BaseAction = require('common/BaseAction');
        var URL = require('er/URL');

        /**
         * 报表
         *
         * @constructor
         * @extends common/BaseAction
         */
        function ReportAction() {
            BaseAction.apply(this, arguments);
            this.entityName = 'report';
        }

        util.inherits(ReportAction, BaseAction);

        ReportAction.prototype.modelType = './ReportModel';

        /**
         * 创建数据模型对象
         *
         * @param {Object=} args 模型的初始化数据
         * @return {common/ReportModel}
         * @override
         */
        ReportAction.prototype.createModel = function (args) {
            // 把默认参数补回去，不然像表格的`orderBy`字段没值表格就不能正确显示
            u.defaults(args, this.defaultArgs);
            return BaseAction.prototype.createModel.apply(this, arguments);
        };

        // /**
        //  * 进行搜索
        //  *
        //  * @param {Object} args 搜索参数
        //  */
        // ReportAction.prototype.performSearch = function (args) {
        //     this.redirectForSearch(args);
        // };

        /**
         * 进行查询引起的重定向操作
         *
         * @param {Object} args 查询参数
         */
        ReportAction.prototype.redirectForSearch = function (args) {
            var path = this.model.get('url').getPath();
            var url = URL.withQuery(path, args);
            this.redirect(url, { force: true });
        };

        /**
         * 查询的事件处理函数
         *
         * @param {this} {common/ReportAction} Action实例
         * @param {Object} e 事件对象
         */
        function search(e) {
            this.redirectForSearch(e.args);
        }

        /**
         * 更新每页显示条数
         *
         * @param {Object} 事件对象
         */
        function updatePageSize(e) {
            // 先请求后端更新每页显示条数，然后直接刷新当前页
            // TODO 仔细思考下怎么和List那边复用，这样太丑陋了……
            this.model.updatePageSize(e.pageSize)
                .then(u.bind(this.reload, this));
        }

        /**
         * 初始化交互行为
         *
         * @override
         */
        ReportAction.prototype.initBehavior = function () {
            BaseAction.prototype.initBehavior.apply(this, arguments);
            this.view.on('search', search, this);
            this.view.on('pagesizechange', updatePageSize, this);
            this.view.on('refreshchart', refreshChart, this);
            this.view.on(
                'refreshtable', 
                this.model.refreshTableData, 
                this.model
            );
        };

        /**
         * 刷新第一张图表
         *
         * @param {Object} 事件对象
         */
        function refreshChart(e) {
            var leftKey = e.leftKey;
            var rightKey = e.rightKey;
            this.model.refreshChartData(leftKey, rightKey);
        }

        return ReportAction;
    }
);
