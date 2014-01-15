define(
    function (require) {
        require('ui/Palette');
        var Dialog = require('esui/Dialog');
        var lib = require('esui/lib');
        var helper = require('esui/controlHelper');
        var ui = require('esui/main');
        var u = require('underscore');
        var colorUtil = require('./util/color');

        /**
         * PaletteDialog类
         *
         * @constructor
         * @extends esui/Dialog
         */
        function PaletteDialog() {
            Dialog.apply(this, arguments);
        }

        PaletteDialog.prototype.type = 'PaletteDialog';
        PaletteDialog.prototype.styleType = 'Dialog';

            /**
             * 初始化参数
             *
             * @param {Object=} options 构造函数传入的参数
             * @override
             * @protected
             */
        PaletteDialog.prototype.initOptions = function (options) {
            /**
             * 默认Dialog选项配置
             */
            var properties = {
                closeButton: true,    // 是否具有关闭按钮
                closeOnHide: true,    // 右上角关闭按钮是隐藏还是移除
                draggable: false,     // 是否可拖拽
                mask: true,           // 是否具有遮挡层
                title: '颜色选择',    // 标题的显示文字
                needFoot: false,
                width: 612,
                roles: {},
                // 之后是颜色控件特有的
                value: '000000',
                cacheValue: '000000'
            };

            if (options.closeOnHide === 'false') {
                options.closeOnHide = false;
            }

            if (options.closeButton === 'false') {
                options.closeButton = false;
            }

            if (options.mask === 'false') {
                options.mask = false;
            }

            if (options.needFoot === 'false') {
                options.needFoot = false;
            }

            lib.extend(properties, options);

            if (properties.needFoot) {
                if (!properties.foot) {
                    properties.foot = properties.defaultFoot;
                }
            }
            this.setProperties(properties);
        };

        /**
         * 设置HTML内容，`PaletteDialog`没有这功能
         *
         * @public
         */
        PaletteDialog.prototype.setContent = function () {
        };

        PaletteDialog.prototype.initStructure = function () {
            Dialog.prototype.initStructure.apply(this, arguments);
            // 给main加class
            lib.addClass(this.main, 'ui-palette-dialog');
        };

        /**
         * 构建对话框主内容和底部内容
         *
         * @param {string} type foot | body
         * @param {HTMLElement} mainDOM body或foot主元素
         *
         * @return {esui.Panel} panel
         * @protected
         */
        PaletteDialog.prototype.createBF = function (type, mainDOM) {
            if (mainDOM) {
                this.content = mainDOM.innerHTML;
            }
            else {
                mainDOM = document.createElement('div');
                this.main.appendChild(mainDOM);
            }

            lib.addClasses(
                mainDOM,
                helper.getPartClasses(this, type + '-panel')
            );

            if (type == 'body') {
                var panel = ui.create('Panel', { main: mainDOM});
                panel.render();
                this.addChild(panel, 'body');

                // 往里面填控件
                var getClasses = helper.getPartClasses;
                var html = [
                    '<div class="' + getClasses(this, 'left-section') + '">',
                        getLeftSectionHtml(this),
                    '</div>',
                    '<div class="' + getClasses(this, 'right-section') + '">',
                        getRightSectionHtml(this),
                    '</div>'
                ];

                panel.setContent(html.join(''));

                // 给颜色控件绑事件
                var colorPalette = panel.getChild('palette');
                colorPalette.on('change', lib.bind(changePalette, this));
                // 提交取消
                var submitButton = panel.getChild('btnOk');
                var cancelButton = panel.getChild('btnCancel');
                var dialog = this;
                submitButton.on('click', function () {
                    var color = colorPalette.getValue();
                    updateColorHistory(dialog, color, 'old');
                    dialog.fire('submit', { color: color });
                });
                cancelButton.on('click', function () {
                    dialog.fire('cancel');
                });

                // 输入
                var colorTypes = ['red', 'green', 'blue'];
                u.each(colorTypes, function (colorType) {
                    var colorInput = dialog.getBody().getChild(colorType);
                    colorInput.on('input', function (e) {
                        var value = this.getValue();
                        var colorType = this.childName;
                        dialog[colorType + 'Color'] = value;
                        synInputToPalette(dialog);
                    });
                });

                return panel;
            }

            return null;
        };

        /**
         * 改变颜色选盘同时更新颜色输入区和历史对比区
         *
         * @param {Event} e
         * @inner
         */
        function changePalette(e) {
            var target = e.target;
            var color = target.getValue();
            updateColorInput(this, color);
            updateColorHistory(this, color, 'new');
        }

        /**
         * 更新颜色输入区
         *
         * @param {ui.PaletteDialog} 控件对象
         * @param {string} 颜色hex值
         * @inner
         */
        function updateColorInput(control, color) {
            var rgb = colorUtil.hexToRGB(color);
            var colorTypes = ['red', 'green', 'blue'];
            u.each(colorTypes, function (colorType) {
                var colorInput = control.getBody().getChild(colorType);
                colorInput.setValue(rgb[colorType]);
                control[colorType + 'Color'] = rgb[colorType];
            });
        }

        /**
         * 将输入颜色同步到颜色历史对比和颜色选盘
         *
         * @param {ui.PaletteDialog} 控件对象
         * @inner
         */
        function synInputToPalette (control) {
            var hex = colorUtil.rgbToHex(
                control['redColor'], control['greenColor'], control['blueColor']
            );
            var colorPalette = getColorPalette(control);
            colorPalette.setValue(hex);
            updateColorHistory(control, hex, 'new');
        }


        /**
         * 更新颜色历史
         *
         * @param {ui.PaletteDialog} control 控件对象
         * @param {string} color 新颜色
         * @param {string} type 当前还是新增
         * @inner
         */
        function updateColorHistory(control, color, type) {
            var colorBlock = 
                lib.g(helper.getId(control, 'color-compare-' + type));
            colorBlock.style.background = '#' + color;
            if (type === 'new') {
                control.cacheValue = color;
            }
            else {
                control.value = color;
            }
        }

        /**
         * 搭建左侧区域，包括颜色选盘和颜色输入
         *
         * @param {ui.PaletteDialog} control 控件对象
         * @return {string}
         * @inner
         */
        function getLeftSectionHtml(control) {
            var getClasses = helper.getPartClasses;
            var html = [
                '<div data-ui-type="Palette" data-ui-child-name="palette">',
                '</div>',
                '<div class="' + getClasses(control, 'color-input') + '">',
                    getColorFieldHTML(control, 'red', '红色'),
                    getColorFieldHTML(control, 'green', '绿色'),
                    getColorFieldHTML(control, 'blue', '蓝色'),
                '</div>'
            ];

            return html.join('');
        }

        /**
         * 搭建右侧区域，包括操作按钮和颜色历史对比
         *
         * @param {ui.PaletteDialog} control 控件对象
         * @return {string}
         * @inner
         */
        function getRightSectionHtml(control) {
            var getClasses = helper.getPartClasses;
            var getId = helper.getId;
            var html = [
                '<div class="' + getClasses(control, 'color-operate') + '">',
                    '<div data-ui="type:Button;id:btnOk;',
                        'childName:btnOk;">确定</div>',
                    '<div data-ui="type:Button;',
                        'id:btnCancel;childName:btnCancel;">取消</div>',
                '</div>',
                '<div class="' + getClasses(control, 'color-compare') + '">',
                    '<div class="' + getClasses(control, 'color-compare-title'),
                    '">新增</div>',
                    '<div id="',
                     getId(control, 'color-compare-new'),
                    '" class="',
                     getClasses(control, 'color-compare-block'),
                    '"></div>',
                    '<div id="' ,
                     getId(control, 'color-compare-old'),
                    '" class="',
                     getClasses(control, 'color-compare-block'),
                    '"></div>',
                    '<div class="' + getClasses(control, 'color-compare-title'),
                    '">当前</div>',
                '</div>'
            ];

            return html.join('');
        }

        /**
         * 颜色输入单元
         *
         * @param {ui.PaletteDialog} control 控件对象
         * @param {string} colorType 颜色类型 red | green | blue
         * @param {string} colorText 颜色文字
         * @return {string}
         * @inner
         */
        function getColorFieldHTML(control, colorType, colorText) {
            var getClasses = helper.getPartClasses;
            var id = helper.getId(control, colorType);
            var html = [
                '<div class="' + getClasses(control, 'color-field') + '">',
                    '<label for="' + id + '">' + colorText + '：</label>',
                    '<input id="' + id + '" data-ui-type="TextBox" ',
                        'data-ui-child-name="' + colorType + '" ',
                    '/>',
                '</div>'
            ];
            return html.join('');
        }

        /**
         * 更新颜色输入区
         *
         * @param {ui.PaletteDialog} control 控件对象
         * @param {string} 颜色hex值
         * @param {ui.Palette} 选盘控件对象
         * @inner
         */
        function getColorPalette(control) {
            var panel = control.getChild('body');
            var colorPalette = panel.getChild('palette');
            return colorPalette;
        }


        PaletteDialog.prototype.repaint = helper.createRepaint(
            Dialog.prototype.repaint,
            {
                name: 'value',
                paint: function (dialog, value) {
                    if (!value) {
                        return;
                    }
                    // 获取body
                    var body = dialog.getBody();
                    // 更新色盘
                    var colorPalette = body.getChild('palette');
                    colorPalette.setProperties({
                        rawValue: value
                    });

                    // 更新输入
                    updateColorInput(dialog, value);
                    // 更新颜色历史
                    updateColorHistory(dialog, value, 'old');
                    updateColorHistory(dialog, value, 'new');
                }
            }
        );

        /**
         * 销毁控件
         */
        PaletteDialog.prototype.dispose = function () {
            Dialog.prototype.dispose.apply(this, arguments);
        };

        lib.inherits(PaletteDialog, Dialog);
        require('esui').register(PaletteDialog);
        return PaletteDialog;
    }
);