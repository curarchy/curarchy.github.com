/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 创意库工具模块配置
 * @author exodia(dengxinxin@baidu.com)
 * @date $DATE$
 */
define(
    function () {
        var u = require('underscore');
        var actions = [
            {
                path: '/tool/creative/list',
                type: 'tool/creative/List',
                title: '创意 - 列表'
            },
            {
                path: '/tool/creative/create',
                type: 'tool/creative/Form',
                title: '新建创意',
                args: { formType: 'create' },
                auth: ['CLB_AD_MODIFY']
            },
            {
                path: '/tool/creative/update',
                type: 'tool/creative/Form',
                title: '修改创意',
                args: { formType: 'update' },
                auth: ['CLB_AD_MODIFY']
            },
            {
                path: '/tool/creative/create/text',
                type: 'tool/creative/TextForm',
                documentTitle: '新建文字创意',
                args: { formType: 'create' },
                auth: ['CLB_AD_MODIFY']
            },
            {
                path: '/tool/creative/update/text',
                type: 'tool/creative/TextForm',
                documentTitle: '修改文字创意',
                args: { formType: 'update' }
            },
            {
                path: '/tool/creative/create/image',
                type: 'tool/creative/ImageForm',
                documentTitle: '新建图片创意',
                args: { formType: 'create' },
                auth: ['CLB_AD_MODIFY']
            },
            {
                path: '/tool/creative/update/image',
                type: 'tool/creative/ImageForm',
                documentTitle: '修改图片创意',
                args: { formType: 'update' },
                auth: ['CLB_AD_MODIFY']
            },
            {
                path: '/tool/creative/create/flash',
                type: 'tool/creative/FlashForm',
                documentTitle: '新建Flash创意',
                args: { formType: 'create' },
                auth: ['CLB_AD_MODIFY']
            },
            {
                path: '/tool/creative/update/flash',
                type: 'tool/creative/FlashForm',
                documentTitle: '修改Flash创意',
                args: { formType: 'update' },
                auth: ['CLB_AD_MODIFY']
            },
            {
                path: '/tool/creative/create/rich',
                type: 'tool/creative/RichForm',
                documentTitle: '新建富媒体创意',
                args: { formType: 'create' },
                auth: ['CLB_AD_MODIFY']
            },
            {
                path: '/tool/creative/update/rich',
                type: 'tool/creative/RichForm',
                documentTitle: '修改富媒体创意',
                args: { formType: 'update' },
                auth: ['CLB_AD_MODIFY']
            },
            {
                path: '/tool/creative/create/nova',
                type: 'tool/creative/NovaForm',
                documentTitle: '新建网盟创意',
                args: { formType: 'create' },
                auth: ['CLB_AD_MODIFY']
            },
            {
                path: '/tool/creative/update/nova',
                type: 'tool/creative/NovaForm',
                documentTitle: '修改网盟创意',
                args: { formType: 'update' },
                auth: ['CLB_AD_MODIFY']
            },
            {
                path: '/tool/creative/file',
                type: 'tool/creative/FileField',
                isChildOnly: !!window.DEBUG
            },
            {
                path: '/tool/creative/xmlExt',
                type: 'tool/creative/XMLExtField'
            }
        ];
        var controller = require('er/controller');
        u.each(actions, controller.registerAction);


        var controls = {
            FrameTable: 'tool/creative/ui',
            CreativePreviewPanel: 'tool/creative/ui',
            TextStyle: 'tool/creative/ui',
            CreativeThumbnail: 'tool/creative/ui'
        };
        var tpl = require('tpl');
        u.each(controls, tpl.registerControl);

        return {
            name: 'creative',
            description: '创意'
        };
    }
);        
