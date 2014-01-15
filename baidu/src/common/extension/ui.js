/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 控件扩展
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        require('./underscore');

        // 加载所有验证规则
        require('esui/validator/MaxLengthRule');
        require('esui/validator/MinLengthRule');
        require('esui/validator/MaxRule');
        require('esui/validator/MinRule');
        require('esui/validator/PatternRule');
        require('esui/validator/RequiredRule');
        require('ui/validator/CompareRule');
        require('ui/validator/OrientUrlRule');
        
        var u = require('underscore');
        var Table = require('esui/Table');
        var lib = require('esui/lib');
        
        Table.defaultProperties.sortable = true;
        Table.defaultProperties.columnResizable = true;
        Table.defaultProperties.select = 'multi';
        Table.defaultProperties.followHead = true;
        Table.defaultProperties.breakLine = true;
        Table.defaultProperties.encode = true;

        /**
         * 创建一个带命令的元素
         *
         * @param {Object} config 配置项
         * @return {string}
         */
        Table.command = function (config) {
            var defaults = {
                tagName: 'span',
                text: ''
            };
            u.extend(defaults, config);

            var template = '<span '
                + (defaults.className ? 'class="${:className}" ' : '')
                + 'data-command="${:command}" '
                + 'data-command-args="${:args}">'
                    + '${:text}'
                + '</span>';
            return u.template(template, config);
        };

        /**
         * 创建操作列的HTML
         *
         * @param {Object[]} config 操作配置
         * @return {string}
         */
        Table.operations = function (config) {
            var html = [];

            var linkTemplate = '<a href="${:url}" '
                + 'class="table-operation table-operation-${:type}" '
                + 'data-redirect="global">'
                    + '${:text}'
                + '</a>';

            for (var i = 0; i < config.length; i++) {
                var item = config[i];

                // 如果没有权限就不显示了
                if (item.auth === false) {
                    continue;
                }

                // 操作分为链接式或命令式2类
                if (item.url) {
                    var itemHTML = u.template(linkTemplate, item);
                    html.push(itemHTML);
                }
                else {
                    var className = 'table-operation '
                        + 'table-operation-' + u.escape(item.type);
                    var options = {
                        className: className,
                        text: item.text,
                        command: item.command,
                        args: item.args
                    };
                    var itemHTML = Table.command(options);
                    html.push(itemHTML);
                }
            }

            return html.join('');
        };

        /**
         * 生成状态列HTML
         *
         * @param {Object} status 状态配置项，来自`common/global/status`模块
         * @return {string}
         */
        Table.status = function (status) {
            return '<span class="table-status-' + status.type + '">' 
                + status.text + '</span>';
        };

        /**
         * 获取选中的数据
         *
         * @return {Object[]} 被选中的行对应的数据项集合
         */
        Table.prototype.getSelectedItems = function () {
            if (!this.selectedIndex) {
                return;
            }

            var datasource = this.datasource;
            var items = u.map(
                this.selectedIndex, 
                function (i) { return datasource[i]; }
            );

            return items;
        };

        // 给几个控件增加链接模式
        var CommandMenu = require('esui/CommandMenu');

        CommandMenu.prototype.linkTemplate = 
            '<a target="${target}" href="${href}">${text}</a>';

        CommandMenu.prototype.getItemHTML = function (item) {
            var data = {
                text: lib.encodeHTML(item.text),
                href: item.href && lib.encodeHTML(item.href),
                target: item.target || '_self'
            };
            var template = item.href
                ? this.linkTemplate
                : this.itemTemplate;
            return lib.format(template, data);
        };

        var Tab = require('esui/Tab');

        Tab.prototype.linkTemplate = '<a href="${href}">${title}</a>';

        Tab.prototype.getContentHTML = function (item) {
            var data = {
                title: lib.encodeHTML(item.title),
                href: item.href && lib.encodeHTML(item.href)
            };
            var template = item.href
                ? this.linkTemplate
                : this.contentTemplate;
            return lib.format(template, data);
        };

        // 打开表单自动验证
        var Form = require('esui/Form');

        Form.defaultProperties.autoValidate = true;

        // 设置分页
        var Pager = require('esui/Pager');
        // TODO: Pager是放在prototype上的，要改
        Pager.prototype.defaultProperties.pageSizes = [20, 50, 100];
        Pager.prototype.defaultProperties.pageSize = 50;

        // 统一添加`sessionToken`
        var Uploader = require('ui/Uploader');
        Uploader.prototype.getSessionToken = function () {
            return require('common/global/user').sessionToken;
        };

        var Select = require('esui/Select');
        Select.prototype.getSelectedItem = function () {
            return this.datasource[this.selectedIndex] || null;
        };
    }
);
