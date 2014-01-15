/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 频道列表表单视图类
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var FormView = require('common/FormView');
        var util = require('er/util');
        var u = require('underscore');
        
        require('tpl!../channel/tpl/common.tpl.html');
        require('tpl!./tpl/form.tpl.html');

        /**
         * 频道列表表单视图类
         *
         * @constructor
         * @extends common/FormView
         */
        function ChannelGroupFormView() {
            FormView.apply(this, arguments);
        }

        util.inherits(ChannelGroupFormView, FormView);

        /**
         * 使用的模板名称
         *
         * @type {string}
         */
        ChannelGroupFormView.prototype.template = 'channelGroupForm';

        /** 
         * 展开或收起频道选择控件
         */
        function toggleChannelsSelector() {
            var channelCheck = this.get('has-channels');

            var channelListWrapper = this.get('channel-list-wrapper');
            var channelsSelector = this.get('channels');
            if (channelCheck.isChecked()) {
                this.fire('requestchannels');
                channelListWrapper.show();
                channelsSelector.enable();
            }
            else {
                channelListWrapper.hide();
                channelsSelector.disable();
            }
        }

        ChannelGroupFormView.prototype.checkChannels = function () {
            var channelCheck = this.get('has-channels');
            channelCheck.setChecked(true);
        };


        /**
         * 渲染
         *
         * @override
         */
        ChannelGroupFormView.prototype.enterDocument = function () {
            FormView.prototype.enterDocument.apply(this, arguments);
            var model = this.model;
            var channelIds = model.get('channelIds');
            if (channelIds && channelIds.length) {
                this.checkChannels();
            }
            else {
                var channelsSelector = this.get('channels');
                channelsSelector.disable();
            }
        };

        ChannelGroupFormView.prototype.uiEvents = {
            'has-channels:change': toggleChannelsSelector
        };

        /**
         * 刷新频道控件
         * @public
         */
        ChannelGroupFormView.prototype.refreshChannels = function () {
            var channelList = this.get('channels');
            channelList.set(
                'datasource', this.model.get('channels')
            );
        };

        /**
         * 获取当前页面完整的数据
         * 包括选择的频道数据
         * @public
         */
        ChannelGroupFormView.prototype.getEntity = function () {
            var formData = FormView.prototype.getEntity.apply(this);
            var channelCheck = this.get('has-channels');
            formData.channelIds = '';
            if (channelCheck.isChecked()) {
                var channelList = this.get('channels');
                var selectedItems = channelList.getSelectedItems();
                if (selectedItems) {
                    var channelIds = u.pluck(selectedItems, 'id');
                    formData.channelIds = channelIds.join(',');
                }
            }
            return formData;
        };

        return ChannelGroupFormView;
    }
);