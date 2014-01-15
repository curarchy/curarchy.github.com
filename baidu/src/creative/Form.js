/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 创意表单Action
 * @author lisijin(ibadplum@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var FormAction = require('common/FormAction');
        var util = require('er/util');
        var config = require('./config');
        var u = require('underscore');

        // 把需要的依赖模块都预加载进来，免得加载太慢
        require('../tool/creative/List');
        require('../tool/creative/Form');

        /**
         * 创意表单
         *
         * @constructor
         * @extends common/FormAction
         */
        function CreativeForm() {
            FormAction.apply(this, arguments);
        }

        util.inherits(CreativeForm, FormAction);

        /**
         * 当前Action的分组名称
         *
         * @type {string}
         * @override
         */
        CreativeForm.prototype.group = 'order';

        /**
         * 当前Action负责的实体的描述名称
         *
         * @type {string}
         * @override
         */
        CreativeForm.prototype.entityDescription = config.description;

        /**
         * 视图类型
         *
         * @type {function}
         * @override
         */
        CreativeForm.prototype.viewType = require('./FormView');

        /**
         * 数据模型类型
         *
         * @type {function}
         * @override
         */
        CreativeForm.prototype.modelType = require('./FormModel');

        /**
         * 数据提交后的提示信息
         *
         * @type {string}
         * @override
         */
        CreativeForm.prototype.toastMessage = '创意已成功上传';

        /**
         * 删除创意
         * @param  {Object} e 事件对象
         * 
         */
        function deleteCreative(e) {
            var inturnType = this.model.get('inturnType');
            var results = this.model.deleteCreative(e.id);
            this.view.renderCreative();
            if (inturnType === 2) {
                var isShowWarning = this.model.isShowWarning(results);
                this.view.showWarning(isShowWarning);
            }
        }

        /**
         * 保存创意
         * @param  {Object} e 事件对象
         * 
         */
        function saveCreative(e) {
            var inturnType = this.model.get('inturnType');
            var results;
            if (e.results) {
                results = this.model.addCreative(e.results);
                this.view.renderCreative();
                if (inturnType === 2) {
                    var isShowWarning = this.model.isShowWarning(results);
                    this.view.showWarning(isShowWarning);
                }
            }
            else if (e.entity) {
                this.model.findById(e.entity.id).then(
                    u.bind(
                        function (result) {
                            result.inturnValue =
                                parseInt(e.entity.inturnValue, 10);
                            result.inturnType = inturnType;
                            result = [result];
                            results = this.model.addCreative(result);
                            this.view.renderCreative();
                            if (inturnType === 2) {
                                var isShowWarning =
                                    this.model.isShowWarning(results);
                                this.view.showWarning(isShowWarning);
                            }
                        },
                        this
                    )
                );
            }
        }

        /**
         * 提交后的跳转
         */
        CreativeForm.prototype.redirectAfterSubmit = function () {
            var targetURL = '/order/detail~id=' + this.model.get('orderId');
            this.redirect(targetURL);
        };
        /**
         * 取消后跳转
         */
        CreativeForm.prototype.redirectAfterCancel = 
            CreativeForm.prototype.redirectAfterSubmit;

        /**
        * 初始化交互行为
        *
        * @override
        */
        CreativeForm.prototype.initBehavior = function () {
            this.view.on('delete', u.bind(deleteCreative, this));
            this.view.on('savecreative', u.bind(saveCreative, this));
            FormAction.prototype.initBehavior.apply(this, arguments);
        };

        return CreativeForm;
    }
);