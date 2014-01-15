/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 内联创建频道/频道分组表单视图类
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var UIView = require('ef/UIView');
        var util = require('er/util');
        var u = require('underscore');

        require('tpl!./tpl/createChannelAndGroup.tpl.html');

        /**
         * 内联创建频道/频道分组表单视图类
         *
         * @constructor
         * @extends ef/UIView
         */
        function CreateChannelAndGroupView() {
            UIView.apply(this, arguments);
        }

        util.inherits(CreateChannelAndGroupView, UIView);

        /** 
         * 使用的模板名称
         *
         * @type {string}
         */
        CreateChannelAndGroupView.prototype.template = 
            'inlineCreateChannelAndGroup';

        /**
         * 初始化表单相关行为
         *
         * @param {Object} e 事件对象
         */
        function initFormBehavior(e) {
            var action = e.target.get('action');
            action.on('entitysave', u.delegate(this.fire, this, 'save'));
            action.on('submitcancel', u.delegate(this.fire, this, 'cancel'));
        }

        /**
         * 控件事件配置
         *
         * @type {Object}
         * @override
         */
        CreateChannelAndGroupView.prototype.uiEvents = {
            'type:change': function (e) {
                var type = e.target.getValue();
                this.getGroup('form').hide();
                this.get(type + '-form').show();
            },

            'channel-form:actionloaded': initFormBehavior,

            'channel-group-form:actionloaded': initFormBehavior
        };
        
        return CreateChannelAndGroupView;
    }
);
