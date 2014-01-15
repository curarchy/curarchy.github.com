/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 创意表单数据模型类
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var BaseFormModel = require('./BaseFormModel');
        var Data = require('./Data');
        var util = require('er/util');
        var u = require('underscore');

        /**
         * 创意表单数据模型类
         *
         * @constructor
         * @extends creative/BaseFormModel
         */
        function ImageFormModel() {
            BaseFormModel.apply(this, arguments);
            this.data = new Data();
        }

        util.inherits(ImageFormModel, BaseFormModel);

        ImageFormModel.prototype.uploadType = 'image';

        ImageFormModel.prototype.creativeType = 'image';

        var datasource = require('er/datasource');

        /**
         * 数据源配置
         *
         * @type {Object}
         * @override
         */
        ImageFormModel.prototype.datasource = [
            {
                rule: {
                    retrieve: datasource.rule(
                        'defaultMaxLength',
                        'urlLength',
                        'urlPattern'
                    ),
                    dump: true
                },
                targetWindow: function (model) {
                    var value = model.get('targetWindow');
                    return typeof value === 'number' ? value + '' : value;
                }
            }
        ];

        /**
         * 检查实体数据完整性，可在此补充一些视图无法提供的属性
         *
         * @param {Object} entity 实体数据
         * @return {Object} 补充完整的实体数据
         */
        ImageFormModel.prototype.fillEntity = function (entity) {
            var CreativeType = require('./enum').Type;
            entity.type = CreativeType.IMAGE; // 图片
            return entity;
        };

        /**
         * 判断实体是否有变化
         *
         * @param {Object} entity 新的实体
         * @return {boolean}
         * @overide
         */
        ImageFormModel.prototype.isEntityChanged = function (entity) {
            // 如果是新建的话，要先建立一个空的original
            // 编辑时则以后端取回的数据为准
            var emptyEntity = {
                cbExtFlag: 0,
                clickUrl: '',
                height: NaN,
                materialType: 1,
                materialUrl: undefined,
                monitorUrl: '',
                name: '',
                targetWindow: 0,
                title: '',
                type: 1,
                width: NaN
            };
            var original = this.get('formType') === 'create'
                ? emptyEntity
                : u.clone(this.get('entity'));

            if (this.get('formType') === 'update') {
                // 补上`id`和`status`
                // 所有original字段的操作之前要加判断，下同
                if (original.id) {
                    entity.id = original.id;
                    entity.status = original.status;
                }

                if (original.hasOwnProperty('baiduAdFlag')) {
                    entity.baiduAdFlag = original.baiduAdFlag;
                }
                
                // 将展开的cbExt的值重新处理为数组和original比对
                if (entity.cbExtFlag) {
                    entity.cbExt = [
                        entity['cbExt[0]'],
                        entity['cbExt[1]'],
                        entity['cbExt[2]']
                    ];
                    entity = u.omit(entity, 'cbExt[0]', 'cbExt[1]', 'cbExt[2]');
                }
                else {
                    entity.cbExt = ['','',''];
                }
            }

            return !u.isEqual(entity, original);
        };

        return ImageFormModel;
    }
);