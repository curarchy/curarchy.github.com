/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 左侧有客户-订单树的视图基类
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var DetailView = require('common/DetailView');
        var util = require('er/util');

        require('tpl!common/biz/tpl/orderTreeDetail.tpl.html');

        /**
         * 频道详情页视图
         *
         * @constructor
         * @extends common/DetailView
         */
        function OrderTreeDetailView() {
            DetailView.apply(this, arguments);
        }

        util.inherits(OrderTreeDetailView, DetailView);

        return OrderTreeDetailView;
    }
);        
