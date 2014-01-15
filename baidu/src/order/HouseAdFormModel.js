/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 内部订单表单数据模型类
 * @author wangyaqiong(catkin2009@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var FormModel = require('common/FormModel');
        var Data = require('./Data');
        var util = require('er/util');
        var u = require('underscore');

        /**
         * 订单表单数据模型类
         *
         * @constructor
         * @extends common/FormModel
         */
        function HouseAdFormModel() {
            FormModel.apply(this, arguments);
            this.data = new Data();
        }

        util.inherits(HouseAdFormModel, FormModel);

        /**
         * 数据源配置
         *
         * @type {Object}
         * @override
         */
        HouseAdFormModel.prototype.datasource = [
            {
                otherContactorId: function (model) {
                    var otherContactor = model.get('otherContactor');
                    if (otherContactor) {
                        return otherContactor.id;
                    }
                },
                contactors: function (model) {
                    return model.loadContactors();
                }
            }
        ];
        

        /**
         * 获取联系人列表
         * @return {er/Promise}
         */
        HouseAdFormModel.prototype.loadContactors = function () {
            var loading = this.list(
                {
                    status: '0,1,2,3,4'
                },
                'contactor'
            );
            return loading.then(function (response) {
                return response.results || [];
            });

        };

        /**
         * 判断实体是否有变化
         *
         * @param {Object} entity 新的实体
         * @return {boolean}
         * @overide
         */
        HouseAdFormModel.prototype.isEntityChanged = function (entity) {
             // 如果是新建的话，要先建立一个空的original
            // 编辑时则以后端取回的数据为准
            var emptyEntity = {
                name: '',
                discription: '',
                otherContactorId: '',
                type: 2
            };
            var original = this.get('formType') === 'create'
                ? emptyEntity
                : u.clone(this.get('entity'));
            var extractEntity = {};
            if (this.get('formType') === 'update') {
                // 补上`id`和`status`
                // 所有original字段的操作之前要加判断，下同
                if (original.id) {
                    entity.id = original.id;
                }

                extractEntity.id = original.id;
                extractEntity.name = original.name;
                extractEntity.type = original.type;
                extractEntity.otherContactorId = original.otherContactor.id;
                if (original.discription) {
                    extractEntity.discription = original.discription;
                }
                else {
                    extractEntity.discription = '';
                }
                return !u.isEqual(entity, extractEntity);
            }

            return !u.isEqual(entity, original);
        };

        return HouseAdFormModel;
    }
);