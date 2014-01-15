/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 管理员只读页数据模型类
 * @author lixiang(lixiang05@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var ReadModel = require('common/ReadModel');
        var Data = require('./Data');
        var util = require('er/util');
        var config = require('./config');
        var u = require('underscore');

        function ManagerReadModel() {
            ReadModel.apply(this, arguments);
            this.data = new Data();
        }

        util.inherits(ManagerReadModel, ReadModel);
        var datasource = require('er/datasource');

        ManagerReadModel.prototype.datasource = [
            {
                crumbPath: function (model) {
                    var path = [];
                    path[0] = { text: '所有管理员', href: '#/manager/list' };
                    path[1] = { text: model.get('title') };
                    return path;
                },
                hasLoginName: function (model) {
                    // 如果有loginName字段，并且不为'-'，则有显示相应控件的权限
                    var loginName = model.get('loginName');
                    return loginName && loginName !== '--';
                },
                roles: function (model) {
                    var rolesList = {
                        2: '数据监测员',
                        3: '投放人员',
                        4: '销售人员',
                        5: '技术人员',
                        6: '超级管理员',
                        9: '销售经理'
                    };
                    var roles = model.get('role').split(',');
                    var filter = function (role) {
                        return rolesList[role];
                    };
                    roles = u.map(roles, filter);
                    return roles;
                },
                hasSlots: function (model) {
                    // 1(或'1')是“指定广告位”，其余都是不限
                    if (model.get('authority') == 1) {
                        return true;
                    }
                    return false;
                },
                hasSlotsAuthority: function (model) {
                    // 没有说明没有广告位权限的选择
                    if (model.get('authority') === undefined) {
                        return false;
                    }
                    return true;
                },
                authorityData: function (model) {
                    // 1是“指定广告位”，其余都不加载
                    if (model.get('authority') === 1) {
                        return model.loadAuthorities();
                    }
                    return {};
                }
            },
            {
                // 导航栏权限
                canSubManagerView: datasource.permission('CLB_SUBMANAGER_VIEW'),
                canCompanyView: datasource.permission('CLB_COMPANY_VIEW'),
                canContactView: datasource.permission('CLB_CONTACTOR_VIEW'),
                canChannelView: datasource.permission('CLB_CHANNEL_VIEW')
            }
        ];

        /**
         * 将原始数据打散成三棵树：频道组、频道、广告位
         * TODO 补注释
         * @param {Object} authorityData 加载成功后返回的数据
         */
        function adaptAuthorityData(authorityData) {
            var channelGroups = [];
            // 2级树结构
            var channels = [];
            var channelsIndex = {};
            // 3级树结构
            var slots = [];
            var slotsIndex = {};

            // 抽频道，顺路抽广告位
            // 存在没有频道组的频道
            function mapChannels(channels, channelGroup) {
                var checkedChannels = [];
                u.each(
                    channels,
                    function (channel) {
                        var channelName = channel.channelName;
                        var newChannel = {
                            text: channelName,
                            id: 'channel-' + channel.channelId
                        };
                        if (channel.checked) {
                            checkedChannels.push(newChannel);
                        }
                        else {
                            var checkedSlots = mapSlots(channel.adPosList);
                            if (checkedSlots.length) {
                                // 整合到channel中
                                var key = ''
                                   + 'channelGroup-'
                                   + channelGroup.channelGroupId;
                                var index = slotsIndex[key];
                                if (index === undefined) {
                                    // 保存索引
                                    slotsIndex[key] = slots.length;
                                    index = slotsIndex[key];
                                    slots[index] = {
                                        text: channelGroup.channelGroupName,
                                        id: key,
                                        children: []
                                    };
                                }
                                newChannel.children = checkedSlots;
                                slots[index]['children'].push(newChannel);
                            }
                        }
                    }
                );

                return checkedChannels;
            }

            // 抽广告位
            function mapSlots(slots) {
                // 抽广告位
                var checkedSlots = [];
                u.each(
                    slots,
                    function (slot) {
                        if (slot.checked) {
                            checkedSlots.push({
                                id: 'slot-' + slot.adPosId,
                                text: slot.adPosName
                            });
                        }
                    }
                );
                return checkedSlots;
            }

            // 频道权限里如果包含没有频道组的
            // 增加一个需求的频道分组
            if (authorityData.channel) {
                authorityData.channelGroup.push({
                    channelGroupId: 0,
                    channelGroupName: '未指定频道分组',
                    channels: authorityData.channel
                });
            }

            // 抽频道组
            u.each(
                authorityData.channelGroup,
                function (channelGroup) {
                    var channelGroupName = channelGroup.channelGroupName;
                    var channelGroupId = channelGroup.channelGroupId;
                    if (channelGroup.checked) {
                        channelGroups.push(channelGroupName);
                    }
                    // 没有被check的才去做下一步的过滤工作
                    else {
                        var checkedChannels = 
                            mapChannels(channelGroup.channels, channelGroup);

                        if (checkedChannels.length > 0) {
                            var key = 'channelGroup-' + channelGroupId;
                            var index = channelsIndex[key];
                            if (index === undefined) {
                                // 保存索引
                                channelsIndex[key] = channels.length;
                                index = channelsIndex[key];
                                channels[index] = {
                                    text: channelGroup.channelGroupName,
                                    id: key,
                                    children: []
                                };
                            }
                            channels[index]['children'] = checkedChannels;
                        }
                    }
                }
            );
            return {
                channelGroups: channelGroups,
                channels: channels,
                slots: slots
            };
        }


        /**
         * 对广告位权限数据进行适配
         *
         * @return {Object} authorities 和Tree控件数据源适配的数据
         */
        ManagerReadModel.prototype.loadAuthorities = function () {
            var id = this.get('id');
            return this.data.getAuthorities(id).then(adaptAuthorityData);
        };

        var ajax = require('er/ajax');
        u.each(
            config.requests,
            function (config) {
                ajax.register(ManagerReadModel, config.name, config);
            }
        );

        return ManagerReadModel;
    }
);
