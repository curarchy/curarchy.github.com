/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 只读视图基类
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var BaseView = require('common/BaseView');
        var util = require('er/util');
        var u = require('underscore');

        /**
         * 列表视图基类
         *
         * @constructor
         * @extends common/BaseView
         */
        function ReadView() {
            BaseView.apply(this, arguments);
        }

        util.inherits(ReadView, BaseView);

        ReadView.prototype.bindEvents = function () {
            BaseView.prototype.bindEvents.apply(this, arguments);

            var returnButton = this.get('return');
            if (returnButton) {
                returnButton.on(
                    'click', 
                    u.delegate(this.fire, this, 'return')
                );
            }
        };
        
        return ReadView;
    }
);