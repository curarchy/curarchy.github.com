/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 批量修改频道表单视图类
 * @author wangyaqiong(catkin2009@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var FormView = require('common/FormView');
        var util = require('er/util');

        require('tpl!./tpl/slotBatchChannelForm.tpl.html');

        /**
         * 日志表单视图类
         *
         * @constructor
         * @extends common/FormView
         */
        function SlotBatchChannelFormView() {
            FormView.apply(this, arguments);
        }

        util.inherits(SlotBatchChannelFormView, FormView);

        /** 
         * 使用的模板名称
         *
         * @type {string}
         */
        SlotBatchChannelFormView.prototype.template = 'slotBatchChannelForm';

        /**
         * 从表单中获取实体数据
         *
         * @return {Object}
         */
        SlotBatchChannelFormView.prototype.getEntity = function () {
            var entity = FormView.prototype.getEntity.apply(this, arguments);
            if (entity.channel) {
                entity.channelId = entity.channel.id;
            }
            else {
                entity.channelId = undefined;
            }
            delete entity.channel;
            return entity;
        };

        /**
         * 控件额外属性配置
         *
         * @type {Object}
         * @override
         */
        SlotBatchChannelFormView.prototype.uiProperties = {
            // TODO: 添加控件的额外属性配置，如没有则删除该属性
        };

        /**
         * 控件事件配置
         *
         * @type {Object}
         * @override
         */
        SlotBatchChannelFormView.prototype.uiEvents = {
            // TODO: 添加控件的事件配置，如没有则删除该属性
        };
        
        return SlotBatchChannelFormView;
    }
);