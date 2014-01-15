/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file Delivery只读Action
 * @author exodia(dengxinxin@baidu.com), liyidong(srhb18@gmail.com)
 * @date 13-11-30
 */
define(
    function (require) {
        var ReadAction = require('common/ReadAction');
        var util = require('er/util');
        var config = require('./config');

        /**
         * DeliveryRead表单
         *
         * @constructor
         * @extends common/ReadAction
         */
        function DeliveryRead() {
            ReadAction.apply(this, arguments);
        }

        util.inherits(DeliveryRead, ReadAction);

        /**
         * 当前Action的分组名称
         *
         * @type {string}
         * @override
         */
            // TODO: 必须设置这个值，选择`slot | order | setting | report`
        DeliveryRead.prototype.group = 'order';

        /**
         * 当前Action负责的实体的描述名称
         *
         * @type {string}
         * @override
         */
        DeliveryRead.prototype.entityDescription = config.description;

        /**
         * 视图类型
         *
         * @type {function}
         * @override
         */
        DeliveryRead.prototype.viewType = require('./ReadView');

        /**
         * 数据模型类型
         *
         * @type {function}
         * @override
         */
        DeliveryRead.prototype.modelType = require('./ReadModel');

        return DeliveryRead;
    }
);
