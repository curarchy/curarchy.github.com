/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 帐户设置视图类
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var UIView = require('ef/UIView');
        var util = require('er/util');
        var u = require('underscore');

        require('tpl!./tpl/common.tpl.html');
        require('tpl!./tpl/read.tpl.html');

        /**
         * setting表单视图类
         *
         * @constructor
         * @extends ef/UIView
         */
        function SettingReadView() {
            UIView.apply(this, arguments);
        }

        util.inherits(SettingReadView, UIView);

        /** 
         * 使用的模板名称
         *
         * @type {string}
         */
        SettingReadView.prototype.template = 'settingRead';

        function toggleActionPanel(e) {
            var id = e.target.get('id');
            var actionPanel = this.get(id + '-region');

            if (!actionPanel.isHidden()) {
                return;
            }

            actionPanel.show();
            actionPanel.reload();
        }

        /**
         * 初始化子Action交互
         *
         * @param {string} propertyName 对应的用户属性名称
         * @param {string} label 对应的`Label`的id
         * @param {Object} e 事件对象
         */
        function initChildAction(propertyName, label,  e) {
            var actionPanel = e.target;
            var action = actionPanel.get('action');

            var update = function () {
                this.fire(
                    'propertyupdate', 
                    { name: propertyName, id: label }
                );
            };
            update = u.bind(update, this);

            // 无论有没有保存，同步一下值没关系
            action.on('submitcancel', update);
            action.on('entitysave', update);
        }

        /**
         * 控件事件配置
         *
         * @type {Object}
         * @override
         */
        SettingReadView.prototype.uiEvents = {
            'modify-name:click': toggleActionPanel,
            'modify-password:click': toggleActionPanel,
            'modify-mail:click': toggleActionPanel,
            'modify-union-name:click': toggleActionPanel,

            'modify-name-region:actionloaded': 
                u.partial(initChildAction, 'accountName', 'name'),
            'modify-password-region:actionloaded': 
                u.partial(initChildAction, 'password', 'password'),
            'modify-mail-region:actionloaded': 
                u.partial(initChildAction, 'mail', 'mail'),
            'modify-union-name-region:actionloaded': 
                u.partial(initChildAction, 'mainUserUnionName', 'union-name')
        };

        /**
         * 更新指定字段
         *
         * @param {string} field 字段名称
         * @param {string} property 对应的Model中的属性名称
         */
        SettingReadView.prototype.updateField = function (field, property) {
            var targetLabel = this.get(field);
            if (targetLabel) {
                var value = this.model.get(property);

                if (field === 'union-name' && value) {
                    this.get('modify-union-name').hide();
                }
                
                if (!value && field === 'union-name') {
                    value = '未绑定';
                }
                targetLabel.set('text', value);
            }

            var actionPanel = this.get('modify-' + field + '-region');
            if (actionPanel) {
                actionPanel.hide();
            }
        };

        return SettingReadView;
    }
);