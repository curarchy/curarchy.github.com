/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 内部订单表单视图类
 * @author wangyaqiong(catkin2009@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var FormView = require('common/FormView');
        var util = require('er/util');

        require('tpl!./tpl/houseAdForm.tpl.html');

        /**
         * 订单表单视图类
         *
         * @constructor
         * @extends common/FormView
         */
        function HouseAdFormView() {
            FormView.apply(this, arguments);
        }

        util.inherits(HouseAdFormView, FormView);

        /** 
         * 使用的模板名称
         *
         * @type {string}
         */
        HouseAdFormView.prototype.template = 'houseAdForm';

        /**
         * 从表单中获取实体数据
         *
         * @return {Object}
         */
        HouseAdFormView.prototype.getEntity = function () {
            var entity = FormView.prototype.getEntity.apply(this, arguments);
            entity.otherContactorId = '';
            if (entity.contact) {
                entity.otherContactorId = entity.contact.id;
            }
            delete entity.contact;
            var OrderType = require('./enum').Type;
            entity.type = OrderType.INTERNAL;
            return entity;
        };

        HouseAdFormView.prototype.showExtraInfo = function () {
            var extraInfoContainer = this.get('advance-config');
            extraInfoContainer.toggle();
        };

        /**
         * 渲染
         *
         * @override
         */
        HouseAdFormView.prototype.enterDocument = function () {
            FormView.prototype.enterDocument.apply(this, arguments);
            var model = this.model;
            var otherContactor = model.get('otherContactor');
            var otherContactorId = null;
            if (otherContactor) {
                otherContactorId = otherContactor.id;
            }
            var description = model.get('description');
            if (otherContactorId || description) {
                this.showExtraInfo();
            }
        };
        
        return HouseAdFormView;
    }
);