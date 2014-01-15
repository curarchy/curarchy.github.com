/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 频道组只读Action
 * @author lixiang(lixiang05@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var ReadAction = require('common/ReadAction');
        var util = require('er/util');
        var config = require('./config');

        /**
         * 频道组只读
         *
         * @constructor
         * @extends common/FormAction
         */
        function ChannelGroupRead() {
            ReadAction.apply(this, arguments);
        }

        util.inherits(ChannelGroupRead, ReadAction);

        /**
         * 当前Action的分组名称
         *
         * @type {string}
         * @override
         */
        ChannelGroupRead.prototype.group = 'setting';
        
        /**
         * 当前Action负责的实体的描述名称
         *
         * @type {string}
         * @override
         */
        ChannelGroupRead.prototype.entityDescription = config.description;

        /**
         * 视图类型
         *
         * @type {function}
         * @override
         */
        ChannelGroupRead.prototype.viewType = require('./ReadView');

        /**
         * 数据模型类型
         *
         * @type {function}
         * @override
         */
        ChannelGroupRead.prototype.modelType = require('./ReadModel');

        return ChannelGroupRead;
    }
);
