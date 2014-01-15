/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file ColorPicker控件
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var lib = require('esui/lib');
        var helper = require('esui/controlHelper');
        var InputControl = require('esui/InputControl');

        require('esui/TextBox');
        require('esui/Button');

        /**
         * ColorPicker控件
         *
         * @param {Object=} options 初始化参数
         * @extends esui/InputControl
         * @constructor
         * @public
         */
        function ColorPicker(options) {
            InputControl.apply(this, arguments);
        }

        ColorPicker.prototype.type = 'ColorPicker';

        /**
         * 默认属性
         *
         * @type {Object}
         * @public
         */
        ColorPicker.defaultProperties = {
            colors: [
                { text: '红色', value: 'ff0000' },
                { text: '绿色', value: '00ff00' },
                { text: '蓝色', value: '0000ff' },
                { text: '黄色', value: 'ffff00' },
                { text: '青色', value: '00ffff' },
                { text: '紫色', value: 'ff00ff' },


                { text: '深红色', value: '880000' },
                { text: '深绿色', value: '008800' },
                { text: '深蓝色', value: '000088' },
                { text: '深黄色', value: '888800' },
                { text: '深青色', value: '008888' },
                { text: '深紫色', value: '880088' }
            ],

            grayColors: [
                { text: '黑色', value: '000000' },
                { text: '深灰色', value: '333333' },
                { text: '灰色', value: '666666' },
                { text: '浅灰色', value: '999999' },
                { text: '浅白色', value: 'cccccc' },
                { text: '白色', value: 'ffffff' }
            ]
        };

        /**
         * 初始化参数
         *
         * @param {Object=} options 构造函数传入的参数
         * @override
         * @protected
         */
        ColorPicker.prototype.initOptions = function (options) {
            var properties = {};
            lib.extend(properties, ColorPicker.defaultProperties, options);
            this.setProperties(properties);
        };

        /**
         * 初始化DOM结构
         *
         * @override
         * @protected
         */
        ColorPicker.prototype.initStructure = function () {
            helper.addDOMEvent(this, this.main, 'click', toggleLayer);
        };

        function syncValue(colorPicker) {
            var layer = getLayer(colorPicker);

            var blocks = layer.getElementsByTagName('span');
            var blockClass = 
                helper.getPartClasses(colorPicker, 'block')[0];

            for (var i = 0; i < blocks.length; i++) {
                var block = blocks[i];
                if (lib.hasClass(block, blockClass)) {
                    var color = lib.getAttribute(block, 'data-value');

                    var method = color === colorPicker.rawValue
                        ? 'addPartClasses'
                        : 'removePartClasses';
                    helper[method](colorPicker, 'selected', block);
                }
            }

            var current = lib.g(helper.getId(colorPicker, 'current-color'));
            current.style.backgroundColor = '#' + colorPicker.rawValue;
        }

        function createLayer(colorPicker) {
            var layer = helper.layer.create();
            layer.id = helper.getId(colorPicker, 'layer');
            helper.addPartClasses(colorPicker, 'layer', layer);
            hideLayer(colorPicker, layer);
            document.body.appendChild(layer);

            var getClasses = function (part) {
                return helper.getPartClasses(colorPicker, part).join(' ');
            };

            var blockTemplate = 
                '<span class="' + getClasses('block') + '" '
                    + 'title="${text}" '
                    + 'data-value="${value}" '
                    + 'style="background-color: #${value}">'
                    + '${text}'
                    + '</span>';

            var html = 
                '<div class="' + getClasses('custom') + '">';
            html += '<span id="' + helper.getId(colorPicker, 'current-color')
                + '" '
                + 'class="' + getClasses('current-color') + '">'
                + '</span>';
            html += '<input data-ui-type="TextBox" '
                + 'data-ui-child-name="colorValue" data-ui-width="110" />';
            html += '<span data-ui-type="Button" '
                + 'data-ui-child-name="more">更多</span>';
            html += '</div>';

            html += '<div class="' + getClasses('popular') + '">';
            for (var i = 0; i < colorPicker.colors.length; i++) {
                html += lib.format(blockTemplate, colorPicker.colors[i]);
            }
            html += '</div>';

            html += '<div class="' + getClasses('gray') + '">';
            for (var i = 0; i < colorPicker.grayColors.length; i++) {
                html += lib.format(blockTemplate, colorPicker.grayColors[i]);
            }
            html += '</div>';
            layer.innerHTML = html;

            colorPicker.initChildren(layer);

            helper.addDOMEvent(colorPicker, document, 'mousedown', closeLayer);
            helper.addDOMEvent(colorPicker, layer, 'click', chooseColor);
            helper.addDOMEvent(
                colorPicker, 
                layer,
                'mousedown',
                function (e) { e.stopPropagation(); }
            );
            colorPicker.getChild('more').on(
                'click',
                lib.bind(function () { this.fire('more'); }, colorPicker)
            );
            colorPicker.getChild('colorValue').on(
                'input',
                lib.bind(syncColorFromInput, colorPicker)
            );

            syncValue(colorPicker);
        }

        function syncColorFromInput(e) {
            var text = e.target.getValue();
            var colorUtil = require('./util/color');
            if (colorUtil.isValidRGB(text)) {
                if (text.indexOf('#') === 0) {
                    text = text.substring(1);
                }
                this.setRawValue(text);
            }
        }

        function getLayer(colorPicker) {
            var layer = lib.g(helper.getId(colorPicker, 'layer'));
            if (!layer) {
                layer = createLayer(colorPicker);
            }

            return layer;
        }

        /**
         * 隐藏下拉弹层
         *
         * @param {ColorPicker} ColorPicker控件实例
         * @param {HTMLElement=} layer 已经生成的浮层元素
         * @inner
         */
        function hideLayer(colorPicker, layer) {
            layer = layer || lib.g(helper.getId(colorPicker, 'layer'));
            if (layer) {
                helper.addPartClasses(colorPicker, 'layer-hidden', layer);
                colorPicker.removeState('active');
            }
        }

        /**
         * 关闭下拉弹层
         *
         * @param {Event} 触发事件的事件对象
         * @inner
         */
        function closeLayer(e) {
            var target = e.target;
            var layer = lib.g(helper.getId(this, 'layer'));
            var main = this.main;

            if (!layer) {
                return;
            }

            while (target && (target !== layer && target !== main)) {
                target = target.parentNode;
            }

            if (target !== layer && target !== main) {
                hideLayer(this);
            }
        }

        /**
         * 显示下拉弹层
         *
         * @param {ColorPicker} ColorPicker控件实例
         * @inner
         */
        function showLayer(colorPicker) {
            var layer = lib.g(helper.getId(colorPicker, 'layer'));
            var classes = helper.getPartClasses(colorPicker, 'layer-hidden');

            layer.style.zIndex = helper.layer.getZIndex(colorPicker.main);
            
            helper.layer.attachTo(
                layer, 
                colorPicker.main, 
                {
                    top: 'bottom',
                    left: 'left',
                    right: 'right',
                    spaceDetection: 'vertical'
                }
            );
            lib.removeClasses(layer, classes);
            colorPicker.addState('active');

            var colorValue = colorPicker.getChild('colorValue');
            colorValue.setValue(colorPicker.rawValue);
        }

        /**
         * 根据当前状态显示或隐藏浮层
         *
         * @param {ColorPicker} this 控件实例
         * @inner
         */
        function toggleLayer() {
            var layer = lib.g(helper.getId(this, 'layer'));
            if (!layer) {
                createLayer(this);
                showLayer(this);
            }
            else {
                var classes = helper.getPartClasses(this, 'layer-hidden');
                if (lib.hasClass(layer, classes[0])) {
                    showLayer(this);
                }
                else {
                    hideLayer(this);
                }
            }
        }

        /**
         * 选择颜色
         *
         * @param {Event} e DOM事件对象
         */
        function chooseColor(e) {
            var blockClass = helper.getPartClasses(this, 'block')[0];
            if (lib.hasClass(e.target, blockClass)) {
                var color = lib.getAttribute(e.target, 'data-value');
                this.setRawValue(color);

                hideLayer(this);
            }
        }

        /**
         * 渲染自身
         *
         * @override
         * @protected
         */
        ColorPicker.prototype.repaint = helper.createRepaint(
            InputControl.prototype.repaint,
            {
                name: 'rawValue',
                paint: function (colorPicker, rawValue) {
                    // 如果是3位的，改成6位统一一下
                    if (rawValue && rawValue.length === 3) {
                        rawValue = rawValue.charAt(0) + rawValue.charAt(0)
                            + rawValue.charAt(1) + rawValue.charAt(1)
                            + rawValue.charAt(2) + rawValue.charAt(2);
                        colorPicker.rawValue = rawValue;
                    }

                    var layer = lib.g(helper.getId(colorPicker, 'layer'));

                    if (!layer) {
                        return;
                    }

                    syncValue(colorPicker);
                }
            }
        );

        /**
         * 批量更新属性并重绘
         *
         * @param {Object} 需更新的属性
         * @override
         * @public
         */
        ColorPicker.prototype.setProperties = function (properties) {
            var changes = 
                InputControl.prototype.setProperties.apply(this, arguments);

            if (changes.hasOwnProperty('rawValue')) {
                this.fire('change');
            }

            return changes;
        };

        lib.inherits(ColorPicker, InputControl);
        require('esui').register(ColorPicker);
        return ColorPicker;
    }
);
