/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 创意库列表列表视图类
 * @author  exodia(dengxinxin@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var ListView = require('common/ListView');
        var util = require('er/util');
        var lib = require('esui/lib');

        require('tpl!./tpl/list.tpl.html');
        // TODO: 创意库迁至这里后改为相对路径
        require('./ui/CreativePreviewPanel');

        var COMMAND_LINK_TEMPLATE =
            '<a href="${href}" data-redirect="${redirect}" '
                + 'class="operation-item">${text}</a>';

        var COMMAND_LABEL_TEMPLATE =
            '<span class="operation-item operation-item-flag" '
                + 'data-command="${command}" title=${text} '
                + 'data-command-args="${id}">'
                + '${text}'
                + '</span>';

        /**
         * 生成操作列html
         *
         * @param {Object} data 操作映射的数据
         * @return {String} 生成的html
         * @inner
         */
        function getOperationsHTML(data) {
            var operations = [
                { text: '修改', href: '#/tool/creative/update~id=' + data.id },
                // TODO: 实现复制
                // { text: '复制', href: '#/creative/copy~id=' + data.id },
                { 
                    text: '广告', 
                    href: '#/order/all~tab=delivery&list.creativeId=' + data.id,
                    redirect: 'global'
                },
                {
                    text: '报告',
                    href: '#/report/creative/date~id=' + data.id,
                    redirect: 'global'
                },
                data.flag
                    ? { text: '取消收藏', command: 'unstar'}
                    : { text: '收藏', command: 'star' }
            ];

            var html = '';
            for (var i = 0; i < operations.length; i++) {
                if (i === 0 && data.cannotModify) {
                    continue;
                }

                var config = operations[i];
                var template = config.href
                    ? COMMAND_LINK_TEMPLATE
                    : COMMAND_LABEL_TEMPLATE;

                html += lib.format(
                    template,
                    {
                        href: config.href,
                        command: config.command,
                        id: data.id,
                        redirect: config.redirect,
                        text: lib.encodeHTML(config.text)
                    }
                );
            }

            return html;
        }

        /**
         * 委托事件
         *
         * @param {Event} e
         */
        function delegateEvent(e) {
            this.fire(e.type, e);
        }

        /**
         * 创意库列表列表视图类
         *
         * @constructor
         * @extends common/ListView
         */
        function CreativeListView() {
            ListView.apply(this, arguments);
        }

        util.inherits(CreativeListView, ListView);

        /**
         * 使用的模板名称
         *
         * @type {string}
         */
        CreativeListView.prototype.template = 'creativeLibraryList';

        /**
         * 控件额外属性
         *
         * @type {Object}
         */
        CreativeListView.prototype.uiEvents = {
            'table:command': function (e) {
                this.fire(e.name, { args: e.args });
            },
            'table:preview': delegateEvent,
            'table:select': function (e) {
                this.get('select-all').setChecked(e.allChecked);
            },
            'add-to-slot:click': function () {
                this.fire('addToSlot');
            },
            'select-all:click': function (e) {
                var isSelect = e.target.isChecked();
                this.get('table').selectAll(isSelect);
            }
        };

        CreativeListView.prototype.uiProperties = {
            table: {
                getOperationFieldHTML: getOperationsHTML
            },
            keyword: {
                width: 185,
                skin: 'creative-list',
                placeholder: '请输入创意ID或名称'
            },
            status: {
                width: 30
            },
            restore: {
                content: '显示',
                text: '显示'
            },
            remove: {
                content: '隐藏',
                text: '隐藏'
            }
        };

        /**
         * 获取查询参数
         *
         * @return {Object}
         */
        CreativeListView.prototype.getSearchArgs = function () {
            var args = ListView.prototype.getSearchArgs.apply(this, arguments);
            args.flag = this.model.get('flag') || '';
            args.noOperation = this.model.get('noOperation') || '';
            args.onlyShowStatus = this.model.get('onlyShowStatus') || '';

            return args;
        };

        /**
         * 视图加星星
         *
         * @param {Object} item 更新后的创意信息
         */
        CreativeListView.prototype.toggleStar = function (item) {
            this.get('table').updateItem(item);
            var preview = this.get('preview-panel');
            preview && preview.set('flag', item.flag);
        };

        /**
         * 预览创意
         */
        CreativeListView.prototype.preview = function (previewInfo, isSlide) {
            var previewPanel = this.get('preview-panel');
            if (previewPanel) {
                var properties = {
                    data: previewInfo.data,
                    previewUrl: previewInfo.previewUrl
                };
                previewPanel.setProperties(properties);
            }
            else {
                var options = {
                    id: 'preview-panel',
                    datasource: this.model.get('results'),
                    data: previewInfo.data,
                    previewUrl: previewInfo.previewUrl
                };
                previewPanel = this.create('CreativePreviewPanel', options);
                previewPanel.on('preview', delegateEvent, this);
                previewPanel.on('redirect', delegateEvent, this);
                previewPanel.on('star', delegateEvent, this);
                previewPanel.on('unstar', delegateEvent, this);
                previewPanel.render();
            }
        };

        return CreativeListView;
    }
);