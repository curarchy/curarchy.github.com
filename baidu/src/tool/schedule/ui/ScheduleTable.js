/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 排期表格控件
 * @author lixiang(lixiang05@baidu.com)
 * @date $DATE$
 */

define(
    function (require) {
        var u = require('underscore');
        var m = require('moment');
        var lib = require('esui/lib');
        var helper = require('esui/controlHelper');
        var Control = require('esui/Control');
        var ui = require('esui/main');

        /**
         * 排期表格类
         *
         * @constructor
         * @param {Object} options 初始化参数
         */
        function ScheduleTable(options) {
            Control.apply(this, arguments);
        }

        lib.inherits(ScheduleTable, Control);

        ScheduleTable.prototype.type = 'ScheduleTable';

        /**
         * 控件HTML
         *
         * @param {ScheduleTable} control 控件实例
         * @inner
         */
        function getHTML(control) {
            var year = control.year;
            var month = u.addZero(control.month, 2);
            // 该月多少天
            var daysInMonth = m(year + '-' + month, 'YYYY-MM').daysInMonth();
            var headHTML = getHeadHTML(control, year, month, daysInMonth);
            var contentHTML = getContentHTML(control, daysInMonth);
            return '' + headHTML + contentHTML;
        }

        /**
         * 星期和日期HTML
         *
         * @param {ScheduleTable} control 控件实例
         * @param {number} year 年份
         * @param {number|string} month 月份
         * @param {number} days 日数
         * @return {string}
         * @inner
         */
        function getHeadHTML(control, year, month, days) {
            // 星期|日期行模板
            var tpl = ''
                + '<table border="0" cellpadding="0" cellspacing="0" '
                + 'class="${className}"><tbody><tr>';

            var dayHTML = [];
            dayHTML.push(
                lib.format(
                    tpl,
                    {
                        className: control.helper.getPartClassName('day')
                    }
                )
            );

            var dateHTML = [];
            dateHTML.push(
                lib.format(
                    tpl,
                    {
                        className: control.helper.getPartClassName('date')
                    }
                )
            );

            // 单元的模板
            var tplHeadItem = '<td class="${className}">${text}</td>';
            var headItemClass = control.helper.getPartClassName('head-item');

            // 开始画
            // 按照moment的排列，0是周日
            var weeks = ['日', '一', '二', '三', '四', '五', '六'];
            var begin = 1;
            while (begin <= days) {
                var date = u.addZero(begin, 2);
                var currentDay =
                    m(year + '-' + month + '-' + date, 'YYYY-MM-DD').day();

                dateHTML.push(
                    lib.format(
                        tplHeadItem,
                        {
                            className: headItemClass,
                            text: begin
                        }
                    )
                );

                dayHTML.push(
                    lib.format(
                        tplHeadItem,
                        {
                            className: headItemClass,
                            text: weeks[currentDay]
                        }
                    )
                );
                begin++;
            }
            dateHTML.push('</tr></tbody></table>');
            dayHTML.push('</tr></tbody></table>');

            return dayHTML.join('') + dateHTML.join('');
        }

        /**
         * 获取单元html
         *
         * @param {number|Object} item 数据单元
         *
         * @return {string}
         */
        ScheduleTable.prototype.getItemHTML =
            function (item, rowIndex, colIndex) {
                // 状态映射表
                var statesMap = [
                    'vacant', 'part-sold', 'all-sold', '', 'reserved',
                    'part-sold-or-reserved', 'sold-or-reserved'
                ];

                // 排期单元的模板
                var tplItem = ''
                    + '<td colIndex="${colIndex}" rowIndex="${rowIndex}"'
                    + 'class="${baseClassName} ${stateClassName}"'
                    + 'id="${id}"></td>';

                return lib.format(
                    tplItem,
                    {
                        baseClassName: this.helper.getPartClassName('item'),
                        stateClassName: this.helper.getPartClassName(
                            'item-' + statesMap[item]
                        ),
                        rowIndex: rowIndex,
                        colIndex: colIndex,
                        id: this.helper.getId(rowIndex + '-' + colIndex)
                    }
                );
            };

        /**
         * 主体HTML
         *
         * @param {ScheduleTable} control 控件实例
         * @inner
         */
        function getContentHTML(control, days) {
            /** 绘制表体 */
            var tpl = ''
                + '<table border="0" cellpadding="0" cellspacing="0" '
                + 'class="${className}" id="${id}"><tbody><tr>';

            var html = [];
            var rowHTML = lib.format(
                tpl,
                {
                    className: control.helper.getPartClassName('content-row'),
                    id: control.helper.getId('content-row')
                }
            );
            var data = control.datasource;
            u.each(data, function (item, index) {
                // 每行数据自成一个table
                html.push(rowHTML);
                // 填充数据
                var status = item.dateStatus || [];
                for (var i = 0; i < days; i++) {
                    html.push(control.getItemHTML(status[i], index, i));
                }
                html.push('</tr></tbody></table>');
            });
            return html.join('');
        }

        /**
         * 初始化参数
         *
         * @param {Object=} options 构造函数传入的参数
         * @override
         * @protected
         */
        ScheduleTable.prototype.initOptions = function (options) {
            /**
             * 默认选项配置
             */
            var properties = {
                year: m().year(),
                month: m().month() + 1,
                datasource: [],
                autoHideTip: true
            };
            if (options.autoHideLayer === 'false') {
                options.autoHideLayer = false;
            }
            lib.extend(properties, options);
            this.setProperties(properties);
        };

        /**
         * 初始化DOM结构
         *
         * @protected
         */
        ScheduleTable.prototype.initStructure = function () {
            this.main.innerHTML = getHTML(this);
            //为单元格绑定点击事件
            helper.addDOMEvent(this, this.main, 'click', mainClick);
            // 如果设置了自动关闭，那么滚动的时候就关闭tip
            if (this.autoHideTip) {
                var target = this.main;
                while (target && target != document.body) {
                    helper.addDOMEvent(this, target, 'scroll', this.hideTip);
                    target = target.parentNode;
                }
            }
        };

        /**
         * 点击事件
         *
         * @inner
         * @param {Event} 触发事件的事件对象
         */
        function mainClick(e) {
            var tar = e.target || e.srcElement;
            var cellClass = this.helper.getPartClassName('item');
            while (tar && tar != document.body) {
                if (lib.hasClass(tar, cellClass)) {
                    var rowIndex = +tar.getAttribute('rowIndex');
                    var colIndex = +tar.getAttribute('colIndex');
                    // 如果设置了自动关闭弹层，则增加判断
                    if (this.autoHideTip 
                        && this.isTipShown(rowIndex, colIndex)) {
                        this.hideTip();
                    }
                    else {
                        this.fire(
                            'cellclick', 
                            { rowIndex: rowIndex, colIndex: colIndex }
                        );
                    }
                    return;
                }
                tar = tar.parentNode;
            }
        }

        /**
         * 展示弹层
         *
         * @param {number} rowIndex 行索引
         * @param {number} colIndex 列索引
         * @param {TipLayer|string} layer 弹层实例或者content
         */
        ScheduleTable.prototype.showTip = function (rowIndex, colIndex, layer) {
            if (!layer) {
                return;
            }
            var layerControl;
            // 传进来的是content的html串
            if (typeof layer === 'string') {
                // 创建一个
                var main = document.createElement('div');
                document.body.appendChild(main);
                layerControl = ui.create('MiddlePosLayer', {
                    main: main,
                    content: layer,
                    arrow: true,
                    skin: 'scheduleLayer'
                });
                layerControl.render();

            }
            else {
                layerControl = layer;
            }

            this.addChild(layerControl, 'tip-layer');

            // 全局只有一个layer
            // 如果已经存在，则隐藏并销毁
            if (this.layer) {
                this.layer.dispose();
            }
            var target = this.helper.getPart(rowIndex + '-' + colIndex);
            if (!target) {
                return;
            }
            var options = {
                verticalAlign: 'top',
                horizontalAlign: 'center' 
            };
            layerControl.show(target, options);
            this.layer = layerControl;
            this.currentTipTarget = rowIndex + '-' + colIndex;
        };

        /**
         * 关闭弹层
         *
         */
        ScheduleTable.prototype.hideTip = function () {
            // 全局只有一个layer
            if (this.layer) {
                this.layer.dispose();
                this.layer = null;
                this.currentTipTarget = '';
            }
        };

        /**
         * 弹层是否已展开
         *
         * @param {number} rowIndex 行索引
         * @param {number} colIndex 列索引
         * @return {boolean} 展开返回true，未展开返回false
         */
        ScheduleTable.prototype.isTipShown = function (rowIndex, colIndex) {
            return (this.currentTipTarget === rowIndex + '-' + colIndex);
        };

        /**
         * 重新渲染视图
         * 仅当生命周期处于RENDER时，该方法才重新渲染
         *
         * @param {Array=} 变更过的属性的集合
         * @override
         */
        ScheduleTable.prototype.repaint = helper.createRepaint(
            Control.prototype.repaint,
            {
                name: ['year', 'month', 'datasource'],
                paint: function (control, year, month, datasource) {
                    control.main.innerHTML = getHTML(control);
                }
            }
        );

        ScheduleTable.prototype.dispose = function () {
            if (helper.isInStage(this, 'DISPOSED')) {
                return;
            }
            if (this.layer) {
                this.layer.dispose();
            }
            Control.prototype.dispose.apply(this, arguments);
        };

        ui.register(ScheduleTable);
        return ScheduleTable;
    }
);
