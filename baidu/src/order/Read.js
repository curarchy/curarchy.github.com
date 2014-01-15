/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file Direct只读Action
 * @author exodia(dengxinxin@baidu.com)
 * @date 13-11-29
 */
define(
    function (require) {
        var ReadAction = require('common/ReadAction');
        var util = require('er/util');
        var config = require('./config');

        /**
         * Direct只读 Action
         *
         * @constructor
         * @extends common/ReadAction
         */
        function DirectRead() {
            ReadAction.apply(this, arguments);
        }

        util.inherits(DirectRead, ReadAction);

        /**
         * 当前Action的分组名称
         *
         * @type {string}
         * @override
         */
        DirectRead.prototype.group = 'order';

        /**
         * 当前Action负责的实体的描述名称
         *
         * @type {string}
         * @override
         */
        DirectRead.prototype.entityDescription = config.description;

        /**
         * 视图类型
         *
         * @type {function}
         * @override
         */
        DirectRead.prototype.viewType = require('./ReadView');

        /**
         * 数据模型类型
         *
         * @type {function}
         * @override
         */
        DirectRead.prototype.modelType = require('./ReadModel');

        return DirectRead;
    }
);