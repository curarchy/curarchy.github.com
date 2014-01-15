/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 增强Uploader组件
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var Extension = require('esui/Extension');
        var lib = require('esui/lib');
        var helper = require('esui/controlHelper');
        var Uploader = require('../Uploader');

        /**
         * 上传增加组件，为`Uploader`控件增加拖拽上传及`XMLHttpRequest`上传功能
         */
        function ModernUpload() {
            Extension.apply(this, arguments);
        }

        ModernUpload.prototype.type = 'ModernUpload';

        /**
         * 显示上传进度
         *
         * @parma {Uploader} this `Uploader`控件实例
         * @param {Event} e 来自`XMLHttpRequest`的事件对象
         */
        function showProgress(e) {
            if (!this.hasState('busy')) {
                this.showUploading();
            }
            if (e.lengthComputable) {
                var complete = (event.loaded / event.total * 100 | 0);
                this.addState('progress');
                var indicator = lib.g(helper.getId(this, 'indicator-wrapper'));
                indicator.style.left = -(100 - complete) + '%';
            }
        }

        /**
         * 显示上传结果
         *
         * @parma {Uploader} this `Uploader`控件实例
         */
        function showUploadResult(e) {
            var result = JSON.parse(e.target.responseText);
            Uploader.prototype.showUploadResult.call(this, result);
            this.removeState('progress');
            var indicator = lib.g(helper.getId(this, 'indicator-wrapper'));
            indicator.style.left = '';
        }

        /**
         * 使用`XMLHttpRequest`上传文件
         *
         * @parma {Uploader} this `Uploader`控件实例
         * @param {File=} file 待上传的文件，默认从`<input>`中拿
         */
        function receiveFile(file) {
            if (!file) {
                var input = lib.g(helper.getId(this, 'input'));
                file = input.files[0];
            }

            if (!file) {
                return;
            }

            if (!this.checkFileFormat(file.name)) {
                return;
            }

            var formData = new FormData();
            formData.append(this.get('name'), file);
            var xhr = new XMLHttpRequest();
            xhr.open(this.get('method'), this.get('action'));
            xhr.onload = lib.bind(this.showUploadResult, this);
            xhr.onerror = lib.bind(this.showUploadResult, this);
            xhr.upload.onprogress = lib.bind(showProgress, this);
            xhr.send(formData);

            var canPreview = this.fileType === 'image';
            if (!canPreview && this.fileType === 'auto') {
                canPreview = (file.type.indexOf('image') === 0);
            }
            if (canPreview) {
                this.fileObjectURL = URL.createObjectURL(file);
            }
        }

        /**
         * 显示预览
         *
         * @parma {Uploader} this `Uploader`控件实例
         */
        function showPreview(info) {
            var previewElement = lib.g(helper.getId(this, 'preview'));
            if (previewElement
                && previewElement.nodeName.toLowerCase() === 'img'
            ) {
                try {
                    URL.revokeObjectURL(previewElement.src);
                }
                catch (itIsNotAnObjectURL) {
                }
            }

            if (this.fileObjectURL) {
                info = lib.extend({}, info);
                info.previewURL = this.fileObjectURL;
            }
            Uploader.prototype.showPreview.call(this, info);
        }

        /**
         * 显示为可把文件放至此处的状态
         *
         * @parma {Event} e DOM事件对象
         * @return {boolean} 永远返回`false`以取消IE下的事件默认行为
         * @inner
         */
        function showDroppableMark(e) {
            e.preventDefault();
            helper.addStateClasses(this, 'droppable');
            var indicator = lib.g(helper.getId(this, 'indicator'));
            indicator.innerHTML = lib.encodeHTML('拖动文件到此');
            return false;
        }

        /**
         *b取消显示为可把文件放至此处的状态
         *
         * @parma {Event} e DOM事件对象
         * @return {boolean} 永远返回`false`以取消IE下的事件默认行为
         * @inner
         */
        function cancelDroppableMark(e) {
            e.preventDefault();
            helper.removeStateClasses(this, 'droppable');
            return false;
        }

        /**
         * 显示可放开鼠标的状态
         *
         * @parma {Event} e DOM事件对象
         * @return {boolean} 永远返回`false`以取消IE下的事件默认行为
         * @inner
         */
        function showAcceptingMark(e) {
            e.preventDefault();
            e.stopPropagation();
            helper.addStateClasses(this, 'accepting');
            var indicator = lib.g(helper.getId(this, 'indicator'));
            indicator.innerHTML = lib.encodeHTML('放开鼠标');
            return false;
        }

        /**
         * 取消显示可放开鼠标的状态
         *
         * @parma {Event} e DOM事件对象
         * @return {boolean} 永远返回`false`以取消IE下的事件默认行为
         * @inner
         */
        function cancelAcceptingMark(e) {
            e.preventDefault();
            e.stopPropagation();
            helper.removeStateClasses(this, 'accepting');
            return false;
        }

        /**
         * 把拖放至此的文件上传
         *
         * @parma {Event} e DOM事件对象
         * @return {boolean} 永远返回`false`以取消IE下的事件默认行为
         * @inner
         */
        function uploadDroppedFile(e) {
            e.preventDefault();
            helper.removeStateClasses(this, 'droppable');
            helper.removeStateClasses(this, 'accepting');
            var file = e.dataTransfer.files[0];
            this.receiveFile(file);
            return false;
        }

        /**
         * 取消事件默认行为
         *
         * @parma {Event} e DOM事件对象
         * @return {boolean} 永远返回`false`以取消IE下的事件默认行为
         * @inner
         */
        function cancel(e) {
            e.preventDefault();
            return false;
        }

        /**
         * 启用高级上传功能
         *
         * @parma {Uploader} this `Uploader`控件实例
         */
        function enableModernUpload() {
            this.receiveFile = receiveFile;
            this.showUploadResult = showUploadResult;
            this.showPreview = showPreview;

            helper.addDOMEvent(
                this, document, 'dragenter', cancel);
            helper.addDOMEvent(
                this, document, 'dragover', showDroppableMark);
            helper.addDOMEvent(
                this, document, 'dragleave', cancelDroppableMark);
            helper.addDOMEvent(
                this, this.main, 'dragover', showAcceptingMark);
            helper.addDOMEvent(
                this, this.main, 'dragleave', cancelAcceptingMark);
            helper.addDOMEvent(
                this, this.main, 'drop', uploadDroppedFile);

            this.addState('modern');
        }

        /**
         * 激活扩展
         *
         * @override
         * @public
         */
        ModernUpload.prototype.activate = function () {
            if (helper.isInStage(this.target, 'NEW')
                || helper.isInStage(this.target, 'INITED')
            ) {
                this.target.on('afterrender', enableModernUpload);
            }
            else {
                enableModernUpload.call(this.target);
            }

            Extension.prototype.activate.apply(this, arguments);
        };

        /**
         * 取消激活
         *
         * @override
         * @public
         */
        ModernUpload.prototype.inactivate = function () {
            delete this.target.receiveFile;
            delete this.showUploadResult;
            delete this.showPreview;

            helper.removeDOMEvent(
                this, document, 'dragenter', cancel);
            helper.removeDOMEvent(
                this, document, 'dragover', showDroppableMark);
            helper.removeDOMEvent(
                this, document, 'dragleave', cancelDroppableMark);
            helper.removeDOMEvent(
                this, this.main, 'dragover', showAcceptingMark);
            helper.removeDOMEvent(
                this, this.main, 'dragleave', cancelAcceptingMark);
            helper.removeDOMEvent(
                this, this.main, 'drop', uploadDroppedFile);

            this.target.removeState('modern');

            Extension.prototype.inactivate.apply(this, arguments);
        };

        // 条件相当严格，要有FilAPI + XHR2 + DnD
        var isModernEnough = window.URL
            && typeof URL.createObjectURL === 'function'
            && typeof URL.revokeObjectURL === 'function'
            && window.XMLHttpRequest
            && 'onload' in (new XMLHttpRequest())
            && 'ondragover' in document.body
            && 'ondragenter' in document.body
            && 'ondrop' in document.body;

        // 对于不支持的浏览器，啥也别干
        if (!isModernEnough) {
            ModernUpload.prototype.activate = function () {};
            ModernUpload.prototype.inactivate = function () {};
        }

        lib.inherits(ModernUpload, Extension);
        require('esui').registerExtension(ModernUpload);
        return ModernUpload;
    }
);