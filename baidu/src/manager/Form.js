/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 管理员表单Action
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
        function ManagerForm() {
            FormAction.apply(this, arguments);
        }

        util.inherits(ManagerForm, FormAction);

        /**
         * 当前Action的分组名称
         *
         * @type {string}
         * @override
         */
        ManagerForm.prototype.group = 'setting';

        /**
         * 当前Action负责的实体的描述名称
         *
         * @type {string}
         * @override
         */
        ManagerForm.prototype.entityDescription = config.description;

        
        /**
         * 视图类型
         *
         * @type {function}
         * @override
         */
        ManagerForm.prototype.viewType = require('./FormView');

        /**
         * 数据模型类型
         *
         * @type {function}
         * @override
         */
        ManagerForm.prototype.modelType = require('./FormModel');

        ManagerForm.prototype.enter = function (context) {
            var subUserId = require('common/global/user').subUserInfoId;
            if (context.url.getQuery('id') === subUserId.toString()) {
                this.redirect('/403');
                var Deferred = require('er/Deferred');
                return Deferred.resolved();
            }
            else {
                return FormAction.prototype.enter.call(this, context);
            }
        };
        
        /**
         * 加载广告位权限数据
         *
         */
        function loadAuthorities () {
            if (!this.model.get('channelTree')) {
                this.model.loadAuthorities()
                    .then(
                        u.bind(
                            afterLoadAuthorities,
                            this
                        )
                    );
            }
            else {
                afterLoadAuthorities.call(this);
            }
        }

        function afterLoadAuthorities() {
            this.view.bindAuthorityData();
            this.model.changeAutoToggleState(false);
        }

        /**
         * 初始化交互行为
         *
         * @override
         */
        ManagerForm.prototype.initBehavior = function () {
            FormAction.prototype.initBehavior.apply(this, arguments);
            if (!this.model.get('channelTree')) {
                loadAuthorities.call(this);
            }
            this.view.on('requestslots', u.bind(loadAuthorities, this));
            this.view.on('unselectchannels', u.bind(unselectSlots, this));
            this.view.on(
                'refreshauthoritydisplay',
                u.bind(refreshAuthorityDisplay, this)
            );
            this.view.on('loadslots', u.bind(loadSlots, this));
            this.view.on('resetslots', u.bind(resetSlots, this));
        };

        /**
         * 取消广告位选择权限
         *
         * @param {Event} e DOM事件对象
         * @inner
         */
        function unselectSlots(e) {
            var channelIds = e.channelIds;
            this.model.unselectSlots(channelIds);
        }

        /**
         * 清空广告位备选区
         *
         * @param {Event} e DOM事件对象
         * @inner
         */
        function resetSlots(e) {
            this.model.resetSlots();
            this.view.refreshSlotsArea();
        }

        /**
         * 根据频道加载广告位
         *
         * @param {Event} e DOM事件对象
         * @inner
         */
        function loadSlots(e) {
            this.model.loadSlots(e.channelId);
            this.view.refreshSlotsArea();
        }

        /**
         * 刷新权限控件数据，并绑定到控件上
         *（除广告位备选框和用于导出广告位的频道频道组选框）
         *
         * @inner
         */
        function refreshAuthorityDisplay(e) {
            this.model.refreshAuthorityTree(e.node);
            this.view.bindAuthorityData(e.blackList);
        }
        return ManagerForm;
    }
);
