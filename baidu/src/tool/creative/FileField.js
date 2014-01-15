/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 上传文件的表单区域
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var Action = require('er/Action');
        var util = require('er/util');

        /**
         * 上传文件的表单区域
         *
         * @constructor
         * @extends er/Action
         */
        function FileField() {
            Action.apply(this, arguments);
        }

        util.inherits(FileField, Action);

        /**
         * 视图类型
         *
         * @type {function}
         * @override
         */
        FileField.prototype.viewType = require('./FileFieldView');

        /**
         * 数据模型类型
         *
         * @type {function}
         * @override
         */
        FileField.prototype.modelType = require('./FileFieldModel');

        /**
         * 获取原始值
         *
         * @return {Object}
         */
        FileField.prototype.getRawValue = function () {
            return this.view.getEntity();
        };

        return FileField;
    }
);        
