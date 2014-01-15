/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file XML扩展标签表单区域数据模型类
 * @author liyidong(srhb18@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var Model = require('er/Model');
        var util = require('er/util');
        var u = require('underscore');

        /**
         * XML扩展标签表单区域数据模型类
         *
         * @constructor
         * @extends er/Model
         */
        function XMLExtFieldModel () {
            Model.apply(this, arguments);
        }

        util.inherits(XMLExtFieldModel, Model);

        /**
         * 对数据源进行预处理
         */
        XMLExtFieldModel.prototype.prepare = function () {
            // 处理XML标签
            if (this.get('cbExtFlag')) {
                //var model = this;
                u.each(
                    this.get('cbExt'),
                    function (element, index) {
                        this.set('cbExt' + index, element);
                    },
                    this
                );
            }
        };

        return XMLExtFieldModel;
    }
);        
