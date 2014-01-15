/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 广告位表单视图类
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var FormView = require('common/FormView');
        var util = require('er/util');
        var CproResult = require('union/enum').CproResult;
        var u = require('underscore');
        var PriceModel = require('./enum').PriceModel;

        require('tpl!./tpl/form.tpl.html');

        /**
         * 广告位表单视图类
         *
         * @constructor
         * @extends common/FormView
         */
        function SlotFormView() {
            FormView.apply(this, arguments);
        }

        util.inherits(SlotFormView, FormView);

        /** 
         * 使用的模板名称
         *
         * @type {string}
         */
        SlotFormView.prototype.template = 'slotForm';

        /**
         * 控件额外属性配置
         *
         * @type {Object}
         * @override
         */
        SlotFormView.prototype.uiProperties = {
            // TODO: 添加控件的额外属性配置，如没有则删除该属性
        };

        /**
         * 控件事件配置
         *
         * @type {Object}
         * @override
         */
        SlotFormView.prototype.uiEvents = {
            // 添加控件的事件配置
            'size-label-for-custom-size:click': 
                u.partial(sizeControlSwitcher, 'custom'),
            'size-label-for-normal-size:click': 
                u.partial(sizeControlSwitcher, 'normal'),
            'slot-price-model:change': switchRotation,
            'create-channel:click': createChannelInline,
            'slot-bdx-bind-account:click': bindUnion,
            'slot-bdx-config:click': function () {
                this.fire('jumptocprosetting');
            },
            'slot-bdx:change': toggleUnionWarpper
        };

        /**
         * 广告位尺寸控件模式切换主函数
         *
         */
        function toggleUnionWarpper() {
            var slotBDX = this.get('slot-bdx');
            var slotBDXConfig = this.get('slot-bdx-config');
            var slotBDXAllowDomainWarpper = 
                this.get('slot-bdx-allow-domain-warpper');

            if (slotBDX.isChecked()) {
                if (slotBDXConfig) {
                    slotBDXConfig.show();
                }
                if (slotBDXAllowDomainWarpper) {
                    slotBDXAllowDomainWarpper.show();
                }
            }
            else {
                if (slotBDXConfig) {
                    slotBDXConfig.hide();
                }
                if (slotBDXAllowDomainWarpper) {
                    slotBDXAllowDomainWarpper.hide();
                }
            }

        }

        /**
         * 广告位尺寸控件模式切换主函数
         *
         * @param {String} type 切换类型custom或normal
         *
         */
        function sizeControlSwitcher(type) {
            var normalSizeGroup = this.getGroup('normal-size');
            var customSizeGroup = this.getGroup('custom-size');
            var normalSize = this.get('slot-normal-size');
            var customSize = this.get('slot-custom-size');

            // 常用尺寸
            if (type === 'normal') {
                customSize.hide();
                customSizeGroup.disable();
                normalSizeGroup.enable();
                normalSize.show();
            }
            // 自定义尺寸
            if (type === 'custom') {
                normalSize.hide();
                normalSizeGroup.disable();
                customSizeGroup.enable();
                customSize.show();
            }
        }

        /**
         * 切换轮播设置
         *
         */
        function switchRotation() {
            var slotRotationMain = this.get('slot-rotation-main');
            var slotRotationNumber = this.get('slot-rotation-number');
            var slotRate = this.get('slot-rate');

            // 初始化轮播控件状态
            slotRotationMain.hide();
            slotRotationNumber.disable();

            // 根据售卖方式来控制轮播和刊例价控件的行为
            var priceModel = this.get('slot-price-model').getValue();

            // 刊例价单位显示
            var hint = [
                '元 / 天',
                '元 / 千次展现',
                '元 / 点击'
            ];
            slotRate.set('hint', hint[priceModel]);

            // 如果CPD模式
            if (priceModel === PriceModel.CPD.toString()) {
                // 展开轮播控件
                slotRotationNumber.enable();
                slotRotationMain.show();
            }
        }

        /**
         * 刷新所属公司选择控件
         *
         * @public
         */
        SlotFormView.prototype.refreshChannel = function (selected) {
            var channel = this.get('slot-channel');
            channel.set(
                'datasource', this.model.get('channels')
            );
            channel.setValue(selected);
        };

        /**
         * 表单内创建频道的处理句柄
         *
         */
        function createChannelInline(e) {
            var view = this;
            var options = { 
                url: '/channel/create',
                title: '新建频道' 
            };
            view.waitActionDialog(options).then(
                function (e) {
                    var dialog = e.target;
                    var dialogAction = dialog.get('action');
                    dialogAction.on(
                        'entitysave',
                        function (e) {
                            // 刷新当前页面数据
                            view.fire('reloadchannel', { channel: e.entity });
                        }
                    );
                }
            );
        }

        function restoreRawEntity(rawEntity) {
            var form = this.get('form');
            u.each(
                rawEntity,
                function (value, name) {
                    form.getInputControls(name)[0].setRawValue(value);
                },
                this
            );
        }

        /**
         * 刷新Union相关控件
         *
         * @public
         */
        SlotFormView.prototype.refreshUnion = function (selected) {
            var model = this.model;

            if (model.get('unionService')) {
                // 初始化Union相关控件
                this.get('slot-bdx-bind-account-warpper').hide();
                this.get('slot-bdx-allow-domain-warpper').hide();
                this.get('slot-bdx').setChecked(false);
                this.get('slot-bdx').disable();
                this.get('slot-bdx-allow-domain').hide();

                if (model.get('cproResult') === CproResult.UNBOUND
                    || model.get('cproResult') === CproResult.ABNORMAL
                ) {
                    this.get('slot-bdx-bind-account-warpper').show();
                }
                else {
                    this.get('slot-bdx').setChecked(true);
                    this.get('slot-bdx').enable();
                    this.get('slot-bdx-allow-domain-warpper').show();
                    this.get('slot-bdx-allow-domain').show();
                }
            }
            else {
                this.get('slot-bdx').disable();
            }
        };

        /**
         * 开通网盟的处理句柄
         *
         */
        function bindUnion(e) {
            var view = this;
            var options = {
                url: '/setting/bindUnion',
                title: '开通百度流量交易服务'
            };
            view.waitActionDialog(options).then(
                function (e) {
                    var dialog = e.target;
                    var dialogAction = dialog.get('action');
                    dialogAction.on(
                        'entitysave',
                        function (e) {
                            // 刷新当前页面数据
                            view.fire('reloadunion', { channel: e.entity });
                        }
                    );
                }
            );
        }

        /**
         * 渲染
         *
         * @override
         */
        SlotFormView.prototype.enterDocument = function () {
            FormView.prototype.enterDocument.apply(this, arguments);

            var model = this.model;

            this.refreshUnion();

            if (model.get('formType') === 'update') {
                // 轮播设定
                switchRotation.call(this);

                // 补余设置
                if (this.model.get('allowRest') === 1) {
                    this.get('slot-bdx').setChecked(true);
                }
                else {
                    this.get('slot-bdx').setChecked(false);
                }

                var rawEntity = model.get('editingState');
                if (rawEntity) {
                    restoreRawEntity.call(this, rawEntity);
                }
            }
        };

        /**
         * 从表单中获取实体数据
         *
         * @return {Object}
         */
        SlotFormView.prototype.getEntity = function () {
            var entity = FormView.prototype.getEntity.apply(this, arguments);

            // 新建时处理尺寸数据
            if (this.model.get('formType') === 'create') {
                if (this.get('slot-normal-size').isHidden()) {
                    entity.sizeType = 1;
                    entity.width = parseInt(entity.customSizeWidth, 10);
                    entity.height = parseInt(entity.customSizeHeight, 10);
                    delete entity.customSizeWidth;
                    delete entity.customSizeHeight;
                }
                else {
                    entity.sizeType = 0;
                    var size = entity.normalSize;
                    // ToggleSelector提交的是选项对象，真正有用的是其中的name字段
                    if (size) {
                        size = size.name;
                        size = size.split('*');
                        entity.width = parseInt(size[0], 10);
                        entity.height = parseInt(size[1], 10);
                        delete entity.normalSize;
                    }
                }
            }
            // 处理频道数据
            // ToggleSelector提交的是选项对象，真正有用的是其中的id字段
            var channelId = entity.slotChannel.id;
            entity.channelId = channelId;
            delete entity.slotChannel;

            // 处理显示顺序为数字
            entity.displayOrder = parseInt(entity.displayOrder, 10);

            // 处理计费方式数据，数组-->数字
            entity.priceModel = parseInt(entity.priceModel[0], 10);

            // 处理轮播数逻辑
            if (entity.priceModel === PriceModel.CPD) {
                entity.inturnNum = parseInt(entity.inturnNum, 10);
            }

            // 处理刊例价和折扣率为数字类型
            var rateNumber = parseInt(entity.rate, 10);
            entity.rate = rateNumber >= 0 ? rateNumber : null;
            var discontNumber = parseFloat(entity.discount);
            entity.discount = discontNumber >= 0 ? discontNumber : null;

            
            // 处理空闲时补余为number
            entity.allowRest = this.get('slot-bdx').isChecked() ? 1 : 0;

            // 处理空闲占位数据，数组-->0/1
            entity.fixPosition = parseInt(entity.fixPosition[0], 10);

            return entity;
        };

        SlotFormView.prototype.getRawEntity = function () {
            return this.get('form').getData();
        };
        
        return SlotFormView;
    }
);