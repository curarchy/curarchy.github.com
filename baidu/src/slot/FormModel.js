/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 广告位表单数据模型类
 * @author liyidong(undefined)
 * @date $DATE$
 */
define(
    function (require) {
        var FormModel = require('common/FormModel');
        var Data = require('./Data');
        var ChannelData = require('channel/Data');
        var UnionData = require('common/global/UnionData');
        var util = require('er/util');
        var config = require('./config');
        var u = require('underscore');
        var CproResult = require('union/enum').CproResult;
        var PriceModel = require('./enum').PriceModel;

        function SlotFormModel() {
            FormModel.apply(this, arguments);
            this.data = new Data();
            this.channelData = new ChannelData();
            this.unionData = new UnionData();
        }

        util.inherits(SlotFormModel, FormModel);

        /**
         * 数据源配置
         *
         * @type {Object}
         * @override
         */
        SlotFormModel.prototype.datasource = [
            {
                channels: function (model) {
                    return model.loadChannels();
                },
                sizes: function (model) {
                    // 编辑的时候不能修改尺寸，所以不需要尺寸数据
                    if (model.get('formType') === 'create') {
                        return model.loadSizes();
                    }
                },
                isSubUser: function (model) {
                    return require('common/global/user').isSubUser();
                },
                union: function (model) {
                    // 注意：此处取出来的数据是不正确的，需要经过prepareUnion处理
                    return model.unionData.requestUnionInfo();
                        //.then(function () { return unionModel.valueOf(); });
                }
            },
            {
                crumbPath: function (model) {
                    var path = [];

                    if (model.get('channelGroupId')) {
                        var channelGroupNode = {
                            text: model.get('channelGroupName'),
                            href: '#/channelGroup/detail~id='
                                + model.get('channelGroupId')
                        };
                        path.push(channelGroupNode);
                    }

                    if (model.get('channelId')) {
                        var channelNode = {
                            text: model.get('channelName'),
                            href: '#/channel/detail~id='
                                + model.get('channelId')
                        };
                        path.push(channelNode);
                    }

                    // 如果没有频道分组和频道，就显示“所有广告位”，否则显示“所有频道”
                    if (path.length) {
                        var allChannelNode = {
                            text: '所有频道',
                            href: '#/slot/all'
                        };
                        path.unshift(allChannelNode);
                    }
                    else {
                        var allSlotNode = {
                            text: '所有广告位',
                            href: '#/slot/all'
                        };
                        path.unshift(allSlotNode);
                    }

                    // 最后一个节点
                    path.push({ text: model.get('title') });

                    return path;
                }
            }
        ];

        /**
         * 获取频道列表
         *
         * @return {er/Promise}
         */
        SlotFormModel.prototype.loadUnion = function () {
            var model = this;
            return model.unionData.requestUnionInfo()
                .then(
                    function () { 
                        model.prepareUnionModel();
                    }
                );
        };
        

        /**
         * 获取频道列表
         *
         * @return {er/Promise}
         */
        SlotFormModel.prototype.loadChannels = function () {
            var query = {
                status: 1,
                withDefault: 1
            };

            return this.channelData.list(query)
                .then(
                    function (response) {
                        return response.results || [];
                    }
                );
        };

        /**
         * 获取尺寸列表
         *
         * @return {er/Promise}
         */
        SlotFormModel.prototype.loadSizes = function () {
            var system = require('common/global/system');
            var normalSizes = system.adPositionSize;
            return normalSizes;
        };

        /**
         * 获取当前用户的默认频道ID
         *
         * @return {Number}
         */
        function getDefaultChannelId() {
            return +require('common/global/user').getDefaultChannel().value;
        }

        /**
         * 对数据源进行预处理
         */
        SlotFormModel.prototype.prepareUnionModel = function () {
            var unionData = this.unionData;
            // 用最新版本的Union数据覆盖第一次加载时的Union数据
            this.set('union', unionData.dataCache);
            this.set('unionService', unionData.getUnionService());
            // 处理Union相关数据，所有Union处理必须先判断解耦开关状态
            if (unionData.getUnionService()) {
                // 获取并显示可投放域名
                var allowDomains = unionData.getAllowDomain();
                // 1、如果可投放域名大于三个，只显示前三个，然后显示查看链接；
                // 2、如果可投放域名小于等于三个，全部显示，并显示查看链接；
                // 3、如果没有可投放域名，仅显示查看链接
                if (allowDomains) {
                    if (allowDomains.length > 3) {
                        allowDomains = u.first(allowDomains, 3);
                    }
                    var allowDomain = allowDomains.join(', ');
                    this.set('allowDomain', allowDomain);
                }
                var allowDomainUrl = unionData.getAllowDomainViewURL();
                this.set('allowDomainUrl', allowDomainUrl);

                // 修改网盟样式的链接
                if (this.get('restId') !== null) {
                    this.set(
                        'cproSettingURL', 
                        '/union/cproSetting'
                            + '~id=' + this.get('restId')
                            + '&slotId=' + this.get('id')
                    );
                }

                // 判断是否显示修改网盟样式链接
                var hasCproSetting = this.get('formType') === 'update'
                    && unionData.getCproResult() !== CproResult.UNBOUND
                    && this.get('allowRest') === 1;
                this.set('hasCproSetting', hasCproSetting);

                // Union账号绑定状态
                var cproResult = unionData.getCproResult();
                this.set('cproResult', cproResult);
            }
        };

        /**
         * 对数据源进行预处理
         */
        SlotFormModel.prototype.prepare = function () {
            this.prepareUnionModel();

            if (this.get('formType') === 'create') {
                // 新建时，所属频道控件默认选中默认频道,
                // 如果URL有频道ID传入，则设置好频道默认值
                if (!this.get('channelId')) {
                    this.set('channelId', getDefaultChannelId());
                }
                

                // 给定显示顺序和默认轮播数的默认值
                this.set('displayOrder', '100');
                this.set('inturnNum', 1);

                this.set('priceModel', '1');

                // 允许出现批量创建链接
                this.set('hasBatchLink', true);

                // 转换一下sizes的数据结构，要有id和name
                var sizes = u.map(
                    this.get('sizes'),
                    function (item) {
                        return {
                            id: item.value,
                            name: item.text
                        };
                    }
                );
                this.set('sizes', sizes);


            }
            else if (this.get('formType') === 'update') {
                // 如果满足以下全部条件：
                // 
                // - 从网盟样式设置页跳回来
                // - 设置页设置的`id`和当前修改的`id`相同
                // - 有临时保存的编辑数据
                // 
                // 则认为是需要恢复临时编辑的数据的
                var referrer = this.get('referrer') + '';
                if (referrer === this.get('cproSettingURL')) {
                    var session = require('common/global/session');
                    var editingSlot = session.get('editingSlot');
                    if (editingSlot) {
                        this.set('editingState', editingSlot);
                    }
                }

                // 编辑时，如果填过轮播数，则配置rotationFlag
                if (this.get('priceModel') === PriceModel.CPD
                    && this.get('inturnNum') !== 0
                ) {
                    this.set('rotationFlag', 1);
                }
                // 否则，给个默认值
                else {
                    this.set('inturnNum', 1);
                }

                // 编辑时对所有BoxGroup数据进行适配
                this.set('priceModel', this.get('priceModel').toString());
                this.set('fixPosition', this.get('fixPosition').toString());
            }
        };

        /**
         * 检验实体有效性
         *
         * @param {Object} entity 提交的实体
         * @return {Object[] | true} 返回`true`表示验证通过，否则返回错误字体
         */
        SlotFormModel.prototype.validateEntity = function (entity) {
            var errorMsg = [];

            // 普通尺寸验证逻辑
            if (entity.hasOwnProperty('normalSize')) { 
                errorMsg.push(
                    { 
                        field: 'normalSize',
                        message: '请选择一个广告位尺寸' 
                    }
                );
            }

            if (errorMsg.length > 0) {
                return errorMsg;
            }
            else {
                return true;
            }
        };

        /**
         * 判断实体是否有变化
         *
         * @param {Object} entity 新的实体
         * @return {boolean}
         * @overide
         */
        SlotFormModel.prototype.isEntityChanged = function (entity) {
            // 如果是新建的话，要先建立一个空的original
            // 编辑时则以后端取回的数据为准
            var emptyEntity = {
                id: undefined,
                name: '',
                displayOrder: 100,
                platform: 0,
                channelId: getDefaultChannelId(),
                description: '',
                priceModel: 0,
                inturnNum: '1',
                rate: null,
                discount: null,
                allowRest: 1,
                fixPosition: 1
            };
            var original = this.get('formType') === 'create'
                ? emptyEntity
                : u.clone(this.get('entity'));
            // 补上`id`、`platform`
            // 所有original字段的操作之前要加判断，下同
            if (original) {
                entity.id = original.id;
                entity.platform = original.platform;
            }

            // 新建模式下的数据修正
            if (this.get('formType') === 'create') {
                // 如果尺寸控件为常规状态并且未选择
                if (entity.sizeType === 0
                    && entity.hasOwnProperty('normalSize')
                ) {
                    // 删掉提交上来的normalSize字段
                    delete entity.normalSize;
                }
                // 如果尺寸控件为自定义状态且均未填入数据
                else if (entity.sizeType === 1
                    && isNaN(entity.width)
                    && isNaN(entity.height)
                ) {
                    // 删掉提交上来的width和height字段
                    delete entity.width;
                    delete entity.height;
                }

                // 去掉sizeType属性
                delete entity.sizeType;
            }

            // 编辑模式下的数据修正
            if (this.get('formType') === 'update') {
                // 补上宽高
                entity.width = original.width;
                entity.height = original.height;

                // 去掉sizeType属性
                delete original.sizeType;
            }
            var entityExtend = {};
            u.extend(entityExtend, original, entity);
            return !u.isEqual(entityExtend, original);
        };

        /**
         * 临时保存实体信息
         *
         * @param {Object} entity 实体
         */
        SlotFormModel.prototype.saveEntityState = function (entity) {
            var session = require('common/global/session');
            session.once('editingSlot', entity);
        };

        var ajax = require('er/ajax');
        u.each(
            config.requests,
            function (config) {
                ajax.register(SlotFormModel, config.name, config);
            }
        );

        /**
         * 检查实体数据完整性，可在此补充一些视图无法提供的属性
         *
         * @param {Object} entity 实体数据
         * @return {Object} 补充完整的实体数据
         */
        SlotFormModel.prototype.fillEntity = function (entity) {
            entity.platform = 0;
            return entity;
        };

        return SlotFormModel;
    }
);