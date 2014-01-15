/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 管理员只读页视图类
 * @author lixiang(lixiang05@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var ReadView = require('common/ReadView');
        var util = require('er/util');

        require('tpl!./tpl/read.tpl.html');
        require('tpl!./tpl/common.tpl.html');

        /**
         * 管理员表单视图类
         *
         * @constructor
         * @extends common/FormView
         */
        function ManagerReadView() {
            ReadView.apply(this, arguments);
        }

        util.inherits(ManagerReadView, ReadView);

        /** 
         * 使用的模板名称
         *
         * @type {string}
         */
        ManagerReadView.prototype.template = 'managerRead';

        /**
         * 初始化元素交互
         *
         * @override
         */
        ManagerReadView.prototype.enterDocument = function () {
            ReadView.prototype.enterDocument.apply(this, arguments);

            // 如果填写了高级设置，则展开高级设置
            if (this.model.hasNonEmptyValue('phone')
                || this.model.hasNonEmptyValue('mobile')
                || this.model.hasNonEmptyValue('description')
            ) {
                this.get('advance-config').set('expanded', true);
            }
        };

        return ManagerReadView;
    }
);
