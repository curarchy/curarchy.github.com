/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 广告详情页
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var util = require('er/util');
        var OrderTreeDetailAction = require('common/biz/OrderTreeDetailAction');
        var config = require('./config');

        /**
         * 广告详情页Action
         *
         * @constructor
         * @extends {common/OrderTreeDetailAction}
         */
        function DeliveryDetail() {
            OrderTreeDetailAction.apply(this, arguments);
        }

        util.inherits(DeliveryDetail, OrderTreeDetailAction);

        /**
         * 当前Action的分组名称
         *
         * @type {string}
         * @override
         */
        DeliveryDetail.prototype.group = 'order';

        /**
         * 当前Action负责的实体的描述名称
         *
         * @type {string}
         * @override
         */
        DeliveryDetail.prototype.entityDescription = config.description;

        /**
         * 视图类型
         *
         * @type {function}
         * @override
         */
        DeliveryDetail.prototype.viewType = require('./DetailView');

        /**
         * 数据模型类型
         *
         * @type {function}
         * @override
         */
        DeliveryDetail.prototype.modelType = require('./DetailModel');

        return DeliveryDetail;
    }
);        
