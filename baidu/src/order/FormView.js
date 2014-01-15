/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 直投订单表单视图类
 * @author  exodia(dengxinxin@163.com)
 * @date $DATE$
 */
define(
    function (require) {
        var FormView = require('common/FormView');
        var util = require('er/util');
        var u = require('underscore');

        require('tpl!./tpl/form.tpl.html');

        /**
         * 订单表单视图类
         *
         * @constructor
         * @extends common/FormView
         */
        function OrderFormView() {
            FormView.apply(this, arguments);
        }

        util.inherits(OrderFormView, FormView);

        /**
         * 使用的模板名称
         *
         * @type {string}
         */
        OrderFormView.prototype.template = 'orderForm';

        /**
         * 从表单中获取实体数据
         *
         * @return {Object}
         */
        OrderFormView.prototype.getEntity = function () {
            var entity = FormView.prototype.getEntity.apply(this, arguments);
            u.each(entity, function (v, k) {
                typeof v === 'undefined' || v === '' && delete entity[k];
            });

            return entity;
        };

        /**
         * 控件额外属性配置
         *
         * @type {Object}
         * @override
         */
        OrderFormView.prototype.uiProperties = {

        };

        function createCompany() {
            var view = this;
            var options = {
                url: '/company/create',
                title: '新建广告客户'
            };
            view.waitActionDialog(options).then(
                function (e) {
                    var dialog = e.target;
                    var dialogAction = dialog.get('action');
                    dialogAction.on(
                        'entitysave',
                        function (e) {
                            // 刷新当前页面数据
                            view.fire('addcompany', { company: e.entity });
                        }
                    );
                }
            );
        }

        /**
         * 控件事件配置
         *
         * @type {Object}
         * @override
         */
        OrderFormView.prototype.uiEvents = {
            'adowner:change': function (e) {
                this.changeContactorState();
                this.fire(
                    'companychange',
                    { companyType: 'adowner', item: e.item }
                );
            },
            'agent:change': function (e) {
                this.changeContactorState();
                this.fire(
                    'companychange',
                    { companyType: 'agent', item: e.item }
                );
            },
            'create-company:click': createCompany
        };

        /**
         * 刷新联系人
         *
         * @params {String} type 联系人类型, 'adowner' | 'agent'
         * @params {Array} data 新的联系人数据
         * @params {Boolean = false} persist 是否设置为现有的值
         */
        OrderFormView.prototype.refreshContactors =
            function (type, data, persist) {
                var control = this.get(type + '-contactor');
                var val = '';
                if (persist) {
                    var contactor = this.model.get(type + 'Contactor');
                    val = contactor && contactor.id || '';
                }
                control.enable();
                control.setProperties({
                    datasource: data,
                    value: val
                });
            };

        /**
         * 刷新广告客户
         *
         * @params {Array} data 新的数据
         * @params {Object} toggleSelector选中的值
         */
        OrderFormView.prototype.refreshCompany = function (data, value) {
            var control = this.get('adowner');
            control.setProperties({
                datasource: data,
                rawValue: value || null
            });
            this.fire(
                'companychange',
                { companyType: 'adowner', item: value }
            );
        };

        OrderFormView.prototype.notifyErrors = function (error) {
            FormView.prototype.notifyErrors.apply(this, arguments);

            var diliveriesErrors = u.filter(
                error.fields,
                function (v) {
                    return v.field.indexOf('deliveries') >= 0;
                }
            );
            var slotsAction = this.get('slots').get('action');
            slotsAction.showValidationErrors(diliveriesErrors);
        };

        OrderFormView.prototype.changeContactorState = function () {
            //默认情况联系人禁用，联系人提示标签隐藏
            var adowner = this.get('adowner').getValue();
            var agent = this.get('agent').getValue();
            this.get('adowner-contactor')[adowner ? 'enable' : 'disable']();
            this.get('adowner-contactor-label')[adowner ? 'hide' : 'show']();

            this.get('agent-contactor')[agent ? 'enable' : 'disable']();
            this.get('agent-contactor-label')[agent ? 'hide' : 'show']();
        };

        OrderFormView.prototype.enterDocument = function () {
            FormView.prototype.enterDocument.apply(this, arguments);
            this.changeContactorState();
        };

        return OrderFormView;
    }
);
