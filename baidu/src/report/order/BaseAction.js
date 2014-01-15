/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 订单报告
 * @author wangyaqiong(catkin2009@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var util = require('er/util');
        var ReportAction = require('common/ReportAction');

        /**
         * 整体报告
         *
         * @param {string=} entityName 负责的实体名称
         * @constructor
         * @extends er/Action
         */
        function BaseAction() {
            ReportAction.apply(this);
        }

        util.inherits(BaseAction, ReportAction);

        BaseAction.prototype.group = 'report';
        
        /**
         * action 对应的中文描述
         */
        BaseAction.prototype.entityDescription = '订单报告';

        return BaseAction;
    }
);
