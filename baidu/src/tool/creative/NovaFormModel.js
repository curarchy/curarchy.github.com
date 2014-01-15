/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 网盟创意表单数据模型类
 * @author liyidong(srhb18@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var BaseFormModel = require('./BaseFormModel');
        var Data = require('./Data');
        var util = require('er/util');

        /**
         * 创意表单数据模型类
         *
         * @constructor
         * @extends common/FormModel
         */
        function NovaFormModel() {
            BaseFormModel.apply(this, arguments);    
            this.data = new Data();
            var UnionModel = require('../../common/global/UnionModel');
            this.union = new UnionModel();
        }

        util.inherits(NovaFormModel, BaseFormModel);

        /**
         * 数据源配置
         *
         * @type {Object}
         * @override
         */
        NovaFormModel.prototype.datasource = {
            union: function (model) {
                var unionModel = model.union;
                return unionModel.load()
                    .then(function () { return unionModel.valueOf(); });
            },
            currentModel: function (model) {
                if (model.get('id')) {
                    return 'novaCreate';
                }
                else {
                    return 'novaUpdate';
                }
            }
        };

        /**
         * 检查实体数据完整性，可在此补充一些视图无法提供的属性
         *
         * @param {Object} entity 实体数据
         * @return {Object} 补充完整的实体数据
         * @override
         */
        NovaFormModel.prototype.fillEntity = function (entity) {
            entity.type = 10;
            entity.cproFillStr = '';
            return entity;
        };

        return NovaFormModel;
    }
);