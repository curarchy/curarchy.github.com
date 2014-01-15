/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 创意报告
 * @author lixiang(lixiang05@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var util = require('er/util');
        var ReportAction = require('common/ReportAction');

        /**
         * 创意报告
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
        BaseAction.prototype.entityDescription = '创意报告';

        return BaseAction;
    }
);
