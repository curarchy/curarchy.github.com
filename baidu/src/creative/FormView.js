/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 创意表单视图类
 * @author lisijin(ibadplum@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var FormView = require('common/FormView');
        var util = require('er/util');
        var u = require('underscore');
        var template = require('er/template');
        var ui = require('esui');        
        require('tpl!./tpl/form.tpl.html');
        require('tpl!./tpl/select.tpl.html');

        /**
         * 创意表单视图类
         *
         * @constructor
         * @extends common/FormView
         */
        function CreativeFormView() {
            FormView.apply(this, arguments);
        }

        util.inherits(CreativeFormView, FormView);

        /** 
         * 使用的模板名称
         *
         * @type {string}
         */
        CreativeFormView.prototype.template = 'creativeForm';

        /**
         * 控件事件配置
         *
         * @type {Object}
         * @override
         */
        CreativeFormView.prototype.uiEvents = {
            'creative-form:command': commandHandle
        };

        // 用于保存当前读取的子action;
        var nowAction;

        function commandHandle(e) {
            e.stopPropagation();
            var id = e.args;
            var getParams = u.bind(getUrlParams, this);
            var action;
            if (e.name === 'edit') {
                if (!this.model.get('isUnionSeriveOK')) {
                    var results = this.model.get('results');
                    var result = u.find(results, function (item) {
                        return item.id === id;
                    });
                    if (result && result.type == 10) {
                        return false;
                    }
                }
                action = this.get('creative-form').loadAction(
                    { url: '/tool/creative/update~id='
                        + id + '&' + getParams(id)},
                    id
                );
                action.on('actionloaded',
                    u.bind(sonActionModify, this, action, id));
            }
            if (e.name === 'delete') {
                this.fire('delete', { id: id });
            }
            if (e.name === 'create') {
                action = this.get('creative-form').loadAction(
                    { url: '/tool/creative/create~'
                        + getParams() }
                );
                action.on('actionloaded',
                    u.bind(sonActionModify, this, action));
            }
            if (e.name === 'select') {
                var loadAction = u.bind(loadSelectAction, this);
                loadAction();
            }
            nowAction = action;
        }

        /**
         * 加载子 action
         * 
         */
        function loadSelectAction() {
            nowAction && nowAction.dispose && nowAction.dispose();
            var that = this;
            var node = document.getElementById('creative-Thumbnail');
            var dom = document.getElementById('select-action-container');
            if (!dom) {
                var dom = document.createElement('div');
                dom.id = 'select-action-container';
            }
            var option = {
                url: '/tool/creative/list',
                actionOptions: {
                    cannotCreate: true,
                    noOperation: true,
                    onlyShowStatus: true
                }
            };
            template.merge(dom, 'selectAction');
            ui.init(dom, { properties: { 'select-creative': option }});
            node.appendChild(dom);

            ui.get('select-creative').get('action').then(
                function () {
                    var wrapper = ui.get('select-action-wrapper');
                    wrapper.show();
                    ui.get('addSubmit').on(
                        'click',
                        function (e) {
                            var action =
                                ui.get('select-creative').get('action');
                            var table = action.view.get('table');
                            var ids = table.getSelectedItems();
                            if (ids.length === 0) {
                                var options = {
                                    title: '无法提交创意',
                                    content: '提交前请先选择创意'
                                    };
                                that.waitConfirm(options);
                                return false;
                            }
                            that.fire('savecreative', { results: ids });
                        }
                    );
                    ui.get('addCancel').on(
                        'click',
                        function () {
                            wrapper.destroy();
                        }
                    );
                }
            );     
        }

        /**
         * 获取往 tool/creative 里传的参数
         * @param  {string} id id
         * @return {string} params 要传入的参数
         */
        function getUrlParams(id) {
            var params;
            var type;
            var original;
            var results = this.model.get('results');
            if (id) {
                original = u.find(results, function (result) {
                    // 数据格式不是很确定，先这样
                    return id == result.id;
                });
                type = original.inturnType;
            }
            else {
                type = this.model.get('inturnType');
            }

            if (type === 1 || type === 3) {
                var inturnMax = type === 1 ? 10 : getMax(results);
                var inturnValue;
               
                // edit的走这个分支
                if (original && original.inturnValue) {
                    inturnValue = original.inturnValue;
                }
                // new 的走这分支
                else {
                    inturnValue = type === 1 ? 5 : (results.length + 1);
                    inturnMax += 1;
                }
                 params =  'inturnType=' + type
                    + '&inturnMax=' + inturnMax
                    + '&inturnValue=' + inturnValue;
            }
            else {
                params = '';
            }

            function getMax(results) {
                var num = results.length;
                return num < 10 ? num : 10;
            }
            return params;
        }

        /**
         * 往子action上捆绑各种事件
         * 
         */
        function sonActionModify(action, id) {
            var selectAction = ui.get('select-action-wrapper');
            if (selectAction) {
                selectAction.destroy();
            }
            if (action) {
                addArrow(action.main);
            }
            var that = this;
            action.get('action').on('save', function (e) {
                that.fire('savecreative', { entity: e.entity });
                action.dispose();
            });
            action.get('action').on('cancel', function () {
                action.dispose();
            });
        }

        /**
         * 加入三角箭头
         * 
         */
        function addArrow(dom) {
            if (!document.getElementById('creative-form-arrow')) {
                var arrow = document.createElement('div');
                arrow.className = 'creative-form-arrow';
                arrow.id = 'creative-form-arrow';
                arrow.innerHTML = '<span class="arrow-outline">◆</span>'
                    + '<span class="arrow-inner">◆</span></div>';
                dom.insertBefore(arrow, dom.firstChild);
            }
        }

        /**
         * 重新渲染列表
         * 
         */
        CreativeFormView.prototype.renderCreative = function () {
            var action = this.get('creative-form');
            action.set('datasource', this.model.get('results'));
            action.render();
        };

        CreativeFormView.prototype.render = function () {
            this.uiProperties = u.clone(this.uiProperties);
            FormView.prototype.render.apply(this, arguments);
            var creativeId = this.model.get('creativeId');
            if (creativeId) {
                var e = {
                    args: creativeId,
                    name: "edit",
                    stopPropagation: function(){}
                };
                commandHandle.call(this, e);
            }
        };

         /**
         * 从表单中获取实体数据
         *
         * @return {Object}
         */
        CreativeFormView.prototype.getEntity = function () {
            var results = this.model.get('results');
            var inturnType = this.model.get('inturnType');
            var ids = u.map(
                results,
                function (item) {
                    var result = { id: item.id };
                    if (inturnType === 1) {
                        result.weight = item.inturnValue;
                    }
                    else if (inturnType === 3) {
                        result.displayOrder = item.inturnValue;
                    }
                    return result;
                }
            );
            var entity = {
                data: {
                    type: 2,
                    data: ids
                },
                deliveryId: this.model.get('deliveryId')
            };
            return entity;
        };

       CreativeFormView.prototype.showWarning = function (isShowWarning) {
            var warningDom = document.getElementById('create-form-warning');
            if (isShowWarning) {
                this.disableSubmit();
                warningDom.style.display = 'block';
            }
            else {
                this.enableSubmit();
                warningDom.style.display = 'none';
            }
        };
       /**
         * 向用户通知提交错误信息
         *
         * @param {Object} errors 错误信息
         * @param {Object[]} errors.fields 出现错误的字段集合
         */
        CreativeFormView.prototype.notifyErrors = function (errors) {
            var options = {
                title: '保存创意出错',
                content: errors['fields'][0]['message']
            };
            this.waitConfirm(options);
        };

        return CreativeFormView;
    }
);