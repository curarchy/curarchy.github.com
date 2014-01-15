/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 富媒体创意表单视图类
 * @author lixiang(lixiang05@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var BaseFormView = require('./BaseFormView');
        var util = require('er/util');
        var u = require('underscore');

        require('tpl!./tpl/richForm.tpl.html');

        /**
         * 富媒体创意表单视图类
         *
         * @constructor
         * @extends common/FormView
         */
        function RichFormView() {
            BaseFormView.apply(this, arguments);
        }

        util.inherits(RichFormView, BaseFormView);

        /** 
         * 使用的模板名称
         *
         * @type {string}
         */
        RichFormView.prototype.template = 'richForm';

        /**
         * 从表单中获取实体数据
         *
         * @return {Object}
         */
        RichFormView.prototype.getEntity = function () {
            var entity = 
                BaseFormView.prototype.getEntity.apply(this, arguments);
            return entity;
        };

        /**
         * 控件额外属性配置
         *
         * @type {Object}
         * @override
         */
        RichFormView.prototype.uiProperties = {
            'creative-form-rich-uploader': {
                args: {
                    autoPush: 1,
                    getPreviewURL: function () {
                        return this.fileInfo ? this.fileInfo.value : '';
                    }
                }
            }
        };

        /**
         * 控件事件配置
         *
         * @type {Object}
         * @override
         */
        RichFormView.prototype.uiEvents = {
            'rich-generate-link:click': u.partial(toggleGenerateLink, 1),
            'creative-form-rich-uploader:complete': triggerComplete
        };

        function triggerComplete(e) {
            var file = e.target.fileInfo;
            this.get('rich-material-url').setValue(file.materialUrl);
            this.get('rich-material-url-wrapper').show();
        }

        /**
         * 展开或收起自动生成链接输入框
         *
         * @param {number} type 展开状态 `0`为收起，`1`为展开
         */
        function toggleGenerateLink(type) {
            if (type === 1) {
                // 校验输入
                var clickUrlInput = this.get('rich-click-url');
                if (clickUrlInput.validate()) {
                    var generateUrlInput = this.get('rich-generate-click-url');
                    var clickUrl = clickUrlInput.getValue();
                    generateUrlInput.setValue(
                        '%%BEGIN_LINK%%http://' + clickUrl + '%%END_LINK%%'
                    );
                    this.get('rich-generate-link-wrapper').show();
                }
            }
            else {
                this.get('rich-generate-link-wrapper').hide();
            }
        }
        
        return RichFormView;
    }
);