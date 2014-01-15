/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 整体报告数据模型类
 * @author wangyaqiong(wangyaqiong@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var BaseModel = require('./BaseModel');
        var Data = require('common/ReportData');
        var util = require('er/util');
        var u = require('underscore');

        function GeneralReportModel() {
            BaseModel.apply(this, arguments);
            this.data = new Data('creative');
        }

        util.inherits(GeneralReportModel, BaseModel);
        
        var sizeStatuses = [{ text: '全部尺寸', value: '' }];

        var types = require('creative/enum').Type.toArray();
        types.unshift({ text: '全部类型', value: '' });

        var datasource = require('er/datasource');
        /**
         * 数据源配置
         *
         * @type {Object}
         * @override
         */
        GeneralReportModel.prototype.datasource = {
            types: datasource.constant(types),

            // tableData需要在这里要在处理下，把广告订单那信息传进来
            tableDataAll: function (model) {
                return model.mergeCrumbInfoToTable();
            },

            crumbPath: function (model) {
                return [{ text: '创意报告' }];
            },

            sizeStatuses: function (model) {
                return model.getCreativeSizes();
            },

            size: function (model) {
                var width = model.get('width');
                var height = model.get('height');
                if (width != null && height != null) {
                    return width + '*' + height;
                }
                return null;
            }
        };

        GeneralReportModel.prototype.prepare = function () {
            var url = this.get('url');
            var query = url.getQuery();
            var favorSkin = 'unfavored';

            if (this.get('flag') == 1) {
                favorSkin = 'favored';
                delete query.flag;
            } else {
                query.flag = 1;
            }

            var link = require('er/URL').withQuery(url.getPath(), query);

            this.set('favorSkin', favorSkin);
            this.set('favorFilterLink', '#' + link);
        };

        /**
         * 获取创意所有尺寸列表数据
         *
         * @return {er/Promise}
         */
        GeneralReportModel.prototype.getCreativeSizes = function () {
            var CreativeData = require('creative/Data');
            var creativeData = new CreativeData();
            var loadingSizes = creativeData.size();
            return loadingSizes.then(function (response) {
                var allSizes = response.creativeSize || [];
                var allSizeValues = u.map(allSizes, function (item) {
                    var sizeValue = item.w + '*' + item.h;
                    var sizeText = sizeValue;
                    if (item.w === -1 && item.h === -1) {
                        sizeText = '--';
                    }
                    return {
                        text: sizeText,
                        value: sizeValue
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
            var type = this.get('adType');
            var flag = this.get('flag');
            if (width && height) {
                query.width = width;
                query.height = height;
            }
            if (type) {
                query.adType = type;
            }
            if (flag) {
                query.flag = flag;
            }
            return query;
        };

        return GeneralReportModel;
    }
);