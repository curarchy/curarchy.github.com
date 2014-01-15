/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 广告详情页视图
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var OrderTreeDetailView = require('common/biz/OrderTreeDetailView');
        var util = require('er/util');

        require('tpl!./tpl/detail.tpl.html');

        /**
         * 广告详情页视图
         *
         * @constructor
         * @extends common/biz/OrderTreeDetailView
         */
        function DeliveryDetailView() {
            OrderTreeDetailView.apply(this, arguments);
        }

        util.inherits(DeliveryDetailView, OrderTreeDetailView);

        /**
         * 模板名
         *
         * @type {string}
         * @override
         */
        DeliveryDetailView.prototype.template = 'deliveryDetail';
        
        return DeliveryDetailView;
    }
);        
