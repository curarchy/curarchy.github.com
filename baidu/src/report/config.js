/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 报告模块配置
 * @author lixiang(lixiang05@baidu.com)
 * @date $DATE$
 */
define(
    function (require) {
        var u = require('underscore');

        var actions = [
            {
                path: '/report/total',
                type: 'report/total/Date',
                title: '报告 - 整体报告 - 分日报告',
                authority: ['CLB_REPORT_TOTAL']
            },
            {
                path: '/report/total/date',
                type: 'report/total/Date',
                title: '报告 - 整体报告 - 分日报告',
                authority: ['CLB_REPORT_TOTAL']
            },
            {
                path: '/report/total/hour',
                type: 'report/total/Hour',
                title: '报告 - 整体报告 - 时段分布报告',
                authority: ['CLB_REPORT_TOTAL']
            },
            // 广告位报告
            {
                path: '/report/slot',
                type: 'report/slot/General',
                title: '报告 - 广告位报告',
                authority: ['CLB_REPORT_ADPOSITION']
            },
            {
                path: '/report/slot/date',
                type: 'report/slot/Date',
                title: '报告 - 广告位分日报告',
                authority: ['CLB_REPORT_ADPOSITION']
            },
            {
                path: '/report/slot/hour',
                type: 'report/slot/Hour',
                title: '报告 - 广告位分时段报告',
                authority: ['CLB_REPORT_ADPOSITION']
            },
            // 广告报告
            {
                path: '/report/delivery',
                type: 'report/delivery/General',
                title: '报告 - 广告报告',
                authority: ['CLB_REPORT_DELIVERY']
            },
            {
                path: '/report/delivery/date',
                type: 'report/delivery/Date',
                title: '报告 - 广告分日报告',
                authority: ['CLB_REPORT_DELIVERY']
            },
            {
                path: '/report/delivery/hour',
                type: 'report/delivery/Hour',
                title: '报告 - 广告分时段报告',
                authority: ['CLB_REPORT_DELIVERY']
            },
            {
                path: '/report/delivery/creative',
                type: 'report/delivery/Creative',
                title: '报告 - 广告创意报告',
                authority: ['CLB_REPORT_DELIVERY']
            },
            {
                path: '/report/creative',
                type: 'report/creative/General',
                title: '报告 - 创意报告',
                authority: ['CLB_REPORT_CREATIVE']
            },
            {
                path: '/report/creative/date',
                type: 'report/creative/Date',
                title: '报告 - 创意报告',
				authority: ['CLB_REPORT_CREATIVE']
            },
            {
                path: '/report/creative/hour',
                type: 'report/creative/Hour',
                title: '报告 - 创意分时段报告',
                authority: ['CLB_REPORT_CREATIVE']
			},
            // 订单报告
            {
                path: '/report/order',
                type: 'report/order/General',
                title: '报告-订单报告',
                authority: ['CLB_REPORT_ORDER']
            },
            {
                path: '/report/order/date',
                type: 'report/order/Date',
                title: '报告 - 订单分日报告',
                authority: ['CLB_REPORT_ORDER']
            },
            {
                path: '/report/order/hour',
                type: 'report/order/Hour',
                title: '报告 - 订单分时段报告',
                authority: ['CLB_REPORT_ORDER']
            },
            {
                path: '/report/order/delivery',
                type: 'report/order/Delivery',
                title: '报告 - 订单分广告报告',
                authority: ['CLB_REPORT_ORDER']
            }
        ];        

        var controller = require('er/controller');
        u.each(actions, controller.registerAction);
    }
);        
