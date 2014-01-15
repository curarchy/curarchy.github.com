/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 创意列表视图类
 * @author lisijin(ibadplum@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var ListView = require('common/ListView');
        var util = require('er/util');
        var u = require('underscore');
        var enums = require('./enum');
        require('tpl!./tpl/list.tpl.html');
        require('tool/creative/ui/CreativePreviewPanel');

        /**
         * 频道分组列表视图类
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
        CreativeListView.prototype.template = 'creativeList';

        var tableFields = [
            {
                title: '名称',
                field: 'name',
                sortable: true,
                resizable: false,
                width: 180,
                content: function (item) {
                    var imageUrls = [
                        '',
                        '',
                        'src/tool/creative/ui/img/thumbnail-flash.png',
                        'src/tool/creative/ui/img/thumbnail-rich.png',
                        'src/tool/creative/ui/img/thumbnail-text.png'
                    ];
                    imageUrls[10] =
                        'src/tool/creative/ui/img/thumbnail-text.png';
                    var linkTemplate = '<div class="creative-list-material';
                    
                    if (item.type !== 0) {
                        var imageSrc = item.materialUrl || imageUrls[item.type];
                        if (imageSrc !== '') {
                            linkTemplate += '">'
                                + '<img src="' + imageSrc
                                + '" height="100%" width="100%"/>'
                                + '</div>';
                        }
                    }
                    else {
                        var creativeUtil = require('tool/creative/util');
                        linkTemplate += ' creative-list-content-text">'
                            + creativeUtil.getTextPreviewHtml(item)
                            + '</div>';
                    }
                    linkTemplate += '<span class="creative-list-name">'
                        + item.name + '</span>';                    
                    var Table = require('esui/Table');
                    var config = {
                        className: '',
                        command: 'preview',
                        args: item.id,
                        //text: '预览'
                        text: ''
                    };
                    var html = u.template(linkTemplate, item)
                        + '<a>' + Table.command(config) + '</a>';
                    return html;
                }
            },
            {
                title: 'ID',
                field: 'adId',
                sortable: true,
                resizable: false,
                width: 100,
                content: 'id'
            },
            {
                title: '尺寸',
                field: 'size',
                sortable: false,
                resizable: false,
                width: 100,
                content: function (item) {
                    return item.width >= 0
                        ? item.width + '*' + item.height
                        : '-';
                }
            },
            {
                title: '类型',
                field: 'type',
                sortable: false,
                resizable: false,
                width: 100,
                content: function (item) {
                    return enums.Type.getTextFromValue(item.type);
                }
            },
            {
                title: '权重/顺序',
                field: 'inturnValue',
                sortable: false,
                resizable: false,
                width: 100,
                content: function (item) {
                    var type = item.inturnType;
                    var value = item.inturnValue;
                    var text;
                    switch (type) {
                        case 0:
                            text = '-';
                            break;
                        case 1:
                            text = value;
                            break;
                        case 2:
                            text = value + 's';
                            break;
                        case 3:                       
                            text = value;
                    }
                    return text;
                }
            },
            {
                title: '订单',
                field: 'orderName',
                sortable: false,
                resizable: false,
                width: 100,
                content: 'orderName'
            },
            {
                title: '广告',
                field: 'deliveryName',
                sortable: false,
                resizable: false,
                width: 100,
                content: 'deliveryName'
            },
            {
                title: '操作',
                field: 'operation',
                sortable: false,
                resizable: false,
                width: 120,
                stable: true,
                content: function (item) {
                    var config = [
                        {
                            text: '修改',
                            type: 'modify',
                            auth: item.canModify,
                            url: '#/creative/create~deliveryId=' + item.deliveryId
                                + '&creativeId=' + item.id
                        },
                        {
                            text: '报告',
                            type: 'report',
                            url: '#/report/creative/date~id=' + item.id,
                            auth: item.hasReport
                        }
                    ];

                    var Table = require('esui/Table');
                    return Table.operations(config);
                }
            }
        ];

        /**
         * 控件额外属性
         *
         * @type {Object}
         */
        CreativeListView.prototype.uiProperties = {
            table: {
                fields: tableFields,
                select: false
            },
            keyword: {
                placeholder: '输入创意ID或名称'
            }
        };
        
         /**
         * 控件事件配置
         *
         * @type {Object}
         * @override
         */
        CreativeListView.prototype.uiEvents = {
            'table:command': previewEvent
        };

        /**
         * 预览
         * @param {Object} e 控件事件对象
         */ 
        function previewEvent(e) {
            if (e.name === 'preview') {
                this.fire('preview', { id: e.args });
            }
        }

        CreativeListView.prototype.render = function () {
            this.uiProperties = u.deepClone(this.uiProperties);
            var order;
            var delivery;
            var type;
            var orderId = this.model.get('orderId');
            var deliveryId = this.model.get('deliveryId');
            var results = this.model.get('results');
            if (orderId || deliveryId) {
                order = u.findWhere(
                    tableFields, { field: 'orderName'});
            }
            if (deliveryId) {
                delivery = u.findWhere(
                    tableFields, { field: 'deliveryName'});
                if (results.length) {
                    this.uiProperties.table.select = 'multi';
                    var intrunType = results[0]['inturnType'];
                    if (intrunType != 1 && intrunType != 3) {
                        type = u.findWhere(
                            tableFields, { field: 'inturnValue'});
                    }
                    else {
                        tableFields[4]['title'] =
                            intrunType == 1 ? '权重' : '顺序';
                    }
                }
            }

            this.uiProperties.table.fields =
                u.without(tableFields, order, delivery, type);
            ListView.prototype.render.apply(this, arguments);
        };

        /**
         * 预览创意
         */
        CreativeListView.prototype.preview = function (previewInfo, isSlide) {
            var options = {
                id: 'preview-panel',
                datasource: this.model.get('results'),
                data: previewInfo.data,
                previewUrl: previewInfo.previewUrl
            };
            previewPanel = this.create('CreativePreviewPanel', options);
            previewPanel.render();
        };

        return CreativeListView;
    }
);