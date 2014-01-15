/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 直投订单只读视图类
 * @author exodia(dengxinxin@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var ReadView = require('common/ReadView');
        var util = require('er/util');

        require('tpl!./tpl/read.tpl.html');

        /**
         * 直投订单只读视图类
         *
         * @constructor
         * @extends common/ReadView
         */
        function DirectReadView() {
            ReadView.apply(this, arguments);
        }

        util.inherits(DirectReadView, ReadView);

        /**
         * 使用的模板名称
         *
         * @type {string}
         */
        DirectReadView.prototype.template = 'orderRead';

        return DirectReadView;
    }
);
