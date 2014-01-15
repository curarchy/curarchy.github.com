/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 批量广告位视图类
 * @author wangyaqiong(catkin2009@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var FormView = require('common/FormView');
        var util = require('er/util');

        require('tpl!../channel/tpl/common.tpl.html');
        require('tpl!./tpl/batchForm.tpl.html');

        /**
         * 批量广告位表单视图类
         *
         * @constructor
         * @extends common/FormView
         */
        function BatchSlotFormView() {
            FormView.apply(this, arguments);
        }

        util.inherits(BatchSlotFormView, FormView);

        /** 
         * 使用的模板名称
         *
         * @type {string}
         */
        BatchSlotFormView.prototype.template = 'batchSlotForm';

        BatchSlotFormView.prototype.uiEvents = {
            'uploader:complete': triggerComplete,
            'uploader:receive': triggerReceive,
            'submit:click': triggerSubmit
        };

        function triggerComplete() {
            this.fire('complete');
        }

        function triggerReceive() {
            var uploader = this.get('uploader');
            var fileName = uploader.getFileName();
            var preview = this.get('preview');
            preview.setText(fileName);
        }

        function triggerSubmit() {
            // 提交前校验
            var uploader = this.get('uploader');
            var fileName = uploader.getFileName();
            if (!fileName || fileName === '') {
                uploader.notifyFail('请先上传一个CSV文件');
            }
            else {
                uploader.submit();
            }
        }

        return BatchSlotFormView;
    }
);