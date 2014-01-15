/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file SlotLine控件
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var u = require('underscore');
        var lib = require('esui/lib');
        var helper = require('esui/controlHelper');
        var ui = require('esui');
        var InputControl = require('esui/InputControl');

        require('./DeliveryLine');

        /**
         * SlotLine控件
         *
         * @param {Object=} options 初始化参数
         * @extends esui/InputControl
         * @constructor
         */
        function SlotLine(options) {
            InputControl.apply(this, arguments);
        }

        SlotLine.prototype.type = 'SlotLine';

        /**
         * 创建主元素
         *
         * @return {HTMLElement}
         * @override
         * @protected
         */
        SlotLine.prototype.createMain = function () {
            return document.createElement('div');
        };

        /**
         * 初始化参数
         *
         * @param {Object=} options 构造函数传入的参数
         * @override
         * @protected
         */
        SlotLine.prototype.initOptions = function (options) {
            var properties = {
                mode: 'edit',
                rawValue: {}
            };
            lib.extend(properties, options);
            this.setProperties(properties);
        };

        /**
         * 初始化DOM结构
         *
         * @override
         * @protected
         */
        SlotLine.prototype.initStructure = function () {
            var contentClassName = this.helper.getPartClassName('content');
            var removePart = [
                this.helper.getPartBeginTag('operation', 'div'),
                    this.helper.getPartBeginTag('remove', 'span'),
                        '移除',
                    this.helper.getPartEndTag('remove', 'span'),
                this.helper.getPartEndTag('operation', 'div')
            ];
            var html = [
                '<table class="' + contentClassName + '" '
                    + 'cellpadding="0" cellspacing="0">',
                    '<tbody>',
                        '<tr>',
                            '<td>',
                                this.helper.getPartHTML('name', 'div'),
                            '</td>',
                            '<td>',
                                this.helper.getPartHTML('status', 'div'),
                            '</td>',
                            '<td>',
                                this.helper.getPartHTML('size', 'div'),
                            '</td>',
                            '<td>',
                                // 下面7列只是为了和广告行的对齐
                                this.helper.getPartHTML('price-model', 'div'),
                            '</td>',
                            '<td>',
                                this.helper.getPartHTML('group', 'div'),
                            '</td>',
                            '<td>',
                                this.helper.getPartHTML('amount', 'div'),
                            '</td>',
                            '<td>',
                                this.helper.getPartHTML('discount', 'div'),
                            '</td>',
                            '<td>',
                                this.helper.getPartHTML('price', 'div'),
                            '</td>',
                            '<td>',
                                this.helper.getPartHTML('total', 'div'),
                            '</td>',
                            '<td>',
                                this.helper.getPartHTML('date', 'div'),
                            '</td>',
                            '<td>',
                                removePart.join(''),
                            '</td>',
                        '</tr>',
                    '</tbody>',
                '</table>',
                this.helper.getPartHTML('deliveries', 'div')
            ];
            this.main.innerHTML = html.join('');

            this.helper.addDOMEvent(
                'remove',
                'click',
                function () {
                    var removableDeliveryLines = u.filter(
                        this.children,
                        function (deliveryLine) {
                            return !deliveryLine.getRawValue().id;
                        }
                    );
                    u.invoke(removableDeliveryLines, 'destroy');

                    if (removableDeliveryLines.length) {
                        this.fire('change');
                    }

                    checkDeliveryLines.call(this);
                }
            );
        };

        /**
         * 渲染自身
         *
         * @override
         * @protected
         */
        SlotLine.prototype.repaint = helper.createRepaint(
            InputControl.prototype.repaint,
            {
                name: 'rawValue',
                paint: function (line, rawValue) {
                    var nameField = line.helper.getPart('name');
                    var name = lib.encodeHTML(rawValue.name);
                    nameField.innerHTML = 
                        '<span title="' + name + '">' + name + '</span>';

                    var statusField = line.helper.getPart('status');
                    var Status = require('common/enum').Status;
                    statusField.innerHTML = 
                        Status.getTextFromValue(rawValue.status);

                    var sizeField = line.helper.getPart('size');
                    var size = rawValue.width + '*' + rawValue.height;
                    sizeField.innerHTML = size;

                    line.clearDeliviries();
                    // 已经挂上的广告是只读状态的
                    u.each(
                        rawValue.deliveries,
                        function (delivery) {
                            // 有了`id`的广告是只读的
                            var mode = delivery.id ? 'read' : 'edit';
                            this.addDelivery(delivery, { mode: mode });
                        },
                        line
                    );
                }
            }
        );

        /**
         * 清空广告行，但不删掉自己
         */
        SlotLine.prototype.clearDeliviries = function () {
            this.helper.disposeChildren();
            this.helper.getPart('deliveries').innerHTML = '';
        };

        function checkDeliveryLines(e) {
            if (e && e.type === 'remove') {
                this.removeChild(e.target);
                this.fire('change');
            }

            if (!this.children.length) {
                this.destroy();
                return;
            }

            // 只有新增的（没有`id`属性）的才能移除
            var canRemove = u.any(
                this.children,
                function (deliveryLine) {
                    return !deliveryLine.getRawValue().id;
                }
            );
            if (canRemove) {
                this.helper.removePartClasses('remove-hidden', 'remove');
            }
            else {
                this.helper.addPartClasses('remove-hidden', 'remove');
            }
        }

        /**
         * 添加一个广告行
         *
         * @param {Object} delivery 广告信息
         * @param {Object} [options] 广告行控件的相关配置
         */
        SlotLine.prototype.addDelivery = function (delivery, options) {
            u.defaults(
                delivery,
                {
                    slot: this.rawValue,
                    minDiscount: this.rawValue.discount,
                    rate: this.rawValue.rate
                }
            );
            if (!delivery.slot) {
                delivery.slot = this.rawValue;
            }

            options = u.extend(
                { viewContext: this.viewContext, rawValue: delivery },
                options
            );
            var deliveryLine = ui.create('DeliveryLine', options);
            this.addChild(deliveryLine);

            var container = this.helper.getPart('deliveries');
            deliveryLine.appendTo(container);

            var delegate = require('mini-event').delegate;
            delegate(deliveryLine, 'amountchange', this, 'change');
            delegate(deliveryLine, 'discountchange', this, 'change');
            delegate(deliveryLine, 'pricemodelchange', this, 'change');
            delegate(deliveryLine, 'timechange', this, 'change');

            deliveryLine.on('remove', checkDeliveryLines, this);
            checkDeliveryLines.call(this);
        };

        SlotLine.prototype.getRawValue = function () {
            var rawValue = u.clone(this.rawValue);
            rawValue.deliveries = u.map(
                this.children,
                function (deliveryLine) {
                    return deliveryLine.getRawValue();
                }
            );
            return rawValue;
        };

        SlotLine.prototype.getDeliveries = function () {
            var deliveryUtil = require('delivery/util');

            return u.map(
                this.children,
                function (deliveryLine) {
                    var delivery = deliveryLine.getRawValue();
                    delivery.slot = this.rawValue;
                    delivery.price = delivery.slot.rate;
                    delivery.totalPrice = deliveryUtil.getTotalPrice(delivery);
                    return delivery;
                },
                this
            );
        };

        SlotLine.prototype.checkValidity = function () {
            return u.reduce(
                this.children,
                function (isValid, deliveryLine) {
                    var result = deliveryLine.checkValidity();
                    isValid &= result;
                    return isValid;
                },
                true
            );
        };

        SlotLine.prototype.validate = function () {
            return u.reduce(
                this.children,
                function (isValid, deliveryLine) {
                    var result = deliveryLine.validate();
                    isValid = isValid && result;
                    return isValid;
                },
                true
            );
        };

        /**
         * 在指定的广告行显示错误
         *
         * @param {number} index 广告行的索引
         * @param {Object} error 错误信息
         * @param {string} error.field 错误的字段
         * @param {string} error.message 错误信息
         */
        SlotLine.prototype.showErrorAt = function (index, error) {
            var deliveryLine = this.children[index];
            deliveryLine.showCustomError(error);
        };

        lib.inherits(SlotLine, InputControl);
        require('esui').register(SlotLine);
        return SlotLine;
    }
);
