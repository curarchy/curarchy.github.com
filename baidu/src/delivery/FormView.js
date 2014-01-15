/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 广告表单视图类
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var FormView = require('common/FormView');
        var util = require('er/util');
        var u = require('underscore');
        var moment = require('moment');
        var Validity = require('esui/validator/Validity');
        var ValidityState = require('esui/validator/ValidityState');

        require('tpl!./tpl/form.tpl.html');

        /**
         * 广告表单视图类
         *
         * @constructor
         * @extends common/FormView
         */
        function DeliveryFormView() {
            FormView.apply(this, arguments);

            // 时间控件组运行时变量
            this.dateTimeRunTime = {
                /**
                 * 日期模式，连续 - 非连续
                 */
                dateModel: 'continuous',

                /**
                 * 时间模式，有结束时间 - 不限结束时间
                 */
                timeModel: 'end'
            };

            // 频次控制运行时变量
            this.frequencyRuntime = {
                /**
                 * 最大行数目
                 */
                maxLineNum: 6,

                /**
                 * 临时Data Model
                 */
                tempModel: [
                    {
                        type: 'day',
                        amount: ''
                    }
                ],

                /**
                 * 临时Data Model
                 */
                conflict: false
            };

        }

        util.inherits(DeliveryFormView, FormView);

        /** 
         * 使用的模板名称
         *
         * @type {string}
         */
        DeliveryFormView.prototype.template = 'deliveryForm';

        var tableFields = [
            {
                title: '名称',
                field: 'name',
                sortable: false,
                resizable: false,
                width: 120,
                stable: true,
                content: 'name'
            },
            {
                title: 'ID',
                field: 'id',
                sortable: false,
                resizable: false,
                width: 120,
                stable: true,
                content: 'id'
            },
            {
                title: '状态',
                field: 'status',
                sortable: false,
                resizable: false,
                width: 120,
                stable: true,
                content: function (item) {
                    var deliveryTypes = require('common/enum').Status;
                    return deliveryTypes.getTextFromValue(item.status);
                }
            },
            {
                title: '频道',
                field: 'channelName',
                sortable: false,
                resizable: false,
                width: 120,
                stable: true,
                content: 'channelName'
            },
            {
                title: '尺寸',
                field: 'size',
                sortable: false,
                resizable: false,
                width: 100,
                stable: true,
                content: 'size'
            },
            // {
            //     title: '目标平台',
            //     field: 'platform',
            //     sortable: true,
            //     resizable: false,
            //     width: 180,
            //     stable: false,
            //     content: 'platform'
            // },
            {
                title: '',
                field: 'operation',
                sortable: false,
                resizable: false,
                width: 50,
                stable: true,
                content: function (item) {
                    var config = {
                        command: 'deleteslot',
                        args: item.id,
                        className: 'table-command-delete',
                        text: '删除'
                    };

                    var Table = require('esui/Table');
                    return Table.command(config);
                }
            }
        ];

        /**
         * 控件额外属性配置
         *
         * @type {Object}
         * @override
         */
        DeliveryFormView.prototype.uiProperties = {
            'slots-table': {
                fields: tableFields
            }
        };

        /**
         * 控件事件配置
         *
         * @type {Object}
         * @override
         */
        DeliveryFormView.prototype.uiEvents = {
            'slot-size:change': emptySlots,
            'slots-table:command': deleteSlot,
            'add-slot:click': selectSlots,
            'keep-on-add-slot:click': selectSlots,
            'begin-date:change': syncDate,
            'end-date:change': syncDate,
            'continuous-time-label:click': 
                u.partial(toggleTimeModel, 'discontinuous', ''),
            // 必须给第三个参数设空，否则运行时变量会存入Event对象
            'discontinuous-time-label:click': 
                u.partial(toggleTimeModel, 'continuous', ''),
            'end-time-label:click':
                u.partial(toggleTimeModel, 'continuous', 'endless'),
            'endless-time-label:click':
                u.partial(toggleTimeModel, 'continuous', 'end'),
            'priority-class:change': togglePriority,
            'set-weight:change': toggleWeight,
            'set-balance-delivery:change': toggleBalanceDelivery,
            'balance-delivery-type:change': toggleDeliverySpeed,
            'balance-delivery-amount:input': toggleDeliverySpeed,
            'set-total-delivery:change': toggleTotalDelivery,
            'set-frequency:change': toggleFrequency,
            'add-frequency:click': addFrequency,
            'ad-inturn:change': toggleAdInturn,
            'price-model:change': priceModelChange,
            //'other-locate-panel:change': toogleOtherOrients,
            'set-delivery-speed:change': toggleDeliverySpeed
        };

        /**
         * 绑定控件事件
         *
         * @override
         */
        DeliveryFormView.prototype.bindEvents = function () {
            FormView.prototype.bindEvents.apply(this, arguments);

            // 绑定频次控制的相关控件事件
            bindFrequencyEvent.call(this);

            // 绑定四个定向设置的Toggle事件
            var orientations = ['region', 'schedule', 'browser', 'resolution'];
            u.each(
                orientations,
                function (item) {
                    this.get('set-' + item).on(
                        'change',
                        u.bind(toggleOrientations, this, item)
                    );
                },
                this
            );

            // 绑定`保存并上传创意`按钮的事件
            var addCreative = this.get('add-creative');
            if (addCreative) {
                addCreative.on(
                    'click', 
                    u.bind(submitThenAddCreative, this)
                );
            }
            
        };

        /**
         * 绑定频次控制的事件
         *
         * @private
         */
        function bindFrequencyEvent() {
            // 绑定频率控制各行删除按钮的事件
            for (var i = 0; i < this.frequencyRuntime.maxLineNum; i++) {
                var current = this.get('delete-frequency-' + i); 
                current.on('click', u.bind(deleteFrequency, this, i));
            }

            // 绑定频率控制各行频率下拉框的事件，用于实时提示重复
            for (var i = 0; i < this.frequencyRuntime.maxLineNum; i++) {
                var current = this.get('frequency-type-' + i); 
                current.on('change', u.bind(validateFrequency, this));
                current.on(
                    'aftervalidate', 
                    u.bind(validateFrequencyOnSubmit, this)
                );
            }
        }

        /**
         * 根据售卖方式，切换一系列的控件组的状态
         *
         * @private
         */
        function priceModelChange() {
            // 切换结束时间，不允许无限结束时间
            toggleTimeModelByPriceModel.call(this);

            // 根据售卖方式设置每日投放量，CPM广告不能设置每天展现次数
            toggleBalanceDeliveryByPriceModel.call(this);

            // 根据售卖方式切换投放上限控件的显示
            toggleTotalDelivery.call(this);

            // 根据售卖方式，切换投放上限控件组
            toggleDeliverySpeed.call(this);

            // 根据售卖方式，切换投放量模式
            toggleSlotsAmount.call(this);
        }

        /**
         * 清空已选择广告位
         * 
         * @private
         */ 
        function emptySlots() {
            this.fire('emptyslots');
        }

        /**
         * 切换添加广告位按钮状态
         * 
         * @private
         */
        function toggleAddSlot() {
            var slotSize = this.get('slot-size');
            var addSlot = this.get('add-slot');

            // 如果广告位尺寸未选择，这添加广告位按钮不可用
            if (slotSize.getValue() === '') {
                addSlot.disable();
            }
            else {
                addSlot.enable();
            }
        }

        /**
         * 弹出对话框供用户选择广告位
         *
         * @ignore
         */
        function selectSlots() {
            var slotSize = this.get('slot-size').getValue().split('*');
            var slotWidth = slotSize[0];
            var slotHeight = slotSize[1];
            var urlWithParam = 
                '/slot/select~width=' + slotWidth + '&height=' + slotHeight;

            var properties = {
                url: urlWithParam,
                title: '添加广告位',
                width: 860
            };
            var loading = this.waitActionDialog(properties);
            loading.then(u.bind(receiveSlotSelector, this));
        }

        function receiveSlotSelector(e) {
            e.target.on('action@select', addSlots, this);
            e.target.on(
                'action@cancel',
                u.bind(e.target.destroy, e.target)
            );
        }

        /**
         * 添加广告位
         * 
         * @private
         */
        function addSlots(e) {
            var newSlots;
            if (e.target && e.target.getAction()) {
                newSlots = e.target.getAction().getSelectedSlots();
            }
            var slots = u.map(
                newSlots,
                function (item) {
                    var slot = u.pick(
                        item,
                        'id',
                        'name',
                        'status',
                        'channelName',
                        'size'
                    );
                    //var priceModels = ['CPD', 'CPM', 'CPC'];
                    //slot.priceModel = priceModels[slot.priceModel];
                    //slot.amount = { type: 0, total: null };
                    return slot;
                }
            );
            e.target.dispose();
            this.fire('addslots', { slots: slots });
        }


        /**
         * 切换广告位列表有和空的状态
         * 
         * @private
         */
        function toggleSlotPanel(newSlots) {
            var slotList = this.get('slot-list');
            var slotListEmpty = this.get('slot-list-empty');

            if (newSlots && newSlots.length !== 0) {
                slotListEmpty.hide();
                slotList.show();
            }
            else {
                slotList.hide();
                slotListEmpty.show();
            }
        }

        /**
         * 触发删除已选广告位事件
         * @param {Object} e 控件事件对象
         */ 
        function deleteSlot(e) {
            if (e.name === 'deleteslot') {
                var slots = this.get('slot-amount').getRawValue().slots;
                var slotID = e.args;
                this.fire('deleteslot', { id: slotID, slots: slots });
            }
        }


        /**
         * 刷新目标广告位和投放量控件的广告位Datasource
         *
         * @param {Array} newSlots 新广告位对象数组
         */
        DeliveryFormView.prototype.refleshSlots = function (newSlots) {
            this.get('slots-validity').hide();

            var slotsTable = this.get('slots-table');
            var amountAction = this.get('slot-amount');

            var priceModel = this.get('price-model').getValue();

            slotsTable.set('datasource', newSlots);
            amountAction.set(
                'actionOptions', 
                { 
                    'selectedSlots': newSlots,
                    'priceModel': priceModel 
                }
            );

            toggleAddSlot.call(this);
            toggleSlotPanel.call(this, newSlots);
        };

        /**
         * 切换时间控件模式（连续-非连续）
         *
         * @private
         */
        function toggleTimeModel(dateModel, timeModel) {
            var continuousTimePanel = this.get('continuous-time-panel');
            var discontinuousTimePanel = this.get('discontinuous-time-panel');
            var continuousGroup = this.getGroup('continuous-time');
            var discontinuousGroup = this.getGroup('discontinuous-time');

            var endTimePanel = this.get('continuous-end-time-panel');
            var endlessTimePanel = this.get('continuous-endless-time-panel');
            var endTimeGroup = this.getGroup('end-time');
            var endTimeLabel = this.get('end-time-label');

            var priceModel = this.get('price-model');

            // 初始化控件状态
            continuousTimePanel.hide();
            continuousGroup.disable();
            discontinuousTimePanel.hide();
            discontinuousGroup.disable();

            // 切换连续
            if (dateModel === 'continuous') {
                continuousTimePanel.show();
                continuousGroup.enable();
                // 切换有结束时间
                if (timeModel === 'end') {
                    endlessTimePanel.hide();
                    endTimeGroup.enable();
                    endTimePanel.show();
                    // CPM时不允许出现不限时间文字链
                    if (priceModel.getValue() === '1') {
                        endTimeLabel.hide();
                    }
                    else {
                        endTimeLabel.show();
                    }
                }
                // 切换无结束时间
                else if (timeModel === 'endless') {
                    endTimePanel.hide();
                    endTimeGroup.disable();
                    endlessTimePanel.show();
                }
                else {
                    // 如果切到非连续时售卖方式不是CPM，且为不限结束时间状态，
                    // 但切回到连续时，售卖方式已经改为CPM，则需要强制切回有限
                    // 的结束时间状态。
                    if (this.dateTimeRunTime.timeModel === 'endless'
                        &&　priceModel.getValue() === '1') {
                        toggleTimeModel.call(this, 'continuous', 'end');
                    }
                }
            }
            // 切换不连续
            else {
                // 视图切换
                discontinuousTimePanel.show();
                discontinuousGroup.enable();
            }

            // 同步运行时变量
            this.dateTimeRunTime.dateModel = dateModel;
            // 如果timeModel为空字符串时，不更新运行时变量
            this.dateTimeRunTime.timeModel = 
                timeModel === '' ? this.dateTimeRunTime.timeModel : timeModel;
        }

        /**
         * 数据同步
         *
         * @private
         */
        function syncDate() {
            // 仅在有结束时间情况下同步时间到非连续时间控件
            if (this.dateTimeRunTime.timeModel === 'end') {
                var beginDate = this.get('begin-date').getRawValue();
                var endData = this.get('end-date').getRawValue();

                this.get('discontinuous-time').setRanges(
                    [{ begin: beginDate, end: endData }]
                );
            }
        }
                

        /**
         * 根据售卖方式，切换结束时间
         *
         * @private
         */
        function toggleTimeModelByPriceModel() {
            // 如果时间控件在连续时间段面板，且售卖方式为`CPM:1`
            // 则强制切换时间控件面板到`连续 - 有结束时间`模式
            var priceModel = this.get('price-model');
            if (this.dateTimeRunTime.dateModel === 'continuous'
                && priceModel.getValue() === '1') {
                toggleTimeModel.call(this, 'continuous', 'end');
            }
            else {
                toggleTimeModel.call(
                    this, 
                    this.dateTimeRunTime.dateModel, 
                    this.dateTimeRunTime.timeModel
                );
            }
        }

        /**
         * 根据表单类型，给定相应的默认值
         *
         * @private
         */
        function initPriority() {
            var model = this.model;
            var priorityClass = this.get('priority-class');
            // 直投 - 默认标准 - 7
            // 内部 - 默认内部 - 31
            if (model.get('formType') === 'create') {
                priorityClass.setValue('standard');
                togglePriority.call(this);
            }
            else {
                // 优先级显示内容
                var priorityValue = model.get('priority');
                var priorityClassValue = '';
                if (priorityValue === 1) {
                    priorityClassValue = 'mono';
                }
                else if (priorityValue >= 2 && priorityValue <= 11) {
                    priorityClassValue = 'standard';
                }
                else if (priorityValue >= 12 && priorityValue <= 21) {
                    priorityClassValue = 'yield';
                }
                else {
                    priorityClassValue = 'houseAD';
                }
                priorityClass.setValue(priorityClassValue);
                togglePriority.call(this);
                this.get('priority').setValue(model.get('priority'));
            }
        }

        /**
         * 根据优先级的类型，给定不同的优先级级别数据
         *
         * @private
         */
        function togglePriority() {
            var priorityClass = this.get('priority-class');
            var priority = this.get('priority');

            var model = this.model;

            if (priorityClass.getValue()) {
                var priorityClass = priorityClass.getValue();

                // 先设置当前优先级类型下的Datasource
                priority.set(
                    'datasource', 
                    model.get('prioritySets')[priorityClass]
                );

                // 独占，1，默认1
                // 标准，2-11级，默认7
                // 库存收益，12-21，默认17
                // 内部，22-31，默认31
                var defaultSelected = {
                    mono: 0,
                    standard: 5,
                    'yield': 5,
                    houseAD: 9
                };

                // Datasource在Model里给过了，这里设置一下默认选中的下标值
                priority.set(
                    'selectedIndex', 
                    defaultSelected[priorityClass]
                );       
            }
        }

        /**
         * 设置权重切换
         *
         * @private
         */
        function toggleWeight() {
            var setWeight = this.get('set-weight');
            var weightPanel = this.get('weight-panel');
            var weightGroup = this.getGroup('weight');

            if (setWeight.isChecked()) {
                weightGroup.enable();
                weightPanel.show();
            }
            else {
                weightPanel.hide();
                weightGroup.disable();
            }
        }

        /**
         * 设置每日投放量切换
         *
         * @private
         */
        function toggleBalanceDelivery() {
            var setBalanceDelivery = this.get('set-balance-delivery');
            var balanceDeliveryPanel = this.get('balance-delivery-panel');
            var balanceDeliveryGroup = this.getGroup('balance-delivery');

            if (setBalanceDelivery.isChecked()) {
                balanceDeliveryGroup.enable();
                balanceDeliveryPanel.show();
            }
            else {
                balanceDeliveryPanel.hide();
                balanceDeliveryGroup.disable();
            }

            toggleDeliverySpeed.call(this);
        }

        /**
         * 根据售卖方式设置每日投放量，CPM广告不能设置每天展现次数
         *
         * @private
         */
        function toggleBalanceDeliveryByPriceModel() {
            var priceModel = this.get('price-model');
            var balanceDeliveryType = this.get('balance-delivery-type');

            if (priceModel.getValue() === '1') {
                balanceDeliveryType.set(
                    'datasource',
                    [
                        { text: '点击', value: 2 }
                    ]
                );
            }
            else {
                var type = balanceDeliveryType.getValue();
                balanceDeliveryType.set(
                    'datasource',
                    [
                        { text: '展现', value: 1 },
                        { text: '点击', value: 2 }
                    ]
                );
                balanceDeliveryType.setValue(type);
            }
        }

        /**
         * 编辑时设置相应的每日投放量类型
         *
         * @private
         */
        function initBalanceDeliveryType() {
            var balanceDeliveryType = this.get('balance-delivery-type');
            balanceDeliveryType.setValue(
                this.model.get('balancedDeliveryType')
            );
        }

        /**
         * 设置投放上限切换
         *
         * @private
         */
        function toggleTotalDelivery() {
            var totalDeliveryMainPanel = this.get('total-delivery-main-panel');
            var setTotalDelivery = this.get('set-total-delivery');
            var totalDeliveryPanel = this.get('total-delivery-panel');
            var totalDeliveryGroup = this.getGroup('total-delivery');

            var priceModel = this.get('price-model');

            // 仅CPD广告位的广告显示此设置
            if (priceModel.getValue() === '0') {
                totalDeliveryMainPanel.show();
                setTotalDelivery.enable();
                if (setTotalDelivery.isChecked()) {
                    totalDeliveryGroup.enable();
                    totalDeliveryPanel.show();
                }
                else {
                    totalDeliveryPanel.hide();
                    totalDeliveryGroup.disable();
                }
            }
            else {
                totalDeliveryMainPanel.hide();
                setTotalDelivery.disable();
                totalDeliveryGroup.disable();
            }
        }

        /**
         * 频次控制切换
         *
         * @private
         */
        function toggleFrequency() {
            var setFrequency = this.get('set-frequency');
            var frequencyPanel = this.get('frequency-panel');
            var frequencyGroup = this.getGroup('frequency');
            var addFrequency = this.get('add-frequency');

            if (setFrequency.isChecked()) {
                // frequencyGroup.enable();
                addFrequency.enable();
                frequencyPanel.show();
                freshFrequency.call(this);
            }
            else {
                frequencyPanel.hide();
                frequencyGroup.disable();
            }
        }

        /**
         * 获取频次控制控件的当前值，并同步到TempModel
         *
         * @private
         */
        function updateFrequencyModel() {
            var types = [];
            var amounts = [];

            var tempModel = this.frequencyRuntime.tempModel;

            for (var i = 0; i < tempModel.length; i++) {
                // 依次获取控件实体
                var currentType = this.get('frequency-type-' + i);
                types.push(currentType);
                var currentAmount = this.get('frequency-amount-' + i);
                amounts.push(currentAmount);

                // 依次根据控件的值，同步TempModel的值
                tempModel[i].type = currentType.getRawValue();
                tempModel[i].amount = currentAmount.getRawValue();
            }
        }

        /**
         * 根据TempModel刷新频次控制控件组的视图
         *
         * @private
         */
        function freshFrequency() {
            // 获取并初始化控件，并按类别分组
            var panels = [];
            var groups = [];
            var types = [];
            var amounts = [];
            var deletes = [];

            // 初始化：disable和hide所有group和panel，并分类存入数组
            var maxLineNum = this.frequencyRuntime.maxLineNum;
            for (var i = 0; i < maxLineNum; i++) {
                var currentPanel = this.get('frequency-subpanel-' + i);
                currentPanel.hide();
                panels.push(currentPanel);
                var currentGroup = this.getGroup('line' + i);
                currentGroup.disable();
                groups.push(currentGroup);
                var currentType = this.get('frequency-type-' + i);
                types.push(currentType);
                var currentAmount = this.get('frequency-amount-' + i);
                amounts.push(currentAmount);
                var currentDelete = this.get('delete-frequency-' + i);
                deletes.push(currentDelete);
            }

            // 根据TempModel控制控件的disable和hide属性，同时写入value
            var tempModel = this.frequencyRuntime.tempModel;
            for (var j = 0; j < tempModel.length; j++) {
                var currentModel = tempModel[j];
                groups[j].enable();
                types[j].setRawValue(currentModel.type);
                amounts[j].setRawValue(currentModel.amount);
                panels[j].show();
            }
            

            // 当达到最大显示行数时，隐藏添加维度控件
            if (tempModel.length === maxLineNum) {
                this.get('add-frequency').hide();
            }
            else {
                this.get('add-frequency').show();
            }

            // 当仅剩1条显示行数时，隐藏第1行删除控件
            if (tempModel.length === 1) {
                this.get('delete-frequency-0').hide();
            }
            else {
                this.get('delete-frequency-0').show();
            }
        }

        /**
         * 获取当前可用的最大的频率维度
         *
         * @private
         */
        function getMaxFrequencyType() {
            var types = 
                ['day', 'hour', 'thirtyMin', 'twentyMin', 'tenMin', 'min'];
            var tempModel = this.frequencyRuntime.tempModel;
            u.each(
                tempModel,
                function (item) {
                    var index = u.indexOf(types, item.type);
                    if (index !== -1) {
                        types.splice(index, 1);
                    }
                }
            );

            return types[0];
        }

        /**
         * 添加维度
         *
         * @private
         */
        function addFrequency() {
            updateFrequencyModel.call(this);
            var item = {
                type: getMaxFrequencyType.call(this),
                amount: ''
            };
            this.frequencyRuntime.tempModel.push(item);
            freshFrequency.call(this, 'process');
        }

        /**
         * 删除维度
         *
         * @private
         */
        function deleteFrequency(deleteLine) {
            updateFrequencyModel.call(this);
            this.frequencyRuntime.tempModel.splice(deleteLine, 1);
            freshFrequency.call(this, 'process');
            validateFrequency.call(this);
        }

        /**
         * 获取当前所有维度类型
         *
         * @private
         */
        function getAllFrequencyType() {
            var tempModel = this.frequencyRuntime.tempModel;
            var allTypes = [];

            for (var i = 0; i < tempModel.length; i++) {
                var currentType = this.get('frequency-type-' + i);
                allTypes.push(currentType.getValue());
            }

            return allTypes;
        }

        /**
         * 检测维度冲突
         *
         * @private
         */
        function conflictDetection(currentLineNumber, e) {
            var currentSelect = this.get('frequency-type-' + currentLineNumber);
            var currentType = currentSelect.getValue();
            var allTypes = getAllFrequencyType.call(this);

            var conflict = u.filter(
                allTypes,
                function (item, index) {
                    return currentType === allTypes[index];
                }
            );

            var message = '';
            var validState = 'valid';
            if (conflict.length > 1) {
                message = '已经设置了该维度的上限，请勿重复设置。';
                validState = 'invalid';
                this.frequencyRuntime.conflict = true;
            }
            var validity = new Validity();
            validity.setCustomValidState(validState);
            validity.setCustomMessage(message);
            currentSelect.showValidity(validity);
        }

        /**
         * 遍历检测维度冲突，同时用于删除时恢复提示之用
         *
         * @private
         */
        function validateFrequency(e) {
            var tempModel = u.clone(this.frequencyRuntime.tempModel);
            this.frequencyRuntime.conflict = false;
            for (var i = 0; i < tempModel.length; i++) {
                conflictDetection.call(this, i, e);
            }
        }

        /**
         * 提交时遍历检测维度冲突，并终止提交
         *
         * @private
         */
        function validateFrequencyOnSubmit(e) {
            if (e && e.validity && e.validity.isValid()) {
                var allTypes = getAllFrequencyType.call(this);
                var currentSelect = e.target;
                var currentType = currentSelect.getValue();

                var conflict = u.filter(
                    allTypes,
                    function (item, index) {
                        return currentType === allTypes[index];
                    }
                );

                if (conflict.length > 1) {
                    var message = '已经设置了该维度的上限，请勿重复设置。';
                    var state = new ValidityState(false, message);
                    e.validity.addState('custom', state);
                }
            }
        }

        /**
         * 创意轮换策略切换
         *
         * @private
         */
        function toggleAdInturn() {
            var adInturn = this.get('ad-inturn');
            var adInturnSlidePanel = this.get('ad-inturn-slide-panel');
            var adInturnSlideGroup = this.getGroup('ad-inturn-slide');

            // 如果轮换策略为 幻灯片:2
            if (adInturn.getRawValue() === '2') {
                adInturnSlideGroup.enable();
                adInturnSlidePanel.show();
            }
            else {
                adInturnSlidePanel.hide();
                adInturnSlideGroup.disable();
            }
        }

        /**
         * 切换定向设置通用函数
         *
         * @private
         */
        function toggleOrientations(type) {
            var radio = this.get('set-' + type);
            var locate = this.get(type);

            if (radio.getRawValue()[0] === '1') {
                locate.enable();
                locate.show();
            }
            else {
                locate.hide();
                locate.disable();
            }
        }

        /**
         * 切换其它定向设置
         *
         * @private
         */
        function toogleOtherOrients() {
            var otherLocatePanel = this.get('other-locate-panel');
            var otherOrients = this.get('other-orients');

            if (otherLocatePanel.getExpanded()) {
                otherOrients.enable();
            }
            else {
                otherOrients.disable();
            }
        }

        /**
         * 根据售卖方式，切换投放量设置控件组
         *
         * @private
         */
        function toggleSlotsAmount() {
            var slotsAmount = this.get('slot-amount');
            var priceModel = this.get('price-model');

            // 在CPD计费方式下：不显示投放量
            if (priceModel.getValue() === '0') {
                slotsAmount.hide();
                slotsAmount.disable();
            }
            // 在CPC计费方式下：显示投放量，但只显示每个广告位的总量
            // 在CPM计费方式下：显示投放量，且允许各广告位平均或自定义分配投放量
            else {
                // FIXME：有可能子Action还没加载完
                this.fire('pricemodelchange',  { priceModel: priceModel });
                slotsAmount.show();
                slotsAmount.enable();
            }

            // 同步触发一下amount section的显示与隐藏
            toggleAmountSection.call(this);
        }
        
        /**
         * 设置投放上限切换
         *
         * @private
         */
        function toggleDeliverySpeed() {
            var deliverySpeed = this.get('delivery-speed');
            var setDeliverySpeed = this.get('set-delivery-speed');
            var deliverySpeedPanel = this.get('delivery-speed-panel');
            var deliverySpeedGroup = this.getGroup('delivery-speed');
            var deliverySpeedType = this.get('delivery-speed-type');

            var priceModel = this.get('price-model');

            // 在CPM计费方式下：投放速度面板一直显示
            if (priceModel.getValue() === '1') {
                deliverySpeed.show();
                setDeliverySpeed.enable();
                if (setDeliverySpeed.isChecked()) {
                    deliverySpeedType.enable();
                    deliverySpeedPanel.show();
                }
                else {
                    deliverySpeedPanel.hide();
                    deliverySpeedType.disable();
                }
            }
            // 在CPD/CPC计费方式下
            else {
                var setBalanceDelivery = this.get('set-balance-delivery');
                var balanceDeliveryType = this.get('balance-delivery-type');
                var balanceDeliveryAmount = this.get('balance-delivery-amount');

                // 每日投放量限制选了展现量时才会显示
                if (setBalanceDelivery.isChecked()
                    && balanceDeliveryType.getValue() === '1'
                    && balanceDeliveryAmount.getValue() !== ''
                ) {
                    deliverySpeed.show();
                    setDeliverySpeed.enable();
                    if (setDeliverySpeed.isChecked()) {
                        deliverySpeedType.enable();
                        deliverySpeedPanel.show();
                    }
                    else {
                        deliverySpeedPanel.hide();
                        deliverySpeedType.disable();
                    }
                }
                else {
                    deliverySpeed.hide();
                    deliverySpeedGroup.disable();
                }
            }

            // 同步触发一下amount section的显示与隐藏
            toggleAmountSection.call(this);
        }

        /**
         * 设置投放上限切换
         *
         * @private
         */
        function toggleAmountSection() {
            var section = this.get('amount-section');

            if (this.get('slot-amount').isHidden() 
                && this.get('delivery-speed').isHidden()
            ) {
                section.hide();
            }
            else {
                section.show();
            }
        }

        DeliveryFormView.prototype.redirectUrl = null;

        /**
         * 保存并上传创意
         *
         * @private
         */
        function submitThenAddCreative() {
            this.redirectUrl = '#/creative/create';
            // 注：必须触发form的submit事件，否则不会触发控件自身的校验逻辑
            this.get('form').validateAndSubmit();
        }

        /**
         * 渲染
         *
         * @override
         */
        DeliveryFormView.prototype.enterDocument = function () {
            FormView.prototype.enterDocument.apply(this, arguments);

            var model = this.model;

            if (model.get('formType') === 'create') {
                toggleSlotPanel.call(this);
                toggleAddSlot.call(this);
                toggleTimeModel.call(this, 'continuous', 'end');
                initPriority.call(this);
                toggleWeight.call(this);
                toggleBalanceDelivery.call(this);
                toggleTotalDelivery.call(this);
                // freshFrequency.call(this, 'create');
                toggleFrequency.call(this);
                toggleAdInturn.call(this);
                toggleOrientations.call(this, 'region');
                toggleOrientations.call(this, 'schedule');
                toggleOrientations.call(this, 'browser');
                toggleOrientations.call(this, 'resolution');
                toggleBalanceDeliveryByPriceModel.call(this);
                toggleSlotsAmount.call(this);
                toggleDeliverySpeed.call(this);
            }

            if (model.get('formType') === 'update') {
                // 广告位控件切换
                toggleSlotPanel.call(this, this.model.get('selectedSlots'));

                // 根据标志位切换时间控件模式
                toggleTimeModel.call(
                    this, 
                    this.model.get('dateModel'), 
                    this.model.get('timeModel')
                );

                // 配置并初始化权重
                initPriority.call(this);

                // 如果有已选数据定向，则展开相应定向面板
                if (model.get('region')) {
                    this.get('set-region').setValue('1');
                }
                toggleOrientations.call(this, 'region');
                if (model.get('schedule')) {
                    this.get('set-schedule').setValue('1');
                }
                toggleOrientations.call(this, 'schedule');
                if (model.get('browser').targetData.allData.length > 0) {
                    this.get('set-browser').setValue('1');
                }
                toggleOrientations.call(this, 'browser');
                if (model.get('resolution').targetData.allData.length > 0) {
                    this.get('set-resolution').setValue('1');
                }
                toggleOrientations.call(this, 'resolution');
                if (model.get('otherOrientsExpanded')) {
                    this.get('other-locate-panel').toggle();
                }

                // 渲染权重相关
                if (model.get('weight') !== null) {
                    this.get('set-weight').setChecked(true);
                }    
                toggleWeight.call(this);

                // 渲染每日投放量相关
                if (model.get('balancedDeliveryType') !== '0') {
                    this.get('set-balance-delivery').setChecked(true);
                }
                toggleBalanceDelivery.call(this);
                toggleBalanceDeliveryByPriceModel.call(this);
                initBalanceDeliveryType.call(this);

                // 渲染投放上限
                if (model.get('totalDeliveryType') !== 0) {
                    this.get('set-total-delivery').setChecked(true);
                }
                toggleTotalDelivery.call(this);

                // 渲染频次控制
                if (this.model.get('frequencyData').length > 0) {
                    this.get('set-frequency').setChecked(true);
                    this.frequencyRuntime.tempModel = 
                        this.model.get('frequencyData');
                }
                toggleFrequency.call(this);

                // 创意轮换渲染
                toggleAdInturn.call(this);

                // 投放量控件切换
                toggleSlotsAmount.call(this);

                // 投放速度
                if (this.model.get('deliverySpeed') !== 0) {
                    this.get('set-delivery-speed').setChecked(true);
                }
                toggleDeliverySpeed.call(this);
            }
        };

        /**
         * 从表单中获取实体数据
         *
         * @return {Object}
         */
        DeliveryFormView.prototype.getEntity = function () {
            var entity = FormView.prototype.getEntity.apply(this, arguments);
            
            // 售卖方式数据格式处理
            entity.priceModel = parseInt(entity.priceModel[0], 10);

            // 连续时间段开始时间数据处理
            if (entity.beginDate) {
                entity.beginDate =
                    moment(entity.beginDate.toString()).format('YYYYMMDD');
                entity.beginTime = entity.beginTime.replace(':', '');
                entity.beginTime = entity.beginDate + entity.beginTime + '00';
            }

            // 连续时间段结束时间数据处理
            if (entity.endDate) {
                entity.endDate =
                    moment(entity.endDate.toString()).format('YYYYMMDD');
                entity.endTime = entity.endTime.replace(':', '');
                entity.endTime = entity.endDate + entity.endTime + '00';
            }

            // 总定向数据字段，因为非连续时间也是一种定向，因此在此处初始化
            entity.locateInfos = [];

            // 非连续投放时间数据处理
            if (entity.discontinuousTime 
                && entity.discontinuousTime.length > 0
            ) { 
                var discontinuousTimes = 
                    this.get('discontinuous-time').getValue();
                discontinuousTimes = discontinuousTimes.split(',');

                var formattedDiscontinuousTimes = [];
                u.each(
                    discontinuousTimes,
                    function (item) {
                        formattedDiscontinuousTimes.push(
                            moment(item).format('YYYYMMDD')
                        );
                    }
                );

                var orientDate = {
                    orientEName: 'date',
                    orientOp: 0,
                    orientValue: formattedDiscontinuousTimes
                };
                entity.locateInfos.push(orientDate);

                // 同时根据接口，开始和结束时间分别为非连续第一个和最后一个时间
                entity.beginTime = formattedDiscontinuousTimes[0] + '000000';
                var endIndex = formattedDiscontinuousTimes.length - 1;
                entity.endTime = 
                    formattedDiscontinuousTimes[endIndex] + '235959';
            }

            // 设置优先级数据格式string-->int
            entity.priority = parseInt(entity.priority, 10);

            // 设置权重数据格式string-->int
            if (entity.setWeight === '1') {
                entity.weight = parseInt(entity.weight, 10);
            }

            // 设置每日投放量的数据格式string-->int
            if (entity.setBalancedDelivery === '1') {
                entity.balancedDeliveryType = 
                    parseInt(entity.balancedDeliveryType, 10);
                entity.balancedDeliveryAmount = 
                    parseInt(entity.balancedDeliveryAmount, 10);
            }

            /*
             * 返回首字母大写的单词
             */
            function firstUpper(word) {
                var first = word.charAt(0).toUpperCase();
                return first + word.slice(1);
            }

            // 处理频次控制的数据
            if (entity.setFrequency === '1') {
                // 只有一个的时候是字符串，需要传一下
                if (typeof entity.frequencyType === 'string') {
                    entity.frequencyType = [entity.frequencyType];
                    entity.frequencyAmount = [entity.frequencyAmount];
                }
                for (var i = 0; i < entity.frequencyType.length; i++) {
                    entity['fre' + firstUpper(entity.frequencyType[i])] = 
                        parseInt(entity.frequencyAmount[i], 10);
                }
            }

            // 轮换方式数据处理
            entity.adInturn = parseInt(entity.adInturn, 10);
            
            // 处理地域数据
            if (entity.setRegion[0] === '1' && entity.region.length > 0) {
                var orientRegion = {
                    orientEName: 'region',
                    orientOp: 0,
                    orientValue: entity.region
                };
                entity.locateInfos.push(orientRegion);
            }

            // 处理投放日程数据
            var isScheduleNotEmpty = u.any(u.flatten(entity.schedule));
            if (entity.setSchedule[0] === '1' && isScheduleNotEmpty) {
                // 展开schedule控件的二维数组
                var schedule = entity.schedule;
                var discreteOutput = [];
                for (var day = 0; day < 7; day++) {
                    for (var hour = 0; hour < 24; hour++) {
                        if (schedule[day][hour] === 1) {
                            discreteOutput.push(
                                ''
                                + (day + 1)
                                + ((hour < 10) ? ('0' + hour) : hour)
                            );
                        }
                    }
                }

                // 合并连续时间段
                var mergedSchedule = [discreteOutput[0]];
                u.reduce(
                    discreteOutput,
                    function (previous, current) {
                        // 字符串相减也是数字无所谓，相隔1小时的就不放进结果里，
                        // 不然就放个结束的放个开始的，第一次循环`previous`是`undefined`反正也不进分支
                        if (current - previous !== 1) {
                            var previous = parseInt(previous, 10) + 1;
                            mergedSchedule.push(previous.toString(), current);
                        }
                        return current;
                    }
                );
                // 再加上最后一个
                var lastTime = 
                    parseInt(discreteOutput[discreteOutput.length - 1], 10) + 1;

                mergedSchedule.push(lastTime.toString());

                if (entity.setSchedule[0] === '1') {
                    var orientSchedule = {
                        orientEName: 'weektime',
                        orientOp: 0,
                        orientValue: mergedSchedule
                    };
                    entity.locateInfos.push(orientSchedule);
                }
            }
            
            // 处理浏览器数据
            if (entity.setBrowser[0] === '1' && entity.browser.length > 0) {
                var browserValue = u.map(
                    entity.browser,
                    function (item) {
                        return item.id;
                    }
                );
                var orientBrowser = {
                    orientEName: 'browser',
                    orientOp: 0,
                    orientValue: browserValue
                };
                entity.locateInfos.push(orientBrowser);
            }
            
            // 处理分辨率数据
            if (entity.setResolution[0] === '1'
                && entity.resolution.length > 0
            ) {
                var resolutionValue = u.map(
                    entity.resolution,
                    function (item) {
                        return item.id;
                    }
                );
                var orientResolution = {
                    orientEName: 'resolution',
                    orientOp: 0,
                    orientValue: resolutionValue
                };
                entity.locateInfos.push(orientResolution);
            }

            /*
             * 提取其它定向数据通用函数
             */
            function getOrientFromOtherOrients(id, name) {
                var orientInfo = u.where(
                    otherOrients,
                    { id: id }
                );
                if (orientInfo.length > 0) {
                    var orientValue = u.map(
                        orientInfo[0].data,
                        function (item) {
                            if (item.id) {
                               return item.id; 
                            }
                            else {
                                return item;
                            }
                        }
                    );
                    var orientOp = (orientInfo[0].state === 'equal') ? 0 : 1;
                    var orient = {
                        orientEName: name,
                        orientOp: orientOp,
                        orientValue: orientValue
                    };
                    return orient;
                }
                else {
                    return null;
                }
            }

            // 处理其它定向数据
            if (entity.otherOrients) {
                var otherOrients = entity.otherOrients;

                // 接入方式
                var orientConnect = getOrientFromOtherOrients(5, 'connect');
                if (orientConnect) { 
                    entity.locateInfos.push(orientConnect); 
                }

                // 浏览器语言
                var orientLanguage = getOrientFromOtherOrients(6, 'language');
                if (orientLanguage) { 
                    entity.locateInfos.push(orientLanguage); 
                }

                // 操作系统
                var orientSystem = getOrientFromOtherOrients(7, 'system');
                if (orientSystem) { 
                    entity.locateInfos.push(orientSystem); 
                }

                // 来源域
                var orientRefer = getOrientFromOtherOrients(8, 'refer');
                if (orientRefer) { 
                    entity.locateInfos.push(orientRefer); 
                }

                // 被访url
                var orientVisitURL = getOrientFromOtherOrients(9, 'visiturl');
                if (orientVisitURL) { 
                    entity.locateInfos.push(orientVisitURL); 
                }
            }

            // 根据计费方式处理投放量子Action数据
            if (entity.priceModel === 0) {
                entity.adPositions = this.model.get('selectedSlots');
            }
            else {
                entity.adPositions = entity.amount.slots; 
            }

            // 处理投放速度
            if (entity.setDeliverySpeed === '1') {
                entity.deliverySpeed =
                    parseInt(entity.deliverySpeed, 10);
            }

            // 过滤以下字段
            var omitKeys = [
                'slotSize', 
                'beginDate',
                'endDate',
                'discontinuousTime',
                'priorityClass',
                'setWeight',
                'setBalancedDelivery',
                'setFrequency',
                'frequencyType',
                'frequencyAmount',
                'setRegion',
                'setSchedule',
                'schedule',
                'setBrowser',
                'setResolution',
                'otherOrients',
                'amount',
                'setTotalDelivery'
            ];

            if (entity.locateInfos && entity.locateInfos.length < 1) {
                omitKeys.push('locateInfos');
            }

            return u.omit(entity, omitKeys);
        };

        /**
         * 向用户通知广告位错误信息
         *
         * @public
         */
        DeliveryFormView.prototype.showSlotValidate = function (msg) {
            this.get('slots-validity').setText(msg);
            this.get('slots-validity').show();
        };

        /**
         * 向用户通知提交错误信息
         *
         * @param {Object} errors 错误信息
         * @param {Object[]} errors.fields 出现错误的字段集合
         *
         * @override
         */
        DeliveryFormView.prototype.notifyErrors = function (errors) {
            var Validity = require('esui/validator/Validity');
            var ValidityState = require('esui/validator/ValidityState');
            var form = this.get('form');

            for (var i = 0; i < errors.fields.length; i++) {
                var fail = errors.fields[i];

                if (fail.field === 'slotValidate') {
                    this.fire('showslotvalidate', fail.message);
                }
                else {
                    var state = new ValidityState(false, fail.message);
                    var validity = new Validity();
                    validity.addState('server', state);

                    var input = form.getInputControls(fail.field)[0];
                    if (input) {
                        input.showValidity(validity);
                    }
                }
            }
        };

        return DeliveryFormView;
    }
);