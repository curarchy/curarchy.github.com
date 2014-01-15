/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 频道表单视图类
 * @author zhanglili(otakustay@gmail.com), wangyaqiong(wangyaqiong@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var FormView = require('common/FormView');
        var util = require('er/util');

        require('tpl!./tpl/form.tpl.html');
        require('tpl!./tpl/common.tpl.html');

        /**
         * 频道表单视图类
         *
         * @constructor
         * @extends common/FormView
         */
        function ChannelFormView() {
            FormView.apply(this, arguments);
        }

        util.inherits(ChannelFormView, FormView);

        /** 
         * 展开或收起频道组选择控件
         *
         */
        function toggleChannelGroupSelector() {
            var channelCheck = this.get('has-channel-group');
            var channelGroupsWrapper = this.get('channel-groups-wrapper');
            var channelGroupSelector = this.get('channel-groups');
            if (channelCheck.isChecked()) {
                this.fire('requestchannelgroups');
                channelGroupsWrapper.show();
                channelGroupSelector.addState('expand'); 
                channelGroupSelector.enable();
            }
            else {
                channelGroupsWrapper.hide();
                channelGroupSelector.removeState('expand'); 
                channelGroupSelector.disable();
            }
        }

        /** 
         * 使用的模板名称
         *
         * @type {string}
         */
        ChannelFormView.prototype.template = 'channelForm';

        ChannelFormView.prototype.uiEvents = {
            'has-channel-group:change': toggleChannelGroupSelector
        };


        /**
         * 刷新频道组控件
         *
         * @public
         */
        ChannelFormView.prototype.refreshChannelGroups = function () {
            var channelGroupList = this.get('channel-groups');
            channelGroupList.set(
                'datasource', this.model.get('channelGroups')
            );
        };

        ChannelFormView.prototype.checkChannelGroup = function () {
            var channelCheck = this.get('has-channel-group');
            channelCheck.setChecked(true);
        };

        /**
         * 渲染
         *
         * @override
         */
        ChannelFormView.prototype.enterDocument = function () {
            FormView.prototype.enterDocument.apply(this, arguments);
            var model = this.model;
            if (model.get('channelGroupId')) {
                this.checkChannelGroup();
            }
        };

        /**
         * 获取当前页面完整的数据
         * 包括选择的频道分组数据
         * @public
         */
        ChannelFormView.prototype.getEntity = function () {
            var formData = FormView.prototype.getEntity.apply(this);
            var channelCheck = this.get('has-channel-group');
            if (channelCheck.isChecked()) {
                if (formData.channelGroupId) {
                    formData.channelGroupId = formData.channelGroupId.id;
                }
            }
            else {
                formData.channelGroupId = null;
            }
            return formData;
        };
        
        return ChannelFormView;
    }
);
