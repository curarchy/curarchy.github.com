/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 左侧有客户-订单树的详情页基类
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var util = require('er/util');
        var DetailAction = require('common/DetailAction');

        // 为扩展性而留，无内容

        /**
         * 频道详情页Action
         */
        function OrderTreeDetailAction() {
            DetailAction.apply(this, arguments);
        }

        util.inherits(OrderTreeDetailAction, DetailAction);

        return OrderTreeDetailAction;
    }
);        
