/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 频道表单Action
 * @author zhanglili(otakustay@gmail.com), wangyaqiong(wangyaqiong@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var FormAction = require('common/FormAction');
        var util = require('er/util');
        var config = require('./config');
        var u = require('underscore');

        /**
         * 频道表单
         *
         * @constructor
         * @extends common/FormAction
         */
        function ChannelForm() {
            FormAction.apply(this, arguments);
        }
        
        util.inherits(ChannelForm, FormAction);

        /**
         * 当前Action的分组名称
         *
         * @type {string}
         * @override
         */
        ChannelForm.prototype.group = 'setting';

        /**
         * 当前Action负责的实体的描述名称
         *
         * @type {string}
         * @override
         */
        ChannelForm.prototype.entityDescription = config.description;

        /**
         * 视图类型
         *
         * @type {function}
         * @override
         */
        ChannelForm.prototype.viewType = require('./FormView');

        /**
         * 数据模型类型
         *
         * @type {function}
         * @override
         */
        ChannelForm.prototype.modelType = require('./FormModel');

        /**
         * 初始化交互行为
         *
         * @override
         */
        ChannelForm.prototype.initBehavior = function () {
            FormAction.prototype.initBehavior.apply(this, arguments);
            this.view.on(
                'requestchannelgroups',
                u.bind(loadChannelGroups, this)
            );
        };

        /**
         * 加载频道组数据
         */
        function loadChannelGroups() {
            var model = this.model;
            var view = this.view;

            if (model.get('channelGroups')) {
                view.refreshChannelGroups();
            }
            else {
                // 加载数据
                var id = model.get('channelGroupId');
                var response = model.loadChannelGroups(id);
                response.then(
                    function (data) {
                        model.set('channelGroups', data);
                        view.refreshChannelGroups();
                    }
                );
            }
        }

        return ChannelForm;
    }
);