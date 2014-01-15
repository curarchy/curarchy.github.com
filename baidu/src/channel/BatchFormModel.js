/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 批量频道表单数据模型类
 * @author lixiang(lixiang05@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var FormModel = require('common/FormModel');
        var Data = require('./Data');
        var util = require('er/util');

        function BatchChannelFormModel(context) {
            FormModel.apply(this, arguments);
            this.data = new Data();
        }

        util.inherits(BatchChannelFormModel, FormModel);

        BatchChannelFormModel.prototype.datasource = [
            {
                crumbPath: function (model) {
                    var path = [];
                    path[0] = { text: '频道', href: '#/channel/list' };
                    path[1] = { text: model.get('title') };
                    return path;
                },
                crumbSkin: function (model) {
                    return 'flat';
                }
            }
        ];

        return BatchChannelFormModel;
    }
);