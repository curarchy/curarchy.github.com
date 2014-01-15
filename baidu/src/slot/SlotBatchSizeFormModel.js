/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 批量修改尺寸模型类
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

        function SlotBatchSizeFormModel() {
            FormModel.apply(this, arguments);
            this.data = new Data();
        }

        util.inherits(SlotBatchSizeFormModel, FormModel);

        var system = require('common/global/system');
        var slotSize = system.adPositionSize;
        
        /**
         * 数据源配置
         *
         * @type {Object}
         * @override
         */
        SlotBatchSizeFormModel.prototype.datasource = {
            sizes: function (model) {
                var selectorData = u.map(slotSize, function (item, index) {
                    return {
                        id: index + 1,
                        name: item.value
                    };
                });
                return selectorData;
            }
        };

        

        /**
         * 判断实体是否有变化
         *
         * @param {Object} entity 新的实体
         * @return {boolean}
         */
        SlotBatchSizeFormModel.prototype.isEntityChanged = function (entity) {
            var emptyEntity = {
                width: '',
                height: '',
                slotSize: undefined
            };
            
            if (!entity.width && !entity.height) {
                entity.width = emptyEntity.width;
                entity.height = emptyEntity.height;
            }
           
            entity.slotSize = emptyEntity.slotSize;
            return !u.isEqual(emptyEntity, entity);
        };

        var ajax = require('er/ajax');
        u.each(
            config.requests,
            function (config) {
                ajax.register(SlotBatchSizeFormModel, config.name, config);
            }
        );

        return SlotBatchSizeFormModel;
    }
);