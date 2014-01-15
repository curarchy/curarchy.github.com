/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 只读页Action基类
 * @author lixiang(lixiang05@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var util = require('er/util');
        var BaseAction = require('common/BaseAction');
        var u = require('underscore');

        /**
         * 频道列表
         *
         * @param {string=} entityName 负责的实体名称
         * @constructor
         * @extends common/BaseAction
         */
        function ReadAction(entityName) {
            this.entityName = entityName;
            BaseAction.apply(this, arguments);
        }

        util.inherits(ReadAction, BaseAction);

        function returnBack() {
            var referrer = this.context.referrer;
            // 默认回列表页
            if (!referrer) {
                referrer = '/' + this.getEntityName() + '/list';
            }

            this.redirect(referrer);
        }

        /**
         * 进入一个模块后，如果有其它模块带过来的提示信息，显示一下
         *
         * @override
         * @protected
         */
        ReadAction.prototype.initBehavior = function () {
            this.view.on(
                'return',
                u.bind(returnBack, this)
            );
        };

        return ReadAction;
    }
);
