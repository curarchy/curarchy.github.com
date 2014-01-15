/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 频道分组详情页视图
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var ChannelGroupTreeDetailView =
            require('common/biz/ChannelGroupTreeDetailView');
        var util = require('er/util');

        require('tpl!./tpl/detail.tpl.html');

        /**
         * 频道详情页视图
         *
         * @constructor
         * @extends common/biz/ChannelGroupTreeDetailView
         */
        function ChannelDetailView() {
            ChannelGroupTreeDetailView.apply(this, arguments);
        }

        util.inherits(ChannelDetailView, ChannelGroupTreeDetailView);

        /**
         * 模板名
         *
         * @type {string}
         * @override
         */
        ChannelDetailView.prototype.template = 'channelDetail';
        
        return ChannelDetailView;
    }
);        
