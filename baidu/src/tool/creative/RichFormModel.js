/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 富媒体创意表单数据模型类
 * @author lixiang(lixiang05@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var BaseFormModel = require('./BaseFormModel');
        var util = require('er/util');
        var Data = require('./Data');
        var u = require('underscore');

        /**
         * 创意表单数据模型类
         *
         * @constructor
         * @extends ./BaseFormModel
         */
        function RichFormModel() {
            BaseFormModel.apply(this, arguments);
            this.data = new Data();
        }

        util.inherits(RichFormModel, BaseFormModel);

        RichFormModel.prototype.creativeType = 'rich';

        /**
         * 数据源配置
         *
         * @type {Object}
         * @override
         */
        RichFormModel.prototype.datasource = [
            {
                file: function (model) {
                    return model.get('value');
                },
                rule: {
                    retrieve: require('er/datasource').rule(
                        'defaultMaxLength'
                    ),
                    dump: true
                }
            }
        ];

        /**
         * 检查实体数据完整性，可在此补充一些视图无法提供的属性
         *
         * @param {Object} entity 实体数据
         * @return {Object} 补充完整的实体数据
         */
        RichFormModel.prototype.fillEntity = function (entity) {
            var CreativeType = require('./enum').Type;
            entity.type = CreativeType.RICH; // 富媒体
            return entity;
        };

        /**
         * 判断实体是否有变化
         *
         * @param {Object} entity 新的实体
         * @return {boolean}
         * @overide
         */
        RichFormModel.prototype.isEntityChanged = function (entity) {
            // 如果是新建的话，要先建立一个空的original
            // 编辑时则以后端取回的数据为准
            var emptyEntity = {
                adCode: '',
                name: '',
                type: 3
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

                // **临时**的处理一下富媒体模板相关的内容
                entity.templateId = original.templateId || 0;
                entity.templateName = original.templateName || null;
                entity.templateParams = original.templateParams || null;
            }

            return !u.isEqual(entity, original);
        };

        return RichFormModel;
    }
);
