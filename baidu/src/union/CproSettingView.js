/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file union表单视图类
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var FormView = require('common/FormView');
        var util = require('er/util');

        require('tpl!./tpl/cproSetting.tpl.html');

        /**
         * union表单视图类
         *
         * @constructor
         * @extends common/FormView
         */
        function CproSettingView() {
            FormView.apply(this, arguments);
        }

        util.inherits(CproSettingView, FormView);

        /** 
         * 使用的模板名称
         *
         * @type {string}
         */
        CproSettingView.prototype.template = 'cproSetting';

        /**
         * 从表单中获取实体数据
         *
         * @return {Object}
         */
        CproSettingView.prototype.getEntity = function () {
            try {
                var frame = this.get('frame');
                var config = frame.callContentMethod('getCproConfig');
                config = config || {};

                if (!config.code) {
                    this.alert('此网盟样式错误', '网盟样式配置错误');
                    throw new Error(
                        'Cpro string invalid for ' + this.model.get('id'));
                }

                return config;
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
        CproSettingView.prototype.notifyErrors = function (errors) {
            var error = errors.fields[0].message;
            this.alert(error, '网盟样式配置错误');
        };

        /**
         * 控件事件配置
         *
         * @type {Object}
         * @override
         */
        CproSettingView.prototype.uiEvents = {
            'submit:click': function () {
                this.fire('submit');
            }
        };

        /**
         * 渲染
         *
         * @override
         */
        CproSettingView.prototype.enterDocument = function () {
            FormView.prototype.enterDocument.apply(this, arguments);

            var model = this.model;

            var currentModel = model.get('currentModel');
            var cproAdType = model.get('catalog');
            var cproCode = model.get('code');

            // Union读取cpro信息的接口
            // 有三种模式：
            // 1. 广告位补余选项自定义设置
            // 2. 新建网盟物料
            // 3. 修改网盟物料
            // 
            // 1、3两种模式需要写code字段，即cpro串
            // 2给默认值，空串
            window.getAdposData = function() {
                var info;
                if (currentModel === 'slotCproSetting') {
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
        
        return CproSettingView;
    }
);