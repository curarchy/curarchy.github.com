/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 创意表单视图类
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var BaseFormView = require('./BaseFormView');
        var util = require('er/util');
        var u = require('underscore');

        require('tpl!./tpl/flashForm.tpl.html');

        /**
         * 创意表单视图类
         *
         * @constructor
         * @extends creative/BaseFormView
         */
        function FlashFormView() {
            BaseFormView.apply(this, arguments);
        }

        util.inherits(FlashFormView, BaseFormView);

        /** 
         * 使用的模板名称
         *
         * @type {string}
         */
        FlashFormView.prototype.template = 'flashForm';

        /**
         * 从表单中获取实体数据
         *
         * @return {Object}
         */
        FlashFormView.prototype.getEntity = function () {
            var entity = 
                BaseFormView.prototype.getEntity.apply(this, arguments);
            
            // 判断展开备用图片子Action的数据
            entity.backupPicFlag = 
                this.get('backup-pic-flag').isChecked() ? 1 : 0;
            if (entity.backupPicFlag) {
                var backupPicFileWithPrefix = {};
                u.each(
                    entity.backupPicFile,
                    function (value, key) {
                        var newKey = key.replace(
                            key.charAt(0),
                            key.charAt(0).toUpperCase()
                        ).replace(
                        'Material',
                        ''
                        );
                        backupPicFileWithPrefix['backupPic' + newKey] = value;
                    }
                );
                u.extend(entity, backupPicFileWithPrefix);
            }

            // 判断点击监控，并展开数据
            entity.flashDivFlag = 
                this.get('flash-div-flag').isChecked() ? 1 : 0;
            if (entity.flashDivFlag) {
                entity.clickTag = parseInt(entity.clickTag[0], 10);
            }

            // 在两个链接均展开情况下，强制同步两个click的URL
            // if (entity.flashDivFlag && entity.backupPicFlag) {
            //     entity.backupPicClickUrl = entity.clickUrl;
            // }

            // 是否透明
            entity.wmode = parseInt(entity.wmode[0], 10);

            // 目标窗口
            entity.targetWindow = parseInt(entity.targetWindow[0], 10);

            // 过滤掉备用图片数据对象，前面已经展开了
            return u.omit(entity, 'backupPicFile');
        };

        /**
         * 切换点击监控逻辑
         *
         */
        function toggleFlashDivWapper() {
            var flashDivFlag = this.get('flash-div-flag');
            var flashDivWarpper = this.get('flash-div-warpper');
            var flashDivs = this.getGroup('flash-div');

            if (flashDivFlag.isChecked()) {
                flashDivs.enable();
                flashDivWarpper.show();
            }
            else {
                flashDivWarpper.hide();
                flashDivs.disable();
            }

            toggleClickUrl.call(this);
        }

        /**
         * 切换备用图片逻辑
         *
         */
        function toggleBackupPicWapper() {
            var backupPicFlag = this.get('backup-pic-flag');
            var flashBackupPicWarpper = this.get('flash-backup-pic-warpper');
            var flashBackupPics = this.getGroup('flash-backup-pic');

            if (backupPicFlag.isChecked()) {
                flashBackupPics.enable();
                flashBackupPicWarpper.show();
            }
            else {
                flashBackupPicWarpper.hide();
                flashBackupPics.disable();
            }

            toggleClickUrl.call(this);
        }

        function toggleClickUrl() {
            var flashDivFlag = this.get('flash-div-flag');
            var backupPicFlag = this.get('backup-pic-flag');
            var backupPicClickUrl = this.get('backup-pic-click-url');
            if (flashDivFlag.isChecked() && backupPicFlag.isChecked()) {
                backupPicClickUrl.disable();
                // 强制同步一下
                syncClickURL.call(this);
            }
            else if (backupPicFlag.isChecked()) {
                backupPicClickUrl.enable();
            }
        }

        /**
         * 同步点击监控和后备图片链接
         *
         */
        function syncClickURL() {
            var flashDivFlag = this.get('flash-div-flag');
            var backupPicFlag = this.get('backup-pic-flag');
            var clickUrl = this.get('click-url');
            var backupPicClickUrl = this.get('backup-pic-click-url');

            if (flashDivFlag.isChecked() && backupPicFlag.isChecked()) {
                backupPicClickUrl.setValue(clickUrl.getValue());
                backupPicClickUrl.fire('input');
            }
        }

        /**
         * 控件事件配置
         *
         * @type {Object}
         * @override
         */
        FlashFormView.prototype.uiEvents = {
            'flash-div-flag:change': toggleFlashDivWapper,
            'backup-pic-flag:change': toggleBackupPicWapper,
            'click-url:input': syncClickURL

        };

        /**
         * 渲染
         *
         * @protected
         * @override
         */
        FlashFormView.prototype.enterDocument = function () {
            BaseFormView.prototype.enterDocument.apply(this, arguments);

            var model = this.model;

            if (model.get('formType') === 'update') {
                if (model.get('flashDivFlag')) {
                    this.get('flash-div-flag').setChecked(true);
                }
                if (model.get('backupPicFlag')) {
                    this.get('backup-pic-flag').setChecked(true);
                }
            }

            toggleFlashDivWapper.call(this);
            toggleBackupPicWapper.call(this);
        };
        
        return FlashFormView;
    }
);