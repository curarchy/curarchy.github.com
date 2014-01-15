/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 创意预览弹窗控件
 * @author wangyaqiong(wangyaqiong@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        require('esui/Panel');

        var lib = require('esui/lib');
        var helper = require('esui/controlHelper');
        var u = require('underscore');
        var Control = require('esui/Control');

        var maskIdPrefix = 'ctrl-mask';
        var buttonIdPrefix = 'ctrl-';
        var OPERATIONS = [
            { text: '修改', href: '#/creative/update~', type: 'modify' },
            // { text: '复制', href: '#/creative/copy~', type: 'copy' },
            {
                text: '广告',
                href: '#/creative/adposition~',
                type: 'adposition'
            },
            { text: '报告', href: '#/report/creative/date~', type: 'report' },
            { text: '收藏', command: 'star', type: 'star' }
        ];
        var opPrefix = 'op-type-';

        /**
         * 创意略缩图控件
         *
         * @constructor
         */
        function CreativePreviewPanel() {
            Control.apply(this, arguments);
        }

        lib.inherits(CreativePreviewPanel, Control);


        CreativePreviewPanel.prototype.type = 'CreativePreviewPanel';

        /**
         * 初始化参数
         *
         * @param {Object} options 构造函数传入的参数
         * @override
         * @protected
         */
        CreativePreviewPanel.prototype.initOptions = function (options) {
            var properties = {
                data: null,
                total: 0
            };

            lib.extend(properties, options);

            this.setProperties(properties);
        };

        CreativePreviewPanel.prototype.initStructure = function () {
            var main = this.main;
            document.body.appendChild(main);
            showMask(this);
            showButton(this, 'close');
            getContent(this, this.data);
            getOperations(this, this.data);
            var closeButton = getButton(this, 'close');
            helper.addDOMEvent(
                this, closeButton, 'click',
                lib.curry(closeClickHandler, this)
            );
            var leftButton = getButton(this, 'left');
            var rightButton = getButton(this, 'right');
            helper.addDOMEvent(
                this, leftButton, 'click',
                lib.curry(turnLeftHandler, this)
            );
            helper.addDOMEvent(
                this, rightButton, 'click',
                lib.curry(turnRightHandler, this)
            );
            var len = OPERATIONS.length;

            var type = '';
            var operation = '';
            for (var i = 0; i < len; i++) {
                type = OPERATIONS[i].type;
                operation = lib.g(opPrefix + type);
                helper.addDOMEvent(this, operation,
                    'click', clickOperations);
                helper.addDOMEvent(operation, operation,
                    'mouseover', toggleOperations);
                helper.addDOMEvent(operation, operation,
                    'mouseout', toggleOperations);
            }
            var starOperation = lib.g(opPrefix + 'star');
            // 添加点击收藏事件处理
            helper.addDOMEvent(this, starOperation, 'click', starClickHandler);
        };

        CreativePreviewPanel.prototype.repaint = helper.createRepaint(
            Control.prototype.repaint,
            {
                name: ['data', 'previewUrl'],
                paint: function (previewPanel, data, previewUrl) {
                    updateContent(previewPanel, data, previewUrl);
                    updateOperations(previewPanel, data);
                }
            },
            {
                name: 'flag',
                paint: function (previewPanel, flag) {
                    if (typeof flag !== 'undefined') {
                        previewPanel.data.flag = flag;
                        toggleStarIcon(previewPanel, flag);
                    }
                }
            }

        );

        function toggleStarIcon(previewPanel, flag) {
            var len = OPERATIONS.length;
            var starType = OPERATIONS[len - 1].type;
            var starOperation = lib.g(opPrefix + starType);
            if (flag) {
                lib.addClass(starOperation, 'type-star-favorite');
                starOperation.setAttribute('title', '取消收藏');
            }
            else {
                lib.removeClass(starOperation, 'type-star-favorite');
                starOperation.setAttribute('title', '收藏');
            }
        }

        function clickOperations(e) {
            var target = e.target;
            var href = target.getAttribute('ui-href');
            if (href) {
                this.fire(
                    'redirect', 
                    { 
                        url: href, 
                        options: { global: true }
                    }
                );
                this.dispose();
            }
        }

        /**
         * 点击收藏处理函数
         */
        function starClickHandler(e) {
            var starContainer = e.target;
            var id = starContainer.getAttribute('data-id');
            this.fire(this.data.flag ? 'unstar' : 'star', { args: id});
        }

        /**
         * 向左切换按钮处理函数
         */
        function turnLeftHandler() {
            var index = u.indexOf(this.datasource, this.data);
            var total = this.datasource.length;
            var item = null;
            //跳过网盟创意
            do {
                index = (index - 1 + total) % total;
                item = this.datasource[index];
                if (item.typeText !== 'nova') {
                    this.fire('preview', { id: item.id });
                    break;
                }
            } while (item);
        }

        /**
         * 向右切换按钮处理函数
         */
        function turnRightHandler() {
            var index = u.indexOf(this.datasource, this.data);
            var total = this.datasource.length;
            var item = null;
            //跳过网盟创意
            do {
                index = (index + 1 ) % total;
                item = this.datasource[index];
                if (item.typeText !== 'nova') {
                    this.fire('preview', { id: item.id });
                    break;
                }
            } while (item);
        }

        /**
         * 关闭按钮处理函数
         */
        function closeClickHandler() {
            this.dispose();
        }

        /**
         * 操作项图标hover处理函数
         * @param {Event} e
         * @inner
         */
        function toggleOperations(e) {
            var target = e.target;
            var type = target.getAttribute('type');
            lib.toggleClass(target, 'type-' + type + '-hover');
        }

        /**
         * 销毁控件
         */
        CreativePreviewPanel.prototype.dispose = function () {
            if (helper.isInStage(this, 'DISPOSED')) {
                return;
            }
            //移除dom
            var domId = this.main.id;
            lib.removeNode(domId);
            hideButton(this, 'close');
            hideButton(this, 'left');
            hideButton(this, 'right');
            hideMask(this);
            Control.prototype.dispose.apply(this, arguments);
        };

        /**
         * 更新内容区域
         * @param {CreativePreviewPanel} previewPanel 控件对象
         * @param {Object} data 数据对象
         * @param {string} previewUrl 预览URL
         */
        function updateContent(previewPanel, data, previewUrl) {
            var getId = helper.getId;
            var iframe = lib.g(getId(previewPanel, 'iframe'));
            iframe.src = previewUrl;
        }

        /**
         * 更新操作区域内容
         * @param {CreativePreviewPanel} previewPanel 控件对象
         * @param {Object} data 数据对象
         */
        function updateOperations(previewPanel, data) {
            if (!data) {
                return;
            }
            var len = OPERATIONS.length;
            for (var i = 0; i < len - 1; i++) {
                var type = OPERATIONS[i].type;
                var operation = lib.g(opPrefix + type);
                var href = OPERATIONS[i].href + 'id=' + data.id;
                operation.setAttribute('href', href);
            }
            var starType = OPERATIONS[len - 1].type;
            var starOperation = lib.g(opPrefix + starType);
            starOperation.setAttribute('data-id', data.id);
        }

        /**
         * 操作区域链接模板
         */
        CreativePreviewPanel.prototype.opLinkTpl =
            '<span ui-href="${href}" type=${type} id="${typeId}"'
                + ' title="${title}" class="${opItemCls}"></span>';

        /**
         * 操作区域command模板
         */
        CreativePreviewPanel.prototype.opCommanTpl =
            '<span id="${typeId}" class="${opItemCls}"'
                + ' title="${title}" type=${type} data-id="${id}">'
                + '</span>';

        /**
         * 获取操作区域内容
         * @param {CreativePreviewPanel} previewPanel 控件对象
         * @param {Object} data 数据对象
         */
        function getOperations(previewPanel, data) {
            var id = '';
            if (!data) {
                id = null;
            }
            else {
                id = data.id;
            }

            var html = '';
            var getClasses = helper.getPartClasses;
            var opClass = getClasses(previewPanel, 'opitem').join(' ');
            var itemClasses = '';
            var itemHtml = '';
            var tpl = '';
            for (var i = 0, len = OPERATIONS.length; i < len; i++) {
                var op = OPERATIONS[i];
                var href = op.href;
                var title = op.text;
                itemClasses = opClass + ' type-' + op.type;

                if (href) {
                    tpl = previewPanel.opLinkTpl;
                }
                else {
                    tpl = previewPanel.opCommanTpl;
                    title = data.flag ? '取消收藏' : '收藏';
                    if (data.flag) {
                        itemClasses += ' type-star-favorite';
                    }
                }

                itemHtml = lib.format(
                    tpl,
                    {
                        id: id,
                        type: op.type,
                        typeId: opPrefix + op.type,
                        href: op.href + 'id=' + id,
                        opItemCls: itemClasses,
                        title: title
                    }
                );

                html += itemHtml;
            }
            var container = document.createElement('div');
            container.innerHTML = html;
            var clazz = [];
            var typeClass = getClasses(previewPanel, 'operations').join(' ');
            clazz.push(typeClass);
            container.className = clazz.join(' ');
            previewPanel.main.appendChild(container);
        }


        /**
         * 获取显示内容
         * @param {CreativePreviewPanel} previewPanel 控件对象
         * @param {Object} data 数据对象
         */
        function getContent(previewPanel, data) {
            var zIndex = 1304;
            var container = document.createElement('div');
            previewPanel.main.appendChild(container);
            var previewContent = getPreviewContent(previewPanel, data);
            container.appendChild(previewContent);

            var clazz = [];
            var getClasses = helper.getPartClasses;
            var typeClass = getClasses(previewPanel, 'inner-panel').join(' ');
            clazz.push(typeClass);
            container.className = clazz.join(' ');
            previewPanel.main.style.display = 'block';
            previewPanel.main.style.zIndex = zIndex;

            showButton(previewPanel, 'left');
            showButton(previewPanel, 'right');
        }

        /**
         * 获取预览层代码
         * @param {CreativePreviewPanel} previewPanel 控件对象
         */
        function getPreviewContent(previewPanel, data) {
            var previewContent = document.createElement('div');
            var iframe = document.createElement('iframe');
            var iframeId = helper.getId(previewPanel, 'iframe');
            iframe.id = iframeId;
            iframe.style.width = '850px';
            iframe.style.height = '550px';
            if (previewPanel.previewUrl) {
                iframe.src = previewPanel.previewUrl;
            }
            previewContent.appendChild(iframe);

            var getClasses = helper.getPartClasses;
            var clazz = [];
            var typeClass = getClasses(previewPanel, 'preview-panel').join(' ');
            clazz.push(typeClass);
            previewContent.className = clazz.join(' ');
            return previewContent;
        }

        /**
         * 显示关闭按钮层
         * @param {CreativePreviewPanel} previewPanel 控件对象
         */
        function showButton(previewPanel, type) {
            var zIndex = 1304;
            var button = getButton(previewPanel, type);
            var clazz = [];
            var typeClass = helper.getPartClasses(previewPanel, type).join(' ');

            clazz.push(typeClass);

            button.className = clazz.join(' ');
            button.style.display = 'block';
            button.style.zIndex = zIndex;
        }

        /**
         * 隐藏关闭按钮层
         * @param {CreativePreviewPanel} previewPanel 控件对象
         */
        function hideButton(previewPanel, type) {
            var button = getButton(previewPanel, type);
            if ('undefined' != typeof button) {
                lib.removeNode(button);
            }
        }

        /**
         * 获取按钮层(关闭和左右切换)
         * @param {CreativePreviewPanel} previewPanel 控件对象
         * @return {HTMLElement} 获取到的Mask元素节点.
         */
        function getButton(previewPanel, type) {
            var previewPanelId = helper.getId(previewPanel);
            var id = buttonIdPrefix + type + '-' + previewPanelId;
            var button = lib.g(id);

            if (!button) {
                var el = document.createElement('div');
                el.id = id;
                document.body.appendChild(el);
                //previewPanel.main.appendChild(el)
            }

            return lib.g(id);
        }

        /**
         * 显示遮盖层
         * @param {CreativePreviewPanel} previewPanel 控件对象
         */
        function showMask(previewPanel) {
            var zIndex = 1303;
            var mask = getMask(previewPanel);
            var clazz = [];
            var getClasses = helper.getPartClasses;
            var maskClass = getClasses(previewPanel, 'mask').join(' ');

            clazz.push(maskClass);

            mask.className = clazz.join(' ');
            mask.style.display = 'block';
            mask.style.zIndex = zIndex;
        }

        /**
         * 获取遮盖层dom元素
         *
         * @param {ui.Dialog} 控件对象
         * @inner
         * @return {HTMLElement} 获取到的Mask元素节点.
         */
        function getMask(control) {
            var previewPanelId = helper.getId(control);
            var id = maskIdPrefix + '-' + previewPanelId;
            var mask = lib.g(id);

            if (!mask) {
                initMask(id);
            }

            return lib.g(id);
        }

        /**
         * 遮盖层初始化
         *
         * @param {string} maskId 遮盖层domId
         * @inner
         */
        function initMask(maskId) {
            var el = document.createElement('div');
            el.id = maskId;
            document.body.appendChild(el);
        }

        /**
         * 隐藏遮盖层
         * @param {ui.Dialog} dialog 控件对象
         */
        function hideMask(previewPanel) {
            var mask = getMask(previewPanel);
            if ('undefined' != typeof mask) {
                lib.removeNode(mask);
            }
        }

        require('esui').register(CreativePreviewPanel);
        return CreativePreviewPanel;
    }
);