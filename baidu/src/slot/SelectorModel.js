/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 广告位选择数据模型类
 * @author lixiang(lixiang05@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var BaseModel = require('common/BaseModel');
        var Data = require('./Data');
        var util = require('er/util');
        var u = require('underscore');


        function SelectorModel() {
            BaseModel.apply(this, arguments);
            this.data = new Data();
        }

        util.inherits(SelectorModel, BaseModel);
        
        var sizes = [{ text: '全部尺寸', value: '' }];

        SelectorModel.prototype.datasource = {
            filter: [
                {
                    size: function (model) {
                        var height = model.get('height');
                        // 如果参数里包含尺寸，则广告位选择表格里无需筛选
                        if (height != null) {
                            return null;
                        }
                        return model.getSlotSizes();
                    }
                },
                {
                    slotsFilter: function (model) {
                        var filters = [];
                        var size = model.get('size');
                        if (size) {
                            filters.push(
                                {
                                    key: 'size',
                                    datasource: size
                                }
                            );
                        }
                        return filters;
                    }
                }
            ],
            channels: function (model) {
                return model.getChannels();
            }
        };

        /**
         * 获取广告位所有尺寸列表数据
         *
         * @return {er/Promise}
         */
        SelectorModel.prototype.getSlotSizes = function () {
            var loadingSizes = this.data.size();
            return loadingSizes.then(function (response) {
                var allSizes = response.results || [];
                var allSizeValues = u.map(allSizes, function (item) {
                    var sizeText = item.width + '*' + item.height;
                    return {
                        text: sizeText,
                        value: sizeText
                    };
                });

                return sizes.concat(allSizeValues);
            });
        };

        /**
         * 获取频道树数据
         *
         * @return {er/Promise}
         */
        SelectorModel.prototype.getChannels = function () {
            var ChannelGroupData = require('channelGroup/Data');
            var channelGroupData = new ChannelGroupData();
            var loadingChannels = channelGroupData.tree();
            return loadingChannels.then(u.bind(buildTree, this));
        };


        /**
         * 构建树可以使用的频道数据
         *
         * @param {Object} response 后端返回数据
         */
        function buildTree(response) {
            var build = require('common/biz/buildChannelGroupTree');
            var options = {
                groupOrders: [
                    'defaultChannel', 'channelGroups', 
                    'channelsWithoutGroup'
                ],
                channelIsLeaf: true,
                ignoreEmpty: true
            };
            var datasource = build(response.results, options);
            return datasource;
        }


        /**
         * 取消广告位选择
         *
         * @param {Array} slots 要删除的广告位集合
         * @inner
         */
        SelectorModel.prototype.deleteSlots = function (slots) {
            var selectedSlots = this.get('selectedSlots');
            if (!selectedSlots) {
                return;
            }
            var deletedSlotsMap = u.toMap(slots, 'id');
            var newSelectedSlots = u.filter(selectedSlots, function (slot) {
                return !deletedSlotsMap[slot.id];
            });
            this.set('selectedSlots', newSelectedSlots);

            buildSlotTree(this);
        };

        /**
         * 添加广告位
         *
         * @param {Array} slots 要添加的广告位集合
         * @inner
         */
        SelectorModel.prototype.addSlots = function (slots) {
            var selectedSlots = this.get('selectedSlots');
            if (!selectedSlots) {
                selectedSlots = [];
            }
            selectedSlots = u.union(selectedSlots, slots);
            this.set('selectedSlots', selectedSlots);
            buildSlotTree(this);
        };

        /**
         * 创建广告位树
         */
        function buildSlotTree(model) {
            var slots = model.get('selectedSlots');
            var slotTree = {
                id: 'root',
                text: '所有内容',
                children: []
            };

            if (slots.length > 0) {
                // 为了保持顺序不变，排下序，但是现在的顺序也不太对
                // TODO 尽量保持跟左侧树一样的顺序
                var sortedSlots = u.sortBy(slots, function (slot) {
                    return slot.channelId;
                });
                var groupedSlots = u.groupBy(sortedSlots, 'channelGroupId');
                // 再对每个channelGroup中的slots按照channel分组
                for (var channelGroupId in groupedSlots) {
                    var slotsUnderGroup = groupedSlots[channelGroupId];

                    var slotsInChannel = [];
                    var groupedByChannelSlots = 
                        u.groupBy(slotsUnderGroup, 'channelId');

                    for (var channelId in groupedByChannelSlots) {
                        var slotsUnderChannel = 
                            groupedByChannelSlots[channelId];
                        var channel = {
                            id: 'channel-' + channelId,
                            text: slotsUnderChannel[0]['channelName'],
                            children: slotsUnderChannel
                        };
                        slotsInChannel.push(channel);
                    }

                    if (channelGroupId == 'null') {
                        // 没有频道分组的频道整合到children里
                        slotTree.children.push.apply(
                            slotTree.children, slotsInChannel
                        );
                    }
                    else {
                        var channelGroup = {
                            id: 'channel-group-' + channelGroupId,
                            text: slotsUnderGroup[0]['channelGroupName'],
                            children: slotsInChannel
                        };

                        slotTree.children.push(channelGroup);
                    }
                }
            }

            model.set('selectedSlotTree', slotTree);
        }

        /**
         * 加载广告位数据
         *
         */
        SelectorModel.prototype.loadSlots = function (channel) {
            // 这个比较临时，等接口ready了再改
            var param = u.pick(this.dump(), 'width', 'height', 'priceModel');
            var channelId = (channel.id.split('channel-'))[1];
            param.channelIds = channelId;
            param.status = 1;
            var loadingSlots = this.data.list(param);
            var model = this;
            return loadingSlots.then(function (response) {
                // 要做适配
                var slots = adaptSlots(response.results);
                model.set('slots', slots);
                var channelId = (channel.id.split('channel-'))[1];
                model.set('currentChannel', channelId);
            });
        };

        /**
         * 简单格式化下广告位数据
         *
         */
        function adaptSlots(slots) {
            u.each(slots, function (slot) {
                // 要把height和width整合成一个size字段
                slot.size = slot.width + '*' + slot.height;
                slot.text = slot.name;
            });
            return slots;
        }

        /**
         * 清空广告位数据
         *
         */
        SelectorModel.prototype.resetSlots = function () {
            this.set('slots', []);
        };

        return SelectorModel;
    }
);

