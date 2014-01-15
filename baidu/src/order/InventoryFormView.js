/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 订单表单视图类
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var FormView = require('common/FormView');
        var util = require('er/util');

        require('tpl!./tpl/inventoryForm.tpl.html');

        /**
         * 订单表单视图类
         *
         * @constructor
         * @extends common/FormView
         */
        function InventoryFormView() {
            FormView.apply(this, arguments);
        }

        util.inherits(InventoryFormView, FormView);

        /** 
         * 使用的模板名称
         *
         * @type {string}
         */
        InventoryFormView.prototype.template = 'inventoryForm';

        /**
         * 从表单中获取实体数据
         *
         * @return {Object}
         */
        InventoryFormView.prototype.getEntity = function () {
            var entity = FormView.prototype.getEntity.apply(this, arguments);
            // TODO: 如果实体有在表单中未包含的额外属性，在此处添加，没有则删除该方法

            return entity;
        };

        /**
         * 控件额外属性配置
         *
         * @type {Object}
         * @override
         */
        InventoryFormView.prototype.uiProperties = {
            // TODO: 添加控件的额外属性配置，如没有则删除该属性
        };

        /**
         * 控件事件配置
         *
         * @type {Object}
         * @override
         */
        InventoryFormView.prototype.uiEvents = {
            'bind-union:click': bindUnion
        };

        /**
         * 开通网盟的处理句柄
         *
         */
        function bindUnion(e) {
            var view = this;
            var options = {
                url: '/setting/bindUnion',
                title: '开通百度流量交易服务'
            };
            view.waitActionDialog(options).then(
                function (e) {
                    var dialog = e.target;
                    var dialogAction = dialog.get('action');
                    dialogAction.on(
                        'entitysave',
                        function (e) {
                            // 刷新当前页面数据
                            view.fire('reloadunion', { channel: e.entity });
                        }
                    );
                }
            );
        }
        
        return InventoryFormView;
    }
);