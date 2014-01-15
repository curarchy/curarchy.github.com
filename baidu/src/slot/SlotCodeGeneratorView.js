/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 获取代码视图类
 * @author lixiang(lixiang05@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var UIView = require('ef/UIView');
        var util = require('er/util');
        require('tpl!./tpl/slotCodeGenerator.tpl.html');

        /**
         * 获取代码视图类
         *
         * @constructor
         * @extends ef/UIView
         */
        function SlotCodeGeneratorView() {
            UIView.apply(this, arguments);
        }

        util.inherits(SlotCodeGeneratorView, UIView);

        /** 
         * 使用的模板名称
         *
         * @type {string}
         */
        SlotCodeGeneratorView.prototype.template = 'slotsCodeGenerator';


        /**
         * 控件事件配置
         *
         * @type {Object}
         * @override
         */
        SlotCodeGeneratorView.prototype.uiEvents = {
            'cancel:click': cancel
        };

        /**
         * 取消
         *
         * @inner
         */
        function cancel() {
            this.fire('cancel');
        }


        return SlotCodeGeneratorView;
    }
);
