/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file CSVUploader控件
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var ui = require('esui/main');
        var lib = require('esui/lib');
        var ValidityLabel = require('esui/Validity');
        var Uploader = require('ui/Uploader');

        /**
         * Uploader控件
         *
         * @param {Object=} options 初始化参数
         * @extends InputControl
         * @constructor
         * @public
         */
        function CSVUploader(options) {
            Uploader.apply(this, arguments);
        }

        CSVUploader.prototype.type = 'CSVUploader';
        CSVUploader.prototype.styleType = 'Uploader';

        /**
         * 错误表格字段配置
         *
         * @type {Object}
         * @public
         */
        CSVUploader.errorTableFields = [
            {
                title: '行数',
                field: 'line',
                width: 140,
                sortable: false,
                resizable: false,
                content: 'line'
            },
            {
                title: '问题',
                field: 'field',
                width: 140,
                sortable: false,
                resizable: false,
                content: 'field'
            },
            {
                title: '描述',
                field: 'message',
                width: 500,
                sortable: false,
                resizable: false,
                content: 'message'
            }
        ];

        /**
         * 默认属性
         *
         * @type {Object}
         * @public
         */
        CSVUploader.defaultProperties = {
            width: 100,
            fileType: 'csv',
            text: '选择CSV文件',
            errorText: '您上传的CSV文件中有如下问题，请修改后重新上传',
            preview: false,
            autoUpload: false
        };

        /**
         * 初始化参数
         *
         * @param {Object} options 上传结果
         * @protected
         */
        CSVUploader.prototype.initOptions = function (options) {
            var properties = {};
            lib.extend(properties, CSVUploader.defaultProperties, options);
            Uploader.prototype.initOptions.call(this, properties);
        };

        /**
         * 显示上传结果
         *
         * @param {Object} options 上传结果
         * @protected
         */
        CSVUploader.prototype.showUploadResult = function (options) {
            // CSV上传失败后，有一种情况是部分错误，`options`格式为：
            // {
            //     errors:
            //         [
            //             {
            //                 line: 1,
            //                 fields: [
            //                     {
            //                         field: "displayOrder",
            //                         message: "XXXX错误"
            //                     }
            //                 ]
            //             }
            //         ]
            // }
            if (options.errors) {
                this.fire('fail', { errors: options.errors });
                this.notifyFail(this.errorText);
                this.showErrors(options.errors);
            }
            // 其余逻辑跟父类相同
            Uploader.prototype.showUploadResult.call(this, options);
        };

        /**
         * 通知上传失败
         *
         * @param {string} message 失败消息
         * @override
         */
        CSVUploader.prototype.notifyFail = function (message) {
            // 创建一个承载错误信息的label
            if (!this.validityLabel) {
                buildValidityLabel(this);
            }
            // 展示部分错误的table要dispose掉
            var errorTable = this.getChild('errorTable');
            if (errorTable) {
                errorTable.hide();
            }
            // 其余逻辑跟父类相同
            Uploader.prototype.notifyFail.call(this, message);
        };

        /**
         * 创建失败信息展示Label
         *
         * @param {ui.CSVUploader} uploader 控件实例
         * @inner
         */
        function buildValidityLabel(uploader) {
            var errorLabel = lib.g(uploader.errorLabelContainer);
            if (errorLabel) {
                var options = {
                    id: uploader.id + '-validity',
                    skin: 'warn',
                    viewContext: uploader.viewContext
                };

                var label = new ValidityLabel(options);
                label.appendTo(errorLabel);
                uploader.validityLabel = label.id;
            }

        }

        /**
         * 显示错误
         *
         * @param {Object} errors 错误信息
         * @protected
         */
        CSVUploader.prototype.showErrors = function (errors) {
            if (this.errorTableContainer) {
                var errorTableContainer = lib.g(this.errorTableContainer);
                var errorTable = this.getChild('errorTable');
                if (!errorTable) {
                    errorTable = ui.create(
                        'Table',
                        {
                            childName: 'errorTable',
                            fields: CSVUploader.errorTableFields,
                            select: false,
                            skin: 'error',
                            width: 785,
                            datasource: errors
                        }
                    );
                    errorTable.appendTo(errorTableContainer);
                    this.addChild(errorTable);
                }

                errorTable.set('datasource', errors);
                errorTable.show();          

            }
        };

        CSVUploader.prototype.dispose = function () {
            var errorTable = this.getChild('errorTable');
            if (errorTable) {
                errorTable.dispose();
            }
            Uploader.prototype.dispose.apply(this, arguments);
        };

        lib.inherits(CSVUploader, Uploader);
        require('esui').register(CSVUploader);
        return CSVUploader;
    }
);
