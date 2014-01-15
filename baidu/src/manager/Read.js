/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 管理员只读页Action
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
         * @extends common/FormAction
         */
        function ManagerRead() {
            ReadAction.apply(this, arguments);
        }

        util.inherits(ManagerRead, ReadAction);

        /**
         * 当前Action的分组名称
         *
         * @type {string}
         * @override
         */
        ManagerRead.prototype.group = 'setting';

        /**
         * 当前Action负责的实体的描述名称
         *
         * @type {string}
         * @override
         */
        ManagerRead.prototype.entityDescription = config.description;

        
        /**
         * 视图类型
         *
         * @type {function}
         * @override
         */
        ManagerRead.prototype.viewType = require('./ReadView');

        /**
         * 数据模型类型
         *
         * @type {function}
         * @override
         */
        ManagerRead.prototype.modelType = require('./ReadModel');

        return ManagerRead;
    }
);
