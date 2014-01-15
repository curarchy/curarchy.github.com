/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 对框架各类的扩展
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        require('./extension/underscore');
        require('./extension/ajax');
        require('./extension/mvc');
        require('./extension/ui');

        // 遮罩层应用
        var mask = require('./mask');
        var locator = require('er/locator');
        var events = require('er/events');
        locator.on('redirect', mask.show);
        events.on('enteractioncomplete', mask.hide);
        events.on('enteractionfail', mask.hide);

        // 打印错误
        if (window.DEBUG && window.console) {
            events.on(
                'error', 
                function (e) {
                    var error = e.error;
                    var message = '';

                    if (!error) {
                        message = 'Invoke action.enter() causes error';
                    }
                    // 普通异常
                    else if (error.message) {
                        message = error.message;
                        if (error.stack) {
                            message += '\n' + error.stack;
                        }
                        else {
                            message += '\nStackTrace is not supported';
                        }
                    }
                    // 能够序列化
                    else if (window.JSON 
                        && typeof JSON.stringify === 'function'
                    ) {
                        message = JSON.stringify(error, null, '    ');
                    }
                    else {
                        message = error;
                    }

                    console.error(message);
                }
            );
        }
    }
);