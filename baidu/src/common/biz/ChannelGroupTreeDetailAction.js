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
        var DetailAction = require('common/DetailAction');
        var u = require('underscore');

        /**
         * 频道详情页Action
         */
        function ChannelGroupTreeDetailAction() {
            DetailAction.apply(this, arguments);
        }

        util.inherits(ChannelGroupTreeDetailAction, DetailAction);

        ChannelGroupTreeDetailAction.prototype.initBehavior = function () {
            DetailAction.prototype.initBehavior.apply(this, arguments);

            // TODO: 能不能不reload
            this.view.on('channelsave', u.bind(this.reload, this));
        };

        return ChannelGroupTreeDetailAction;
    }
);        
