/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 404页Action
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var ErrorAction = require('./Action');
        var ErrorView = require('./View');

        require('tpl!./tpl/notFound.tpl.html');

        /**
         * 404页Action
         *
         * @constructor
         * @extends ErrorAction
         */
        function NotFoundAction() {
            ErrorAction.apply(this, arguments);
        }

        /**
         * 创建视图
         *
         * @return {ErrorView}
         */
        NotFoundAction.prototype.createView = function () {
            var view = new ErrorView();

            view.name = 'not-found';
            view.template = 'notFound';

            return view;
        };

        require('er/util').inherits(NotFoundAction, ErrorAction);
        return NotFoundAction;
    }
);