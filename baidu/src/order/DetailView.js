/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 订单详情页视图
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var OrderTreeDetailView = require('common/biz/OrderTreeDetailView');
        var util = require('er/util');

        require('tpl!./tpl/detail.tpl.html');

        /**
         * 订单详情页视图
         *
         * @constructor
         * @extends common/biz/OrderTreeDetailView
         */
        function OrderDetailView() {
            OrderTreeDetailView.apply(this, arguments);
        }

        util.inherits(OrderDetailView, OrderTreeDetailView);

        /**
         * 模板名
         *
         * @type {string}
         * @override
         */
        OrderDetailView.prototype.template = 'orderDetail';
        
        return OrderDetailView;
    }
);        
