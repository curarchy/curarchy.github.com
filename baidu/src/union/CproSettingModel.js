/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file union表单数据模型类
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var FormModel = require('common/FormModel');
        var util = require('er/util');
        var config = require('./config');
        var u = require('underscore');

        /**
         * 网盟设置表单数据模型类
         *
         * @constructor
         * @extends common/FormModel
         */
        function CproSettingModel() {
            FormModel.call(this, 'cproAdm');

            var SlotModel = require('../slot/FormModel');
            this.slot = new SlotModel();
            var UnionModel = require('../common/global/UnionModel');
            this.union = new UnionModel();
        }

        util.inherits(CproSettingModel, FormModel);

        var datasource = require('er/datasource');
        var sysVariables = require('common/global/system').sysVariablesMap;

        /**
         * 数据源配置
         *
         * @type {Object}
         * @override
         */
        CproSettingModel.prototype.datasource = {
            slot: function (model) {
                var id = model.get('slotId');
                return model.slot.findById(id);
            },
            union: function (model) {
                var unionModel = model.union;
                return unionModel.load()
                    .then(function () { return unionModel.valueOf(); });
            },
            unionURL: datasource.constant(sysVariables.unionUrl),
            crumbPath: function (model) {
                return [
                    {
                        text: '所有广告位',
                        href: '#/slot/list'
                    },
                    {
                        text: '修改广告位',
                        href: '#/slot/update~id=' + model.get('slotId')
                    },
                    {
                        text: '修改网盟样式'
                    }
                ];
            }
        };

        /**
         * 对数据源进行预处理
         */
        CproSettingModel.prototype.prepare = function () {
            this.set('currentModel', 'slotCproSetting');
        };

        /**
         * 检查实体数据完整性，可在此补充一些视图无法提供的属性
         *
         * @param {Object} entity 实体数据
         * @return {Object} 补充完整的实体数据
         * @override
         */
        CproSettingModel.prototype.fillEntity = function (entity) {
            return {
                cname: entity.cname,
                code: entity.code,
                catalog: this.get('catalog')
            };
        };

        var ajax = require('er/ajax');
        u.each(
            config.requests,
            function (config) {
                ajax.register(CproSettingModel, config.name, config);
            }
        );

        return CproSettingModel;
    }
);