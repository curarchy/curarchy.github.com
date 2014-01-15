/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 订单表单数据模型类
 * @author liyidong(srhb18@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var FormModel = require('common/FormModel');
        var Data = require('./Data');
        var util = require('er/util');
        var CproResult = require('union/enum').CproResult;

        /**
         * 订单表单数据模型类
         *
         * @constructor
         * @extends common/FormModel
         */
        function InventoryFormModel() {
            FormModel.apply(this, arguments);
            this.data = new Data();
            var UnionModel = require('common/global/UnionModel');
            this.union = new UnionModel();
        }

        util.inherits(InventoryFormModel, FormModel);

        /**
         * 数据源配置
         *
         * @type {Object}
         * @override
         */
        InventoryFormModel.prototype.datasource = {
            union: function (model) {
                var unionModel = model.union;
                return unionModel.load()
                    .then(function () { return unionModel.valueOf(); });
            }
        };

        /**
         * 对数据源进行预处理
         */
        InventoryFormModel.prototype.prepare = function () {
            var union = this.get('union');
            var unionService = union.unionService;
            var isNormal = 
                union.cproResult === CproResult.SAME_WITH_MAIN_ACCOUNT
                || union.cproResult === CproResult.ABNORMAL
                || union.cproResult === CproResult.NOT_BIND_MAIN_ACCOUNT;

            // 为保证安全，按照从严格到宽松的要求依次做判断
            // 确保意外状况下无法进入普通模式
            if (unionService && isNormal) {
                this.set('formDisplay', 'normal');
            }
            else if (unionService && union.cproResult === CproResult.UNBOUND) {
                this.set('formDisplay', 'unbind');
            }
            else {
                this.set('formDisplay', 'unavailable');
            }
        };

        return InventoryFormModel;
    }
);