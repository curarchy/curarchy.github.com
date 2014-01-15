/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 订单表单类
 * @author exodia(dengxinxin@163.com)
 * @date $DATE$
 */
define(
    function (require) {
        var FormAction = require('common/FormAction');
        var util = require('er/util');
        var config = require('./config');
        var u = require('underscore');

        // 预加载广告位资源选择子Action
        require('./SlotSection');

        /**
         * 订单表单
         *
         * @constructor
         * @extends common/FormAction
         */
        function OrderForm() {
            FormAction.apply(this, arguments);
        }

        util.inherits(OrderForm, FormAction);

        /**
         * 当前Action的分组名称
         *
         * @type {string}
         * @override
         */
            // TODO: 必须设置这个值，选择`slot | order | setting | report`
        OrderForm.prototype.group = 'order';

        /**
         * 当前Action负责的实体的描述名称
         *
         * @type {string}
         * @override
         */
        OrderForm.prototype.entityDescription = config.description;

        /**
         * 视图类型
         *
         * @type {function}
         * @override
         */
        OrderForm.prototype.viewType = require('./FormView');

        /**
         * 数据模型类型
         *
         * @type {function}
         * @override
         */
        OrderForm.prototype.modelType = require('./FormModel');


        OrderForm.prototype.redirectAfterSubmit = function (entity) {
            var targetURL = this.context && this.context.referrer;
            if (!targetURL) {
                targetURL = '/' + this.getEntityName()
                    + '/detail~id=' + entity.id;
            }

            this.redirect(targetURL);
        };

        OrderForm.prototype.redirectAfterCancel = function () {
            if (this.context.isChildAction) {
                this.fire('submitcancel');
                this.fire('handlefinish');
            }
            else {
                var targetURL = this.context && this.context.referrer;
                if (!targetURL) {
                    targetURL = '/' + this.getEntityName() + '/all';
                }
                this.redirect(targetURL);
            }
        };

        function companyChange(e) {
            var loading = this.model.getContactors(e.item && e.item.id);
            var view = this.view;
            loading.done(
                function (data) {
                    view.refreshContactors(e.companyType, data, e.isInit);
                    view.changeContactorState();
                }
            );
        }

        function addCompany(e) {
            var companies = [e.company].concat(this.model.get('companies'));
            this.model.set('companies', companies);
            this.view.refreshCompany(companies, companies[0]);
        }

        OrderForm.prototype.initBehavior = function () {
            FormAction.prototype.initBehavior.apply(this, arguments);
            this.view.on('companychange', u.bind(companyChange, this));
            this.view.on('addcompany', u.bind(addCompany, this));
            var id = this.view.get('adowner').getValue();
            id && companyChange.call(
                this, { companyType: 'adowner', item: { id: id }, isInit: true }
            );
            id = this.view.get('agent').getValue();
            id && companyChange.call(
                this, { companyType: 'agent', item: { id: id }, isInit: true }
            );
        };

        OrderForm.prototype.submitEntity = function (entity) {
            var invalidDiscountCount = 0;
            u.each(
                entity.deliveries,
                function (delivery) {
                    if (!isNaN(delivery.minDiscount)
                        && delivery.discount < delivery.minDiscount
                    ) {
                        invalidDiscountCount++;
                    }

                    delete delivery.minDiscount;
                }
            );

            var validating = invalidDiscountCount
                ? this.view.waitConfirm(
                    '有' + invalidDiscountCount + '个广告的折扣低于广告位最低折扣，'
                        + '是否继续？',
                    '提交数据存在问题'
                )
                : require('er/Deferred').resolved();

            validating.then(
                u.bind(FormAction.prototype.submitEntity, this, entity),
                u.bind(this.view.enableSubmit, this.view)
            );
        };

        return OrderForm;
    }
);