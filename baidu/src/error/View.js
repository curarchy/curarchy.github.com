/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 错误页通用视图类
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var UIView = require('ef/UIView');
        var util = require('er/util');

        /**
         * 列表视图基类
         *
         * @constructor
         * @extends ef/UIView
         */
        function ErrorView() {
            UIView.apply(this, arguments);
        }

        /**
         * 控件事件配置
         *
         * @type {Object}
         * @overrides
         */
        ErrorView.prototype.uiEvents = {
            'reload:click': function () {
                this.fire('reload');
            }
        };

        util.inherits(ErrorView, UIView);
        return ErrorView;
    }
);