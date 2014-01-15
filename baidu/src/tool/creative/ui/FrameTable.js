/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 创意略缩图控件
 * @author wangyaqiong(wangyaqiong@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        require('esui/Panel');
        require('esui/Link');

        var lib = require('esui/lib');
        var helper = require('esui/controlHelper');
        var Control = require('esui/Control');

        /**
         * 创意略缩图控件
         *
         * @constructor
         */
        function FrameTable() {
            Control.apply(this, arguments);
        }

        lib.inherits(FrameTable, Control);

        FrameTable.prototype.type = 'FrameTable';

        /**
         * 初始化配置
         *
         * @param {Object} 初始化配置项
         */
        FrameTable.prototype.initOptions = function (options) {
            var properties = {
                datasource: '',
                // 默认的每行放置的frame的数量
                lineLength: 5
            };

            lib.extend(properties, options);
            this.setProperties(properties);
        };

        /**
         * 渲染自身
         *
         * @param {Array=} 变更过的属性的集合
         * @override
         * @protected
         */
        FrameTable.prototype.repaint = helper.createRepaint(
            {
                name: 'datasource',
                paint: function (frameTable, datasource) {
                    frameTable.generateTable(datasource);
                }
            }
        );

        /**
         * 生成略缩图列表内容
         *
         * @param {Object[]} datasource 数据源
         * @inner
         */
        FrameTable.prototype.generateTable = function (datasource) {
            if (!datasource) {
                return;
            }
            var tableHTML = '';

            var rowCount = Math.ceil(datasource.length / this.lineLength);
            for (var i = 0; i < rowCount; i++) {
                tableHTML += this.getLineHTML(i);
            }

            this.disposeChildren();
            this.main.innerHTML = tableHTML;
            this.initChildren(this.main);
            generateTableEvent(this);
        };

        /**
         * 添加略缩图列表中的事件
         *
         * @param {FrameTable} FrameTable实例
         */
        function generateTableEvent(frameTable) {
            for (var i = 0; i < frameTable.datasource.length; i++) {
                var item = frameTable.datasource[i];
                initFrameEvent(frameTable, item);
            }
        }

        /**
         * 初始化单个frame的事件
         *
         * @param {FrameTable} FrameTable实例
         * @param {Object} item 对应的数据项
         */
        function initFrameEvent(frameTable, item) {
            //var thumbnail = frameTable.helper.getPart('thumbnail-' + item.id);
            var check = frameTable.helper.getPart('check-' + item.id);
            //先隐藏预览功能
//            helper.addDOMEvent(frameTable, thumbnail, 'click', frameClick);
            helper.addDOMEvent(frameTable, check, 'click', selectClick);
        }

        /**
         * checkbox点击处理函数
         *
         * @param {Event} e
         */
        function selectClick(e) {
            var box = e.target;

            if (box.checked) {
                helper.addPartClasses(this, 'checked', box.parentNode);
            }
            else {
                helper.removePartClasses(this, 'checked', box.parentNode);
            }

            var id = box.getAttribute('data-id');
            if (id) {
                var allChecked = false;
                if (box.checked) {
                    var selected = this.getSelectedItems();
                    allChecked = selected.length == this.datasource.length;
                }
                this.fire('select', { id: id, allChecked: allChecked });
            }
        }

        /**
         * frame图片点击处理函数
         *
         * @param {Event} e
         */
        //预览功能暂时隐藏
        /* function frameClick(e) {
         e.preventDefault();
         var id = e.currentTarget.getAttribute('data-id');
         if (e.currentTarget.getAttribute('data-type') != 'nova') {
         this.fire('preview', { id: id });
         }
         }*/

        /**
         * 获取一行内容的HTML
         *
         * @param {number} rowNumber 行号
         * @return {string}
         */
        FrameTable.prototype.getLineHTML = function (rowNumber) {
            var rowCount = Math.ceil(this.datasource.length / this.lineLength);
            var isLastRow = rowNumber === rowCount - 1;
            var lastRowLength = this.datasource.length % this.lineLength;
            if (lastRowLength === 0) {
                lastRowLength = this.lineLength;
            }
            var stop = isLastRow ? lastRowLength : this.lineLength;

            var lineHTML = '';
            for (var i = 0; i < stop; i++) {
                var index = rowNumber * this.lineLength + i;
                var data = this.datasource[index];
                lineHTML += this.getFrameHTML(data);
            }

            var classes = helper.getPartClasses(this, 'frame-line');

            // 如果是最后一行，加个特殊的样式，同时填充内容
            if (isLastRow) {
                classes = classes.concat(
                    helper.getPartClasses(this, 'last-line'));

                // 填充到`lineLength`个
                var emptyClasses = []
                    .concat(helper.getPartClasses(this, 'frame'))
                    .concat(helper.getPartClasses(this, 'frame-empty'));
                var emptyFrameHTML =
                    '<div class="' + emptyClasses.join(' ') + '"></div>';
                for (var i = 0; i < this.lineLength - lastRowLength; i++) {
                    lineHTML += emptyFrameHTML;
                }
            }

            return '<div class="' + classes.join(' ') + '">'
                + lineHTML
                + '</div>';
        };

        /**
         * 获取略缩图列表中单个frame的HTML
         *
         * @param {Object} data 单个frame的数据
         * @return {string} 生成的单个frame的html数据
         */
        FrameTable.prototype.getFrameHTML = function (data) {
            var frameClasses = this.helper.getPartClasses('frame')
                .concat(this.helper.getPartClasses('frame-' + data.typeText));
            if (data.flag) {
                frameClasses = frameClasses.concat(
                    this.helper.getPartClasses('favorite'));
            }

            if (!data.status) {
                frameClasses = frameClasses.concat(
                    this.helper.getPartClasses('frame-' 
                        + data.typeText + '-disable'));
            }
            var html = '<div class="' + frameClasses.join(' ') + '" '
                + 'id="' + this.helper.getId('frame-' + data.id) + '" '
                + 'data-id="' + data.id + '">'
                + this.getFrameContentHTML(data)
                + '</div>';
            var frameOuterClasses = this.helper.getPartClasses('frame-outer');
            var outerHtml = '<div class="' + frameOuterClasses.join(' ') + '" >'
                + html
                + '</div>';
            return outerHtml;
            //return html;
        };

        var contentTemplate = [
            // 复选框
            '<div class="${checkClasses}">',
            '<input type="checkbox" id="${checkId}" ',
            'name="${checkId}" data-id="${id}" />',
            '</div>',
            // 缩略图,
            '<div id="${thumbnailId}" ',
            'class="${thumbnailClasses}" ' ,
            'data-id="${id}" data-type="${typeText}">',
            '<em class="${thumbnailStar}">已收藏</em>',
            '${thumbnail}',
            '</div>',
            // 创意信息,
            '<div class="${infoClasses}">',
            // 名称
            '<span class="${nameClasses}" title="${itemName}">',
            '${itemName}',
            '</span>',
            // 尺寸,
            '<span class="${sizeClasses}">',
            '${itemSize}',
            '</span>',
            '</div>',
            // 操作行,
            '<div id="${operationsId}" class=${operationClasses}>',
            '${operations}',
            '</div>'
        ];

        /**
         * 单个frame内容部分的HTML模板
         *
         * @type {string}
         */
        FrameTable.prototype.frameContentTemplate = contentTemplate.join('');

        /**
         * 获取单个frame内容的HTML
         *
         * @param {Object} data 创意数据
         * @return {string}
         */
        FrameTable.prototype.getFrameContentHTML = function (data) {
            // `-1 * -1`是指这个创意本身没有尺寸属性，如文字或者富媒体，此时显示为`--`
            var size = data.width >= 0 && data.height >= 0
                ? data.width + '*' + data.height
                : '--';
            var thumbnailHTML = this.getThumbnailHTML(data);
            var operationsHTML =
                this.noOperation ? '' : this.getOperationFieldHTML(data);

            var frameClasses = []
                .concat(this.helper.getPartClasses('frame'))
                .concat(this.helper.getPartClasses('frame-' + data.typeText));
            if (data.flag) {
                frameClasses = frameClasses.concat(
                    this.helper.getPartClasses(this, 'favorite'));
            }

            return lib.format(
                this.frameContentTemplate,
                {
                    id: data.id,
                    frameId: this.helper.getId('frame-' + data.id),
                    thumbnailId: this.helper.getId('thumbnail-' + data.id),
                    operationsId: this.helper.getId('operations-' + data.id),
                    checkId: this.helper.getId('check-' + data.id),
                    frameClasses: frameClasses.join(' '),
                    checkClasses: this.helper.getPartClassName('check'),
                    infoClasses: this.helper.getPartClassName('info'),
                    sizeClasses: this.helper.getPartClassName('size'),
                    nameClasses: this.helper.getPartClasses('name'),
                    thumbnailStar: this.helper.getPartClassName('star'),
                    thumbnailClasses: this.helper.getPartClassName('thumbnail'),
                    operationClasses: this.helper.getPartClassName('operation'),
                    thumbnail: thumbnailHTML,
                    operations: operationsHTML,
                    itemName: lib.encodeHTML(data.name),
                    itemSize: size
                }
            );
        };

        /**
         * 生成略缩图图片的html
         *
         * @param {Object} data 略缩图数据
         * @return {String} 生成的略缩图的HTML
         * @inner
         */
        FrameTable.prototype.getThumbnailHTML = function (data) {
            if (data.typeText === 'image') {
                return '<img src="' + lib.encodeHTML(data.materialUrl) + '" />';
            }

            return '';
        };

        /**
         * 单行的HTML模板
         *
         * @type {string}
         */
        FrameTable.prototype.frameLineHtml =
            '<div class="${frameLineClasses}">'
                + '${frameLineHtml}'
                + '</div>';

        /**
         * 获取Table的选中数据项
         *
         * @return {Object[]}
         */
        FrameTable.prototype.getSelectedItems = function () {
            var result = [];

            for (var i = 0; i < this.datasource.length; i++) {
                var item = this.datasource[i];
                var checkbox = this.helper.getPart('check-' + item.id);
                if (checkbox.checked) {
                    result.push(item);
                }
            }

            return result;
        };

        /**
         * 全选
         * @param {Boolean} isSelect 是否选中
         */
        FrameTable.prototype.selectAll = function (isSelect) {
            var datasource = this.datasource;
            for (var i = datasource.length - 1; i > -1; --i) {
                var item = datasource[i];
                var check = this.helper.getPart('check-' + item.id);
                if (check) {
                    check.checked = isSelect;
                    selectClick.call(this, { target: check });
                }
            }
        };

        /**
         * 更新一个元素
         *
         * @param {Object} 待更新的元素数据
         */
        FrameTable.prototype.updateItem = function (data) {
            if (!data) {
                return;
            }

//            initFrameEvent(this, data);

            var frame = this.helper.getPart('frame-' + data.id);
            var operationsId = this.helper.getId('operations-' + data.id);
            var operationContainer = lib.g(operationsId);
            operationContainer.innerHTML = this.getOperationFieldHTML(data);
            //frame.innerHTML = this.getFrameContentHTML(data);
            if (data.flag) {
                helper.addPartClasses(this, 'favorite', frame);
            }
            else {
                helper.removePartClasses(this, 'favorite', frame);
            }
        };

        /**
         * 获取Table的操作列的HTML，可由子类覆盖重新配置
         *
         * @param {Object} data 当前的数据
         * @return {string} 操作列HTML
         */
        FrameTable.prototype.getOperationFieldHTML = function (data) {
            // 默认返回个空的
            return '';
        };

        require('esui').register(FrameTable);
        return FrameTable;
    }
);