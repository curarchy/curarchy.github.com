/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file tpl加载插件
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function () {
        var ajax = require('er/ajax');
        var erTemplate = require('er/template');
        var template = erTemplate;

        var controlNamespace = {
            // Sidebar不使用esui的，那个不大符合要求
            BoxGroup: 'esui',
            Button: 'esui',
            Calendar: 'esui',
            CheckBox: 'esui',
            CommandMenu: 'esui',
            Crumb: 'esui',
            Dialog: 'esui',
            Form: 'esui',
            Label: 'esui',
            Link: 'esui',
            MonthView: 'esui',
            Pager: 'esui',
            Panel: 'esui',
            RangeCalendar: 'esui',
            Region: 'esui',
            RichCalendar: 'esui',
            Schedule: 'esui',
            Select: 'esui',
            Tab: 'esui',
            Table: 'esui',
            TextBox: 'esui',
            TextLine: 'esui',
            Tip: 'esui',
            TipLayer: 'esui',
            Tree: 'esui',
            Validity: 'esui',
            Wizard: 'esui',
            ActionPanel: 'ef',
            ActionDialog: 'ef'
        };

        var esuiExtensions = {
            AutoSort: true, 
            Command: true,
            CustomData: true,
            TableEdit: true
        };

        /**
         * 获取控件依赖关系
         *
         * @param {string} text 模板内容
         * @return {Array} 依赖的控件列表
         */
        function getControlDependencies(text) {
            var dependencies = [];
            var defined = {};

            var regex = /data-ui-type="(\w+)"/g;
            var match = regex.exec(text);
            while (match) {
                var type = match[1];
                if (!defined[type]) {
                    defined[type] = true;

                    var prefix = (controlNamespace[type] || 'ui') + '/';
                    dependencies.push(prefix + type);
                }

                match = regex.exec(text);
            }

            return dependencies;
        }

        /**
         * 获取扩展依赖关系
         *
         * @param {string} text 模板内容
         * @return {Array} 依赖的扩展列表
         */
        function getExtensionDependencies(text) {
            var dependencies = [];
            var defined = {};

            var regex = /data-ui-extension-[^-]+-type="(\w+)"/g;
            var match = regex.exec(text);
            while (match) {
                var type = match[1];
                if (!defined[type]) {
                    defined[type] = true;

                    var prefix = esuiExtensions[type]
                        ? 'esui/extension/'
                        : 'ui/extension/';
                    dependencies.push(prefix + type);
                }

                match = regex.exec(text);
            }

            return dependencies;
        }

        var plugin = {
            /**
             * 设置模板引擎。提供测试或未来扩展用
             *
             * @param {Object} engine 引擎的实现，至少提供一个`parse`方法
             */
            setupTemplateEngine: function (engine) {
                template = engine || erTemplate;
            },

            /**
             * 加载模板
             *
             * @param {string} resourceId 模板资源id
             * @param {function} parentRequire 父级`require`函数
             * @param {function} load 加载完成后调用
             */
            load: function (resourceId, parentRequire, load) {
                function addTemplate(text) {
                    template.parse(text);

                    var controls = getControlDependencies(text);
                    var extensions = getExtensionDependencies(text);
                    var dependencies = controls.concat(extensions);

                    window.require(dependencies, function () { load(text); });
                }

                var options = {
                    method: 'GET',
                    url: parentRequire.toUrl(resourceId),
                    cache: true,
                    dataType: 'text'
                };
                ajax.request(options).then(addTemplate);
            },

            registerControl: function (namespace, type) {
                controlNamespace[type] = namespace;
            }
        };

        return plugin;
    }
);