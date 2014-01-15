/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file View基类
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var UIView = require('ef/UIView');
        var util = require('er/util');
        var u = require('underscore');

        /**
         * 列表视图基类
         *
         * @constructor
         * @extends ef/UIView
         */
        function BaseView() {
            UIView.apply(this, arguments);
        }

        util.inherits(BaseView, UIView);

        /**
         * 渲染当前视图
         *
         * @override
         */
        BaseView.prototype.render = function () {
            // 作为子Action嵌入页面时，模板使用`xxxMain`这个target
            if (this.model && this.model.get('isChildAction')) {
                this.template += 'Main';
            }

            UIView.prototype.render.apply(this, arguments);
        };

        var globalToast;

        /**
         * 显示toast提示信息，这个方法会控制一个单例，以免信息叠在一起
         *
         * @parma {string} content 显示的内容
         * @param {Object=} options 配置
         * @param {string=} status 状态类型，可以使用**error**
         */
        BaseView.prototype.showToast = function (content, options) {
            if (!globalToast) {
                // 此处直接new控件出来，
                // 因为这个控件不能属于任何一个业务模块的ViewContext，
                // 不然会随着跳转被销毁，造成下次用不了
                var Toast = require('ui/Toast');
                var toastOptions = { disposeOnHide: false, autoShow: false };
                globalToast = new Toast(toastOptions);
                globalToast.on(
                    'hide', 
                    u.bind(globalToast.detach, globalToast)
                );
                globalToast.render();
            }

            // 如果这个信息无比素正好显示着内容，又有新内容要显示，
            // 那么新内容也应该有个动画效果，以吸引用户眼球，
            // 所以要先`detach`一次，让`animation`生效
            globalToast.detach();
            var properties = {
                content: content,
                status: undefined
            };
            properties = u.extend(properties, options);
            globalToast.setProperties(properties);
            globalToast.show();
            return globalToast;
        };

        /**
         * 等待用户确认
         *
         * 参数同`UIView.prototype.confirm`
         *
         * @return {er/Promise} 一个`Promise`对象，用户确认则进入**resolved**状态，
         * 用户取消则进入**rejected**状态
         */
        BaseView.prototype.waitConfirm = function () {
            var dialog = this.confirm.apply(this, arguments);
            var Deferred = require('er/Deferred');
            var deferred = new Deferred();

            dialog.on('ok', deferred.resolver.resolve);
            dialog.on('cancel', deferred.resolver.reject);

            return deferred.promise;
        };

        /**
         * 等待DialogAction加载完成
         *
         * @return {er/Promise} 一个`Promise`对象，用户确认则进入**resolved**状态，
         * 用户取消则进入**rejected**状态
         */
        BaseView.prototype.waitActionDialog = function () {
            var dialog = this.popActionDialog.apply(this, arguments);

            var Deferred = require('er/Deferred');
            var deferred = new Deferred();

            dialog.on('actionloaded', deferred.resolver.resolve);

            return deferred.promise;
        };

        return BaseView;
    }
);
