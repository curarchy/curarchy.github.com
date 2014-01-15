/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 批量修改尺寸视图类
 * @author wangyaqiong(catkin2009@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var FormView = require('common/FormView');
        var util = require('er/util');

        require('tpl!./tpl/slotBatchSizeForm.tpl.html');

        /**
         * 日志表单视图类
         *
         * @constructor
         * @extends common/FormView
         */
        function SlotBatchSizeFormView() {
            FormView.apply(this, arguments);
        }

        util.inherits(SlotBatchSizeFormView, FormView);

        /** 
         * 使用的模板名称
         *
         * @type {string}
         */
        SlotBatchSizeFormView.prototype.template = 'slotBatchSizeForm';

        /**
         * 从表单中获取实体数据
         *
         * @return {Object}
         */
        SlotBatchSizeFormView.prototype.getEntity = function () {
            var entity = FormView.prototype.getEntity.apply(this, arguments);
            if (entity.slotSize) {
                var selectorSlotSize = entity.slotSize.name;
                var slotSizeMap = selectorSlotSize.split('*');
                entity.width = slotSizeMap[0];
                entity.height = slotSizeMap[1];
                delete entity.slotSize;
            }
            
            return entity;
        };

        /**
         * 控件额外属性配置
         *
         * @type {Object}
         * @override
         */
        SlotBatchSizeFormView.prototype.uiProperties = {
            // TODO: 添加控件的额外属性配置，如没有则删除该属性
        };

        /**
         * 切换尺寸类型
         *
         * @param {Object} e 事件
         */
        function switchSizeType (e) {
            var target = e.target;
            var commonSizeWrapper = this.get('commonsize-wrapper');
            var defineSizeWrapper = this.get('definesize-wrapper');
            var slotSize = this.get('slotSize');
            var width = this.get('width');
            var height = this.get('height');
            if (target.id == 'switch-define-Size') {
                commonSizeWrapper.hide();
                defineSizeWrapper.show();
                width.enable();
                height.enable();
                slotSize.disable();
                target.hide();
                this.get('switch-common-Size').show();
            }
            else {
                commonSizeWrapper.show();
                defineSizeWrapper.hide();
                slotSize.enable();
                width.disable();
                height.disable();
                target.hide();
                this.get('switch-define-Size').show();
            }
        }

        /**
         * 控件事件配置
         *
         * @type {Object}
         * @override
         */
        SlotBatchSizeFormView.prototype.uiEvents = {
            'switch-define-Size:click': switchSizeType,
            'switch-common-Size:click': switchSizeType
        };
        
        return SlotBatchSizeFormView;
    }
);