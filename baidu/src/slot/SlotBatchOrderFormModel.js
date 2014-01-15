/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 批量修改显示顺序表单数据模型类
 * @author wangyaqiong(catkin2009@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var FormModel = require('common/FormModel');
        var Data = require('./Data');
        var util = require('er/util');
        var config = require('./config');
        var u = require('underscore');

        function SlotBatchOrderFormModel() {
            FormModel.apply(this, arguments);
            this.data = new Data();
        }

        util.inherits(SlotBatchOrderFormModel, FormModel);

        /**
         * 判断实体是否有变化
         *
         * @param {Object} entity 新的实体
         * @return {boolean}
         */
        SlotBatchOrderFormModel.prototype.isEntityChanged = function (entity) {
            var emptyEntity = {
                displayOrder: ''
            };
            return !u.isEqual(emptyEntity, entity);
        };


        var ajax = require('er/ajax');
        u.each(
            config.requests,
            function (config) {
                ajax.register(SlotBatchOrderFormModel, config.name, config);
            }
        );

        return SlotBatchOrderFormModel;
    }
);