/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 通用错误页Action
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var BaseAction = require('common/BaseAction');
        var Model = require('er/Model');
        var u = require('underscore');

        /**
         * 未知错误页Action
         *
         * @constructor
         * @extends common/BaseAction
         */
        function ErrorAction() {
            BaseAction.apply(this, arguments);
        }

        require('er/util').inherits(ErrorAction, BaseAction);
        
        /**
         * 创建数据模型
         *
         * @return {er/Model}
         */
        ErrorAction.prototype.createModel = function () {
            var model = new Model();
            model.set('indexURL', require('er/config').indexURL);
            return model;
        };

        /**
         * 初始化行为
         *
         * @overrides
         */
        ErrorAction.prototype.initBehavior = function () {
            this.view.on('reload', u.bind(this.reload, this));
        };

        return ErrorAction;
    }
);