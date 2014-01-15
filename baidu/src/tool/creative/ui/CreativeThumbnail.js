/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file CreativeThumbnail控件
 * @author exodia(dengxinxin@baidu.com)
 * @date 13-11-8
 */
define(
    function (require) {
        var lib = require('esui/lib');
        var helper = require('esui/controlHelper');
        var Control = require('esui/Control');
        var CLASSES = null;

        /**
         * 对外提供 command 事件， 对应的 name 有：edit, delete, select, create
         */

        /**
         * CreativeThumbnail控件
         *
         * @param {Object=} options 初始化参数
         * @param {Array} datasource 数据源
         *
         * @extends esui/control
         * @constructor
         * @public
         */
        function CreativeThumbnail(options) {
            Control.apply(this, arguments);
            if (!CLASSES) {
                CLASSES = {
                    item: helper.getPartClasses(this, 'item')[0],
                    content: helper.getPartClasses(this, 'content')[0],
                    name: helper.getPartClasses(this, 'name')[0],
                    imgCreative: helper.getPartClasses(this, 'img-creative')[0],
                    del: helper.getPartClasses(this, 'delete')[0],
                    wrap: helper.getPartClasses(this, 'wrap')[0],
                    image: helper.getPartClasses(this, 'image')[0],
                    operation: helper.getPartClasses(this, 'operation')[0],
                    create: helper.getPartClasses(this, 'create')[0],
                    select: helper.getPartClasses(this, 'select')[0]

                };
            }
        }

        CreativeThumbnail.prototype.type = 'CreativeThumbnail';

        /**
         * 初始化参数
         *
         * @param {Object=} options 构造函数传入的参数
         * @override
         * @protected
         */
        CreativeThumbnail.prototype.initOptions = function (options) {
            var properties = {
                lineLength: 5,
                datasource: null
            };
            lib.extend(properties, options);

            var Command = require('esui/extension/Command');
            var command = new Command({ type: 'Command' });
            if (properties.extentions instanceof Array) {
                properties.extentions.push(command);
            } else {
                properties.extensions = [ command ];
            }
            this.setProperties(properties);
        };

        CreativeThumbnail.prototype.initStructure = function () {
            //阻止冒泡触发2次command
            this.on('command', function (e) {
                e.name === 'delete' && e.stopPropagation();
            });
        };

        var itemTemplate = [
            '<div class="${itemCls}" title="编辑该创意" id="${itemId}"',
            '     data-command-args="${id}" data-command="edit">',
            '  <div class="${wrapCls}">',
            '     <div class="${contentCls}">',
            '       <img class="${imgCls}" src="${materialUrl}" alt="${name}"',
            '           width="${width}" height="${height}" />',
            '     </div>',
            '     <span class="${deleteCls}" title="删除该创意"',
            '         data-command-args="${id}" data-command="delete">',
            '         &times;',
            '     </span>',
            '  </div>',
            '  <p class="${nameCls}">${name}</p>',
            '</div>'
        ];

        CreativeThumbnail.prototype.itemTemplate = itemTemplate.join('');

        CreativeThumbnail.prototype.getItemContentHTML = function (data) {
            var contentCls =
                helper.getPartClasses(this, data.typeText + '-content');
            contentCls.push(CLASSES.content);

            return lib.format(this.itemTemplate, {
                id: data.id,
                itemId: helper.getId(this, data.id),
                name: data.name,
                materialUrl: data.materialUrl,
                width: data.width,
                height: data.height,
                itemCls: CLASSES.item,
                wrapCls: CLASSES.wrap,
                contentCls: contentCls.join(' '),
                nameCls: CLASSES.name,
                deleteCls: CLASSES.del,
                imgCls: CLASSES.image
            });
        };

        CreativeThumbnail.prototype.getLineHTML = function (rowNumber) {
            var line = '<div class="${lineCls}">';
            var i = rowNumber * this.lineLength;
            var data = this.datasource;
            var len = Math.min(i + this.lineLength, data.length);
            for (; i < len; ++i) {
                line += this.getItemContentHTML(data[i]);
            }

            //最后一行
            var rowCount = Math.ceil((data.length + 1) / this.lineLength);
            if (rowCount === rowNumber + 1) {
                line += this.getOperationHTML();
            }

            line += '</div>';

            return lib.format(line, {
                lineCls: helper.getPartClasses(this, 'line')
            });
        };

        CreativeThumbnail.prototype.operationTemplate =
            '<div id="${operationId}" class="${operationCls}">'
                + '<span class="${createCls}" data-command="create">'
                    + '新建创意'
                + '</span>'
                + '<span class="${selectCls}" data-command="select">'
                    + '选择创意'
                + '</span>'
                + '</div>';

        CreativeThumbnail.prototype.getOperationHTML = function () {
            return lib.format(this.operationTemplate, {
                operationCls: CLASSES.operation,
                operationId: helper.getId(this, 'operation'),
                createCls: CLASSES.create,
                selectCls: CLASSES.select
            });
        };

        /**
         * 生成列表 html
         *
         * @param data
         * @returns {String} html 字符串
         */
        CreativeThumbnail.prototype.generateList = function (data) {
            var table = '';
            var rowCount = Math.ceil((data.length + 1) / this.lineLength);
            for (var i = 0; i < rowCount; ++i) {
                table += this.getLineHTML(i);
            }

            return table;
        };

        /**
         * 加载子 action
         * @param {Object} options action的配置
         * @param {String} [id]
         * 对应的创意 id，panel节点会添加对应创意框所在的行节点，
         * 不传，则会附加到工具按钮所在的行节点展开
         *
         * @returns {ef/ActionPanel}
         */
        CreativeThumbnail.prototype.loadAction = function (options, id) {
            var panel = this.getChild('creativePanel');
            if (!panel) {
                var ActionPanel = require('ef/ActionPanel');
                panel = new ActionPanel(options);
                this.addChild(panel, 'creativePanel');
            } else {
                panel.setProperties(options);
            }

            id = id || 'operation';
            var node = lib.g(helper.getId(this, id)).parentNode;
            panel.appendTo(node);
            return panel;
        };

        /**
         * 渲染自身
         *
         * @override
         * @protected
         */
        CreativeThumbnail.prototype.repaint = helper.createRepaint(
            Control.prototype.repaint,
            {
                name: 'datasource',
                paint: function (creativeTable, datasource) {
                    if (datasource) {
                        var list = creativeTable.generateList(datasource);
                        creativeTable.main.innerHTML = list;
                    }

                }
            }
        );

        lib.inherits(CreativeThumbnail, Control);
        require('esui').register(CreativeThumbnail);
        return CreativeThumbnail;
    }
);
