/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 广告位表单Action
 * @author liyidong(undefined)
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
        function SlotForm() {
            FormAction.apply(this, arguments);
        }

        util.inherits(SlotForm, FormAction);

        /**
         * 当前Action的分组名称
         *
         * @type {string}
         * @override
         */
        SlotForm.prototype.group = 'slot';

        /**
         * 当前Action负责的实体的描述名称
         *
         * @type {string}
         * @override
         */
        SlotForm.prototype.entityDescription = config.description;

        /**
         * 视图类型
         *
         * @type {function}
         * @override
         */
        SlotForm.prototype.viewType = require('./FormView');

        /**
         * 数据模型类型
         *
         * @type {function}
         * @override
         */
        SlotForm.prototype.modelType = require('./FormModel');

        /** 
         * 刷新频道数据事件的句柄
         */
        function reloadChannel(args) {
            var model = this.model;
            var view = this.view;
            var newChannel = args.channel;
            var channels = model.get('channels');

            // 按照默认频道在最前，新插入位于默认频道后，再老数据的顺序构建
            // u.union自带clone对象的功能，而用其它方法如push，splice方法
            // 因为引用不会变，给View的时候就没有更新效果，要再clone一把
            channels = u.union(channels.shift(), newChannel, channels);
            model.set('channels', channels);
            view.refreshChannel(newChannel);
        }

        /** 
         * 刷新Union数据事件的句柄
         */
        function reloadUnion(args) {
            var model = this.model;
            var view = this.view;

            model.loadUnion()
                .then(u.bind(view.refreshUnion, view));
        }
        /**
         * 临时保存实体，用于回来后恢复
         */
        function saveEntity() {
            var entity = this.view.getRawEntity();

            this.model.saveEntityState(entity);
        }

        /**
         * 初始化交互行为
         *
         * @override
         */
        SlotForm.prototype.initBehavior = function () {
            FormAction.prototype.initBehavior.apply(this, arguments);
            this.view.on('reloadchannel', u.bind(reloadChannel, this));
            this.view.on('reloadunion', u.bind(reloadUnion, this));
            this.view.on('jumptocprosetting', u.bind(saveEntity, this));
        };

        /**
         * 提交后的跳转
         */
        SlotForm.prototype.redirectAfterSubmit = function () {    
            var listPath = '/' + this.getEntityName() + '/all';
            this.redirect(listPath);
        };

        return SlotForm;
    }
);