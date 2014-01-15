/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 批量修改显示顺序表单视图类
 * @author wangyaqiong(catkin2009@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var FormView = require('common/FormView');
        var util = require('er/util');

        require('tpl!./tpl/slotBatchOrderForm.tpl.html');

        /**
         * 日志表单视图类
         *
         * @constructor
         * @extends common/FormView
         */
        function SlotBatchOrderFormView() {
            FormView.apply(this, arguments);
        }

        util.inherits(SlotBatchOrderFormView, FormView);

        /** 
         * 使用的模板名称
         *
         * @type {string}
         */
        SlotBatchOrderFormView.prototype.template = 'slotBatchOrderForm';

        /**
         * 从表单中获取实体数据
         *
         * @return {Object}
         */
        SlotBatchOrderFormView.prototype.getEntity = function () {
            var entity = FormView.prototype.getEntity.apply(this, arguments);
            // TODO: 如果实体有在表单中未包含的额外属性，在此处添加，没有则删除该方法

            return entity;
        };

        /**
         * 控件额外属性配置
         *
         * @type {Object}
         * @override
         */
        SlotBatchOrderFormView.prototype.uiProperties = {
            // TODO: 添加控件的额外属性配置，如没有则删除该属性
        };

        /**
         * 控件事件配置
         *
         * @type {Object}
         * @override
         */
        SlotBatchOrderFormView.prototype.uiEvents = {
            // TODO: 添加控件的事件配置，如没有则删除该属性
        };
        
        return SlotBatchOrderFormView;
    }
);