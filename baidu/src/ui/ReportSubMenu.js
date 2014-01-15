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
        function ReportSubMenu(options) {
            Control.apply(this, arguments);
        }

        lib.inherits(ReportSubMenu, Control);

        ReportSubMenu.prototype.type = 'ReportSubMenu';

        ReportSubMenu.prototype.initOptions = function (options) {
            var properties = {
                title: '选择报告维度'
            };

            lib.extend(properties, options);
            this.setProperties(properties);
        };


        /**
         * 手动刷新
         * 
         * @param {ui.ReportSubMenu} cascadingSelector 类实例
         * @inner
         */
        function refresh(dataDashboard) {
            var getClass = helper.getPartClasses;
            var datasource = dataDashboard.datasource;
            var activeName = dataDashboard.activeName;
            if (!datasource) {
                return;
            }
            // 重建
            var menuTpl = ['<dt>' + datasource.title + '</dt>'];
            var length = datasource.menus.length;
            var menuItemTpl = ''
                + '<dd class="${menuClass}">'
                + '<a data-ui-type="Link" href="${url}">${value}</a>'
                + '</dd>';
            for (var i = 0; i < length; i ++) {
                var menuClass = activeName === datasource.menus[i].name ?
                    getClass(dataDashboard, 'active') : '';
                menuTpl.push(
                    lib.format(
                        menuItemTpl,
                        {
                            value: datasource.menus[i].name,
                            url: datasource.menus[i].url,
                            menuClass: menuClass
                        }
                    )
                );
            }

            dataDashboard.main.innerHTML = menuTpl.join('\n');
            dataDashboard.initChildren(dataDashboard.main);
        }

        /**
         * 重新渲染视图
         * 仅当生命周期处于RENDER时，该方法才重新渲染
         *
         * @param {Array=} 变更过的属性的集合
         * @override
         */
        ReportSubMenu.prototype.repaint = helper.createRepaint(
            Control.prototype.repaint,
            {
                name: ['datasource', 'activeName'],
                paint: refresh
            }
        );
        require('esui').register(ReportSubMenu);
        return ReportSubMenu;
    }
);
