/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 省略显示
 * @author lixiang(lixiang05@baidu.com)
 * @date $DATE$
 */

define(
    function (require) {
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
        function Ellipsis(options) {
            Control.apply(this, arguments);
        }

        lib.inherits(Ellipsis, Control);

        Ellipsis.prototype.type = 'Ellipsis';

        Ellipsis.prototype.initOptions = function (options) {
            var properties = {
                maxLength: 2,
                tail: '项',
                emptyText: '未选择',
                datasource: []
            };

            lib.extend(properties, options);
            this.setProperties(properties);
        };

        Ellipsis.prototype.initStructure = function () {
            var html = [
                // 概要信息展示
                '<span id="${generalInfoId}" class="${generalInfoClasses}">',
                '</span>',
                // 详细信息展示
                '<div id="${detailInfoId}" class="${detailInfoClasses}">',
                '</div>',
                // 展开收起文字链
                '<span id="${toggleButtonId}" class="${toggleButtonClasses}">',
                '展开</span>'
            ].join('\n');

            var getClass = helper.getPartClasses;
            var getId = helper.getId;
            html = lib.format(
                html,
                {
                    generalInfoId: getId(this, 'general-info'),
                    detailInfoId: getId(this, 'detail-info'),
                    toggleButtonId: getId(this, 'toggle-button'),
                    generalInfoClasses:
                        getClass(this, 'general-info').join(' '),
                    detailInfoClasses:
                        getClass(this, 'detail-info').join(' '),
                    toggleButtonClasses:
                        getClass(this, 'toggle-button').join(' ')
                }
            );
            this.main.innerHTML = html;
            this.initChildren(this.main);
            var toggleButton = lib.g(getId(this, 'toggle-button'));
            helper.addDOMEvent(
                this, toggleButton, 'click', lib.curry(toggleParagraph, this)
            );
        };

        /**
         * 展开收起状态更新
         * 
         * @inner
         */
        function toggleParagraph() {
            var toggleButton = lib.g(helper.getId(this, 'toggle-button'));
            if (this.hasState('expand')) {
                this.removeState('expand');
                toggleButton.innerHTML = '展开';
            }
            else {
                this.addState('expand');
                toggleButton.innerHTML = '收起';
            }
        }

        /**
         * 重新渲染视图
         * 仅当生命周期处于RENDER时，该方法才重新渲染
         *
         * @param {Array=} 变更过的属性的集合
         * @override
         */
        Ellipsis.prototype.repaint = helper.createRepaint(
            Control.prototype.repaint,
            {
                name: 'datasource',
                paint: ellipse
            }
        );


        /**
         * 文字截断
         * 
         * @param {ui.Ellipsis} ellipsis 控件实例
         * @param {Array} datasource 数据源
         * @inner
         */
        function ellipse(ellipsis, datasource) {
            // 先清空下状态
            ellipsis.removeState('static');

            if (!datasource) {
                return;
            }
            
            var generalInfo = lib.g(helper.getId(ellipsis, 'general-info'));
            var dataLength = datasource.length;

            // 没有数据，只展示空提示
            if (!dataLength) {
                ellipsis.addState('static');
                generalInfo.innerHTML = lib.encodeHTML(ellipsis.emptyText);
                return;
            }

            var soOn = '等' + dataLength + '个' + ellipsis.tail;

            // 实际长度比规定长度小，全显示，且状态为static
            if (ellipsis.maxLength > dataLength) {
                soOn = '';
                ellipsis.addState('static');
            }
            else {
                var detailInfo = lib.g(helper.getId(ellipsis, 'detail-info'));
                detailInfo.innerHTML = lib.encodeHTML(datasource.join('、'));
            }

            var generalText = datasource.slice(0, ellipsis.maxLength);
            generalInfo.innerHTML =
                lib.encodeHTML(generalText.join('、')) + soOn;
        }

        require('esui').register(Ellipsis);
        return Ellipsis;
    }
);
