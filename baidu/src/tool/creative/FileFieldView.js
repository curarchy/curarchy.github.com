/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 上传文件的表单区域视图
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var UIView = require('ef/UIView');
        var util = require('er/util');
        var u = require('underscore');

        require('tpl!./tpl/fileField.tpl.html');

        /**
         * 上传文件的表单区域视图
         *
         * @constructor
         * @extends ef/UIView
         */
        function FileFieldView() {
            UIView.apply(this, arguments);
        }

        util.inherits(FileFieldView, UIView);

        /**
         * 模板目标名称
         *
         * @type {string}
         * @override
         */
        FileFieldView.prototype.template = 'creativeFileField';

        /**
         * 切换文件来源类型
         *
         * @param {number} type 来源类型，`0`为本地上传，`1`为远程链接
         */
        function toggleSourceType(type) {
            if (type === 0) {
                this.get('remote').show();
                this.get('local').hide();
                this.getGroup('remote').enable();
                this.getGroup('local').disable();

                // 显示预览
                showRemotePreview.call(this);
            }
            else {
                this.get('remote').hide();
                this.get('local').show();
                this.getGroup('remote').disable();
                this.getGroup('local').enable();

                // 显示预览
                this.get('upload').showPreview();
            }
        }

        /**
         * 显示远程物料的预览
         */
        function showRemotePreview() {
            var preview = this.get('preview');

            if (!preview) {
                return;
            }

            var url = this.get('url').getValue();

            if (!url) {
                preview.restoreInitialState();
                return;
            }

            var properties = {
                url: url,
                width: null,
                height: null
            };
            preview.setProperties(properties);
        }

        /**
         * 获取实体
         *
         * @return {Object}
         */
        FileFieldView.prototype.getEntity = function () {
            var materialType = this.get('remote').isHidden() ? 1 : 0;
            var groupName = materialType === 1 ? 'local' : 'remote';
            var entity = { materialType: materialType };
            u.each(
                this.getGroup(groupName),
                function (control) {
                    entity[control.get('name')] = control.getRawValue();
                }
            );

            if (entity.file) {
                entity.materialLocalPath = entity.file.materialLocalPath;
                entity.materialUrl = entity.file.value;

                entity = u.omit(entity, 'file');
            }
            else {
                entity.materialUrl = entity.value;
                entity = u.omit(entity, 'value');
            }


            entity.width = parseInt(entity.width, 10);
            entity.height = parseInt(entity.height, 10);

            return entity;
        };

        /**
         * 控件的相关属性
         *
         * @type {Object}
         * @override
         */
        FileFieldView.prototype.uiProperties = {
            upload: {
                getPreviewURL: function () {
                    return this.fileInfo ? this.fileInfo.value : '';
                }
            }
        };

        /**
         * 控件事件配置
         *
         * @type {Object}
         * @override
         */
        FileFieldView.prototype.uiEvents = {
            'switch-to-local:click': u.partial(toggleSourceType, 1),
            'switch-to-remote:click': u.partial(toggleSourceType, 0),
            'url:blur': showRemotePreview,
            'upload:complete': function (e) {
                var info = e.target.getRawValue();
                this.get('local-width').setValue(info.width);
                this.get('local-height').setValue(info.height);
            }
        };

        /**
         * 文档准备完毕时调用
         *
         * @override
         */
        FileFieldView.prototype.enterDocument = function () {
            UIView.prototype.enterDocument.apply(this, arguments);
            this.initValues();
            toggleSourceType.call(this, this.model.get('materialType'));
        };

        /**
         * 初始化控件的值
         */
        FileFieldView.prototype.initValues = function () {
            if (!this.model.get('value')) {
                return;
            }

            var materialType = this.model.get('materialType');
            var group = materialType === 1 ? 'local' : 'remote';
            u.each(
                this.getGroup(group),
                function (input) {
                    var name = input.get('name');
                    var value = this.model.get(name);
                    input.setRawValue(value);
                },
                this
            );
        };

        /**
         * 获取视图名称
         *
         * @return {string}
         * @protected
         * @override
         */
        FileFieldView.prototype.getViewName = function () {
            var name = UIView.prototype.getViewName.apply(this, arguments);

            var creativeType = this.model.get('creativeType');
            if (creativeType) {
                name = creativeType + '-' + name;
            }

            return name;
        };

        return FileFieldView;
    }
);        
