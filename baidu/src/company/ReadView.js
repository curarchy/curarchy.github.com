/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 公司只读视图类
 * @author lixiang(lixiang05@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var ReadView = require('common/ReadView');
        var util = require('er/util');

        require('tpl!./tpl/read.tpl.html');
        require('tpl!./tpl/common.tpl.html');

        /**
         * 公司表单视图类
         *
         * @constructor
         * @extends common/ReadView
         */
        function CompanyReadView() {
            ReadView.apply(this, arguments);
        }

        util.inherits(CompanyReadView, ReadView);


        /** 
         * 使用的模板名称
         *
         * @type {string}
         */
        CompanyReadView.prototype.template = 'companyRead';
        
        return CompanyReadView;
    }
);
