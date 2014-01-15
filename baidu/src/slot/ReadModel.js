/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 广告位只读数据模型类
 * * @author wangyaqiong(catkin2009@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var ReadModel = require('common/ReadModel');
        var Data = require('./Data');
        var util = require('er/util');
        var config = require('./config');
        var u = require('underscore');

        function SlotReadModel() {
            ReadModel.apply(this, arguments);
            this.data = new Data();
        }

        util.inherits(SlotReadModel, ReadModel);
        var user = require('common/global/user');

        var datasource = require('er/datasource');
        var PriceModel = require('./enum').PriceModel;
        var FixPosition = require('./enum').FixPosition;
        var AllowRest = require('./enum').AllowRest;

        SlotReadModel.prototype.datasource = [
            {
                channel: function (model) {
                    var id = model.get('channelId');
                    if (id) {
                        return model.get('channelName');
                    }
                    return '未设定';
                },
                crumbPath: function (model) {
                    var path = [
                        { 
                            text: '广告位列表', 
                            href: '#/channel/detail'
                        },
                        {
                            text: model.get('title') 
                        }
                    ];
                    return path;
                },
                size: function (model) {
                    var width = model.get('width');
                    var height = model.get('height');
                    if ( typeof(width) != 'undefined' 
                        && typeof(height) != 'undefined') {
                        return width + '*' + height;
                    }
                },
                rate: function (model) {
                    var rate = model.get('rate');
                    var priceModel = model.get('priceModel');
                    if (rate) {
                        if (priceModel === 0) {
                            return rate + '元/天';
                        }
                        else if (priceModel === 1) {
                            return rate + '元/千次展现';
                        }
                        else {
                             return rate + '元/点击';
                        }
                    }
                },
                priceModel: datasource.enumText(PriceModel),
                fixPosition: datasource.enumText(FixPosition),
                allowRest: datasource.enumText(AllowRest),
                joinedUrlList: function (model) {
                    var joinedUrlList = user.unionInfo.joinedUrlList;
                    var allowRestText = model.get('allowRest');
                    var AllowRest = require('./enum').AllowRest;
                    var allowRestValue = 
                        AllowRest.getValueFromText(allowRestText);
                    if (allowRestValue
                        && joinedUrlList && joinedUrlList.length > 0
                    ) {
                        return '可投放域名： ' + joinedUrlList.join(',');
                    }
                },
                discount: function (model) {
                    var discount = model.get('discount');
                    if (discount) {
                        return discount + '%';
                    }
                },
                inturnNum: function (model) {
                    var inturnNum = model.get('inturnNum');
                    if (inturnNum && model.get('priceModel') != 'CPM') {
                        return inturnNum + '轮播';
                    }
                }

            }
        ];

        var ajax = require('er/ajax');
        u.each(
            config.requests,
            function (config) {
                ajax.register(SlotReadModel, config.name, config);
            }
        );
        return SlotReadModel;
    }
);