/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 频道详情页视图
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var DetailView = require('common/DetailView');
        var util = require('er/util');
        var u = require('underscore');

        require('tpl!common/biz/tpl/channelGroupTreeDetail.tpl.html');

        /**
         * 频道详情页视图
         *
         * @constructor
         * @extends common/DetailView
         */
        function ChannelGroupTreeDetailView() {
            DetailView.apply(this, arguments);
        }

        util.inherits(ChannelGroupTreeDetailView, DetailView);

        function addChannel (e) {
            if (e.name !== 'add') {
                return;
            }

            var fireEvent = u.delegate(this.fire, this, 'channelsave');
            var options = {
                url: '/createChannelAndGroup', 
                title: '新建频道'
            };
            this.waitActionDialog(options)
                .then(
                    function (e) {
                        var action = e.target.get('action');
                        action.on('entitysave', fireEvent);
                    }
                );
        }

        ChannelGroupTreeDetailView.prototype.bindEvents = function () {
            DetailView.prototype.bindEvents.apply(this, arguments);

            var tree = this.get('tree');
            if (tree) {
                tree.on('runwidget', u.bind(addChannel, this));
            }
        };

        return ChannelGroupTreeDetailView;
    }
);        
