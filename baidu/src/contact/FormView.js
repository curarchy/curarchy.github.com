/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 联系人表单视图类
 * @author liyidong(srhb18@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var FormView = require('common/FormView');
        var util = require('er/util');
        var u = require('underscore');

        require('tpl!./tpl/common.tpl.html');
        require('tpl!./tpl/form.tpl.html');

        /**
         * 联系人表单视图类
         *
         * @constructor
         * @extends common/FormView
         */
        function ContactFormView() {
            FormView.apply(this, arguments);
        }

        util.inherits(ContactFormView, FormView);

        /** 
         * 使用的模板名称
         *
         * @type {string}
         */
        ContactFormView.prototype.template = 'contactForm';

        /**
         * 从表单中获取实体数据
         *
         * @return {Object}
         */
        ContactFormView.prototype.getEntity = function () {
            var entity = FormView.prototype.getEntity.apply(this, arguments);

            // 如果选择邀请联系人查看报告，则赋值数字1,如果没这个参数，就给数字0
            entity.inviteFlag = entity.inviteFlag || '0';
            entity.inviteFlag = parseInt(entity.inviteFlag, 10);

            // 所属公司提交数据处理
            if (entity.hasOwnProperty('companyId')) {
                // companyId的Selector控件返回的是选择的公司对象
                // 提取出其中的id字段传给后端
                entity.companyId = parseInt(entity.companyId.id, 10);
            }
            return entity;
        };

        /**
         * 控件额外属性配置
         *
         * @type {Object}
         * @override
         */
        ContactFormView.prototype.uiProperties = {
            'create-company': {
                datasource: [
                    { text: '广告客户', url: '/company/create' },
                    { text: '代理机构', url: '/agent/create' }
                ]
            }
        };

        /**
         * 刷新所属公司选择控件
         *
         * @public
         */
        ContactFormView.prototype.refreshCompany = function (selected) {
            var company = this.get('company');
            company.set(
                'datasource', this.model.get('companies')
            );
            company.setValue(selected);
        };

        /**
         * 新建公司选中后，弹出新建公司的子Action
         *
         */
        function createCompanyInline(e) {
            var item = e.item;
            var view = this;
            view.waitActionDialog(
                { 
                    url: item.url,
                    title: item.text 
                }
            ).then(
                function (e) {
                    var dialog = e.target;
                    var dialogAction = dialog.get('action');
                    dialogAction.on(
                        'entitysave',
                        function (e) {
                            // 刷新当前页面数据
                            view.fire('reloadCompany', { company: e.entity });
                        }
                    );
                }
            );
        }

        /**
         * 控件事件配置
         *
         * @type {Object}
         * @override
         */
        ContactFormView.prototype.uiEvents = {
            'create-company:select': createCompanyInline,
            'mail-label-with-modify:click': enableMailModify
        };

        /** 
         * 邮件字段进入可编辑状态
         */
        function enableMailModify() {
            this.get('mail').enable();
            this.get('mail-confirm').enable();
            this.get('mail-confirm-wrapper').show();
            
            // 切换label到普通状态
            this.get('mail-label-with-modify').hide();
            this.get('mail-confirm-label-normal').show();
        }

        /**
         * 渲染
         *
         * @override
         */
        ContactFormView.prototype.enterDocument = function () {
            FormView.prototype.enterDocument.apply(this, arguments);

            var model = this.model;
            var mail = model.get('mail');

            // 编辑状态时，全部进入disable状态，由边上Label负责切换可编辑状态
            if (mail) {
                this.get('mail').disable();
                this.get('mail-confirm').disable();
                this.get('mail-confirm-wrapper').hide();
            }

            // 根据状态显示不同的mail说明lable
            if (model.get('canEditEmail')) {
                this.get('mail-label-with-modify').show();
            }
            else {
                this.get('mail-confirm-label-normal').show();
            }

            // 默认选中邀请查看报告，如果编辑时后端规定不勾选，则不勾选
            
            if (model.get('formType') === 'update') {
                this.get('invite-flag').setChecked(!!model.get('inviteFlag'));
            }

            // 如果有展开高级设置权限，则展开高级设置
            var advanceGroup = this.getGroup('advance-config-group');
            var displayAdvanceConfig = u.any(advanceGroup, function (control) {
                return control.getValue() !== '';
            });
            if (displayAdvanceConfig) {
                this.get('advance-config').set('expanded', true);
            }
        };
        
        return ContactFormView;
    }
);