/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 广告报告数据模型类
 * @author lixiang(lixiang05@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var BizModel = require('./../BizModel');
        var util = require('er/util');

        function BaseModel() {
            BizModel.apply(this, arguments);
        }

        util.inherits(BaseModel, BizModel);

        var defaultDatasource = [{
            keywordPlaceHolder: function () {
                return '支持广告、订单、广告客户、销售名称搜索';
            },
            crumbConfigKey: function () {
                return 'deliveryReport';
            },
            topCategory: function () {
                return {
                    key: 'delivery',
                    text: '广告'
                };
            },
            crumbPath: function (model) {
                return model.buildCrumb();
            },
            submenus: function (model) {
                var path = '#/report/delivery/';
                var param = model.buildCrumbParam('id');
                return {
                    title: '选择报告维度',
                    menus: [
                        {
                            name: '分日报告',
                            url: path + 'date~' + param
                        },
                        // b1不做
                        // {
                        //     name: '地域分布报告',
                        //     url: '/report/delivery/location'
                        // },
                        {
                            name: '时段分布报告',
                            url: path + 'hour~' + param
                        },
                        {
                            name: '分创意报告',
                            url: path + 'creative~' + param
                        }
                        // b1不做
                        // {
                        //     name: '分广告位报告',
                        //     url: path + 'slot~' + param
                        // }
                    ]
                };
            },
            comparable: function () {
                return true;
            }
        }];


        /**
         * 默认数据源配置
         * 
         * @param {Object}
         * @override
         */
        BaseModel.prototype.defaultDatasource = [
            BizModel.prototype.defaultDatasource,
            defaultDatasource
        ];
        
        BaseModel.prototype.crumbConfigKey = 'deliveryReport';

        return BaseModel;
    }
);