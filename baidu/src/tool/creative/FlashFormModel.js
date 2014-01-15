/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 创意表单数据模型类
 * @author liyidong(undefined)
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
        function FlashFormModel() {
            BaseFormModel.apply(this, arguments);
            this.data = new Data();
        }

        util.inherits(FlashFormModel, BaseFormModel);

        FlashFormModel.prototype.uploadType = 'flash';

        FlashFormModel.prototype.creativeType = 'flash';

        var datasource = require('er/datasource');
        /**
         * 数据源配置
         *
         * @type {Object}
         * @override
         */
        FlashFormModel.prototype.datasource = [
            {
                backupPicFile: function (model) {
                    var result = {
                        type: 'image',
                        previewContainer: '',
                        idPrefix: 'backup-pic',
                        creativeType: 'flash-backup-pic'
                    };

                    if (model.get('id')) {
                        result.materialType = model.get('backupPicType');
                        result.value = model.get('backupPicUrl');
                        result.materialLocalPath = 
                            model.get('backupPicLocalPath');
                        result.width = model.get('backupPicWidth');
                        result.height = model.get('backupPicHeight');
                    }

                    return result;
                },
                rule: {
                    retrieve: datasource.rule(
                        'defaultMaxLength',
                        'urlLength',
                        // 暂时未使用，待后续确定规则
                        'urlPattern'
                    ),
                    dump: true
                },
                targetWindow: function (model) {
                    var value = model.get('targetWindow');
                    return typeof value === 'number' ? value + '' : value;
                },
                clickTag: function (model) {
                    var value = model.get('clickTag');
                    return typeof value === 'number' ? value + '' : value;
                },
                wmode: function (model) {
                    var value = model.get('wmode');
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
        FlashFormModel.prototype.fillEntity = function (entity) {
            var CreativeType = require('./enum').Type;
            entity.type = CreativeType.FLASH; // Flash
            return entity;
        };

        /**
         * 判断实体是否有变化
         *
         * @param {Object} entity 新的实体
         * @return {boolean}
         * @overide
         */
        FlashFormModel.prototype.isEntityChanged = function (entity) {
            // 如果是新建的话，要先建立一个空的original
            // 编辑时则以后端取回的数据为准
            var emptyEntity = {
                name: '',
                type: 2,
                width: NaN,
                height: NaN,
                wmode: 0,
                targetWindow: 0,
                flashDivFlag: 0,
                monitorUrl: '',
                materialUrl: undefined,
                materialType: 1,
                backupPicFlag: 0,
                cbExtFlag: 0
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

                // 如果undefined，改为null和后端一致
                // entity.materialLocalPath = original.materialLocalPath;
                // entity.backupPicLocalPath = original.backupPicLocalPath;

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

                // 补上clickTag的默认值
                if (!entity.flashDivFlag) {
                    entity.clickTag = 1;
                }


            }

            return !u.isEqual(entity, original);
        };

        return FlashFormModel;
    }
);