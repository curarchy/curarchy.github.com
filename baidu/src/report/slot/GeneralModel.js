/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 广告位一级报告Model
 * @author wangyaqiong(catkin2009@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var BaseModel = require('./BaseModel');
        var Data = require('common/ReportData');
        var util = require('er/util');
        var u = require('underscore');
        var priceModelsEnum = require('./enum').PriceModel.toArray();

        function GeneralReportModel() {
            BaseModel.apply(this, arguments);
            this.data = new Data('adPosition');
        }

        util.inherits(GeneralReportModel, BaseModel);

        var sizeStatuses = [{ text: '全部尺寸', value: '' }];
        priceModelsEnum.unshift({ text: '全部计费类型', value: '' });
        var datasource = require('er/datasource');
        
        /**
         * 数据源配置
         *
         * @type {Object}
         * @override
         */
        GeneralReportModel.prototype.datasource = { 
            priceModels: datasource.constant(priceModelsEnum),
           
            sizeStatuses: function (model) {
                return model.getSlotSizes();
            },
            crumbPath: function (model) {
                var path = [];
                path[0] = { text: '广告位报告' };
                return path;
            },
            size: function (model) {
                var width = model.get('width');
                var height = model.get('height');
                if ( width && height ) {
                    return width + '*' + height;
                }
            }
        };

        /**
         * 获取广告位所有尺寸列表数据
         *
         * @return {er/Promise}
         */
        GeneralReportModel.prototype.getSlotSizes = function () {
            var SlotData = require('slot/Data');
            var slotData = new SlotData();
            var loadingSizes = slotData.size();
            return loadingSizes.then(function (response) {
                var allSizes = response.results || [];
                var allSizeValues = u.map(allSizes, function (item) {
                    var sizeText = item.width + '*' + item.height;
                    return {
                        text: sizeText,
                        value: sizeText
                    };
                });
                return sizeStatuses.concat(allSizeValues);
            });
        };

        /**
         * 获取请求后端时的查询参数
         *
         * @return {Object}
         */
        GeneralReportModel.prototype.getQuery = function () {
            var query = BaseModel.prototype.getQuery.apply(this, arguments);
            var width = this.get('width');
            var height = this.get('height');
            var priceModel = this.get('priceModel');
            if (width && height) {
                query.width = width;
                query.height = height;
            }
            if (priceModel) {
                query.priceModel = priceModel;
            }
            return query;
        };

        return GeneralReportModel;
    }
);