/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 创意表单数据模型基类
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var FormModel = require('common/FormModel');
        var util = require('er/util');
        var creativeEnums = require('creative/enum');


        // 所有创意的表单数据模型继承此基类，并有如下限制：
        //
        // - 如果有上传物料的需求，通过`uploadType`属性来设置主物料的类型

        /**
         * 创意表单数据模型类
         *
         * @constructor
         * @extends common/FormModel
         */
        function BaseFormModel() {
            FormModel.apply(this, arguments);
        }

        util.inherits(BaseFormModel, FormModel);

        var defaultDatasource = {
            xmlExt: function (model) {
                // 给XML标签子Action的数据
                return {
                    cbExtFlag: model.get('cbExtFlag'),
                    cbExt: model.get('cbExt'),
                    formType: model.get('formType'),
                    creativeType: model.creativeType
                };
            },

            file: function (model) {
                if (!model.uploadType) {
                    return null;
                }

                var result = {
                    type: model.uploadType,
                    previewContainer: 'preview',
                    idPrefix: model.uploadType,
                    creativeType: model.creativeType
                };

                if (model.get('id')) {
                    result.materialType = model.get('materialType');
                    result.value = model.get('materialUrl');
                    result.materialLocalPath = model.get('materialLocalPath');
                    result.width = model.get('width');
                    result.height = model.get('height');
                }

                return result;
            },
            // 创意的入口有两个，工具入口没有“继续创建下一个”的按钮
            // 用这个字段做标志
            allowContinue: function (model) {
                if (model.get('allowContinue') === 'false') {
                    return false;
                }
            },
            // 轮播方式配置
            inturnInfo: function (model) {
                var inturnTypes = creativeEnums.InturnType;
                var inturnType = model.get('inturnType');
                if (inturnType) {
                    var inturnInfo = { value: model.get('inturnValue') };
                    inturnInfo.key = 
                        inturnTypes.getAliasFromValue(inturnType).toLowerCase();
                    inturnInfo.text = inturnTypes.getTextFromValue(inturnType);
                    var count = Math.min(model.get('inturnMax'), 10);
                    var options = [];
                    var i = 1;
                    while (i <= count) {
                        options.push({ text: i, value: i });
                        i ++;
                    }
                    inturnInfo.options = options;
                    return inturnInfo;
                }
                return null;
            }
        };

        /**
         * 默认数据源配置
         * 
         * @param {Object}
         * @override
         */
        BaseFormModel.prototype.defaultDatasource = [
            FormModel.prototype.defaultDatasource,
            defaultDatasource
        ];

        return BaseFormModel;
    }
);