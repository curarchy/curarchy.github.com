/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 联系人只读Action
 * @author lixiang(lixiang05@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var ReadAction = require('common/ReadAction');
        var util = require('er/util');
        var config = require('./config');

        /**
         * 频道表单
         *
         * @constructor
         * @extends common/ReadAction
         */
        function ContactRead() {
            ReadAction.apply(this, arguments);
        }
        
        util.inherits(ContactRead, ReadAction);

        /**
         * 当前Action的分组名称
         *
         * @type {string}
         * @override
         */
        ContactRead.prototype.group = 'setting';

        /**
         * 当前Action负责的实体的描述名称
         *
         * @type {string}
         * @override
         */
        ContactRead.prototype.entityDescription = config.description;

        /**
         * 视图类型
         *
         * @type {function}
         * @override
         */
        ContactRead.prototype.viewType = require('./ReadView');

        /**
         * 数据模型类型
         *
         * @type {function}
         * @override
         */
        ContactRead.prototype.modelType = require('./ReadModel');

        return ContactRead;
    }
);
