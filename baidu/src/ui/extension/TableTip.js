/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file TODO: 添加文件说明
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var Extension = require('esui/Extension');
        var lib = require('esui/lib');
        var ui = require('esui');
        var u = require('underscore');

        require('esui/TipLayer');

        /**
         * 用于表格的Tip扩展，为操作列图标添加Tip
         *
         * @constructor
         * @extends esui/Extension
         */
        function TableTip() {
            Extension.apply(this, arguments);

            this.initTips = u.bind(this.initTips, this);
        }

        TableTip.prototype.type = 'TableTip';

        var typeRule = /table-operation-(\w+)/;

        function getTipType(element) {
            return typeRule.exec(element.className)[1];
        }

        /**
         * 创建Tip控件并附加到相应元素上
         *
         * @param {HTMLElement[]} elements 需要Tip的元素
         * @param {string} type 操作类型
         */
        TableTip.prototype.createAndAttackTip = function (elements, type) {
            var options = {
                id: 'table-operation-tip-' + u.escape(type),
                viewContext: this.target.viewContext,
                content: lib.getText(elements[0]),
                arrow: true,
                skin: 'table-tip'
            };
            var tip = ui.create('TipLayer', options);
            tip.appendTo(document.body);
            u.each(
                elements, 
                function (element) {
                    var options = {
                        targetDOM: element,
                        showMode: 'over',
                        delayTime: 200,
                        positionOpt: {
                            bottom: 'bottom',
                            left: 'left'
                        }
                    };
                    tip.attachTo(options);
                }
            );
        };

        /**
         * 初始化操作列Tip
         */
        TableTip.prototype.initTips = function () {
            if (!document.querySelectorAll) {
                return;
            }

            var elements = document.querySelectorAll('.table-operation');

            u.chain(elements)
                .groupBy(getTipType)
                .each(u.bind(this.createAndAttackTip, this));
        };

        /**
         * 激活扩展
         *
         * @public
         */
        TableTip.prototype.activate = function () {
            Extension.prototype.activate.apply(this, arguments);

            this.target.on('afterrender', this.initTips);
        };

        /**
         * 取消扩展的激活状态
         *
         * @public
         */
        TableTip.prototype.inactivate = function () {
            this.target.un('afterrender', this.initTips);

            Extension.prototype.inactivate.apply(this, arguments);
        };

        lib.inherits(TableTip, Extension);
        ui.registerExtension(TableTip);

        return TableTip;
    }
);        
