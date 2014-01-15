/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 公司列表视图类
 * @author lisijin(ibadplum@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var ListView = require('common/ListView');
        var util = require('er/util');

        require('tpl!./tpl/common.tpl.html');
        require('tpl!./tpl/list.tpl.html');

        /**
         * 频道分组列表视图类
         *
         * @constructor
         * @extends common/ListView
         */
        function CompanyListView() {
            ListView.apply(this, arguments);
        }

        util.inherits(CompanyListView, ListView);

        /** 
         * 使用的模板名称
         *
         * @type {string}
         */
        CompanyListView.prototype.template = 'companyList';

        /**
         * 控件事件配置
         *
         * @type {Object}
         * @override
         */
        CompanyListView.prototype.uiEvents = {
            'create:select': createCompany
        };

        function createCompany(e) {
            var url = e.item.url;
            this.fire('createCompany', {url: url});
        }

        var status = require('common/global/status');
        var statusHTMLMapping = [
            status.removed,
            status.normal
        ];
        var companyTypeMapping = [
            '广告客户',
            '代理机构'
        ];

        var tableFields = [
            {
                title: '公司名称',
                field: 'name',
                sortable: true,
                resizable: false,
                width: 120,
                stable: false,
                content: 'name'
            },
            {
                title: '状态',
                field: 'status',
                sortable: false,
                resizable: false,
                width: 50,
                stable: true,
                content: function (item) {
                    var status = statusHTMLMapping[item.status];
                    var Table = require('esui/Table');
                    return Table.status(status);
                }
            },
            {
                title: '类型',
                field: 'type',
                sortable: true,
                resizable: false,
                width: 80,
                stable: true,
                content: function (item) {
                    return companyTypeMapping[item.type];
                }
            },
            {
                title: '联系人',
                field: 'contactorCount',
                sortable: false,
                resizable: false,
                width: 60,
                stable: true,
                content: function (item) {
                    var url = '#/contact/list~companyId=' + item.id;
                    var html = '<a href=' + url + '>'
                        + item.contactorCount + '</a>';
                    return html;
                }
            },
            {
                title: '说明',
                field: 'description',
                width: 300,
                sortable: false,
                resizable: false,
                content: 'description'
            },
            {
                title: '操作',
                field: 'operation',
                sortable: false,
                resizable: false,
                width: 50,
                stable: true,
                content: function (item) {
                    var type = item.type ? 'agent' : 'company';
                    var config = [
                        {
                            text: '修改',
                            type: 'modify',
                            url: '#/' + type + '/update~id=' + item.id,
                            auth: item.canModify
                        },
                        {
                            text: '查看',
                            type: 'read',
                            url: '#/' + type + '/view~id=' + item.id,
                            auth: !item.canModify
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
        CompanyListView.prototype.uiProperties = {
            table: {
                fields: tableFields
            },
            create: {
                displayText: '新建公司',
                datasource: [
                    { text: '广告客户', url: '#/company/create' },
                    { text: '代理机构', url: '#/agent/create' }
                ]
            },
            keyword: {
                placeholder: '请输入公司名称或说明'
            }
        };
        
        return CompanyListView;
    }
);