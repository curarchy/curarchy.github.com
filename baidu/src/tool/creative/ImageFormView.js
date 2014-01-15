/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 创意表单视图类
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var BaseFormView = require('./BaseFormView');
        var util = require('er/util');

        require('tpl!./tpl/imageForm.tpl.html');

        /**
         * 创意表单视图类
         *
         * @constructor
         * @extends creative/BaseFormView
         */
        function ImageFormView() {
            BaseFormView.apply(this, arguments);
        }

        util.inherits(ImageFormView, BaseFormView);

        /** 
         * 使用的模板名称
         *
         * @type {string}
         */
        ImageFormView.prototype.template = 'imageForm';

        /**
         * 从表单中获取实体数据
         *
         * @return {Object}
         */
        ImageFormView.prototype.getEntity = function () {
            var entity = 
                BaseFormView.prototype.getEntity.apply(this, arguments);

            // 目标窗口
            entity.targetWindow = parseInt(entity.targetWindow[0], 10);

            return entity;
        };
        
        return ImageFormView;
    }
);