/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 频道分组详情页视图
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var ChannelGroupTreeDetailView =
            require('common/biz/ChannelGroupTreeDetailView');
        var util = require('er/util');

        require('tpl!./tpl/detail.tpl.html');

        /**
         * 频道详情页视图
         *
         * @constructor
         * @extends common/biz/ChannelGroupTreeDetailView
         */
        function SlotDetailView() {
            ChannelGroupTreeDetailView.apply(this, arguments);
        }

        util.inherits(SlotDetailView, ChannelGroupTreeDetailView);

        /**
         * 模板名
         *
         * @type {string}
         * @override
         */
        SlotDetailView.prototype.template = 'slotDetail';
        


        /**
         * 控件事件属性
         *
         * @type {Object}
         */
        SlotDetailView.prototype.uiEvents = {
            'get-code:click': getCode
        };

        /**
         * 获取代码
         */
        function getCode(e) {
            var entity = this.model.get('entity');
            var options = {
                url: '/slot/generateCode',
                title: '获取代码',
                width: 880,
                actionOptions: { slots: [entity] }
            };
            this.waitActionDialog(options)
                .then(
                    function (e) {
                        var dialog = e.target;
                        var dialogAction = dialog.get('action');
                        dialogAction.on(
                            'cancel', dialog.dispose, dialog
                        );
                    }
                );
        }

        return SlotDetailView;
    }
);        
