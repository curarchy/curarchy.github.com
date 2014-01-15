/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 串联选择控件
 * @author lixiang(lixiang05@baidu.com)
 * @date $DATE$
 */

define(
    function (require) {
        require('esui/Panel');
        require('esui/Label');

        var lib = require('esui/lib');
        var helper = require('esui/controlHelper');
        var Control = require('esui/Control');

        /**
         * 控件类
         * 
         * @constructor
         * @param {Object} options 初始化参数
         */
        function DataDashboard(options) {
            Control.apply(this, arguments);
        }

        lib.inherits(DataDashboard, Control);

        DataDashboard.prototype.type = 'DataDashboard';

        DataDashboard.prototype.initOptions = function (options) {
            var properties = {
            };

            lib.extend(properties, options);
            this.setProperties(properties);
        };

        function generateSingle(control, data, totalLength) {
            var widthPercent = (1/totalLength) * 100 + '%';
            var getClass = helper.getPartClasses;
            var tpl = [
                '<div data-ui-type="Panel"',
                    'style="width: ' + widthPercent + ';">',
                    '<div class="${valueLabelClass}">',
                        '${value}' + '<span class="${trendClass}"></span>',
                    '</div>',
                    '<div class="${nameLabelClass}">',
                        '${name}',
                    '</div>',
                '</div>'
            ].join('\n');

            var trend = 'none';
            if (data.trend === -1) {
                trend = 'down';
            }
            else if (data.trend === 1) {
                trend = 'up';
            }

            return lib.format(tpl, {
                valueLabelClass: getClass(control, 'value-label').join(' '),
                trendClass: getClass(control, 'trend-' + trend).join(' '),
                nameLabelClass: getClass(control, 'name').join(' '),
                value: data.value,
                name: data.name
            });
        }

        /**
         * 手动刷新
         * 
         * @param {ui.DataDashboard} cascadingSelector 类实例
         * @inner
         */
        function refresh(dataDashboard) {
            var datasource = dataDashboard.datasource;
            if (!datasource) {
                return;
            }
            // 重建
            var boardTpl = [];
            var length = datasource.length;
            for (var i = 0; i < length; i ++) {
                boardTpl.push(
                    generateSingle(dataDashboard, datasource[i], length)
                );
            }

            dataDashboard.main.innerHTML = boardTpl.join('\n');
            dataDashboard.initChildren(dataDashboard.main);
        }

        /**
         * 重新渲染视图
         * 仅当生命周期处于RENDER时，该方法才重新渲染
         *
         * @param {Array=} 变更过的属性的集合
         * @override
         */
        DataDashboard.prototype.repaint = helper.createRepaint(
            Control.prototype.repaint,
            {
                name: 'datasource',
                paint: refresh
            }
        );
        require('esui').register(DataDashboard);
        return DataDashboard;
    }
);
