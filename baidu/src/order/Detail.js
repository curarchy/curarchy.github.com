/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 订单详情页
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var util = require('er/util');
        var OrderTreeDetailAction = require('common/biz/OrderTreeDetailAction');
        var config = require('./config');

        /**
         * 订单详情页Action
         *
         * @constructor
         * @extends {common/OrderTreeDetailAction}
         */
        function OrderDetail() {
            OrderTreeDetailAction.apply(this, arguments);
        }

        util.inherits(OrderDetail, OrderTreeDetailAction);

        /**
         * 当前Action的分组名称
         *
         * @type {string}
         * @override
         */
        OrderDetail.prototype.group = 'order';

        /**
         * 当前Action负责的实体的描述名称
         *
         * @type {string}
         * @override
         */
        OrderDetail.prototype.entityDescription = config.description;

        /**
         * 视图类型
         *
         * @type {function}
         * @override
         */
        OrderDetail.prototype.viewType = require('./DetailView');

        /**
         * 数据模型类型
         *
         * @type {function}
         * @override
         */
        OrderDetail.prototype.modelType = require('./DetailModel');

        return OrderDetail;
    }
);        
