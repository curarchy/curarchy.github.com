/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 用户激活 / 修改邮箱等跳转后的信息展示页面
 * @author maoquan(maoquan@baidu.com)
 * @date $DATE$
 */

define(
    function(require) {
        // 首页跳转地址
        var INDEX_URL = '/static/index.html';

        var util = require('er/util');
        var staticUtil = require('./static');

        // 0: 用户激活
        // 1：修改邮箱
        var messageInfo = [
            [
                // 0: 激活成功
                // 1：链接已经过期
                // 2: 激活链接非法
                // 3：已经修改了邮箱但是使用了老链接来激活
                // 4：链接已经被激活
                // 5：邮箱已经被他人使用
                {
                    title: '恭喜您，注册成功',
                    content: '您可以使用“<span>${userName}</span>”'
                        + '或“<span>${email}</span>”登录百度广告管家',
                    footer: '<a class="message-button" href="' 
                        + INDEX_URL + '?ln=${userName}">'
                        + '立即登录</a>'
                },
                {
                    title: '对不起，激活链接已过期。',
                    content: '您可以登录系统重新发送激活邮件',
                    footer: '<a class="message-button" href="' 
                        + INDEX_URL + '?ln=${userName}">'
                        + '立即登录</a>'
                },
                {
                    title: '',
                    content: '该激活链接不正确，请重新注册尝试'
                },
                {
                    title: '对不起，激活链接已失效。',
                    content: '您已经修改了邮箱，原邮箱收到的激活邮件失效。'
                },
                {
                    title: '对不起，激活链接已失效。',
                    content: '您已经成功激活了账号，无需再次激活。'
                },
                {
                    title: '对不起，激活失败。',
                    content: '该邮箱已经和其他邮箱绑定，无法使用该邮箱激活账号，'
                        + '您可以登录系统更改邮箱后再进行激活',
                    footer: '<a class="message-button" href="' 
                        + INDEX_URL + '?ln=${userName}">'
                        + '立即登录</a>'
                }
            ],
            [
                {
                    content: '恭喜您，邮箱修改成功。重新登录后您将查看到新的邮箱。',
                    footer: '<a class="message-button" href="/?ln=${userName}">'
                        + '返回首页</a>'
                },
                {
                    content: '对不起，您访问的链接不存在。'
                },
                {
                    content: '温馨提示，该链接已失效。'
                },
                {
                    content: '温馨提示，邮箱验证链接已过期。'
                },
                {
                    content: '验证失败，该邮箱已经与其他账号建立绑定关系，'
                        + '请重新修改邮箱'
                }
            ]
        ];

        // 信息类别，如账户激活，修改邮箱激活等
        var parentType = staticUtil.getQueryValue('p');
        // 子类别，如成功 / 失败等
        var type = staticUtil.getQueryValue('type');

        if (undefined === parentType || !messageInfo[parentType] 
            || undefined === type || !messageInfo[parentType][type]) {
            staticUtil.showMessage(
                {
                    content: '参数错误!'
                }
            );
        }

        var data = messageInfo[parentType][type];
        var json = staticUtil.queryToJson();

        staticUtil.showMessage(
            {
                title: template(data.title, json),
                content: template(data.content, json),
                footer: template(data.footer, json),
                success: type === '0' // 默认都是0为成功
            }
        );

        function template(html, data) {
            if (!html) {
                return '';
            }
            return html.replace(
                /\$\{(.+?)\}/g,
                function(placeHolder, variable) {
                    return data[variable] 
                        ? util.encodeHTML(data[variable]) 
                        : '';
                }
            );
        }
    }
);
