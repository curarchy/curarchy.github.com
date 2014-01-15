/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 公司列表Action
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
        function CompanyList() {
            ListAction.apply(this, arguments);
        }

        util.inherits(CompanyList, ListAction);

        /**
         * 当前Action的分组名称
         *
         * @type {string}
         * @override
         */
        CompanyList.prototype.group = 'setting';

        /**
         * 当前Action负责的实体的描述名称
         *
         * @type {string}
         * @override
         */
        CompanyList.prototype.entityDescription = config.description;

        /**
         * 视图类型
         *
         * @type {function}
         * @override
         */
        CompanyList.prototype.viewType = require('./ListView');

        /**
         * 数据模型类型
         *
         * @type {function}
         * @override
         */
        CompanyList.prototype.modelType = require('./ListModel');

        /**
         * 默认查询参数
         *
         * @param {Object}
         * @override
         */
        CompanyList.prototype.defaultArgs = {
            order: 'desc',
            orderBy: 'companyId'
        };
        
        /** 
         * 进入创建公司页面的句柄
         */
        function createCompany(args) {    
            this.redirect(args.url);
        }

         /**
         * 初始化交互行为
         *
         * @override
         */
        CompanyList.prototype.initBehavior = function () {
            ListAction.prototype.initBehavior.apply(this, arguments);
            this.view.on('createCompany', u.bind(createCompany, this));
        };
        return CompanyList;
    }
);
