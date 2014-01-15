/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 帐户设置Action
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var BaseAction = require('common/BaseAction');
        var util = require('er/util');
        var u = require('underscore');

        // 预加载依赖模块
        require('./BindUnion');
        require('./ModifyMail');
        require('./ModifyName');
        require('./ModifyPassword');

        /**
         * 频道表单
         *
         * @constructor
         * @extends common/BaseAction
         */
        function SettingRead() {
            BaseAction.apply(this, arguments);
        }

        util.inherits(SettingRead, BaseAction);

        /**
         * 当前Action的分组名称
         *
         * @type {string}
         * @override
         */
        SettingRead.prototype.group = 'setting';

        /**
         * 视图类型
         *
         * @type {function}
         * @override
         */
        SettingRead.prototype.viewType = require('./ReadView');

        /**
         * 数据模型类型
         *
         * @type {function}
         * @override
         */
        SettingRead.prototype.modelType = require('./ReadModel');

        /**
         * 更新单个字段
         *
         * @param {Object} e View发出的事件对象
         */
        function updateProperty(e) {
            var updateView = 
                u.bind(this.view.updateField, this.view, e.id, e.name);

            this.model.load().then(updateView);
        }

        /**
         * 初始化交互行为
         *
         * @override
         */
        SettingRead.prototype.initBehavior = function () {
            BaseAction.prototype.initBehavior.apply(this, arguments);

            this.view.on('propertyupdate', u.bind(updateProperty, this));
        };

        return SettingRead;
    }
);