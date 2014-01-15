/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 内联创建创意表单视图类
 * @author lixiang(lixiang05@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var UIView = require('ef/UIView');
        var util = require('er/util');
        var u = require('underscore');

        require('tpl!./tpl/form.tpl.html');

        /**
         * 内联创意表单视图类
         *
         * @constructor
         * @extends ef/UIView
         */
        function CreativeFormView() {
            UIView.apply(this, arguments);
        }

        util.inherits(CreativeFormView, UIView);

        /** 
         * 使用的模板名称
         *
         * @type {string}
         */
        CreativeFormView.prototype.template = 'inlineCreateCreative';

        /**
         * 初始化表单相关行为
         *
         * @param {Object} e 事件对象
         */
        function initFormBehavior(e) {
            var me = this;
            var action = e.target.get('action');
            action.on('entitysave', function (e) {
                var entity = e.entity;
                // 获取action的权重信息
                var inturnField = action.view.getInturnField();
                if (inturnField) {
                    entity.inturnValue = inturnField.getValue();
                }
                me.fire('save', { entity: entity });
            });
            action.on('submitcancel', u.delegate(this.fire, this, 'cancel'));
        }

        /**
         * 控件事件配置
         *
         * @type {Object}
         * @override
         */
        CreativeFormView.prototype.uiEvents = {
            'text-form:actionloaded': initFormBehavior,
            'image-form:actionloaded': initFormBehavior,
            'flash-form:actionloaded': initFormBehavior,
            'rich-form:actionloaded': initFormBehavior,
            'nova-form:actionloaded': initFormBehavior
        };

        /**
         * 提示错误
         *
         * @param {Array} fields 错误信息集合
         * [{ field: 'inturn', message: '顺序重复啦!' }]
         * @override
         */
        CreativeFormView.prototype.showErrors = function (fields) {
            var view = this;
            var inlineActionPanels = 
                ['text-form', 'image-form', 'flash-form', 
                 'rich-form', 'nova-form'];
            u.each(inlineActionPanels, function (panelName) {
                var panel = view.get(panelName);
                if (panel && panel.action) {
                    var actionView = panel.action.view;
                    var Validity = require('esui/validator/Validity');
                    var ValidityState = require('esui/validator/ValidityState');

                    for (var i = 0; i < fields.length; i++) {
                        var fail = fields[i];

                        var state = new ValidityState(false, fail.message);
                        var validity = new Validity();
                        validity.addState('server', state);

                        var input = actionView.get(fail.field)[0];
                        if (input) {
                            input.showValidity(validity);
                        }
                    }
                }
            });
        };
        
        return CreativeFormView;
    }
);
