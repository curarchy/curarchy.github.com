/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file Delivery只读页数据模型类
 * @author exodia(dengxinxin@baidu.com), liyidong(srhb18@gmail.com)
 * @date 13-11-30
 */
define(
    function (require) {
        var ReadModel = require('common/ReadModel');
        var Data = require('./Data');
        var util = require('er/util');
        var u = require('underscore');
        var moment = require('moment');
        var RegionInfo = {};

        /**
         * {{&description}}只读页数据模型类
         *
         * @constructor
         * @extends common/ReadModel
         */
        function DeliveryReadModel() {
            ReadModel.apply(this, arguments);
            this.data = new Data();
        }

        util.inherits(DeliveryReadModel, ReadModel);

        /**
         * 用基类get方法覆盖Read基类的配置
         *
         * @name {String}
         * @override
         */
        DeliveryReadModel.prototype.get = function (name) {
            return this.store[name];
        };


        /**
         * 数据源配置
         *
         * @type {Object}
         * @override
         */
        DeliveryReadModel.prototype.datasource = [
        {   
            /*
             * 面包屑
             */
            crumbPath: function (model) {
                return [
                    {
                        text: '广告',
                        href: '#/delivery/list'
                    },
                    {
                        text: model.get('title')
                    }
                ];
            },

            /*
             * 获取地域数据（备选）
             */
            regionInfo: function (model) {
                var regionInfo = model.loadRegionData();
                return regionInfo;
            },

            /*
             * 获取浏览器备选数据
             */
            browserInfo: function (model) {
                var browserInfo = model.loadOrientData('browser');
                return browserInfo;
            },

            /*
             * 获取分辨率备选数据
             */
            resolutionInfo: function (model) {
                var resolutionInfo = model.loadOrientData('resolution');
                return resolutionInfo;
            },

            /*
             * 获取接入方式备选数据
             */
            connectInfo: function (model) {
                var connectInfo = model.loadOrientData('connect');
                return connectInfo;
            },

            /*
             * 获取浏览器语言备选数据
             */
            languageInfo: function (model) {
                var languageInfo = model.loadOrientData('language');
                return languageInfo;
            },

            /*
             * 获取操作系统备选数据
             */
            systemInfo: function (model) {
                var systemInfo = model.loadOrientData('system');
                return systemInfo;
            },

            /*
             * 计费方式是否CPD
             */
            isCPD: function (model) {
                var PriceModel = require('./enum').PriceModel;
                return model.get('priceModel') === PriceModel.CPD;
            },

            /*
             * 创意轮换是否幻灯片轮换
             */
            isAdInturnSlider: function (model) {
                return model.get('adInturn') === 2;
            },

            /*
             * 投放速度是否可见
             */
            isDeliverySpeedVisible: function (model) {
                var flag = false;
                var PriceModel = require('./enum').PriceModel;
                if (model.get('priceModel') === PriceModel.CPM) {
                    flag = true;
                }
                else {
                    if (model.get('balancedDeliveryType') === 1) {
                        flag = true;
                    }
                }
                return flag;
            }
        }];

        /**
         * 获取各类型定向信息
         *
         * @param type {String} 定向信息名称
         * @return {Object} 
         */
        DeliveryReadModel.prototype.loadOrientData = function (type, viewType) {
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

            return sourceData;
        };


        /**
         * 获取备选地域信息
         *
         * @return {Array}
         */
        DeliveryReadModel.prototype.loadRegionData = function () {
            var regionInfo = this.data.getRegionInfo().then(
                function (response) {
                    return response;
                }
            );
            
            return regionInfo;
        };

        function flattenRegion(regions) {
            u.each(
                regions,
                function (region) {
                    RegionInfo[region.id] = region.text;
                    region.children && flattenRegion(region.children);
                }
            );
        }

        function getRegions(ids) {
            flattenRegion.call(this, this.get('regionInfo'));
            return u.map(ids, function (id) {
                return RegionInfo[id];
            });
        }

        function getWeekTime(weektime) {
            var results = new Array(8).join('0').split('');
            for (var i = 0; i < weektime.length; i += 2) {
                var week = weektime[i].charAt(0);
                var begin = weektime[i].substr(1) + ':00';
                var end = weektime[i + 1].substr(1) + ':00';
                var timeText = begin + '~' + end;
                if (results[week - 1] !== '0') {
                    results[week - 1].push(timeText);
                }
                else {
                    results[week - 1] = [timeText];
                }
            }

            return u.map(
                results,
                function (item) {
                    return u.isArray(item) ? item.join('，') : '无';
                }
            );

            
            // var ret = [];
            // for (var i = seq.length - 1; i > -1; i -= 2) {
            //     var week = seq[i].charAt(0);
            //     var begin = seq[i - 1].substr(1);
            //     var end = seq[i].substr(1);
            //     var time = begin + ':00 -- ' + end + ':00';
            //     ret[week] = (ret[week] || []).push(time);
            // }

            // return u.map(ret, function (v) {
            //     return v.join();
            // });
        }

        DeliveryReadModel.prototype.prepareOrient = function () {
            var locateInfos = this.get('locateInfos');
            for (var i = locateInfos.length - 1; i > -1; i--) {
                this.set(
                    locateInfos[i].orientEName, 
                    locateInfos[i].orientValue
                );
                if (locateInfos[i].orientOp === 0) {
                    locateInfos[i].orientOp = '等于';
                }
                else {
                    locateInfos[i].orientOp = '不等于';
                }
                this.set(
                    locateInfos[i].orientEName + 'Op', 
                    locateInfos[i].orientOp
                );
            }

            // this.set('regions', ['--']);
            // this.set('weektime', '--,--,--,--,--,--,--'.split(','));
            // }
        };

        DeliveryReadModel.prototype.prepare = function () {
            // 计费方式
            var priceModel = this.get('priceModel');
            var priceModelTexts = ['CPD', 'CPM', 'CPC'];
            var priceModelText = priceModelTexts[priceModel];
            this.set('priceModelText', priceModelText);

            // 设置广告位
            var adPositionNames = u.map(
                this.get('adPositions'),
                function (v) {
                    return v.name;
                }
            );
            this.set('adPositionNames', adPositionNames);

            // 设置连续时间段开始和结束时间格式
            var beginTime = 
                moment(this.get('beginTime'), 'YYYYMMDDHHmmSS').format(
                    'YYYY-MM-DD HH:mm:SS'
                );
            this.set('beginTime', beginTime);
            if (this.get('endTime') !== null) {
                var endTime = 
                    moment(this.get('endTime'), 'YYYYMMDDHHmmSS').format(
                        'YYYY-MM-DD HH:mm:SS'
                    );
                this.set('endTime', endTime);
            }
            else {
                this.set('endTime', '不限');
            }
            
            // 优先级显示内容
            var priority = this.get('priority');
            var priorityClass = '';
            if (priority === 1) {
                priorityClass = '独占';
            }
            else if (priority >= 2 && priority <= 11) {
                priorityClass = '标准';
            }
            else if (priority >= 12 && priority <= 21) {
                priorityClass = '库存收益';
            }
            else {
                priorityClass = '内部';
            }
            var priorityText =  priorityClass + priority + '级';
            var weight = this.get('weight');
            if (weight) {
                priorityText = priorityText + '，权重' + weight;
            }
            this.set('priorityText', priorityText);

            // 每日投放量
            var balancedDeliveryText = '';
            var balancedDeliveryAmount = this.get('balancedDeliveryAmount');
            if (this.get('balancedDeliveryType') === 1) {
                balancedDeliveryText = 
                    '每天展现' + balancedDeliveryAmount + '次';
            }
            else if (this.get('balancedDeliveryType') === 2) {
                balancedDeliveryText = 
                    '每天点击' + balancedDeliveryAmount + '次';
            }
            else {
                balancedDeliveryText = '不限';
            }
            this.set('balancedDeliveryText', balancedDeliveryText);

            // 投放上限
            var totalDeliveryText = '';
            var totalDeliveryAmount = this.get('totalDeliveryAmount');
            if (this.get('totalDeliveryType') === 1) {
                totalDeliveryText = 
                    '每天展现' + totalDeliveryAmount + '次';
            }
            else if (this.get('totalDeliveryType') === 2) {
                totalDeliveryText = 
                    '每天点击' + totalDeliveryAmount + '次';
            }
            else {
                totalDeliveryText = '不限';
            }
            this.set('totalDeliveryText', totalDeliveryText);

            // 频次控制
            if (this.get('freDay')
                || this.get('freHour') 
                || this.get('freThirtyMin')
                || this.get('freTwentyMin')
                || this.get('freTenMin')
                || this.get('freMin')
            ) {
                this.set('frequency', 'show');
            }
            else {
                this.set('frequency', '不限');
            }

            // 创意轮换
            var AdInturn = [ '均匀', '手动权重', '幻灯片轮换', '微轮播' ];
            var adInturn = this.get('adInturn');
            var adInturnText = AdInturn[adInturn];
            this.set('adInturnText', adInturnText);

            // 准备定向数据
            this.prepareOrient();

            // 非连续投放时间
            if (this.get('date')) {
                var discontinuousTime = this.get('date');
                var dates = [];
                for (var i = 0; i < discontinuousTime.length; i += 2) {
                    if (discontinuousTime[i] === discontinuousTime[i + 1]) {
                        var date = 
                            moment(discontinuousTime[i], 'YYYYMMDD')
                                .format('YYYY-MM-DD');
                        dates.push(date);
                    }
                    else {
                        var dateBegin = 
                            moment(discontinuousTime[i], 'YYYYMMDD')
                                .format('YYYY-MM-DD');
                        var dateEnd = 
                            moment(discontinuousTime[i + 1], 'YYYYMMDD')
                                .format('YYYY-MM-DD');
                        dates.push(dateBegin + '至' + dateEnd);
                    }
                }
                this.set('discontinuousTimeShow', true);
                this.set('discontinuousTimes', dates);
            }

            // 地域信息
            if (this.get('region')) {
                var regions = getRegions.call(this, this.get('region'));
                this.set('regions', regions);
            }

            // 投放日程
            if (this.get('weektime')) {
                var weektimes = getWeekTime.call(this, this.get('weektime'));
                this.set('weektimes', weektimes);
                this.set('weektime0', weektimes[0]);
                this.set('weektime1', weektimes[1]);
                this.set('weektime2', weektimes[2]);
                this.set('weektime3', weektimes[3]);
                this.set('weektime4', weektimes[4]);
                this.set('weektime5', weektimes[5]);
                this.set('weektime6', weektimes[6]);
            }

            // 浏览器
            if (this.get('browser')) {
                var browsers = getOrientInfoById.call(this, 'browser');
                this.set('browsers', browsers);
            }

            // 分辨率
            if (this.get('resolution')) {
                var resolutions = getOrientInfoById.call(this, 'resolution');
                this.set('resolutions', resolutions);
            }

            // 接入方式
            if (this.get('connect')) {
                var connects = getOrientInfoById.call(this, 'connect');
                this.set('connects', connects);
            }

            // 浏览器语言
            if (this.get('language')) {
                var languages = getOrientInfoById.call(this, 'language');
                this.set('languages', languages);
            }

            // 操作系统
            if (this.get('system')) {
                var systems = getOrientInfoById.call(this, 'system');
                this.set('systems', systems);
            }

            // 来源域
            if (this.get('refer')) {
                var refers = this.get('refer');
                this.set('refers', refers);
            }

            // 被访url
            if (this.get('visiturl')) {
                var visiturls = this.get('visiturl');
                this.set('visiturls', visiturls);
            }

            // 投放速度
            var deliverySpeedText = '';
            var deliverySpeed = this.get('deliverySpeed');
            if (deliverySpeed === 0) {
                deliverySpeedText = '不设置';
            }
            else if (deliverySpeed === 1) {
                deliverySpeedText = '尽快';
            }
            else {
                deliverySpeedText = '均匀';
            }
            this.set('deliverySpeedText', deliverySpeedText);

            if (this.get('languages')
                || this.get('systems')
                || this.get('resolutions')
                || this.get('refers')
                || this.get('visiturls')
            ) {
                this.set('otherOrientsExpanded', true);
            }
            else {
                this.set('otherOrientsExpanded', false);
            }

        };

        function getOrientInfoById(type) {
            var orientInfo = this.get(type + 'Info');
            var orient = this.get(type);
            var results = [];

            u.each(
                orient,
                function (item) {
                    var nameById = u.where(
                        orientInfo,
                        { id: item }
                    );
                    if (nameById.length > 0) {
                        results.push(nameById[0].name);
                    }
                }
            );

            return results;
        }

        return DeliveryReadModel;
    }
);