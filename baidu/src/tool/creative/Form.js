/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 内联创建创意表单Action
 * @author lixiang05(lixiang05@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var BaseAction = require('common/BaseAction');
        var util = require('er/util');

        // 把需要的子表单全依赖上，免得加载太慢
        require('./TextForm');
        require('./ImageForm');
        require('./FlashForm');
        require('./RichForm');
        require('./NovaForm');

        /**
         * 创意表单
         *
         * @constructor
         * @extends er/BaseAction
         */
        function CreativeForm(entityName) {
            this.entityName = entityName;
            BaseAction.apply(this, arguments);
        }

        util.inherits(CreativeForm, BaseAction);

        /**
         * 视图类型
         *
         * @type {function}
         * @override
         */
        CreativeForm.prototype.viewType = 
            require('./FormView');

        /**
         * 数据模型类型
         *
         * @type {function}
         * @override
         */
        CreativeForm.prototype.modelType = require('./FormModel');


        /**
         * 初始化交互行为
         *
         * @protected
         * @override
         */
        CreativeForm.prototype.initBehavior = function () {
            // 子action点击提交后，父action捕获
            this.view.on('save', handleSubmitResult, this);
            this.view.on('cancel', handleSubmitResult, this);
        };

        function handleSubmitResult(e) {
            var event = this.fire(e.type, { entity: e.entity });
            if (!event.isDefaultPrevented()) {
                var targetURL = 
                    (this.context && this.context.referrer)
                    || '/' + this.getEntityName() + '/list';
                this.redirect(targetURL);
            }
        }

        return CreativeForm;
    }
);