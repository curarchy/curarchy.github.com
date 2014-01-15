/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 网盟创意表单视图类
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var BaseFormView = require('./BaseFormView');
        var util = require('er/util');

        require('tpl!./tpl/novaForm.tpl.html');

        /**
         * 创意表单视图类
         *
         * @constructor
         * @extends common/FormView
         */
        function NovaFormView() {
            BaseFormView.apply(this, arguments);
        }

        util.inherits(NovaFormView, BaseFormView);

        /** 
         * 使用的模板名称
         *
         * @type {string}
         */
        NovaFormView.prototype.template = 'novaForm';

        /**
         * 从表单中获取实体数据
         *
         * @return {Object}
         */
        NovaFormView.prototype.getEntity = function () {
            var entity = 
                BaseFormView.prototype.getEntity.apply(this, arguments);
            
            try {
                var frame = this.get('frame');
                var config = frame.callContentMethod('getCproConfig');
                config = config || {};

                if (!config.code) {
                    this.alert('此网盟样式错误', '网盟样式配置错误');
                    throw new Error(
                        'Cpro string invalid for ' + this.model.get('id'));
                }

                entity.cproCname = config.cname;
                entity.cproCatalog = config.adType;
                entity.adCode = config.code;

                return entity;
            }
            catch (ex) {
                this.alert('获取网盟样式失败', '网盟样式配置错误');
                throw new Error(
                    'Fail to get cpro string for ' + this.model.get('id'));
            }
        };

        /**
         * 向用户通知提交错误信息
         *
         * @param {Object} errors 错误信息
         * @param {Object[]} errors.fields 出现错误的字段集合
         * @override
         */
        NovaFormView.prototype.notifyErrors = function (errors) {
            var error = errors.fields[0].message;
            this.alert(error, '网盟样式配置错误');
        };

        /**
         * 向用户通知提交错误信息
         *
         * @param {Object} errors 错误信息
         * @param {Object[]} errors.fields 出现错误的字段集合
         * @override
         */
        NovaFormView.prototype.notifyErrors = function (errors) {
            var error = errors.fields[0].message;
            this.alert(error, '网盟样式配置错误');
        };

        /**
         * 控件事件配置
         *
         * @type {Object}
         * @override
         */
        NovaFormView.prototype.uiEvents = {
            // TODO: 添加控件的事件配置，如没有则删除该属性
        };

        /**
         * 渲染
         *
         * @override
         */
        NovaFormView.prototype.enterDocument = function () {
            BaseFormView.prototype.enterDocument.apply(this, arguments);

            var model = this.model;

            var currentModel = model.get('currentModel');
            var cproAdType = model.get('catalog');
            var cproCode = model.get('code');

            // Union读取cpro信息的接口
            // 有三种模式：
            // 1. 广告位补余选项自定义设置
            // 2. 新建网盟物料novaCreate
            // 3. 修改网盟物料novaUpdate
            // 
            // 1、3两种模式需要写code字段，即cpro串
            // 2给默认值，空串
            // 这里不会有情况3,情况3在Union模块单独处理
            window.getAdposData = function() {
                var info;
                if (currentModel === 'novaUpdate') {
                    info = {
                        adType: cproAdType,
                        code: cproCode
                    };
                }
                else {
                    info = {
                        adType: 0,
                        code: ''
                    };
                }
                return info;
            };
        };
        
        return NovaFormView;
    }
);