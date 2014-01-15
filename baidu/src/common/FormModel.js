/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 表单数据模型基类
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var util = require('er/util');
        var SingleEntityModel = require('common/SingleEntityModel');
        var u = require('underscore');

        /**
         * 频道列表数据模型类
         *
         * @param {string} entityName 负责的实体名称
         * @param {Object=} context 用于初始化的数据
         * @constructor
         * @extends common/SingleEntityModel
         */
        function FormModel(entityName, context) {
            SingleEntityModel.apply(this, arguments);
        }

        util.inherits(FormModel, SingleEntityModel);

        /**
         * 判断实体是否有变化
         *
         * @param {Object} entity 新的实体
         * @return {boolean}
         */
        FormModel.prototype.isEntityChanged = function (entity) {
            var original = this.get('entity');
            return !u.isEqual(original, entity);
        };

        /**
         * 检查实体数据完整性，可在此补充一些视图无法提供的属性
         *
         * @param {Object} entity 实体数据
         * @return {Object} 补充完整的实体数据
         */
        FormModel.prototype.fillEntity = function (entity) {
            return entity;
        };

        /**
         * 检验实体有效性
         *
         * @param {Object} entity 提交的实体
         * @return {Object[] | true} 返回`true`表示验证通过，否则返回错误字体
         */
        FormModel.prototype.validateEntity = function (entity) {
            return true;
        };
        
        return FormModel;
    }
);
