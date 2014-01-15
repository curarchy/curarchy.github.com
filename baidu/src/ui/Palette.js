/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 调色板控件
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var lib = require('esui/lib');
        var helper = require('esui/controlHelper');
        var InputControl = require('esui/InputControl');

        /**
         * 调色板控件
         *
         * @param {Object=} options 初始化参数
         * @extends esui/InputControl
         * @constructor
         * @public
         */
        function Palette(options) {
            InputControl.apply(this, arguments);
        }

        Palette.prototype.type = 'Palette';

        /**
         * 默认属性
         *
         * @type {Object}
         * @public
         */
        Palette.defaultProperties = {
            canvasWidth: 180,
            canvasHeight: 140,
            width: 200,
            height: 140
        };

        /**
         * 初始化参数
         *
         * @param {Object=} options 构造函数传入的参数
         * @override
         * @protected
         */
        Palette.prototype.initOptions = function (options) {
            // 因为多数是链接，默认来个蓝色
            var properties = {
                rawValue: '0000ff'
            };
            lib.extend(properties, Palette.defaultProperties, options);
            this.setProperties(properties);
        };

        /**
         * 初始化DOM结构
         *
         * @override
         * @protected
         */
        Palette.prototype.initStructure = function () {
            var getClasses = helper.getPartClasses;

            function begin(control, tag, part) {
                return lib.format(
                    '<' + tag + ' id="${id}" class="${classes}">',
                    {
                        id: helper.getId(control, part),
                        classes: getClasses(control, part).join(' ')
                    }
                );
            }
            function end(control, tag, part) {
                return lib.format(
                    '</' + tag + '>',
                    {
                        id: helper.getId(control, part),
                        classes: getClasses(control, part).join(' ')
                    }
                );
            }

            var html = [
                begin(this, 'div', 'canvas'),
                    begin(this, 'span', 'canvas-pointer'),
                    end(this, 'span', 'canvas-pointer'),
                end(this, 'div', 'canvas'),
                begin(this, 'div', 'light'),
                    begin(this, 'div', 'light-slider'),
                        begin(this, 'div', 'light-mask'),
                        end(this, 'div', 'light-mask'),
                    end(this, 'div', 'light-slider'),
                    begin(this, 'div', 'light-pointer'),
                    end(this, 'div', 'light-pointer'),
                end(this, 'div', 'light')
            ];

            this.main.innerHTML = html.join('');

            var canvas = lib.g(helper.getId(this, 'canvas'));
            helper.addDOMEvent(this, canvas, 'click', syncBaseColor);
            var slider = lib.g(helper.getId(this, 'light'));
            helper.addDOMEvent(this, slider, 'click', syncSaturation);
        };

        function syncBaseColor(e) {
            // 画布横向（自左向右）为Hue值从0到360平均分布
            this.hue = e.offsetX / e.target.offsetWidth * 360;

            // 画布纵向（自上向下）为Saturation值从1到0平均分布
            this.saturation = 1 - e.offsetY / e.target.offsetHeight;

            syncColorToValue.call(this);
            syncColorToCanvas.call(this);
        }

        function syncSaturation(e) {
            // 右侧纵条（自上向下）为Light值从1到0平均分布
            this.light = Math.min(1 - e.offsetY / e.target.offsetHeight, 1);

            syncColorToValue.call(this);
            syncColorToCanvas.call(this);
        }

        function syncColorToValue() {
            var color = require('./util/color').hslToHex(
                this.hue, 
                this.saturation, 
                this.light
            );
            if (color !== this.rawValue) {
                this.rawValue = color;
                this.fire('change');
            }
        }

        function syncColorToCanvas() {
            var canvas = lib.g(helper.getId(this, 'canvas'));
            var canvasPointer = lib.g(helper.getId(this, 'canvas-pointer'));
            var canvasX = this.hue / 360 * canvas.offsetWidth;
            canvasX -= canvasPointer.offsetWidth / 2;
            var canvasY = (1 - this.saturation) * canvas.offsetHeight;
            canvasY -= canvasPointer.offsetHeight / 2;
            canvasPointer.style.left = Math.round(canvasX) + 'px';
            canvasPointer.style.top = Math.round(canvasY) + 'px';

            // 改掉Light纵栏的底色
            var baseColor = require('./util/color').hslToHex(
                this.hue, 
                this.saturation,
                0.5
            );
            var lightSlider = lib.g(helper.getId(this, 'light-slider'));
            lightSlider.style.backgroundColor = '#' + baseColor;

            var light = lib.g(helper.getId(this, 'light'));
            var lightPointer = lib.g(helper.getId(this, 'light-pointer'));
            var lightY = (1 - this.light) * light.offsetHeight;
            lightY -= lightPointer.offsetHeight / 2;
            lightPointer.style.top = Math.round(lightY) + 'px';
        }

        /**
         * 渲染自身
         *
         * @override
         * @protected
         */
        Palette.prototype.repaint = helper.createRepaint(
            InputControl.prototype.repaint,
            {
                name: 'rawValue',
                paint: function (palette, rawValue) {
                    var colorUtil = require('./util/color');
                    var hsl = colorUtil.hexToHSL(rawValue);

                    palette.hue = hsl.hue;
                    palette.saturation = hsl.saturation;
                    palette.light = hsl.light;

                    syncColorToCanvas.call(palette);
                }
            }
        );

        lib.inherits(Palette, InputControl);
        require('esui').register(Palette);
        return Palette;
    }
);
