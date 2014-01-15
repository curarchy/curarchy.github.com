/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 导航栏
 * @author lisijin(ibadplum@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        var permission = require('er/permission');
        var template = require('er/template');
        var Model = require('er/Model');
        var lib = require('esui/lib');
        var u = require('underscore');
        require('tpl!./tpl/navigator.tpl.html');

        var navigator = {};
        navigator.init = function () {
            var authorityObj = {
                hasOrder: permission.isAllow('CLB_ORDER_VIEW'),
                hasAdPosition: permission.isAllow('CLB_ADPOSITION_VIEW'),
                hasTotalReport: permission.isAllow('CLB_REPORT_TOTAL'),
                hasAdpositionReport: 
                    permission.isAllow('CLB_REPORT_ADPOSITION'),
                hasDeliveryReport: permission.isAllow('CLB_REPORT_DELIVERY'),
                hasOrderReport: permission.isAllow('CLB_REPORT_ORDER'),
                hasCreativeReport: permission.isAllow('CLB_REPORT_CREATIVE'),
                hasManager: permission.isAllow('CLB_SUBMANAGER_VIEW'),
                hasPlugin: false // TODO: 暂定，记得改
            };
            var authorityModel = new Model(authorityObj);
            var ele = document.getElementById('nav');
            template.merge(ele, 'navigator', authorityModel);

            var selectedClass = 'nav-selected'; // 选中的class
            var navId = 'nav-main'; // 导航ul的id
            var events = require('er/events');
            // 进入action前刷导航
            events.on(
                'enteraction',
                function (e) {
                    // 子Action不影响导航
                    if (e.isChildAction) {
                        return;
                    }
                    
                    // 通过`getGroup`函数获取action所属导航
                    // 
                    // group包括：
                    // 
                    // - order 订单
                    // - slot 广告位
                    // - report 报告
                    // - setting 设置
                    var group = e.action.getGroup && e.action.getGroup();
                    if (group) {
                        var groupId = 'nav-' + group;
                        var navDom = document.getElementById(navId);
                        var navTab = navDom.getElementsByTagName('li');
                        u.each(
                            navTab,
                            function (tab) {
                                groupId === tab.id
                                    ? lib.addClass(tab, selectedClass)
                                    : lib.removeClass(tab, selectedClass);
                            }
                        );
                    }
                }
            );
        };
        return navigator;
    }
);