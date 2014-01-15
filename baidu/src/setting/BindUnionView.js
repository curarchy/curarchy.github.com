/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 修改帐户名称表单的视图类
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var FormView = require('common/FormView');
        var util = require('er/util');

        require('tpl!./tpl/bindUnion.tpl.html');

        /**
         * setting表单视图类
         *
         * @constructor
         * @extends common/FormView
         */
        function BindUnionView() {
            FormView.apply(this, arguments);
        }

        util.inherits(BindUnionView, FormView);

        /** 
         * 使用的模板名称
         *
         * @type {string}
         */
        BindUnionView.prototype.template = 'bindUnion';

        BindUnionView.prototype.uiEvents = {
            'type:change': function (e) {
                var type = e.target.getValue();
                var bindForm = this.get('form');
                var createPanel = this.get('create');

                if (type === 'bind') {
                    bindForm.show();
                    createPanel.hide();
                }
                else {
                    bindForm.hide();
                    createPanel.show();
                }
            },

            'register:click': function (e) {
                this.alert(
                    '请在新打开的页面完成注册。'
                        + '当您的注册通过百度联盟的审核后，请在此手工绑定。',
                    '您选择注册联盟帐号'
                );
            },

            'cancel-register:click': function () {
                this.fire('cancel', { skipConfirm: true });
            }
        };
        
        return BindUnionView;
    }
);