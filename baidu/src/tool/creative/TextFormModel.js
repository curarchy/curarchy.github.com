/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 创意表单数据模型类
 * @author liyidong(srhb18@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var BaseFormModel = require('./BaseFormModel');
        var Data = require('./Data');
        var util = require('er/util');
        var datasource = require('er/datasource');
        var u = require('underscore');

        /**
         * 创意表单数据模型类
         *
         * @constructor
         * @extends common/FormModel
         */
        function TextFormModel() {
            BaseFormModel.apply(this, arguments);    
            this.data = new Data();
        }

        util.inherits(TextFormModel, BaseFormModel);

        TextFormModel.prototype.creativeType = 'text';

        /**
         * 数据源配置
         *
         * @type {Object}
         * @override
         */
        TextFormModel.prototype.datasource = [
            {
                rule: {
                    retrieve: datasource.rule(
                        'defaultMaxLength',
                        'urlLength',
                        // 暂时未使用，待后续确定规则
                        'urlPattern'
                    ),
                    dump: true
                }
            }
        ];

        /**
         * 对数据源进行预处理
         */
        TextFormModel.prototype.prepare = function () {
            if (this.get('formType') === 'update') {
                // 处理目标窗口格式
                if (!this.get('targetWindow')) {
                    this.set('targetWindow', '0');
                }
                else {
                    this.set('targetWindow', '1');
                }
            }
            if (this.get('formType') === 'create') {
                this.set('defaultUnderline', true);
                this.set('hoverUnderline', true);
                this.set('defaultColor', '0000FF');
                this.set('hoverColor', '0000FF');
                this.set('fontSize', 12);
            }
        };

        /**
         * 检查实体数据完整性，可在此补充一些视图无法提供的属性
         *
         * @param {Object} entity 实体数据
         * @return {Object} 补充完整的实体数据
         */
        TextFormModel.prototype.fillEntity = function (entity) {
            var CreativeType = require('./enum').Type;
            entity.type = CreativeType.TEXT; // 文字链
            return entity;
        };

        /**
         * 检验实体有效性
         *
         * @param {Object} entity 提交的实体
         * @return {Object[] | true} 返回`true`表示验证通过，否则返回错误字体
         */
        TextFormModel.prototype.validateEntity = function (entity) {
            var errorMsg = [];

            if (entity.words.length > 1000) {
                errorMsg.push(
                    { field: 'words', message: '文字内容不能超过1000' }
                );
            }

            if (errorMsg.length > 0) {
                return errorMsg;
            }
            else {
                return true;
            }
        };

        /**
         * 判断实体是否有变化
         *
         * @param {Object} entity 新的实体
         * @return {boolean}
         * @overide
         */
        TextFormModel.prototype.isEntityChanged = function (entity) {
            // 如果是新建的话，要先建立一个空的original
            // 编辑时则以后端取回的数据为准
            var emptyEntity = {
                cbExtFlag: 0,
                clickUrl: '',
                defaultBold: 0,
                defaultColor: '0000FF',
                defaultItalic: 0,
                defaultUnderline: 1,
                fontSize: 12,
                hoverBold: 0,
                hoverColor: '0000FF',
                hoverItalic: 0,
                hoverUnderline: 1,
                monitorUrl: '',
                name: '',
                targetWindow: 0,
                type: 0,
                words: ''
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

                if (original.hasOwnProperty('fontUnit')) {
                    entity.fontUnit = original.fontUnit;
                }

                if (entity.cbExtFlag) {
                    entity.cbExt = [
                        entity['cbExt[0]'],
                        entity['cbExt[1]'],
                        entity['cbExt[2]']
                    ];
                    entity = u.omit(entity, 'cbExt[0]', 'cbExt[1]', 'cbExt[2]');
                }
                else {
                    entity.cbExt = ['', '', ''];
                }
            }

            return !u.isEqual(entity, original);
        };


        return TextFormModel;
    }
);