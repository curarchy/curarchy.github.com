/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 频道只读视图类
 * @author lixiang(lixiang05@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var ReadView = require('common/ReadView');
        var util = require('er/util');
        
        require('tpl!./tpl/common.tpl.html');
        require('tpl!./tpl/read.tpl.html');

        /**
         * 频道表单视图类
         *
         * @constructor
         * @extends common/ReadView
         */
        function ChannelReadView() {
            ReadView.apply(this, arguments);
        }

        util.inherits(ChannelReadView, ReadView);


        /** 
         * 使用的模板名称
         *
         * @type {string}
         */
        ChannelReadView.prototype.template = 'channelRead';
        
        return ChannelReadView;
    }
);
