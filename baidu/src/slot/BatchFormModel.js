/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 批量广告位表单数据模型类
 * @author wangyaqiong(catkin2009@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var FormModel = require('common/FormModel');
        var Data = require('./Data');
        var util = require('er/util');

        function BatchSlotFormModel() {
            FormModel.apply(this, arguments);
            this.data = new Data();
        }

        util.inherits(BatchSlotFormModel, FormModel);

        BatchSlotFormModel.prototype.datasource = [
            {
                crumbPath: function (model) {
                    var path = [];
                    path[0] = { text: '所有广告位', href: '#/channel/detail' };
                    path[1] = { text: '新建广告位', href: '#/slot/create' };
                    path[2] = { text: '批量创建广告位' };
                    return path;
                },
                crumbSkin: function (model) {
                    return 'flat';
                }
            }
        ];

        return BatchSlotFormModel;
    }
);
