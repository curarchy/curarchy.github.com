/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file Action基类
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var util = require('er/util');
        var u = require('underscore');
        var Action = require('er/Action');

        /**
         * Action基类
         *
         * @param {string=} entityName 负责的实体名称
         * @constructor
         * @extends er/Action
         */
        function BaseAction(entityName) {
            Action.apply(this, arguments);
            this.entityName = entityName;
        }

        util.inherits(BaseAction, Action);

        /**
         * 获取负责的实体名称
         *
         * @return {string}
         */
        BaseAction.prototype.getEntityName = function () {
            if (!this.entityName) {
                // 几乎所有的URL都是`/{entityName}/list|update|create|view`结构
                var path = this.context.url.getPath();
                this.entityName = path.split('/')[1];
            }

            return this.entityName;
        };

        /**
         * 获取当前Action的实体简介名称
         *
         * @type {string}
         */
        BaseAction.prototype.entityDescription = '';

        /**
         * 获取实体的简介名称
         *
         * @return {string}
         */
        BaseAction.prototype.getEntityDescription = function () {
            return this.entityDescription || '';
        };

        /**
         * 当前Action分组名称
         *
         * @type {string}
         */
        BaseAction.prototype.group = '';

        /**
         * 获取当前Action的分组名称
         *
         * @return {string}
         */
        BaseAction.prototype.getGroup = function () {
            return this.group;
        };

        /**
         * 创建数据模型对象
         *
         * @param {Object=} args 模型的初始化数据
         * @return {common/BaseModel}
         * @override
         */
        BaseAction.prototype.createModel = function (args) {
            args.entityDescription = this.getEntityDescription();

            var model = Action.prototype.createModel.apply(this, arguments);

            // Action基类的默认返回值是一个空对象`{}`，
            // 但是普通的`Model`对象因为方法和属性全在`prototype`上，也会被判断为空
            var Model = require('er/Model');
            if (!(model instanceof Model) && u.isEmpty(model)) {
                var BaseModel = require('./BaseModel');
                var entityName = this.getEntityName();
                model = new BaseModel(entityName, args);
            }

            return model;
        };

        /**
         * 进入一个模块后，如果有其它模块带过来的提示信息，显示一下
         *
         * @override
         * @protected
         */
        BaseAction.prototype.initBehavior = function () {
            var toastMessage = this.model && this.model.get('toast');
            if (toastMessage) {
                this.view.showToast(toastMessage);
            }
        };
        
        return BaseAction;
    }
);        
