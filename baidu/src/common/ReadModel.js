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

        /**
         * 频道列表数据模型类E
         *
         * @param {string} entityName 负责的实体名称
         * @param {Object=} context 用于初始化的数据
         * @constructor
         * @extends common/SingleEntityModel
         */
        function ReadModel(entityName, context) {
            SingleEntityModel.apply(this, arguments);
        }

        util.inherits(ReadModel, SingleEntityModel);

        // 全局所有Model都可能有的属性名，这些属性不需要被自动转为`'--'`
        var globalModelProperties = {
            toast: true,
            url: true,
            referrer: true,
            isChildAction: true,
            container: true,
            entity: true
        };

        /**
         * 获取属性值
         *
         * @param {string} name 属性名称
         * @return {*} 属性值，如果不存在属性则返回`'--'`
         * @override
         */
        ReadModel.prototype.get = function (name) {
            var value = SingleEntityModel.prototype.get.call(this, name);

            if (globalModelProperties.hasOwnProperty(name)) {
                return value;
            }

            if (value === '' || value === undefined) {
                return '--';
            }
            
            return value;
        };

        /**
         * 判断一个属性是否有值
         *
         * @param {string} name 属性名
         * @return {boolean}
         */
        ReadModel.prototype.hasNonEmptyValue = function (name) {
            var value = SingleEntityModel.prototype.get.call(this, name);

            return value !== '' && value != null;
        };

        return ReadModel;
    }
);
