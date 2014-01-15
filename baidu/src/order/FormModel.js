/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 订单数据类
 * @author exodia(dengxinxin@163.com)
 * @date $DATE$
 */
define(
    function (require) {
        var FormModel = require('common/FormModel');
        var Data = require('./Data');
        var CompanyData = require('company/Data');
        var ManagerData = require('manager/Data');
        var ContactData = require('contact/Data');
        var util = require('er/util');
        var u = require('underscore');
        var datasource = require('er/datasource');

        var DELIVERIER = 3;

        /**
         * 订单表单数据模型类
         *
         * @constructor
         * @extends common/FormModel
         */
        function OrderFormModel() {
            FormModel.apply(this, arguments);
            this.data = new Data();
            this.companyData = new CompanyData();
            this.managerData = new ManagerData();
            this.contactData = new ContactData();

            /**
             * 更新一个实体
             * 改动通用的 Data.prototype影响可能会比较大，先这样 hack 下
             * @param {Object} entity 实体对象
             * @return {FakeXHR}
             */
            this.data.update = function (entity) {
                var id = entity.id;
                delete entity.id;
                return this.request(
                    '$entity/update',
                    entity,
                    {
                        method: 'PUT',
                        url: '/$entity/' + id
                    }
                );
            };

        }

        util.inherits(OrderFormModel, FormModel);

        OrderFormModel.prototype.prepare = function () {
            switch (this.get('formType')) {
                case 'create':
                    var companyId = this.get('customer');
                    this.fill({
                        adowner: { id: companyId },
                        adownerContactor: {},
                        saler: {},
                        agent: {},
                        deliverier: getCurrentDeliverier() || {},
                        agentContactor: {},
                        otherContactor: {}
                    });
                    break;
                case 'update':
                    this.set('disableModify', true);
                    break;
            }

            this.set('slotSectionData', {
                datasource: this.get('adpositions')
            });
        };

        /**
         * 数据函数工厂
         *
         * @param {String} name 请求数据配置名称
         * @param {String} method 数据方法名
         * @param {Object} [query] 附加参数
         * @returns {Function}
         */
        function retriveFactory(name, method, query) {
            name = name + 'Data';
            return function (model) {
                var loading = model[name][method](query);
                return loading.then(function (response) {
                    return response.results || [];
                });
            };
        }

        /**
         * 联系人函数工厂
         *
         * @param {String} type 联系人类型
         * 'adowner', 'agent', 'other'
         *
         * @returns {Function}
         */
        function contactorFactory(type) {
            return function (model) {
                if (type === '*') {
                    return model.getContactors(type);
                }
                if (model.get('formType') === 'update') {
                    return model.getContactors(model.get(type).id);
                }
            };
        }

        /**
         * 获取当前投放人员，若当前用户不是投放人员，则返回undefined
         * @returns {Object | undefined}
         */
        function getCurrentDeliverier() {
            var currentUser = require('common/global/user');
            if (currentUser.subRole == DELIVERIER) {
                return {
                    id: currentUser.subUserInfoId, name: currentUser.subUserInfoName
                };
            }
        }

        /**
         * 数据源配置
         *
         * @type {Object}
         * @override
         */
        OrderFormModel.prototype.datasource = [
            {
                companies: retriveFactory(
                    'company', 'list',
                    //启用，广告公司
                    { status: 1, type: 0 }
                ),
                agents: retriveFactory(
                    'company', 'list',
                    //启用，代理机构
                    { status: 1, type: 1 }
                ),
                salers: retriveFactory('manager', 'getSalers'),
                deliveriers: function (model) {
                    return model.getDeliveriers();
                },
                otherContactors: contactorFactory('*'),
                disableSelectDeliverier: datasource.constant(
                    typeof getCurrentDeliverier() !== 'undefined'
                )
            },
            {
                crumbPath: function (model) {
                    var path = [
                        { text: '所有订单', href: '#/order/all' }
                    ];

                    var customer = model.get('customer');
                    if (customer) {
                        var companies = model.get('companies');
                        var adowner = model.get('adowner')
                            || u.findWhere(companies, { id: +customer });

                        adowner && path.push({
                            text: adowner.name,
                            href: '#/customer/detail~id=' + customer
                        });
                    }

                    path.push({ text: model.get('title') });
                    return path;
                }
            }
        ];

        /**
         * 获取投放人员
         * @return {er/Promise | Array}
         */
        OrderFormModel.prototype.getDeliveriers = function () {
            var current = getCurrentDeliverier();
            if (current) {
                return [ current ];
            }

            return retriveFactory(
                'manager', 'list',
                { role: 3, status: '1,2,3' }
            )(this);
        };


        /**
         * 获取公司联系人
         *
         * @params {String} id 公司id或者`*`表示所有联系人
         * @return {er/Promise}
         */
        OrderFormModel.prototype.getContactors = function (id) {
            if (!id) {
                var Deferred = require('er/Deferred');
                var deferred = new Deferred();
                deferred.resolve([]);
                return deferred.promise;
            }

            var data = { status: '0,1,2,3,4' };
            if (id !== '*') {
                data.companyId = id;
            }

            var loading = this.contactData.list(data);

            return loading.done(function (response) {
                return response.results || [];
            });
        };

        OrderFormModel.prototype.fillEntity = function (entity) {
            u.each(
                [
                    'adowner', 'adownerContactor', 'saler', 'deliverier',
                    'agent', 'agentContactor', 'otherContactor'
                ],
                function (key) {
                    if (entity.hasOwnProperty(key)) {
                        if (typeof entity[key] === 'object') {
                            entity[key + 'Id'] = entity[key].id;
                        }

                        delete entity[key];
                    }
                }
            );
            this.get('formType') === 'create' && (entity.type = 0);
            return entity;
        };

        return OrderFormModel;
    }
);