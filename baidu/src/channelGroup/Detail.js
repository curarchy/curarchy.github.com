/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 频道分组详情页
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var util = require('er/util');
        var ChannelGroupTreeDetailAction = 
            require('common/biz/ChannelGroupTreeDetailAction');
        var config = require('./config');

        /**
         * 频道详情页Action
         */
        function ChannelGroupDetail() {
            ChannelGroupTreeDetailAction.apply(this, arguments);
        }

        util.inherits(ChannelGroupDetail, ChannelGroupTreeDetailAction);

        /**
         * 当前Action的分组名称
         *
         * @type {string}
         * @override
         */
        ChannelGroupDetail.prototype.group = 'slot';

        /**
         * 当前Action负责的实体的描述名称
         *
         * @type {string}
         * @override
         */
        ChannelGroupDetail.prototype.entityDescription = config.description;

        /**
         * 视图类型
         *
         * @type {function}
         * @override
         */
        ChannelGroupDetail.prototype.viewType = require('./DetailView');

        /**
         * 数据模型类型
         *
         * @type {function}
         * @override
         */
        ChannelGroupDetail.prototype.modelType = require('./DetailModel');

        return ChannelGroupDetail;
    }
);        
