/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 频道列表表单Action
 * @author wangyaqiong(catkin2009@gmail.com)
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
        function ChannelGroupForm() {
            FormAction.apply(this, arguments);
        }

        util.inherits(ChannelGroupForm, FormAction);

        /**
         * 当前Action的分组名称
         *
         * @type {string}
         * @override
         */
        ChannelGroupForm.prototype.group = 'setting';
        
        /**
         * 当前Action负责的实体的描述名称
         *
         * @type {string}
         * @override
         */
        ChannelGroupForm.prototype.entityDescription = config.description;

        /**
         * 视图类型
         *
         * @type {function}
         * @override
         */
        ChannelGroupForm.prototype.viewType = require('./FormView');

        /**
         * 数据模型类型
         *
         * @type {function}
         * @override
         */
        ChannelGroupForm.prototype.modelType = require('./FormModel');

        /**
         * 初始化交互行为
         *
         * @override
         */
        ChannelGroupForm.prototype.initBehavior = function () {
            FormAction.prototype.initBehavior.apply(this, arguments);
            this.view.on('requestchannels', u.bind(loadChannels, this));
        };

        /**
         * 加载频道数据
         * 移到频道组
         */
        function loadChannels() {
            var model = this.model;
            var view = this.view;

            if (model.get('channels')) {
                view.refreshChannels();
                return;
            }

            // 加载数据
            model.loadChannels()
                .then(
                    function (data) {
                        model.set('channels', data);
                        view.refreshChannels();
                    }
                );
        }

        return ChannelGroupForm;
    }
);