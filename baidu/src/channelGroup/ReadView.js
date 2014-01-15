/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 频道组只读视图类
 * @author lixiang(lixiang05@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var ReadView = require('common/ReadView');
        var util = require('er/util');

        require('tpl!../channel/tpl/common.tpl.html');
        require('tpl!./tpl/read.tpl.html');

        /**
         * 频道表单视图类
         *
         * @constructor
         * @extends common/ReadView
         */
        function ChannelGroupReadView() {
            ReadView.apply(this, arguments);
        }

        util.inherits(ChannelGroupReadView, ReadView);


        /** 
         * 使用的模板名称
         *
         * @type {string}
         */
        ChannelGroupReadView.prototype.template = 'channelGroupRead';
        
        return ChannelGroupReadView;
    }
);
