/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file union表单Action
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        
        // 基本逻辑：
        // 
        // 1. 加载广告位的cpro信息，重要的是`catalog`字段需要保存下来
        // 2. 根据`id`加载union的页面
        // 3. 提交时从`contentWindow.getCproConfig()`获取union的配置
        // 4. 把`code`、`cname`和加载的`catalog`发送给后端保存

        var FormAction = require('common/FormAction');
        var util = require('er/util');
        var config = require('./config');

        /**
         * union表单
         *
         * @constructor
         * @extends common/FormAction
         */
        function CproSetting() {
            FormAction.apply(this, arguments);
        }

        util.inherits(CproSetting, FormAction);

        /**
         * 当前Action的分组名称
         *
         * @type {string}
         * @override
         */
        CproSetting.prototype.group = 'setting';

        /**
         * 当前Action负责的实体的描述名称
         *
         * @type {string}
         * @override
         */
        CproSetting.prototype.entityDescription = config.description;

        /**
         * 视图类型
         *
         * @type {function}
         * @override
         */
        CproSetting.prototype.viewType = require('./CproSettingView');

        /**
         * 数据模型类型
         *
         * @type {function}
         * @override
         */
        CproSetting.prototype.modelType = require('./CproSettingModel');

        /**
         * 提交实体（新建或更新）
         *
         * @param {Object} entity 实体数据
         * @param {er/Promise}
         * @override
         */
        // CproSetting.prototype.submitEntity = function (entity) {
        //     entity = this.model.fillEntity(entity);

        //     // 不需要校验

        //     return this.model.update(entity)
        //         .then(
        //             u.bind(this.handleSubmitResult, this),
        //             u.bind(this.handleSubmitError, this)
        //         );
        // };

        /**
         * 提交后跳转
         *
         * @override
         */
        CproSetting.prototype.redirectAfterSubmit = function () {
            // 提交后转回广告位修改页
            this.redirect('/slot/update~id=' + this.model.get('slotId'));
        };

        /**
         * 数据提交后的提示信息
         *
         * @type {string}
         * @override
         */
        CproSetting.prototype.toastMessage = '网盟样式已经保存成功';

        return CproSetting;
    }
);