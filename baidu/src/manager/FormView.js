/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 管理员表单视图类
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var FormView = require('common/FormView');
        var util = require('er/util');
        var lib = require('esui/lib');
        var u = require('underscore');
        // 广告位权限等级类型
        var AuthorityType = require('./enum').AuthorityType;

        require('tpl!./tpl/form.tpl.html');
        require('tpl!./tpl/common.tpl.html');

        /**
         * 管理员表单视图类
         *
         * @constructor
         * @extends common/FormView
         */
        function ManagerFormView() {
            FormView.apply(this, arguments);
        }

        util.inherits(ManagerFormView, FormView);

        /** 
         * 使用的模板名称
         *
         * @type {string}
         */
        ManagerFormView.prototype.template = 'managerForm';

        /**
         * 从表单中获取实体数据
         *
         * @return {Object}
         */
        ManagerFormView.prototype.getEntity = function () {
            var entity = FormView.prototype.getEntity.apply(this, arguments);
            var model = this.model;

            // 如果存在authority，且提交值为1，则将slot-authority-data的数据格式化
            if (entity.authority) {
                if (entity.authority[0] === '1') {
                    var typeIds = [];
                    var dataIds = [];
                    // 频道组
                    var selectedChannelGroups =
                        model.get('selectedChannelGroups');
                    // 频道
                    var selectedChannels = model.get('selectedChannels');
                    // 广告位
                    var selectedSlots = model.get('selectedSlots');
                    // 混合
                    var allAuthorities =
                        u.union(selectedChannelGroups, selectedChannels);
                    allAuthorities =
                        u.union(allAuthorities, selectedSlots); 
                    // 塞进去                           
                    u.each(allAuthorities, function (authority) {
                        typeIds.push(authority.type);
                        dataIds.push(authority.rawId);
                    });

                    entity.typeIds = typeIds;
                    entity.dataIds = dataIds;
                }
            }

            // 如果存在roleIds字段并且为字符串（在只选一个的情况下），则转成数组
            if (entity.roleIds) {
                if (typeof entity.roleIds === 'string') {
                    entity.roleIds = [entity.roleIds];
                }
            }
            
            // 如果存在authority，因为boxgroup的原因，会提交成数组，这里改成字符串先
            // 后续再fillEntity中处理成数字提交给后端
            if (entity.authority) {
                entity.authority = parseInt(entity.authority[0], 10);
            }
            return entity;
        };


        /**
         * 控件事件配置
         *
         * @type {Object}
         * @override
         */
        ManagerFormView.prototype.uiEvents = {
            'roleids-sales-manager:change': toggleSlotAuthority,
            'roleids-trafficker:change': toggleSlotAuthority,
            'roleids-sales-person:change': toggleSlotAuthority,
            'roleids-data-monitor:change': toggleSlotAuthority,
            'slot-authority:change': toggleSlotAuthority,
            'slot-authority-assigned-channel:change': toggleChannelSelector,
            'slot-authority-assigned-slot:change': toggleSlotSelector,
            'mail-label-with-modify:click': enableMailModify,
            'channels:add': selectChannel,
            'selected-channels:delete': unselectChannel,
            'slot-channels:load': loadSlots,
            'slots:add': addSlots,
            'selected-slots:delete': unselectSlot
        };

        function commonGetTreeItemHtml (node) {
            var text = lib.encodeHTML(node.text);
            var keyword = this.keyword;
            var displayText = text;
            if (keyword) {
                displayText = displayText.replace(
                    new RegExp(keyword, 'g'),
                    function (word) {
                        return '<b>' + word + '</b>';
                    }
                );
            }

            var itemTemplate = ''
                    + '<span class="item-text" title="${text}">'
                    + '${displayText}</span>';

            // 普通节点文字
            var data = {
                text: text,
                displayText: displayText
            };

            return lib.format(itemTemplate, data);
        }

        /**
         * 控件额外属性
         *
         * @type {Object}
         */
        ManagerFormView.prototype.uiProperties = {
            channels: {
                itemName: '频道',
                title: '选择频道',
                emptyText: '没有符合条件的频道',
                mode: 'add',
                skin: 'authority',
                height: 390,
                width: 200,
                multi: true,
                tableType: 'tree',
                holdState: true,
                getItemHTML: commonGetTreeItemHtml
            },
            'selected-channels': {
                itemName: '频道',
                title: '已选择频道',
                emptyText: '请从左侧选择你要的频道',
                mode: 'delete',
                skin: 'authority',
                height: 390,
                width: 200,
                needBatchAction: true,
                hasSearchBox: false,
                tableType: 'tree',
                orientExpand: true,
                getItemHTML: function (node) {
                    var textHtml = commonGetTreeItemHtml.call(this, node);
                    // 只有具备标识的才会有tip
                    var tipHtml = '';
                    if (node.isSelected 
                        && node.type === AuthorityType.CHANNELGROUP
                    ) {
                        tipHtml =
                            '<span class="item-text-tip" >(组权限)</span>';
                    }

                    return textHtml + tipHtml;
                }
            },
            'slot-channels': {
                itemName: '频道',
                title: '选择频道',
                emptyText: '没有符合条件的频道',
                mode: 'load',
                skin: 'authority',
                multi: true,
                height: 390,
                width: 200,
                tableType: 'tree',
                getItemHTML: function (node) {
                    var textHtml = commonGetTreeItemHtml.call(this, node);
                    // 只有具备标识的才会有tip
                    var tipHtml = '';
                    if (node.isSelected && !node.isActive) {
                        tipHtml =
                            '<span class="item-text-tip" >(已分配)</span>';
                    }

                    return textHtml + tipHtml;
                }
            },
            'slots': {
                itemName: '广告位',
                title: '选择广告位',
                emptyText: '请从左侧选择你要的频道或没有符合条件的广告位',
                mode: 'add',
                skin: 'authority',
                height: 390,
                width: 200,
                needBatchAction: true,
                hasSearchBox: false,
                multi: true,
                tableType: 'tree',
                getItemHTML: commonGetTreeItemHtml
            },
            'selected-slots': {
                itemName: '广告位',
                title: '已选择广告位',
                emptyText: '请从左侧选择你要的广告位',
                mode: 'delete',
                skin: 'authority',
                height: 390,
                width: 200,
                needBatchAction: true,
                hasSearchBox: false,
                tableType: 'tree',
                getItemHTML: commonGetTreeItemHtml
            }
        };

        function addSlots() {
            this.fire(
                'refreshauthoritydisplay', 
                { 
                    blackList: [
                        'channels', 'selected-channels', 'slot-channels'
                    ]
                }
            );
        }
        /**
         * 频道选择
         *
         * @param {Event} e DOM事件对象
         * @inner
         */
        function selectChannel(e) {
            // 当选择的频道和当前广告位备选区对应的频道一样时
            // 需要清空掉广告位备选区
            var currentChannelId = this.model.get('currentChannel');
            if (e.items.length && e.items[0].id === currentChannelId) {
                this.fire('resetslots');
            }          
            this.fire('refreshauthoritydisplay');
        }
        /**
         * 取消频道选择
         *
         * @param {Event} e DOM事件对象
         * @inner
         */
        function unselectChannel(e) {
            var channels = this.get('channels');
            // 这个操作是为了把目标选项的isSelected属性都置为false
            // 收集id，包括子节点
            var unSelectedIds = [];
            u.each(e.items, function (item) {
                // 删除的是频道组，同时删除频道
                if (item.children && item.children.length) {
                    u.each(item.children, function (childItem) {
                        unSelectedIds.push(childItem.id);
                    });
                }
                // 删除的是频道，那么所属频道组自然也删除
                else {
                    if (item.parentId) {
                        unSelectedIds.push(item.parentId);
                    }
                }
                unSelectedIds.push(item.id);
            });
            channels.selectItems(unSelectedIds, false);
            // 频道删除的同时，要把频道下属的广告位也置为不选
            this.fire('unselectchannels', { channelIds: unSelectedIds});
            // 然后再刷新
            this.fire('refreshauthoritydisplay');
        }

        /**
         * 取消广告位选择
         *
         * @param {Event} e DOM事件对象
         * @inner
         */
        function unselectSlot(e) {
            function unSelectChildNode(node) {
                if (node.children && node.children.length) {
                    // 把items的状态更新
                    u.each(node.children, function (item) {
                        unSelectChildNode(item);
                    });
                }
                else {
                    node.isSelected = false;
                }
            }
            // 把items的状态更新
            unSelectChildNode({ id: 'virtual', children: e.items });
            // 然后再刷新
            this.fire('refreshauthoritydisplay');
        }

        /**
         * 根据频道加载广告位
         *
         * @param {Event} e DOM事件对象
         * @inner
         */
        function loadSlots(e) {
            var item = e.item;
            this.fire('loadslots', {channelId: item.id});
        }

        /**
         * 为权限树控件绑定数据
         */
        ManagerFormView.prototype.bindAuthorityData = function (blackList) {
            // “广告位选择”控件
            var authorityControls = [
                {
                    id: 'channels',
                    datasource: 'channelTree'
                },
                {
                    id: 'selected-channels',
                    datasource: 'selectedChannelTree'
                },
                {
                    id: 'slot-channels',
                    datasource: 'slotTree'
                },
                {
                    id: 'selected-slots',
                    datasource: 'selectedSlotTree'
                }
            ];
            var view = this;
            u.each(authorityControls, function (config) {
                // 有些视图不需要刷新，
                // 比如选择了某个广告位，频道相关的视图就不会受影响
                if (blackList && u.indexOf(blackList, config.id) >= 0) {
                    return;
                }
                var control = view.get(config.id);
                control.set('datasource', view.model.get(config.datasource));
            });

            // 刷新广告位备选区
            this.refreshSlotsArea();

            // 展开
            if (this.model.get('toggleAuto')) {
                toggleSlotAuthority.call(this, true);
            }
        };

        /**
         * 刷新广告位备选区
         *
         * @inner
         */
        ManagerFormView.prototype.refreshSlotsArea = function () {
            var currentSlots = this.model.get('currentSlots');
            var slotSelector = this.get('slots');
            slotSelector.set(
                'datasource',
                { id: 0, text: '全部广告位', children: currentSlots }
            );
        };

        /** 
         * 展开或收起库存权限控件组区域
         * 这部分包括不限\指定权限、指定频道权限、指定广告位权限等控件
         *
         * @param {boolean} noRequestSlots 是否拥有slots数据
         * @inner
         */
        function toggleSlotAuthority(noRequestSlots) {
            // 包含“不限”/“广告位权限”和“广告位选择”的整个Panel控件
            var slotAuthorityWrapper = this.get('slot-authority-wrapper');
            // 包含选择控件的Panel控件
            var slotSelectorWrapper = this.get('slot-selector-wrapper');
            // “不限”/“广告位权限”Radio的BoxGroup控件
            var slotAuthorityType = this.get('slot-authority');
            // “选择频道权限”/“选择广告位权限”的两个Checkbox控件
            var channelCheck = this.get('slot-authority-assigned-channel');
            var slotCheck = this.get('slot-authority-assigned-slot');

            // “广告位选择”控件
            var authorityControls = [
                'channels', 'selected-channels', 'slot-channels',
                'slots', 'selected-slots'
            ];
            var view = this;
            authorityControls = u.map(authorityControls, function (id) {
                return view.get(id);
            });

            // 当 销售人员||销售经理||投放人员||数据监测员
            // 被选中时出现权限Panel
            var hasAuthorRoles = [
                this.get('roleids-sales-person'),
                this.get('roleids-sales-manager'),
                this.get('roleids-trafficker'),
                this.get('roleids-data-monitor')
            ];
            var roleSelected = u.any(
                hasAuthorRoles,
                function (checkbox) { return checkbox.isChecked(); }
            );

            if (roleSelected) {
                slotAuthorityWrapper.show();
                slotAuthorityType.enable();

                // 仅当选中广告位权限的Radio时，出现广告位选择控件
                if (slotAuthorityType.getValue() === '1') {
                    if (noRequestSlots) {
                        slotSelectorWrapper.show();

                        // 如果选择了频道权限，勾选频道
                        if (this.model.get('hasChannelAuth')) {
                            channelCheck.setChecked(true);
                        }
                        else {
                            channelCheck.setChecked(false);
                        }

                        // 如果选择了广告位权限，勾选广告位
                        if (this.model.get('hasSlotAuth')) {
                            slotCheck.setChecked(true);
                        }
                        else {
                            slotCheck.setChecked(false);
                        }
                    }
                    else {
                        this.fire('requestslots');
                    }
                    
                }
                else {
                    slotSelectorWrapper.hide();
                }
            }
            else {
                slotAuthorityWrapper.hide();
                slotAuthorityType.disable();
                slotSelectorWrapper.hide();
            }
        }

        /** 
         * 展开或收起频道权限控件组区域
         * 这部分包括频道权限控件
         *
         * @inner
         */
        function toggleChannelSelector() {
            // “频道选择权限”勾选框
            var channelAuthCheck = this.get('slot-authority-assigned-channel');
            // 包含频道选择控件的Panel控件
            var channelAuthWrapper = this.get('slot-selector-channel-wrapper');
            // 备选控件和已选控件
            var authorityControls = [ 'channels', 'selected-channels'];

            var view = this;
            authorityControls = u.map(authorityControls, function (id) {
                return view.get(id);
            });

            if (channelAuthCheck.isChecked()) {
                channelAuthWrapper.show();
                u.each(authorityControls, function (control) {
                    control.enable();
                });
            }
            else {
                // 不确定：频道权限勾选掉以后，相当于删除全部频道权限
                var selectedChannelTree =
                    this.get('selected-channels').getResultContent();
                selectedChannelTree.deleteAll();
                channelAuthWrapper.hide();
                u.each(authorityControls, function (control) {
                    control.disable();
                });
            }
        }


        /** 
         * 展开或收起广告位权限控件组区域
         * 这部分包括广告位权限控件
         *
         * @inner
         */
        function toggleSlotSelector() {
            // 频道选择整个Panel控件
            var slotAuthWrapper = this.get('slot-selector-slot-wrapper');
            // “频道选择权限”控件
            var slotAuthCheck = this.get('slot-authority-assigned-slot');
            // “广告位选择”控件
            var authorityControls = [
                'slot-channels', 'slots', 'selected-slots'
            ];

            var view = this;
            authorityControls = u.map(authorityControls, function (id) {
                return view.get(id);
            });

            if (slotAuthCheck.isChecked()) {
                slotAuthWrapper.show();
                u.each(authorityControls, function (control) {
                    control.enable();
                });
            }
            else {
                slotAuthWrapper.hide();
                u.each(authorityControls, function (control) {
                    control.disable();
                });
            }
        }

        /** 
         * 邮件字段进入可编辑状态
         */
        function enableMailModify() {
            this.get('mail').enable();
            this.get('mail-confirm').enable();
            this.get('mail-confirm-wrapper').show();
            
            // 切换label到普通状态
            this.get('mail-label-with-modify').hide();
            this.get('mail-confirm-label-normal').show();
        }

        /**
         * 设置管理员角色选项
         *
         * @public
         */
        ManagerFormView.prototype.checkRoles = function (roles) {
            var rolesChecks = [];
            rolesChecks[6] = this.get('roleids-administrator');
            rolesChecks[9] = this.get('roleids-sales-manager');
            rolesChecks[4] = this.get('roleids-sales-person');
            rolesChecks[3] = this.get('roleids-trafficker');
            rolesChecks[2] = this.get('roleids-data-monitor');
            rolesChecks[5] = this.get('roleids-technical');

            var roles = roles.split(',');
            u.each(roles, function (element) {
                var current = rolesChecks[element];
                if (current) {
                    current.setChecked(true);
                }
            });
        };

        /**
         * 渲染
         *
         * @override
         */
        ManagerFormView.prototype.enterDocument = function () {
            FormView.prototype.enterDocument.apply(this, arguments);
            var model = this.model;
            var mail = model.get('mail');

            // 编辑状态时，全部进入disable状态，由边上Label负责切换可编辑状态
            if (mail) {
                this.get('mail').disable();
                this.get('mail-confirm').disable();
                this.get('mail-confirm-wrapper').hide();
            }

            // 根据状态显示不同的mail说明lable
            if (this.model.get('canEditEmail')) {
                this.get('mail-label-with-modify').show();
            }
            else {
                this.get('mail-confirm-label-normal').show();
            }

            // 根据角色数据渲染角色控件的状态，并联动广告位权限控件的展现
            var roles = model.get('role');
            if (roles) {
                this.checkRoles(roles);
            }

            // 如果填写了高级设置，则展开高级设置
            var phone = model.get('phone');
            var mobile = model.get('mobile');
            var description = model.get('description');
            if (phone || mobile || description) {
                this.get('advance-config').set('expanded', true);
            }
        };

        return ManagerFormView;
    }
);
