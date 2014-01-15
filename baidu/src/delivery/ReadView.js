/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file Delivery只读视图类
 * @author exodia(dengxinxin@baidu.com), liyidong(srhb18@gmail.com)
 * @date 13-11-30
 */
define(
    function (require) {
        var ReadView = require('common/ReadView');
        var util = require('er/util');

        require('tpl!./tpl/read.tpl.html');

        /**
         * Delivery表单视图类
         *
         * @constructor
         * @extends common/ReadView
         */
        function DeliveryReadView() {
            ReadView.apply(this, arguments);
        }

        util.inherits(DeliveryReadView, ReadView);


        /**
         * 使用的模板名称
         *
         * @type {string}
         */
        DeliveryReadView.prototype.template = 'deliveryRead';

        DeliveryReadView.prototype.enterDocument = function () {
            ReadView.prototype.enterDocument.apply(this, arguments);
            if (this.model.get('otherOrientsExpanded')) {
                this.get('other-locate-panel').toggle();
            }
            
        };

        return DeliveryReadView;
    }
);
