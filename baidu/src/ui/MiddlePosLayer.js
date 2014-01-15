/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 支持上中，下中，左中，右中定位的Layer
 * @author lixiang(lixiang05@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var lib = require('esui/lib');
        var ui = require('esui/main');
        var TipLayer = require('esui/TipLayer');

        /**
         * 提示层控件类
         * 
         * @constructor
         * @param {Object} options 初始化参数
         */
        function MiddlePosLayer(options) {
            TipLayer.apply(this, arguments);
        }

        lib.inherits(MiddlePosLayer, TipLayer);

        /**
         * 控件类型
         * 
         * @type {string}
         */
        MiddlePosLayer.prototype.type = 'MiddlePosLayer';
        MiddlePosLayer.prototype.styleType = 'TipLayer';

        /**
         * 让当前层靠住一个元素
         * 只有四个方向，上中，下中，左中，右中
         * @param {HTMLElement} target 目标元素
         * @param {Object=} options 停靠相关的选项
         * @param {string=} options.verticalAlign 弹层垂直对齐模式，
         * 可选值为**top**或**bottom**或**center**
         * @param {string=} options.horizontalAlign 弹层水平对齐模式，
         * 可选值为**left**或**right**或**center**
         * @public
         */
        MiddlePosLayer.prototype.autoPosition = function (target, options) {
            var tipLayer = this;
            // 设置默认option
            options = options 
                || { verticalAlign: 'top', horizontalAlign: 'center' };
            // options.verticalAlign = options.verticalAlign || 'top';
            // options.horizontalAlign = options.verticalAlign || 'center';

            var config = lib.clone(options);

            // 获取目标元素的位置信息
            var rect = target.getBoundingClientRect();
            var targetPosition = {
                top: rect.top,
                right: rect.right,
                bottom: rect.bottom,
                left: rect.left,
                width: rect.right - rect.left,
                height: rect.bottom - rect.top
            };
                
            // 浮层的存在会影响页面高度计算，必须先让它消失，
            // 但在消失前，又必须先计算到浮层的正确高度
            var layerElement = tipLayer.main;
            var previousDisplayValue = layerElement.style.display;
            layerElement.style.display = 'block';
            var layerElementHeight = layerElement.offsetHeight;
            var layerElementWidth = layerElement.offsetWidth;
            layerElement.style.display = 'none';

            // 屏幕尺寸信息
            var viewWidth = lib.page.getViewWidth();
            var viewHeight = lib.page.getViewHeight();

            // 计算可用空间
            // 1. 目标元素左面空间与弹层元素的宽度差
            var gapLeft = targetPosition.left - layerElementWidth;
            // 2. 目标元素右面空间与弹层元素的宽度差
            var gapRight = viewWidth - targetPosition.right - layerElementWidth;

            // 选择：设置优先级最高，否则哪边大放哪边
            if (gapLeft >= 0) {
                // 右侧也有空间
                if (gapRight >= 0){
                    // 如果没有设置，哪边大放哪边
                    if (!config.horizontalAlign) {
                        if (gapRight < gapLeft) {
                            config.horizontalAlign = 'right';
                        }
                        else {
                            config.horizontalAlign = 'left';
                        }
                    }
                }
                // 没有空间，如果设置了放右，则修正到left
                else if (config.horizontalAlign === 'right') {
                    config.horizontalAlign = 'left';
                } 
            }
            // 左侧空间不够
            else {
                // 右侧有空间
                if (gapRight >= 0){
                    // 如果没有设置或设置了放左，则修正到right
                    if (config.horizontalAlign !== 'right'
                        && config.horizontalAlign !== 'center') {
                        config.horizontalAlign = 'right';
                    }
                }
                // 右侧空间不够，就按照设置默认的吧。。。
            }

            // 3. 目标元素上面空间与弹层元素的高度差
            var gapTop = targetPosition.top - layerElementHeight;
            // 4. 目标元素下面空间与弹层元素的高度差
            var gapBottom = 
                viewHeight - targetPosition.bottom - layerElementHeight;

            // 选择：设置优先级最高，否则哪边大放哪边
            if (gapTop >= 0) {
                // 下面也有空间
                if (gapBottom >= 0){
                    // 如果没有设置，哪边大放哪边
                    if (!config.verticalAlign) {
                        if (gapTop < gapBottom) {
                            config.verticalAlign = 'bottom';
                        }
                        else {
                            config.verticalAlign = 'top';
                        }
                    }
                }
                // 没有空间，如果设置了放上，则修正到bottom
                else if (config.verticalAlign === 'bottom') {
                    config.verticalAlign = 'top';
                } 
            }
            // 上面空间不够
            else {
                // 下面有空间
                if (gapBottom >= 0){
                    // 如果没有设置或设置了放上，则修正到bottom
                    if (config.verticalAlign !== 'bottom'
                        || config.verticalAlign !== 'center') {
                        config.verticalAlign = 'bottom';
                    }
                }
                // 下面空间不够，就按照设置默认的吧。。。
            }
            // 根据统一后的配置计算位置
            var properties = {};
            var arrowClass;
            var offset = lib.getOffset(target);

            // 水平对齐
            if (!config.horizontalAlign || config.horizontalAlign === 'right') {
                config.horizontalAlign = 'right';
                properties.left = offset['right'];
            }
            else if (config.horizontalAlign === 'left') {
                properties.left = offset['left'] - layerElementWidth;
            }
            else if (config.horizontalAlign === 'center') {
                properties.left = offset['left'] 
                    - (layerElementWidth - targetPosition.width) / 2;
            }

            // 垂直对齐
            if (!config.verticalAlign || config.verticalAlign === 'top') {
                config.verticalAlign = 'top';
                properties.top = offset['top'] - layerElementHeight;
            }
            else if (config.verticalAlign === 'bottom') {
                properties.top = offset['bottom'];
            }
            else if (config.verticalAlign === 'center') {
                properties.top = offset['top'] 
                    - (layerElementHeight - targetPosition.height) / 2;
            }

            // 箭头的样式也不一样
            var arrowClass = 
                config.horizontalAlign + '-' + config.verticalAlign;

            layerElement.style.display = previousDisplayValue;

            layerElement.className = ''
                + tipLayer.helper.getPartClassName()
                + ' '
                + tipLayer.helper.getPartClassName(arrowClass);

            var arrow = tipLayer.helper.getPart('arrow');
            if (arrow) {
                arrow.className = ''
                    + tipLayer.helper.getPartClassName('arrow')
                    + ' '
                    + tipLayer.helper.getPartClassName(
                        'arrow' + '-' + arrowClass
                    );
                var arrowRect = arrow.getBoundingClientRect();
                if (config.horizontalAlign === 'center') { 
                    // 计算一下arrow的宽度
                    var arrowWidth = arrowRect.right - arrowRect.left;
                    arrow.style.left = 
                        (layerElementWidth - arrowWidth) / 2 + 'px';
                }
                if (config.verticalAlign === 'center') {
                    var arrowHeight = arrowRect.bottom - arrowRect.top;
                    arrow.style.top =
                        (layerElementHeight - arrowHeight) / 2 + 'px'; 
                }
            }
            this.renderLayer(layerElement, properties);
        };

        ui.register(MiddlePosLayer);

        return MiddlePosLayer;
    }
);
