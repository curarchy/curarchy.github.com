/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 创意表单数据模型类
 * @author lisijin(ibadplum@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var FormModel = require('common/FormModel');
        var Data = require('./Data');
        var DeliveryData = require('delivery/Data');
        var UnionData = require('common/global/UnionData');
        var util = require('er/util');
        var u = require('underscore');
        var enums = require('./enum');

        /**
         * 创意表单数据模型类
         *
         * @constructor
         * @extends common/FormModel
         */
        function CreativeFormModel() {
            FormModel.apply(this, arguments);
            this.data = new Data();
            this.deliveryData = new DeliveryData();
            this.unionData = new UnionData();
        }

        util.inherits(CreativeFormModel, FormModel);

        /**
         * 数据源配置
         *
         * @type {Object}
         * @override
         */
        CreativeFormModel.prototype.datasource = [
        {
            isUnionSeriveOK: function (model) {
                var flag = model.unionData.getUnionService();
                return flag;
            }
        },
        {
            deliveryId: function (model) {
                var url = model.get('url');
                return url.getQuery().deliveryId;
            },
            creativeId: function (model) {
                var url = model.get('url');
                return url.getQuery().creativeId;
            },
            results: function (model) {
                var query = { deliveryId: model.get('deliveryId') };
                return model.data.search(query).then(
                    function (data) {
                        return prepareResult(data.results);
                    }
                );
            },
            inturnType: function (model) {
                var id = model.get('deliveryId');
                return model.deliveryData.findById(id).then(
                    function (result) {
                        model.set('orderId', result.orderId);
                        return parseInt(result.adInturn, 10);
                    }
                );
            }
        }
        ];

        /**
         * 将一些数据塞到results里
         * @param  {Array} results 需要处理的创意列表
         * @return {Array}         处理后的创意列表
         */
        function prepareResult(results) {
            results = u.map(
                results,
                function (item) {
                    // 用于选择列表显示的字段
                    item.typeText = 
                        enums.Type.getAliasFromValue(item.type).toLowerCase();
                    return item;
                }
            );
            return results;
        }

        /**
         * 删除创意
         * @param  {string} id 创意id
         */
        CreativeFormModel.prototype.deleteCreative = function (id) {
            var results = this.get('results');
            var inturnType = this.get('inturnType');
            if (inturnType === 3) {
                var deleteOne = u.find(
                    results,
                    function (item) {
                        return item.id === id;
                    }
                );
                u.each(
                    results,
                    function (item) {
                        if (item.inturnValue > deleteOne.inturnValue) {
                            item.inturnValue -= 1;
                        }
                    }
                );
                results = u.without(results, deleteOne);
            }
            else {
                var results = u.filter(this.get('results'), function (item) {
                    return item.id !== id;
                });
            }
            this.set('results', results);
            return results;
        };

        /**
         * 从选择列表中添加创意
         * @param {Array} addList 需要添加的创意
         */
        CreativeFormModel.prototype.addCreative = function (addList) {
            var results = this.get('results');
            var inturnType = this.get('inturnType');
            addList = prepareResult(addList);
            var number = 0;
            u.each(
                addList,
                function (item) {
                    item.inturnType = inturnType;
                    var original = u.find(results, function (result) {
                        // 数据格式不是很确定，先这样
                        return item.id == result.id;
                    });
                    var value = u.indexOf(results, original);
                    if (value !== -1) {
                        if (!item.inturnValue) {
                            item.inturnValue = original.inturnValue;
                        }
                        results[value] = item;
                    }
                    else {
                        if (!item.inturnValue) {
                            item.inturnValue = inturnType === 1
                                ? 5 : results.length + 1;
                        }
                        number += 1;
                        results.push(item);
                    }
                }
            );
            this.set('results', results);
            return results;
        };

        CreativeFormModel.prototype.isShowWarning = function (results) {
            var isShowWarning = false;
            u.each(
                results,
                function (item) {
                    if (item.type !== 0 && item.type !== 1) {
                        isShowWarning = true;
                    }
                }
            );
            return isShowWarning;
        };

        /**
         * 检验实体有效性
         *
         * @param {Object} entity 提交的实体
         * @return {Object[] | true} 返回`true`表示验证通过，否则返回错误字体
         */
        CreativeFormModel.prototype.validateEntity = function (entity) {
            var errorMsg = [];
            var creativeArray = entity.data.data;
            var inturnType = this.get('inturnType');
            if (creativeArray.length === 0) {
                errorMsg.push(
                    { field: '', message: '请至少添加一个创意' }
                );
            }
            else if (creativeArray.length > 10) {
                errorMsg.push(
                    { field: '', message: '请不要添加超过10条创意' }
                );
            }
            else if (inturnType === 3) {
                var inturnObject = {};
                var error = [];
                // 这里需要name参数，直接用results了
                var results = this.get('results');
                u.each(
                    results,
                    function (item) {
                        if (!inturnObject[item.inturnValue]) {
                            inturnObject[item.inturnValue] = item.name;
                        }
                        else {
                            if (inturnObject[item.inturnValue] !== true) {
                                error.push(inturnObject[item.inturnValue]);
                                inturnObject[item.inturnValue] = true;
                            }
                            error.push(item.name);
                        }
                    }
                );
                if (error.length) {
                    var message = error.join('与');
                    message += '的显示顺序相同';
                    errorMsg.push(
                        { field: '', message: message }
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



        return CreativeFormModel;
    }
);
