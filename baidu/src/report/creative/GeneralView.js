/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 整体每日报告视图类
 * @author lixiang(lixiang05@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var BaseView = require('./BaseView');
        var util = require('er/util');
        var u = require('underscore');

        require('tpl!./tpl/general.tpl.html');

        /**
         * 整体每日报告视图类
         *
         * @constructor
         * @extends report/slot/BaseView
         */
        function GeneralReportView() {
            BaseView.apply(this, arguments);
        }

        util.inherits(GeneralReportView, BaseView);

        var tableFields = u.union(
            [
                {
                    title: '创意',
                    field: 'name',
                    sortable: true,
                    resizable: true,
                    width: 100,
                    stable: true,
                    content: function (item) {
                        var lib = require('esui/lib');
                        var nameLink = ''
                            + '<a href="#/report/creative/date~id=${id}'
                            + '&${crumbInfo}">${text}</a>';
                        var data = {
                            id: item.id,
                            text: item.name,
                            crumbInfo: item.crumbInfo
                        };
                        return lib.format(nameLink, data);
                    }   
                },
                {
                    title: '类型',
                    field: 'type',
                    sortable: true,
                    resizable: true,
                    width: 80,
                    stable: true,
                    content: function (item) {
                        if (item.formatted) {
                            return item.type;
                        }
                        var enums = require('creative/enum');
                        var typeText =
                            enums.Type.getTextFromValue(item.type);
                        item.type = typeText;
                        item.formatted = true;
                        return typeText;
                    }   
                },
                {
                    title: '尺寸',
                    field: 'size',
                    sortable: true,
                    resizable: true,
                    width: 80,
                    stable: true,
                    content: function (item) {
                        if (item.width === -1 || item.height === -1) {
                            return '--';
                        }
                        return item.width + '*' + item.height;
                    }   
                }

            ],
            BaseView.prototype.commonTableFields
        );
        


        GeneralReportView.prototype.uiProperties = u.extend(
            {
                table: {
                    fields: tableFields,
                    select: false,
                    selectMode: 'line',
                    sortable: true,
                    columnResizable: true
                }
            },
            BaseView.prototype.uiProperties
        );

        GeneralReportView.prototype.getSearchArgs = function () {
            var args = BaseView.prototype.getSearchArgs.apply(this, arguments);
            if (args.size) {
                var sizeAttrs = args.size.split('*');
                if (sizeAttrs.length > 0) {
                    args.width = sizeAttrs[0];
                    args.height = sizeAttrs[1];
                    delete args.size;
                }
            }
            // 获取flag
            var flag = this.model.get('flag');
            args.flag = flag;
            return args;
        };

        /** 
         * 使用的模板名称
         *
         * @type {string}
         */
        GeneralReportView.prototype.template = 'creativeGeneral';
        
        return GeneralReportView;
    }
);