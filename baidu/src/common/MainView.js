/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file TODO: 添加文件说明
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var BaseView = require('./BaseView');
        var util = require('er/util');

        /**
         * 主视图类。主视图类是个特殊的东西，这货和模板无关，只为关联一个`ViewContext`
         *
         * @constructor
         * @extends common/BaseView
         */
        function MainView() {
            BaseView.apply(this, arguments);

            this.container = document.body;
        }

        util.inherits(MainView, BaseView);

        MainView.prototype.createViewContext = function () {
            return require('esui').getViewContext();
        };

        MainView.prototype.render = function () {
            // 直接跳过模板部分
            this.enterDocument();
        };

        return MainView;
    }
);        
