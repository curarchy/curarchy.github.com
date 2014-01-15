/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 管理员表单数据模型类
 * @author liyidong(undefined)
 * @date $DATE$
 */
define(
    function (require) {
        var FormModel = require('common/FormModel');
        var Data = require('./Data');
        var util = require('er/util');
        var config = require('./config');
        var u = require('underscore');

        function ManagerFormModel() {
            FormModel.apply(this, arguments);
            this.data = new Data();
        }

        util.inherits(ManagerFormModel, FormModel);
        var datasource = require('er/datasource');

        // 广告位权限等级类型
        var AuthorityType = require('./enum').AuthorityType;

        ManagerFormModel.prototype.datasource = [
            {
                crumbPath: function (model) {
                    var path = [];
                    path[0] = {text: '所有管理员', href:'#/manager/list'};
                    path[1] = {text: model.get('title')};
                    return path;
                },
                hasLoginName: function (model) {
                    // 如果有loginName字段，并且不为'-'，则有显示相应控件的权限
                    var loginName = model.get('loginName');
                    return loginName && loginName !== '--';
                },
                canEditEmail: function (model) {
                    // 根据status状态字段属性，来决定是否能够编辑邮件
                    var status = model.get('status');
                    if (status === 1 || status === 2) {
                        return true;
                    }
                    return false;
                },
                authority: function (model) {
                    // 如果有authority字段，则转成字符串，
                    // 这个字段确定是不是选择了广告位权限
                    if (model.get('authority') !== undefined) {
                        return model.get('authority').toString();
                    }
                    return '0';
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
         * 对数据源进行预处理
         */
        ManagerFormModel.prototype.prepare = function () {
            // 预加载广告位权限字段备用，放在这里不影响其它内容加载
            var id = this.get('id');
            this.data.getAuthorities(id);
        };

        /**
         * 对数据源进行预处理的调用函数并写入Model
         *
         * @param {Object} data 加载成功后返回的数据
         */
        function setAuthorityData(authorityData) {
            // 有一种变态需求，就是当管理员被设置为“不限”权限并提交后，
            // 再在修改表单中改为“指定”权限，则应该默认没有任何权限
            // (实际上后端在收到不限请求的时候，就已经把所有权限都勾选上了)
            // 所以前端要把这些勾选状态再取消。。。
            var needReset = false;
            if (this.get('formType') === 'update'
                && this.get('authority') === '0') {
                needReset = true;
            }
            var adaptedAuthorityData = 
                adaptAuthorityData(authorityData, needReset);
            // 整体数据，之后都会以这个数据为基本来刷新控件数据
            this.set('adaptedAuthorityData', adaptedAuthorityData);
            this.refreshAuthorityTree();
            // 这个方法只在加载数据的时候用一次，控件根据数据的展开也期望
            // 只在这时候生效一次，之后都以用户的手动操作为主
            // 因此在这个设置一个标志位
            this.changeAutoToggleState(true);
        }

        /**
         * 对广告位权限数据进行适配
         *
         * @return {Object} authorities 和Tree控件数据源适配的数据
         */
        ManagerFormModel.prototype.loadAuthorities = function () {
            var id = this.get('id');
            return this.data.getAuthorities(id)
                .then(u.bind(setAuthorityData, this));
        };

        /**
         * 对广告位权限数据进行适配
         *
         * @return {Object} authorities 和Tree控件数据源适配的数据
         */
        ManagerFormModel.prototype.changeAutoToggleState = function (auto) {
            this.set('toggleAuto', auto);
        };


        /**
         * 就是一个转换配置
         * key是level，数组第一个元素是字段前缀，第二个元素是孩子字段名
         *
         * @type {Object}
         */
        var config = {
            1: ['channelGroup', 'channels'],
            2: ['channel', 'adPosList'],
            3: ['adPos']
        };

        /**
         * 这个方法很单纯，就是改字段名，顺路把广告位信息提出来，单独存放
         * 转换后的节点形如
         * {
         *     channelGroup: [
         *         {
         *             id: 'channel-group-1',
         *             rawId: 1,
         *             text: 'xxx',
         *             type: 3,
         *             isSelected: true,
         *             children: []
         *         }
         *     ],
         *     channel: [
         *         {
         *             id: 'channel-1',
         *             rawId: 1,
         *             text: 'xxx',
         *             type: 2,
         *             isSelected: true
         *         }
         *     ],
         *     slot: {
         *         'channel-1':
         *             {
         *                 id: 'channel-1',
         *                 rawId: 1,
         *                 text: 'xxx',
         *                 type: 2,
         *                 isSelected: true
         *             }
         *         }
         *     }
         * }
         *
         * @param {Object} authorityData
         * @param {boolean} needReset 是否需要把状态全部重置
         */
        function adaptAuthorityData(authorityData, needReset) {
            var slotsIndex = {};
            // type与level的映射
            var levelAndType = {
                1: AuthorityType.CHANNELGROUP,
                2: AuthorityType.CHANNEL,
                3: AuthorityType.SLOT
            };

            // 转换函数
            function mapData (data, level, parentId) {
                var newData = [];
                // 没那层了
                if (level > 3) {
                    return newData;
                }
                newData = u.map(data, function (item) {
                    var prefix = config[level][0];
                    var id = prefix + '-' + item[prefix + 'Id'];
                    var newItem = {
                        id: id,
                        rawId: item[prefix + 'Id'],
                        text: item[prefix + 'Name'],
                        type: levelAndType[level],
                        isSelected: needReset ? false : item.checked
                    };
                    if (parentId) {
                        newItem.parentId = parentId;
                    }
                    // 递归map孩子
                    var childrenName = config[level][1];
                    if (childrenName) {
                        newItem.children =
                            mapData(item[childrenName], level + 1, id);
                    }
                    // 频道层
                    if (level === 2) {
                        // 广告位移出来
                        slotsIndex[newItem.id] = u.clone(newItem.children);
                        newItem.children = null;
                    }
                    return newItem;
                });
                return newData;
            }

            if (authorityData.channelGroup) {
                authorityData.channelGroup =
                    mapData(authorityData.channelGroup, 1);
            }

            if (authorityData.channel) {
                authorityData.channel =
                    mapData(authorityData.channel, 2);
                // 频道权限里如果包含没有频道组的
                // 增加一个虚拟的频道分组
                authorityData.channelGroup.push({
                    id: 'channel-group-0',
                    text: '未指定频道分组',
                    children: u.clone(authorityData.channel)
                });
                // 删除原有的channel
                authorityData.channel = null;
            }

            // 把广告位信息补进来
            authorityData.slot = slotsIndex;
            return authorityData;
        }


        /**
         * 将一个数据按需求分割成多组数据
         *
         * @param {Object} data 格式化后的数据
         * @return {Object} result
         * 频道+频道组备选数据，2级树
         *     channelTree
         * 频道+频道组已选数据，3级树
         *     selectedChannelTree
         * 广告位导出数据，2级树
         *     slotTree
         * 已选广告位备选数据，1级树
         *     selectedSlotTree
         */
        function buildTree(authorityData) {
            // 频道+频道组备选数据，2级树
            var channelGroups = [];
            // 频道+频道组已选数据，2级树
            var selectedGroupsAndChannels = [];
            // 频道组id为key，频道组在已选频道列中的索引为value
            var selectedChannelsIndex = {};

            // 已选广告位数据, 3级树
            var selectedSlotsFull = [];
            var selectedSlotsIndex = {};

            // 以下数据结构用来提交时收集数据
            // 频道组已选数据
            var selectedChannelGroups = [];
            // 频道已选数据
            var selectedChannels = [];
            // 广告位已选数据
            var selectedSlots = [];

            // 抽频道，顺路抽广告位
            // 把具有选择状态的频道抽到已选频道树数据中，
            // 把非选择状态的频道下的广告位抽到已选广告位树数据中
            // 存在没有频道组的频道
            function mapChannels(channels, channelGroup) {
                var checkedChannels = [];
                u.each(
                    channels,
                    function (channel) {
                        // 取出存储的slot
                        var slots = authorityData['slot'][channel.id];
                        // 处于选择状态的channel直接扔进去
                        // 也有可能是加载型的tree的激活节点，此时不算已选择
                        if (channel.isSelected && !channel.isActive) {
                            // 选择区的频道是没有子节点的，
                            // 所以创建一个没有children的副本
                            var newChannel = u.clone(channel);
                            checkedChannels.push(newChannel);
                            selectedChannels.push(newChannel);
                        }
                        // 没处于选择状态的channel才考虑下属的广告位
                        else {
                            var checkedSlots = mapSlots(slots);
                            // 整合到选择树中
                            if (checkedSlots.length > 0) {
                                // 先看看频道组是否已存在
                                var index = selectedSlotsIndex[channelGroup.id];
                                // 不存在，就是新建，index是当前length
                                if (index === undefined) {
                                    index = selectedSlotsFull.length;
                                    selectedSlotsIndex[channelGroup.id] = index;
                                    selectedSlotsFull[index] = {
                                        text: channelGroup.text,
                                        id: channelGroup.id,
                                        children: []
                                    };
                                }
                                selectedSlotsFull[index]['children'].push(
                                    {
                                        text: channel.text,
                                        id: channel.id,
                                        children: checkedSlots
                                    }
                                );
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
                u.each(slots, function (slot) {
                    if (slot.isSelected) {
                        checkedSlots.push(slot);
                        selectedSlots.push(slot);
                    }
                });
                return checkedSlots;
            }

            // 抽频道组
            u.each(
                authorityData.channelGroup,
                function (channelGroup) {
                    if (channelGroup.isSelected) {
                        // 左侧频道频道组备选树
                        channelGroup.hasTipHtml = true;
                        // channelGroup下的所有children都置为已选
                        u.each(channelGroup.children, function (child) {
                            child.isSelected = true;
                        });
                        selectedGroupsAndChannels.push(channelGroup);
                        // 这个是用来提交时收集数据的
                        selectedChannelGroups.push(channelGroup);
                    }
                    else {
                        var checkedChannels = 
                            mapChannels(channelGroup.children, channelGroup);
                        var key = channelGroup.id;
                        // 有被选中的频道，则为这些频道创建一棵完整树
                        if (checkedChannels.length > 0) {
                            var newChannelGroup = u.clone(channelGroup);
                            newChannelGroup.children = checkedChannels;
                            // 已选的channel要单独创建一棵完整的树
                            // 新建索引
                            var index = selectedGroupsAndChannels.length;
                            selectedChannelsIndex[key] = index;
                            selectedGroupsAndChannels[index] = newChannelGroup;
                        }
                    }
                    channelGroups.push(channelGroup);
                }
            );

            // 之前为减少条件判断，为没有频道分组的频道创建了一个虚拟频道组
            // 现在要释放出来，放到其它频道分组的同级
            function releaseVirtual(source) {
                if (!source.length) {
                    return [];
                }
                var virtualIndex = source.length - 1;
                var virtualItem = source[virtualIndex];
                if (virtualItem.id === 'channel-group-0') {
                    source = source.concat(u.clone(virtualItem.children));
                    source.splice(virtualIndex, 1);
                }
                return source;
            }

            // 频道+频道分组全集树释放
            channelGroups = releaseVirtual(channelGroups);

            // 已选频道树释放
            selectedGroupsAndChannels =
                releaseVirtual(selectedGroupsAndChannels);

            // 已选广告位树释放
            selectedSlotsFull = releaseVirtual(selectedSlotsFull);

            // 开始根据控件需要构建数据
            // 1. 频道组选择
            var channelTree =
                { id: '0', text: '全部', children: channelGroups };

            // 2. 已选频道组和频道
            var selectedChannelTree = 
                { id: '0', text: '全部', children: selectedGroupsAndChannels };

            // 3. 广告位选择
            var slotTree = u.clone(channelTree);

            // 4. 已选广告位
            var selectedSlotTree = 
                { id: '0', text: '全部', children: selectedSlotsFull };

            var result = {
                channelTree: channelTree,
                selectedChannelTree: selectedChannelTree,
                slotTree: slotTree,
                selectedSlotTree: selectedSlotTree,
                selectedChannelGroups: selectedChannelGroups,
                selectedChannels: selectedChannels,
                selectedSlots: selectedSlots
            };

            return result;
        }

        /**
         * 刷新权限树数据
         *
         */
        ManagerFormModel.prototype.refreshAuthorityTree = function () {
            // 树之间传递的数据都是引用，因此修改是联动的
            // 这里只把完整数据重新获取一遍，再重新搭建树结构
            var adaptedAuthorityData = this.get('adaptedAuthorityData');
            var treeData = buildTree(adaptedAuthorityData);

            this.set('channelTree', treeData.channelTree);
            this.set('selectedChannelTree', treeData.selectedChannelTree);
            this.set('slotTree', treeData.slotTree);
            this.set('selectedSlotTree', treeData.selectedSlotTree);
            this.set('selectedChannelGroups', treeData.selectedChannelGroups);
            this.set('selectedChannels', treeData.selectedChannels);
            this.set('selectedSlots', treeData.selectedSlots);

            // 如果选择了频道权限就做个标识，这样才展开频道层
            if (treeData.selectedChannelTree.children.length) {
                this.set('hasChannelAuth', 1);
            }
            else {
                this.set('hasChannelAuth', 0);
            }

            // 如果选择了频道权限就做个标识，这样才展开频道层
            if (treeData.selectedSlotTree.children.length) {
                this.set('hasSlotAuth', 1);
            }
            else {
                this.set('hasSlotAuth', 0);
            }
        };


        /**
         * 加载广告位数据
         *
         */
        ManagerFormModel.prototype.loadSlots = function (channelId) {
            var slots = this.get('adaptedAuthorityData').slot;
            var currentSlots = slots[channelId];
            this.set('currentSlots', currentSlots);
            this.set('currentChannel', channelId);
        };

        /**
         * 清空广告位数据
         *
         */
        ManagerFormModel.prototype.resetSlots = function () {
            this.set('currentSlots', []);
        };

        /**
         * 取消指定频道下的广告位选择权限
         *
         * @param {Array} channelIds 指定频道id集合
         */
        ManagerFormModel.prototype.unselectSlots = function (channelIds) {
            var slots = this.get('adaptedAuthorityData').slot;
            u.each(channelIds, function (channelId) {
                if (slots[channelId]) {
                    u.each(slots[channelId], function (slot) {
                        slot.isSelected = false;
                    });
                }
            });
        };        

        /**
         * 检验实体有效性
         *
         * @param {Object} entity 提交的实体
         * @return {Object[] | true} 返回`true`表示验证通过，否则返回错误字体
         */
        ManagerFormModel.prototype.validateEntity = function (entity) {
            var errorMsg = [];
            if (!entity.roleIds) {
                errorMsg.push(
                    { field: 'roleIds', message: '请至少选择一种角色' }
                );
            }
            if (entity.mail) {
                if (entity.mail !== entity.mailConfirm) {
                    errorMsg.push(
                        {
                            field: 'mailConfirm',
                            message: '两次输入的电子邮件地址不一致'
                        },
                        {
                            field: 'mail',
                            message: '两次输入的电子邮件地址不一致'
                        }
                    );
                }
            }
            if (entity.authority) {
                if (!entity.dataIds.length) {
                    errorMsg.push(
                        {
                            field: 'authority',
                            message: 
                                '请选择需要限定权限的广告位、频道和频道分组'
                        }
                    );
                }
                else {
                    if (!entity.authorityChannel && !entity.authoritySlot) {
                        errorMsg.push(
                            {
                                field: 'authority',
                                message: 
                                    '请选择需要限定权限的广告位、频道和频道分组'
                            }
                        );
                    }
                    // 没有频道数据，但是又勾选了频道
                    // 频道组
                    var selectedChannelGroups =
                        this.get('selectedChannelGroups');
                    // 频道
                    var selectedChannels = this.get('selectedChannels');
                    if (entity.authorityChannel
                        && !selectedChannelGroups.length 
                        && !selectedChannels.length) {
                        errorMsg.push(
                            {
                                field: 'authorityChannel',
                                message: 
                                    '请选择至少一个频道和频道分组权限，'
                                    + '或者取消频道权限的勾选'
                            }
                        );
                    }
                    // 没有广告位，但是又勾选了广告位
                    var selectedSlots = this.get('selectedSlots');
                    if (entity.authoritySlot
                        && (!selectedSlots || !selectedSlots.length)) {
                        errorMsg.push(
                            {
                                field: 'authoritySlot',
                                message: 
                                    '请选择至少一个广告位权限，'
                                    + '或者取消广告位权限的勾选'
                            }
                        );
                    }
                }
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
        ManagerFormModel.prototype.isEntityChanged = function (entity) {
            // 如果是新建的话，要先建立一个空的original
            // 编辑时则以后端取回的数据为准
            var emptyEntity = {
                    authority: 0,
                    authorityChannel: 0,
                    authoritySlot: 0,
                    id: undefined,
                    name: '',
                    mail: '',
                    mobile: '',
                    phone: '',
                    description: '',
                    status: undefined
                };
            var original = this.get('formType') === 'create'
                ? emptyEntity
                : u.clone(this.get('entity'));

            // 补上`id`、`loginName`、`status`和`mail`
            // 所有original字段的操作之前要加判断，下同
            if (original) {
                entity.id = original.id;
                entity.status = original.status;
            }

            if (original.hasOwnProperty('loginName')) {
                entity.loginName = original.loginName;
            }

            if (!entity.hasOwnProperty('mail')) {
                entity.mail = original.mail;
            }
            // 如果展开了修改mail选项，则给original补上mailConfirm字段
            // 取original的mail的值
            if (original && entity.hasOwnProperty('mailConfirm')) {
                original.mailConfirm = original.mail;
            }

            // 把视图提交的`roleIds`变成`role`
            // 坑：必须判断是否存在，因为新建的时候不选角色就取消是有可能的
            if (entity.hasOwnProperty('roleIds')) {
                entity.role = entity.roleIds.sort();
                delete entity.roleIds;
            }
            // 原来的`role`也排下序
            if (original.hasOwnProperty('role')) {
                original.role = original.role.split(',').sort();
            }

            // 如果视图未提交`authority`，则表明其为不限类型，补0
            if (!entity.hasOwnProperty('authority')) {
                entity.authority = 0;
            }

            // 如果视图未提交`authorityChannel`，则表明未选择，补0
            if (!entity.hasOwnProperty('authorityChannel')) {
                entity.authorityChannel = 0;
            }

            // 如果视图未提交`authoritySlot`，则表明未选择，补0
            if (!entity.hasOwnProperty('authoritySlot')) {
                entity.authoritySlot = 0;
            }

            // 如果原始数据选择“不限”，则“频道权限”和“广告位权限”必然是未选的
            // original里面要增加
            if (original && original.authority === 0) {
                original.authorityChannel = 0;
                original.authoritySlot = 0;
            }

            // 把`typeIds`和`dataIds`组装成`authorSlots`
            if (entity.authority === 1) {
                entity.authorSlots = [];
                var typePrefix = {
                    1: 'channel-',
                    2: 'slot-',
                    3: 'channel-group-'
                };
                for (var i = 0; i < entity.typeIds.length; i++) {
                    entity.authorSlots.push(
                        typePrefix[entity.typeIds[i]] + entity.dataIds[i]);
                }
                entity.authorSlots.sort();
                delete entity.typeIds;
                delete entity.dataIds;
                if (this.get('selectedAuthorSlots')) {
                    original.authorSlots =
                        u.clone(this.get('selectedAuthorSlots')).sort();
                }
            }

            return !u.isEqual(entity, original);
        };

        var ajax = require('er/ajax');
        u.each(
            config.requests,
            function (config) {
                ajax.register(ManagerFormModel, config.name, config);
            }
        );

        return ManagerFormModel;
    }
);

