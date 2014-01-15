/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 内联创建频道/频道分组表单Action
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var BaseAction = require('common/BaseAction');
        var util = require('er/util');
        var u = require('underscore');

        /**
         * 内联创建频道/频道分组表单
         *
         * @constructor
         * @extends common.Action
         */
        function CreateChannelAndGroup() {
            BaseAction.apply(this, arguments);
        }

        util.inherits(CreateChannelAndGroup, BaseAction);

        /**
         * 当前Action的分组名称
         *
         * @type {string}
         * @override
         */
        CreateChannelAndGroup.prototype.group = 'order';

        /**
         * 视图类型
         *
         * @type {function}
         * @override
         */
        CreateChannelAndGroup.prototype.viewType = 
            require('./CreateChannelAndGroupView');

        /**
         * 初始化交互行为
         *
         * @protected
         * @override
         */
        CreateChannelAndGroup.prototype.initBehavior = function () {
            this.view.on('save', u.delegate(this.fire, this, 'entitysave'));
            this.view.on('save', u.delegate(this.fire, this, 'handlefinish'));
            this.view.on('cancel', u.delegate(this.fire, this, 'handlefinish'));
        };

        return CreateChannelAndGroup;
    }
);