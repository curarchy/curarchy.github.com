define(
    function (require) {
        // 通用模板
        require('tpl!common/tpl/list.tpl.html');
        require('tpl!common/tpl/detail.tpl.html');
        require('tpl!common/tpl/form.tpl.html');
        require('tpl!common/tpl/read.tpl.html');
        require('tpl!common/tpl/report.tpl.html');
        
        // 各模块的入口配置
        require('error/config');
        require('channel/config');
        require('channelGroup/config');
        require('slot/config');
        require('manager/config');
        require('tool/schedule/config');
        require('tool/creative/config');
        require('tool/history/config');
        require('company/config');
        require('contact/config');
        require('order/config');
        require('setting/config');
        require('union/config');
        require('common/biz/config');
        require('creative/config');
        require('delivery/config');
        require('report/config');

        // 配置统计
        var track = require('er-track').create();
        if (location.hostname === 'adm.baidu.com') {
            track.use('baidu')
                .config('scriptURL', '/src/common/h.js')
                .setAccount('5e1bc6758a26510366186436cb1e1dd2');
        }
        track.start();

        var events = require('er/events');

        // 定向错误页
        events.on(
            'actionfail',
            function (e) {
                if (!e.isChildAction) {
                    var controller = require('er/controller');
                    controller.renderAction('/400');
                }
            }
        );
        events.on(
            'enteractionfail',
            function (e) {
                if (!e.isChildAction) {
                    var controller = require('er/controller');
                    controller.renderAction('/400');
                }
            }
        );

        // 调试输出
        if (window.DEBUG && window.console) {
            var logLine = function (entries) {
                // IE的`console.log`不是函数，不支持`apply`，且不支持多个参数
                if (typeof console.log === 'function') {
                    console.log.apply(console, entries);
                }
                else {
                    console.log(entries.join(' '));
                }
            };

            var logWithGroup = function (groupName) {
                if (console.groupCollapsed) {
                    console.groupCollapsed(groupName);
                    for (var i = 1; i < arguments.length; i++) {
                        logLine(arguments[i]);
                    }
                    console.groupEnd(groupName);
                }
                else {
                    console.log('➤' + groupName);
                    var prefix = '├───';
                    for (var i = 1; i < arguments.length; i++) {
                        if (i === arguments.length - 1) {
                            prefix = '└───';
                        }
                        var entry = arguments[i];
                        if (typeof entry === 'string') {
                            entry = prefix + entry;
                        }
                        else {
                            entry[0] = prefix + entry[0];
                        }
                        logLine(entry);
                    }
                }
            };

            events.on(
                'enteractioncomplete',
                function (e) {
                    logWithGroup(
                        '亲你正在进入"' + e.url + '"',
                        ['Action：', e.action],
                        ['Model：', e.action.model],
                        ['Model里的数据：', e.action.model.dump()],
                        ['View：', e.action.view],
                        ['DOM容器：', e.action.view.getContainerElement()]
                    );
                }
            );
            events.on(
                'leaveaction',
                function (e) {
                    logWithGroup(
                        '亲你已经离开"' + e.action.context.url + '"',
                        ['当前的Action：', e.action],
                        ['前往的URL：' + e.to.url]
                    );
                }
            );
            require('er/Deferred').on(
                'exception',
                function (e) {
                    var entries = [
                        '我靠，有个Promise出异常了',
                        ['出事的Deferred对象: ', e.deferred],
                        ['出事时给的参数: ', e.args],
                        ['出事的原因大概是: ' + e.reason]
                    ];
                    if (e.reason instanceof Error) {
                        entries.push(
                            '好像是一个异常对象，所以把调用堆栈给你看看好了：\n'
                                + e.reason.stack
                        );
                    }
                    logWithGroup.apply(null, entries);
                }
            );
        }
    }
);
