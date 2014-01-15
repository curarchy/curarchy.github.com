/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 上传文件的表单区域数据模型类
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var Model = require('er/Model');
        var util = require('er/util');

        /**
         * 上传文件的表单区域数据模型类
         *
         * @constructor
         * @extends er/Model
         */
        function FileFieldModel () {
            Model.apply(this, arguments);
        }

        util.inherits(FileFieldModel, Model);

        var datasource = require('er/datasource');

        /**
         * 数据源配置
         *
         * @type {Object}
         * @override
         */
        FileFieldModel.prototype.datasource = {
            // 默认为上传文件
            materialType: datasource.defaultValue('materialType', 1),
            idPrefix: datasource.defaultValue('idPrefix', 'file'),
            typeText: function (model) {
                var mapping = {
                    image: '图片',
                    flash: 'Flash'
                };

                return model.get('type')
                    ? mapping[model.get('type')]
                    : '';
            },
            typeIndex: function (model) {
                var mapping = {
                    image: 1,
                    flash: 2
                };

                return model.get('type')
                    ? mapping[model.get('type')]
                    : '';
            },
            acceptFileType: function (model) {
                var mapping = {
                    image: '.gif,.jpg,.png',
                    flash: '.swf'
                };

                return model.get('type')
                    ? mapping[model.get('type')]
                    : '';
            },
            file: function (model) {
                if (model.get('value') && model.get('materialType') === 1) {
                    return {
                        width: model.get('width'),
                        height: model.get('height'),
                        value: model.get('value'),
                        materialLocalPath: model.get('materialLocalPath'),
                        type: model.get('type')
                    };
                }
                else {
                    return model.get('value');
                }
            },
            acceptErrorMessage: function (model) {
                switch (model.get('type')) {
                    case 'image':
                        return '图片的扩展名只能是gif、jpg或png';
                    case 'flash':
                        return 'Flash的扩展名只能是swf';
                    default:
                        return '';
                }
            }
        };

        return FileFieldModel;
    }
);        
