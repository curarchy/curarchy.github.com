/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 广告表单数据模型类
 * @author liyidong(srhb18@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var FormModel = require('common/FormModel');
        var Data = require('./Data');
        var util = require('er/util');
        var u = require('underscore');
        var moment = require('moment');

        /**
         * 广告表单数据模型类
         *
         * @constructor
         * @extends common/FormModel
         */
        function DeliveryFormModel() {
            FormModel.apply(this, arguments);
            this.data = new Data();
        }

        util.inherits(DeliveryFormModel, FormModel);

        /**
         * 数据源配置
         *
         * @type {Object}
         * @override
         */
        DeliveryFormModel.prototype.datasource = [
        {
            orderInfo: function (model) {
                var orderId;
                if (model.get('orderId')) {
                    orderId = model.get('orderId');
                }
                else {
                    orderId = model.get('order');
                }

                var orderInfo = model.data.getOrderById(orderId).then(
                    function (response) {
                        return response;
                    }
                );

                return orderInfo;
            }
        },
        {   
            /*
             * 面包屑数据
             */
            crumbPath: function (model) {
                var crumbPath = [
                    { text: '所有订单', href: '#/order/all' }
                ];
                var order = model.get('orderInfo');
                
                crumbPath.push(
                {
                    text: order.adowner.name,
                    href: '#/customer/detail~id=' + order.adowner.id
                }
                );
                crumbPath.push(
                {
                    text: order.name, 
                    href:'#/order/detail~id=' + order.id
                }
                );
                crumbPath.push({ text: model.get('title') });

                return crumbPath;
            },

            /*
             * 广告名称，设置默认值为`订单名称_创建于 YYYY MM DD HH:MM:SS`
             */
            name: function (model) {
                var name = model.get('name');
                var orderName = model.get('orderInfo').name;
                var createTime = moment().format('YYYY MM DD HH:mm:ss');
                var defaultName = orderName + '_创建于 ' + createTime;
                return name || defaultName;
            },

            /*
             * 转换计费方式int-->string
             */
            priceModel: function (model) {
                var value = model.get('priceModel');
                return typeof value === 'number' ? value + '' : value;
            },

            /*
             * 从常量表获取广告位尺寸数据
             */
            sizes: function (model) {
                return model.loadSizes();
            },

            /*
             * 日期起始时间
             */
            dateRange: function (model) {
                var rangeStart = moment().format('YYYY-MM-DD');
                var rangeEnd = '2030-12-31';
                return [rangeStart, rangeEnd].join(',');
            },

            /*
             * 权重控件级联数据
             */
            prioritySets: function (model) {
                var datasource = {
                    mono: [1],
                    standard: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
                    'yield': [12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
                    houseAD: [22, 23, 24, 25, 26, 27, 28, 29, 30, 31]
                };
                u.each(
                    datasource,
                    function (value, key) {
                        datasource[key] = u.map(
                            value,
                            function (item) {
                                return {
                                    text: item.toString(),
                                    value: item
                                };
                            }
                        );
                    }
                );
                return datasource;
            },

            /*
             * 频次控制相关数据源
             */
            frequencyData: function (model) {
                var entity = model.get('entity');
                var datasource = {
                    day: entity.freDay,
                    hour: entity.freHour,
                    thirtyMin: entity.freThirtyMin,
                    twentyMin: entity.freTwentyMin,
                    tenMin: entity.freTenMin,
                    min: entity.freMin
                };
                var frequencyData = [];
                u.each(
                    datasource,
                    function (value, key) {
                        if (datasource[key] > 0) {
                            frequencyData.push({ 
                                type: key,
                                amount: value 
                            });
                        }
                    }
                );

                return frequencyData;
            },

            /*
             * 获取地域数据（备选）
             */
            regionData: function (model) {
                var regionData = model.loadRegionData();
                return regionData;
            },

            /*
             * 获取浏览器数据（备选&已选择）
             */
            browser: function (model) {
                var data = model.loadOrientData('browser');
                var sourceData = data.source;
                var selected = data.selected;
                
                return {
                    sourceData: { allData: sourceData, selectedData: selected },
                    targetData: { allData: selected, selectedData: [] }
                };
            },

            /*
             * 获取分辨率数据（备选&已选择）
             */
            resolution: function (model) {
                var data = model.loadOrientData('resolution');
                var sourceData = data.source;
                var selected = data.selected;
                
                return {
                    sourceData: { allData: sourceData, selectedData: selected },
                    targetData: { allData: selected, selectedData: [] }
                };
            },

            /*
             * 获取接入方式数据（备选&已选择）
             */
            connect: function (model) {
                var data = model.loadOrientData('connect');
                return data;
            },

            /*
             * 获取浏览器语言数据（备选&已选择）
             */
            language: function (model) {
                var data = model.loadOrientData('language');
                return data;
            },

            /*
             * 获取操作系统数据（备选&已选择）
             */
            system: function (model) {
                var data = model.loadOrientData('system');
                return data;
            },

            /*
             * 获取来源域数据（空备选&已选择）
             */
            refer: function (model) {
                var data = model.loadOrientData('refer', 'input');
                return data;
            },

            /*
             * 获取被访url数据（空备选&已选择）
             */
            visiturl: function (model) {
                var data = model.loadOrientData('visiturl', 'input');
                return data;
            },

            /*
             * 提交按钮状态，普通/带上传创意
             */
            submitFieldWithCreative: function (model) {
                if (model.get('formType') === 'create'
                    || model.get('status') === 5
                ) {
                    return true;
                }
                else {
                    return false;
                }
            }
        }];

        /**
         * 获取尺寸列表
         *
         * @return {Array}
         */
        DeliveryFormModel.prototype.loadSizes = function () {
            var sizes = this.data.getSlotSizes().then(
                function (response) {
                    var results = u.map(
                        response.results,
                        function (item) {
                            var size = item.width + '*' + item.height;
                            return {
                                id: size,
                                name: size
                            };
                        }
                    );
                    return results;
                }
            );

            return sizes;
        };

        /**
         * 获取备选地域信息
         *
         * @return {Array}
         */
        DeliveryFormModel.prototype.loadRegionData = function () {
            var regionInfo = this.data.getRegionInfo().then(
                function (response) {
                    return response;
                }
            );

            return regionInfo;
        };

        /**
         * 获取各类型定向信息
         *
         * @param type {String} 定向信息名称
         * @return {Object} 
         */
        DeliveryFormModel.prototype.loadOrientData = function (type, viewType) {
            var model = this;
            var system = require('common/global/system');
            var items =  system[type];

            sourceData = u.map(
                items,
                function (item) {
                    return {
                        id: item.value,
                        name: item.text
                    };
                }
            );

            var selected = [];
            var state = 'equal';
            if (model.get('formType') === 'update') {
                var locateInfos = model.get('entity').locateInfos;
                
                selected = u.where(
                    locateInfos,
                    { orientEName: type }
                );

                if (selected.length > 0) {
                    state = selected[0].orientOp ? 'unequal' : 'equal';
                    selected = selected[0].orientValue;
                    

                    if (viewType !== 'input') {
                        selected = u.map(
                            selected,
                            function (item) {
                                var name = u.where(
                                    sourceData,
                                    { id: item }
                                );
                                if (name.length > 0) {
                                    name = name[0].name;
                                }
                                return {
                                    id: item,
                                    name: name
                                };
                            }
                        ); 
                    }
                }
            }
            
            return {
                source: sourceData,
                selected: selected,
                state: state
            };
        };

        /**
         * 对数据源进行预处理
         */
        DeliveryFormModel.prototype.prepare = function () { 
            // 新建时，IE8下几个RadioButton的状态初始化
            if (this.get('formType') === 'create') {
                this.set('priceModel', '0');
                this.set('setRegion', '0');
                this.set('setSchedule', '0');
                this.set('setBrowser', '0');
                this.set('setResolution', '0');
            }

            // 设置已选广告位数据
            if (this.get('formType') === 'update' && this.get('adPositions')) {
                var selectedSlots = this.get('adPositions');
                this.set('selectedSlots', selectedSlots);
                this.set(
                    'slotsAmount', 
                    { 
                        'selectedSlots': selectedSlots,
                        'priceModel': this.get('priceModel') 
                    }
                );
            }
            else {
                this.set('selectedSlots', []);
                this.set(
                    'slotsAmount', 
                    { 
                        'selectedSlots': [],
                        'priceModel': '0' 
                    }
                );
            }

            // 设置其它定向控件的数据
            var connect = this.get('connect');
            var language = this.get('language');
            var system = this.get('system');
            var refer  = this.get('refer');
            var visiturl  = this.get('visiturl');

            var all = [ 
            {
                id: 5, 
                name: '接入方式', 
                state: connect.state, 
                data: connect.source,
                selected: connect.selected
            },
            {
                id: 6, 
                name: '浏览器语言', 
                state: language.state, 
                data: language.source,
                selected: language.selected
            },
            {
                id: 7, 
                name: '操作系统', 
                state: system.state, 
                data: system.source,
                selected: system.selected
            },
            {
                id: 8, 
                name: '来源域', 
                state: 'equal', 
                viewType: 'input',
                data: refer.source,
                selected: refer.selected
            },
            {
                id: 9, 
                name: '被访url', 
                state: 'equal', 
                viewType: 'input',
                data: visiturl.source,
                selected: visiturl.selected
            }
            ];
            var allData = [];
            var selectedData = [];
            

            u.each(
                all,
                function (item) {
                    allData.push(u.omit(item, 'selected'));
                    if (this.get('formType') === 'update'
                        && item.selected.length > 0
                    ) {
                        item.data = item.selected;
                        selectedData.push(u.omit(item, 'selected'));
                    }
                },
                this
            );

            var otherOrients = {
                allData: allData, 
                selectedData: selectedData, 
                selectedGroup: 5
            };
            
            this.set('otherOrients', otherOrients);

            // 控制其它定向设置的展开状态
            if (this.get('formType') === 'update'
                && otherOrients.selectedData.length > 0
            ) {
                this.set('otherOrientsExpanded', true);
            }
            else {
                this.set('otherOrientsExpanded', false);
            }

            // 编辑模式下其它数据的预处理
            if (this.get('formType') === 'update') {
                // 设置尺寸
                var w = this.get('width');
                var h = this.get('height');
                var size = w + '*' + h;
                this.set('size', size);


                // 设置开始日期和时间
                var beginTime = this.get('beginTime');
                var beginDate = moment(
                    beginTime.slice(0, 8), 
                    'YYYYMMDD'
                );
                beginDate = beginDate.format('YYYY-MM-DD');
                this.set('beginDate', beginDate);
                beginTime = 
                    beginTime.slice(8, 10) + ':' + beginTime.slice(10, 12);
                this.set('beginTime', beginTime);

                // 设置结束日期和时间
                var endTime = this.get('endTime');
                if (endTime !== null) {
                    var endDate = moment(
                        endTime.slice(0, 8), 
                        'YYYYMMDD'
                    );
                    endDate = endDate.format('YYYY-MM-DD');
                    this.set('endDate', endDate);
                    endTime = 
                    endTime.slice(8, 10) + ':' + endTime.slice(10, 12);
                    this.set('endTime', endTime);
                    // 设置一个标记，供View切换不限结束时间的状态
                    this.set('timeModel', 'end');
                }
                else {
                    this.set('endTime', '');
                    this.set('timeModel', 'endless');
                }

                // 配置非连续时间
                var discontinuousTime = u.where(
                    this.get('locateInfos'),
                    { orientEName: 'date' }
                );
                if (discontinuousTime.length > 0) {
                    discontinuousTime = discontinuousTime[0].orientValue;
                    discontinuousTime = u.map(
                        discontinuousTime,
                        function (item) {
                            var date = 
                                moment(item, 'YYYYMMDD').format('YYYY-MM-DD');
                            return date;
                        }
                    );
                    discontinuousTime = discontinuousTime.join(',');
                    this.set('discontinuousTime', discontinuousTime);
                    // 设置一个标记，供View切换非连续时间面板
                    this.set('dateModel', 'discontinuous');
                }
                else {
                    this.set('dateModel', 'continuous');
                }

                // 配置优先级相关
                var priority = this.get('priority');
                var priorityClass;
                if (priority === 1) {
                    priorityClass = 'mono';
                }
                else if (priority >= 2 && priority <= 11) {
                    priorityClass = 'standard';
                }
                else if (priority >= 12 && priority <= 21) {
                    priorityClass = 'yield';
                }
                else {
                    priorityClass = 'houseAD';
                }
                this.set('priorityClass', priorityClass);

                // 每日投放量Type，int --> string
                var balancedDeliveryType = 
                    this.get('balancedDeliveryType') + '';
                this.set('balancedDeliveryType', balancedDeliveryType);

                // 配置创意轮换相关，int --> string
                var adInturn = this.get('adInturn') + '';
                this.set('adInturn', adInturn);


                // 开始配置定向数据,获取全部定向数据
                var locateInfos = this.get('entity').locateInfos;
 
                /*
                 * 配置地域数据
                 */
                var region = u.where(
                    locateInfos,
                    { orientEName: 'region' }
                );

                if (region.length > 0) {
                    region = region[0].orientValue;
                    region = region.join(',');
                    this.set('region', region);
                }

                /*
                 * 配置投放日程数据
                 */
                var mergedSchedule = u.where(
                    locateInfos,
                    { orientEName: 'weektime' }
                );

                if (mergedSchedule.length > 0) {
                    mergedSchedule = mergedSchedule[0].orientValue;

                    // 生成一个24×7的，元素为0的二维数组
                    var scheduleValues = [];
                    for (var day = 0; day < 7; day++) {
                        scheduleValues[day] = 
                            u.map(new Array(25).join('0').split(''), Number);
                    }

                    /*
                     * 将数组指定位置值置1
                     */
                    var setOne = function (item) {
                        slot[item] = 1;
                    };

                    // 根据时间段，拆分投放日程，并将对应位置置1
                    for (var i = 0; i < mergedSchedule.length; i += 2) {
                        var begin = 
                            parseInt(mergedSchedule[i].substring(1), 10);
                        var end = 
                            parseInt(mergedSchedule[i + 1].substring(1), 10);
                        var range = u.range(begin, end);

                        var day = mergedSchedule[i].charAt(0);
                        var slot = scheduleValues[day - 1];

                        u.each(
                            range,
                            setOne
                        );
                    }

                    // 扁平化数组，并合并为字符串
                    scheduleValues = u.flatten(scheduleValues);
                    scheduleValues = scheduleValues.join('');
                    this.set('schedule', scheduleValues);
                }

                /*
                 * 配置投放速度
                 */
                var deliverySpeed = this.get('deliverySpeed');
                if (deliverySpeed !== 0) {
                    this.set('deliverySpeedType', deliverySpeed);
                }
            }

        };

        /**
         * 根据ID删除广告位
         *
         * @param {String} id 要删除的广告位ID
         * @return {Array}
         */
        DeliveryFormModel.prototype.deleteSlot = function (id, slots) {
            var selectedSlots = u.filter(
                slots,
                function (item) {
                    return item.slotId !== id;
                }
            );
            return selectedSlots;
        };

        /**
         * 同步广告位数据到Model
         *
         * @param {Array} 新的广告位数组
         */
        DeliveryFormModel.prototype.updataSlotsToModel = function (newSlots) {
            this.set('selectedSlots', newSlots);
            this.set('slotsAmount', { 'selectedSlots': newSlots });
        };

        /**
         * 检查实体数据完整性，可在此补充一些视图无法提供的属性
         *
         * @param {Object} entity 实体数据
         * @return {Object} 补充完整的实体数据
         */
        DeliveryFormModel.prototype.fillEntity = function (entity) {
            if (this.get('formType') === 'create') {
                entity.orderId = this.get('order');
            }
            else {
                entity.orderId = this.get('orderId');
            }
            
            return entity;
        };

        /**
         * 检验实体有效性
         *
         * @param {Object} entity 提交的实体
         * @return {Object[] | true} 返回`true`表示验证通过，否则返回错误字体
         */
        DeliveryFormModel.prototype.validateEntity = function (entity) {
            var errorMsg = [];

            if (entity.adPositions.length < 1) {
                errorMsg.push(
                    { field: 'slotValidate', message: '请至少选择一个广告位' }
                );
            }
            if (entity.adPositions.length > 100) {
                errorMsg.push(
                    { field: 'slotValidate', message: '请添加1-100个广告位' }
                );
            }
            var PriceModel = require('./enum').PriceModel;
            if (entity.priceModel === PriceModel.CPM) {
                var beginTime = 
                    moment(entity.beginTime.substr(0, 8), 'YYYYMMDD');
                var endTime = moment(entity.endTime.substr(0, 8), 'YYYYMMDD');
                if ((endTime - beginTime) > (730 * 24 * 3600 * 1000)) {
                    errorMsg.push(
                        { 
                            field: 'endTime', 
                            message: 
                                'CPM计费方式的广告最长可填写365*2天' 
                        }
                    );
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
        DeliveryFormModel.prototype.isEntityChanged = function (entity) {
            // 如果是新建的话，要先建立一个空的original
            // 编辑时则以后端取回的数据为准
            var emptyEntity = {
                id: undefined,
                name: ''
            };
            var original = this.get('formType') === 'create'
                ? emptyEntity
                : u.clone(this.get('entity'));
            // // 补上`id`、`platform`
            // // 所有original字段的操作之前要加判断，下同
            // if (original) {
            //     entity.id = original.id;
            //     entity.platform = original.platform;
            // }

            // // 新建模式下的数据修正
            // if (this.get('formType') === 'create') {
            //     // 如果尺寸控件为常规状态并且未选择
            //     if (entity.sizeType === 0
            //         && entity.hasOwnProperty('normalSize')
            //     ) {
            //         // 删掉提交上来的normalSize字段
            //         delete entity.normalSize;
            //     }
            //     // 如果尺寸控件为自定义状态且均未填入数据
            //     else if (entity.sizeType === 1
            //         && isNaN(entity.width)
            //         && isNaN(entity.height)
            //     ) {
            //         // 删掉提交上来的width和height字段
            //         delete entity.width;
            //         delete entity.height;
            //     }

            //     // 去掉sizeType属性
            //     delete entity.sizeType;
            // }

            // // 编辑模式下的数据修正
            // if (this.get('formType') === 'update') {
            //     // 补上宽高
            //     entity.width = original.width;
            //     entity.height = original.height;

            //     // 去掉sizeType属性
            //     delete original.sizeType;
            // }
            var entityExtend = {};
            //u.extend(entityExtend, original, entity);
            return !u.isEqual(entityExtend, original);
        };

        return DeliveryFormModel;
    }
);