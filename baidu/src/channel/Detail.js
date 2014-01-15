/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 频道详情页
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var util = require('er/util');
        var ChannelGroupTreeDetailAction = 
            require('common/biz/ChannelGroupTreeDetailAction');
        var config = require('./config');

        // 依赖模块预加载
        require('../common/biz/CreateChannelAndGroup');

        /**
         * 频道详情页Action
         */
        function ChannelDetail() {
            ChannelGroupTreeDetailAction.apply(this, arguments);
        }

        util.inherits(ChannelDetail, ChannelGroupTreeDetailAction);

        /**
         * 当前Action的分组名称
         *
         * @type {string}
         * @override
         */
        ChannelDetail.prototype.group = 'slot';

        /**
         * 当前Action负责的实体的描述名称
         *
         * @type {string}
         * @override
         */
        ChannelDetail.prototype.entityDescription = config.description;

        /**
         * 视图类型
         *
         * @type {function}
         * @override
         */
        ChannelDetail.prototype.viewType = require('./DetailView');

        /**
         * 数据模型类型
         *
         * @type {function}
         * @override
         */
        ChannelDetail.prototype.modelType = require('./DetailModel');

        return ChannelDetail;
    }
);        
