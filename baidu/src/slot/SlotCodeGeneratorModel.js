/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 获取代码模型类
 * @author lixiang(lixiang05@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var SingleEntityModel = require('common/SingleEntityModel');
        var Data = require('./Data');
        var util = require('er/util');

        /**
         * 获取代码模型类
         *
         * @constructor
         * @extends common/FormModel
         */
        function SlotCodeGeneratorModel() {
            SingleEntityModel.apply(this, arguments);
            this.data = new Data();
        }

        util.inherits(SlotCodeGeneratorModel, SingleEntityModel);

        /**
         * 默认数据源配置
         * 
         * @param {Object}
         * @override
         */
        SlotCodeGeneratorModel.prototype.datasource = [{
            slotIds: function (model) {
                var slots = model.get('slots');
                var slotIds = [];
                for (var i = 0; i < slots.length; i ++) {
                    slotIds.push('"' + slots[i].id + '"');
                }
                return slotIds.join(',');
            }
        },
        {
            slots: function (model) {
                var slots = model.get('slots');
                for (var i = 0; i < slots.length; i ++) {
                    var slot = slots[i];
                    slot.size = slot.width + '*' + slot.height;
                    if (slot.width === -1 && slot.height === -1) {
                        slot.size = '--';
                    }
                }
                return slots;
            }
        }];

        return SlotCodeGeneratorModel;
    }
);