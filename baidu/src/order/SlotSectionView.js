/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 订单表单广告位资源区块视图
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var u = require('underscore');
        var util = require('er/util');
        var BaseView = require('common/BaseView');

        require('tpl!./tpl/slotSection.tpl.html');
        require('./ui/SlotLine');

        /**
         * 订单表单广告位资源区块视图
         *
         * @extends common.BaseView
         * @constructor
         */
        function SlotSectionView() {
            BaseView.apply(this, arguments);
        }

        util.inherits(SlotSectionView, BaseView);

        SlotSectionView.prototype.template = 'slotSection';

        /**
         * 弹出对话框供用户选择广告位
         *
         * @ignore
         */
        function selectSlots() {
            if (!this.model.get('canAddSlot')) {
                this.alert('一个订单最多只能有100个广告', '广告数量已达上限');
                return;
            }

            var properties = {
                url: '/slot/select',
                title: '添加广告位',
                width: 860
            };
            var loading = this.waitActionDialog(properties);
            loading.then(u.bind(receiveSlotSelector, this));
        }

        function receiveSlotSelector(e) {
            e.target.on(
                'action@select',
                function (e) {
                    var slots = e.target.get('action').getSelectedSlots();
                    this.fire('addslots', { slots: slots });
                    e.target.dispose();
                },
                this
            );
            e.target.on(
                'action@cancel',
                u.bind(e.target.destroy, e.target)
            );
        }

        SlotSectionView.prototype.uiEvents = {
            'add:click': selectSlots
        };

        SlotSectionView.prototype.addSlots = function (slots) {
            if (!slots.length) {
                return;
            }

            this.get('panel').removeState('empty');
            this.get('title').setText('广告位资源');
            u.each(
                slots,
                function (slot) {
                    var slotLine = this.get('slot-' + slot.id);
                    if (slotLine) {
                        slotLine.addDelivery({});
                    }
                    else {
                        var slotLine = this.create(
                            'SlotLine',
                            {
                                id: 'slot-' + slot.id,
                                group: 'slot',
                                rawValue: slot
                            }
                        );
                        slotLine.insertBefore(this.get('summary'));

                        slotLine.on('change', this.syncSummary, this);
                        slotLine.on('afterdispose', this.syncSummary, this);
                    }
                },
                this
            );

            this.syncSummary();
        };

        SlotSectionView.prototype.getSlots = function () {
            var lines = this.getGroup('slot');
            // 因为`ControlGroup`是 **live** 的，在获取后控件可能销毁，
            // 比如由于移除广告行，导致广告位行销毁，同时触发`change`事件，
            // 此时要过滤掉那些不对头的
            //
            // 这源于`ControlGroup`的移除实现有问题，只用了`delete`没修正后面的
            // TODO: 等`ControlGroup`修复后这里可以更新
            return u.chain(lines)
                .compact()
                .invoke('getRawValue')
                .value();
        };

        /**
         * 同步统计信息
         */
        SlotSectionView.prototype.syncSummary = function () {
            var summary = {
                cpd: 0, cpm: 0, cpc: 0, price: 0
            };
            var PriceModel = require('delivery/enum').PriceModel;
            var deliveryUtil = require('delivery/util');

            var deliveries = u.chain(this.getGroup('slot'))
                .compact()
                .invoke('getDeliveries')
                .flatten()
                .value();

            u.each(
                deliveries,
                function (delivery) {
                    // 如果是CPD且没有结束时间，根本不算在里面
                    if (!deliveryUtil.hasValidAmount(delivery)) {
                        return;
                    }

                    summary.price += delivery.totalPrice;

                    var priceModel = 
                        PriceModel[delivery.priceModel].toLowerCase();
                    summary[priceModel] += delivery.amount;
                }
            );

            if (!isNaN(summary.price)) {
                summary.price = summary.price.toFixed(2);
            }

            u.each(
                ['price', 'cpd', 'cpm', 'cpc'],
                function (name) {
                    var value = summary[name];
                    var text = isNaN(value) ? '--' : value + '';

                    if (name === 'price' && !isNaN(value)) {
                        text = '￥' + text;
                    }

                    var label = this.get('total-' + name);
                    if (label) {
                        label.setText(text);
                    }
                },
                this
            );

            if (!deliveries.length) {
                var panel = this.get('panel');
                panel && panel.addState('empty');
                var title = this.get('title');
                title && title.setText('广告位选择');
            }
        };

        SlotSectionView.prototype.validate = function () {
            if (!this.getGroup('slot').length) {
                var Validity = require('esui/validator/Validity');
                var ValidityState = require('esui/validator/ValidityState');
                var validity = new Validity();
                var state = new ValidityState(false, '请选择广告位资源');
                validity.addState('required', state);
                this.get('validity-label').set('validity', validity);
                return false;
            }

            return u.reduce(
                this.getGroup('slot'),
                function (isValid, slotLine) {
                    var result = slotLine.validate();
                    isValid = isValid && result;
                    return isValid;
                },
                true
            );
        };

        /**
         * 创建广告行的索引与对应的广告位行之间的关系
         *
         * 该方法创建一个数组，数组中每一项有以下属性：
         *
         * - `{number} index`：广告行在该广告位行下的索引
         * - `{SlotLine} slotLine`：广告位行控件
         *
         * 数组本身的索引即是广告行在全部广告中的索引
         *
         * @return {Object[]}
         */
        function buildDeliveryIndex() {
            var result = [];
            u.each(
                this.getGroup('slot'),
                function (slotLine) {
                    u.each(
                        slotLine.getRawValue().deliveries,
                        function (delivery, i) {
                            // 无权限的那些是不会发送出去的，后端返回索引也不算在内，
                            // 所以这里也不能加进来，不然就错位了
                            if (delivery.id && !delivery.authority) {
                                return;
                            }

                            var context = {
                                slotLine: slotLine,
                                index: i++
                            };
                            result.push(context);
                        }
                    );
                }
            );

            return result;
        }

        SlotSectionView.prototype.notifyErrors = function (errors) {
            var deliveryIndex = buildDeliveryIndex.call(this);

            u.each(
                errors,
                function (error) {
                    var context = deliveryIndex[error.index];
                    context.slotLine.showErrorAt(context.index, error);
                }
            );
        };

        SlotSectionView.prototype.showGlobalError = function (error) {
            var Validity = require('esui/validator/Validity');
            var ValidityState = require('esui/validator/ValidityState');
            var validity = new Validity();
            var state = new ValidityState(false, error.message);
            validity.addState('server', state);
            this.get('validity-label').set('validity', validity);
        };

        return SlotSectionView;
    }
);        
