/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 未知错误页Action
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var ErrorAction = require('./Action');
        var ErrorView = require('./View');

        require('tpl!./tpl/genericError.tpl.html');

        /**
         * 未知错误页Action
         *
         * @constructor
         * @extends ErrorAction
         */
        function GenericErrorAction() {
            ErrorAction.apply(this, arguments);
        }

        /**
         * 创建视图
         *
         * @return {ErrorView}
         */
        GenericErrorAction.prototype.createView = function () {
            var view = new ErrorView();

            view.name = 'generic-error';
            view.template = 'genericError';

            return view;
        };

        require('er/util').inherits(GenericErrorAction, ErrorAction);
        return GenericErrorAction;
    }
);