/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 投放量表单区域视图
 * @author liyidong(srhb18@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var UIView = require('ef/UIView');
        var util = require('er/util');
        var u = require('underscore');

        require('tpl!./tpl/amountField.tpl.html');

        /**
         * 投放量表单区域视图
         *
         * @constructor
         * @extends ef/UIView
         */
        function AmountFieldView() {
            UIView.apply(this, arguments);
        }

        util.inherits(AmountFieldView, UIView);

        /**
         * 模板目标名称
         *
         * @type {string}
         * @override
         */
        AmountFieldView.prototype.template = 'amountField';


        /**
         * 获取实体
         *
         * @return {Object}
         */
        AmountFieldView.prototype.getEntity = function () {
            var entity = {};

            var slots = u.clone(this.model.get('slots'));

            for (var i = 0; i < slots.length; i++) {
                var current = this.get('amount-input-' + slots[i].id); 
                // 无论平均分配还是自定义，都要写total字段
                if (slots[i].amount) {
                    slots[i].amount.total = parseInt(current.getRawValue(), 10);
                }
            }

            entity.slots = slots;

            return entity;
        };

        /**
         * 控件事件配置
         *
         * @type {Object}
         * @override
         */
        AmountFieldView.prototype.uiEvents = {
            // TODO: 未来增加平均、自定义切换事件
        };

        /**
         * 绑定控件事件
         *
         * @override
         */
        AmountFieldView.prototype.bindEvents = function () {
            UIView.prototype.bindEvents.apply(this, arguments);

            // 绑定各个输入框控件的input事件
            var slots = this.model.get('slots');
            for (var i = 0; i < slots.length; i++) {
                var current = this.get('amount-input-' + slots[i].id); 
                current.on('input', u.bind(updateTotal, this));
            }
        };

        /**
         * 更新总计投放量
         *
         * @private
         */
        function updateTotal() {
            var total = 0;
            var slots = this.model.get('slots');
            for (var i = 0; i < slots.length; i++) {
                var current = this.get('amount-input-' + slots[i].id); 
                if (current.getRawValue()) {
                    total = total + parseInt(current.getRawValue(), 10);
                }
            }

            this.get('total-amount-number').setText(total.toString());
        }

        /**
         * 根据售卖方式切换每日投放行的状态（显示/隐藏）
         *
         * @param {String} priceModel 售卖方式：CPC/CPM
         */
        function toggleAmountModel(priceModel) {
            var priceModel = this.model.get('priceModel');

            var current = this.getGroup('amount-model-panel');
            // 如果是CPM模式
            if (priceModel === '1') {
                current.show();
            }
            // 如果是CPC模式
            if (priceModel === '2') {
                current.hide();
            }
        } 

        /**
         * 文档准备完毕时调用
         *
         * @override
         */
        AmountFieldView.prototype.enterDocument = function () {
            UIView.prototype.enterDocument.apply(this, arguments);

            var model = this.model;

            var slots = model.get('slots');

            toggleAmountModel.call(this);

            for (var i = 0; i < slots.length; i++) {
                var current = this.get('amount-input-' + slots[i].id);
                if (slots[i].amount && slots[i].amount.total) {
                    current.setValue(slots[i].amount.total);
                }
            }
            updateTotal.call(this);
        };

        return AmountFieldView;
    }
);        
